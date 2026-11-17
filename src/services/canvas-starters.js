'use strict';
/**
 * 17 mẫu thiệp thiết kế tự do của SOBA (ảnh mẫu trong public/img/mau/a1…a17).
 * Mỗi mẫu = bảng màu + phông + chuỗi "trang" ghép từ thư viện bố cục bên dưới.
 * Khung thiết kế rộng W = 420px. Trả về dữ liệu thô – canvas.js sẽ sanitize.
 */
const W = 420;
let seq = 0;
const nid = () => 's' + (++seq).toString(36);
const T = (x, y, w, h, text, o = {}) => ({ id: nid(), type: 'text', x, y, w, h, text, align: 'center', lh: 1.35, ...o });
const I = (x, y, w, h, src, o = {}) => ({ id: nid(), type: 'image', x, y, w, h, src, ...o });
const S = (x, y, w, h, shape, o = {}) => ({ id: nid(), type: 'shape', x, y, w, h, shape, ...o });
const G = (x, y, w, h, widget, o = {}) => ({ id: nid(), type: 'widget', x, y, w, h, widget, ...o });
const sec = (h, bg, els, bgImage = '') => ({ id: nid(), h, bg, bgImage, els });

/** Xoay một nhóm phần tử quanh tâm (cx, cy) – dùng cho ảnh polaroid, giấy lịch… */
function rotateGroup(els, cx, cy, deg) {
  const a = (deg * Math.PI) / 180;
  return els.map((e) => {
    const ex = e.x + e.w / 2 - cx;
    const ey = e.y + e.h / 2 - cy;
    const nx = cx + ex * Math.cos(a) - ey * Math.sin(a);
    const ny = cy + ex * Math.sin(a) + ey * Math.cos(a);
    return { ...e, x: Math.round(nx - e.w / 2), y: Math.round(ny - e.h / 2), r: (e.r || 0) + deg };
  });
}
function polaroid(x, y, w, h, src, caption, deg, p, o = {}) {
  const pad = Math.round(w * 0.06);
  const els = [
    S(x, y, w, h, 'rect', { fill: '#ffffff', radius: 2, shadow: true }),
    I(x + pad, y + pad, w - pad * 2, h - pad * 2 - (caption ? 34 : 0) + (caption ? 0 : pad), src, { ...o }),
  ];
  if (caption) els.push(T(x, y + h - 38, w, 30, caption, { font: p.script, size: 20, color: '#3a3a3a' }));
  return rotateGroup(els, x + w / 2, y + h / 2, deg);
}
const txt = (p, kind, o = {}) => {
  const k = {
    script: { font: p.script, color: p.ink },
    serif: { font: p.serif, color: p.ink },
    sans: { font: p.sans, color: p.soft },
    label: { font: p.sans, color: p.accent, ls: 3, bold: true, size: 12 },
  }[kind];
  return { ...k, ...o };
};
const wid = (p) => ({ color: p.accent, textColor: p.ink, font: p.sans });

// ===================== BÌA =====================
const COVERS = {
  /** Ảnh tràn viền, chữ trắng trên lớp phủ mờ */
  full(p, ph, o = {}) {
    return sec(780, p.bg, [
      I(0, 0, W, 780, ph[0], { anim: 'zoom' }),
      S(0, 0, W, 300, 'rect', { fill: o.shade || '#00000099', grad: 'down' }),
      S(0, 430, W, 350, 'rect', { fill: o.shade || '#000000aa', grad: 'up' }),
      T(20, 44, 380, 64, o.title || 'Save the Date', { font: p.script, size: (o.title || '').length > 13 ? 40 : 50, color: '#ffffff', shadow: true, anim: 'fade' }),
      T(20, 118, 380, 24, '{ngay}', { font: p.sans, size: 14, color: '#ffffff', ls: 6, anim: 'fade', delay: 0.2 }),
      T(20, 618, 380, 60, '{chu_re}  &  {co_dau}', { font: p.script, size: 42, color: '#ffffff', shadow: true, anim: 'up', delay: 0.3 }),
      T(40, 690, 340, 22, o.sub || 'WE ARE GETTING MARRIED', { font: p.sans, size: 11, color: '#ffffff', ls: 5, anim: 'fade', delay: 0.5 }),
    ]);
  },
  /** Bìa tạp chí: tên báo lớn, tiêu đề nghiêng, chữ dọc */
  magazine(p, ph, o = {}) {
    return sec(800, p.bg, [
      I(0, 0, W, 800, ph[0], { anim: 'zoom' }),
      S(0, 0, W, 240, 'rect', { fill: '#00000080', grad: 'down' }),
      S(0, 470, W, 330, 'rect', { fill: '#000000b0', grad: 'up' }),
      T(10, 26, 400, 64, o.mast || 'THE WEDDING', { font: 'Playfair Display', size: 44, bold: true, color: '#ffffff', ls: 1, anim: 'fade' }),
      S(24, 98, 372, 1, 'line', { fill: '#ffffffaa' }),
      T(24, 104, 372, 20, 'SỐ ĐẶC BIỆT  ·  {ngay}  ·  TẬP 01', { font: p.sans, size: 10, color: '#ffffff', ls: 3 }),
      T(-112, 380, 260, 20, 'LOVE · STORY · FOREVER', { font: p.sans, size: 10, color: '#ffffffcc', ls: 6, r: -90 }),
      T(24, 540, 372, 140, o.title || 'Our Love\nBegins', { font: 'Playfair Display', size: 62, italic: true, color: p.gold || '#f1d39a', lh: 1, align: 'left', anim: 'up', delay: 0.2 }),
      T(24, 694, 372, 24, '{chu_re}  &  {co_dau}', { font: p.sans, size: 15, bold: true, color: '#ffffff', ls: 3, align: 'left', upper: true }),
      T(24, 724, 300, 40, 'Chúng mình về chung một nhà – trân trọng kính mời bạn tới chung vui.', { font: p.sans, size: 12, color: '#ffffffcc', align: 'left', lh: 1.5 }),
    ]);
  },
  /** Khung vòm cổ điển */
  arch(p, ph, o = {}) {
    return sec(780, p.bg, [
      T(30, 38, 360, 60, o.title || 'Save the Date', txt(p, 'script', { size: 46, anim: 'fade' })),
      T(30, 104, 360, 24, '{ngay}', txt(p, 'sans', { size: 14, ls: 5, anim: 'fade', delay: 0.2 })),
      I(52, 150, 316, 450, ph[0], { mask: 'arch', anim: 'up', delay: 0.2 }),
      S(40, 138, 340, 474, 'rect', { stroke: p.line, sw: 1.5, radius: 170 }),
      S(196, 600, 28, 28, 'heart', { fill: p.accent, anim: 'zoom', delay: 0.4 }),
      T(20, 640, 380, 60, '{chu_re}  &  {co_dau}', txt(p, 'script', { size: 40, anim: 'up', delay: 0.3 })),
      T(50, 708, 320, 22, o.sub || 'TRÂN TRỌNG KÍNH MỜI', txt(p, 'sans', { size: 11, ls: 5 })),
    ]);
  },
  /** Phong bì: thân + nắp tam giác + dấu sáp, ảnh cài trong phong bì */
  envelope(p, ph, o = {}) {
    return sec(780, p.bg, [
      T(30, 34, 360, 60, o.title || 'Wedding Invitation', txt(p, 'script', { size: 44, anim: 'fade' })),
      T(30, 100, 360, 30, '{chu_re}  &  {co_dau}', txt(p, 'serif', { size: 22, ls: 1, anim: 'fade', delay: 0.2 })),
      ...rotateGroup([S(84, 156, 252, 330, 'rect', { fill: '#ffffff', shadow: true }), I(96, 168, 228, 306, ph[0])], 210, 321, -3),
      S(36, 404, 348, 236, 'rect', { fill: p.env, radius: 6, shadow: true }),
      S(36, 404, 348, 150, 'tri', { fill: p.env2 }),
      S(178, 520, 64, 64, 'circle', { fill: p.seal || p.accent, shadow: true, anim: 'zoom', delay: 0.4 }),
      S(196, 540, 28, 25, 'heart', { fill: '#ffffffdd' }),
      T(30, 664, 360, 24, '{thu}  ·  {ngay}', txt(p, 'sans', { size: 13, ls: 4, color: p.ink })),
      T(30, 696, 360, 30, o.sub || 'Trân trọng kính mời', txt(p, 'serif', { size: 18, italic: true })),
    ]);
  },
  /** Dải phim dọc với 3 khung ảnh */
  film(p, ph, o = {}) {
    const els = [
      T(20, 30, 380, 60, o.title || 'Our Love Story', { font: p.script, size: 44, color: '#ffffff', anim: 'fade' }),
      S(80, 108, 260, 600, 'rect', { fill: '#0d0d0d', shadow: true }),
    ];
    // Lỗ phim: mỗi cột là một dòng chữ "■" để tiết kiệm phần tử
    const holes = Array(24).fill('■').join('\n');
    els.push(T(84, 114, 24, 590, holes, { font: 'Be Vietnam Pro', size: 13, color: '#efe9e0', lh: 1.8 }), T(312, 114, 24, 590, holes, { font: 'Be Vietnam Pro', size: 13, color: '#efe9e0', lh: 1.8 }));
    [0, 1, 2].forEach((i) => els.push(I(112, 120 + i * 196, 196, 180, ph[i % ph.length], { filter: o.filter || 'none', anim: 'fade', delay: i * 0.2 })));
    els.push(
      T(20, 722, 380, 34, '{chu_re}  ·  {co_dau}', { font: p.serif, size: 24, color: '#ffffff', ls: 2 }),
      T(20, 760, 380, 20, '{ngay}', { font: p.sans, size: 12, color: '#ffffffaa', ls: 6 })
    );
    return sec(800, p.bg, els);
  },
  /** Báo cưới */
  newspaper(p, ph) {
    return sec(900, p.bg, [
      T(10, 20, 400, 70, 'BÁO CƯỚI', { font: 'Prata', size: 60, color: p.ink, ls: 2 }),
      S(24, 96, 372, 3, 'line', { fill: p.ink }),
      S(24, 102, 372, 1, 'line', { fill: p.ink }),
      T(24, 108, 372, 18, 'SỐ ĐẶC BIỆT  ·  {thu}, {ngay}  ·  GIÁ: MỘT NỤ CƯỜI', { font: p.sans, size: 9.5, color: p.ink, ls: 1 }),
      S(24, 130, 372, 1, 'line', { fill: p.ink }),
      T(24, 142, 372, 96, 'TIN NÓNG: {chu_re} & {co_dau} CHÍNH THỨC VỀ CHUNG MỘT NHÀ', { font: 'Playfair Display', size: 27, bold: true, color: p.ink, align: 'left', lh: 1.12, anim: 'fade' }),
      I(24, 250, 372, 340, ph[0], { filter: 'film', anim: 'fade' }),
      T(24, 594, 372, 20, 'Ảnh: Cô dâu chú rể trong buổi chụp ảnh cưới.', { font: p.serif, size: 11.5, italic: true, color: p.soft, align: 'left' }),
      S(24, 622, 372, 1, 'line', { fill: p.ink }),
      T(24, 634, 176, 210, 'Sau một hành trình dài cùng nhau đi qua bao mùa nắng mưa, hai nhân vật chính của chúng ta đã quyết định viết tiếp câu chuyện tình yêu bằng một đám cưới thật ấm áp.', { font: p.serif, size: 13, color: p.ink, align: 'justify', lh: 1.5 }),
      S(209, 634, 1, 200, 'line', { fill: p.ink }),
      T(220, 634, 176, 210, 'Ban biên tập trân trọng kính mời quý độc giả tới chung vui vào lúc {gio}, {thu} ngày {ngay}. Sự hiện diện của bạn là món quà ý nghĩa nhất.', { font: p.serif, size: 13, color: p.ink, align: 'justify', lh: 1.5 }),
      T(24, 852, 372, 24, '— Toà soạn Hạnh Phúc —', { font: p.script, size: 22, color: p.accent }),
    ]);
  },
  /** Chữ Hỷ truyền thống */
  hy(p, ph) {
    return sec(800, p.bg, [
      S(16, 16, 388, 768, 'rect', { stroke: p.gold, sw: 1.5, radius: 4 }),
      S(26, 26, 368, 748, 'rect', { stroke: p.gold + '88', sw: 1, radius: 2 }),
      T(60, 40, 300, 110, '囍', { font: 'Noto Serif', size: 96, color: p.gold, lh: 1.1, anim: 'zoom' }),
      T(40, 156, 340, 26, 'LỄ THÀNH HÔN', { font: p.sans, size: 15, color: p.gold, ls: 8, bold: true }),
      I(90, 200, 240, 240, ph[0], { mask: 'circle', border: 4, borderColor: p.gold, anim: 'zoom', delay: 0.2 }),
      T(20, 462, 380, 60, '{chu_re}  &  {co_dau}', { font: p.script, size: 42, color: p.cream || '#fff3dc', anim: 'up' }),
      S(150, 536, 120, 1, 'line', { fill: p.gold }),
      T(40, 552, 340, 24, '{gio}  ·  {thu}', { font: p.sans, size: 14, color: p.cream || '#fff3dc', ls: 2 }),
      T(40, 582, 340, 50, '{ngay_so} . {thang} . {nam}', { font: p.serif, size: 36, color: p.gold, bold: true, ls: 2 }),
      T(40, 630, 340, 20, '(Tức ngày {am_lich})', { font: p.serif, size: 13.5, italic: true, color: p.cream || '#fff3dc' }),
      T(40, 660, 340, 60, 'Trân trọng kính mời quý khách tới chung vui cùng gia đình chúng tôi.', { font: p.serif, size: 15, italic: true, color: p.cream || '#fff3dc', lh: 1.5 }),
    ]);
  },
  /** Poster chữ lớn trên ảnh */
  poster(p, ph, o = {}) {
    return sec(800, p.bg, [
      I(0, 0, W, 800, ph[0], { anim: 'zoom' }),
      S(0, 380, W, 420, 'rect', { fill: '#000000c0', grad: 'up' }),
      T(24, 30, 372, 20, '{ngay}', { font: p.sans, size: 12, color: '#ffffff', ls: 6, align: 'left', shadow: true }),
      T(24, 420, 372, 260, o.title || 'WE\nGOT\nMARRIED', { font: 'Oswald', size: 86, bold: true, color: '#ffffff', lh: 0.92, align: 'left', anim: 'left' }),
      T(24, 700, 372, 26, '{chu_re}  +  {co_dau}', { font: p.sans, size: 16, bold: true, color: p.gold || '#ffd27a', ls: 3, align: 'left', upper: true }),
      T(24, 732, 340, 40, 'Một chuyến đi mới bắt đầu – hãy đến chung vui cùng chúng mình nhé!', { font: p.sans, size: 12.5, color: '#ffffffcc', align: 'left', lh: 1.5 }),
    ]);
  },
  /** Ảnh trên – chữ dưới, kiểu Hàn tối giản */
  split(p, ph, o = {}) {
    return sec(780, p.bg, [
      I(0, 0, W, 520, ph[0], { filter: o.filter || 'none', anim: 'fade' }),
      S(30, 480, 360, 270, 'rect', { fill: p.bg, radius: 28, shadow: true }),
      T(40, 500, 340, 56, o.title || 'Save the date', txt(p, 'script', { size: 40, anim: 'up' })),
      T(40, 564, 340, 40, '{chu_re}  &  {co_dau}', txt(p, 'serif', { size: 26, anim: 'up', delay: 0.1 })),
      S(170, 616, 80, 1, 'line', { fill: p.line }),
      T(40, 630, 340, 22, '{thu}  ·  {gio}', txt(p, 'sans', { size: 13, ls: 2 })),
      T(40, 656, 340, 40, '{ngay}', txt(p, 'serif', { size: 28, ls: 4, color: p.accent })),
      T(40, 706, 340, 22, o.sub || 'WEDDING INVITATION', txt(p, 'sans', { size: 10, ls: 6 })),
    ]);
  },
  /** Studio trắng – tờ lịch kẹp giấy */
  clip(p, ph) {
    return sec(800, p.bg, [
      I(34, 54, 300, 420, ph[0], { radius: 4, shadow: true, anim: 'fade' }),
      T(30, 490, 160, 50, 'Save our date', txt(p, 'script', { size: 32, align: 'left' })),
      T(30, 548, 150, 120, '{chu_re}\n&\n{co_dau}', txt(p, 'serif', { size: 22, align: 'left', lh: 1.3 })),
      T(30, 690, 160, 22, '{gio} · {thu}', txt(p, 'sans', { size: 12, align: 'left', ls: 1 })),
      ...rotateGroup(
        [
          S(196, 420, 200, 300, 'rect', { fill: '#ffffff', radius: 4, shadow: true }),
          S(271, 404, 50, 28, 'rect', { fill: '#bdbdbd', radius: 6 }),
          T(196, 444, 200, 24, '{thang} / {nam}', { font: p.sans, size: 13, color: p.soft, ls: 3 }),
          G(206, 470, 180, 230, 'calendar', { ...wid(p) }),
        ],
        296,
        570,
        4
      ),
    ]);
  },
  /** Polaroid xếp chồng */
  polaroids(p, ph, o = {}) {
    return sec(800, p.bg, [
      T(30, 36, 360, 60, o.title || 'Fall in love', txt(p, 'script', { size: 48, anim: 'fade' })),
      ...polaroid(40, 120, 220, 290, ph[0], '', -6, p),
      ...polaroid(170, 250, 220, 290, ph[1] || ph[0], '', 5, p),
      T(20, 600, 380, 56, '{chu_re}  &  {co_dau}', txt(p, 'script', { size: 40, anim: 'up' })),
      T(40, 664, 340, 22, '{ngay}', txt(p, 'sans', { size: 14, ls: 6 })),
      T(40, 700, 340, 50, 'Trân trọng kính mời bạn tới chung vui cùng chúng mình', txt(p, 'serif', { size: 15, italic: true, lh: 1.5 })),
    ]);
  },
};

