'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../db');
const config = require('../config');
const { requireAuth, upload, AUDIO_TYPES } = require('../middleware');
const { TEMPLATES, getTemplate, exists } = require('../services/templates');
const { planOf, tierAllowed, effectivePlanKey, PLANS } = require('../services/plans');
const cards = require('../services/cards');
const canvas = require('../services/canvas');
const { BANKS } = require('../services/banks');
const { clean, formatDateTime } = require('../services/util');

const router = express.Router();

const cardUrl = (c) => `${config.appUrl}/t/${c.slug}`;

async function usage(user) {
  const [c, p] = await Promise.all([
    db.get('SELECT COUNT(*) AS n FROM cards WHERE user_id = ?', [user.id]),
    db.get("SELECT COUNT(*) AS n FROM uploads WHERE user_id = ? AND kind = 'image'", [user.id]),
  ]);
  return { cards: Number(c.n), photos: Number(p.n) };
}

async function loadCard(req, res, next) {
  const card = await cards.getOwnedCard(req.user, req.params.id);
  if (!card) {
    const e = new Error('Không tìm thấy thiệp.');
    e.status = 404;
    return next(e);
  }
  req.card = card;
  next();
}

// ===== Trang tổng quan =====
router.get('/tai-khoan', requireAuth, async (req, res) => {
  const list = await db.all('SELECT * FROM cards WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id]);
  const ids = list.map((c) => c.id);
  let rsvpStats = {};
  if (ids.length) {
    const rows = await db.all(
      `SELECT card_id, COUNT(*) AS n, SUM(CASE WHEN attending = 'yes' THEN guests ELSE 0 END) AS coming FROM rsvps WHERE card_id IN (${ids.map(() => '?').join(',')}) GROUP BY card_id`,
      ids
    );
    rsvpStats = Object.fromEntries(rows.map((r) => [r.card_id, { n: Number(r.n), coming: Number(r.coming || 0) }]));
  }
  res.render('dashboard/index', {
    layout: 'layouts/app',
    meta: { title: 'Thiệp của tôi – SOBA' },
    cards: list.map((c) => ({ ...c, d: cards.parseData(c), tpl: getTemplate(c.template), url: cardUrl(c), rsvp: rsvpStats[c.id] || { n: 0, coming: 0 } })),
    usage: await usage(req.user),
    planObj: planOf(req.user),
    planKey: effectivePlanKey(req.user),
  });
});

// ===== Tạo thiệp =====
router.get('/thiep/tao', requireAuth, (req, res) => {
  res.render('dashboard/create', {
    layout: 'layouts/app',
    meta: { title: 'Chọn mẫu thiệp – SOBA' },
    templates: [], // mẫu vẽ dạng form đã gỡ khỏi kho (18/11/2026)
    starters: canvas.STARTERS,
    planKey: effectivePlanKey(req.user),
    selected: req.query.mau || '',
  });
});

router.post('/thiep/tao', requireAuth, async (req, res) => {
  const key = exists(req.body.template) ? req.body.template : 'hong-phan';
  const plan = planOf(req.user);
  const tpl = getTemplate(key);
  const u = await usage(req.user);
  // Quản trị viên (thử nghiệm) không bị giới hạn số thiệp
  if (u.cards >= plan.limits.cards && req.user.role !== 'admin') {
    req.flash('error', `Gói ${plan.name} cho phép tối đa ${plan.limits.cards} thiệp. Nâng cấp để tạo thêm.`);
    return res.redirect('/bang-gia');
  }
  if (!tierAllowed(effectivePlanKey(req.user), tpl.tier)) {
    req.flash('error', `Mẫu “${tpl.name}” thuộc gói ${PLANS[tpl.tier].name}. Nâng cấp để sử dụng mẫu này.`);
    return res.redirect('/bang-gia');
  }
  const id = await cards.createCard(req.user, key);
  res.redirect(`/thiep/${id}/sua`);
});

// ===== Thiệp thiết kế tự do (canvas kéo thả) =====
router.post('/thiep/tao-thiet-ke', requireAuth, async (req, res) => {
  const plan = planOf(req.user);
  const u = await usage(req.user);
  // Quản trị viên (thử nghiệm) không bị giới hạn số thiệp
  if (u.cards >= plan.limits.cards && req.user.role !== 'admin') {
    req.flash('error', `Gói ${plan.name} cho phép tối đa ${plan.limits.cards} thiệp. Nâng cấp để tạo thêm.`);
    return res.redirect('/bang-gia');
  }
  const starter = canvas.starterOf(req.body.starter);
  if (starter && !tierAllowed(effectivePlanKey(req.user), starter.tier)) {
    req.flash('error', `Mẫu “${starter.name}” thuộc gói ${PLANS[starter.tier].name}.`);
    return res.redirect('/bang-gia');
  }
  const doc = starter ? starter.doc : canvas.blankDoc();
  const now = Date.now();
  const title = `${doc.groom.name} & ${doc.bride.name}`;
  const slug = await cards.uniqueSlug(`${doc.groom.name} ${doc.bride.name}`);
  const r = await db.run(
    "INSERT INTO cards (user_id, slug, template, title, data, status, views, is_showcase, created_at, updated_at, kind) VALUES (?, ?, ?, ?, ?, 'draft', 0, 0, ?, ?, 'canvas')",
    [req.user.id, slug, starter ? starter.key : 'trang', title, JSON.stringify(doc), now, now]
  );
  res.redirect(`/thiep/${r.insertId}/thiet-ke`);
});

router.get('/thiep/:id/thiet-ke', requireAuth, loadCard, async (req, res) => {
  const card = req.card;
  if (card.kind !== 'canvas') return res.redirect(`/thiep/${card.id}/sua`);
  const doc = canvas.parseDoc(card);
  const plan = planOf(req.user);
  res.render('dashboard/designer', {
    layout: false,
    meta: { title: 'Thiết kế thiệp – SOBA' },
    card,
    url: cardUrl(card),
    boot: canvas.safeJson({
      id: card.id,
      status: card.status,
      url: cardUrl(card),
      doc,
      fonts: canvas.FONTS,
      banks: canvas.BANKS.map((b) => ({ bin: b.bin, name: b.name })),
      plan: { name: plan.name, customMusic: plan.features.customMusic, photos: plan.limits.photos, effects: plan.features.effects, gift: plan.features.gift },
      openers: canvas.OPENERS,
      falls: canvas.FALLS,
      songs: canvas.SONGS.map((s) => ({ key: s.key, name: s.name, url: s.url })),
      starters: canvas.STARTERS.map((s) => ({ key: s.key, name: s.name })),
    }),
  });
});

router.post('/api/thiep/:id/thiet-ke', requireAuth, loadCard, async (req, res) => {
  const card = req.card;
  if (card.kind !== 'canvas') return res.status(400).json({ error: 'Thiệp này không dùng trình thiết kế.' });
  const doc = canvas.sanitizeDoc(req.body.doc);
  if (doc.music.url && doc.music.url.startsWith('/uploads/') && !planOf(req.user).features.customMusic) doc.music.url = '';
  const title = `${doc.groom.name || 'Chú rể'} & ${doc.bride.name || 'Cô dâu'}`;
  await db.run('UPDATE cards SET data = ?, title = ?, updated_at = ? WHERE id = ?', [JSON.stringify(doc), title, Date.now(), card.id]);
  res.json({ ok: true, savedAt: Date.now() });
});

/** Thư viện ảnh đã tải lên của thiệp */
router.get('/api/thiep/:id/anh', requireAuth, loadCard, async (req, res) => {
  const rows = await db.all("SELECT file FROM uploads WHERE card_id = ? AND kind = 'image' ORDER BY id DESC LIMIT 200", [req.card.id]);
  res.json({ files: rows.map((r) => `/uploads/${r.file}`) });
});

// ===== Trình chỉnh sửa =====
router.get('/thiep/:id/sua', requireAuth, loadCard, async (req, res) => {
  const card = req.card;
  if (card.kind === 'canvas') return res.redirect(`/thiep/${card.id}/thiet-ke`);
  res.render('dashboard/editor', {
    layout: 'layouts/app',
    bodyClass: 'is-editor',
    meta: { title: 'Chỉnh sửa thiệp – SOBA' },
    card,
    data: cards.parseData(card),
    templates: TEMPLATES,
    banks: BANKS,
    planKey: effectivePlanKey(req.user),
    planObj: planOf(req.user),
    url: cardUrl(card),
    usage: await usage(req.user),
  });
});

router.get('/thiep/:id/xem-truoc', requireAuth, loadCard, async (req, res) => {
  if (req.card.kind === 'canvas') {
    const wishes = await db.all('SELECT name, message, created_at FROM wishes WHERE card_id = ? AND hidden = 0 ORDER BY id DESC LIMIT 50', [req.card.id]);
    res.set('Cache-Control', 'no-store');
    return res.render('invitation/canvas', canvas.pageLocals(req.card, { owner: req.user, guestName: req.query.to || 'Tên khách mời', preview: true, wishes }));
  }
  const view = cards.buildView(req.card, { owner: req.user, guestName: req.query.to || 'Tên khách mời', preview: true });
  const wishes = await db.all('SELECT name, message, created_at FROM wishes WHERE card_id = ? AND hidden = 0 ORDER BY id DESC LIMIT 50', [req.card.id]);
  res.set('Cache-Control', 'no-store');
  res.render('invitation/show', { layout: false, ...view, wishes, meta: { title: 'Xem trước thiệp' } });
});

router.post('/api/thiep/:id', requireAuth, loadCard, async (req, res) => {
  const card = req.card;
  const current = cards.parseData(card);
  const data = cards.sanitizeData(req.body.data, current);
  let template = card.template;
  if (req.body.template && exists(req.body.template) && req.body.template !== card.template) {
    const tpl = getTemplate(req.body.template);
    if (!tierAllowed(effectivePlanKey(req.user), tpl.tier)) {
      return res.status(403).json({ error: `Mẫu “${tpl.name}” cần gói ${PLANS[tpl.tier].name}.`, upgrade: true });
    }
    template = tpl.key;
  }
  // Nhạc tự tải lên chỉ dành cho gói trả phí
  if (data.music.url && data.music.url.startsWith('/uploads/') && !planOf(req.user).features.customMusic) data.music.url = '';
  const title = `${data.groom.name || 'Chú rể'} & ${data.bride.name || 'Cô dâu'}`;
  await db.run('UPDATE cards SET data = ?, template = ?, title = ?, updated_at = ? WHERE id = ?', [JSON.stringify(data), template, title, Date.now(), card.id]);
  res.json({ ok: true, savedAt: Date.now() });
});

router.post('/api/thiep/:id/xuat-ban', requireAuth, loadCard, async (req, res) => {
  const publish = req.body.publish !== false && req.body.publish !== 'false';
  const card = req.card;
  // Lần xuất bản đầu tiên: tạo lại đường link theo tên thật của cô dâu chú rể
  if (publish && !card.published_at) {
    const d = cards.parseData(card);
    card.slug = await cards.uniqueSlug(`${d.groom.name} ${d.bride.name}`);
    await db.run('UPDATE cards SET slug = ? WHERE id = ?', [card.slug, card.id]);
  }
  await db.run('UPDATE cards SET status = ?, published_at = COALESCE(published_at, ?), updated_at = ? WHERE id = ?', [
    publish ? 'published' : 'draft',
    publish ? Date.now() : null,
    Date.now(),
    card.id,
  ]);
  res.json({ ok: true, status: publish ? 'published' : 'draft', url: cardUrl(card) });
});

router.post('/thiep/:id/xoa', requireAuth, loadCard, async (req, res) => {
  const id = req.card.id;
  const files = await db.all('SELECT file FROM uploads WHERE card_id = ?', [id]);
  for (const t of ['rsvps', 'wishes', 'guests', 'uploads', 'signatures']) await db.run(`DELETE FROM ${t} WHERE card_id = ?`, [id]);
  await db.run('DELETE FROM cards WHERE id = ?', [id]);
  for (const f of files) fs.unlink(path.join(config.uploadDir, f.file), () => {});
  req.flash('success', 'Đã xoá thiệp.');
  res.redirect('/tai-khoan');
});

router.post('/thiep/:id/nhan-ban', requireAuth, loadCard, async (req, res) => {
  const plan = planOf(req.user);
  const u = await usage(req.user);
  // Quản trị viên (thử nghiệm) không bị giới hạn số thiệp
  if (u.cards >= plan.limits.cards && req.user.role !== 'admin') {
    req.flash('error', `Gói ${plan.name} cho phép tối đa ${plan.limits.cards} thiệp.`);
    return res.redirect('/tai-khoan');
  }
  const src = req.card;
  const now = Date.now();
  const slug = await cards.uniqueSlug(src.title);
  await db.run('INSERT INTO cards (user_id, slug, template, title, data, status, views, is_showcase, created_at, updated_at, kind) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)', [
    req.user.id,
    slug,
    src.template,
    `${src.title} (bản sao)`,
    src.data,
    'draft',
    now,
    now,
    src.kind || 'form',
  ]);
  req.flash('success', 'Đã nhân bản thiệp.');
  res.redirect('/tai-khoan');
});

// ===== Tải ảnh / nhạc =====
router.post('/api/thiep/:id/tai-len', requireAuth, loadCard, upload.array('files', 20), async (req, res) => {
  const files = req.files || [];
  const plan = planOf(req.user);
  const u = await usage(req.user);
  const out = [];
  let skipped = 0;
  let photos = u.photos;
  for (const f of files) {
    const isAudio = Boolean(AUDIO_TYPES[f.mimetype]);
    const rel = `${f._sub}/${f.filename}`;
    const reject = isAudio ? !plan.features.customMusic : photos >= plan.limits.photos;
    if (reject) {
      skipped++;
      fs.unlink(f.path, () => {});
      continue;
    }
    if (!isAudio) photos++;
    await db.run('INSERT INTO uploads (user_id, card_id, file, kind, size, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
      req.user.id,
      req.card.id,
      rel,
      isAudio ? 'audio' : 'image',
      f.size,
      Date.now(),
    ]);
    out.push({ url: `/uploads/${rel}`, kind: isAudio ? 'audio' : 'image' });
  }
  let warning = '';
  if (skipped) {
    warning = files.some((f) => AUDIO_TYPES[f.mimetype]) && !plan.features.customMusic
      ? 'Tải nhạc riêng chỉ có ở gói Basic trở lên.'
      : `Đã đạt giới hạn ${plan.limits.photos} ảnh của gói ${plan.name}. Nâng cấp để tải thêm.`;
  }
  res.json({ ok: true, files: out, warning, photos, limit: plan.limits.photos });
});

