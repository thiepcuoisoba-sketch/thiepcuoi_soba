'use strict';
/**
 * Giữ ảnh/nhạc khách tải lên luôn còn, kể cả khi Hostinger deploy lại:
 *  1. Ổ đĩa: UPLOAD_DIR cố định ngoài thư mục deploy (xem config.uploadInsideCode).
 *  2. Bản sao trong database (bảng upload_blobs): mỗi tệp tải lên được chép vào DB.
 *     Khi tệp trên đĩa mất, /uploads tự lấy lại từ DB và ghi lại xuống đĩa (tự phục hồi).
 *  3. Cứu ảnh từ các thư mục deploy cũ của Hostinger (hbuilds/versions/<mã>/…/uploads).
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const db = require('../db');

// Đường dẫn tương đối hợp lệ: 202611/abc-xyz.jpg
const REL_RE = /^[0-9]{6}\/[A-Za-z0-9._-]+$/;
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac' };
const MAX_DB_BYTES = 12 * 1024 * 1024;

const absOf = (rel) => path.join(config.uploadDir, rel);
const mimeOf = (rel) => MIME[path.extname(rel).toLowerCase()] || 'application/octet-stream';

/** Chép một tệp đã lưu trên đĩa vào DB (bỏ qua nếu đã có). Không bao giờ ném lỗi. */
async function mirror(rel, absPath = absOf(rel)) {
  if (!REL_RE.test(rel)) return false;
  try {
    if (await db.get('SELECT id FROM upload_blobs WHERE file = ?', [rel])) return true;
    const data = fs.readFileSync(absPath);
    if (!data.length || data.length > MAX_DB_BYTES) return false;
    await db.run('INSERT INTO upload_blobs (file, mime, size, data, created_at) VALUES (?, ?, ?, ?, ?)', [rel, mimeOf(rel), data.length, data, Date.now()]);
    return true;
  } catch (e) {
    console.error(`[SOBA] Không sao lưu được ${rel} vào DB: ${e.message}`);
    return false;
  }
}

/** Lấy tệp từ DB và ghi lại xuống đĩa. Trả về true nếu khôi phục được. */
async function restore(rel) {
  if (!REL_RE.test(rel)) return false;
  try {
    const row = await db.get('SELECT data FROM upload_blobs WHERE file = ?', [rel]);
    if (!row || !row.data) return false;
    const file = absOf(rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(row.data));
    return true;
  } catch (e) {
    console.error(`[SOBA] Không khôi phục được ${rel} từ DB: ${e.message}`);
    return false;
  }
}

/** Middleware đặt trước express.static('/uploads'): tệp mất trên đĩa → lấy lại từ DB */
function selfHeal(req, res, next) {
  const rel = decodeURIComponent(req.path.replace(/^\/+/, ''));
  if (!REL_RE.test(rel) || fs.existsSync(absOf(rel))) return next();
  restore(rel).then((ok) => {
    if (ok) console.log(`[SOBA] Đã tự khôi phục ảnh ${rel} từ DB`);
    next();
  });
}

/** Mọi tệp /uploads/... mà các thiệp đang dùng */
async function referencedFiles() {
  const rows = await db.all('SELECT data FROM cards');
  const set = new Set();
  for (const r of rows) for (const u of String(r.data || '').match(/\/uploads\/[\w./-]+/g) || []) set.add(u.slice('/uploads/'.length));
  return set;
}

/** Thư mục uploads của các bản deploy cũ trên Hostinger (…/hbuilds/versions/<mã>/[…/]uploads) */
function oldDeployDirs() {
  const parts = config.root.split(path.sep);
  const i = parts.lastIndexOf('hbuilds');
  if (i < 0) return [];
  const versions = path.join(parts.slice(0, i + 1).join(path.sep) || path.sep, 'versions');
  const dirs = [];
  let ids = [];
  try { ids = fs.readdirSync(versions); } catch { return []; }
  for (const id of ids) {
    const base = path.join(versions, id);
    const cands = [path.join(base, 'uploads')];
    try {
      for (const sub of fs.readdirSync(base, { withFileTypes: true })) if (sub.isDirectory()) cands.push(path.join(base, sub.name, 'uploads'));
    } catch { /* bỏ qua */ }
    for (const c of cands) if (path.resolve(c) !== path.resolve(config.uploadDir) && fs.existsSync(c)) dirs.push(c);
  }
  return dirs;
}

/**
 * Bảo trì: (1) cứu tệp thiệp đang dùng mà bị mất – lấy từ DB hoặc thư mục deploy cũ;
 * (2) chép vào DB mọi tệp trên đĩa chưa có bản sao.
 */
