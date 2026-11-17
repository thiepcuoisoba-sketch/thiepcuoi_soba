#!/usr/bin/env node
'use strict';
/**
 * Nén một bộ ảnh mẫu thiệp → public/img/mau/aN/01.jpg, 02.jpg… (≤1400px, JPEG q80)
 * và tạo ảnh tổng hợp có đánh số để chọn ảnh bìa / ảnh từng trang.
 *
 * `sharp` KHÔNG nằm trong dependencies của dự án (để server production nhẹ).
 * Cài tạm ở thư mục khác rồi trỏ NODE_PATH, ví dụ:
 *   mkdir ../tools && cd ../tools && npm init -y && npm i sharp
 *   cd ../soba && NODE_PATH=../tools/node_modules node scripts/nen-anh-mau.js ../anh_thiep_mau 32 35
 *
 * Tham số: <thư mục nguồn chứa aN> <số đầu> [số cuối]
 * Thứ tự ảnh = thứ tự tên tệp gốc (so sánh số tự nhiên). Ảnh tổng hợp lưu ở data/anh-tong-hop/aN.jpg (không vào git).
 */
const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('Thiếu thư viện sharp – xem hướng dẫn ở đầu file.');
  process.exit(1);
}
const SRC = process.argv[2];
const FROM = Number(process.argv[3]);
const TO = Number(process.argv[4] || FROM);
if (!SRC || !FROM) {
  console.error('Cách dùng: node scripts/nen-anh-mau.js <thư mục nguồn> <số đầu> [số cuối]');
  process.exit(1);
}
const DST = path.join(__dirname, '..', 'public', 'img', 'mau');
const SHEETS = path.join(__dirname, '..', 'data', 'anh-tong-hop');
fs.mkdirSync(SHEETS, { recursive: true });

(async () => {
  for (let n = FROM; n <= TO; n++) {
    const dir = path.join(SRC, 'a' + n);
    if (!fs.existsSync(dir)) {
      console.log('Bỏ qua a' + n + ' (không có thư mục)');
      continue;
    }
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    const out = path.join(DST, 'a' + n);
    fs.mkdirSync(out, { recursive: true });
    const tiles = [];
    let i = 0;
    for (const f of files) {
      i++;
      const name = String(i).padStart(2, '0') + '.jpg';
      await sharp(path.join(dir, f)).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(out, name));
      const t = await sharp(path.join(out, name)).resize(200, 260, { fit: 'cover', position: 'attention' }).toBuffer();
      const label = Buffer.from(`<svg width="200" height="260"><rect width="44" height="30" fill="#000"/><text x="6" y="22" font-size="20" fill="#fff" font-family="Arial">${i}</text></svg>`);
      tiles.push(await sharp(t).composite([{ input: label, top: 0, left: 0 }]).jpeg().toBuffer());
    }
    if (!tiles.length) continue;
    const cols = 6;
    const rows = Math.ceil(tiles.length / cols);
    await sharp({ create: { width: cols * 204, height: rows * 264, channels: 3, background: '#ffffff' } })
      .composite(tiles.map((b, k) => ({ input: b, left: (k % cols) * 204 + 2, top: Math.floor(k / cols) * 264 + 2 })))
      .jpeg({ quality: 70 })
      .toFile(path.join(SHEETS, 'a' + n + '.jpg'));
    console.log('a' + n + ': ' + files.length + ' ảnh');
  }
})();