// ===== Khách mời, RSVP, lời chúc =====
router.get('/thiep/:id/khach-moi', requireAuth, loadCard, async (req, res) => {
  const id = req.card.id;
  const [guests, rsvps, wishes, signatures] = await Promise.all([
    db.all('SELECT * FROM guests WHERE card_id = ? ORDER BY id DESC', [id]),
    db.all('SELECT * FROM rsvps WHERE card_id = ? ORDER BY id DESC', [id]),
    db.all('SELECT * FROM wishes WHERE card_id = ? ORDER BY id DESC', [id]),
    db.all('SELECT * FROM signatures WHERE card_id = ? ORDER BY id DESC', [id]),
  ]);
  const stat = {
    yes: rsvps.filter((r) => r.attending === 'yes').length,
    no: rsvps.filter((r) => r.attending === 'no').length,
    maybe: rsvps.filter((r) => r.attending === 'maybe').length,
    people: rsvps.filter((r) => r.attending === 'yes').reduce((s, r) => s + Number(r.guests || 0), 0),
  };
  res.render('dashboard/guests', {
    layout: 'layouts/app',
    meta: { title: 'Khách mời & phản hồi – SOBA' },
    card: req.card,
    d: cards.parseData(req.card),
    url: cardUrl(req.card),
    guests,
    rsvps,
    wishes,
    signatures,
    stat,
    tab: ['khach', 'phan-hoi', 'loi-chuc', 'chu-ky'].includes(req.query.tab) ? req.query.tab : 'khach',
    planObj: planOf(req.user),
    formatDateTime,
  });
});

