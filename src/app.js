'use strict';
const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const layouts = require('express-ejs-layouts');
const config = require('./config');
const DbStore = require('./services/session-store');
const { setupPassport } = require('./auth');
const { csrf, flash, locals } = require('./middleware');
const util = require('./services/util');
const { TIER_LABEL, TEMPLATES, CATEGORIES, ALL_FONTS_URL } = require('./services/templates');

function createApp() {
  const app = express();
  const passport = setupPassport();

  app.set('trust proxy', 1);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.set('layout', 'layouts/main');
  app.disable('x-powered-by');

  app.locals.util = util;
  app.locals.TIER_LABEL = TIER_LABEL;
  app.locals.ALL_FONTS_URL = ALL_FONTS_URL;
  app.locals.tplJson = JSON.stringify(
    TEMPLATES.map((t) => ({ key: t.key, name: t.name, tier: t.tier, tierLabel: TIER_LABEL[t.tier], cat: (CATEGORIES.find((c) => c.key === t.category) || {}).name, desc: t.description }))
  ).split(String.fromCharCode(60)).join(String.fromCharCode(92) + "u003c");
  app.locals.assetVersion = Date.now().toString(36);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'https:', 'blob:'],
          'frame-src': ["'self'", 'https://maps.google.com', 'https://www.google.com', 'https://www.youtube-nocookie.com', 'https://www.youtube.com'],
          'frame-ancestors': ["'self'"],
          'connect-src': ["'self'"],
          'form-action': ["'self'", 'https://accounts.google.com', 'https://www.facebook.com'],
          'upgrade-insecure-requests': config.isProd ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(compression());

  // Tệp tĩnh
  app.use(express.static(path.join(config.root, 'public'), { maxAge: config.isProd ? '7d' : 0 }));
  app.use('/uploads', require('./services/storage').selfHeal, express.static(config.uploadDir, { maxAge: '30d', fallthrough: false }));

  // Webhook thanh toán cần body thô JSON, đăng ký trước CSRF
  app.use('/api/webhooks', express.json({ limit: '200kb' }), require('./routes/webhooks'));

  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(express.json({ limit: '1mb' }));

  // Trang thiệp công khai (khách mời) – không tạo session để nhẹ & nhanh
  app.use(layouts);
  app.use((req, res, next) => {
    res.locals.util = util;
    next();
  });
  app.use(require('./routes/invitation'));

  app.use(
    session({
      name: 'soba.sid',
      secret: config.sessionSecret,
      store: new DbStore(),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: { httpOnly: true, sameSite: 'lax', secure: config.isProd, maxAge: 30 * 24 * 3600 * 1000 },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash);
  app.use(locals);
  app.use(csrf);

  app.use(require('./routes/public'));
  app.use(require('./routes/auth'));
  app.use(require('./routes/dashboard'));
  app.use(require('./routes/billing'));
  app.use('/quan-tri', require('./routes/admin'));

  // 404
  app.use((req, res) => {
    res.status(404).render('errors/error', { status: 404, message: 'Trang bạn tìm không tồn tại hoặc đã được chuyển đi.', meta: { title: 'Không tìm thấy trang' } });
  });

  // Lỗi
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
    if (status >= 500) console.error(err);
    const message = status >= 500 ? 'Đã có lỗi xảy ra. Vui lòng thử lại sau ít phút.' : err.code === 'LIMIT_FILE_SIZE' ? 'Tệp quá lớn (tối đa 12MB).' : err.message;
    if (req.xhr || (req.get('accept') || '').includes('application/json') || req.path.startsWith('/api/')) {
      return res.status(status).json({ error: message });
    }
    res.status(status);
    res.locals.user = res.locals.user || req.user || null;
    res.locals.flashes = res.locals.flashes || [];
    res.locals.contact = res.locals.contact || config.contact;
    res.locals.path = req.path;
    res.locals.csrfToken = res.locals.csrfToken || '';
    res.render('errors/error', { status, message, meta: { title: 'Có lỗi xảy ra' } });
  });

  return app;
}

module.exports = createApp;
