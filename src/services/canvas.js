'use strict';
/**
 * Thiệp dạng canvas (editor kéo thả tự do).
 * Một thiệp = nhiều "trang" (section) xếp dọc, mỗi trang chứa các phần tử đặt tự do
 * (chữ, ảnh, hình, tiện ích) theo toạ độ thiết kế rộng W = 420px.
 * Toàn bộ dữ liệu lưu dạng JSON trong cột cards.data; cột cards.kind = 'canvas'.
 */
const { clean, isSafeUrl, parseDate, formatDateVi } = require('./util');
const { FONT_SPEC, fontsUrl } = require('./templates');
const { BANKS, bankByBin, vietQrUrl } = require('./banks');
const { PLANS, planOf } = require('./plans');

const W = 420;
const FONTS = Object.keys(FONT_SPEC);
const WIDGETS = ['countdown', 'calendar', 'map', 'rsvp', 'wishes', 'gift', 'album', 'call', 'signature', 'dresscode', 'addcal'];
const SHAPES = ['rect', 'circle', 'line', 'heart', 'star', 'ring', 'tri'];
/** Giai điệu nhạc nền gốc của SOBA (phát bằng Web Audio, xem public/js/soba-music.js) */
const MELODIES = [
  { key: 'nang-mai', name: 'Nắng Mai' },
  { key: 'hen-uoc', name: 'Hẹn Ước (valse)' },
  { key: 'buoc-chan-vui', name: 'Bước Chân Vui' },
  { key: 'chieu-bien', name: 'Chiều Biển' },
  { key: 'hoa-co', name: 'Hoa Cỏ' },
  { key: 'dem-sao', name: 'Đêm Sao' },
  { key: 'song-hy', name: 'Song Hỷ' },
];
/**
 * Thư viện nhạc cưới (tệp trong public/music). Chủ dự án xác nhận đã có giấy phép sử dụng (17/11/2026).
 * Thêm bài: chép tệp vào public/music rồi thêm một dòng ở đây.
 */
