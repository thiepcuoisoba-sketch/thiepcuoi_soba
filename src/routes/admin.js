'use strict';
const fs = require('fs');
const path = require('path');
const express = require('express');
const config = require('../config');
const db = require('../db');
const { requireAdmin } = require('../middleware');
const { PLANS, MONTH } = require('../services/plans');
const { markPaid } = require('../services/orders');
const { vnd, formatDateTime, clean } = require('../services/util');
const { getTemplate } = require('../services/templates');

const router = express.Router();
router.use(requireAdmin);

const render = (res, view, extra) => res.render(`admin/${view}`, { layout: 'layouts/app', vnd, formatDateTime, PLANS, ...extra });

router.get('/', async (req, res) => {
  const n = async (sql, p = []) => Number(((await db.get(sql, p)) || {}).n || 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const stats = {
    users: await n('SELECT COUNT(*) AS n FROM users'),
    paidUsers: await n("SELECT COUNT(*) AS n FROM users WHERE plan <> 'free' AND plan_expires_at > ?", [Date.now()]),
    cards: await n('SELECT COUNT(*) AS n FROM cards'),
    published: await n("SELECT COUNT(*) AS n FROM cards WHERE status = 'published'"),
    revenue: await n("SELECT COALESCE(SUM(amount),0) AS n FROM orders WHERE status = 'paid'"),
    revenueMonth: await n("SELECT COALESCE(SUM(amount),0) AS n FROM orders WHERE status = 'paid' AND paid_at >= ?", [monthStart.getTime()]),
    pending: await n("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'"),
    contacts: await n('SELECT COUNT(*) AS n FROM contacts'),
  };
  const storage = await storageStatus();
  const recentOrders = await db.all('SELECT o.*, u.email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC LIMIT 8');
  const recentUsers = await db.all('SELECT id, email, name, plan, created_at FROM users ORDER BY id DESC LIMIT 8');
  render(res, 'index', { meta: { title: 'Quản trị – SOBA' }, stats, storage, recentOrders, recentUsers, section: 'overview' });
});

/**
 * Tải toàn bộ ảnh/nhạc khách đã tải lên thành một tệp .tar (bản sao lưu ngoài máy chủ).
 * Tự ghi định dạng tar (ustar) để không thêm thư viện.
 */
router.get('/sao-luu-anh', async (req, res) => {
  const root = config.uploadDir;
  const files = [];
  const walk = (dir, rel) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const abs = path.join(dir, e.name);
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(abs, r);
      else if (e.isFile() && !e.name.startsWith('.')) files.push({ abs, rel: r });
    }
  };
  walk(root, '');
  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/x-tar');
  res.setHeader('Content-Disposition', `attachment; filename="soba-anh-${stamp}.tar"`);
  const header = (name, size, mtime) => {
    const h = Buffer.alloc(512);
    h.write(name.slice(0, 99), 0, 'utf8');
    h.write('0000644\0', 100);
    h.write('0000000\0', 108);
    h.write('0000000\0', 116);
    h.write(size.toString(8).padStart(11, '0') + '\0', 124);
    h.write(Math.floor(mtime / 1000).toString(8).padStart(11, '0') + '\0', 136);
    h.write('        ', 148);
    h.write('0', 156);
    h.write('ustar\0', 257);
    h.write('00', 263);
    let sum = 0;
    for (const b of h) sum += b;
    h.write(sum.toString(8).padStart(6, '0') + '\0 ', 148);
    return h;
  };
  const write = (buf) => new Promise((ok) => (res.write(buf) ? ok() : res.once('drain', ok)));
  for (const f of files) {
    let data;
    let st;
    try { data = fs.readFileSync(f.abs); st = fs.statSync(f.abs); } catch { continue; }
    await write(header(f.rel, data.length, st.mtimeMs));
    await write(data);
    const pad = (512 - (data.length % 512)) % 512;
    if (pad) await write(Buffer.alloc(pad));
  }
  res.end(Buffer.alloc(1024));
});