/** Bìa mới (16/11/2026) – cảm hứng từ mẫu thiep_cuoi_91_premium của SOBA */
Object.assign(COVERS, {
  /** Ảnh lớn + thẻ "Save the Date" bo tròn đè góc + tên căn phải */
  hero(p, ph, o = {}) {
    return sec(820, p.bg, [
      T(30, 34, 360, 58, o.title || 'Thiệp Mời Đám Cưới', txt(p, 'script', { size: 40, anim: 'fade' })),
      T(30, 94, 360, 20, 'WEDDING INVITATION', txt(p, 'sans', { size: 11, ls: 5, anim: 'fade', delay: 0.2 })),
      I(14, 130, 392, 520, ph[0], { anim: 'zoom' }),
      S(30, 560, 140, 236, 'rect', { fill: '#ffffff', radius: 70, shadow: true, anim: 'up', delay: 0.3 }),
      I(40, 570, 120, 150, ph[1] || ph[0], { mask: 'arch', radius: 8, anim: 'up', delay: 0.3 }),
      T(30, 726, 140, 34, 'Save the Date', { font: p.script, size: 25, color: p.ink, anim: 'up', delay: 0.35 }),
      T(30, 758, 140, 32, o.mark || '♥', { font: 'Noto Serif', size: 24, color: p.accent, anim: 'up', delay: 0.4 }),
      T(186, 668, 214, 60, '{chu_re}\n& {co_dau}', txt(p, 'serif', { size: 20, bold: true, align: 'right', lh: 1.4, anim: 'right', delay: 0.3 })),
      T(186, 734, 214, 22, '{nam} · {thang} · {ngay_so}', txt(p, 'serif', { size: 14, ls: 2, align: 'right', color: p.ink, anim: 'right', delay: 0.4 })),
      T(186, 760, 214, 22, '{thu} · {gio}', txt(p, 'sans', { size: 12.5, align: 'right', anim: 'right', delay: 0.5 })),
    ]);
  },
  /** Ảnh tràn viền + ngày cưới cỡ lớn */
  datebig(p, ph, o = {}) {
    return sec(800, p.bg, [
      I(0, 0, W, 800, ph[0], { anim: 'zoom' }),
      S(0, 0, W, 220, 'rect', { fill: o.shade || '#00000088', grad: 'down' }),
      S(0, 420, W, 380, 'rect', { fill: o.shade || '#000000b8', grad: 'up' }),
      T(20, 40, 380, 22, 'SAVE THE DATE', { font: p.sans, size: 13, color: '#ffffff', ls: 9, anim: 'fade' }),
      T(20, 70, 380, 22, '{chu_re}  ·  {co_dau}', { font: p.sans, size: 12, color: '#ffffffcc', ls: 4, upper: true, anim: 'fade', delay: 0.2 }),
      T(0, 540, W, 130, '{ngay_so}.{thang}', { font: 'Playfair Display', size: 112, color: '#ffffff', lh: 1, ls: 2, anim: 'up', delay: 0.2 }),
      T(0, 668, W, 30, '— {nam} —', { font: p.serif, size: 18, color: '#ffffff', ls: 6, anim: 'fade', delay: 0.3 }),
      T(20, 712, 380, 56, '{chu_re}  &  {co_dau}', { font: p.script, size: 36, color: '#ffffff', shadow: true, anim: 'up', delay: 0.4 }),
    ]);
  },
  /** Ảnh lồng khung viền mảnh, tên dưới */
  frame(p, ph, o = {}) {
    return sec(800, p.bg, [
      I(22, 22, 376, 640, ph[0], { anim: 'fade', filter: o.filter || 'none' }),
      S(36, 36, 348, 612, 'rect', { stroke: '#ffffffcc', sw: 1 }),
      T(36, 54, 348, 20, 'THE WEDDING OF', { font: p.sans, size: 11, color: '#ffffff', ls: 7, shadow: true }),
      T(36, 612, 348, 22, '{ngay}', { font: p.sans, size: 12, color: '#ffffff', ls: 6, shadow: true }),
      T(20, 680, 380, 56, '{chu_re}  &  {co_dau}', txt(p, 'script', { size: 40, anim: 'up' })),
      T(40, 744, 340, 22, o.sub || 'TRÂN TRỌNG KÍNH MỜI', txt(p, 'sans', { size: 11, ls: 5 })),
    ]);
  },
});

/** Chuyện tình 4 chương: ảnh tròn xen kẽ trái/phải, đường chấm giữa */
function secStory(p, ph, o = {}) {
  const CH = o.chapters || [
    ['Gặp gỡ', 'Một ngày rất bình thường, hai người xa lạ vô tình ngồi cạnh nhau – và câu chuyện bắt đầu.'],
    ['Rung động', 'Những tin nhắn chúc ngủ ngon, những buổi hẹn cà phê kéo dài đến tận khuya.'],
    ['Đồng hành', 'Cùng nhau đi qua nắng mưa, học cách thương nhau mỗi ngày nhiều hơn một chút.'],
    ['Trọn đời', 'Và hôm nay, chúng mình viết tiếp câu chuyện ấy bằng một lời hứa trọn đời.'],
  ];
  const els = [
    T(30, 36, 360, 20, 'CHUYỆN TÌNH CHÚNG MÌNH', txt(p, 'label', { size: 11, anim: 'fade' })),
    T(30, 58, 360, 64, 'Love Story', txt(p, 'script', { size: 48, anim: 'fade' })),
    S(209.5, 150, 1, 790, 'line', { fill: p.line }),
  ];
  CH.forEach((c, i) => {
    const y = 156 + i * 196;
    const left = i % 2 === 0;
    const px = left ? 34 : 236;
    const tx = left ? 236 : 30;
    els.push(
      I(px, y, 150, 150, ph[i] || ph[0], { mask: 'circle', border: 5, borderColor: '#ffffff', shadow: true, anim: left ? 'left' : 'right' }),
      S(197, y + 62, 26, 26, 'circle', { fill: p.bg, stroke: p.accent, sw: 1 }),
      T(197, y + 65, 26, 20, '♥', { font: 'Be Vietnam Pro', size: 11, color: p.accent }),
      T(tx, y + 12, 154, 18, 'CHƯƠNG 0' + (i + 1), txt(p, 'label', { size: 10, align: left ? 'left' : 'right', anim: left ? 'right' : 'left' })),
      T(tx, y + 32, 154, 28, c[0], txt(p, 'serif', { size: 19, bold: true, align: left ? 'left' : 'right', anim: left ? 'right' : 'left' })),
      T(tx, y + 64, 154, 84, c[1], txt(p, 'sans', { size: 12, lh: 1.6, align: left ? 'left' : 'right', anim: left ? 'right' : 'left' }))
    );
  });
  return sec(980, o.bg || p.bg, els);
}

/** Lễ thành hôn: ngày lớn + lịch trình theo giờ */
function secSchedule(p, o = {}) {
  const items = o.items || [
    ['10:30', 'Đón khách', 'Đón tiếp quan viên hai họ, bạn bè và chụp ảnh lưu niệm.'],
    ['{gio}', 'Lễ thành hôn', 'Cử hành nghi lễ, trao nhẫn cưới và lời hẹn ước bên nhau.'],
    ['12:00', 'Khai tiệc mừng', 'Cùng nâng ly chúc phúc và thưởng thức tiệc cưới ấm cúng.'],
  ];
  const els = [
    T(30, 40, 360, 22, 'LỄ THÀNH HÔN', txt(p, 'label', { size: 12, anim: 'fade' })),
    S(187, 74, 46, 1, 'line', { fill: p.ink }),
    S(40, 112, 100, 1, 'line', { fill: p.ink }),
    S(40, 148, 100, 1, 'line', { fill: p.ink }),
    T(40, 118, 100, 24, '{thu}', txt(p, 'sans', { size: 12, ls: 2, color: p.ink, upper: true })),
    T(140, 88, 140, 90, '{ngay_so}', txt(p, 'serif', { size: 72, color: p.accent, lh: 1.1, anim: 'zoom' })),
    S(280, 112, 100, 1, 'line', { fill: p.ink }),
    S(280, 148, 100, 1, 'line', { fill: p.ink }),
    T(280, 118, 100, 24, '{thang} · {nam}', txt(p, 'sans', { size: 12, ls: 2, color: p.ink })),
    T(40, 180, 340, 20, '(Tức ngày {am_lich})', txt(p, 'serif', { size: 13.5, italic: true })),
    T(40, 206, 340, 46, o.venue || 'Trung tâm Hội nghị Tiệc cưới\n8 Hoàng Văn Thụ, Phú Nhuận, TP. Hồ Chí Minh', txt(p, 'sans', { size: 12.5, lh: 1.6 })),
    S(74, 262, 1, 300, 'line', { fill: p.line }),
  ];
  items.forEach((it, i) => {
    const y = 262 + i * 104;
    els.push(
      S(69, y + 12, 11, 11, 'circle', { fill: p.bg, stroke: p.accent, sw: 1.5 }),
      T(98, y, 290, 30, it[0], txt(p, 'serif', { size: 22, color: p.accent, align: 'left', anim: 'up' })),
      T(98, y + 32, 290, 26, it[1], txt(p, 'serif', { size: 17, bold: true, align: 'left', anim: 'up' })),
      T(98, y + 58, 290, 40, it[2], txt(p, 'sans', { size: 12.5, align: 'left', lh: 1.55, anim: 'up' }))
    );
  });
  els.push(G(40, 590, 340, 96, 'countdown', { ...wid(p), anim: 'up' }), G(40, 712, 340, 250, 'map', { ...wid(p), address: o.address || '8 Hoàng Văn Thụ, Phú Nhuận, TP. Hồ Chí Minh' }));
  return sec(1000, o.bg || p.bg2, els);
}

/** Lời ngỏ trên ảnh dọc lớn */
function secLetter(p, src, text) {
  return sec(660, p.bg, [
    I(14, 20, 392, 620, src, { anim: 'zoom' }),
    S(14, 240, 392, 400, 'rect', { fill: '#000000b0', grad: 'up' }),
    T(34, 440, 352, 60, 'Lời ngỏ', { font: p.script, size: 46, color: '#ffffff', shadow: true, anim: 'up' }),
    T(40, 506, 340, 110, text || 'Cùng với gia đình hai bên, chúng mình trân trọng kính mời bạn đến dự lễ thành hôn để chứng kiến và chia sẻ khoảnh khắc hạnh phúc này.', { font: p.sans, size: 13.5, color: '#ffffffee', lh: 1.75, anim: 'up', delay: 0.1 }),
  ]);
}

// ===================== LỜI MỜI =====================
function secInvite(p, o = {}) {
  return sec(520, o.bg || p.bg2, [
    T(40, 46, 340, 24, 'TRÂN TRỌNG KÍNH MỜI', txt(p, 'label', { size: 13, anim: 'fade' })),
    T(30, 80, 360, 60, '{ten_khach}', txt(p, 'script', { size: 42, anim: 'up' })),
    S(170, 150, 80, 1, 'line', { fill: p.line }),
    T(40, 166, 340, 80, 'Tới dự buổi tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện của bạn là niềm vinh hạnh lớn nhất trong ngày hạnh phúc này.', txt(p, 'serif', { size: 16, italic: true, lh: 1.55 })),
    S(195, 272, 30, 27, 'heart', { fill: p.accent, o: 0.85, anim: 'zoom' }),
    T(40, 316, 340, 24, 'Trân trọng báo tin lễ thành hôn của con chúng tôi', txt(p, 'sans', { size: 13 })),
    T(20, 350, 380, 60, '{chu_re}  &  {co_dau}', txt(p, 'script', { size: 40, anim: 'up' })),
    T(40, 426, 340, 30, '{gio}  ·  {thu}, {ngay}', txt(p, 'serif', { size: 18, color: p.accent })),
    T(40, 458, 340, 22, '(Tức ngày {am_lich})', txt(p, 'serif', { size: 14, italic: true, color: p.soft })),
  ]);
}