const SONGS = [
  { key: 'a-thousand-years', name: 'A Thousand Years – Christina Perri', file: 'a-thousand-years.m4a' },
  { key: 'beautiful-in-white', name: 'Beautiful in White (hoà tấu)', file: 'beautiful-in-white.mp3' },
  { key: 'canon-in-d', name: 'Canon in D (violin)', file: 'canon-in-d.mp3' },
  { key: 'marry-you', name: 'Marry You – Bruno Mars', file: 'marry-you.m4a' },
  { key: 'cant-stop-the-feeling', name: 'Can’t Stop the Feeling – Justin Timberlake', file: 'cant-stop-the-feeling.m4a' },
  { key: 'beautiful-girl', name: 'Beautiful Girl – SKULL & HAHA ft. 10cm', file: 'beautiful-girl.mp3' },
  { key: 'em-dong-y', name: 'Em Đồng Ý (I Do) – Đức Phúc x 911', file: 'em-dong-y.m4a' },
  { key: 'i-do', name: 'I Do – 911', file: 'i-do.mp3' },
  { key: 'mai-mai-ben-nhau', name: 'Mãi Mãi Bên Nhau – Noo Phước Thịnh', file: 'mai-mai-ben-nhau.mp3' },
  { key: 'le-duong', name: 'Lễ Đường – Kai Đinh', file: 'le-duong.mp3' },
  { key: 'vay-cuoi', name: 'Váy Cưới (cover)', file: 'vay-cuoi.mp3' },
  { key: 'bai-nay-khong-de-di-dien', name: 'Bài Này Không Để Đi Diễn – Anh Tú', file: 'bai-nay-khong-de-di-dien.m4a' },
  { key: 'nhac-cuoi-nhe-nhang', name: 'Nhạc cưới nhẹ nhàng', file: 'nhac-cuoi-nhe-nhang.mp3' },
  // Thêm 18/11/2026 (chủ dự án xác nhận có giấy phép)
  { key: 'ben-do-hanh-phuc', name: 'Bến Đỗ Hạnh Phúc – Xanh', file: 'ben-do-hanh-phuc.mp3' },
  { key: 'love-like-a-dream', name: 'Love Like a Dream – Salotune', file: 'love-like-a-dream.mp3' },
  { key: 'the-gioi-cua-anh', name: 'Thế Giới Của Anh (piano)', file: 'the-gioi-cua-anh.mp3' },
  { key: 'thanh-than', name: 'Thành Thân – Vương Bình', file: 'thanh-than.mp3' },
  { key: 'canon-in-love', name: 'Canon In Love', file: 'canon-in-love.mp3' },
].map((s) => ({ ...s, url: '/music/' + s.file }));
const songUrl = (key) => (SONGS.find((s) => s.key === key) || {}).url || '';
const musicUrl = (u) => {
  const s = clean(u, 500);
  if (s.startsWith('/music/')) return SONGS.some((x) => x.url === s) ? s : '';
  const m = /^builtin:([a-z0-9-]{1,30})$/.exec(s);
  if (m) return MELODIES.some((x) => x.key === m[1]) ? s : '';
  return url(s);
};
/** Kiểu màn mở thiệp (gói Basic trở lên) – xem public/js/canvas-guest.js */
const OPENERS = [
  { key: 'none', name: 'Không dùng' },
  { key: 'envelope', name: 'Phong bì dấu sáp' },
  { key: 'fingerprint', name: 'Chạm vân tay – rèm mở' },
  { key: 'doors', name: 'Cửa hai cánh' },
  { key: 'book', name: 'Lật bìa thiệp' },
  { key: 'curtain', name: 'Rèm lụa & bướm bay' },
  { key: 'stars', name: 'Bầu trời sao rơi' },
  { key: 'stamp', name: 'Cửa giấy – ấn đỏ có ảnh' },
  { key: 'letter', name: 'Phong thư – ảnh trượt lên' },
  { key: 'ribbon', name: 'Tháo nơ lụa' },
  { key: 'news', name: 'Tờ báo tin vui' },
  { key: 'oval', name: 'Khung ảnh oval' },
];
const OPENER_KEYS = OPENERS.map((o) => o.key);
// spin: xoay liên tục (đĩa nhạc) – chạy khi nhạc đang phát
const ANIMS = ['none', 'fade', 'up', 'down', 'left', 'right', 'zoom', 'rise', 'spin'];
// blur: ảnh nền làm mờ cho thẻ kính mờ
const FILTERS = ['none', 'warm', 'bw', 'film', 'soft', 'blur'];
/** Hiệu ứng rơi trên trang khách (gói Basic+) */
const FALLS = ['petals', 'leaves', 'hearts', 'sparkle', 'snow'];
const LIMITS = { sections: 20, elements: 80, album: 30, text: 2000 };

// ===== Hàm làm sạch =====
const num = (v, min, max, def) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.round(Math.min(Math.max(n, min), max) * 100) / 100;
};
const bool = (v) => v === true;
const pick = (v, list, def) => (list.includes(v) ? v : def);
const color = (v, def = '') => (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(v || '') ? v : def);
const url = (u) => {
  const s = clean(u, 500);
  return isSafeUrl(s) ? s : '';
};
const id = (v) => (/^[a-z0-9]{1,16}$/i.test(v || '') ? v : Math.random().toString(36).slice(2, 10));
const dateStr = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : '');
const timeStr = (v) => (/^\d{1,2}:\d{2}$/.test(v || '') ? v : '');
const bank = (b = {}) => ({
  bin: bankByBin(clean(b.bin, 10)) ? clean(b.bin, 10) : '',
  accountNo: clean(b.accountNo, 30).replace(/[^0-9A-Za-z]/g, ''),
  accountName: clean(b.accountName, 60).toUpperCase(),
});

