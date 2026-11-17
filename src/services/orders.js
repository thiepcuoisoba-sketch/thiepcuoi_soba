'use strict';
const db = require('../db');
const config = require('../config');
const { PLANS, MONTH, effectivePlanKey, TIER_ORDER } = require('./plans');
const { randomCode } = require('./util');
const { vietQrUrl } = require('./banks');

const CODE_PREFIX = 'SOBA';
const CODE_RE = /SOBA([A-Z0-9]{6})/i;

async function createOrGetPendingOrder(user, planKey) {
  const plan = PLANS[planKey];
  if (!plan || !plan.price) throw Object.assign(new Error('Gói không hợp lệ.'), { status: 400 });
  const since = Date.now() - 24 * 3600 * 1000;
  const existing = await db.get(
    "SELECT * FROM orders WHERE user_id = ? AND plan = ? AND status = 'pending' AND amount = ? AND created_at > ? ORDER BY id DESC",
    [user.id, planKey, plan.price, since]
  );
  if (existing) return existing;
  let code;
  for (let i = 0; i < 5; i++) {
    code = CODE_PREFIX + randomCode(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
    if (!(await db.get('SELECT id FROM orders WHERE code = ?', [code]))) break;
  }
  const res = await db.run('INSERT INTO orders (code, user_id, plan, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    code,
    user.id,
    planKey,
    plan.price,
    'pending',
    Date.now(),
  ]);
  return db.get('SELECT * FROM orders WHERE id = ?', [res.insertId]);
}

function paymentQr(order) {
  return vietQrUrl({
    bank: config.bank.id,
    accountNo: config.bank.accountNo,
    accountName: config.bank.accountName,
    amount: order.amount,
    note: order.code,
    template: 'compact2',
  });
}

/** Đánh dấu đã thanh toán + kích hoạt / gia hạn gói (idempotent) */
async function markPaid(order, ref = '') {
  if (order.status === 'paid') return false;
  const res = await db.run("UPDATE orders SET status = 'paid', paid_at = ?, transaction_ref = ? WHERE id = ? AND status <> 'paid'", [
    Date.now(),
    String(ref).slice(0, 100),
    order.id,
  ]);
  if (!res.changes) return false;
  const user = await db.get('SELECT * FROM users WHERE id = ?', [order.user_id]);
  const plan = PLANS[order.plan];
  const current = effectivePlanKey(user);
  let base = Date.now();
  let newPlan = order.plan;
  if (current !== 'free' && user.plan_expires_at && Number(user.plan_expires_at) > Date.now()) {
    if (current === order.plan) base = Number(user.plan_expires_at); // gia hạn cùng gói
    else if (TIER_ORDER.indexOf(current) > TIER_ORDER.indexOf(order.plan)) {
      newPlan = current; // đã có gói cao hơn: cộng thời gian
      base = Number(user.plan_expires_at);
    }
  }
  const expires = base + plan.durationMonths * MONTH;
  await db.run('UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?', [newPlan, expires, user.id]);
  return true;
}

function extractCode(content = '') {
  const m = String(content).replace(/\s+/g, '').match(CODE_RE);
  return m ? (CODE_PREFIX + m[1]).toUpperCase() : null;
}

module.exports = { createOrGetPendingOrder, paymentQr, markPaid, extractCode };