// ===================== HAI GIA ĐÌNH + LỄ TẠI TƯ GIA =====================
/** Bố mẹ hai bên + lễ Vu Quy (nhà gái) và lễ Thành Hôn (nhà trai), mỗi lễ có nút chỉ đường */
function secFamily(p, o = {}) {
  const card = (y, title, time, place, addr) => [
    S(30, y, 360, 226, 'rect', { fill: p.bg2, stroke: p.line, sw: 1, radius: 20, anim: 'up' }),
    T(50, y + 22, 320, 20, title, txt(p, 'label', { size: 12, anim: 'up' })),
    T(50, y + 46, 320, 34, time + '  ·  {thu}', txt(p, 'serif', { size: 22, bold: true, anim: 'up' })),
    T(50, y + 82, 320, 22, '{ngay}', txt(p, 'sans', { size: 14, color: p.ink, ls: 3, anim: 'up' })),
    T(50, y + 106, 320, 20, '(Tức ngày {am_lich})', txt(p, 'serif', { size: 13.5, italic: true, anim: 'up' })),
    T(50, y + 132, 320, 40, place + '\n' + addr, txt(p, 'sans', { size: 12.5, lh: 1.6, anim: 'up' })),
    G(115, y + 174, 190, 38, 'map', { ...wid(p), style: 'button', label: 'Xem chỉ đường', address: addr, anim: 'up' }),
  ];
  return sec(820, o.bg || p.bg, [
    T(30, 40, 360, 22, 'HAI GIA ĐÌNH', txt(p, 'label', { size: 12, anim: 'fade' })),
    T(30, 64, 360, 60, o.title || 'Lễ Báo Hỷ', txt(p, 'script', { size: 42, anim: 'fade' })),
    T(30, 140, 170, 22, 'NHÀ TRAI', txt(p, 'label', { size: 12 })),
    T(30, 166, 170, 44, 'Ông Nguyễn Văn An\nBà Trần Thị Bình', txt(p, 'serif', { size: 15, color: p.ink, lh: 1.5 })),
    T(30, 214, 170, 22, 'Quận 3, TP. Hồ Chí Minh', txt(p, 'sans', { size: 12 })),
    S(209.5, 142, 1, 92, 'line', { fill: p.line }),
    T(220, 140, 170, 22, 'NHÀ GÁI', txt(p, 'label', { size: 12 })),
    T(220, 166, 170, 44, 'Ông Lê Văn Cường\nBà Phạm Thị Dung', txt(p, 'serif', { size: 15, color: p.ink, lh: 1.5 })),
    T(220, 214, 170, 22, 'TP. Thủ Đức, TP. Hồ Chí Minh', txt(p, 'sans', { size: 12 })),
    ...card(276, 'LỄ VU QUY', '08:30', 'Tại tư gia nhà gái', '25 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh'),
    ...card(526, 'LỄ THÀNH HÔN', '10:00', 'Tại tư gia nhà trai', '120 Lý Chính Thắng, Quận 3, TP. Hồ Chí Minh'),
    T(40, 772, 340, 24, 'Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi', txt(p, 'sans', { size: 12, italic: true })),
  ]);
}

// ===================== PHONG BÌ ẢNH (giữa thiệp) =====================
/** Phong bì mở nắp, hai ảnh trồi lên khi khách cuộn tới */
function secEnvelope(p, ph, o = {}) {
  const env = p.env || p.accent;
  const env2 = p.env2 || p.line;
  // Dấu sáp tương phản với phong bì: phong bì đỏ → sáp vàng, còn lại → sáp đỏ
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(env.substr(i, 2), 16));
  const seal = p.seal || (r > g + 50 && r > b + 50 ? '#c9a046' : '#a3202c');
  return sec(700, o.bg || p.bg2, [
    T(30, 40, 360, 22, 'SAVE THE DATE', txt(p, 'label', { size: 12, anim: 'fade' })),
    T(30, 64, 360, 58, o.title || 'Hẹn bạn ngày vui', txt(p, 'script', { size: 40, anim: 'fade' })),
    S(52, 184, 316, 150, 'tri', { fill: env2, r: 180 }),
    S(52, 330, 316, 210, 'rect', { fill: env2, radius: 6 }),
    I(78, 192, 160, 214, ph[0], { border: 6, borderColor: '#ffffff', shadow: true, r: -6, anim: 'rise', delay: 0.1 }),
    I(184, 178, 160, 214, ph[1] || ph[0], { border: 6, borderColor: '#ffffff', shadow: true, r: 7, anim: 'rise', delay: 0.4 }),
    S(52, 382, 316, 158, 'rect', { fill: env, radius: 6, shadow: true }),
    S(52, 382, 158, 158, 'tri', { fill: '#ffffff', o: 0.07, r: -90 }),
    S(210, 382, 158, 158, 'tri', { fill: '#000000', o: 0.06, r: 90 }),
    S(178, 428, 64, 64, 'circle', { fill: seal, shadow: true, anim: 'zoom', delay: 0.6 }),
    S(196, 448, 28, 25, 'heart', { fill: '#ffffffdd', anim: 'zoom', delay: 0.6 }),
    T(30, 564, 360, 54, '{chu_re}  &  {co_dau}', txt(p, 'script', { size: 36, anim: 'up' })),
    T(30, 620, 360, 22, '{gio}  ·  {thu}, {ngay}', txt(p, 'sans', { size: 13.5, color: p.ink, ls: 1 })),
    T(30, 646, 360, 22, '(Tức ngày {am_lich})', txt(p, 'serif', { size: 14, italic: true })),
  ]);
}

// ===================== CÔ DÂU & CHÚ RỂ =====================
const COUPLE = {
  circles(p, ph) {
    return sec(560, p.bg, [
      T(30, 40, 360, 56, 'Cô dâu & Chú rể', txt(p, 'script', { size: 38, anim: 'fade' })),
      I(30, 120, 170, 170, ph[0], { mask: 'circle', border: 4, borderColor: p.line, anim: 'left' }),
      I(220, 120, 170, 170, ph[1] || ph[0], { mask: 'circle', border: 4, borderColor: p.line, anim: 'right' }),
      S(196, 190, 28, 26, 'heart', { fill: p.accent }),
      T(20, 306, 190, 44, '{chu_re}', txt(p, 'script', { size: 30 })),
      T(210, 306, 190, 44, '{co_dau}', txt(p, 'script', { size: 30 })),
      T(20, 352, 190, 20, 'CHÚ RỂ', txt(p, 'label', { size: 11 })),
      T(210, 352, 190, 20, 'CÔ DÂU', txt(p, 'label', { size: 11 })),
      T(30, 390, 170, 80, 'Một chàng trai trầm tính, thích cà phê sáng và những chuyến đi xa.', txt(p, 'sans', { size: 12.5, lh: 1.55 })),
      T(220, 390, 170, 80, 'Một cô gái hay cười, yêu hoa tươi và những bản nhạc nhẹ.', txt(p, 'sans', { size: 12.5, lh: 1.55 })),
    ]);
  },
  arches(p, ph) {
    return sec(600, p.bg, [
      T(30, 40, 360, 56, 'Hai chúng mình', txt(p, 'script', { size: 38, anim: 'fade' })),
      I(30, 120, 170, 250, ph[0], { mask: 'arch', anim: 'up' }),
      I(220, 120, 170, 250, ph[1] || ph[0], { mask: 'arch', anim: 'up', delay: 0.15 }),
      T(20, 386, 190, 44, '{chu_re}', txt(p, 'script', { size: 30 })),
      T(210, 386, 190, 44, '{co_dau}', txt(p, 'script', { size: 30 })),
      T(20, 432, 190, 20, 'THE GROOM', txt(p, 'label', { size: 10, ls: 4 })),
      T(210, 432, 190, 20, 'THE BRIDE', txt(p, 'label', { size: 10, ls: 4 })),
      T(40, 486, 340, 70, '“Yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.”', txt(p, 'serif', { size: 16, italic: true, lh: 1.5 })),
    ]);
  },
  tall(p, ph) {
    return sec(700, p.bg, [
      I(30, 40, 360, 500, ph[0], { radius: 18, anim: 'fade' }),
      S(30, 380, 360, 160, 'rect', { fill: '#000000aa', grad: 'up', radius: 18 }),
      T(36, 444, 348, 50, '{chu_re}  &  {co_dau}', { font: p.script, size: 33, color: '#ffffff', shadow: true }),
      T(40, 500, 340, 20, 'BRIDE  ·  GROOM', { font: p.sans, size: 11, color: '#ffffffcc', ls: 6 }),
      T(40, 570, 340, 90, 'Từ hai người xa lạ, chúng mình tìm thấy nhau giữa thành phố đông người – và quyết định cùng nhau viết tiếp câu chuyện này.', txt(p, 'serif', { size: 15, italic: true, lh: 1.55 })),
    ]);
  },
  polaroid(p, ph) {
    return sec(600, p.bg2, [
      T(30, 36, 360, 56, 'Chuyện của chúng mình', txt(p, 'script', { size: 36, anim: 'fade' })),
      ...polaroid(26, 116, 190, 250, ph[0], '{chu_re}', -5, p),
      ...polaroid(204, 130, 190, 250, ph[1] || ph[0], '{co_dau}', 5, p),
      T(40, 420, 340, 110, 'Gặp nhau vào một ngày rất bình thường, nhưng từ đó mọi ngày đều trở nên đặc biệt. Cảm ơn vì đã luôn là “nhà” của nhau.', txt(p, 'serif', { size: 15, italic: true, lh: 1.6 })),
    ]);
  },
};

// ===================== THỜI GIAN & ĐỊA ĐIỂM =====================
const EVENT = {
  bigdate(p, o = {}) {
    return sec(890, o.bg || p.bg2, [
      T(30, 40, 360, 56, 'Tiệc Cưới', txt(p, 'script', { size: 42, anim: 'fade' })),
      T(30, 104, 360, 22, 'VÀO LÚC {gio}', txt(p, 'label', { size: 12 })),
      S(40, 150, 340, 1, 'line', { fill: p.line }),
      T(40, 178, 110, 30, '{thu}', txt(p, 'sans', { size: 15, color: p.ink })),
      T(150, 140, 120, 110, '{ngay_so}', txt(p, 'serif', { size: 76, bold: true, color: p.accent, lh: 1.2, anim: 'zoom' })),
      T(270, 166, 110, 50, 'Tháng {thang}\n{nam}', txt(p, 'sans', { size: 14, color: p.ink, lh: 1.4 })),
      S(150, 160, 1, 72, 'line', { fill: p.line }),
      S(270, 160, 1, 72, 'line', { fill: p.line }),
      S(40, 258, 340, 1, 'line', { fill: p.line }),
      T(40, 284, 340, 30, o.venue || 'Trung tâm Hội nghị Tiệc cưới', txt(p, 'serif', { size: 20, bold: true })),
      T(40, 318, 340, 40, o.address || '8 Hoàng Văn Thụ, Phú Nhuận, TP. Hồ Chí Minh', txt(p, 'sans', { size: 13, lh: 1.5 })),
      G(40, 384, 340, 96, 'countdown', { ...wid(p), anim: 'up' }),
      G(40, 510, 340, 260, 'map', { ...wid(p), address: o.address || '8 Hoàng Văn Thụ, Phú Nhuận, TP. Hồ Chí Minh' }),
      T(40, 800, 340, 30, 'Tiệc chiêu đãi: {gio} · {thu}, {ngay}', txt(p, 'sans', { size: 13.5, color: p.ink })),
      T(40, 832, 340, 22, '(Tức ngày {am_lich})', txt(p, 'serif', { size: 14, italic: true })),
    ]);
  },
  calendar(p, o = {}) {
    return sec(980, o.bg || p.bg2, [
      T(30, 40, 360, 56, 'Ngày chung đôi', txt(p, 'script', { size: 40, anim: 'fade' })),
      T(30, 100, 360, 24, '{gio}  ·  {thu}, {ngay}', txt(p, 'serif', { size: 18, color: p.accent, bold: true })),
      T(30, 126, 360, 20, '(Tức ngày {am_lich})', txt(p, 'serif', { size: 13.5, italic: true })),
      G(40, 154, 340, 296, 'calendar', { ...wid(p), bg: o.calBg || '', anim: 'up' }),
      G(40, 470, 340, 96, 'countdown', { ...wid(p) }),
      T(40, 600, 340, 30, o.venue || 'Nhà hàng tiệc cưới Hoa Sen', txt(p, 'serif', { size: 20, bold: true })),
      T(40, 634, 340, 40, o.address || '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', txt(p, 'sans', { size: 13, lh: 1.5 })),
      G(40, 690, 340, 250, 'map', { ...wid(p), address: o.address || '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' }),
    ]);
  },
};

// ===================== ALBUM =====================
const GALLERY = {
  grid(p, ph, o = {}) {
    const cols = o.cols || 2;
    const rows = Math.ceil(ph.length / cols);
    const cell = (360 - (cols - 1) * 8) / cols;
    const h = Math.round(rows * cell * 1.3 + (rows - 1) * 8);
    return sec(h + 150, p.bg, [
      T(30, 36, 360, 56, o.title || 'Album ảnh cưới', txt(p, 'script', { size: 40, anim: 'fade' })),
      G(30, 110, 360, h, 'album', { images: ph, cols, gap: 8, radius: o.radius == null ? 8 : o.radius, ...wid(p), anim: 'up' }),
    ]);
  },
  collage(p, ph, o = {}) {
    return sec(860, p.bg, [
      T(30, 36, 360, 56, o.title || 'Khoảnh khắc', txt(p, 'script', { size: 42, anim: 'fade' })),
      I(24, 110, 220, 330, ph[0], { radius: 10, anim: 'left' }),
      I(254, 110, 142, 160, ph[1] || ph[0], { radius: 10, anim: 'right' }),
      I(254, 280, 142, 160, ph[2] || ph[0], { radius: 10, anim: 'right', delay: 0.1 }),
      I(24, 450, 372, 300, ph[3] || ph[0], { radius: 10, anim: 'up' }),
      T(40, 774, 340, 50, '“Mỗi bức ảnh là một lời hứa nhỏ.”', txt(p, 'serif', { size: 16, italic: true })),
    ]);
  },
  polaroids(p, ph, o = {}) {
    return sec(900, p.bg2, [
      T(30, 36, 360, 56, o.title || 'Những ngày thương', txt(p, 'script', { size: 40, anim: 'fade' })),
      ...polaroid(24, 110, 200, 260, ph[0], '', -6, p),
      ...polaroid(200, 140, 200, 260, ph[1] || ph[0], '', 6, p),
      ...polaroid(30, 420, 200, 260, ph[2] || ph[0], '', 4, p),
      ...polaroid(196, 450, 200, 260, ph[3] || ph[0], '', -5, p),
      T(40, 780, 340, 60, 'Cảm ơn vì đã cùng nhau đi qua tất cả những ngày này.', txt(p, 'serif', { size: 15, italic: true, lh: 1.5 })),
    ]);
  },
  /** Ảnh – chữ xen kẽ 2 hàng */
  stagger(p, ph, o = {}) {
    return sec(560, o.bg || p.bg, [
      I(26, 40, 178, 178, ph[0], { anim: 'left' }),
      T(222, 74, 170, 28, o.t1 || 'Gặp gỡ', txt(p, 'serif', { size: 19, bold: true, align: 'left', anim: 'right' })),
      T(222, 106, 170, 90, o.d1 || 'Có những người chỉ cần gặp một lần là biết sẽ muốn ở bên rất lâu.', txt(p, 'sans', { size: 13, lh: 1.7, align: 'left', anim: 'right' })),
      T(28, 280, 170, 28, o.t2 || 'Thương nhau', txt(p, 'serif', { size: 19, bold: true, align: 'right', anim: 'left' })),
      T(28, 312, 170, 90, o.d2 || 'Từ những điều giản dị nhất, chúng mình đã chọn nhau mỗi ngày.', txt(p, 'sans', { size: 13, lh: 1.7, align: 'right', anim: 'left' })),
      I(216, 246, 178, 178, ph[1] || ph[0], { anim: 'right' }),
      T(40, 462, 340, 70, o.quote || '“Cuộc sống chỉ cần hai điều may mắn: gặp được em, và ở bên nhau đến cuối cuộc đời.”', txt(p, 'serif', { size: 15, italic: true, lh: 1.6, anim: 'fade' })),
    ]);
  },
  /** 3 ảnh ngang xếp chồng */
  stack(p, ph, o = {}) {
    return sec(860, o.bg || p.bg2, [
      T(30, 36, 360, 56, o.title || 'Những ngày bên nhau', txt(p, 'script', { size: 38, anim: 'fade' })),
      I(40, 110, 340, 196, ph[0], { anim: 'up' }),
      I(40, 318, 340, 196, ph[1] || ph[0], { anim: 'up' }),
      I(40, 526, 340, 196, ph[2] || ph[0], { anim: 'up' }),
      T(40, 748, 340, 80, o.quote || 'Giờ đây, chúng mình quyết định trở thành một gia đình – cùng nhau đi qua mọi mùa của cuộc đời.', txt(p, 'serif', { size: 15, italic: true, lh: 1.6, anim: 'fade' })),
    ]);
  },
  film(p, ph, o = {}) {
    const els = [T(30, 30, 360, 56, o.title || 'Thước phim của chúng mình', { font: p.script, size: 36, color: p.filmText || p.ink, anim: 'fade' })];
    ph.slice(0, 3).forEach((src, i) => {
      const y = 110 + i * 250;
      els.push(S(0, y, W, 230, 'rect', { fill: '#111111' }));
      const row = Array(17).fill('■').join(' ');
      els.push(T(0, y + 3, W, 20, row, { font: 'Be Vietnam Pro', size: 12, color: '#efe9e0', ls: 7 }), T(0, y + 207, W, 20, row, { font: 'Be Vietnam Pro', size: 12, color: '#efe9e0', ls: 7 }));
      els.push(I(24, y + 26, 372, 178, src, { anim: 'fade', delay: i * 0.1 }));
    });
    return sec(880, p.bg, els);
  },
};

