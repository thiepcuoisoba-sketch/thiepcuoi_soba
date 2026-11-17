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
      T(40, 650, 340, 60, 'Trân trọng kính mời quý khách tới chung vui cùng gia đình chúng tôi.', { font: p.serif, size: 15, italic: true, color: p.cream || '#fff3dc', lh: 1.5 }),
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
    T(40, 186, 340, 46, o.venue || 'Trung tâm Hội nghị Tiệc cưới\n8 Hoàng Văn Thụ, Phú Nhuận, TP. Hồ Chí Minh', txt(p, 'sans', { size: 12.5, lh: 1.6 })),
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
  return sec(600, o.bg || p.bg2, [
    T(40, 46, 340, 24, 'TRÂN TRỌNG KÍNH MỜI', txt(p, 'label', { size: 13, anim: 'fade' })),
    T(30, 80, 360, 60, '{ten_khach}', txt(p, 'script', { size: 42, anim: 'up' })),
    S(170, 150, 80, 1, 'line', { fill: p.line }),
    T(40, 166, 340, 80, 'Tới dự buổi tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện của bạn là niềm vinh hạnh lớn nhất trong ngày hạnh phúc này.', txt(p, 'serif', { size: 16, italic: true, lh: 1.55 })),
    T(30, 280, 170, 22, 'NHÀ TRAI', txt(p, 'label')),
    T(30, 306, 170, 44, 'Ông Nguyễn Văn An\nBà Trần Thị Bình', txt(p, 'sans', { size: 13, lh: 1.6 })),
    T(220, 280, 170, 22, 'NHÀ GÁI', txt(p, 'label')),
    T(220, 306, 170, 44, 'Ông Lê Văn Cường\nBà Phạm Thị Dung', txt(p, 'sans', { size: 13, lh: 1.6 })),
    T(40, 386, 340, 24, 'Trân trọng báo tin lễ thành hôn của con chúng tôi', txt(p, 'sans', { size: 13 })),
    T(20, 420, 380, 60, '{chu_re}  &  {co_dau}', txt(p, 'script', { size: 40, anim: 'up' })),
    T(40, 500, 340, 50, '{gio}  ·  {thu}, {ngay}', txt(p, 'serif', { size: 18, color: p.accent })),
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
    return sec(960, o.bg || p.bg2, [
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
      T(40, 800, 340, 120, 'Lễ Vu Quy: 08:30 tại tư gia nhà gái\nLễ Thành Hôn: 10:00 tại tư gia nhà trai\nTiệc chiêu đãi: {gio} tại sảnh tiệc', txt(p, 'sans', { size: 13.5, lh: 1.9, color: p.ink })),
    ]);
  },
  calendar(p, o = {}) {
    return sec(980, o.bg || p.bg2, [
      T(30, 40, 360, 56, 'Ngày chung đôi', txt(p, 'script', { size: 40, anim: 'fade' })),
      T(30, 104, 360, 24, '{gio}  ·  {thu}, {ngay}', txt(p, 'serif', { size: 18, color: p.accent, bold: true })),
      G(40, 150, 340, 300, 'calendar', { ...wid(p), bg: o.calBg || '', anim: 'up' }),
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
    key: 'tap-chi-tinh-yeu', opener: 'book', name: 'Tạp Chí Tình Yêu', folder: 'a1', tier: 'basic', music: 'nang-mai', tags: ['Tạp chí', 'Hàn Quốc'],
    desc: 'Bìa tạp chí ảnh tràn viền, tiêu đề nghiêng vàng nhạt, phong cách retro Hàn.',
    p: { page: '#1f1b18', bg: '#f6f1ea', bg2: '#efe6da', ink: '#2c2420', soft: '#7c6d62', accent: '#9c6b3c', line: '#cdb89c', gold: '#f1d39a', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.magazine(p, [ph[0]]), secInvite(p), COUPLE.tall(p, [ph[1]]), EVENT.bigdate(p), GALLERY.collage(p, [ph[2], ph[3], ph[4], ph[5]]), secQuote(p, ph[3]), secForms(p), THANKS.full(p, ph[2])],
    photos: [4, 8, 5, 1, 6, 7],
  },
  {
    key: 'phong-bi-hong-phan', name: 'Phong Bì Hồng Phấn', folder: 'a2', tier: 'free', music: 'hoa-co', tags: ['Phong bì', 'Pastel'],
    desc: 'Ảnh cưới cài trong phong bì hồng phấn, dấu sáp trái tim, ảnh polaroid.',
    p: { page: '#f3dbe1', bg: '#fff6f8', bg2: '#ffecf0', ink: '#4a2533', soft: '#8a6573', accent: '#d6456c', line: '#efb5c4', env: '#f6c9d4', env2: '#eeb3c2', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.envelope(p, [ph[0]]), secInvite(p), COUPLE.circles(p, [ph[1], ph[0]]), EVENT.calendar(p), GALLERY.polaroids(p, [ph[2], ph[3], ph[4], ph[5]]), secForms(p), THANKS.arch(p, ph[6])],
    photos: [6, 8, 9, 3, 1, 7, 2],
  },
  {
    key: 'hanok-co-dien', opener: 'envelope', name: 'Hanok Cổ Điển', folder: 'a3', tier: 'basic', music: 'hen-uoc', tags: ['Vintage', 'Hàn Quốc'],
    desc: 'Tông be nâu ấm như ngôi nhà gỗ Hàn, khung vòm cổ điển, chữ serif thanh lịch.',
    p: { page: '#e6dccd', bg: '#f8f2e8', bg2: '#f0e6d6', ink: '#3d2f24', soft: '#806d5c', accent: '#8b5a3c', line: '#c8ad8c', script: F.dancing, serif: F.corm, sans: F.be },
    build: (p, ph) => [COVERS.arch(p, [ph[0]]), secInvite(p), COUPLE.arches(p, [ph[1], ph[2]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(3, 9), { cols: 3 }), secQuote(p, ph[3]), secForms(p), THANKS.arch(p, ph[5])],
    photos: [9, 2, 7, 1, 3, 8, 4, 9, 7],
  },
  {
    key: 'vuon-xanh-reu', name: 'Vườn Xanh Rêu', folder: 'a4', tier: 'free', music: 'hoa-co', tags: ['Phong bì', 'Thiên nhiên'],
    desc: 'Phong bì xanh rêu và ảnh polaroid, cảm hứng tiệc cưới sân vườn.',
    p: { page: '#dfe4d6', bg: '#f6f6ef', bg2: '#eceee2', ink: '#2f3a2c', soft: '#6f7a68', accent: '#5b7247', line: '#b6c4a4', env: '#5f7650', env2: '#4f6542', seal: '#c9a46a', script: F.vibes, serif: F.lora, sans: F.be },
    build: (p, ph) => [COVERS.envelope(p, [ph[0]], { title: 'Wedding Day' }), secInvite(p), COUPLE.polaroid(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), secForms(p), THANKS.arch(p, ph[0])],
    photos: [6, 5, 7, 1, 4, 2, 3],
  },
  {
    key: 'phim-den-trang', opener: 'fingerprint', name: 'Phim Đen Trắng', folder: 'a5', tier: 'premium', music: 'dem-sao', tags: ['Điện ảnh', 'Đen trắng'],
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
    key: 'monochrome-studio', opener: 'fingerprint', name: 'Monochrome Studio', folder: 'a6', tier: 'basic', music: 'dem-sao', tags: ['Tối giản', 'Studio'],
    desc: 'Đen – trắng – xám tối giản kiểu tạp chí thời trang, bố cục ảnh lớn.',
    p: { page: '#d9d9d9', bg: '#fafafa', bg2: '#f0f0f0', ink: '#1c1c1c', soft: '#6b6b6b', accent: '#1c1c1c', line: '#c4c4c4', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.split(p, [ph[0]], { filter: 'bw' }), secInvite(p), COUPLE.arches(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.grid(p, ph.slice(3, 11), { cols: 2, radius: 0 }), secQuote(p, ph[4]), secForms(p), THANKS.arch(p, ph[11])],
    photos: [8, 9, 10, 1, 4, 2, 3, 6, 7, 11, 5, 12],
  },
  {
    key: 'lich-kep-giay', name: 'Studio Lịch Kẹp Giấy', folder: 'a7', tier: 'free', music: 'buoc-chan-vui', tags: ['Tối giản', 'Studio'],
    desc: 'Nền trắng studio, tờ lịch kẹp giấy nghiêng đánh dấu ngày cưới.',
    p: { page: '#e9e7e2', bg: '#f7f6f3', bg2: '#efede8', ink: '#2a2a2a', soft: '#777169', accent: '#b0533c', line: '#d4cfc6', script: F.dancing, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.clip(p, [ph[0]]), secInvite(p), COUPLE.circles(p, [ph[1], ph[2]]), EVENT.bigdate(p), GALLERY.polaroids(p, [ph[3], ph[4], ph[5], ph[6]]), secForms(p), THANKS.arch(p, ph[7])],
    photos: [5, 1, 10, 2, 8, 7, 11, 4],
  },
  {
    key: 'xanh-suong-mai', opener: 'envelope', name: 'Xanh Sương Mai', folder: 'a8', tier: 'basic', music: 'chieu-bien', tags: ['Khung vòm', 'Thanh lịch'],
    desc: 'Xanh xám nhạt và trắng bạc, khung vòm mảnh, cảm giác trong trẻo.',
    p: { page: '#d5dde3', bg: '#f4f7f8', bg2: '#e8eef1', ink: '#2b3a44', soft: '#6c7c86', accent: '#4f7085', line: '#b5c6d0', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.arch(p, [ph[0]]), secInvite(p), COUPLE.arches(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), secForms(p), THANKS.arch(p, ph[7])],
    photos: [1, 4, 8, 2, 6, 7, 10, 9],
  },
  {
    key: 'dong-co-mua-ha', name: 'Đồng Cỏ Mùa Hạ', folder: 'a9', tier: 'free', music: 'buoc-chan-vui', tags: ['Thiên nhiên', 'Tươi sáng'],
    desc: 'Ảnh tràn viền giữa đồng cỏ, chữ viết tay “Fall in love”, tông xanh nắng.',
    p: { page: '#dfe8d3', bg: '#f8faf2', bg2: '#eef3e2', ink: '#2e3b25', soft: '#6b7a5e', accent: '#6b8f3a', line: '#c2d3a6', script: F.vibes, serif: F.lora, sans: F.mont },
    build: (p, ph) => [COVERS.full(p, [ph[0]], { title: 'Fall in love', shade: '#1d2b1288' }), secInvite(p), COUPLE.polaroid(p, [ph[1], ph[2]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(3, 9), { cols: 2 }), secQuote(p, ph[9]), secForms(p), THANKS.full(p, ph[10])],
    photos: [2, 6, 9, 3, 4, 5, 7, 10, 11, 12, 1],
  },
  {
    key: 'hong-pastel-ngot-ngao', name: 'Hồng Pastel Ngọt Ngào', folder: 'a10', tier: 'free', music: 'hoa-co', tags: ['Pastel', 'Lãng mạn'],
    desc: 'Hồng pastel ngọt ngào, ảnh lớn phía trên, thẻ chữ bo tròn mềm mại.',
    p: { page: '#f7dfe4', bg: '#fff7f8', bg2: '#ffeef1', ink: '#4b2a35', soft: '#8d6a75', accent: '#e05a7f', line: '#f2bccb', script: F.vibes, serif: F.corm, sans: F.be },
    build: (p, ph) => [COVERS.split(p, [ph[0]], { title: 'Marry me' }), secInvite(p), COUPLE.circles(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.polaroids(p, [ph[3], ph[4], ph[5], ph[6]]), GALLERY.grid(p, ph.slice(7, 11), { cols: 2, title: 'Thêm chút ngọt ngào' }), secForms(p), THANKS.arch(p, ph[11])],
    photos: [10, 2, 3, 4, 5, 8, 9, 6, 7, 11, 12, 1],
  },
  {
    key: 'hy-su-vui-nhon', name: 'Hỷ Sự Vui Nhộn', folder: 'a11', tier: 'free', music: 'song-hy', tags: ['Truyền thống', 'Chữ Hỷ'],
    desc: 'Đỏ son và vàng kim, chữ Hỷ lớn, khung viền đôi truyền thống.',
    p: { page: '#5e0a12', bg: '#9e1622', bg2: '#fff6ec', ink: '#5a1018', soft: '#8a5a50', accent: '#b3202f', line: '#e3b766', gold: '#f1c66b', cream: '#fff3dc', script: F.vibes, serif: F.playfair, sans: F.be },
    build: (p, ph) => [COVERS.hy(p, [ph[0]]), secInvite(p), COUPLE.tall(p, [ph[1]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(2, 10), { cols: 2 }), secForms(p, { bg: '#fff6ec' }), THANKS.full(p, ph[10])],
    photos: [4, 2, 1, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    key: 'do-son-song-hy', opener: 'doors', name: 'Đỏ Son Song Hỷ', folder: 'a12', tier: 'basic', music: 'song-hy', tags: ['Truyền thống', 'Sang trọng'],
    desc: 'Ảnh tràn viền nền đỏ son, chữ viết tay vàng, khung vòm đôi.',
    p: { page: '#4a0910', bg: '#fff5ef', bg2: '#fbe9e1', ink: '#5b1219', soft: '#8b5d58', accent: '#b81f2d', line: '#e2b2a6', script: F.vibes, serif: F.playfair, sans: F.be },
    build: (p, ph) => [COVERS.full(p, [ph[0]], { title: 'Song Hỷ Lâm Môn', shade: '#3d050999' }), secInvite(p), COUPLE.arches(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), secForms(p), THANKS.arch(p, ph[7])],
    photos: [1, 3, 2, 4, 6, 7, 9, 8],
  },
  {
    key: 'phong-bi-do-nhung', opener: 'envelope', name: 'Phong Bì Đỏ Nhung', folder: 'a13', tier: 'premium', music: 'hen-uoc', tags: ['Phong bì', 'Sang trọng'],
    desc: 'Phong bì đỏ nhung dấu sáp vàng trên nền kem, hoà quyện cổ phục và váy cưới.',
    p: { page: '#e9ddd0', bg: '#fbf5ee', bg2: '#f4e9dd', ink: '#4e1218', soft: '#866159', accent: '#9f1c28', line: '#d9b38f', env: '#9f1c28', env2: '#861522', seal: '#d8aa5a', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.envelope(p, [ph[0]]), secInvite(p), COUPLE.circles(p, [ph[1], ph[2]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(3, 11), { cols: 2 }), secForms(p), THANKS.arch(p, ph[11])],
    photos: [1, 10, 9, 2, 3, 4, 6, 7, 8, 11, 12, 5],
  },
  {
    key: 'phieu-luu-nui-tuyet', opener: 'book', name: 'Phiêu Lưu Núi Tuyết', folder: 'a14', tier: 'premium', music: 'chieu-bien', tags: ['Poster', 'Du lịch'],
    desc: 'Poster chữ lớn “WE GOT MARRIED” trên nền núi tuyết, hồ xanh.',
    p: { page: '#cfd8df', bg: '#f3f6f8', bg2: '#e6edf1', ink: '#1f2d38', soft: '#62717d', accent: '#2f5d7c', line: '#b3c3cf', gold: '#ffd27a', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.poster(p, [ph[0]]), secInvite(p), COUPLE.tall(p, [ph[1]]), EVENT.calendar(p), GALLERY.collage(p, [ph[2], ph[3], ph[4], ph[5]], { title: 'Những chuyến đi' }), secQuote(p, ph[5], '“Đi cùng nhau, đâu cũng là nhà.”'), secForms(p), THANKS.full(p, ph[6])],
    photos: [5, 6, 1, 4, 7, 8, 2],
  },
  {
    key: 'bao-cuoi', opener: 'book', name: 'Báo Cưới', folder: 'a15', tier: 'basic', music: 'nang-mai', tags: ['Báo cưới', 'Vintage'],
    desc: 'Tờ báo cổ điển đưa “tin nóng” đám cưới, cột chữ và ảnh tư liệu.',
    p: { page: '#d9d2c3', bg: '#f4efe4', bg2: '#ece5d6', ink: '#221e19', soft: '#6e665b', accent: '#9c2a3b', line: '#bfb39c', script: F.dancing, serif: F.lora, sans: F.be },
    build: (p, ph) => [COVERS.newspaper(p, [ph[0]]), secInvite(p), COUPLE.polaroid(p, [ph[1], ph[2]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(3, 9), { cols: 2, radius: 0, title: 'Phóng sự ảnh' }), secForms(p), THANKS.arch(p, ph[1])],
    photos: [1, 4, 12, 2, 5, 13, 6, 3, 11],
  },
  {
    key: 'do-do-chu-vang', opener: 'doors', name: 'Đỏ Đô Chữ Vàng', folder: 'a16', tier: 'basic', music: 'song-hy', tags: ['Đỏ đô', 'Chữ viết tay'],
    desc: 'Nền đỏ đô sâu, chữ viết tay vàng kim, khung vòm và thước phim.',
    p: { page: '#3a070c', bg: '#6d1119', bg2: '#5b0d15', ink: '#fbe8c8', soft: '#e7c9a4', accent: '#d9a74a', line: '#d9a74a', filmText: '#fbe8c8', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.arch(p, [ph[0]]), secInvite(p), COUPLE.arches(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.film(p, [ph[3], ph[4], ph[5]]), secForms(p, { dark: true }), THANKS.arch(p, ph[6])],
    photos: [3, 6, 9, 7, 2, 4, 8],
  },
  {
    key: 'pho-co-chau-au', opener: 'fingerprint', name: 'Phố Cổ Châu Âu', folder: 'a17', tier: 'premium', music: 'hen-uoc', tags: ['Thanh lịch', 'Châu Âu'],
    desc: 'Phố cổ kiến trúc châu Âu, tông xám ngà sang trọng, chữ serif kinh điển.',
    p: { page: '#d8d3cc', bg: '#f7f5f1', bg2: '#ece8e1', ink: '#2b2826', soft: '#75706a', accent: '#7a6248', line: '#c8bfb2', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.full(p, [ph[0]], { title: 'Forever begins', shade: '#1a161299' }), secInvite(p), COUPLE.tall(p, [ph[1]]), EVENT.bigdate(p), GALLERY.collage(p, [ph[2], ph[3], ph[4], ph[5]]), secQuote(p, ph[6]), secForms(p), THANKS.arch(p, ph[7])],
    photos: [1, 10, 3, 9, 6, 12, 11, 5],
  },

  // ===== 14 mẫu mới 16/11/2026 (ảnh a18–a31). Ảnh đủ cô dâu chú rể luôn đứng đầu làm ảnh bìa. =====
  {
    key: 'hanok-tinh-khoi', name: 'Hanok Tinh Khôi', folder: 'a18', tier: 'basic', opener: 'book', featured: true, music: 'hen-uoc', tags: ['Hàn Quốc', 'Studio'],
    desc: 'Trắng – đỏ son tinh tế, thẻ “Save the Date” bo tròn, chuyện tình 4 chương và lịch trình lễ cưới.',
    p: { page: '#ece9e4', bg: '#ffffff', bg2: '#f7f5f1', ink: '#1d1c1a', soft: '#6d6a64', accent: '#b3262d', line: '#e2ddd5', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.hero(p, [ph[0], ph[1]]), secInvite(p), COUPLE.arches(p, [ph[2], ph[3]]), secStory(p, [ph[4], ph[5], ph[6], ph[7]]), secSchedule(p), GALLERY.grid(p, [ph[8], ph[9], ph[10], ph[12]], { cols: 2 }), secLetter(p, ph[11]), secForms(p), THANKS.arch(p, ph[1])],
    photos: [16, 8, 6, 5, 1, 12, 4, 10, 15, 13, 3, 14, 9],
  },
  {
    key: 'anh-sang-studio', name: 'Ánh Sáng Studio', folder: 'a19', tier: 'free', music: 'nang-mai', tags: ['Tối giản', 'Studio'],
    desc: 'Ảnh studio tràn viền, tông xám trắng nhẹ nhàng, bố cục tối giản dễ dùng.',
    p: { page: '#e4e4e2', bg: '#fbfbfa', bg2: '#f1f1ef', ink: '#232323', soft: '#707070', accent: '#8a7a66', line: '#d2cdc5', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.full(p, [ph[0]], { shade: '#11111199' }), secInvite(p), COUPLE.arches(p, [ph[3], ph[4]]), EVENT.calendar(p), GALLERY.collage(p, [ph[1], ph[2], ph[5], ph[6]]), secForms(p), THANKS.arch(p, ph[7])],
    photos: [6, 9, 1, 2, 4, 8, 7, 5],
  },
  {
    key: 'mua-yeu-den-trang', name: 'Mùa Yêu Đen Trắng', folder: 'a20', tier: 'premium', opener: 'fingerprint', music: 'dem-sao', tags: ['Đen trắng', 'Cá tính'],
    desc: 'Đen trắng cá tính, chạm vân tay mở thiệp, thước phim và chuyện tình kể theo chương.',
    op: { color: '#1d1c1a', paper: '#f7f6f4' },
    p: { page: '#1a1a1a', bg: '#f7f6f4', bg2: '#efeeeb', ink: '#151515', soft: '#666666', accent: '#151515', line: '#cfcac2', filmText: '#151515', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.frame(p, [ph[0]]), secInvite(p), GALLERY.stagger(p, [ph[1], ph[2]]), secStory(p, [ph[3], ph[4], ph[5], ph[6]]), secSchedule(p), GALLERY.film(p, [ph[7], ph[8], ph[4]]), secForms(p), THANKS.full(p, ph[2])],
    photos: [8, 10, 9, 1, 5, 2, 4, 11, 6, 3],
  },
  {
    key: 'lua-trang-thanh-lich', name: 'Lụa Trắng Thanh Lịch', folder: 'a21', tier: 'premium', opener: 'envelope', featured: true, music: 'hen-uoc', tags: ['Sang trọng', 'Studio'],
    desc: 'Ngày cưới cỡ lớn trên nền ảnh tối, tông champagne, phong bì dấu sáp và hộp mừng cưới QR.',
    p: { page: '#e8e1d8', bg: '#fbf8f4', bg2: '#f3ede5', ink: '#2e2a26', soft: '#7a7067', accent: '#a07c4f', line: '#d8c9b4', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.datebig(p, [ph[0]]), secInvite(p), COUPLE.arches(p, [ph[2], ph[3]]), EVENT.bigdate(p), GALLERY.stack(p, [ph[1], ph[5], ph[6]]), secLetter(p, ph[7]), secForms(p), THANKS.full(p, ph[4])],
    photos: [2, 10, 11, 3, 1, 8, 4, 9, 6, 7],
  },
  {
    key: 'hoa-hong-do', name: 'Hoa Hồng Đỏ', folder: 'a22', tier: 'basic', opener: 'envelope', featured: true, music: 'hoa-co', tags: ['Lãng mạn', 'Hoa'],
    desc: 'Cổng hoa hồng đỏ rực rỡ, khung vòm cổ điển, phong bì đỏ dấu sáp vàng.',
    p: { page: '#f3e3e1', bg: '#fffaf8', bg2: '#fbefec', ink: '#4a1d22', soft: '#8a6563', accent: '#c2283a', line: '#e9b8b5', script: F.vibes, serif: F.corm, sans: F.be },
    build: (p, ph) => [COVERS.arch(p, [ph[0]]), secInvite(p), COUPLE.circles(p, [ph[2], ph[3]]), secSchedule(p), GALLERY.grid(p, ph.slice(4, 10), { cols: 2 }), secQuote(p, ph[11]), secForms(p), THANKS.arch(p, ph[1])],
    photos: [4, 7, 10, 6, 3, 2, 1, 5, 9, 11, 12, 8],
  },
  {
    key: 'nang-trang-thang-nam', name: 'Nắng Trắng Tháng Năm', folder: 'a23', tier: 'free', music: 'nang-mai', tags: ['Tươi sáng', 'Hàn Quốc'],
    desc: 'Ảnh trên – chữ dưới kiểu Hàn, nắng trắng trong trẻo, nhiều ảnh album.',
    p: { page: '#e9ece6', bg: '#fcfcfa', bg2: '#f2f4ef', ink: '#2f332c', soft: '#737a6e', accent: '#7d8f5a', line: '#cfd6c2', script: F.vibes, serif: F.corm, sans: F.be },
    build: (p, ph) => [COVERS.split(p, [ph[0]]), secInvite(p), COUPLE.tall(p, [ph[1]]), EVENT.calendar(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), GALLERY.grid(p, [ph[7], ph[8], ph[9], ph[10]], { cols: 2, title: 'Thêm chút nắng' }), secForms(p), THANKS.arch(p, ph[2])],
    photos: [1, 10, 3, 9, 11, 14, 6, 5, 7, 13, 16],
  },
  {
    key: 'hoa-trang-tinh-khoi', name: 'Hoa Trắng Tinh Khôi', folder: 'a24', tier: 'premium', opener: 'book', featured: true, music: 'hen-uoc', tags: ['Sang trọng', 'Hoa'],
    desc: 'Vườn hoa trắng sang trọng, lật bìa mở thiệp, chuyện tình, lịch trình và lời ngỏ.',
    p: { page: '#e6e9e1', bg: '#fdfdfb', bg2: '#f4f5f0', ink: '#26302a', soft: '#6b7468', accent: '#4f6b4a', line: '#cdd5c6', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.hero(p, [ph[0], ph[1]]), secInvite(p), GALLERY.stagger(p, [ph[2], ph[3]]), secStory(p, [ph[4], ph[5], ph[6], ph[7]]), secSchedule(p), GALLERY.grid(p, [ph[8], ph[9], ph[10], ph[13]], { cols: 2 }), secLetter(p, ph[14]), GALLERY.stack(p, [ph[11], ph[12], ph[15]]), secForms(p), THANKS.full(p, ph[2])],
    photos: [14, 1, 9, 15, 7, 12, 19, 21, 3, 5, 2, 6, 10, 16, 23, 13],
  },
  {
    key: 'sac-mau-thanh-pho', name: 'Sắc Màu Thành Phố', folder: 'a25', tier: 'basic', opener: 'fingerprint', music: 'buoc-chan-vui', tags: ['Trẻ trung', 'Poster'],
    desc: 'Poster chữ lớn trên nền vàng rực, polaroid vui nhộn, hợp cặp đôi trẻ trung.',
    p: { page: '#f4ead0', bg: '#fffbf0', bg2: '#fff3d6', ink: '#3a2a14', soft: '#7d6a4c', accent: '#e0861f', line: '#f0cf8a', gold: '#ffd166', script: F.dancing, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.poster(p, [ph[0]], { title: 'WE\nSAID\nYES' }), secInvite(p), COUPLE.tall(p, [ph[3]]), EVENT.bigdate(p), GALLERY.polaroids(p, [ph[1], ph[2], ph[4], ph[5]]), GALLERY.grid(p, [ph[6], ph[7], ph[8], ph[10]], { cols: 2, title: 'Thành phố của hai ta' }), secForms(p), THANKS.full(p, ph[1])],
    photos: [8, 2, 3, 9, 6, 7, 5, 1, 11, 10, 12],
  },
  {
    key: 'le-cuoi-tren-doi', name: 'Lễ Cưới Trên Đồi', folder: 'a26', tier: 'premium', opener: 'envelope', music: 'chieu-bien', tags: ['Ngoài trời', 'Hoa'],
    desc: 'Lễ cưới ngoài trời dưới vòm kính và hoa, hoàng hôn trên đồi, tông xanh trời – cam đào.',
    p: { page: '#e3e8ec', bg: '#fbfcfd', bg2: '#f1f5f7', ink: '#253341', soft: '#66737f', accent: '#d9846b', line: '#c9d6df', script: F.vibes, serif: F.corm, sans: F.mont },
    build: (p, ph) => [COVERS.frame(p, [ph[0]]), secInvite(p), GALLERY.stagger(p, [ph[1], ph[2]]), secSchedule(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), secQuote(p, ph[11], '“Ở đâu có nhau, ở đó là nhà.”'), GALLERY.grid(p, [ph[7], ph[8], ph[9], ph[10]], { cols: 2, title: 'Hoàng hôn trên đồi' }), secForms(p), THANKS.full(p, ph[10])],
    photos: [2, 1, 4, 10, 14, 9, 8, 12, 19, 21, 22, 18],
  },
  {
    key: 'dem-thanh-pho', name: 'Đêm Thành Phố', folder: 'a27', tier: 'basic', opener: 'fingerprint', music: 'dem-sao', tags: ['Điện ảnh', 'Đêm'],
    desc: 'Nền xanh đêm, ánh đèn phố và thước phim, chữ vàng ấm kiểu điện ảnh.',
    op: { color: '#e8b04b', paper: '#121826' },
    p: { page: '#0b0f1a', bg: '#121826', bg2: '#1a2133', ink: '#f3efe8', soft: '#b8b3c4', accent: '#e8b04b', line: '#3b4560', filmText: '#f3efe8', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.split(p, [ph[0]], { title: 'Our Night' }), secInvite(p), COUPLE.tall(p, [ph[1]]), GALLERY.film(p, [ph[2], ph[3], ph[4]]), EVENT.bigdate(p), GALLERY.grid(p, [ph[5], ph[6], ph[7], ph[8]], { cols: 2, radius: 0, title: 'Thành phố của hai ta' }), secQuote(p, ph[9]), secForms(p, { dark: true }), THANKS.full(p, ph[10])],
    photos: [10, 15, 12, 2, 5, 11, 13, 7, 6, 18, 16],
  },
  {
    key: 'dong-hoa-mua-ha', name: 'Đồng Hoa Mùa Hạ', folder: 'a28', tier: 'free', music: 'buoc-chan-vui', tags: ['Thiên nhiên', 'Tươi sáng'],
    desc: 'Đồng hoa cúc vàng và đồi xanh, chữ viết tay “Summer Love”, polaroid tươi vui.',
    p: { page: '#e3ead2', bg: '#fbfcf4', bg2: '#f1f5e2', ink: '#2c3a1f', soft: '#6c7a5c', accent: '#c98a12', line: '#d5dfb5', script: F.vibes, serif: F.lora, sans: F.mont },
    build: (p, ph) => [COVERS.full(p, [ph[0]], { title: 'Summer Love', shade: '#1d2b1288' }), secInvite(p), COUPLE.tall(p, [ph[2]]), EVENT.calendar(p), GALLERY.polaroids(p, [ph[3], ph[4], ph[5], ph[6]]), GALLERY.grid(p, [ph[7], ph[8], ph[9], ph[10]], { cols: 2 }), secForms(p), THANKS.full(p, ph[1])],
    photos: [13, 22, 7, 3, 1, 18, 21, 19, 24, 11, 20],
  },
  {
    key: 'hanbok-xuan-thi', name: 'Hanbok Xuân Thì', folder: 'a29', tier: 'premium', opener: 'doors', featured: true, music: 'song-hy', tags: ['Truyền thống', 'Hàn Quốc'],
    desc: 'Cổ phục và váy cưới, cửa hai cánh chữ Hỷ mở thiệp, sắc ngọc bích – đỏ son.',
    op: { color: '#7d1d24' },
    p: { page: '#e4ebe5', bg: '#fdfcf8', bg2: '#f2f5ef', ink: '#2b3a33', soft: '#6c7a72', accent: '#a3262e', line: '#cdd9cf', script: F.vibes, serif: F.playfair, sans: F.be },
    build: (p, ph) => [COVERS.hero(p, [ph[0], ph[1]], { mark: '囍' }), secInvite(p), COUPLE.arches(p, [ph[2], ph[3]]), secStory(p, [ph[4], ph[5], ph[6], ph[7]]), secSchedule(p), GALLERY.grid(p, [ph[8], ph[9], ph[10], ph[11]], { cols: 2 }), secLetter(p, ph[13]), secForms(p), THANKS.full(p, ph[0])],
    photos: [2, 14, 10, 13, 5, 11, 4, 18, 16, 1, 9, 12, 6, 7],
  },
  {
    key: 'khung-cua-vom', name: 'Khung Cửa Vòm', folder: 'a30', tier: 'basic', opener: 'envelope', music: 'hen-uoc', tags: ['Lãng mạn', 'Châu Âu'],
    desc: 'Khung cửa vòm ngập nắng, tông be ấm, phong bì nâu dấu sáp cổ điển.',
    p: { page: '#e9dfd2', bg: '#fbf7f1', bg2: '#f3eadf', ink: '#3a2c22', soft: '#7e6c5d', accent: '#9b6a43', line: '#d9c3a8', script: F.vibes, serif: F.corm, sans: F.be },
    build: (p, ph) => [COVERS.arch(p, [ph[0]]), secInvite(p), GALLERY.stagger(p, [ph[1], ph[2]]), EVENT.calendar(p), GALLERY.collage(p, [ph[3], ph[4], ph[5], ph[6]]), secQuote(p, ph[7]), secForms(p), THANKS.arch(p, ph[9])],
    photos: [3, 6, 9, 1, 2, 4, 5, 7, 8, 10],
  },
  {
    key: 'lau-dai-anh-nen', name: 'Lâu Đài Ánh Nến', folder: 'a31', tier: 'basic', opener: 'book', featured: true, music: 'hen-uoc', tags: ['Cổ điển', 'Sang trọng'],
    desc: 'Lâu đài cổ điển ánh nến vàng, bìa tạp chí, chuyện tình và album 3 cột.',
    p: { page: '#2a2118', bg: '#fbf6ec', bg2: '#f3e9d6', ink: '#3a2a17', soft: '#7d6a52', accent: '#a8833a', line: '#dcc69a', gold: '#f1d39a', script: F.vibes, serif: F.playfair, sans: F.mont },
    build: (p, ph) => [COVERS.magazine(p, [ph[0]], { mast: 'LOVE NOTES', title: 'Golden\nHour' }), secInvite(p), COUPLE.arches(p, [ph[2], ph[3]]), secStory(p, [ph[4], ph[5], ph[6], ph[13]]), EVENT.bigdate(p), GALLERY.grid(p, ph.slice(7, 13), { cols: 3 }), secQuote(p, ph[1]), secForms(p), THANKS.full(p, ph[14])],
    photos: [26, 1, 33, 7, 27, 4, 5, 8, 10, 11, 12, 14, 15, 20, 2],
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
    // Mẫu trả phí: có màn mở thiệp (mặc định theo bảng màu của mẫu)
    const op = d.tier === 'free' ? { style: 'none' } : { style: d.opener || 'envelope', color: d.op?.color || d.p.accent, paper: d.op?.paper || d.p.bg, font: d.p.script };
    return {
      key: d.key,
      name: d.name,
      desc: d.desc,
      tier: d.tier,
      tags: d.tags,
      thumb: ph[0],
      music: d.music,
      opener: op.style,
      featured: Boolean(d.featured),
      raw: {
        groom: { name: 'Minh Anh' },
        bride: { name: 'Thu Hà' },
        date: futureDate(),
        time: '11:00',
        pageBg: d.p.page,
        music: { url: 'builtin:' + d.music, autoplay: true },
        effects: { petals: true, toolbar: true },
        opener: op,
        sections,
      },
    };
  });
}

module.exports = { buildAll };
