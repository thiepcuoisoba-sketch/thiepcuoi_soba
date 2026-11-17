'use strict';
const config = require('../config');

let transporter = null;
function getTransport() {
  if (transporter !== null) return transporter;
  if (!config.smtp.host || !config.smtp.user) {
    transporter = false;
    return transporter;
  }
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.password },
  });
  return transporter;
}

/** Gửi email; nếu chưa cấu hình SMTP thì in ra console (dùng khi phát triển) */
async function sendMail({ to, subject, html, text }) {
  const t = getTransport();
  if (!t) {
    console.log(`\n[SOBA mail - chưa cấu hình SMTP]\nTo: ${to}\nSubject: ${subject}\n${text || html}\n`);
    return;
  }
  await t.sendMail({ from: config.smtp.from, to, subject, html, text });
}

module.exports = { sendMail };
