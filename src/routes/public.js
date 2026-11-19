'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const config = require('../config');
const { TEMPLATES, CATEGORIES, TIER_LABEL, getTemplate, exists } = require('../services/templates');
const { PLANS, COMPARE_ROWS } = require('../services/plans');
const { FEATURES, STEPS, PAINS, TESTIMONIALS, FAQ, ARTICLES } = require('../content');
const util = require('../services/util');
const { clean, vnd, removeDiacritics } = util;
const { parseData } = require('../services/cards');
const canvas = require('../services/canvas');

/** Mẫu thiết kế tự do có ảnh thật – đưa ra trang chủ */
// Mẫu "featured" (mẫu mới nổi bật) đứng đầu hàng "Mẫu thiết kế phổ biến"
// featured: 3 = bộ mẫu mới nhất, 2 = được chủ dự án chọn đẩy lên đầu, 1 = mẫu mới nổi bật
// featured: 4 = bộ mẫu a47–a50 (19/11/2026)
const sortedStarters = canvas.STARTERS.filter((s) => s.thumb).sort((a, b) => Number(b.featured || 0) - Number(a.featured || 0));
/** Mẫu tông đỏ – chủ dự án muốn xen kẽ lên đầu cho khách dễ chọn (19/11/2026) */
const RED_KEYS = ['do-son-song-hy', 'hoa-hong-do', 'do-do-chu-vang', 'phong-bi-do-nhung', 'hy-su-vui-nhon', 'bao-cuoi'];
function interleaveRed(list) {
  const reds = RED_KEYS.map((k) => list.find((s) => s.key === k)).filter(Boolean);
  const rest = list.filter((s) => !RED_KEYS.includes(s.key));
  const out = [];
  // 1 mẫu thường, 1 mẫu đỏ, rồi cứ 2 mẫu thường lại 1 mẫu đỏ
  out.push(...rest.splice(0, 1));
  while (reds.length) {
    out.push(reds.shift());
    out.push(...rest.splice(0, 2));
  }
  return out.concat(rest);
}
const photoStarters = interleaveRed(sortedStarters);
/** Danh mục của mẫu ảnh – suy ra từ nhãn (tags) */
const TAG_CAT = {
  'lang-man': ['Lãng mạn', 'Pastel', 'Hoa', 'Phong bì', 'Khung vòm', 'Thiên nhiên', 'Ngoài trời', 'Hoàng hôn'],
  'toi-gian': ['Tối giản', 'Studio', 'Thanh lịch'],
  'truyen-thong': ['Truyền thống', 'Chữ Hỷ', 'Đỏ đô'],
  'han-quoc': ['Hàn Quốc'],
  'thinh-hanh': ['Poster', 'Tạp chí', 'Báo cưới', 'Trẻ trung', 'Du lịch', 'Cá tính', 'Tươi sáng', 'Lấp lánh'],
  'dien-anh': ['Điện ảnh', 'Đen trắng', 'Đêm', 'Ngân hà'],
  vintage: ['Vintage', 'Cổ điển', 'Châu Âu', 'Báo cưới'],
};
photoStarters.forEach((s) => {
  s.cats = Object.keys(TAG_CAT).filter((c) => s.tags.some((t) => TAG_CAT[c].includes(t)));
});
// Cổ phục / phong bì đỏ cũng hợp hàng truyền thống
['hanbok-xuan-thi', 'phong-bi-do-nhung'].forEach((k) => {
  const s = photoStarters.find((x) => x.key === k);
  if (s && !s.cats.includes('truyen-thong')) s.cats.push('truyen-thong');
});
/** Lọc mẫu ảnh; `min` > 0 thì lặp lại cho đủ chỗ trên hàng cuộn ngang */
function photosWhere(fn, min = 0) {
  const list = photoStarters.filter(fn);
  if (!list.length || list.length >= min) return list;
  const out = [];
  while (out.length < min) out.push(...list);
  return out.slice(0, min);
}
const ROW_MIN = 10;
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

/** Dữ liệu popup xem trước mẫu ảnh (mã cv:<key>) */
const CV_JSON = canvas.safeJson(photoStarters.map((s) => ({ key: s.key, name: s.name, tier: s.tier, tierLabel: TIER_LABEL[s.tier], tags: s.tags, desc: s.desc, features: starterFeatures(s) })));

const router = express.Router();

