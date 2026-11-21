'use strict';
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { planOf, effectivePlanKey } = require('./services/plans');
const { randomCode } = require('./services/util');

/** Token CSRF lưu trong session; kiểm tra với mọi request ghi dữ liệu có đăng nhập */
function csrf(req, res, next) {
  if (!req.session) return next();
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  res.locals.csrfToken = req.session.csrf;
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  // Form tải tệp (multipart) chưa được đọc body ở bước này → nhận token qua ?_csrf=
  const multipart = /^multipart\//i.test(req.get('content-type') || '');
  const sent = (req.body && req.body._csrf) || req.get('x-csrf-token') || (multipart && req.query && req.query._csrf);
  if (sent && crypto.timingSafeEqual(Buffer.from(String(sent).padEnd(48).slice(0, 48)), Buffer.from(req.session.csrf))) return next();
  const err = new Error('Phiên làm việc đã hết hạn, vui lòng tải lại trang và thử lại.');
  err.status = 403;
  return next(err);
}

/** Flash message đơn giản */
function flash(req, res, next) {
  req.flash = (type, msg) => {
    req.session.flash = req.session.flash || [];
    req.session.flash.push({ type, msg });
  };
  res.locals.flashes = (req.session && req.session.flash) || [];
  if (req.session) delete req.session.flash;
  next();
}

function locals(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.plan = req.user ? planOf(req.user) : null;
  res.locals.planKey = req.user ? effectivePlanKey(req.user) : null;
  res.locals.path = req.path;
  res.locals.appUrl = config.appUrl;
  res.locals.contact = config.contact;
  res.locals.meta = { title: '', description: '' };
  res.locals.query = req.query;
  next();
}

function requireAuth(req, res, next) {
  if (req.user) return next();
  if (req.accepts(['html', 'json']) === 'json' || req.xhr) return res.status(401).json({ error: 'Vui lòng đăng nhập.' });
  req.session.returnTo = req.originalUrl;
  return res.redirect('/dang-nhap');
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  const err = new Error('Bạn không có quyền truy cập trang này.');
  err.status = 404;
  return next(err);
}

// ===== Upload ảnh / nhạc =====
try {
  fs.mkdirSync(config.uploadDir, { recursive: true });
} catch (e) {
  // Không để web sập vì thư mục ảnh – trang quản trị sẽ báo "Không ghi được"
  console.error(`[SOBA] Không tạo được thư mục ảnh ${config.uploadDir}: ${e.message}`);
}

const IMAGE_TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const AUDIO_TYPES = { 'audio/mpeg': '.mp3', 'audio/mp3': '.mp3', 'audio/mp4': '.m4a', 'audio/x-m4a': '.m4a', 'audio/aac': '.aac' };

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Chặn nhận ảnh khi thư mục lưu nằm trong thư mục deploy: thà báo lỗi ngay còn hơn để khách mất ảnh sau lần deploy tới
    if (config.isProd && config.uploadInsideCode) {
      console.error(`[SOBA] Từ chối tải ảnh: UPLOAD_DIR (${config.uploadDir}) nằm trong thư mục deploy.`);
      const err = new Error('Hệ thống lưu ảnh đang bảo trì, vui lòng thử lại sau ít phút hoặc liên hệ SOBA.');
      err.status = 409;
      return cb(err);
    }
    const d = new Date();
    const sub = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const dir = path.join(config.uploadDir, sub);
    fs.mkdirSync(dir, { recursive: true });
    file._sub = sub;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = IMAGE_TYPES[file.mimetype] || AUDIO_TYPES[file.mimetype] || '';
    cb(null, `${Date.now().toString(36)}-${randomCode(10)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES[file.mimetype] || AUDIO_TYPES[file.mimetype]) return cb(null, true);
    const err = new Error('Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF hoặc nhạc MP3/M4A.');
    err.status = 400;
    cb(err);
  },
});

module.exports = { csrf, flash, locals, requireAuth, requireAdmin, upload, IMAGE_TYPES, AUDIO_TYPES };
