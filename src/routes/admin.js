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

/** Kiểm tra thư mục ảnh: đường dẫn, ghi được không, ảnh thiệp nào đang bị mất file */
async function storageStatus() {
  const dir = config.uploadDir;
  let writable = false;
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    writable = true;
  } catch { /* không ghi được */ }
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
  return { dir, writable, insideCode: config.uploadInsideCode, referenced, missing };
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