async function showcase(limit = 8) {
  const rows = await db.all(
    "SELECT id, slug, template, title, data, views, kind FROM cards WHERE is_showcase = 1 AND status = 'published' ORDER BY published_at DESC LIMIT ?",
    [limit]
  );
  return rows.map((c) => {
    // Thiệp kéo thả (canvas): thẻ hiện ảnh bìa (ảnh màn mở thiệp, không có thì ảnh lớn nhất trang đầu)
    if (c.kind === 'canvas') {
      const doc = canvas.parseDoc(c);
      const imgs = (doc.sections[0] ? doc.sections[0].els : []).filter((e) => e.type === 'image' && e.src && !/^\/img\/(deco|nen)\//.test(e.src)).sort((a, b) => b.w * b.h - a.w * a.h);
      const thumb = doc.opener.photo || (imgs[0] && imgs[0].src) || '';
      const date = util.formatDateVi(util.parseDate(doc.date, doc.time));
      return { ...c, cv: { thumb, names: canvas.coupleNames(doc), date: date ? date.split(', ').pop() : '' } };
    }
    const d = parseData(c);
    return { ...c, d, tpl: getTemplate(c.template) };
  });
}

async function usageMap() {
  const rows = await db.all('SELECT template, COUNT(*) AS n FROM cards GROUP BY template');
  return Object.fromEntries(rows.map((r) => [r.template, Number(r.n)]));
}

// 30 mẫu vẽ dạng form (không có ảnh) đã gỡ khỏi kho mẫu 18/11/2026 – thiệp cũ vẫn hiển thị bình thường
const LISTED = [];
const by = (fn) => LISTED.filter(fn);

// ===== Trang Khám phá (trang chủ mới) =====
router.get('/', async (req, res) => {
  const usage = await usageMap();
  const popular = [...LISTED].sort((a, b) => (usage[b.key] || 0) - (usage[a.key] || 0) || Number(b.featured) - Number(a.featured));
  res.render('explore/home', {
    layout: 'layouts/explore',
    meta: {
      title: 'SOBA – Tạo thiệp cưới online đẹp, miễn phí',
      description: 'Kho mẫu thiệp cưới online có ảnh thật: lãng mạn, truyền thống chữ Hỷ, Hàn Quốc, poster thịnh hành. Tên khách riêng, xác nhận tham dự, mừng cưới QR.',
    },
    CATEGORIES,
    templates: TEMPLATES,
    usage,
    rows: [
      // Mỗi hàng hiện mẫu ảnh thật (lặp lại cho đủ chỗ), rồi tới mẫu vẽ cùng loại
      { key: 'tuyen-chon', title: 'SOBA tuyển chọn', sub: 'Mẫu đẹp, được yêu thích nhất', href: '/mau-thiep', photos: photosWhere((s) => s.featured >= 3 || RED_KEYS.includes(s.key)).concat(photosWhere((s) => s.featured && s.featured < 3 && !RED_KEYS.includes(s.key))), items: [] },
      { key: 'thinh-hanh', title: 'Đang thịnh hành', sub: 'Phong cách hot trên TikTok, Facebook', href: '/mau-thiep?dm=thinh-hanh', photos: photosWhere((s) => s.cats.includes('thinh-hanh') || s.cats.includes('dien-anh'), ROW_MIN), items: by((t) => t.category === 'thinh-hanh').concat(popular.filter((t) => t.category !== 'thinh-hanh').slice(0, 3)) },
      { key: 'truyen-thong', title: 'Truyền thống Việt', sub: 'Lễ vu quy, tân hôn, chữ Hỷ', href: '/mau-thiep?dm=truyen-thong', photos: photosWhere((s) => s.cats.includes('truyen-thong'), ROW_MIN), items: by((t) => t.category === 'truyen-thong') },
      { key: 'han-quoc', title: 'Phong cách Hàn Quốc', sub: 'Studio trắng, hanbok, nhẹ nhàng', href: '/mau-thiep?dm=han-quoc', photos: photosWhere((s) => s.cats.includes('han-quoc') || s.cats.includes('toi-gian'), ROW_MIN), items: by((t) => t.category === 'han-quoc') },
      { key: 'mien-phi', title: 'Miễn phí', sub: 'Dùng ngay, không tốn đồng nào', href: '/mau-thiep?goi=free', photos: photosWhere((s) => s.tier === 'free', ROW_MIN), items: by((t) => t.tier === 'free') },
      { key: 'sang-trong', title: 'Sang trọng & điện ảnh', sub: 'Mẫu Premium cao cấp', href: '/mau-thiep?goi=premium', photos: photosWhere((s) => s.tier === 'premium', ROW_MIN), items: by((t) => t.tier === 'premium') },
    ],
    showcase: await showcase(12),
    photoStarters,
    cvJson: CV_JSON,
  });
});

router.get('/gioi-thieu', async (req, res) => {
  const stats = await db.get("SELECT COUNT(*) AS n FROM cards WHERE status = 'published'");
  res.render('pages/home', {
    meta: {
      title: 'SOBA – Tạo thiệp cưới online đẹp, tinh tế trong 10 phút',
      description: 'Tạo thiệp cưới online miễn phí với SOBA: mẫu thiệp lãng mạn, tên khách mời riêng, xác nhận tham dự, hộp mừng cưới QR và bản đồ chỉ đường.',
    },
    templates: [],
    photoCount: photoStarters.length,
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
  let list = LISTED;
  if (!favMode) {
    if (dm) list = list.filter((t) => t.category === dm);
    if (goi) list = list.filter((t) => t.tier === goi);
    if (needle) {
      const KW = { hy: 'chữ hỷ song hỷ đỏ cưới hỏi', poster: 'poster tiktok chữ lớn', newspaper: 'báo tờ báo', photo: 'ảnh cưới', arch: 'khung vòm' };
      list = list.filter((t) => removeDiacritics([t.name, t.description, t.title, t.tags.join(' '), TIER_LABEL[t.tier], KW[t.thumb] || ''].join(' ')).toLowerCase().includes(needle));
    }
  }
  let photos = [];
  if (!favMode) {
    photos = photoStarters.filter((s) => (!dm || s.cats.includes(dm)) && (!goi || s.tier === goi) && (!needle || removeDiacritics([s.name, s.desc, s.tags.join(' '), TIER_LABEL[s.tier]].join(' ')).toLowerCase().includes(needle)));
  } else photos = photoStarters;
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
    photos,
    cvJson: CV_JSON,
    q,
    dm,
    goi,
    favMode,
    usage: await usageMap(),
  });
});

router.get('/mau-thiep/:key', (req, res, next) => {
  if (!exists(req.params.key)) return next();
  if (!LISTED.some((t) => t.key === req.params.key)) return res.redirect(301, '/mau-thiep');
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
    .concat(ARTICLES.map((a) => `/cam-nang/${a.slug}`));
  res
    .type('application/xml')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${config.appUrl}${u}</loc></url>`).join('')}</urlset>`);
});

module.exports = router;
