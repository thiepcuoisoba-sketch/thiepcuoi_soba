'use strict';
const db = require('../db');
const { clean, slugify, randomCode, isSafeUrl, parseDate, formatDateVi, mapEmbedUrl, mapLink } = require('./util');
const { getTemplate, exists: templateExists } = require('./templates');
const { bankByBin, vietQrUrl } = require('./banks');
const { PLANS, planOf } = require('./plans');

const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const SECTION_KEYS = ['countdown', 'couple', 'story', 'events', 'album', 'rsvp', 'wishes', 'gift'];

function defaultData() {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  const iso = isoLocal(d);
  return {
    groom: { name: 'Minh Anh', father: '', mother: '', intro: '' },
    bride: { name: 'Thu Hà', father: '', mother: '', intro: '' },
    headline: 'Save the date',
    invitation: 'Trân trọng kính mời',
    message: 'Tới dự buổi tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện của bạn là niềm vinh hạnh lớn nhất trong ngày hạnh phúc này.',
    date: iso,
    time: '11:00',
    lunarDate: '',
    events: [
      { title: 'Lễ Thành Hôn', date: iso, time: '09:00', venue: 'Tư gia nhà trai', address: '' , mapUrl: '' },
      { title: 'Tiệc Cưới', date: iso, time: '11:00', venue: 'Trung tâm tiệc cưới', address: '', mapUrl: '' },
    ],
    story: [
      { year: '', title: 'Lần đầu gặp gỡ', text: 'Chúng mình gặp nhau vào một ngày rất bình thường, nhưng từ đó mọi ngày đều trở nên đặc biệt.' },
    ],
    quote: 'Yêu là cùng nhau nhìn về một hướng.',
    photos: { cover: '', groom: '', bride: '' },
    album: [],
    music: { url: '', autoplay: true },
    gift: {
      groom: { bin: '', accountNo: '', accountName: '' },
      bride: { bin: '', accountNo: '', accountName: '' },
    },
    rsvpDeadline: '',
    sections: Object.fromEntries(SECTION_KEYS.map((k) => [k, true])),
    effects: { petals: true },
    accent: '',
  };
}

/** Dữ liệu mẫu đẹp dùng cho trang xem trước mẫu thiệp & trang chủ */
function demoData() {
  const d = defaultData();
  const date = new Date();
  date.setMonth(date.getMonth() + 2);
  date.setDate(18);
  const iso = isoLocal(date);
  return {
    ...d,
    groom: { name: 'Đức Minh', father: 'Ông Nguyễn Văn Hùng', mother: 'Bà Trần Thị Lan', intro: 'Kỹ sư phần mềm, mê cà phê sáng và những chuyến đi xa.' },
    bride: { name: 'Bảo Ngọc', father: 'Ông Lê Quang Vinh', mother: 'Bà Phạm Thị Hoa', intro: 'Cô giáo mầm non, yêu hoa hồng và những bản nhạc nhẹ.' },
    date: iso,
    time: '11:00',
    lunarDate: 'Nhằm ngày 28 tháng 10 năm Bính Ngọ',
    events: [
      { title: 'Lễ Vu Quy', date: iso, time: '08:30', venue: 'Tư gia nhà gái', address: '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', mapUrl: '' },
      { title: 'Tiệc Cưới', date: iso, time: '11:00', venue: 'Trung tâm Hội nghị Tiệc cưới', address: '8 Hoàng Văn Thụ, Phú Nhuận, TP. Hồ Chí Minh', mapUrl: '' },
    ],
    story: [
      { year: '2019', title: 'Lần đầu gặp gỡ', text: 'Một buổi chiều mưa ở quán cà phê nhỏ, hai người lạ cùng chờ mưa tạnh.' },
      { year: '2022', title: 'Lời tỏ tình', text: 'Dưới ánh đèn Đà Lạt, anh nói câu mà cả hai đã chờ đợi từ lâu.' },
      { year: '2025', title: 'Lời cầu hôn', text: 'Một chiếc nhẫn, một bó hồng và cái gật đầu trong nước mắt.' },
    ],
    gift: {
      groom: { bin: '970422', accountNo: '0123456789', accountName: 'NGUYEN DUC MINH' },
      bride: { bin: '970436', accountNo: '9876543210', accountName: 'LE BAO NGOC' },
    },
  };
}