/** Kiểm tra thư mục ảnh: đường dẫn, ghi được không, ảnh thiệp nào đang bị mất file */
async function storageStatus() {
  const dir = config.uploadDir;
  let writable = false;
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    writable = true;
  } catch { /* không ghi được */ }
  // File đánh dấu: ngày tạo cũ hơn lần deploy gần nhất ⇒ thư mục ảnh được giữ nguyên qua deploy
  let since = null;
  const marker = path.join(dir, '.soba-storage');
  try {
    if (!fs.existsSync(marker) && writable) fs.writeFileSync(marker, String(Date.now()));
    since = Number(fs.readFileSync(marker, 'utf8')) || null;
  } catch { /* bỏ qua */ }
  const startedAt = Date.now() - Math.round(process.uptime() * 1000);
  const missing = [];
  let referenced = 0;
  const rows = await db.all('SELECT id, slug, data FROM cards');
  for (const r of rows) {
    const files = new Set(String(r.data || '').match(/\/uploads\/[\w./-]+/g) || []);
    let lost = 0;
    for (const u of files) {
      referenced++;
      const file = path.join(dir, u.slice('/uploads/'.length));
      if (!file.startsWith(dir) || !fs.existsSync(file)) lost++;
    }
    if (lost) missing.push({ id: r.id, slug: r.slug, lost, total: files.size });
  }
  const blocked = config.isProd && config.uploadInsideCode;
  return { dir, writable, insideCode: config.uploadInsideCode, blocked, referenced, missing, since, startedAt };
}

router.get('/nguoi-dung', async (req, res) => {
  const q = clean(req.query.q, 100);
  const users = q
    ? await db.all('SELECT * FROM users WHERE email LIKE ? OR name LIKE ? ORDER BY id DESC LIMIT 100', [`%${q}%`, `%${q}%`])
    : await db.all('SELECT * FROM users ORDER BY id DESC LIMIT 100');
  render(res, 'users', { meta: { title: 'Người dùng – Quản trị SOBA' }, users, q, section: 'users' });
});

router.post('/nguoi-dung/:id', async (req, res) => {
  const id = Number(req.params.id) || 0;
  const plan = PLANS[req.body.plan] ? req.body.plan : null;
  if (plan) {
    const months = Math.min(Math.max(parseInt(req.body.months, 10) || 12, 1), 120);
    await db.run('UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?', [plan, plan === 'free' ? null : Date.now() + months * MONTH, id]);
  }
  if (['user', 'admin'].includes(req.body.role) && id !== req.user.id) await db.run('UPDATE users SET role = ? WHERE id = ?', [req.body.role, id]);
  req.flash('success', 'Đã cập nhật người dùng.');
  res.redirect('/quan-tri/nguoi-dung');
});

router.get('/don-hang', async (req, res) => {
  const status = ['pending', 'paid'].includes(req.query.status) ? req.query.status : '';
  const orders = await db.all(
    `SELECT o.*, u.email, u.name FROM orders o JOIN users u ON u.id = o.user_id ${status ? 'WHERE o.status = ?' : ''} ORDER BY o.id DESC LIMIT 200`,
    status ? [status] : []
  );
  const logs = await db.all('SELECT * FROM payment_logs ORDER BY id DESC LIMIT 20');
  render(res, 'orders', { meta: { title: 'Đơn hàng – Quản trị SOBA' }, orders, logs, status, section: 'orders' });
});

router.post('/don-hang/:id/xac-nhan', async (req, res) => {
  const order = await db.get('SELECT * FROM orders WHERE id = ?', [Number(req.params.id) || 0]);
  if (order) await markPaid(order, `manual-by-${req.user.id}`);
  req.flash('success', `Đã xác nhận thanh toán đơn ${order ? order.code : ''}.`);
  res.redirect('/quan-tri/don-hang');
});

router.post('/don-hang/:id/huy', async (req, res) => {
  await db.run("UPDATE orders SET status = 'cancelled' WHERE id = ? AND status = 'pending'", [Number(req.params.id) || 0]);
  res.redirect('/quan-tri/don-hang');
});

router.get('/thiep', async (req, res) => {
  const list = await db.all('SELECT c.id, c.slug, c.title, c.template, c.status, c.views, c.is_showcase, c.updated_at, u.email FROM cards c JOIN users u ON u.id = c.user_id ORDER BY c.id DESC LIMIT 200');
  render(res, 'cards', { meta: { title: 'Thiệp – Quản trị SOBA' }, cards: list.map((c) => ({ ...c, tpl: getTemplate(c.template) })), section: 'cards' });
});

router.post('/thiep/:id/noi-bat', async (req, res) => {
  await db.run('UPDATE cards SET is_showcase = 1 - is_showcase WHERE id = ?', [Number(req.params.id) || 0]);
  res.redirect('/quan-tri/thiep');
});

router.get('/lien-he', async (req, res) => {
  const contacts = await db.all('SELECT * FROM contacts ORDER BY id DESC LIMIT 200');
  render(res, 'contacts', { meta: { title: 'Liên hệ – Quản trị SOBA' }, contacts, section: 'contacts' });
});

module.exports = router;