// ===================== CÂU TRÍCH TRÊN ẢNH =====================
function secQuote(p, src, text) {
  return sec(560, p.bg, [
    I(0, 0, W, 560, src),
    S(0, 0, W, 560, 'rect', { fill: '#00000066' }),
    T(40, 200, 340, 160, text || '“Hạnh phúc là được nắm tay nhau đi qua mọi mùa của cuộc đời.”', { font: p.serif, size: 24, italic: true, color: '#ffffff', lh: 1.45, shadow: true, anim: 'fade' }),
  ]);
}

// ===================== RSVP / LỜI CHÚC / MỪNG CƯỚI =====================
/** Gói của mẫu đang dựng – mẫu miễn phí không có hộp mừng cưới QR */
let CUR_TIER = 'free';
function secForms(p, o = {}) {
  const onDark = o.dark;
  const gift = o.gift == null ? CUR_TIER !== 'free' : o.gift;
  const head = (y, t) => T(30, y, 360, 54, t, { font: p.script, size: 36, color: onDark ? '#ffffff' : p.ink });
  const els = [
    head(40, 'Xác nhận tham dự'),
    T(40, 96, 340, 40, 'Bạn vui lòng phản hồi để chúng mình chuẩn bị chu đáo nhé!', { font: p.sans, size: 13, color: onDark ? '#ffffffcc' : p.soft, lh: 1.5 }),
    G(30, 146, 360, 410, 'rsvp', { ...wid(p) }),
    head(590, 'Sổ lời chúc'),
    G(30, 654, 360, 440, 'wishes', { ...wid(p) }),
  ];
  if (gift) {
    els.push(
      head(1124, 'Hộp mừng cưới'),
      T(40, 1178, 340, 22, 'Gửi gắm món quà chúc phúc tới cô dâu & chú rể', { font: p.sans, size: 12.5, color: onDark ? '#ffffffcc' : p.soft }),
      G(30, 1210, 360, 300, 'gift', { ...wid(p) })
    );
  }
  return sec(gift ? 1550 : 1130, o.bg || p.bg, els);
}

// ===================== CẢM ƠN =====================
const THANKS = {
  arch(p, src) {
    return sec(560, p.bg2, [
      I(100, 50, 220, 290, src, { mask: 'arch', anim: 'zoom' }),
      T(30, 360, 360, 64, 'Thank you', txt(p, 'script', { size: 50, anim: 'fade' })),
      T(40, 430, 340, 60, 'Cảm ơn bạn đã dành thời gian cho ngày vui của chúng mình!', txt(p, 'serif', { size: 15, italic: true, lh: 1.5 })),
      T(40, 500, 340, 22, '{chu_re}  ·  {co_dau}', txt(p, 'label', { size: 11, ls: 5 })),
    ]);
  },
  full(p, src) {
    return sec(620, p.bg, [
      I(0, 0, W, 620, src),
      S(0, 300, W, 320, 'rect', { fill: '#000000b0', grad: 'up' }),
      T(30, 450, 360, 64, 'Thank you', { font: p.script, size: 52, color: '#ffffff', shadow: true, anim: 'fade' }),
      T(40, 520, 340, 50, 'Cảm ơn bạn đã là một phần trong ngày hạnh phúc của chúng mình.', { font: p.sans, size: 13, color: '#ffffffdd', lh: 1.5 }),
    ]);
  },
};

// ===================== BỐ CỤC "KÍNH MỜ" (17/11/2026) =====================
/**
 * Phong cách mới cho các mẫu a32–a39: thẻ bo tròn lớn, thẻ kính mờ trên ảnh làm mờ,
 * chữ dọc, ngày lớn in mờ trên ảnh, đĩa than, timeline có biểu tượng, ký tên lưu bút,
 * dresscode, hộp quà chạm để mở. Mỗi mẫu có câu văn riêng theo chủ đề (p.t).
 * p bổ sung: card (nền thẻ), glass (thẻ kính mờ, có alpha), veil (lớp phủ ảnh mờ), script2.
 */