router.post('/thiep/:id/khach-moi', requireAuth, loadCard, async (req, res) => {
  const plan = planOf(req.user);
  const names = String(req.body.names || '')
    .split(/\r?\n/)
    .map((n) => clean(n, 120))
    .filter(Boolean);
  const group = clean(req.body.group, 60);
  const count = Number((await db.get('SELECT COUNT(*) AS n FROM guests WHERE card_id = ?', [req.card.id])).n);
  const room = Math.max(plan.limits.guests - count, 0);
  const add = names.slice(0, room);
  for (const n of add) await db.run('INSERT INTO guests (card_id, name, group_name, created_at) VALUES (?, ?, ?, ?)', [req.card.id, n, group, Date.now()]);
  if (add.length < names.length) req.flash('error', `Gói ${plan.name} giới hạn ${plan.limits.guests} khách mời. Đã thêm ${add.length}/${names.length}.`);
  else if (add.length) req.flash('success', `Đã thêm ${add.length} khách mời.`);
  res.redirect(`/thiep/${req.card.id}/khach-moi`);
});

router.post('/thiep/:id/khach-moi/:gid/xoa', requireAuth, loadCard, async (req, res) => {
  await db.run('DELETE FROM guests WHERE id = ? AND card_id = ?', [Number(req.params.gid) || 0, req.card.id]);
  res.redirect(`/thiep/${req.card.id}/khach-moi`);
});

