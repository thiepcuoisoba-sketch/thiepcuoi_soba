'use strict';
const express = require('express');
const passport = require('passport');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const config = require('../config');
const { createUser, normEmail, socialEnabled } = require('../auth');
const { sendMail } = require('../services/mailer');
const { clean } = require('../services/util');

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function afterLogin(req, res) {
  const to = req.session.returnTo;
  delete req.session.returnTo;
  res.redirect(to && to.startsWith('/') && !to.startsWith('//') ? to : '/tai-khoan');
}

function guestOnly(req, res, next) {
  // ?mau=<key>: sau khi đăng ký/đăng nhập đưa thẳng tới bước tạo thiệp với mẫu đã chọn
  const mau = String(req.query.mau || '').replace(/[^a-z0-9-]/g, '').slice(0, 40);
  if (req.user) return res.redirect(mau ? `/thiep/tao?mau=${mau}` : '/tai-khoan');
  if (mau) req.session.returnTo = `/thiep/tao?mau=${mau}`;
  next();
}

const authView = (res, view, extra = {}) => res.render(view, { socialEnabled, form: {}, error: '', ...extra });

router.get('/dang-nhap', guestOnly, (req, res) => authView(res, 'auth/login', { meta: { title: 'Đăng nhập – SOBA' } }));

router.post('/dang-nhap', limiter, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).render('auth/login', { socialEnabled, form: { email: req.body.email }, error: info && info.message, meta: { title: 'Đăng nhập – SOBA' } });
    }
    const returnTo = req.session.returnTo;
    req.login(user, (e) => {
      if (e) return next(e);
      req.session.returnTo = returnTo;
      afterLogin(req, res);
    });
  })(req, res, next);
});

router.get('/dang-ky', guestOnly, (req, res) => authView(res, 'auth/register', { meta: { title: 'Đăng ký – SOBA' } }));

router.post('/dang-ky', limiter, async (req, res, next) => {
  const form = { name: clean(req.body.name, 120), email: normEmail(req.body.email) };
  const password = String(req.body.password || '');
  const fail = (error) => res.status(400).render('auth/register', { socialEnabled, form, error, meta: { title: 'Đăng ký – SOBA' } });
  if (!form.name) return fail('Vui lòng nhập họ tên.');
  if (!EMAIL_RE.test(form.email)) return fail('Email không hợp lệ.');
  if (password.length < 8) return fail('Mật khẩu cần tối thiểu 8 ký tự.');
  if (req.body.agree !== 'on') return fail('Vui lòng đồng ý với điều khoản sử dụng.');
  if (await db.get('SELECT id FROM users WHERE email = ?', [form.email])) return fail('Email này đã được đăng ký. Hãy đăng nhập.');
  try {
    const user = await createUser({ email: form.email, password, name: form.name });
    const returnTo = req.session.returnTo;
    req.login(user, (e) => {
      if (e) return next(e);
      req.flash('success', `Chào mừng ${user.name} đến với SOBA! Hãy chọn một mẫu để bắt đầu.`);
      res.redirect(returnTo && returnTo.startsWith('/thiep/tao') ? returnTo : '/thiep/tao');
    });
  } catch (e) {
    next(e);
  }
});

router.post('/dang-xuat', (req, res, next) => {
  req.logout((e) => {
    if (e) return next(e);
    req.session.destroy(() => res.redirect('/'));
  });
});

// ===== Quên / đặt lại mật khẩu =====
router.get('/quen-mat-khau', (req, res) => authView(res, 'auth/forgot', { meta: { title: 'Quên mật khẩu – SOBA' }, sent: false }));

router.post('/quen-mat-khau', limiter, async (req, res) => {
  const email = normEmail(req.body.email);
  const user = EMAIL_RE.test(email) ? await db.get('SELECT * FROM users WHERE email = ?', [email]) : null;
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    await db.run('UPDATE users SET reset_token = ?, reset_expires_at = ? WHERE id = ?', [hash, Date.now() + 3600 * 1000, user.id]);
    const link = `${config.appUrl}/dat-lai-mat-khau/${token}`;
    await sendMail({
      to: user.email,
      subject: 'SOBA – Đặt lại mật khẩu',
      text: `Xin chào ${user.name},\n\nBấm vào liên kết sau để đặt lại mật khẩu (hiệu lực 60 phút):\n${link}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.\nSOBA`,
      html: `<p>Xin chào ${clean(user.name).replace(/</g, '&lt;')},</p><p>Bấm vào liên kết sau để đặt lại mật khẩu (hiệu lực 60 phút):</p><p><a href="${link}">Đặt lại mật khẩu</a></p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.<br>SOBA</p>`,
    }).catch((e) => console.error('[SOBA] Gửi mail lỗi', e.message));
  }
  authView(res, 'auth/forgot', { meta: { title: 'Quên mật khẩu – SOBA' }, sent: true });
});

async function userByToken(token) {
  const hash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const user = await db.get('SELECT * FROM users WHERE reset_token = ?', [hash]);
  return user && Number(user.reset_expires_at) > Date.now() ? user : null;
}

router.get('/dat-lai-mat-khau/:token', async (req, res) => {
  const user = await userByToken(req.params.token);
  authView(res, 'auth/reset', { meta: { title: 'Đặt lại mật khẩu – SOBA' }, valid: Boolean(user), token: req.params.token });
});

router.post('/dat-lai-mat-khau/:token', limiter, async (req, res) => {
  const user = await userByToken(req.params.token);
  const password = String(req.body.password || '');
  if (!user) return authView(res, 'auth/reset', { meta: { title: 'Đặt lại mật khẩu – SOBA' }, valid: false, token: '' });
  if (password.length < 8) {
    return authView(res, 'auth/reset', { meta: { title: 'Đặt lại mật khẩu – SOBA' }, valid: true, token: req.params.token, error: 'Mật khẩu cần tối thiểu 8 ký tự.' });
  }
  await db.run('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL WHERE id = ?', [await bcrypt.hash(password, 11), user.id]);
  req.flash('success', 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
  res.redirect('/dang-nhap');
});

// ===== Google / Facebook =====
const socialFail = (provider) => (req, res, next) => {
  if (!socialEnabled[provider]) {
    req.flash('error', 'Phương thức đăng nhập này chưa được kích hoạt.');
    return res.redirect('/dang-nhap');
  }
  next();
};

router.get('/auth/google', socialFail('google'), passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));
router.get('/auth/google/callback', socialFail('google'), (req, res, next) => {
  const returnTo = req.session.returnTo;
  passport.authenticate('google', { failureRedirect: '/dang-nhap', failureMessage: true })(req, res, (err) => {
    if (err) return next(err);
    req.session.returnTo = returnTo;
    afterLogin(req, res);
  });
});

router.get('/auth/facebook', socialFail('facebook'), passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', socialFail('facebook'), (req, res, next) => {
  const returnTo = req.session.returnTo;
  passport.authenticate('facebook', { failureRedirect: '/dang-nhap', failureMessage: true })(req, res, (err) => {
    if (err) return next(err);
    req.session.returnTo = returnTo;
    afterLogin(req, res);
  });
});

module.exports = router;