const GL = {
  /** Bìa: thẻ trắng bo tròn, ảnh vòm, chữ dọc HAPPY WEDDING, ngày lớn đè lên ảnh, tên xếp dọc */
  cover(p, ph) {
    return sec(900, p.bg, [
      S(22, 34, 376, 640, 'rect', { fill: p.card, radius: 34, shadow: true, anim: 'fade' }),
      I(40, 52, 340, 562, ph[0], { mask: 'arch', radius: 22, anim: 'zoom' }),
      S(40, 380, 340, 234, 'rect', { fill: '#00000070', grad: 'up', radius: 22 }),
      T(40, 76, 340, 34, p.t.tag, { font: p.script2, size: 26, color: '#ffffff', shadow: true, anim: 'fade', delay: 0.3 }),
      T(-92, 330, 300, 20, 'HAPPY  WEDDING', { font: p.sans, size: 11, ls: 9, color: '#ffffffd0', r: -90, anim: 'fade', delay: 0.4 }),
      T(40, 514, 340, 96, '{ngay_so}.{thang}', { font: 'Playfair Display', size: 84, color: '#ffffffe8', ls: 2, lh: 1.1, shadow: true, anim: 'up', delay: 0.3 }),
      T(30, 690, 360, 60, '{chu_re}', txt(p, 'script', { font: p.script2, size: 48, anim: 'up' })),
      T(30, 746, 360, 30, '&', txt(p, 'serif', { size: 22, color: p.soft })),
      T(30, 774, 360, 60, '{co_dau}', txt(p, 'script', { font: p.script2, size: 48, anim: 'up', delay: 0.1 })),
      T(30, 846, 360, 22, '{thu}  ·  {ngay}', txt(p, 'sans', { size: 12, ls: 4 })),
    ]);
  },
  /** Bìa tràn ảnh + thẻ kính mờ phía dưới (hợp mẫu đêm / hoàng hôn) */
  coverFull(p, ph, o = {}) {
    const els = [
      I(0, 0, W, 860, ph[0], { anim: 'zoom' }),
      S(0, 0, W, 300, 'rect', { fill: '#00000080', grad: 'down' }),
      S(0, 500, W, 360, 'rect', { fill: '#000000b0', grad: 'up' }),
    ];
    // Sao lấp lánh gộp thành 1 dòng chữ để tiết kiệm phần tử
    if (o.stars) els.push(T(10, 150, 400, 140, '✦        ·      ✧            ·\n    ·          ✦        ·        ✧\n ✧       ·            ✦      ·', { font: 'Be Vietnam Pro', size: 13, color: '#ffffffb0', lh: 2.6, align: 'left', anim: 'fade', delay: 0.5 }));
    els.push(
      T(20, 50, 380, 22, 'THIỆP MỜI CƯỚI', { font: p.sans, size: 12, ls: 8, color: '#ffffff', anim: 'fade' }),
      T(20, 78, 380, 44, p.t.tag, { font: p.script2, size: 32, color: '#ffffff', shadow: true, anim: 'fade', delay: 0.2 }),
      S(34, 610, 352, 214, 'rect', { fill: '#ffffff24', stroke: '#ffffff88', sw: 1, radius: 26, anim: 'up' }),
      T(34, 630, 352, 62, '{chu_re}  &  {co_dau}', { font: p.script2, size: 40, color: '#ffffff', shadow: true, anim: 'up', delay: 0.1 }),
      T(34, 700, 352, 32, '{ngay_so} . {thang} . {nam}', { font: p.serif, size: 24, ls: 4, color: '#ffffff', anim: 'up', delay: 0.2 }),
      T(34, 738, 352, 22, 'Nhằm ngày {am_lich}', { font: p.serif, size: 13.5, italic: true, color: '#ffffffd0', anim: 'up', delay: 0.25 }),
      T(34, 770, 352, 22, '{gio}  ·  {thu}', { font: p.sans, size: 12, ls: 3, color: '#ffffffd0', anim: 'up', delay: 0.3 })
    );
    return sec(860, p.bg, els);
  },
  /** Hai bên gia đình trên thẻ bo tròn */
  parents(p) {
    return sec(400, p.bg, [
      S(22, 30, 376, 340, 'rect', { fill: p.card, radius: 30, shadow: true, anim: 'up' }),
      T(42, 58, 160, 22, 'NHÀ TRAI', txt(p, 'label', { size: 12 })),
      T(42, 86, 160, 50, 'Ông: Lê Văn Bình\nBà: Phạm Thị Mai', txt(p, 'serif', { size: 15, lh: 1.6 })),
      T(42, 140, 160, 20, 'Quận 3, TP. Hồ Chí Minh', txt(p, 'sans', { size: 11.5 })),
      S(209.5, 60, 1, 104, 'line', { fill: p.line }),
      T(218, 58, 160, 22, 'NHÀ GÁI', txt(p, 'label', { size: 12 })),
      T(218, 86, 160, 50, 'Ông: Nguyễn Văn An\nBà: Trần Thị Hoa', txt(p, 'serif', { size: 15, lh: 1.6 })),
      T(218, 140, 160, 20, 'TP. Thủ Đức, TP. Hồ Chí Minh', txt(p, 'sans', { size: 11.5 })),
      T(42, 190, 336, 22, 'Trân trọng báo tin lễ thành hôn của con chúng tôi', txt(p, 'sans', { size: 12.5, italic: true })),
      T(42, 220, 336, 60, '{chu_re}  &  {co_dau}', txt(p, 'script', { font: p.script2, size: 38, color: p.accent, anim: 'up' })),
      T(52, 290, 316, 56, p.t.quote, txt(p, 'serif', { size: 14.5, italic: true, lh: 1.5 })),
    ]);
  },
  /** Lễ thành hôn: thẻ kính mờ trên ảnh làm mờ, ngày 3 cột, âm lịch, thêm vào lịch, chỉ đường */
  ceremony(p, src) {
    const addr = '120 Lý Chính Thắng, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh';
    const addr2 = '25 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh';
    return sec(830, p.bg2, [
      I(0, 0, W, 830, src, { filter: 'blur', zoom: 1.25 }),
      S(0, 0, W, 830, 'rect', { fill: p.veil }),
      S(28, 46, 364, 740, 'rect', { fill: p.glass, stroke: '#ffffffaa', sw: 1, radius: 30, shadow: true, anim: 'up' }),
      T(48, 74, 324, 58, 'Lễ Thành Hôn', txt(p, 'script', { font: p.script2, size: 42, anim: 'up' })),
      S(184, 142, 30, 30, 'ring', { stroke: p.accent, sw: 2, anim: 'zoom' }),
      S(206, 142, 30, 30, 'ring', { stroke: p.accent, sw: 2, anim: 'zoom' }),
      T(48, 214, 104, 56, '{thu}', txt(p, 'serif', { size: 19, italic: true, color: p.ink, lh: 1.3 })),
      S(152, 196, 1, 96, 'line', { fill: p.line }),
      T(155, 192, 110, 20, 'Ngày', txt(p, 'sans', { size: 12 })),
      T(155, 212, 110, 66, '{ngay_so}', txt(p, 'serif', { size: 56, bold: true, color: p.accent, lh: 1.1, anim: 'zoom' })),
      T(155, 278, 110, 20, 'Tháng {thang}', txt(p, 'sans', { size: 13, color: p.ink })),
      S(268, 196, 1, 96, 'line', { fill: p.line }),
      T(272, 214, 100, 56, 'Năm\n{nam}', txt(p, 'serif', { size: 19, italic: true, color: p.ink, lh: 1.3 })),
      T(48, 318, 324, 26, 'Vào lúc 10:00', txt(p, 'sans', { size: 16, bold: true, color: p.ink })),
      T(48, 346, 324, 22, '(Tức ngày {am_lich})', txt(p, 'serif', { size: 13.5, italic: true })),
      S(170, 384, 80, 1, 'line', { fill: p.accent }),
      T(48, 400, 324, 22, 'TẠI TƯ GIA NHÀ TRAI', txt(p, 'label', { size: 12 })),
      T(58, 426, 304, 44, addr, txt(p, 'sans', { size: 13, color: p.ink, lh: 1.6 })),
      G(110, 484, 200, 42, 'addcal', { ...wid(p), time: '10:00', address: addr }),
      G(110, 536, 200, 42, 'map', { ...wid(p), style: 'button', label: 'Xem bản đồ', address: addr }),
      S(70, 606, 280, 1, 'line', { fill: p.line }),
      T(48, 624, 324, 22, 'LỄ VU QUY  ·  08:30', txt(p, 'label', { size: 12 })),
      T(58, 650, 304, 44, 'Tại tư gia nhà gái\n' + addr2, txt(p, 'sans', { size: 12.5, lh: 1.6 })),
      G(130, 708, 160, 38, 'map', { ...wid(p), style: 'button', label: 'Chỉ đường', address: addr2 }),
    ]);
  },
  /** Chú rể / cô dâu: ảnh trong khung kính mờ trên nền chính ảnh đó làm mờ */
  person(p, src, label, token) {
    return sec(630, p.bg2, [
      I(0, 0, W, 630, src, { filter: 'blur', zoom: 1.3 }),
      S(0, 0, W, 630, 'rect', { fill: p.veil }),
      S(48, 36, 324, 478, 'rect', { fill: '#ffffff38', stroke: '#ffffffcc', sw: 1, radius: 28, shadow: true, anim: 'up' }),
      I(64, 52, 292, 410, src, { radius: 20, anim: 'fade' }),
      S(64, 362, 292, 100, 'rect', { fill: '#00000060', grad: 'up', radius: 20 }),
      T(64, 420, 292, 30, label, { font: p.sans, size: 15, bold: true, ls: 7, color: '#ffffff', shadow: true, upper: true }),
      T(30, 528, 360, 72, token, { font: p.script2, size: 50, color: '#ffffff', shadow: true, anim: 'up' }),
    ]);
  },
  /** Đĩa than có ảnh cưới – xoay khi phát nhạc, chạm để bật/tắt */
  vinyl(p, src) {
    return sec(520, p.bg2, [
      T(30, 38, 360, 56, p.t.song || 'Our Song', txt(p, 'script', { font: p.script2, size: 40, anim: 'fade' })),
      T(30, 94, 360, 20, 'CHẠM VÀO ĐĨA ĐỂ BẬT / TẮT NHẠC', txt(p, 'label', { size: 10, color: p.soft })),
      S(70, 132, 280, 280, 'circle', { fill: p.card, shadow: true, anim: 'zoom' }),
      S(84, 146, 252, 252, 'circle', { fill: '#141414', anim: 'zoom' }),
      S(100, 162, 220, 220, 'ring', { stroke: '#2f2f2f', sw: 1 }),
      S(116, 178, 188, 188, 'ring', { stroke: '#2f2f2f', sw: 1 }),
      I(148, 210, 124, 124, src, { mask: 'circle', anim: 'spin' }),
      S(203, 265, 14, 14, 'circle', { fill: p.bg2 }),
      S(330, 128, 24, 24, 'circle', { fill: '#d9d2c7', shadow: true }),
      S(326, 146, 6, 118, 'rect', { fill: '#bfb6aa', radius: 3, r: 16 }),
      T(40, 432, 340, 60, p.t.songLine || '“Mỗi bản nhạc là một kỷ niệm của hai ta.”', txt(p, 'serif', { size: 15, italic: true, lh: 1.5 })),
    ]);
  },
  /** Thư mời tiệc: tên khách, ảnh, giờ, ngày, âm lịch, nhà hàng lớn */
  invite(p, src, o = {}) {
    const addr = o.addr || 'Số 88 Hồ Tây, Phường Tây Hồ, Hà Nội';
    return sec(1010, p.bg, [
      S(22, 30, 376, 950, 'rect', { fill: p.card, radius: 30, shadow: true }),
      T(42, 58, 336, 42, 'Trân Trọng Kính Mời', txt(p, 'serif', { size: 26, italic: true, anim: 'fade' })),
      T(42, 102, 336, 52, '{ten_khach}', txt(p, 'script', { font: p.script2, size: 40, color: p.accent, anim: 'up' })),
      T(42, 158, 336, 44, 'TỚI DỰ TIỆC MỪNG CƯỚI\nCÙNG GIA ĐÌNH CHÚNG TÔI', txt(p, 'sans', { size: 12.5, bold: true, ls: 2, color: p.ink, lh: 1.6 })),
      I(42, 220, 336, 380, src, { radius: 22, anim: 'fade' }),
      T(42, 618, 336, 56, '{chu_re}  &  {co_dau}', txt(p, 'script', { font: p.script2, size: 36, anim: 'up' })),
      T(42, 682, 336, 22, 'VÀO LÚC {gio}  –  {thu}', txt(p, 'sans', { size: 12.5, bold: true, ls: 2 })),
      T(42, 706, 336, 50, '{ngay}', txt(p, 'serif', { size: 38, bold: true, color: p.accent, ls: 1 })),
      T(42, 758, 336, 20, '(Tức ngày {am_lich})', txt(p, 'serif', { size: 13.5, italic: true })),
      T(42, 792, 336, 22, 'TẠI NHÀ HÀNG', txt(p, 'label', { size: 12 })),
      T(42, 816, 336, 48, o.venue || 'Hoa Viên Palace', { font: p.display || 'Playfair Display', size: 34, color: p.ink }),
      T(52, 866, 316, 40, addr, txt(p, 'sans', { size: 12.5, lh: 1.6 })),
      G(120, 916, 180, 40, 'map', { ...wid(p), style: 'button', label: 'Xem bản đồ', address: addr }),
    ]);
  },
  /** Timeline xen kẽ trái/phải, biểu tượng trong vòng tròn */
  timeline(p) {
    const items = p.t.timeline || [
      ['♡', '15:45', 'Đón khách'],
      ['✦', '16:15', 'Nghi thức thành hôn'],
      ['❀', '17:00', 'Chụp hình lưu niệm'],
      ['✧', '19:00', 'Cắt bánh · Rót rượu'],
      ['♫', '20:00', 'Tiệc chung vui'],
    ];
    const els = [T(30, 40, 360, 64, 'Timeline', txt(p, 'script', { font: p.script2, size: 48, anim: 'fade' })), S(209.5, 128, 1, items.length * 110 - 30, 'line', { fill: p.line })];
    items.forEach((it, i) => {
      const y = 128 + i * 110;
      const left = i % 2 === 0;
      const cx = left ? 120 : 300;
      const an = left ? 'left' : 'right';
      els.push(
        S(cx - 26, y, 52, 52, 'circle', { fill: p.card, shadow: true, anim: an }),
        T(cx - 26, y + 11, 52, 30, it[0], { font: 'Noto Serif', size: 20, color: p.accent, anim: an }),
        S(205, y + 22, 9, 9, 'circle', { fill: p.bg, stroke: p.accent, sw: 1.5 }),
        T(cx - 80, y + 58, 160, 24, it[1], txt(p, 'sans', { size: 16, bold: true, color: p.accent, anim: an })),
        T(cx - 80, y + 82, 160, 22, it[2], txt(p, 'sans', { size: 12.5, color: p.ink, anim: an }))
      );
    });
    return sec(128 + items.length * 110 + 30, p.bg, els);
  },
  /** Đếm ngược */
  countdown(p) {
    return sec(320, p.bg2, [
      T(30, 36, 360, 60, 'Count Down', txt(p, 'script', { font: p.script2, size: 44, anim: 'fade' })),
      T(40, 96, 340, 44, p.t.count || 'Cùng đếm ngược tới ngày hôm đó nhé', txt(p, 'serif', { size: 15, italic: true, lh: 1.5 })),
      G(40, 160, 340, 104, 'countdown', { ...wid(p), anim: 'up' }),
    ]);
  },
  /** Ký tên lưu bút đè lên ảnh */
  signature(p, src) {
    return sec(760, p.bg, [
      T(30, 34, 360, 60, 'Signature', txt(p, 'script', { font: p.script2, size: 44, anim: 'fade' })),
      T(30, 94, 360, 22, 'KÝ TÊN', txt(p, 'label', { size: 13, ls: 6 })),
      T(40, 122, 340, 44, 'Để lại chữ ký của bạn và cùng chúng mình lưu giữ kỷ niệm hạnh phúc này nhé!', txt(p, 'sans', { size: 13, lh: 1.6 })),
      I(30, 184, 360, 540, src, { radius: 24, shadow: true, anim: 'fade' }),
      S(30, 184, 360, 540, 'rect', { fill: '#00000038', radius: 24 }),
      T(30, 212, 360, 50, '{chu_re}  &  {co_dau}', { font: p.script2, size: 34, color: '#ffffff', shadow: true }),
      G(30, 268, 360, 440, 'signature', { ...wid(p) }),
    ]);
  },
  /** Love story theo năm, ảnh ngang bo góc */
  story(p, ph) {
    const CH = p.t.story || [
      ['2019 · LẦN ĐẦU GẶP GỠ', 'Hôm đó trời chẳng có gì đặc biệt, nhưng có một người nói chuyện đủ ấm để mình muốn trả lời thêm một lần nữa.'],
      ['2021 · THƯƠNG NHAU', 'Từ những tin nhắn cho đỡ buồn, tụi mình nhận ra chỉ cần có nhau là mọi mệt mỏi đều nhẹ đi.'],
      ['2026 · LỜI CẦU HÔN', 'Tình yêu của tụi mình không ồn ào, cũng chẳng hoàn hảo – nhưng sau tất cả, cả hai vẫn chọn ở bên nhau.'],
    ];
    const els = [T(30, 38, 360, 64, 'Love Story', txt(p, 'script', { font: p.script2, size: 48, anim: 'fade' }))];
    CH.forEach((c, i) => {
      const y = 124 + i * 326;
      els.push(
        I(40, y, 340, 204, ph[i] || ph[0], { radius: 18, shadow: true, anim: 'up' }),
        T(40, y + 218, 340, 22, c[0], txt(p, 'label', { size: 12, anim: 'up' })),
        T(46, y + 246, 328, 66, c[1], txt(p, 'sans', { size: 13, lh: 1.7, anim: 'up' }))
      );
    });
    return sec(124 + CH.length * 326 + 10, p.bg2, els);
  },
  /** Album ghép so le */
  album(p, ph) {
    return sec(900, p.bg, [
      T(30, 34, 360, 60, 'Album', txt(p, 'script', { font: p.script2, size: 48, anim: 'fade' })),
      T(30, 94, 360, 22, 'lưu giữ khoảnh khắc', txt(p, 'serif', { size: 15, italic: true })),
      I(24, 136, 240, 330, ph[0], { radius: 16, anim: 'left' }),
      I(274, 136, 122, 160, ph[1] || ph[0], { radius: 16, anim: 'right' }),
      I(274, 306, 122, 160, ph[2] || ph[0], { radius: 16, anim: 'right', delay: 0.1 }),
      I(24, 476, 122, 160, ph[3] || ph[0], { radius: 16, anim: 'left' }),
      I(24, 646, 122, 160, ph[5] || ph[0], { radius: 16, anim: 'left', delay: 0.1 }),
      I(156, 476, 240, 330, ph[4] || ph[0], { radius: 16, anim: 'right' }),
      T(30, 830, 360, 30, '{ngay}', txt(p, 'serif', { size: 18, ls: 6, color: p.accent })),
    ]);
  },
  /** Xác nhận, lời nhắn (có chế độ riêng tư), dresscode, hộp quà chạm để mở */
  forms(p) {
    const gift = CUR_TIER !== 'free';
    const head = (y, t) => T(30, y, 360, 60, t, txt(p, 'script', { font: p.script2, size: 44, anim: 'fade' }));
    const els = [
      head(36, 'Xác Nhận'),
      T(40, 98, 340, 44, 'Hãy xác nhận sự hiện diện của Quý Khách để gia đình chúng tôi chuẩn bị chu đáo hơn.', txt(p, 'sans', { size: 13, lh: 1.6 })),
      G(30, 156, 360, 420, 'rsvp', { ...wid(p) }),
      head(606, 'Gửi Lời Nhắn'),
      G(30, 672, 360, 480, 'wishes', { ...wid(p), privacy: true }),
      head(1184, 'Dresscode'),
      T(40, 1246, 340, 44, p.t.dressLine || 'Rất mong Quý Khách chọn trang phục theo các tông màu dưới đây để cùng hoà vào không khí buổi tiệc.', txt(p, 'sans', { size: 13, lh: 1.6 })),
      G(30, 1300, 360, 110, 'dresscode', { ...wid(p), colors: p.t.dress }),
    ];
    if (gift) {
      els.push(
        head(1440, 'Share the Love'),
        T(40, 1500, 340, 22, 'Gửi quà mừng tới cô dâu, chú rể', txt(p, 'sans', { size: 13 })),
        G(40, 1536, 340, 300, 'gift', { ...wid(p), style: 'box' })
      );
    }
    return sec(gift ? 1870 : 1440, p.bg2, els);
  },
  /** Lời cảm ơn trên ảnh */
  thanks(p, src) {
    return sec(700, p.bg, [
      I(0, 0, W, 700, src, { anim: 'zoom' }),
      S(0, 300, W, 400, 'rect', { fill: '#000000b8', grad: 'up' }),
      T(30, 470, 360, 80, 'Thank You!', { font: p.script2, size: 60, color: '#ffffff', shadow: true, anim: 'up' }),
      T(50, 556, 320, 50, 'Sự hiện diện của Quý Khách là niềm vinh hạnh cho gia đình chúng tôi.', { font: p.sans, size: 13, color: '#ffffffe0', lh: 1.6, anim: 'up' }),
      T(30, 620, 360, 40, '{chu_re}  &  {co_dau}', { font: p.script2, size: 28, color: '#ffffff', anim: 'up' }),
    ]);
  },
};

/** Ghép trọn bộ trang cho một mẫu kính mờ. full = có chú rể/cô dâu riêng, đĩa than, love story */
function glassBuild(p, ph, o = {}) {
  const at = (i) => ph[i % ph.length];
  const s = [o.coverFull ? GL.coverFull(p, ph, { stars: o.stars }) : GL.cover(p, ph), GL.parents(p), GL.ceremony(p, at(1))];
  if (o.full) s.push(GL.person(p, at(o.groom), 'Chú Rể', '{chu_re}'), GL.person(p, at(o.bride), 'Cô Dâu', '{co_dau}'), GL.vinyl(p, at(2)));
  s.push(GL.invite(p, at(3), o), GL.timeline(p), GL.countdown(p), GL.signature(p, at(4)));
  if (o.full) s.push(GL.story(p, [at(5), at(6), at(7)]));
  s.push(GL.album(p, [at(8), at(9), at(10), at(11), at(5), at(6)]), GL.forms(p), GL.thanks(p, at(o.thanks == null ? 12 : o.thanks)));
  return s;
}

// ===================== 17 MẪU =====================
const img = (folder, list) => list.map((n) => `/img/mau/${folder}/${String(n).padStart(2, '0')}.jpg`);
const F = {
  vibes: 'Great Vibes',
  dancing: 'Dancing Script',
  charm: 'Charm',
  playfair: 'Playfair Display',
  corm: 'Cormorant Garamond',
  lora: 'Lora',
  prata: 'Prata',
  mont: 'Montserrat',
  be: 'Be Vietnam Pro',
};

