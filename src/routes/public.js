'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const config = require('../config');
const { FEATURED, TEMPLATES, CATEGORIES, TIER_LABEL, getTemplate, exists } = require('../services/templates');
const { PLANS, COMPARE_ROWS } = require('../services/plans');
const { FEATURES, STEPS, PAINS, TESTIMONIALS, FAQ, ARTICLES } = require('../content');
const { clean, vnd, removeDiacritics } = require('../services/util');
const { parseData } = require('../services/cards');
const canvas = require('../services/canvas');

/** Mẫu thiết kế tự do có ảnh thật – đưa ra trang chủ */
// Mẫu "featured" (mẫu mới nổi bật) đứng đầu hàng "Mẫu thiết kế phổ biến"
const photoStarters = canvas.STARTERS.filter((s) => s.thumb).sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
/** Tiện ích có trong mẫu – hiện ở popup xem trước (kiểu "Có trong mẫu này") */
const OPENER_NAME = Object.fromEntries(canvas.OPENERS.map((o) => [o.key, o.name]));
function starterFeatures(s) {
  const paid = s.tier !== 'free';
  const n = s.doc.sections.reduce((a, sec) => a + sec.els.filter((e) => e.type === 'image').length + sec.els.filter((e) => e.widget === 'album').reduce((x, e) => x + e.images.length, 0), 0);
  return [
    paid && s.opener && s.opener !== 'none' ? 'Mở thiệp: ' + OPENER_NAME[s.opener] : null,
    paid ? 'Hộp mừng cưới mã QR' : null,
    paid ? 'Lời chúc bay, bắn tim, thả tim' : null,
    'Tên riêng từng khách mời',
    'Xác nhận tham dự (RSVP)',
    'Sổ lời chúc',
    'Đếm ngược & lịch ngày cưới',
    'Bản đồ chỉ đường',
    `${n} vị trí ảnh có thể thay`,
    s.song ? 'Nhạc nền: ' + (canvas.SONGS.find((x) => x.key === s.song) || {}).name : 'Nhạc nền',
  ].filter(Boolean);
}

const router = express.Router();

async function showcase(limit = 8) {
  const rows = await db.all(
    "SELECT id, slug, template, title, data, views FROM cards WHERE is_showcase = 1 AND status = 'published' ORDER BY published_at DESC LIMIT ?",
    [limit]
  );
  return rows.map((c) => {
    const d = parseData(c);
    return { ...c, d, tpl: getTemplate(c.template) };
  });
}

async function usageMap() {
  const rows = await db.all('SELECT template, COUNT(*) AS n FROM cards GROUP BY template');
  return Object.fromEntries(rows.map((r) => [r.template, Number(r.n)]));
}

const by = (fn) => TEMPLATES.filter(fn);

// ===== Trang Khám phá (trang chủ mới) =====
router.get('/', async (req, res) => {
  const usage = await usageMap();
  const popular = [...TEMPLATES].sort((a, b) => (usage[b.key] || 0) - (usage[a.key] || 0) || Number(b.featured) - Number(a.featured));
  res.render('explore/home', {
    layout: 'layouts/explore',
    meta: {
      title: 'SOBA – Tạo thiệp cưới online đẹp, miễn phí',
      description: 'Kho 30 mẫu thiệp cưới online: lãng mạn, truyền thống chữ Hỷ, Hàn Quốc, poster thịnh hành. Tên khách riêng, xác nhận tham dự, mừng cưới QR.',
    },
    CATEGORIES,
    templates: TEMPLATES,
    usage,
    rows: [
      { key: 'tuyen-chon', title: 'SOBA tuyển chọn', sub: 'Mẫu đẹp, được yêu thích nhất', href: '/mau-thiep', items: FEATURED.map(getTemplate) },
      { key: 'thinh-hanh', title: 'Đang thịnh hành', sub: 'Phong cách hot trên TikTok, Facebook', href: '/mau-thiep?dm=thinh-hanh', items: by((t) => t.category === 'thinh-hanh').concat(popular.filter((t) => t.category !== 'thinh-hanh').slice(0, 3)) },
      { key: 'truyen-thong', title: 'Truyền thống Việt', sub: 'Lễ vu quy, tân hôn, chữ Hỷ', href: '/mau-thiep?dm=truyen-thong', items: by((t) => t.category === 'truyen-thong') },
      { key: 'mien-phi', title: 'Miễn phí', sub: 'Dùng ngay, không tốn đồng nào', href: '/mau-thiep?goi=free', items: by((t) => t.tier === 'free') },
      { key: 'sang-trong', title: 'Sang trọng & điện ảnh', sub: 'Mẫu Premium cao cấp', href: '/mau-thiep?goi=premium', items: by((t) => t.tier === 'premium') },
    ],
    showcase: await showcase(12),
    photoStarters,
    cvJson: canvas.safeJson(photoStarters.map((s) => ({ key: s.key, name: s.name, tier: s.tier, tierLabel: TIER_LABEL[s.tier], tags: s.tags, desc: s.desc, features: starterFeatures(s) }))),
  });
});

