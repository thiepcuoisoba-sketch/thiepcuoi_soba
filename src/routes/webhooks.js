'use strict';
/**
 * Webhook SePay: https://docs.sepay.vn – cấu hình URL: {APP_URL}/api/webhooks/sepay
 * Kiểu chứng thực: API Key  ->  header "Authorization: Apikey <SEPAY_WEBHOOK_KEY>"
 */
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const config = require('../config');
const { extractCode, markPaid } = require('../services/orders');

const router = express.Router();

function authorized(req) {
  if (!config.sepayKey) return false;
  const header = String(req.get('authorization') || '');
  const key = header.replace(/^Apikey\s+/i, '');
  const a = Buffer.from(key);
  const b = Buffer.from(config.sepayKey);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

router.post('/sepay', async (req, res) => {
  if (!authorized(req)) return res.status(401).json({ success: false });
  const p = req.body || {};
  const providerId = p.id !== undefined ? `sepay-${p.id}` : null;
  let note = '';
  let orderId = null;
  try {
    if (providerId && (await db.get('SELECT id FROM payment_logs WHERE provider_id = ?', [providerId]))) {
      return res.json({ success: true, duplicate: true });
    }
    if (p.transferType !== 'in') note = 'Bỏ qua: giao dịch tiền ra';
    else {
      const code = extractCode(`${p.content || ''} ${p.code || ''}`);
      const order = code ? await db.get('SELECT * FROM orders WHERE code = ?', [code]) : null;
      if (!order) note = 'Không tìm thấy mã đơn trong nội dung';
      else {
        orderId = order.id;
        if (Number(p.transferAmount) < Number(order.amount)) note = `Thiếu tiền: nhận ${p.transferAmount}/${order.amount}`;
        else note = (await markPaid(order, p.referenceCode || providerId || '')) ? 'Đã kích hoạt gói' : 'Đơn đã thanh toán trước đó';
      }
    }
    await db.run(`${db.insertIgnore()} INTO payment_logs (provider_id, payload, order_id, note, created_at) VALUES (?, ?, ?, ?, ?)`, [
      providerId,
      JSON.stringify(p).slice(0, 20000),
      orderId,
      note,
      Date.now(),
    ]);
    res.json({ success: true, note });
  } catch (e) {
    console.error('[SOBA] Lỗi webhook SePay', e);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