router.post('/thiep/:id/chu-ky/:sid/xoa', requireAuth, loadCard, async (req, res) => {
  await db.run('DELETE FROM signatures WHERE id = ? AND card_id = ?', [Number(req.params.sid) || 0, req.card.id]);
  res.redirect(`/thiep/${req.card.id}/khach-moi?tab=chu-ky`);
});

router.post('/thiep/:id/loi-chuc/:wid/an', requireAuth, loadCard, async (req, res) => {
  await db.run('UPDATE wishes SET hidden = 1 - hidden WHERE id = ? AND card_id = ?', [Number(req.params.wid) || 0, req.card.id]);
  res.redirect(`/thiep/${req.card.id}/khach-moi?tab=loi-chuc`);
});

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s; // chống CSV injection
  return `"${s.replace(/"/g, '""')}"`;
};

router.get('/thiep/:id/phan-hoi.csv', requireAuth, loadCard, async (req, res) => {
  const rows = await db.all('SELECT * FROM rsvps WHERE card_id = ? ORDER BY id', [req.card.id]);
  const label = { yes: 'Tham dự', no: 'Không tham dự', maybe: 'Chưa chắc' };
  const side = { groom: 'Nhà trai', bride: 'Nhà gái' };
  const lines = [['Họ tên', 'Điện thoại', 'Phản hồi', 'Số người', 'Khách của', 'Lời nhắn', 'Thời gian'].map(csvCell).join(',')].concat(
    rows.map((r) => [r.name, r.phone, label[r.attending], r.guests, side[r.side] || '', r.message, formatDateTime(r.created_at)].map(csvCell).join(','))
  );
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="phan-hoi-${req.card.slug}.csv"`);
  res.send('﻿' + lines.join('\r\n'));
});

// ===== Cài đặt tài khoản =====
router.get('/tai-khoan/cai-dat', requireAuth, (req, res) => {
  res.render('dashboard/settings', { layout: 'layouts/app', meta: { title: 'Cài đặt tài khoản – SOBA' } });
});

router.post('/tai-khoan/cai-dat', requireAuth, async (req, res) => {
  const name = clean(req.body.name, 120);
  if (name) await db.run('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
  const pw = String(req.body.new_password || '');
  if (pw) {
    if (pw.length < 8) {
      req.flash('error', 'Mật khẩu mới cần tối thiểu 8 ký tự.');
      return res.redirect('/tai-khoan/cai-dat');
    }
    if (req.user.password_hash && !(await bcrypt.compare(String(req.body.current_password || ''), req.user.password_hash))) {
      req.flash('error', 'Mật khẩu hiện tại không đúng.');
      return res.redirect('/tai-khoan/cai-dat');
    }
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(pw, 11), req.user.id]);
  }
  req.flash('success', 'Đã lưu thay đổi.');
  res.redirect('/tai-khoan/cai-dat');
});

module.exports = router;