function sanitizeElement(e = {}) {
  const type = pick(e.type, ['text', 'image', 'shape', 'widget'], null);
  if (!type) return null;
  const base = {
    id: id(e.id),
    type,
    x: num(e.x, -2000, 4000, 0),
    y: num(e.y, -2000, 8000, 0),
    w: num(e.w, 4, 4000, 100),
    h: num(e.h, 1, 8000, 40),
    r: num(e.r, -360, 360, 0),
    o: num(e.o, 0, 1, 1),
    lock: bool(e.lock),
    anim: pick(e.anim, ANIMS, 'none'),
    delay: num(e.delay, 0, 5, 0),
  };
  if (type === 'text') {
    return {
      ...base,
      text: String(e.text ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, LIMITS.text),
      font: pick(e.font, FONTS, 'Be Vietnam Pro'),
      size: num(e.size, 6, 200, 18),
      color: color(e.color, '#333333'),
      bg: color(e.bg),
      align: pick(e.align, ['left', 'center', 'right', 'justify'], 'center'),
      bold: bool(e.bold),
      italic: bool(e.italic),
      underline: bool(e.underline),
      upper: bool(e.upper),
      lh: num(e.lh, 0.8, 3, 1.35),
      ls: num(e.ls, -5, 30, 0),
      shadow: bool(e.shadow),
    };
  }
  if (type === 'image') {
    return {
      ...base,
      src: url(e.src),
      zoom: num(e.zoom, 1, 4, 1),
      ox: num(e.ox, 0, 100, 50),
      oy: num(e.oy, 0, 100, 50),
      radius: num(e.radius, 0, 500, 0),
      mask: pick(e.mask, ['rect', 'circle', 'arch'], 'rect'),
      border: num(e.border, 0, 30, 0),
      borderColor: color(e.borderColor, '#ffffff'),
      shadow: bool(e.shadow),
      filter: pick(e.filter, FILTERS, 'none'),
    };
  }
  if (type === 'shape') {
    return {
      ...base,
      shape: pick(e.shape, SHAPES, 'rect'),
      fill: color(e.fill),
      stroke: color(e.stroke),
      sw: num(e.sw, 0, 30, 0),
      radius: num(e.radius, 0, 500, 0),
      grad: pick(e.grad, ['', 'down', 'up'], ''),
      shadow: bool(e.shadow),
    };
  }
  // Tiện ích
  const widget = pick(e.widget, WIDGETS, null);
  if (!widget) return null;
  const out = {
    ...base,
    widget,
    color: color(e.color, '#c0392b'),
    textColor: color(e.textColor, '#333333'),
    bg: color(e.bg),
    font: pick(e.font, FONTS, 'Be Vietnam Pro'),
  };
  if (widget === 'map') Object.assign(out, { address: clean(e.address, 200), label: clean(e.label, 40) || 'Chỉ đường', style: pick(e.style, ['full', 'button'], 'full') });
  if (widget === 'rsvp') out.title = clean(e.title, 80);
  if (widget === 'wishes') Object.assign(out, { title: clean(e.title, 80), privacy: bool(e.privacy) });
  if (widget === 'gift') Object.assign(out, { groom: bank(e.groom), bride: bank(e.bride), style: pick(e.style, ['cards', 'box'], 'cards') });
  if (widget === 'signature') Object.assign(out, { label: clean(e.label, 40) || 'Ký tên của bạn' });
  if (widget === 'dresscode') {
    out.colors = (Array.isArray(e.colors) ? e.colors : [])
      .slice(0, 6)
      .map((c = {}) => ({ c: color(c.c), n: clean(c.n, 24) }))
      .filter((c) => c.c);
  }
  if (widget === 'addcal') Object.assign(out, { label: clean(e.label, 40) || 'Thêm vào lịch', title: clean(e.title, 80), address: clean(e.address, 200), time: timeStr(e.time) });
  if (widget === 'album') {
    Object.assign(out, {
      images: (Array.isArray(e.images) ? e.images : []).map(url).filter(Boolean).slice(0, LIMITS.album),
      cols: num(e.cols, 1, 4, 2),
      gap: num(e.gap, 0, 24, 6),
      radius: num(e.radius, 0, 40, 6),
    });
  }
  if (widget === 'call') Object.assign(out, { phone: clean(e.phone, 20).replace(/[^0-9+]/g, ''), label: clean(e.label, 40) || 'Gọi điện' });
  return out;
}

