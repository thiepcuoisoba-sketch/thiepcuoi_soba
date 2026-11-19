'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const env = (key, fallback = '') => (process.env[key] ?? fallback).toString().trim();
const root = path.join(__dirname, '..');

const config = {
  root,
  isProd: env('NODE_ENV') === 'production',
  port: Number(env('PORT', '3000')) || 3000,
  appUrl: env('APP_URL', 'http://localhost:3000').replace(/\/+$/, ''),
  sessionSecret: env('SESSION_SECRET', 'change-me'),

  db: {
    client: env('DB_CLIENT', 'sqlite'),
    host: env('DB_HOST', 'localhost'),
    port: Number(env('DB_PORT', '3306')),
    name: env('DB_NAME'),
    user: env('DB_USER'),
    password: env('DB_PASSWORD'),
    sqliteFile: path.resolve(root, env('SQLITE_FILE', './data/soba.sqlite')),
  },

  uploadDir: path.resolve(root, env('UPLOAD_DIR', './uploads')),

  google: { clientID: env('GOOGLE_CLIENT_ID'), clientSecret: env('GOOGLE_CLIENT_SECRET') },
  facebook: { clientID: env('FACEBOOK_APP_ID'), clientSecret: env('FACEBOOK_APP_SECRET') },

  bank: {
    id: env('BANK_ID', 'MB'),
    accountNo: env('BANK_ACCOUNT_NO'),
    accountName: env('BANK_ACCOUNT_NAME'),
  },
  sepayKey: env('SEPAY_WEBHOOK_KEY'),

  smtp: {
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT', '465')),
    user: env('SMTP_USER'),
    password: env('SMTP_PASSWORD'),
    from: env('MAIL_FROM', 'SOBA <hello@soba.vn>'),
  },

  adminEmail: env('ADMIN_EMAIL').toLowerCase(),

  contact: {
    phone: env('CONTACT_PHONE', '0326 409 003'),
    zalo: env('CONTACT_ZALO', 'https://zalo.me/0326409003'),
    email: env('CONTACT_EMAIL', 'thiepcuoisoba@gmail.com'),
    facebook: env('CONTACT_FACEBOOK'),
    tiktok: env('CONTACT_TIKTOK'),
    instagram: env('CONTACT_INSTAGRAM'),
  },
};

if (config.isProd && (config.sessionSecret.length < 32 || config.sessionSecret === 'change-me')) {
  console.warn('[SOBA] CẢNH BÁO: SESSION_SECRET quá ngắn. Hãy đặt chuỗi ngẫu nhiên >= 32 ký tự.');
}

module.exports = config;