let lastReport = null;
async function maintain() {
  const report = { at: Date.now(), missingBefore: 0, fromDb: 0, fromOld: 0, stillMissing: [], mirrored: 0, oldDirs: 0 };
  try {
    const refs = await referencedFiles();
    const olds = oldDeployDirs();
    report.oldDirs = olds.length;
    for (const rel of refs) {
      if (!REL_RE.test(rel) || fs.existsSync(absOf(rel))) continue;
      report.missingBefore++;
      if (await restore(rel)) { report.fromDb++; continue; }
      const src = olds.map((d) => path.join(d, rel)).find((f) => fs.existsSync(f));
      if (src) {
        fs.mkdirSync(path.dirname(absOf(rel)), { recursive: true });
        fs.copyFileSync(src, absOf(rel));
        report.fromOld++;
        continue;
      }
      report.stillMissing.push(rel);
    }
    // Sao lưu vào DB mọi tệp đang có trên đĩa
    let subs = [];
    try { subs = fs.readdirSync(config.uploadDir, { withFileTypes: true }).filter((d) => d.isDirectory()); } catch { /* chưa có */ }
    for (const s of subs) {
      for (const f of fs.readdirSync(path.join(config.uploadDir, s.name))) {
        const rel = `${s.name}/${f}`;
        if (REL_RE.test(rel) && !(await db.get('SELECT id FROM upload_blobs WHERE file = ?', [rel])) && (await mirror(rel))) report.mirrored++;
      }
    }
  } catch (e) {
    report.error = e.message;
    console.error('[SOBA] Lỗi bảo trì ảnh:', e.message);
  }
  lastReport = report;
  console.log(`[SOBA] Bảo trì ảnh: mất ${report.missingBefore}, lấy lại từ DB ${report.fromDb}, từ bản deploy cũ ${report.fromOld} (${report.oldDirs} thư mục), còn thiếu ${report.stillMissing.length}, sao lưu thêm vào DB ${report.mirrored}`);
  return report;
}

/** Xoá tệp chỉ khi không còn thiệp nào dùng (thiệp nhân bản dùng chung ảnh) */
async function removeIfUnused(rel) {
  if (!REL_RE.test(rel)) return;
  const used = await db.get('SELECT id FROM cards WHERE data LIKE ? LIMIT 1', [`%/uploads/${rel}%`]);
  if (used) return;
  fs.unlink(absOf(rel), () => {});
  await db.run('DELETE FROM upload_blobs WHERE file = ?', [rel]).catch(() => {});
}

/**
 * Nhập lại ảnh/nhạc (từ bản sao lưu) giữ NGUYÊN tên tệp → thiệp đang trỏ tới /uploads/<tháng>/<tên> hiện lại ngay.
 * items: [{ name: 'mwno0y2a-xxx.jpg' hoặc '202611/mwno0y2a-xxx.jpg', data: Buffer }]
 * Thư mục tháng lấy theo đường dẫn trong tên, hoặc theo thiệp đang dùng tệp, hoặc theo thời điểm mã hoá trong tên.
 */
async function importFiles(items) {
  const refs = await referencedFiles();
  const byBase = new Map([...refs].map((r) => [path.basename(r), r]));
  const report = { total: items.length, imported: 0, skipped: [], usedByCards: 0 };
  for (const it of items) {
    const base = path.basename(String(it.name || '').replace(/\\/g, '/'));
    let rel = null;
    const m = String(it.name || '').replace(/\\/g, '/').match(/([0-9]{6})\/([A-Za-z0-9._-]+)$/);
    if (m) rel = `${m[1]}/${m[2]}`;
    else if (byBase.has(base)) rel = byBase.get(base);
    else {
      const t = parseInt(base.split('-')[0], 36);
      if (t > 1.6e12 && t < 4e12) {
        const d = new Date(t);
        rel = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}/${base}`;
      }
    }
    if (!rel || !REL_RE.test(rel) || !MIME[path.extname(rel).toLowerCase()] || !it.data || !it.data.length) {
      report.skipped.push(base || '(không tên)');
      continue;
    }
    const file = absOf(rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, it.data);
    await db.run('DELETE FROM upload_blobs WHERE file = ?', [rel]).catch(() => {});
    await mirror(rel, file);
    report.imported++;
    if (refs.has(rel)) report.usedByCards++;
  }
  return report;
}

/** Đọc tệp .tar (ustar) thành danh sách { name, data } */
function readTar(buf) {
  const out = [];
  let o = 0;
  while (o + 512 <= buf.length) {
    const h = buf.subarray(o, o + 512);
    if (h.every((b) => b === 0)) break;
    const str = (a, b) => h.subarray(a, b).toString('utf8').replace(/\0.*$/s, '');
    const prefix = str(345, 500);
    const name = (prefix ? prefix + '/' : '') + str(0, 100);
    const size = parseInt(str(124, 136).trim() || '0', 8) || 0;
    const type = str(156, 157);
    o += 512;
    if (type === '0' || type === '' ) out.push({ name, data: buf.subarray(o, o + size) });
    o += Math.ceil(size / 512) * 512;
  }
  return out;
}

/** Tệp còn dùng được: có trên đĩa hoặc có bản sao trong DB */
async function exists(rel) {
  if (!REL_RE.test(rel)) return false;
  if (fs.existsSync(absOf(rel))) return true;
  try { return Boolean(await db.get('SELECT id FROM upload_blobs WHERE file = ?', [rel])); } catch { return false; }
}

async function counts() {
  try {
    const r = await db.get('SELECT COUNT(*) AS n, COALESCE(SUM(size),0) AS bytes FROM upload_blobs');
    return { n: Number(r.n || 0), bytes: Number(r.bytes || 0) };
  } catch { return { n: 0, bytes: 0 }; }
}

module.exports = { mirror, restore, selfHeal, maintain, removeIfUnused, counts, exists, importFiles, readTar, referencedFiles, getLastReport: () => lastReport, REL_RE };