function sanitizeDoc(input = {}) {
  const src = typeof input === 'object' && input ? input : {};
  const sections = (Array.isArray(src.sections) ? src.sections : []).slice(0, LIMITS.sections).map((s = {}) => ({
    id: id(s.id),
    h: num(s.h, 80, 4000, 700),
    bg: color(s.bg, '#ffffff'),
    bgImage: url(s.bgImage),
    els: (Array.isArray(s.els) ? s.els : []).slice(0, LIMITS.elements).map(sanitizeElement).filter(Boolean),
  }));
  if (!sections.length) sections.push({ id: id(), h: 700, bg: '#ffffff', bgImage: '', els: [] });
  return {
    v: 1,
    W,
    groom: { name: clean(src.groom && src.groom.name, 60) },
    bride: { name: clean(src.bride && src.bride.name, 60) },
    date: dateStr(src.date),
    time: timeStr(src.time) || '11:00',
    pageBg: color(src.pageBg, '#f3eeee'),
    music: { url: musicUrl(src.music && src.music.url), autoplay: !(src.music && src.music.autoplay === false) },
    effects: {
      petals: Boolean(src.effects && src.effects.petals),
      toolbar: !(src.effects && src.effects.toolbar === false),
      fall: pick(src.effects && src.effects.fall, FALLS, 'petals'),
      // Nút tự cuộn thiệp; autostart = tự cuộn ngay khi khách mở thiệp
      autoscroll: !(src.effects && src.effects.autoscroll === false),
      autostart: Boolean(src.effects && src.effects.autostart),
    },
    opener: {
      style: pick(src.opener && src.opener.style, OPENER_KEYS, 'none'),
      color: color(src.opener && src.opener.color, '#b3262d'),
      paper: color(src.opener && src.opener.paper, '#fbf6ef'),
      font: pick(src.opener && src.opener.font, FONTS, 'Great Vibes'),
      // Ảnh trên màn mở thiệp (trống = ảnh lớn nhất ở trang đầu)
      photo: url(src.opener && src.opener.photo),
    },
    sections,
  };
}

function parseDoc(card) {
  try {
    return sanitizeDoc(JSON.parse(card.data || '{}'));
  } catch {
    return sanitizeDoc({});
  }
}

/** Các phông dùng trong thiệp → link Google Fonts */
function docFontsUrl(doc) {
  const names = new Set(['Be Vietnam Pro']);
  if (doc.opener && doc.opener.style !== 'none') names.add(doc.opener.font);
  for (const s of doc.sections) for (const e of s.els) if (e.font) names.add(e.font);
  return fontsUrl([...names]);
}

/** Bổ sung dữ liệu chỉ cần khi hiển thị (QR ngân hàng, ngày dạng chữ) */
function viewDoc(doc) {
  const out = JSON.parse(JSON.stringify(doc));
  const main = parseDate(doc.date, doc.time);
  out.mainDate = main ? main.toISOString() : '';
  out.mainDateText = formatDateVi(main);
  for (const s of out.sections) {
    for (const e of s.els) {
      if (e.type === 'widget' && e.widget === 'gift') {
        e.accounts = ['groom', 'bride']
          .map((side) => {
            const g = e[side];
            const b = bankByBin(g.bin);
            if (!b || !g.accountNo) return null;
            const who = side === 'groom' ? doc.groom.name : doc.bride.name;
            return {
              label: side === 'groom' ? 'Mừng cưới chú rể' : 'Mừng cưới cô dâu',
              bankName: b.name,
              accountNo: g.accountNo,
              accountName: g.accountName,
              qr: vietQrUrl({ bank: g.bin, accountNo: g.accountNo, accountName: g.accountName, note: 'Mung cuoi ' + (who || ''), template: 'compact' }),
            };
          })
          .filter(Boolean);
      }
    }
  }
  return out;
}

