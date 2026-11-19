'use strict';
/** Trang thiệp dành cho khách mời – không dùng session */
const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { exists } = require('../services/templates');
const { buildView, demoData, storageExpired, parseData } = require('../services/cards');
const { planOf } = require('../services/plans');
const { clean } = require('../services/util');
const canvas = require('../services/canvas');

const router = express.Router();
const BOT_RE = /bot|crawler|spider|facebookexternalhit|zalo|preview|curl|wget|slurp/i;

const writeLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Bạn thao tác quá nhanh, vui lòng thử lại sau.' } });

async function wishesOf(cardId) {
  return db.all('SELECT name, message, created_at FROM wishes WHERE card_id = ? AND hidden = 0 ORDER BY id DESC LIMIT 200', [cardId]);
}

async function signaturesOf(cardId) {
  return db.all('SELECT name, data FROM signatures WHERE card_id = ? ORDER BY id DESC LIMIT 40', [cardId]);
}

/** Xem demo mẫu thiệp với dữ liệu mẫu */
router.get('/demo/:key', (req, res, next) => {
  if (!exists(req.params.key)) return next();
  const card = { id: 0, slug: 'demo', template: req.params.key, title: 'Demo', status: 'published' };
  const view = buildView(card, { data: demoData(), guestName: req.query.to || 'Bạn Thân Mến', preview: true });
  res.render('invitation/show', {
    layout: false,
    ...view,
    demo: true,
    wishes: [
      { name: 'Lan Anh', message: 'Chúc hai bạn trăm năm hạnh phúc, sớm có thiên thần nhỏ nhé!', created_at: Date.now() - 3600e3 },
      { name: 'Anh Tuấn', message: 'Chúc mừng hạnh phúc! Hẹn gặp hai em ở tiệc cưới.', created_at: Date.now() - 7200e3 },
    ],
    meta: { title: `Demo mẫu thiệp – SOBA` },
  });
});

router.get('/t/:slug', async (req, res, next) => {
  const card = await db.get('SELECT * FROM cards WHERE slug = ?', [clean(req.params.slug, 80)]);
  if (!card || card.status !== 'published') return next();
  const owner = await db.get('SELECT id, plan, plan_expires_at, role FROM users WHERE id = ?', [card.user_id]);
  const plan = planOf(owner);
  const d = parseData(card);
  const title = `Thiệp cưới ${d.groom.name} & ${d.bride.name}`;
  res.set('X-Robots-Tag', 'noindex');

  if (storageExpired(card, owner) || Number(card.views) >= plan.limits.views) {
    return res.status(410).render('invitation/paused', { layout: false, title, meta: { title } });
  }
  if (!BOT_RE.test(req.get('user-agent') || '')) {
    db.run('UPDATE cards SET views = views + 1 WHERE id = ?', [card.id]).catch(() => {});
  }
  if (card.kind === 'canvas') {
    return res.render('invitation/canvas', canvas.pageLocals(card, { owner, guestName: req.query.to || '', wishes: await wishesOf(card.id), signatures: await signaturesOf(card.id) }));
  }
  const view = buildView(card, { data: d, owner, guestName: req.query.to || '' });
  res.render('invitation/show', { layout: false, ...view, wishes: await wishesOf(card.id), meta: { title } });
});

/** Xem demo mẫu thiết kế tự do */
router.get('/demo-thiet-ke/:key', (req, res, next) => {
  const starter = canvas.starterOf(req.params.key);
  if (!starter) return next();
  const card = { id: 0, slug: 'demo', status: 'published' };
  res.render(
    'invitation/canvas',
    canvas.pageLocals(card, {
      doc: starter.doc,
      // Xem thử theo đúng gói của mẫu: mẫu miễn phí không có mở thiệp, thanh tiện ích, QR
      owner: { plan: starter.tier, plan_expires_at: Date.now() + 365 * 864e5 },
      guestName: req.query.to || 'Bạn Thân Mến',
      preview: true,
      demo: true,
      wishes: [
        { name: 'Lan Anh', message: 'Chúc hai bạn trăm năm hạnh phúc!', created_at: Date.now() - 3600e3 },
        { name: 'Anh Tuấn', message: 'Chúc mừng hạnh phúc! Hẹn gặp ở tiệc cưới.', created_at: Date.now() - 7200e3 },
      ],
    })
  );
});