router.get('/gioi-thieu', async (req, res) => {
  const stats = await db.get("SELECT COUNT(*) AS n FROM cards WHERE status = 'published'");
  res.render('pages/home', {
    meta: {
      title: 'SOBA – Tạo thiệp cưới online đẹp, tinh tế trong 10 phút',
      description: 'Tạo thiệp cưới online miễn phí với SOBA: mẫu thiệp lãng mạn, tên khách mời riêng, xác nhận tham dự, hộp mừng cưới QR và bản đồ chỉ đường.',
    },
    templates: TEMPLATES.filter((t) => t.featured),
    showcase: await showcase(8),
    publishedCount: Number(stats ? stats.n : 0),
    FEATURES,
    STEPS,
    PAINS,
    TESTIMONIALS,
    FAQ: FAQ.slice(0, 6),
    articles: ARTICLES,
    PLANS,
  });
});

router.get('/mau-thiep', async (req, res) => {
  const q = clean(req.query.q, 60);
  const dm = CATEGORIES.some((c) => c.key === req.query.dm) ? req.query.dm : '';
  const goi = ['free', 'basic', 'premium'].includes(req.query.goi) ? req.query.goi : '';
  const favMode = req.query.luu === '1';
  const needle = removeDiacritics(q).toLowerCase();
  let list = TEMPLATES;
  if (!favMode) {
    if (dm) list = list.filter((t) => t.category === dm);
    if (goi) list = list.filter((t) => t.tier === goi);
    if (needle) {
      const KW = { hy: 'chữ hỷ song hỷ đỏ cưới hỏi', poster: 'poster tiktok chữ lớn', newspaper: 'báo tờ báo', photo: 'ảnh cưới', arch: 'khung vòm' };
      list = list.filter((t) => removeDiacritics([t.name, t.description, t.title, t.tags.join(' '), TIER_LABEL[t.tier], KW[t.thumb] || ''].join(' ')).toLowerCase().includes(needle));
    }
  }
  const cat = CATEGORIES.find((c) => c.key === dm);
  res.render('explore/templates', {
    layout: 'layouts/explore',
    meta: {
      title: `${cat ? 'Mẫu thiệp cưới ' + cat.name.toLowerCase() : 'Kho mẫu thiệp cưới online'} – SOBA`,
      description: 'Kho mẫu thiệp cưới online: lãng mạn, tối giản, truyền thống, Hàn Quốc, điện ảnh. Xem trước miễn phí.',
    },
    templates: TEMPLATES,
    CATEGORIES,
    list,
    q,
    dm,
    goi,
    favMode,
    usage: await usageMap(),
  });
});

router.get('/mau-thiep/:key', (req, res, next) => {
  if (!exists(req.params.key)) return next();
  const tpl = getTemplate(req.params.key);
  res.render('pages/template-detail', {
    meta: { title: `Mẫu thiệp cưới ${tpl.name} – SOBA`, description: tpl.description },
    tpl,
    others: TEMPLATES.filter((t) => t.key !== tpl.key).slice(0, 3),
  });
});

router.get('/bang-gia', (req, res) => {
  res.render('pages/pricing', {
    meta: { title: 'Bảng giá gói dịch vụ – SOBA', description: 'Chọn gói thiệp cưới online phù hợp: Miễn phí, Basic, Premium. Thanh toán QR, kích hoạt tức thì.' },
    PLANS,
    COMPARE_ROWS,
    FAQ: FAQ.filter((f) => /thanh toán|lưu|miễn phí|sửa/i.test(f.q)),
    vnd,
  });
});