/** JSON an toàn để nhúng vào HTML */
const safeJson = (v) => JSON.stringify(v).split('<').join('\\u003c').split('\u2028').join('\\u2028').split('\u2029').join('\\u2029');

// ===== Mẫu canvas gốc của SOBA =====
let seq = 0;
const nid = () => 'e' + (++seq).toString(36);
const T = (x, y, w, h, text, o = {}) => ({ id: nid(), type: 'text', x, y, w, h, text, align: 'center', lh: 1.35, ...o });
const I = (x, y, w, h, src, o = {}) => ({ id: nid(), type: 'image', x, y, w, h, src, ...o });
const S = (x, y, w, h, shape, o = {}) => ({ id: nid(), type: 'shape', x, y, w, h, shape, ...o });
const G = (x, y, w, h, widget, o = {}) => ({ id: nid(), type: 'widget', x, y, w, h, widget, ...o });

function futureDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  d.setDate(18);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Bộ khung thiệp dùng chung, đổi bảng màu + phông để ra từng mẫu.
 * p: { bg, bg2, ink, soft, accent, line, script, serif, sans, photo }
 */
function buildStarter(p) {
  seq = 0;
  const ph = (n) => `/img/canvas/anh-mau-${n}.svg`;
  const sections = [
    // 1. Bìa
    {
      id: nid(),
      h: 760,
      bg: p.bg,
      els: [
        T(30, 34, 360, 60, 'Save the Date', { font: p.script, size: 44, color: p.ink, anim: 'fade' }),
        T(30, 100, 360, 26, '{ngay}', { font: p.sans, size: 15, color: p.soft, ls: 4, anim: 'fade', delay: 0.2 }),
        I(40, 150, 340, 470, ph(1), { mask: 'arch', anim: 'up', delay: 0.3 }),
        S(30, 140, 360, 490, 'rect', { stroke: p.line, sw: 1, radius: 180, o: 0.9 }),
        T(20, 640, 380, 64, '{chu_re}  &  {co_dau}', { font: p.script, size: 40, color: p.ink, anim: 'up', delay: 0.4 }),
        T(60, 708, 300, 24, 'WE ARE GETTING MARRIED', { font: p.sans, size: 11, color: p.soft, ls: 4, anim: 'fade', delay: 0.5 }),
      ],
    },
    // 2. Lời mời + tên khách
    {
      id: nid(),
      h: 640,
      bg: p.bg2,
      els: [
        T(40, 50, 340, 30, 'TRÂN TRỌNG KÍNH MỜI', { font: p.sans, size: 14, color: p.accent, ls: 3, bold: true, anim: 'fade' }),
        T(40, 88, 340, 54, '{ten_khach}', { font: p.script, size: 38, color: p.ink, anim: 'up' }),
        S(160, 152, 100, 2, 'line', { fill: p.line }),
        T(40, 170, 340, 90, 'Tới dự buổi tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện của bạn là niềm vinh hạnh lớn nhất trong ngày hạnh phúc này.', { font: p.serif, size: 16, color: p.ink, italic: true, lh: 1.5, anim: 'fade' }),
        I(40, 290, 160, 210, ph(2), { radius: 100, anim: 'left' }),
        I(220, 290, 160, 210, ph(3), { radius: 100, anim: 'right' }),
        T(40, 512, 160, 40, '{chu_re}', { font: p.script, size: 28, color: p.ink }),
        T(220, 512, 160, 40, '{co_dau}', { font: p.script, size: 28, color: p.ink }),
        T(40, 552, 160, 22, 'CHÚ RỂ', { font: p.sans, size: 11, color: p.soft, ls: 3 }),
        T(220, 552, 160, 22, 'CÔ DÂU', { font: p.sans, size: 11, color: p.soft, ls: 3 }),
      ],
    },
    // 3. Thời gian & địa điểm
    {
      id: nid(),
      h: 860,
      bg: p.bg,
      els: [
        T(40, 40, 340, 50, 'Tiệc Cưới', { font: p.script, size: 40, color: p.ink, anim: 'fade' }),
        T(40, 96, 340, 26, '{gio} · {ngay}', { font: p.sans, size: 15, color: p.ink, bold: true, anim: 'fade' }),
        T(40, 126, 340, 46, 'Trung tâm Hội nghị Tiệc cưới\n8 Hoàng Văn Thụ, Phú Nhuận, TP. Hồ Chí Minh', { font: p.sans, size: 13, color: p.soft, lh: 1.6 }),
        G(40, 190, 340, 300, 'calendar', { color: p.accent, textColor: p.ink, font: p.sans, anim: 'up' }),
        G(40, 510, 340, 96, 'countdown', { color: p.accent, textColor: p.ink, font: p.sans, anim: 'up' }),
        G(40, 630, 340, 200, 'map', { address: '8 Hoàng Văn Thụ, Phú Nhuận, TP. Hồ Chí Minh', color: p.accent, textColor: p.ink, font: p.sans }),
      ],
    },
    // 4. Album
    {
      id: nid(),
      h: 640,
      bg: p.bg2,
      els: [
        T(40, 40, 340, 50, 'Khoảnh khắc', { font: p.script, size: 40, color: p.ink, anim: 'fade' }),
        G(30, 110, 360, 500, 'album', { images: [ph(1), ph(2), ph(3), ph(2)], cols: 2, gap: 8, radius: 8, color: p.accent, anim: 'up' }),
      ],
    },
    // 5. Xác nhận tham dự + lời chúc + mừng cưới
    {
      id: nid(),
      h: 1500,
      bg: p.bg,
      els: [
        T(40, 40, 340, 50, 'Xác nhận tham dự', { font: p.script, size: 36, color: p.ink }),
        G(30, 100, 360, 420, 'rsvp', { color: p.accent, textColor: p.ink, font: p.sans }),
        T(40, 550, 340, 50, 'Sổ lời chúc', { font: p.script, size: 36, color: p.ink }),
        G(30, 610, 360, 440, 'wishes', { color: p.accent, textColor: p.ink, font: p.sans }),
        T(40, 1080, 340, 50, 'Hộp mừng cưới', { font: p.script, size: 36, color: p.ink }),
        G(30, 1140, 360, 300, 'gift', { color: p.accent, textColor: p.ink, font: p.sans }),
      ],
    },
    // 6. Cảm ơn
    {
      id: nid(),
      h: 520,
      bg: p.bg2,
      els: [
        I(110, 50, 200, 260, ph(1), { mask: 'arch', anim: 'zoom' }),
        T(30, 330, 360, 60, 'Thank you', { font: p.script, size: 48, color: p.ink, anim: 'fade' }),
        T(40, 400, 340, 60, 'Cảm ơn bạn đã dành thời gian cho ngày vui của chúng mình!', { font: p.serif, size: 15, color: p.soft, italic: true, lh: 1.5 }),
      ],
    },
  ];
  return sanitizeDoc({
    groom: { name: 'Minh Anh' },
    bride: { name: 'Thu Hà' },
    date: futureDate(),
    time: '11:00',
    pageBg: p.page,
    effects: { petals: true },
    sections,
  });
}

