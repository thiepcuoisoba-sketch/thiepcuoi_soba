'use strict';
const express = require('express');
const db = require('../db');
const config = require('../config');
const { requireAuth } = require('../middleware');
const { PLANS, effectivePlanKey, TIER_ORDER } = require('../services/plans');
const { createOrGetPendingOrder, paymentQr } = require('../services/orders');
const { vnd, formatDateTime } = require('../services/util');

const router = express.Router();

router.get('/nang-cap', requireAuth, async (req, res) => {
  const key = PLANS[req.query.goi] && PLANS[req.query.goi].price ? req.query.goi : null;
  if (!key) return res.redirect('/bang-gia');
  const current = effectivePlanKey(req.user);
  if (TIER_ORDER.indexOf(current) > TIER_ORDER.indexOf(key)) {
    req.flash('error', `Bạn đang dùng gói ${PLANS[current].name} cao hơn gói đã chọn.`);
    return res.redirect('/bang-gia');
  }
  const order = await createOrGetPendingOrder(req.user, key);
  res.render('dashboard/checkout', {
    layout: 'layouts/app',
    meta: { title: `Thanh toán gói ${PLANS[key].name} – SOBA` },
    order,
    buyPlan: PLANS[key],
    qr: paymentQr(order),
    bank: config.bank,
    configured: Boolean(config.bank.accountNo && config.bank.accountNo !== '0000000000'),
    vnd,
    renew: current === key,
  });
});

router.get('/api/don-hang/:code', requireAuth, async (req, res) => {
  const order = await db.get('SELECT code, status, plan FROM orders WHERE code = ? AND user_id = ?', [String(req.params.code).toUpperCase(), req.user.id]);
  if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
  res.set('Cache-Control', 'no-store');
  res.json({ status: order.status });
});

router.get('/tai-khoan/don-hang', requireAuth, async (req, res) => {
  const orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 50', [req.user.id]);
  res.render('dashboard/orders', { layout: 'layouts/app', meta: { title: 'Lịch sử thanh toán – SOBA' }, orders, PLANS, vnd, formatDateTime });
});

module.exports = router;