router.get('/tinh-nang', (req, res) => {
  res.render('pages/features', {
    meta: { title: 'Tính năng thiệp cưới online – SOBA', description: 'Tên khách mời riêng, RSVP, hộp mừng QR, bản đồ, nhạc nền, album ảnh và sổ lời chúc.' },
    FEATURES,
    STEPS,
  });
});

router.get('/thiep-khach-hang', async (req, res) => {
  res.render('pages/showcase', {
    meta: { title: 'Thiệp cưới khách hàng đã tạo – SOBA', description: 'Những tấm thiệp cưới online thật được các cặp đôi tạo trên SOBA.' },
    showcase: await showcase(40),
  });
});

router.get('/huong-dan', (req, res) => {
  res.render('pages/guide', { meta: { title: 'Hướng dẫn tạo thiệp cưới online – SOBA', description: 'Hướng dẫn từng bước tạo và gửi thiệp cưới online trên SOBA.' }, STEPS });
});

router.get('/cam-nang', (req, res) => {
  res.render('pages/blog', { meta: { title: 'Cẩm nang cưới hỏi – SOBA', description: 'Kinh nghiệm chuẩn bị đám cưới, gửi thiệp và quản lý khách mời.' }, articles: ARTICLES });
});

router.get('/cam-nang/:slug', (req, res, next) => {
  const article = ARTICLES.find((a) => a.slug === req.params.slug);
  if (!article) return next();
  res.render('pages/article', {
    meta: { title: `${article.title} – SOBA`, description: article.excerpt, type: 'article' },
    article,
    related: ARTICLES.filter((a) => a.slug !== article.slug),
  });
});

router.get('/cau-hoi-thuong-gap', (req, res) => {
  res.render('pages/faq', { meta: { title: 'Câu hỏi thường gặp – SOBA', description: 'Giải đáp thắc mắc về tạo thiệp, gửi thiệp, thanh toán và mừng cưới QR.' }, FAQ });
});

router.get('/lien-he', (req, res) => {
  res.render('pages/contact', { meta: { title: 'Liên hệ – SOBA', description: 'Liên hệ đội ngũ SOBA để được hỗ trợ tạo thiệp cưới online.' }, form: {} });
});

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
router.post('/lien-he', contactLimiter, async (req, res) => {
  const form = { name: clean(req.body.name, 120), phone: clean(req.body.phone, 30), email: clean(req.body.email, 190), message: clean(req.body.message, 2000) };
  if (req.body.website) return res.redirect('/lien-he'); // honeypot
  if (!form.name || !form.message || (!form.phone && !form.email)) {
    return res.status(400).render('pages/contact', { meta: { title: 'Liên hệ – SOBA' }, form, flashes: [{ type: 'error', msg: 'Vui lòng nhập họ tên, nội dung và ít nhất số điện thoại hoặc email.' }] });
  }
  await db.run('INSERT INTO contacts (name, phone, email, message, created_at) VALUES (?, ?, ?, ?, ?)', [form.name, form.phone, form.email, form.message, Date.now()]);
  req.flash('success', 'Cảm ơn bạn! SOBA sẽ liên hệ lại trong thời gian sớm nhất.');
  res.redirect('/lien-he');
});

router.get('/dieu-khoan', (req, res) => res.render('pages/legal', { meta: { title: 'Điều khoản sử dụng – SOBA' }, kind: 'terms' }));
router.get('/chinh-sach-bao-mat', (req, res) => res.render('pages/legal', { meta: { title: 'Chính sách bảo mật – SOBA' }, kind: 'privacy' }));

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /tai-khoan\nDisallow: /thiep/\nDisallow: /quan-tri\nDisallow: /t/\nSitemap: ${config.appUrl}/sitemap.xml\n`);
});

router.get('/sitemap.xml', (req, res) => {
  const urls = ['/', '/gioi-thieu', '/mau-thiep', '/bang-gia', '/tinh-nang', '/thiep-khach-hang', '/huong-dan', '/cam-nang', '/cau-hoi-thuong-gap', '/lien-he']
    .concat(TEMPLATES.map((t) => `/mau-thiep/${t.key}`))
    .concat(ARTICLES.map((a) => `/cam-nang/${a.slug}`));
  res
    .type('application/xml')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${config.appUrl}${u}</loc></url>`).join('')}</urlset>`);
});

module.exports = router;