// 3 mẫu ảnh giữ chỗ (SVG) – đã gỡ khỏi kho mẫu 18/11/2026, chỉ giữ để link /demo-thiet-ke cũ không lỗi
const LEGACY_STARTERS = [
  {
    key: 'do-ruou-vang',
    name: 'Đỏ Rượu Vang',
    desc: 'Nền đỏ rượu vang, chữ viết tay trắng, khung vòm thanh lịch.',
    tier: 'free',
    p: { page: '#2a0c10', bg: '#6e1a22', bg2: '#5a141b', ink: '#fff7f2', soft: '#f2cfc6', accent: '#f2c879', line: '#f2c879', script: 'Great Vibes', serif: 'Cormorant Garamond', sans: 'Montserrat' },
  },
  {
    key: 'kem-anh-kim',
    name: 'Kem Ánh Kim',
    desc: 'Nền kem ấm, điểm nhấn vàng kim, phong cách tối giản sang trọng.',
    tier: 'free',
    p: { page: '#efe7dc', bg: '#fbf6ef', bg2: '#f4ece1', ink: '#3b2f25', soft: '#8a7967', accent: '#b8893e', line: '#c9a46a', script: 'Dancing Script', serif: 'Playfair Display', sans: 'Be Vietnam Pro' },
  },
  {
    key: 'hong-pastel',
    name: 'Hồng Pastel',
    desc: 'Hồng phấn ngọt ngào, chữ serif mảnh kiểu Hàn Quốc.',
    tier: 'free',
    p: { page: '#f6dfe5', bg: '#fff5f7', bg2: '#ffe9ee', ink: '#4a2533', soft: '#8a6573', accent: '#d6456c', line: '#e7a3b6', script: 'Great Vibes', serif: 'Cormorant Garamond', sans: 'Montserrat' },
  },
];
LEGACY_STARTERS.forEach((s) => {
  s.doc = buildStarter(s.p);
  s.thumb = '';
  s.tags = ['Ảnh giữ chỗ'];
});
// Mẫu có ảnh thật (canvas-starters.js + canvas-starters-b.js)
const STARTERS = [];
require('./canvas-starters')
  .buildAll()
  .reverse()
  .forEach((s) => {
    s.raw.music.url = songUrl(s.song);
    STARTERS.unshift({ key: s.key, name: s.name, desc: s.desc, tier: s.tier, tags: s.tags, thumb: s.thumb, song: s.song, opener: s.opener, featured: s.featured, doc: sanitizeDoc(s.raw) });
  });