/** Làm sạch dữ liệu từ trình chỉnh sửa – chỉ giữ trường hợp lệ */
function sanitizeData(input = {}, current = defaultData()) {
  const d = defaultData();
  const src = typeof input === 'object' && input ? input : {};
  const person = (p = {}) => ({
    name: clean(p.name, 60),
    father: clean(p.father, 80),
    mother: clean(p.mother, 80),
    intro: clean(p.intro, 300),
  });
  const url = (u) => (isSafeUrl(clean(u, 500)) ? clean(u, 500) : '');
  const dateStr = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : '');
  const timeStr = (v) => (/^\d{1,2}:\d{2}$/.test(v || '') ? v : '');
  const bank = (b = {}) => ({
    bin: bankByBin(clean(b.bin, 10)) ? clean(b.bin, 10) : '',
    accountNo: clean(b.accountNo, 30).replace(/[^0-9A-Za-z]/g, ''),
    accountName: clean(b.accountName, 60).toUpperCase(),
  });

  const out = {
    groom: person(src.groom),
    bride: person(src.bride),
    headline: clean(src.headline, 60),
    invitation: clean(src.invitation, 80) || d.invitation,
    message: clean(src.message, 600),
    date: dateStr(src.date) || current.date || d.date,
    time: timeStr(src.time) || '11:00',
    lunarDate: clean(src.lunarDate, 100),
    events: (Array.isArray(src.events) ? src.events : [])
      .slice(0, 4)
      .map((e = {}) => ({
        title: clean(e.title, 60),
        date: dateStr(e.date),
        time: timeStr(e.time),
        venue: clean(e.venue, 120),
        address: clean(e.address, 200),
        mapUrl: url(e.mapUrl),
      }))
      .filter((e) => e.title || e.venue || e.address),
    story: (Array.isArray(src.story) ? src.story : [])
      .slice(0, 8)
      .map((s = {}) => ({ year: clean(s.year, 20), title: clean(s.title, 80), text: clean(s.text, 500) }))
      .filter((s) => s.title || s.text),
    quote: clean(src.quote, 200),
    photos: {
      cover: url(src.photos && src.photos.cover),
      groom: url(src.photos && src.photos.groom),
      bride: url(src.photos && src.photos.bride),
    },
    album: (Array.isArray(src.album) ? src.album : []).map(url).filter(Boolean).slice(0, 100),
    music: { url: url(src.music && src.music.url), autoplay: !(src.music && src.music.autoplay === false) },
    gift: { groom: bank(src.gift && src.gift.groom), bride: bank(src.gift && src.gift.bride) },
    rsvpDeadline: dateStr(src.rsvpDeadline),
    sections: Object.fromEntries(SECTION_KEYS.map((k) => [k, !(src.sections && src.sections[k] === false)])),
    effects: { petals: !(src.effects && src.effects.petals === false) },
    accent: /^#[0-9a-fA-F]{6}$/.test(src.accent || '') ? src.accent : '',
  };
  return out;
}

function parseData(card) {
  try {
    return { ...defaultData(), ...JSON.parse(card.data || '{}') };
  } catch {
    return defaultData();
  }
}

async function uniqueSlug(base) {
  const root = slugify(base, 40) || 'thiep-cuoi';
  for (let i = 0; i < 6; i++) {
    const slug = `${root}-${randomCode(4)}`;
    const hit = await db.get('SELECT id FROM cards WHERE slug = ?', [slug]);
    if (!hit) return slug;
  }
  return `${root}-${randomCode(8)}`;
}

async function createCard(user, templateKey) {
  const data = defaultData();
  const now = Date.now();
  const title = `${data.groom.name} & ${data.bride.name}`;
  const slug = await uniqueSlug(`${data.groom.name} ${data.bride.name}`);
  const res = await db.run(
    'INSERT INTO cards (user_id, slug, template, title, data, status, views, is_showcase, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)',
    [user.id, slug, templateExists(templateKey) ? templateKey : 'hong-phan', title, JSON.stringify(data), 'draft', now, now]
  );
  return res.insertId;
}

async function getOwnedCard(user, id) {
  const card = await db.get('SELECT * FROM cards WHERE id = ?', [Number(id) || 0]);
  if (!card) return null;
  if (Number(card.user_id) !== Number(user.id) && user.role !== 'admin') return null;
  return card;
}

/** Thời điểm thiệp hết hạn lưu trữ dựa vào gói của chủ thiệp */
function storageExpired(card, owner) {
  const plan = planOf(owner);
  const start = Number(card.published_at || card.created_at);
  return Date.now() > start + plan.limits.storageMonths * 30 * 24 * 3600 * 1000;
}

/** Dữ liệu hiển thị cho trang thiệp (đã tính sẵn mọi thứ view cần) */
function buildView(card, { data, owner, guestName = '', preview = false } = {}) {
  const tpl = getTemplate(card.template);
  const d = data || parseData(card);
  const plan = owner ? planOf(owner) : PLANS.premium;
  const main = parseDate(d.date, d.time);
  const theme = { ...tpl.theme };
  if (d.accent) theme.accent = d.accent;
  const gifts = (plan.features.gift ? ['groom', 'bride'] : [])
    .map((side) => {
      const g = d.gift[side] || {};
      const bank = bankByBin(g.bin);
      if (!bank || !g.accountNo) return null;
      return {
        side,
        label: side === 'groom' ? 'Mừng cưới chú rể' : 'Mừng cưới cô dâu',
        bankName: bank.name,
        accountNo: g.accountNo,
        accountName: g.accountName,
        qr: vietQrUrl({ bank: g.bin, accountNo: g.accountNo, accountName: g.accountName, note: 'Mung cuoi ' + (d[side].name || ''), template: 'compact' }),
      };
    })
    .filter(Boolean);

  return {
    card,
    tpl,
    theme,
    d,
    preview,
    guestName: clean(guestName, 60),
    watermark: plan.features.watermark,
    effects: plan.features.effects && d.effects.petals,
    mainDate: main ? main.toISOString() : '',
    mainDateText: formatDateVi(main),
    dateParts: main ? { day: String(main.getDate()).padStart(2, '0'), month: String(main.getMonth() + 1).padStart(2, '0'), year: main.getFullYear(), time: d.time } : null,
    events: d.events.map((e) => ({
      ...e,
      dateText: formatDateVi(parseDate(e.date || d.date)),
      embed: mapEmbedUrl(e.address),
      link: mapLink(e.address, e.mapUrl),
    })),
    gifts,
    show: (k) => d.sections[k] !== false,
  };
}

module.exports = { SECTION_KEYS, defaultData, demoData, sanitizeData, parseData, uniqueSlug, createCard, getOwnedCard, storageExpired, buildView };