const DEFS = [
  {
    key: 'tap-chi-tinh-yeu', opener: 'book', name: 'Tạp Chí Tình Yêu', folder: 'a1', tier: 'basic', song: 'marry-you', tags: ['Tạp chí', 'Hàn Quốc'],
    desc: 'Bìa tạp chí ảnh tràn viền, tiêu đề nghiêng vàng nhạt, phong cách retro Hàn.',
    p: { page: '#1f1b18', bg: '#f6f1ea', bg2: '#efe6da', ink: '#2c2420', soft: '#7c6d62', accent: '#9c6b3c', line: '#cdb89c', gold: '#f1d39a', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.magazine(p, [ph[0]]), secInvite(p), COUPLE.tall(p, [ph[1]]), EVENT.bigdate(p), GALLERY.collage(p, [ph[2], ph[3], ph[4], ph[5]]), secQuote(p, ph[3]), secForms(p), THANKS.full(p, ph[2])],
    photos: [4, 8, 5, 1, 6, 7],
  },
  {
    key: 'phong-bi-hong-phan', noEnvelope: true, name: 'Phong Bì Hồng Phấn', folder: 'a2', tier: 'free', song: 'beautiful-girl', tags: ['Phong bì', 'Pastel'],
    desc: 'Ảnh cưới cài trong phong bì hồng phấn, dấu sáp trái tim, ảnh polaroid.',
    p: { page: '#f3dbe1', bg: '#fff6f8', bg2: '#ffecf0', ink: '#4a2533', soft: '#8a6573', accent: '#d6456c', line: '#efb5c4', env: '#f6c9d4', env2: '#eeb3c2', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.envelope(p, [ph[0]]), secInvite(p), COUPLE.circles(p, [ph[1], ph[0]]), EVENT.calendar(p), GALLERY.polaroids(p, [ph[2], ph[3], ph[4], ph[5]]), secForms(p), THANKS.arch(p, ph[6])],
    photos: [6, 8, 9, 3, 1, 7, 2],
  },
  {
    key: 'hanok-co-dien', opener: 'envelope', name: 'Hanok Cổ Điển', folder: 'a3', tier: 'basic', song: 'canon-in-d', tags: ['Vintage', 'Hàn Quốc'],
    desc: 'Tông be nâu ấm như ngôi nhà gỗ Hàn, khung vòm cổ điển, chữ serif thanh lịch.',
    p: { page: '#e6dccd', bg: '#f8f2e8', bg2: '#f0e6d6', ink: '#3d2f24', soft: '#806d5c', accent: '#8b5a3c', line: '#c8ad8c', script: F.dancing, serif: F.corm, sans: F.be },
    build: (p, ph) => [COVERS.arch(p, [ph[0]]), secInvite(p), COUPLE.arches(p, [ph[1], ph[2]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(3, 9), { cols: 3 }), secQuote(p, ph[3]), secForms(p), THANKS.arch(p, ph[5])],
    photos: [9, 2, 7, 1, 3, 8, 4, 9, 7],
  },
  {
    key: 'vuon-xanh-reu', noEnvelope: true, name: 'Vườn Xanh Rêu', folder: 'a4', tier: 'free', song: 'nhac-cuoi-nhe-nhang', tags: ['Phong bì', 'Thiên nhiên'],
    desc: 'Phong bì xanh rêu và ảnh polaroid, cảm hứng tiệc cưới sân vườn.',
    p: { page: '#dfe4d6', bg: '#f6f6ef', bg2: '#eceee2', ink: '#2f3a2c', soft: '#6f7a68', accent: '#5b7247', line: '#b6c4a4', env: '#5f7650', env2: '#4f6542', seal: '#c9a46a', script: F.vibes, serif: F.lora, sans: F.be },
    build: (p, ph) => [COVERS.envelope(p, [ph[0]], { title: 'Wedding Day' }), secInvite(p), COUPLE.polaroid(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), secForms(p), THANKS.arch(p, ph[0])],
    photos: [6, 5, 7, 1, 4, 2, 3],
  },
  {
    key: 'phim-den-trang', opener: 'fingerprint', name: 'Phim Đen Trắng', folder: 'a5', tier: 'premium', song: 'a-thousand-years', tags: ['Điện ảnh', 'Đen trắng'],
    desc: 'Dải phim đen trắng, nền tối điện ảnh, chữ trắng tinh tế.',
    p: { page: '#000000', bg: '#141414', bg2: '#1d1d1d', ink: '#f5f2ec', soft: '#bdb6aa', accent: '#c9a46a', line: '#4a463f', filmText: '#ffffff', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [
      COVERS.film(p, [ph[0], ph[1], ph[2]], { filter: 'bw' }),
      secInvite(p),
      COUPLE.tall(p, [ph[3]]),
      EVENT.bigdate(p),
      GALLERY.film(p, [ph[4], ph[5], ph[6]]),
      secForms(p, { dark: true }),
      THANKS.full(p, ph[1]),
    ],
    photos: [4, 6, 8, 7, 3, 1, 9],
  },
  {
    key: 'monochrome-studio', opener: 'fingerprint', name: 'Monochrome Studio', folder: 'a6', tier: 'basic', song: 'le-duong', tags: ['Tối giản', 'Studio'],
    desc: 'Đen – trắng – xám tối giản kiểu tạp chí thời trang, bố cục ảnh lớn.',
    p: { page: '#d9d9d9', bg: '#fafafa', bg2: '#f0f0f0', ink: '#1c1c1c', soft: '#6b6b6b', accent: '#1c1c1c', line: '#c4c4c4', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.split(p, [ph[0]], { filter: 'bw' }), secInvite(p), COUPLE.arches(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.grid(p, ph.slice(3, 11), { cols: 2, radius: 0 }), secQuote(p, ph[4]), secForms(p), THANKS.arch(p, ph[11])],
    photos: [8, 9, 10, 1, 4, 2, 3, 6, 7, 11, 5, 12],
  },
  {
    key: 'lich-kep-giay', name: 'Studio Lịch Kẹp Giấy', folder: 'a7', tier: 'free', song: 'cant-stop-the-feeling', tags: ['Tối giản', 'Studio'],
    desc: 'Nền trắng studio, tờ lịch kẹp giấy nghiêng đánh dấu ngày cưới.',
    p: { page: '#e9e7e2', bg: '#f7f6f3', bg2: '#efede8', ink: '#2a2a2a', soft: '#777169', accent: '#b0533c', line: '#d4cfc6', script: F.dancing, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.clip(p, [ph[0]]), secInvite(p), COUPLE.circles(p, [ph[1], ph[2]]), EVENT.bigdate(p), GALLERY.polaroids(p, [ph[3], ph[4], ph[5], ph[6]]), secForms(p), THANKS.arch(p, ph[7])],
    photos: [5, 1, 10, 2, 8, 7, 11, 4],
  },
  {
    key: 'xanh-suong-mai', opener: 'envelope', name: 'Xanh Sương Mai', folder: 'a8', tier: 'basic', song: 'vay-cuoi', tags: ['Khung vòm', 'Thanh lịch'],
    desc: 'Xanh xám nhạt và trắng bạc, khung vòm mảnh, cảm giác trong trẻo.',
    p: { page: '#d5dde3', bg: '#f4f7f8', bg2: '#e8eef1', ink: '#2b3a44', soft: '#6c7c86', accent: '#4f7085', line: '#b5c6d0', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.arch(p, [ph[0]]), secInvite(p), COUPLE.arches(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), secForms(p), THANKS.arch(p, ph[7])],
    photos: [1, 4, 8, 2, 6, 7, 10, 9],
  },
  {
    key: 'dong-co-mua-ha', featured: 2, name: 'Đồng Cỏ Mùa Hạ', folder: 'a9', tier: 'free', song: 'i-do', tags: ['Thiên nhiên', 'Tươi sáng'],
    desc: 'Ảnh tràn viền giữa đồng cỏ, chữ viết tay “Fall in love”, tông xanh nắng.',
    p: { page: '#dfe8d3', bg: '#f8faf2', bg2: '#eef3e2', ink: '#2e3b25', soft: '#6b7a5e', accent: '#6b8f3a', line: '#c2d3a6', script: F.vibes, serif: F.lora, sans: F.mont },
    build: (p, ph) => [COVERS.full(p, [ph[0]], { title: 'Fall in love', shade: '#1d2b1288' }), secInvite(p), COUPLE.polaroid(p, [ph[1], ph[2]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(3, 9), { cols: 2 }), secQuote(p, ph[9]), secForms(p), THANKS.full(p, ph[10])],
    photos: [2, 6, 9, 3, 4, 5, 7, 10, 11, 12, 1],
  },
  {
    key: 'hong-pastel-ngot-ngao', featured: 2, name: 'Hồng Pastel Ngọt Ngào', folder: 'a10', tier: 'free', song: 'em-dong-y', tags: ['Pastel', 'Lãng mạn'],
    desc: 'Hồng pastel ngọt ngào, ảnh lớn phía trên, thẻ chữ bo tròn mềm mại.',
    p: { page: '#f7dfe4', bg: '#fff7f8', bg2: '#ffeef1', ink: '#4b2a35', soft: '#8d6a75', accent: '#e05a7f', line: '#f2bccb', script: F.vibes, serif: F.corm, sans: F.be },
    build: (p, ph) => [COVERS.split(p, [ph[0]], { title: 'Marry me' }), secInvite(p), COUPLE.circles(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.polaroids(p, [ph[3], ph[4], ph[5], ph[6]]), GALLERY.grid(p, ph.slice(7, 11), { cols: 2, title: 'Thêm chút ngọt ngào' }), secForms(p), THANKS.arch(p, ph[11])],
    photos: [10, 2, 3, 4, 5, 8, 9, 6, 7, 11, 12, 1],
  },
  {
    key: 'hy-su-vui-nhon', featured: 2, name: 'Hỷ Sự Vui Nhộn', folder: 'a11', tier: 'free', song: 'bai-nay-khong-de-di-dien', tags: ['Truyền thống', 'Chữ Hỷ'],
    desc: 'Đỏ son và vàng kim, chữ Hỷ lớn, khung viền đôi truyền thống.',
    p: { page: '#5e0a12', bg: '#9e1622', bg2: '#fff6ec', ink: '#5a1018', soft: '#8a5a50', accent: '#b3202f', line: '#e3b766', gold: '#f1c66b', cream: '#fff3dc', script: F.vibes, serif: F.playfair, sans: F.be },
    build: (p, ph) => [COVERS.hy(p, [ph[0]]), secInvite(p), COUPLE.tall(p, [ph[1]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(2, 10), { cols: 2 }), secForms(p, { bg: '#fff6ec' }), THANKS.full(p, ph[10])],
    photos: [4, 2, 1, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    key: 'do-son-song-hy', featured: 2, opener: 'doors', name: 'Đỏ Son Song Hỷ', folder: 'a12', tier: 'basic', song: 'mai-mai-ben-nhau', tags: ['Truyền thống', 'Sang trọng'],
    desc: 'Ảnh tràn viền nền đỏ son, chữ viết tay vàng, khung vòm đôi.',
    p: { page: '#4a0910', bg: '#fff5ef', bg2: '#fbe9e1', ink: '#5b1219', soft: '#8b5d58', accent: '#b81f2d', line: '#e2b2a6', script: F.vibes, serif: F.playfair, sans: F.be },
    build: (p, ph) => [COVERS.full(p, [ph[0]], { title: 'Song Hỷ Lâm Môn', shade: '#3d050999' }), secInvite(p), COUPLE.arches(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), secForms(p), THANKS.arch(p, ph[7])],
    photos: [1, 3, 2, 4, 6, 7, 9, 8],
  },
  {
    key: 'phong-bi-do-nhung', featured: 2, noEnvelope: true, opener: 'envelope', name: 'Phong Bì Đỏ Nhung', folder: 'a13', tier: 'premium', song: 'beautiful-in-white', tags: ['Phong bì', 'Sang trọng'],
    desc: 'Phong bì đỏ nhung dấu sáp vàng trên nền kem, hoà quyện cổ phục và váy cưới.',
    p: { page: '#e9ddd0', bg: '#fbf5ee', bg2: '#f4e9dd', ink: '#4e1218', soft: '#866159', accent: '#9f1c28', line: '#d9b38f', env: '#9f1c28', env2: '#861522', seal: '#d8aa5a', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.envelope(p, [ph[0]]), secInvite(p), COUPLE.circles(p, [ph[1], ph[2]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(3, 11), { cols: 2 }), secForms(p), THANKS.arch(p, ph[11])],
    photos: [1, 10, 9, 2, 3, 4, 6, 7, 8, 11, 12, 5],
  },
  {
    key: 'phieu-luu-nui-tuyet', featured: 2, opener: 'book', name: 'Phiêu Lưu Núi Tuyết', folder: 'a14', tier: 'premium', song: 'vay-cuoi', tags: ['Poster', 'Du lịch'],
    desc: 'Poster chữ lớn “WE GOT MARRIED” trên nền núi tuyết, hồ xanh.',
    p: { page: '#cfd8df', bg: '#f3f6f8', bg2: '#e6edf1', ink: '#1f2d38', soft: '#62717d', accent: '#2f5d7c', line: '#b3c3cf', gold: '#ffd27a', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.poster(p, [ph[0]]), secInvite(p), COUPLE.tall(p, [ph[1]]), EVENT.calendar(p), GALLERY.collage(p, [ph[2], ph[3], ph[4], ph[5]], { title: 'Những chuyến đi' }), secQuote(p, ph[5], '“Đi cùng nhau, đâu cũng là nhà.”'), secForms(p), THANKS.full(p, ph[6])],
    photos: [5, 6, 1, 4, 7, 8, 2],
  },
  {
    key: 'bao-cuoi', featured: 2, opener: 'book', name: 'Báo Cưới', folder: 'a15', tier: 'basic', song: 'bai-nay-khong-de-di-dien', tags: ['Báo cưới', 'Vintage'],
    desc: 'Tờ báo cổ điển đưa “tin nóng” đám cưới, cột chữ và ảnh tư liệu.',
    p: { page: '#d9d2c3', bg: '#f4efe4', bg2: '#ece5d6', ink: '#221e19', soft: '#6e665b', accent: '#9c2a3b', line: '#bfb39c', script: F.dancing, serif: F.lora, sans: F.be },
    build: (p, ph) => [COVERS.newspaper(p, [ph[0]]), secInvite(p), COUPLE.polaroid(p, [ph[1], ph[2]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(3, 9), { cols: 2, radius: 0, title: 'Phóng sự ảnh' }), secForms(p), THANKS.arch(p, ph[1])],
    photos: [1, 4, 12, 2, 5, 13, 6, 3, 11],
  },
  {
    key: 'do-do-chu-vang', featured: 2, opener: 'doors', name: 'Đỏ Đô Chữ Vàng', folder: 'a16', tier: 'basic', song: 'le-duong', tags: ['Đỏ đô', 'Chữ viết tay'],
    desc: 'Nền đỏ đô sâu, chữ viết tay vàng kim, khung vòm và thước phim.',
    p: { page: '#3a070c', bg: '#6d1119', bg2: '#5b0d15', ink: '#fbe8c8', soft: '#e7c9a4', accent: '#d9a74a', line: '#d9a74a', filmText: '#fbe8c8', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.arch(p, [ph[0]]), secInvite(p), COUPLE.arches(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.film(p, [ph[3], ph[4], ph[5]]), secForms(p, { dark: true }), THANKS.arch(p, ph[6])],
    photos: [3, 6, 9, 7, 2, 4, 8],
  },
  {
    key: 'pho-co-chau-au', opener: 'fingerprint', name: 'Phố Cổ Châu Âu', folder: 'a17', tier: 'premium', song: 'canon-in-d', tags: ['Thanh lịch', 'Châu Âu'],
    desc: 'Phố cổ kiến trúc châu Âu, tông xám ngà sang trọng, chữ serif kinh điển.',
    p: { page: '#d8d3cc', bg: '#f7f5f1', bg2: '#ece8e1', ink: '#2b2826', soft: '#75706a', accent: '#7a6248', line: '#c8bfb2', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.full(p, [ph[0]], { title: 'Forever begins', shade: '#1a161299' }), secInvite(p), COUPLE.tall(p, [ph[1]]), EVENT.bigdate(p), GALLERY.collage(p, [ph[2], ph[3], ph[4], ph[5]]), secQuote(p, ph[6]), secForms(p), THANKS.arch(p, ph[7])],
    photos: [1, 10, 3, 9, 6, 12, 11, 5],
  },

  // ===== 14 mẫu mới 16/11/2026 (ảnh a18–a31). Ảnh đủ cô dâu chú rể luôn đứng đầu làm ảnh bìa. =====
  {
    key: 'hanok-tinh-khoi', name: 'Hanok Tinh Khôi', folder: 'a18', tier: 'basic', opener: 'book', featured: true, song: 'beautiful-in-white', tags: ['Hàn Quốc', 'Studio'],
    desc: 'Trắng – đỏ son tinh tế, thẻ “Save the Date” bo tròn, chuyện tình 4 chương và lịch trình lễ cưới.',
    p: { page: '#ece9e4', bg: '#ffffff', bg2: '#f7f5f1', ink: '#1d1c1a', soft: '#6d6a64', accent: '#b3262d', line: '#e2ddd5', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.hero(p, [ph[0], ph[1]]), secInvite(p), COUPLE.arches(p, [ph[2], ph[3]]), secStory(p, [ph[4], ph[5], ph[6], ph[7]]), secSchedule(p), GALLERY.grid(p, [ph[8], ph[9], ph[10], ph[12]], { cols: 2 }), secLetter(p, ph[11]), secForms(p), THANKS.arch(p, ph[1])],
    photos: [16, 8, 6, 5, 1, 12, 4, 10, 15, 13, 3, 14, 9],
  },
  {
    key: 'anh-sang-studio', name: 'Ánh Sáng Studio', folder: 'a19', tier: 'free', song: 'i-do', tags: ['Tối giản', 'Studio'],
    desc: 'Ảnh studio tràn viền, tông xám trắng nhẹ nhàng, bố cục tối giản dễ dùng.',
    p: { page: '#e4e4e2', bg: '#fbfbfa', bg2: '#f1f1ef', ink: '#232323', soft: '#707070', accent: '#8a7a66', line: '#d2cdc5', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.full(p, [ph[0]], { shade: '#11111199' }), secInvite(p), COUPLE.arches(p, [ph[3], ph[4]]), EVENT.calendar(p), GALLERY.collage(p, [ph[1], ph[2], ph[5], ph[6]]), secForms(p), THANKS.arch(p, ph[7])],
    photos: [6, 9, 1, 2, 4, 8, 7, 5],
  },
  {
    key: 'mua-yeu-den-trang', name: 'Mùa Yêu Đen Trắng', folder: 'a20', tier: 'premium', opener: 'fingerprint', song: 'a-thousand-years', tags: ['Đen trắng', 'Cá tính'],
    desc: 'Đen trắng cá tính, chạm vân tay mở thiệp, thước phim và chuyện tình kể theo chương.',
    op: { color: '#1d1c1a', paper: '#f7f6f4' },
    p: { page: '#1a1a1a', bg: '#f7f6f4', bg2: '#efeeeb', ink: '#151515', soft: '#666666', accent: '#151515', line: '#cfcac2', filmText: '#151515', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.frame(p, [ph[0]]), secInvite(p), GALLERY.stagger(p, [ph[1], ph[2]]), secStory(p, [ph[3], ph[4], ph[5], ph[6]]), secSchedule(p), GALLERY.film(p, [ph[7], ph[8], ph[4]]), secForms(p), THANKS.full(p, ph[2])],
    photos: [8, 10, 9, 1, 5, 2, 4, 11, 6, 3],
  },
  {
    key: 'lua-trang-thanh-lich', name: 'Lụa Trắng Thanh Lịch', folder: 'a21', tier: 'premium', opener: 'envelope', featured: true, song: 'canon-in-d', tags: ['Sang trọng', 'Studio'],
    desc: 'Ngày cưới cỡ lớn trên nền ảnh tối, tông champagne, phong bì dấu sáp và hộp mừng cưới QR.',
    p: { page: '#e8e1d8', bg: '#fbf8f4', bg2: '#f3ede5', ink: '#2e2a26', soft: '#7a7067', accent: '#a07c4f', line: '#d8c9b4', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.datebig(p, [ph[0]]), secInvite(p), COUPLE.arches(p, [ph[2], ph[3]]), EVENT.bigdate(p), GALLERY.stack(p, [ph[1], ph[5], ph[6]]), secLetter(p, ph[7]), secForms(p), THANKS.full(p, ph[4])],
    photos: [2, 10, 11, 3, 1, 8, 4, 9, 6, 7],
  },
  {
    key: 'hoa-hong-do', name: 'Hoa Hồng Đỏ', folder: 'a22', tier: 'basic', opener: 'envelope', featured: true, song: 'mai-mai-ben-nhau', tags: ['Lãng mạn', 'Hoa'],
    desc: 'Cổng hoa hồng đỏ rực rỡ, khung vòm cổ điển, phong bì đỏ dấu sáp vàng.',
    p: { page: '#f3e3e1', bg: '#fffaf8', bg2: '#fbefec', ink: '#4a1d22', soft: '#8a6563', accent: '#c2283a', line: '#e9b8b5', script: F.vibes, serif: F.corm, sans: F.be },
    build: (p, ph) => [COVERS.arch(p, [ph[0]]), secInvite(p), COUPLE.circles(p, [ph[2], ph[3]]), secSchedule(p), GALLERY.grid(p, ph.slice(4, 10), { cols: 2 }), secQuote(p, ph[11]), secForms(p), THANKS.arch(p, ph[1])],
    photos: [4, 7, 10, 6, 3, 2, 1, 5, 9, 11, 12, 8],
  },
  {
    key: 'nang-trang-thang-nam', name: 'Nắng Trắng Tháng Năm', folder: 'a23', tier: 'free', song: 'em-dong-y', tags: ['Tươi sáng', 'Hàn Quốc'],
    desc: 'Ảnh trên – chữ dưới kiểu Hàn, nắng trắng trong trẻo, nhiều ảnh album.',
    p: { page: '#e9ece6', bg: '#fcfcfa', bg2: '#f2f4ef', ink: '#2f332c', soft: '#737a6e', accent: '#7d8f5a', line: '#cfd6c2', script: F.vibes, serif: F.corm, sans: F.be },
    build: (p, ph) => [COVERS.split(p, [ph[0]]), secInvite(p), COUPLE.tall(p, [ph[1]]), EVENT.calendar(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), GALLERY.grid(p, [ph[7], ph[8], ph[9], ph[10]], { cols: 2, title: 'Thêm chút nắng' }), secForms(p), THANKS.arch(p, ph[2])],
    photos: [1, 10, 3, 9, 11, 14, 6, 5, 7, 13, 16],
  },
  {
    key: 'hoa-trang-tinh-khoi', name: 'Hoa Trắng Tinh Khôi', folder: 'a24', tier: 'premium', opener: 'book', featured: true, song: 'a-thousand-years', tags: ['Sang trọng', 'Hoa'],
    desc: 'Vườn hoa trắng sang trọng, lật bìa mở thiệp, chuyện tình, lịch trình và lời ngỏ.',
    p: { page: '#e6e9e1', bg: '#fdfdfb', bg2: '#f4f5f0', ink: '#26302a', soft: '#6b7468', accent: '#4f6b4a', line: '#cdd5c6', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.hero(p, [ph[0], ph[1]]), secInvite(p), GALLERY.stagger(p, [ph[2], ph[3]]), secStory(p, [ph[4], ph[5], ph[6], ph[7]]), secSchedule(p), GALLERY.grid(p, [ph[8], ph[9], ph[10], ph[13]], { cols: 2 }), secLetter(p, ph[14]), GALLERY.stack(p, [ph[11], ph[12], ph[15]]), secForms(p), THANKS.full(p, ph[2])],
    photos: [14, 1, 9, 15, 7, 12, 19, 21, 3, 5, 2, 6, 10, 16, 23, 13],
  },
  {
    key: 'sac-mau-thanh-pho', name: 'Sắc Màu Thành Phố', folder: 'a25', tier: 'basic', opener: 'fingerprint', song: 'marry-you', tags: ['Trẻ trung', 'Poster'],
    desc: 'Poster chữ lớn trên nền vàng rực, polaroid vui nhộn, hợp cặp đôi trẻ trung.',
    p: { page: '#f4ead0', bg: '#fffbf0', bg2: '#fff3d6', ink: '#3a2a14', soft: '#7d6a4c', accent: '#e0861f', line: '#f0cf8a', gold: '#ffd166', script: F.dancing, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.poster(p, [ph[0]], { title: 'WE\nSAID\nYES' }), secInvite(p), COUPLE.tall(p, [ph[3]]), EVENT.bigdate(p), GALLERY.polaroids(p, [ph[1], ph[2], ph[4], ph[5]]), GALLERY.grid(p, [ph[6], ph[7], ph[8], ph[10]], { cols: 2, title: 'Thành phố của hai ta' }), secForms(p), THANKS.full(p, ph[1])],
    photos: [8, 2, 3, 9, 6, 7, 5, 1, 11, 10, 12],
  },
  {
    key: 'le-cuoi-tren-doi', name: 'Lễ Cưới Trên Đồi', folder: 'a26', tier: 'premium', opener: 'envelope', song: 'nhac-cuoi-nhe-nhang', tags: ['Ngoài trời', 'Hoa'],
    desc: 'Lễ cưới ngoài trời dưới vòm kính và hoa, hoàng hôn trên đồi, tông xanh trời – cam đào.',
    p: { page: '#e3e8ec', bg: '#fbfcfd', bg2: '#f1f5f7', ink: '#253341', soft: '#66737f', accent: '#d9846b', line: '#c9d6df', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.frame(p, [ph[0]]), secInvite(p), GALLERY.stagger(p, [ph[1], ph[2]]), secSchedule(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), secQuote(p, ph[11], '“Ở đâu có nhau, ở đó là nhà.”'), GALLERY.grid(p, [ph[7], ph[8], ph[9], ph[10]], { cols: 2, title: 'Hoàng hôn trên đồi' }), secForms(p), THANKS.full(p, ph[10])],
    photos: [2, 1, 4, 10, 14, 9, 8, 12, 19, 21, 22, 18],
  },
  {
    key: 'dem-thanh-pho', name: 'Đêm Thành Phố', folder: 'a27', tier: 'basic', opener: 'fingerprint', song: 'le-duong', tags: ['Điện ảnh', 'Đêm'],
    desc: 'Nền xanh đêm, ánh đèn phố và thước phim, chữ vàng ấm kiểu điện ảnh.',
    op: { color: '#e8b04b', paper: '#121826' },
    p: { page: '#0b0f1a', bg: '#121826', bg2: '#1a2133', ink: '#f3efe8', soft: '#b8b3c4', accent: '#e8b04b', line: '#3b4560', filmText: '#f3efe8', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.split(p, [ph[0]], { title: 'Our Night' }), secInvite(p), COUPLE.tall(p, [ph[1]]), GALLERY.film(p, [ph[2], ph[3], ph[4]]), EVENT.bigdate(p), GALLERY.grid(p, [ph[5], ph[6], ph[7], ph[8]], { cols: 2, radius: 0, title: 'Thành phố của hai ta' }), secQuote(p, ph[9]), secForms(p, { dark: true }), THANKS.full(p, ph[10])],
    photos: [10, 15, 12, 2, 5, 11, 13, 7, 6, 18, 16],
  },
  {
    key: 'dong-hoa-mua-ha', name: 'Đồng Hoa Mùa Hạ', folder: 'a28', tier: 'free', song: 'beautiful-girl', tags: ['Thiên nhiên', 'Tươi sáng'],
    desc: 'Đồng hoa cúc vàng và đồi xanh, chữ viết tay “Summer Love”, polaroid tươi vui.',
    p: { page: '#e3ead2', bg: '#fbfcf4', bg2: '#f1f5e2', ink: '#2c3a1f', soft: '#6c7a5c', accent: '#c98a12', line: '#d5dfb5', script: F.vibes, serif: F.lora, sans: F.mont },
    build: (p, ph) => [COVERS.full(p, [ph[0]], { title: 'Summer Love', shade: '#1d2b1288' }), secInvite(p), COUPLE.tall(p, [ph[2]]), EVENT.calendar(p), GALLERY.polaroids(p, [ph[3], ph[4], ph[5], ph[6]]), GALLERY.grid(p, [ph[7], ph[8], ph[9], ph[10]], { cols: 2 }), secForms(p), THANKS.full(p, ph[1])],
    photos: [13, 22, 7, 3, 1, 18, 21, 19, 24, 11, 20],
  },
  {
    key: 'hanbok-xuan-thi', name: 'Hanbok Xuân Thì', folder: 'a29', tier: 'premium', opener: 'doors', featured: true, song: 'em-dong-y', tags: ['Truyền thống', 'Hàn Quốc'],
    desc: 'Cổ phục và váy cưới, cửa hai cánh chữ Hỷ mở thiệp, sắc ngọc bích – đỏ son.',
    op: { color: '#7d1d24' },
    p: { page: '#e4ebe5', bg: '#fdfcf8', bg2: '#f2f5ef', ink: '#2b3a33', soft: '#6c7a72', accent: '#a3262e', line: '#cdd9cf', script: F.vibes, serif: F.playfair, sans: F.be },
    build: (p, ph) => [COVERS.hero(p, [ph[0], ph[1]], { mark: '囍' }), secInvite(p), COUPLE.arches(p, [ph[2], ph[3]]), secStory(p, [ph[4], ph[5], ph[6], ph[7]]), secSchedule(p), GALLERY.grid(p, [ph[8], ph[9], ph[10], ph[11]], { cols: 2 }), secLetter(p, ph[13]), secForms(p), THANKS.full(p, ph[0])],
    photos: [2, 14, 10, 13, 5, 11, 4, 18, 16, 1, 9, 12, 6, 7],
  },
  {
    key: 'khung-cua-vom', name: 'Khung Cửa Vòm', folder: 'a30', tier: 'basic', opener: 'envelope', song: 'vay-cuoi', tags: ['Lãng mạn', 'Châu Âu'],
    desc: 'Khung cửa vòm ngập nắng, tông be ấm, phong bì nâu dấu sáp cổ điển.',
    p: { page: '#e9dfd2', bg: '#fbf7f1', bg2: '#f3eadf', ink: '#3a2c22', soft: '#7e6c5d', accent: '#9b6a43', line: '#d9c3a8', script: F.vibes, serif: F.corm, sans: F.be },
    build: (p, ph) => [COVERS.arch(p, [ph[0]]), secInvite(p), GALLERY.stagger(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), secQuote(p, ph[7]), secForms(p), THANKS.arch(p, ph[9])],
    photos: [3, 6, 9, 1, 2, 4, 5, 7, 8, 10],
  },
  {
    key: 'lau-dai-anh-nen', name: 'Lâu Đài Ánh Nến', folder: 'a31', tier: 'basic', opener: 'book', featured: true, song: 'mai-mai-ben-nhau', tags: ['Cổ điển', 'Sang trọng'],
    desc: 'Lâu đài cổ điển ánh nến vàng, bìa tạp chí, chuyện tình và album 3 cột.',
    p: { page: '#2a2118', bg: '#fbf6ec', bg2: '#f3e9d6', ink: '#3a2a17', soft: '#7d6a52', accent: '#a8833a', line: '#dcc69a', gold: '#f1d39a', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.magazine(p, [ph[0]], { mast: 'LOVE NOTES', title: 'Golden\nHour' }), secInvite(p), COUPLE.arches(p, [ph[2], ph[3]]), secStory(p, [ph[4], ph[5], ph[6], ph[13]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(7, 13), { cols: 3 }), secQuote(p, ph[1]), secForms(p), THANKS.full(p, ph[14])],
    photos: [26, 1, 33, 7, 27, 4, 5, 8, 10, 11, 12, 14, 15, 20, 2],
  },
  // ===== 8 mẫu "kính mờ" 17/11/2026 (ảnh a32–a39) – tham khảo bố cục & tiện ích 27biggroup, thiết kế SOBA tự làm =====
  // noAuto: không chèn trang Hai gia đình / Phong bì ảnh (bố cục riêng đã có hai họ, lễ tư gia)
  {
    key: 'ngan-ha-sao-roi', name: 'Ngân Hà Sao Rơi', folder: 'a35', tier: 'premium', opener: 'stars', featured: 1, noAuto: true, song: 'a-thousand-years', tags: ['Ngân hà', 'Điện ảnh'],
    desc: 'Bầu trời sao rơi mở thiệp, nền xanh đêm ánh vàng, thẻ kính mờ, đĩa than và ký tên lưu bút.',
    op: { color: '#e2c78f', paper: '#0b1126' },
    p: {
      page: '#050913', bg: '#0d1328', bg2: '#111936', card: '#18213f', glass: '#121a36d0', veil: '#070b1a70', ink: '#f1ecdf', soft: '#aab0c8', accent: '#e2c78f', line: '#36426a',
      script: F.vibes, script2: 'Alex Brush', serif: F.corm, sans: F.mont, display: F.playfair,
      t: {
        tag: 'Written in the stars', quote: '“Giữa muôn vàn vì sao, chúng ta đã tìm thấy nhau.”', count: 'Mỗi ngôi sao rơi là một ngày gần nhau hơn', song: 'Starlight', songLine: '“Có những bản nhạc chỉ cần nghe một lần là nhớ cả đời – như em.”',
        dressLine: 'Mời Quý Khách khoác lên mình sắc màu của bầu trời đêm và những vì sao băng.',
        dress: [{ c: '#1d2a52', n: 'Xanh Đêm' }, { c: '#c9ccd6', n: 'Bạc Trăng' }, { c: '#5b4a8a', n: 'Tím Ngân Hà' }, { c: '#e2c78f', n: 'Vàng Sâm Panh' }],
        timeline: [['✦', '17:30', 'Đón khách'], ['♡', '18:00', 'Cử hành hôn lễ'], ['✧', '18:30', 'Khai tiệc'], ['♫', '19:30', 'Giao lưu âm nhạc'], ['❀', '20:30', 'Chụp ảnh dưới bầu trời sao']],
      },
    },
    build: (p, ph) => glassBuild(p, ph, { coverFull: true, stars: true, full: true, groom: 13, bride: 14, venue: 'Ngân Hà Palace' }),
    photos: [4, 6, 13, 5, 1, 9, 11, 8, 2, 7, 12, 15, 6, 16, 17],
  },
  {
    key: 'phao-hoa-champagne', name: 'Pháo Hoa Champagne', folder: 'a36', tier: 'premium', opener: 'curtain', featured: 1, noAuto: true, song: 'cant-stop-the-feeling', tags: ['Lấp lánh', 'Sang trọng'],
    desc: 'Pháo hoa que và ly champagne, tông kem – vàng sâm panh, rèm lụa mở thiệp cùng bướm bay.',
    op: { color: '#b08a3e', paper: '#f3e7d3' },
    p: {
      page: '#e9dfcf', bg: '#fbf7f0', bg2: '#f3eadb', card: '#ffffff', glass: '#fffaf2cc', veil: '#ffffff40', ink: '#3a2c1e', soft: '#8a7660', accent: '#b08a3e', line: '#e2d3b5',
      script: F.vibes, script2: 'Alex Brush', serif: F.corm, sans: F.mont, display: F.playfair,
      t: {
        tag: 'Cheers to forever', quote: '“Nâng ly cho những điều rực rỡ nhất – và cho hai ta.”', count: 'Pháo hoa đã sẵn sàng, chỉ còn chờ ngày ấy thôi!', song: 'Our Song',
        dressLine: 'Một chút lấp lánh, một chút sâm panh – mời Quý Khách chọn trang phục theo các tông màu dưới đây.',
        dress: [{ c: '#1d1b19', n: 'Đen Huyền' }, { c: '#e3c88f', n: 'Vàng Champagne' }, { c: '#f4efe4', n: 'Trắng Ngà' }, { c: '#6b4a35', n: 'Nâu Cacao' }],
        timeline: [['✧', '17:30', 'Đón khách · Tháp champagne'], ['♡', '18:00', 'Nghi thức thành hôn'], ['✦', '18:45', 'Nâng ly chúc mừng'], ['♫', '19:30', 'Tiệc & âm nhạc'], ['❀', '21:00', 'Pháo hoa que tiễn khách']],
      },
    },
    build: (p, ph) => glassBuild(p, ph, { coverFull: true, full: true, groom: 13, bride: 14, venue: 'Lumière Garden' }),
    photos: [6, 4, 7, 1, 2, 3, 10, 13, 11, 14, 15, 16, 12, 12, 8],
  },
  {
    key: 'cung-dien-anh-vang', name: 'Cung Điện Ánh Vàng', folder: 'a38', tier: 'premium', opener: 'curtain', featured: 1, noAuto: true, song: 'canon-in-d', tags: ['Cổ điển', 'Sang trọng'],
    desc: 'Cung điện cổ điển ánh vàng, rèm nhung đỏ rượu mở thiệp, chữ Prata sang trọng và hộp quà chạm để mở.',
    op: { color: '#c9a04a', paper: '#5a1a22' },
    p: {
      page: '#e6dccb', bg: '#fbf6ec', bg2: '#f2e8d6', card: '#fffdf8', glass: '#fffaf0cc', veil: '#ffffff38', ink: '#3b2a1c', soft: '#86715a', accent: '#a8813a', line: '#dcc89c',
      script: F.vibes, script2: 'Alex Brush', serif: F.corm, sans: F.mont, display: F.prata,
      t: {
        tag: 'A royal love story', quote: '“Tình yêu là lâu đài đẹp nhất mà hai ta cùng nhau xây nên.”', count: 'Cánh cửa cung điện sẽ mở sau…', song: 'Waltz of Us',
        dressLine: 'Kính mời Quý Khách diện trang phục theo sắc màu hoàng gia dưới đây.',
        dress: [{ c: '#c9a24a', n: 'Vàng Hoàng Gia' }, { c: '#7a1f2b', n: 'Đỏ Rượu' }, { c: '#f3eee4', n: 'Trắng Ngọc Trai' }, { c: '#2f5d57', n: 'Xanh Ngọc' }],
      },
    },
    build: (p, ph) => glassBuild(p, ph, { full: true, groom: 13, bride: 14, venue: 'Grand Palace' }),
    photos: [9, 1, 3, 4, 8, 2, 13, 11, 7, 10, 12, 6, 3, 15, 17],
  },
  {
    key: 'buom-hong-studio', name: 'Bướm Hồng Studio', folder: 'a32', tier: 'basic', opener: 'curtain', featured: 1, noAuto: true, song: 'beautiful-in-white', tags: ['Hàn Quốc', 'Lãng mạn'],
    desc: 'Studio trắng hồng dịu dàng, rèm lụa mở thiệp với bướm bay, ngày cưới lớn in trên ảnh vòm.',
    op: { color: '#b37a72', paper: '#f4e4e1' },
    p: {
      page: '#efe3df', bg: '#fbf6f4', bg2: '#f5ebe7', card: '#ffffff', glass: '#fff8f6cc', veil: '#ffffff44', ink: '#4a3632', soft: '#94807b', accent: '#b37a72', line: '#e7d3cd',
      script: F.vibes, script2: 'Alex Brush', serif: F.corm, sans: F.mont, display: F.playfair,
      t: { tag: 'Together for life', quote: '“Yêu là khi hai trái tim cùng chọn chung một hướng.”', song: 'Our Song' },
    },
    build: (p, ph) => glassBuild(p, ph, { full: true, groom: 13, bride: 14 }),
    photos: [12, 7, 1, 6, 3, 8, 2, 9, 4, 5, 10, 7, 1, 11, 10],
  },
  {
    key: 'vuon-lua-trang', name: 'Vườn Lụa Trắng', folder: 'a33', tier: 'basic', opener: 'curtain', featured: 1, noAuto: true, song: 'em-dong-y', tags: ['Thiên nhiên', 'Hàn Quốc'],
    desc: 'Váy lụa trắng giữa vườn xanh, tông xanh xô thơm thanh mát, thẻ kính mờ và timeline buổi tiệc.',
    op: { color: '#6f8160', paper: '#eef0e6' },
    p: {
      page: '#e3e7dc', bg: '#fafbf6', bg2: '#f0f2e9', card: '#ffffff', glass: '#fbfcf7cc', veil: '#ffffff40', ink: '#2f3a2c', soft: '#77806f', accent: '#6f8160', line: '#d3dac8',
      script: F.vibes, script2: 'Alex Brush', serif: F.corm, sans: F.mont, display: F.playfair,
      t: {
        tag: 'In full bloom', quote: '“Như khu vườn sau cơn mưa, tình yêu mình lại nở hoa.”', count: 'Vườn hoa đang đếm từng ngày cùng chúng mình', song: 'Garden Song',
        dress: [{ c: '#f5f3ec', n: 'Trắng Lụa' }, { c: '#a7b59a', n: 'Xanh Xô Thơm' }, { c: '#5f6f52', n: 'Xanh Rêu' }, { c: '#d9cfbf', n: 'Be Đá' }],
      },
    },
    build: (p, ph) => glassBuild(p, ph, { full: true, groom: 13, bride: 14, venue: 'Vườn Tiệc Thảo Điền' }),
    photos: [3, 13, 1, 7, 10, 8, 11, 12, 4, 9, 5, 14, 1, 6, 2],
  },
  {
    key: 'hoang-hon-san-thuong', name: 'Hoàng Hôn Sân Thượng', folder: 'a39', tier: 'basic', opener: 'stars', featured: 1, noAuto: true, song: 'mai-mai-ben-nhau', tags: ['Hoàng hôn', 'Lãng mạn'],
    desc: 'Sân thượng thành phố lúc hoàng hôn, trời tím hồng và những vì sao đầu tiên mở thiệp.',
    op: { color: '#f2b89a', paper: '#33243f' },
    p: {
      page: '#eddcd3', bg: '#fdf7f3', bg2: '#f7ebe4', card: '#ffffff', glass: '#fff7f2cc', veil: '#ffffff38', ink: '#3d2c33', soft: '#8f7a7f', accent: '#cf7f69', line: '#ecd2c6',
      script: F.vibes, script2: 'Alex Brush', serif: F.corm, sans: F.mont, display: F.playfair,
      t: {
        tag: 'Golden hour love', quote: '“Hoàng hôn nào cũng đẹp, nếu bên cạnh là người mình thương.”', count: 'Còn bấy nhiêu buổi hoàng hôn nữa là tới ngày vui', song: 'Sunset Song',
        dressLine: 'Mời Quý Khách mang theo sắc trời hoàng hôn trong trang phục của mình nhé.',
        dress: [{ c: '#f2b89a', n: 'Cam Đào' }, { c: '#9b7fa6', n: 'Tím Hoàng Hôn' }, { c: '#f0cf8a', n: 'Vàng Nắng' }, { c: '#f7efe6', n: 'Trắng Kem' }],
        timeline: [['✧', '17:00', 'Đón khách trên sân thượng'], ['♡', '17:45', 'Hôn lễ lúc hoàng hôn'], ['✦', '18:30', 'Khai tiệc'], ['♫', '19:30', 'Âm nhạc & khiêu vũ'], ['❀', '21:00', 'Chụp ảnh đêm thành phố']],
      },
    },
    build: (p, ph) => glassBuild(p, ph, { coverFull: true, stars: true, full: true, groom: 13, bride: 14, venue: 'Skyline Rooftop' }),
    photos: [3, 10, 4, 8, 7, 5, 6, 1, 9, 11, 2, 4, 10, 1, 2],
  },
  {
    key: 'may-trang-tinh-khoi', name: 'Mây Trắng Tinh Khôi', folder: 'a34', tier: 'free', featured: 1, noAuto: true, song: 'i-do', tags: ['Tươi sáng', 'Hàn Quốc'],
    desc: 'Cổng hoa trắng và bầu trời trong xanh, thẻ bo tròn nhẹ nhàng, có ký tên lưu bút và dresscode.',
    p: {
      page: '#e4ebf2', bg: '#fbfcfe', bg2: '#eff4f9', card: '#ffffff', glass: '#fbfdffcc', veil: '#ffffff44', ink: '#2b3644', soft: '#748194', accent: '#6c8fb5', line: '#d4dfeb',
      script: F.vibes, script2: 'Alex Brush', serif: F.corm, sans: F.mont, display: F.playfair,
      t: {
        tag: 'Love is in the air', quote: '“Bầu trời hôm nay trong xanh như lời hứa của hai ta.”', count: 'Từng áng mây trôi, ngày vui đến gần',
        dress: [{ c: '#ffffff', n: 'Trắng Mây' }, { c: '#b9cfe6', n: 'Xanh Trời' }, { c: '#c9ced6', n: 'Xám Bạc' }, { c: '#f1d4d8', n: 'Hồng Phấn' }],
      },
    },
    build: (p, ph) => glassBuild(p, ph, {}),
    photos: [8, 4, 11, 1, 2, 7, 10, 12, 5, 9, 3, 6, 11],
  },
  {
    key: 'kien-truc-trang', name: 'Kiến Trúc Trắng', folder: 'a37', tier: 'free', featured: 1, noAuto: true, song: 'le-duong', tags: ['Tối giản', 'Studio'],
    desc: 'Kiến trúc trắng tối giản và trời xanh, chữ dọc HAPPY WEDDING, timeline và lịch Google một chạm.',
    p: {
      page: '#e6e6e3', bg: '#fafaf8', bg2: '#efefec', card: '#ffffff', glass: '#ffffffcc', veil: '#ffffff40', ink: '#222222', soft: '#76736e', accent: '#5c7ea3', line: '#d6d4cf',
      script: F.vibes, script2: 'Alex Brush', serif: F.corm, sans: F.mont, display: F.playfair,
      t: {
        tag: 'Simply us', quote: '“Tối giản như một khoảng trời – chỉ cần có nhau.”',
        dress: [{ c: '#ffffff', n: 'Trắng' }, { c: '#1f1f1f', n: 'Đen' }, { c: '#9a9a98', n: 'Xám Khói' }, { c: '#5c7ea3', n: 'Xanh Thép' }],
      },
    },
    build: (p, ph) => glassBuild(p, ph, { thanks: 0 }),
    photos: [1, 3, 2, 4, 7, 9, 11, 10, 12, 6, 5, 3, 4],
  },
];

function futureDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  d.setDate(18);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Danh sách mẫu (dữ liệu thô chưa sanitize) */
function buildAll() {
  return DEFS.map((d) => {
    seq = 0;
    CUR_TIER = d.tier;
    const ph = img(d.folder, d.photos);
    const sections = d.build(d.p, ph);
    // Trang "Hai gia đình" ngay sau lời mời; phong bì ảnh sau trang cô dâu chú rể
    // (mẫu có bìa phong bì đặt noEnvelope để không lặp)
    if (!d.noAuto) sections.splice(2, 0, secFamily(d.p));
    if (!d.noAuto && !d.noEnvelope) sections.splice(4, 0, secEnvelope(d.p, d.envPhotos ? img(d.folder, d.envPhotos) : [ph[ph.length - 1], ph[ph.length - 2]]));
    // Mẫu trả phí: có màn mở thiệp (mặc định theo bảng màu của mẫu)
    const op = d.tier === 'free' ? { style: 'none' } : { style: d.opener || 'envelope', color: d.op?.color || d.p.accent, paper: d.op?.paper || d.p.bg, font: d.p.script2 || d.p.script };
    return {
      key: d.key,
      name: d.name,
      desc: d.desc,
      tier: d.tier,
      tags: d.tags,
      thumb: ph[0],
      song: d.song,
      opener: op.style,
      // 2 = chủ dự án chọn đẩy lên đầu hàng phổ biến (17/11/2026), 1 = mẫu mới nổi bật
      featured: Number(d.featured || 0),
      raw: {
        groom: { name: 'Minh Anh' },
        bride: { name: 'Thu Hà' },
        date: futureDate(),
        time: '11:00',
        pageBg: d.p.page,
        // URL bài hát gắn ở canvas.js (songUrl) – tránh require vòng
        music: { url: '', autoplay: true },
        effects: { petals: true, toolbar: true },
        opener: op,
        sections,
      },
    };
  });
}

module.exports = { buildAll };