const starterOf = (key) => STARTERS.find((s) => s.key === key) || LEGACY_STARTERS.find((s) => s.key === key) || null;

/** Thiệp trắng: 1 trang + vài chữ gợi ý */
function blankDoc() {
  seq = 0;
  return sanitizeDoc({
    groom: { name: 'Chú rể' },
    bride: { name: 'Cô dâu' },
    date: futureDate(),
    sections: [{ id: nid(), h: 700, bg: '#ffffff', els: [T(40, 300, 340, 60, 'Nhấp đúp để sửa chữ', { font: 'Playfair Display', size: 28, color: '#333333' })] }],
  });
}

/** Biến cho view invitation/canvas.ejs (trang khách xem + xem trước) */
function pageLocals(card, { owner, guestName = '', preview = false, wishes = [], signatures = [], demo = false, doc } = {}) {
  const d = doc || parseDoc(card);
  const plan = owner ? planOf(owner) : PLANS.premium;
  const title = `Thiệp cưới ${d.groom.name} & ${d.bride.name}`;
  return {
    layout: false,
    card,
    title,
    fontsUrl: docFontsUrl(d),
    pageBg: d.pageBg,
    boot: safeJson({
      slug: card.slug,
      doc: viewDoc(d),
      guestName: clean(guestName, 60),
      preview,
      demo,
      watermark: plan.features.watermark,
      petals: plan.features.effects && d.effects.petals,
      fall: d.effects.fall,
      // Tự cuộn: mọi gói
      autoscroll: d.effects.autoscroll ? { start: d.effects.autostart } : null,
      // Màn mở thiệp + thanh tiện ích nổi: gói Basic trở lên
      opener: plan.features.effects && d.opener.style !== 'none' ? d.opener : null,
      toolbar: plan.features.effects && d.effects.toolbar,
      gift: plan.features.gift,
      wishes: wishes.map((w) => ({ name: w.name, message: w.message, at: Number(w.created_at) })),
      signatures: signatures.map((g) => ({ name: g.name, img: g.data })),
    }),
    meta: { title, description: d.date ? `Trân trọng kính mời bạn tới dự lễ cưới của chúng tôi – ${formatDateVi(parseDate(d.date, d.time))}.` : '' },
  };
}

module.exports = { pageLocals, W, FONTS, WIDGETS, LIMITS, BANKS, OPENERS, FALLS, SONGS, songUrl, STARTERS, starterOf, blankDoc, sanitizeDoc, parseDoc, viewDoc, docFontsUrl, safeJson };