/** Vài trang đầu của mẫu – để thẻ mẫu ở trang chủ/kho mẫu vẽ đúng giao diện đầu thiệp và cuộn khi rê chuột */
router.get('/api/mau-thiet-ke/:key/bia', (req, res) => {
  const starter = canvas.starterOf(req.params.key);
  if (!starter || !starter.doc) return res.status(404).json({ error: 'Không tìm thấy mẫu.' });
  const doc = canvas.viewDoc(starter.doc);
  const sections = [];
  let total = 0;
  for (const s of doc.sections) {
    if (sections.length >= 5 || total >= 3400) break;
    sections.push(s);
    total += s.h;
  }
  res.set('Cache-Control', 'public, max-age=3600');
  res.json({ doc: { ...doc, sections }, total });
});

async function publicCard(req, res) {
  const card = await db.get("SELECT id, data, status FROM cards WHERE slug = ? AND status = 'published'", [clean(req.params.slug, 80)]);
  if (!card) {
    res.status(404).json({ error: 'Không tìm thấy thiệp.' });
    return null;
  }
  return card;
}

router.post('/t/:slug/rsvp', express.json(), writeLimiter, async (req, res) => {
  const card = await publicCard(req, res);
  if (!card) return;
  const b = req.body || {};
  if (b.website) return res.json({ ok: true });
  const name = clean(b.name, 120);
  if (!name) return res.status(400).json({ error: 'Vui lòng nhập tên của bạn.' });
  const attending = ['yes', 'no', 'maybe'].includes(b.attending) ? b.attending : 'yes';
  const guests = Math.min(Math.max(parseInt(b.guests, 10) || 1, 1), 20);
  const side = ['groom', 'bride'].includes(b.side) ? b.side : null;
  await db.run('INSERT INTO rsvps (card_id, name, phone, attending, guests, side, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    card.id,
    name,
    clean(b.phone, 30),
    attending,
    attending === 'no' ? 0 : guests,
    side,
    clean(b.message, 1000),
    Date.now(),
  ]);
  res.json({ ok: true, message: attending === 'no' ? 'Cảm ơn bạn đã phản hồi. Rất tiếc vì bạn không thể đến!' : 'Cảm ơn bạn! Hẹn gặp bạn trong ngày vui nhé.' });
});

router.post('/t/:slug/loi-chuc', express.json(), writeLimiter, async (req, res) => {
  const card = await publicCard(req, res);
  if (!card) return;
  const b = req.body || {};
  if (b.website) return res.json({ ok: true });
  const name = clean(b.name, 120);
  const message = clean(b.message, 1000);
  if (!name || !message) return res.status(400).json({ error: 'Vui lòng nhập tên và lời chúc.' });
  // Gói Miễn phí không có sổ lời chúc
  const owner = await db.get('SELECT u.id, u.plan, u.plan_expires_at, u.role FROM users u JOIN cards c ON c.user_id = u.id WHERE c.id = ?', [card.id]);
  if (!planOf(owner).features.wishes) return res.status(403).json({ error: 'Thiệp này không nhận lời chúc.' });
  // Khách chọn "Chỉ cô dâu, chú rể" → lưu ẩn (chủ thiệp vẫn xem được ở trang Khách mời)
  const priv = b.visibility === 'private';
  await db.run('INSERT INTO wishes (card_id, name, message, hidden, created_at) VALUES (?, ?, ?, ?, ?)', [card.id, name, message, priv ? 1 : 0, Date.now()]);
  res.json({ ok: true, private: priv, wish: priv ? null : { name, message, created_at: Date.now() } });
});

// Ký tên lưu bút: ảnh PNG nét ký (data URL) + tên khách
const SIGN_RE = /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/;
router.post('/t/:slug/ky-ten', express.json({ limit: '120kb' }), writeLimiter, async (req, res) => {
  const card = await publicCard(req, res);
  if (!card) return;
  const b = req.body || {};
  if (b.website) return res.json({ ok: true });
  const name = clean(b.name, 60);
  const data = String(b.data || '');
  if (!name) return res.status(400).json({ error: 'Vui lòng nhập tên của bạn.' });
  if (!SIGN_RE.test(data) || data.length > 80000) return res.status(400).json({ error: 'Chữ ký không hợp lệ, bạn thử ký lại nhé.' });
  const n = Number((await db.get('SELECT COUNT(*) AS n FROM signatures WHERE card_id = ?', [card.id])).n);
  if (n >= 500) return res.status(400).json({ error: 'Thiệp đã nhận đủ chữ ký.' });
  await db.run('INSERT INTO signatures (card_id, name, data, created_at) VALUES (?, ?, ?, ?)', [card.id, name, data, Date.now()]);
  res.json({ ok: true, signature: { name, img: data } });
});

module.exports = router;
