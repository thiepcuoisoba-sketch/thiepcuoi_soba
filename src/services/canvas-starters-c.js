'use strict';
/**
 * Bộ mẫu ảnh thứ ba (19/11/2026): 4 mẫu Basic dùng ảnh a47–a50 (50 vị trí ảnh/thiệp, có lặp ảnh)
 * + 6 trang bìa mới đi cùng 6 kiểu mở thiệp mới (savedate, scroll, cinema, lantern, pill, orbit).
 * Bìa và màn mở thiệp tham khảo cách trình bày của kho thiệp 27biggroup (chủ dự án đồng ý),
 * vẽ lại bằng phần tử canvas của SOBA – không dùng ảnh/hoạ tiết của site khác.
 *
 * Xuất: make(kit) → { defs, COVERS, RESTYLE }
 *  - defs: mảng DEFS cùng định dạng canvas-starters.js
 *  - RESTYLE: làm mới bìa + kiểu mở của một số mẫu cũ cho đa dạng (áp dụng trong buildAll)
 */
module.exports = function make(kit) {
  const { T, I, S, G, sec, W, B, K, S2, F, PAPER, LINEN, FLW, FLW_D, LEAF, CLOUD } = kit;

  const gold = (p) => p.gold || p.accent;
  const kick = (p, o = {}) => ({ font: p.sans, size: 11, ls: 5, bold: true, color: p.kick || p.accent, upper: true, ...o });
  const script = (p, o = {}) => ({ font: p.title || p.script, size: 46, color: gold(p), lh: 1.1, ...o });
  const down = (p, y, c) => T(30, y, 360, 24, '⌄', { font: 'Noto Serif', size: 22, color: c || gold(p), anim: 'down', delay: 1 });

  // ===================== 6 TRANG BÌA MỚI =====================
  const COVERS = {
    /** Save the Date: khung viền mảnh, ảnh vòm, tim nhỏ, tên xếp chồng, "Kính mời" */
    savedate(p, src, o = {}) {
      const g = gold(p);
      return sec(900, p.bg, [
        I(-46, -36, 230, 230, FLW, { o: 0.4 }),
        I(236, 690, 230, 230, FLW, { o: 0.4, r: 180 }),
        S(16, 16, 388, 868, 'rect', { stroke: g, sw: 1, radius: 20, o: 0.55 }),
        T(20, 58, 380, 70, o.title || 'Save The Date', script(p, { size: 50, anim: 'fade' })),
        I(80, 146, 260, 350, src, { mask: 'arch', border: 6, borderColor: p.frame || '#ffffff', shadow: true, anim: 'zoom' }),
        S(296, 452, 42, 38, 'heart', { fill: p.accent2 || g, anim: 'zoom', delay: 0.4 }),
        T(20, 520, 380, 66, '{chu_re}', script(p, { size: 50, color: p.ink2 || g, anim: 'up', delay: 0.2 })),
        T(20, 578, 380, 40, '&', script(p, { size: 30, color: p.accent2 || g, anim: 'zoom', delay: 0.3 })),
        T(20, 612, 380, 66, '{co_dau}', script(p, { size: 50, color: p.ink2 || g, anim: 'up', delay: 0.35 })),
        T(20, 694, 380, 26, '{ngay_so} . {thang} . {nam}', { font: p.serif, size: 19, ls: 6, bold: true, color: p.ink, anim: 'fade', delay: 0.4 }),
        S(130, 736, 160, 1, 'line', { fill: g, o: 0.6 }),
        T(20, 750, 380, 20, 'Trân trọng kính mời', kick(p, { ls: 3, size: 10.5 })),
        T(20, 772, 380, 50, '{ten_khach}', script(p, { size: 34, color: p.accent, anim: 'up', delay: 0.5 })),
        down(p, 836),
      ]);
    },
    /** Cuộn thư: hai trục gỗ, giấy dó, ảnh tròn, ruy băng ngày cưới */
    scroll(p, src) {
      const g = gold(p);
      const rod = (y) => [S(-10, y, 440, 24, 'rect', { fill: p.rod || '#5a3a1e', radius: 12, shadow: true }), S(-4, y - 3, 20, 30, 'rect', { fill: '#d8b25e', radius: 6 }), S(404, y - 3, 20, 30, 'rect', { fill: '#d8b25e', radius: 6 })];
      return sec(
        900,
        p.paper || '#f6f0e2',
        [
          ...rod(0),
          I(-30, 30, 190, 190, FLW, { o: 0.5 }),
          I(270, 650, 190, 190, FLW, { o: 0.5, r: 180 }),
          I(300, 40, 150, 56, LEAF, { o: 0.8, r: -20 }),
          T(20, 80, 380, 20, 'Thân gửi', { font: p.sans, size: 13, ls: 3, bold: true, color: p.ink }),
          T(20, 102, 380, 36, '{ten_khach}', { font: p.sans, size: 22, bold: true, color: p.accent2 || '#d9822b', anim: 'up' }),
          S(95, 160, 230, 230, 'circle', { fill: '#ffffff', shadow: true }),
          I(105, 170, 210, 210, src, { mask: 'circle', anim: 'zoom' }),
          S(90, 155, 240, 240, 'ring', { stroke: g, sw: 1, o: 0.6 }),
          T(20, 412, 380, 70, '{chu_re}', script(p, { size: 52, color: p.accent, anim: 'up', delay: 0.2 })),
          T(20, 470, 380, 70, '{co_dau}', script(p, { size: 52, color: p.accent, anim: 'up', delay: 0.3 })),
          T(20, 560, 380, 22, 'TIỆC CƯỚI', kick(p, { color: p.ink, anim: 'fade' })),
          S(90, 592, 240, 46, 'rect', { fill: p.accent, radius: 6, shadow: true, anim: 'zoom', delay: 0.3 }),
          T(90, 600, 240, 30, '{ngay_so}  |  {thang}  |  {nam}', { font: p.serif, size: 20, bold: true, color: '#ffffff', anim: 'zoom', delay: 0.3 }),
          T(40, 660, 340, 44, 'Nhằm ngày {am_lich}', { font: p.serif, size: 14, italic: true, color: p.soft }),
          down(p, 800, p.accent),
          ...rod(876),
        ],
        PAPER
      );
    },
    /** Rạp chiếu phim: dải phim hai bên, đèn chiếu, khung phim, vé mời */
    cinema(p, src) {
      const g = gold(p);
      const holes = Array(40).join('▮\n') + '▮';
      return sec(900, p.bg, [
        S(0, 0, 30, 900, 'rect', { fill: '#0a0a0a' }),
        S(390, 0, 30, 900, 'rect', { fill: '#0a0a0a' }),
        T(4, 4, 22, 900, holes, { font: 'Noto Serif', size: 13, lh: 1.7, color: '#e9e3d4', o: 0.75 }),
        T(394, 4, 22, 900, holes, { font: 'Noto Serif', size: 13, lh: 1.7, color: '#e9e3d4', o: 0.75 }),
        S(60, -40, 300, 520, 'tri', { fill: '#fff3d6', o: 0.07 }),
        T(40, 60, 340, 20, 'BUỔI CÔNG CHIẾU ĐẶC BIỆT', kick(p, { color: g, ls: 4, anim: 'fade' })),
        S(64, 100, 292, 300, 'rect', { fill: '#0b0b0b', shadow: true, anim: 'zoom' }),
        T(64, 102, 292, 16, '▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮', { font: 'Noto Serif', size: 11, ls: 4, color: '#e9e3d4', o: 0.8 }),
        I(74, 120, 272, 258, src, { filter: 'film', anim: 'zoom' }),
        T(64, 381, 292, 16, '▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮', { font: 'Noto Serif', size: 11, ls: 4, color: '#e9e3d4', o: 0.8 }),
        T(70, 402, 140, 14, '— SOBA', { font: p.sans, size: 8, ls: 2, color: g, align: 'left', o: 0.7 }),
        T(210, 402, 140, 14, 'SAFETY FILM 35', { font: p.sans, size: 8, ls: 2, color: g, align: 'right', o: 0.7 }),
        T(20, 436, 380, 66, '{chu_re}', { font: p.title || p.script, size: 50, color: '#fff8ea', shadow: true, anim: 'up', delay: 0.2 }),
        T(20, 494, 380, 36, '&', { font: p.title || p.script, size: 30, color: g, anim: 'zoom', delay: 0.3 }),
        T(20, 524, 380, 66, '{co_dau}', { font: p.title || p.script, size: 50, color: '#fff8ea', shadow: true, anim: 'up', delay: 0.35 }),
        T(20, 604, 380, 26, '{ngay_so}  ·  {thang}  ·  {nam}', { font: p.sans, size: 17, ls: 4, bold: true, color: '#fff8ea', anim: 'fade' }),
        S(80, 656, 260, 74, 'rect', { fill: '#f6efe2', radius: 6, shadow: true, anim: 'up', delay: 0.4 }),
        S(270, 664, 1, 58, 'line', { fill: '#bfae8f' }),
        T(92, 666, 176, 16, 'VÉ MỜI DÀNH CHO', { font: p.sans, size: 9, ls: 2, bold: true, color: '#a3283f', align: 'left', anim: 'up', delay: 0.4 }),
        T(92, 684, 176, 36, '{ten_khach}', { font: p.script, size: 26, color: '#2a2118', align: 'left', anim: 'up', delay: 0.4 }),
        T(272, 668, 66, 54, 'HÀNG A\nGHẾ 01', { font: p.sans, size: 11, lh: 1.6, bold: true, color: '#a3283f', anim: 'up', delay: 0.4 }),
        T(40, 764, 340, 20, 'Cuộn xuống để bắt đầu trình chiếu', { font: p.sans, size: 11, ls: 2, color: '#e9e3d4', o: 0.75, anim: 'fade', delay: 0.8 }),
        down(p, 800),
      ]);
    },
    /** Đèn lồng, mây vàng, mặt trời mọc */
    lantern(p, src) {
      const g = gold(p);
      const lan = (x, len, s) => [S(x, 0, 2, len, 'line', { fill: '#8a5a14' }), S(x - 23 * s, len, 48 * s, 58 * s, 'circle', { fill: p.lantern || '#e88a2a', shadow: true, anim: 'down' }), S(x - 10 * s, len - 3, 22 * s, 7, 'rect', { fill: '#8a5a14', radius: 2 })];
      return sec(900, p.bg, [
        S(-60, 640, 540, 540, 'circle', { fill: '#ffcf7a', o: 0.55 }),
        ...lan(44, 44, 1),
        ...lan(110, 12, 0.7),
        ...lan(310, 20, 0.7),
        ...lan(376, 60, 1),
        T(20, 120, 380, 20, 'THIỆP MỜI LỄ THÀNH HÔN', kick(p, { color: g, anim: 'fade' })),
        T(20, 142, 380, 26, '❀', { font: 'Noto Serif', size: 20, color: p.accent }),
        S(117, 184, 186, 186, 'circle', { fill: '#ffffff', stroke: g, sw: 3, shadow: true, anim: 'zoom' }),
        I(125, 192, 170, 170, src, { mask: 'circle', anim: 'zoom' }),
        T(20, 392, 380, 66, '{chu_re}', script(p, { size: 50, color: p.ink2 || '#6b3a12', anim: 'up', delay: 0.2 })),
        S(195, 458, 30, 30, 'circle', { fill: g, anim: 'zoom', delay: 0.3 }),
        T(195, 462, 30, 22, '&', { font: p.serif, size: 14, color: '#ffffff' }),
        T(20, 492, 380, 66, '{co_dau}', script(p, { size: 50, color: p.ink2 || '#6b3a12', anim: 'up', delay: 0.35 })),
        S(80, 574, 260, 1, 'line', { fill: g, o: 0.6 }),
        T(20, 584, 380, 28, '{ngay_so}  ·  {thang}  ·  {nam}', { font: p.serif, size: 20, ls: 4, color: p.ink, anim: 'fade' }),
        S(80, 622, 260, 1, 'line', { fill: g, o: 0.6 }),
        T(20, 640, 380, 20, 'Kính gửi', { font: p.sans, size: 13, color: p.soft }),
        T(20, 660, 380, 46, '{ten_khach}', { font: p.script, size: 32, color: '#b3262d', anim: 'up', delay: 0.5 }),
        I(-40, 760, 260, 104, CLOUD, { o: 0.95, anim: 'left' }),
        I(200, 780, 260, 104, CLOUD, { o: 0.95, anim: 'right' }),
        I(80, 820, 260, 104, CLOUD, { o: 0.9, anim: 'up' }),
      ]);
    },
    /** Khung viên thuốc lồng nhau, ảnh bo tròn, chữ Hỷ (o.hy) */
    pill(p, src, o = {}) {
      const g = gold(p);
      return sec(900, p.bg, [
        S(36, 40, 348, 820, 'rect', { stroke: g, sw: 1, radius: 400, o: 0.35 }),
        S(54, 60, 312, 780, 'rect', { stroke: g, sw: 1, radius: 400, o: 0.6 }),
        S(72, 80, 276, 740, 'rect', { stroke: g, sw: 1.5, radius: 400, o: 0.9 }),
        o.hy ? T(20, 120, 380, 60, '囍', { font: 'Noto Serif', size: 48, color: g, anim: 'zoom' }) : T(20, 132, 380, 30, '∿∿∿  ✦  ∿∿∿', { font: 'Noto Serif', size: 14, color: g }),
        T(20, 190, 380, 34, 'KÍNH GỬI', { font: p.sans, size: 24, bold: true, italic: true, ls: 2, color: p.ink2 || p.ink, anim: 'fade' }),
        T(20, 226, 380, 44, '{ten_khach}', { font: p.script, size: 32, color: g, anim: 'fade', delay: 0.15 }),
        I(92, 290, 236, 210, src, { radius: 110, border: 3, borderColor: g, shadow: true, anim: 'zoom' }),
        T(20, 520, 380, 66, '{chu_re}', script(p, { size: 50, anim: 'up', delay: 0.2 })),
        T(20, 578, 380, 34, '&', script(p, { size: 26, anim: 'zoom', delay: 0.3 })),
        T(20, 610, 380, 66, '{co_dau}', script(p, { size: 50, anim: 'up', delay: 0.35 })),
        T(20, 700, 380, 26, '{ngay_so} · {thang} · {nam}', { font: p.serif, size: 18, ls: 4, color: p.ink2 || p.ink, anim: 'fade', delay: 0.4 }),
        down(p, 770),
      ]);
    },
    /** Quỹ đạo ngân hà: ảnh tròn, vòng sáng, sao lấp lánh */
    orbit(p, src) {
      const g = gold(p);
      const stars = [[40, 70, 12], [360, 110, 16], [70, 300, 10], [350, 360, 12], [30, 560, 14], [380, 600, 10], [90, 820, 12], [330, 840, 16], [200, 40, 10], [210, 870, 10]];
      return sec(900, p.bg, [
        S(-90, 20, 600, 600, 'circle', { fill: p.glow || g, o: 0.14 }),
        ...stars.map(([x, y, s], i) => T(x, y, 30, 30, i % 2 ? '✦' : '✧', { font: 'Noto Serif', size: s, color: '#ffffff', o: 0.8, anim: 'fade', delay: i * 0.08 })),
        T(20, 80, 380, 20, 'THIỆP MỜI CƯỚI', kick(p, { color: g, anim: 'fade' })),
        S(70, 130, 280, 280, 'ring', { stroke: g, sw: 1, o: 0.4 }),
        S(90, 150, 240, 240, 'ring', { stroke: g, sw: 1.5, o: 0.7 }),
        S(102, 162, 216, 216, 'circle', { fill: g, o: 0.25 }),
        I(110, 170, 200, 200, src, { mask: 'circle', border: 3, borderColor: '#ffffff', anim: 'zoom' }),
        T(20, 440, 380, 66, '{chu_re}', { font: p.title || p.script, size: 52, color: '#ffffff', shadow: true, anim: 'up', delay: 0.2 }),
        T(20, 500, 380, 36, '&', { font: p.title || p.script, size: 30, color: g, anim: 'zoom', delay: 0.3 }),
        T(20, 532, 380, 66, '{co_dau}', { font: p.title || p.script, size: 52, color: '#ffffff', shadow: true, anim: 'up', delay: 0.35 }),
        T(20, 616, 380, 26, '{ngay_so}  ·  {thang}  ·  {nam}', { font: p.serif, size: 18, ls: 5, color: '#f2ecff', anim: 'fade', delay: 0.4 }),
        T(20, 670, 380, 20, 'Kính mời', { font: p.sans, size: 12, ls: 3, color: '#e3dbf7', upper: true }),
        T(20, 692, 380, 46, '{ten_khach}', { font: p.script, size: 34, color: g, anim: 'up', delay: 0.5 }),
        down(p, 790),
      ]);
    },
  };

  // ===================== TRANG ẢNH DÙNG RIÊNG BỘ NÀY =====================
  const fr = (p, o = {}) => ({ radius: p.r == null ? 8 : p.r, border: 4, borderColor: p.frame || '#ffffff', shadow: true, ...o });
  const head = (p, y, k, title) => [T(30, y, 360, 20, '—   ' + k + '   —', kick(p, { anim: 'fade' })), T(20, y + 24, 380, 58, title, script(p, { size: 40, anim: 'fade' }))];
  /** Lời ngỏ: ảnh lớn + câu thơ */
  function quote(p, src, o = {}) {
    return S2(p, 860, [
      I(40, 50, 340, 470, src, fr(p, { mask: o.mask || 'rect', anim: 'zoom' })),
      T(30, 548, 360, 92, o.title || 'Một đời bên nhau,\nvạn điều thương mến', script(p, { size: 36, lh: 1.25, anim: 'up' })),
      T(44, 656, 332, 150, o.line || 'Có những người đi qua đời nhau như một cơn gió. Còn chúng mình, đã chọn ở lại – để cùng nhau viết tiếp những trang đẹp nhất. Thật vui nếu ngày ấy có bạn ở bên.', K.sans(p, { size: 14, lh: 1.7, anim: 'up' })),
    ]);
  }
  /** Khoảnh khắc: 1 ảnh ngang lớn + 2 dọc + 3 vuông */
  function moments(p, ph, o = {}) {
    return S2(p, 1010, [
      ...head(p, 36, o.kick || 'Khoảnh khắc', o.title || 'Những Ngày Thương'),
      I(24, 150, 372, 260, ph[0], fr(p, { anim: 'zoom' })),
      I(24, 422, 182, 250, ph[1], fr(p, { anim: 'left' })),
      I(214, 422, 182, 250, ph[2], fr(p, { anim: 'right' })),
      I(24, 684, 118, 150, ph[3], fr(p, { anim: 'up' })),
      I(151, 684, 118, 150, ph[4], fr(p, { anim: 'up', delay: 0.08 })),
      I(278, 684, 118, 150, ph[5], fr(p, { anim: 'up', delay: 0.16 })),
      T(40, 860, 340, 90, o.line || '“Hạnh phúc không phải là đích đến, mà là từng bước mình đi cùng nhau.”', K.serif(p, { size: 16, italic: true, color: p.soft, lh: 1.6, anim: 'up' })),
    ]);
  }
  /** Polaroid xếp nghiêng */
  function polaroids(p, ph, o = {}) {
    const pol = (x, y, r, src, d) => [S(x, y, 176, 214, 'rect', { fill: '#ffffff', shadow: true, r, anim: 'zoom', delay: d }), I(x + 10, y + 10, 156, 166, src, { r, anim: 'zoom', delay: d })];
    return S2(p, 900, [
      ...head(p, 36, o.kick || 'Album', o.title || 'Kỷ Niệm Xinh'),
      ...pol(30, 160, -5, ph[0], 0),
      ...pol(214, 180, 4, ph[1], 0.1),
      ...pol(40, 400, 3, ph[2], 0.15),
      ...pol(206, 420, -4, ph[3], 0.2),
      ...pol(120, 640, -2, ph[4], 0.25),
    ]);
  }
  /** Cuộn phim: 4 khung ảnh ngang trên dải phim đen */
  function reel(p, ph, o = {}) {
    const holes = '▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮';
    const els = [...head(p, 36, o.kick || 'Thước phim', o.title || 'Phim Của Chúng Mình'), S(30, 150, 360, 4 * 200 + 40, 'rect', { fill: '#0b0b0b', shadow: true })];
    els.push(T(30, 154, 360, 16, holes, { font: 'Noto Serif', size: 11, ls: 4, color: '#e9e3d4', o: 0.8 }));
    for (let i = 0; i < 4; i++) els.push(I(50, 176 + i * 200, 320, 186, ph[i], { filter: 'film', anim: 'fade', delay: i * 0.05 }));
    els.push(T(30, 150 + 4 * 200 + 20, 360, 16, holes, { font: 'Noto Serif', size: 11, ls: 4, color: '#e9e3d4', o: 0.8 }));
    return S2(p, 150 + 4 * 200 + 80, els);
  }

  // ===================== 4 MẪU MỚI =====================
  /** Khung chung của bộ mẫu: 19 trang (+ trang "Bộ sưu tập" do buildAll chèn = 20) */
  function full(p, ph, cover, o = {}) {
    const at = (i) => ph[i % ph.length];
    return [
      cover(p, at(0)),
      quote(p, at(1), o.quote),
      B.parents(p, o.parents),
      B.pair(p, { src: at(2), oy: 30 }, { src: at(3), oy: 30 }),
      B.invite(p, at(4), o.invite),
      B.story(p, [at(5), at(6), at(7)], o.story),
      B.rites(p),
      B.calendar(p),
      B.countdown(p),
      B.timeline(p, o.timeline),
      o.reel ? reel(p, [at(8), at(9), at(10), at(11)]) : B.strip(p, [at(8), at(9), at(10)]),
      o.polaroid ? polaroids(p, [at(12), at(13), at(14), at(15), at(16)]) : B.album(p, [at(12), at(13), at(14), at(15), at(16), at(17), at(18), at(19), at(20)]),
      moments(p, [at(21), at(22), at(23), at(24), at(25), at(26)], o.moments),
      B.dress(p, { colors: p.t.dress, line: o.dressLine }),
      B.sign(p, at(27)),
      B.rsvp(p),
      B.wishes(p),
      B.gift(p),
      B.thanks(p, at(28)),
    ];
  }

  const defs = [
    {
      key: 'khu-vuon-loi-hua', thumb: 14, name: 'Khu Vườn Lời Hứa', folder: 'a47', tier: 'basic', opener: 'savedate', featured: 4, noAuto: true, song: 'one-day-at-a-time', fall: 'petals', autostart: true,
      tags: ['Hàn Quốc', 'Thiên nhiên'],
      desc: 'Vườn cỏ trắng kem và xanh ô liu, ảnh khung vòm “Save The Date”, tim nhỏ – mở thiệp kiểu lật trang.',
      op: { color: '#6f7d52', paper: '#f4f1e6', photoIdx: 0 },
      p: {
        page: '#e6e3d4', bg: '#f7f5ec', bg2: '#f1eee2', tex: LINEN, card: '#ffffffcc', cardLine: '#d6d2bd', ink: '#3b3f2c', ink2: '#5d6a3f', soft: '#77786a', gold: '#8a8f5a', accent: '#6f7d52', accent2: '#c9a24a', line: '#d6d2bd',
        kick: '#8a8f5a', frame: '#ffffff', deco: 'leaf', script: F.vibes, title: F.vibes, serif: F.corm, display: F.playfair, sans: F.mont,
        t: { dress: [{ c: '#f7f5ec', n: 'Trắng Kem' }, { c: '#a3ad7f', n: 'Xanh Ô Liu' }, { c: '#d9c9a3', n: 'Be Cát' }, { c: '#5d6a3f', n: 'Xanh Rêu' }] },
      },
      build: (p, ph) => full(p, ph, COVERS.savedate, { polaroid: true, quote: { mask: 'arch', title: 'Lời hứa\ngiữa khu vườn nhỏ' } }),
      photos: [4, 14, 11, 15, 1, 2, 3, 5, 6, 7, 10, 13, 16, 17, 4, 11, 14, 15, 1, 3, 5, 6, 2, 7, 10, 13, 16, 17, 4],
    },
    {
      key: 'bien-xanh-jeju', thumb: 10, name: 'Biển Xanh Jeju', folder: 'a48', tier: 'basic', opener: 'pill', featured: 4, noAuto: true, song: 'golden-hour', fall: 'petals', autostart: true,
      tags: ['Thiên nhiên', 'Du lịch'],
      desc: 'Trời xanh, đồng hoa và hoàng hôn trên biển, ba khung viên thuốc lồng nhau, thước phim kỷ niệm – mở thiệp khung viên thuốc.',
      op: { color: '#4e7fa8', paper: '#dfeaf3', photoIdx: 0 },
      p: {
        page: '#dbe6ef', bg: '#f3f7fa', bg2: '#e9f0f6', card: '#ffffff', cardLine: '#cddbe6', ink: '#24384a', ink2: '#2f5576', soft: '#6a7f91', gold: '#4e7fa8', accent: '#4e7fa8', accent2: '#e9a47a', line: '#cddbe6',
        kick: '#4e7fa8', frame: '#ffffff', deco: 'star', script: F.alex, title: F.alex, serif: F.corm, display: F.playfair, sans: F.mont, r: 14,
        t: { dress: [{ c: '#9cc2e0', n: 'Xanh Trời' }, { c: '#ffffff', n: 'Trắng Mây' }, { c: '#f2c4a3', n: 'Cam Hoàng Hôn' }, { c: '#e7dcc8', n: 'Be Cát' }] },
      },
      build: (p, ph) => full(p, ph, COVERS.pill, { reel: true, quote: { title: 'Biển hẹn,\ntrời thề', line: 'Ở nơi gió biển thổi qua những cánh đồng hoa, chúng mình đã nói lời “đồng ý”. Mời bạn đến chung vui cùng chúng mình trong ngày trọng đại.' }, moments: { title: 'Gió, Biển & Hoa' } }),
      photos: [2, 1, 10, 4, 5, 6, 3, 7, 8, 9, 11, 12, 15, 16, 23, 24, 25, 26, 27, 1, 10, 3, 5, 9, 12, 16, 23, 25, 26],
    },
    {
      key: 'den-long-hanok', thumb: 6, name: 'Đèn Lồng Hanok', folder: 'a49', tier: 'basic', opener: 'lantern', featured: 4, noAuto: true, song: 'thanh-than', fall: 'petals', autostart: true,
      tags: ['Truyền thống', 'Hàn Quốc'],
      desc: 'Đèn lồng cam, mây vàng và mặt trời mọc, cổ phục hanbok xen ảnh studio – mở thiệp đèn lồng, nhạc Thành Thân.',
      op: { color: '#e08a2c', paper: '#fbe9cc', photoIdx: 0 },
      p: {
        page: '#f3dfbf', bg: '#fdf4e4', bg2: '#fbecd2', tex: PAPER, card: '#fffaf0', cardLine: '#efd3a6', ink: '#4a2e14', ink2: '#7a4416', soft: '#8a6c4e', gold: '#c98a2c', accent: '#b3262d', accent2: '#e08a2c', line: '#efd3a6', lantern: '#e8742a',
        kick: '#c98a2c', iconBg: '#fff3dc', frame: '#ffffff', deco: 'dao', script: F.vibes, title: F.vibes, serif: F.playfair, display: F.playfair, sans: F.be,
        t: { dress: [{ c: '#e8742a', n: 'Cam Đèn Lồng' }, { c: '#f6d69a', n: 'Vàng Nắng' }, { c: '#b3262d', n: 'Đỏ Son' }, { c: '#fdf4e4', n: 'Trắng Ngà' }] },
      },
      build: (p, ph) => full(p, ph, COVERS.lantern, { quote: { mask: 'arch', title: 'Đèn hoa rực rỡ,\nđón ngày vu quy' }, story: { title: 'Duyên Lành' } }),
      photos: [12, 25, 13, 22, 23, 6, 16, 20, 24, 7, 17, 3, 10, 11, 14, 19, 21, 4, 5, 1, 2, 8, 9, 15, 18, 13, 25, 12, 20],
    },
    {
      key: 'buoi-cong-chieu', thumb: 15, name: 'Buổi Công Chiếu Tình Yêu', folder: 'a50', tier: 'basic', opener: 'cinema', featured: 4, noAuto: true, song: 'in-love', fall: 'sparkle', autostart: true,
      tags: ['Điện ảnh', 'Cá tính'],
      desc: 'Rạp chiếu phim đen – vàng, dải phim hai bên, vé mời ghi tên khách, cuộn phim kỷ niệm – mở thiệp kiểu bật đèn chiếu.',
      op: { color: '#e2b54a', paper: '#16130f', photoIdx: 0 },
      p: {
        page: '#0e0c0a', bg: '#1a1612', bg2: '#15120f', card: '#ffffff10', cardLine: '#e2b54a55', ink: '#f6efe2', soft: '#cfc4b0', gold: '#e2b54a', accent: '#d9a63c', accent2: '#f3d58a', line: '#e2b54a44',
        kick: '#e2b54a', iconBg: '#ffffff0d', frame: '#f6efe2', deco: 'star', calBg: '#f6efe2', script: F.vibes, title: F.playfair, serif: F.playfair, display: F.playfair, sans: F.be, wInk: '#2a2118',
        t: { dress: [{ c: '#1a1612', n: 'Đen Nhung' }, { c: '#e2b54a', n: 'Vàng Đèn Chiếu' }, { c: '#7a1f2b', n: 'Đỏ Ghế Rạp' }, { c: '#f6efe2', n: 'Trắng Ngà' }] },
      },
      build: (p, ph) => full(p, ph, COVERS.cinema, { reel: true, quote: { title: 'Bộ phim\ncủa hai ta', line: 'Mỗi cuộc tình là một bộ phim – và chúng mình may mắn được đóng vai chính trong câu chuyện của nhau. Mời bạn đến xem buổi công chiếu đặc biệt nhất.' }, story: { title: 'Kịch Bản Tình Yêu' }, moments: { kick: 'Hậu trường', title: 'Cảnh Quay Đẹp Nhất' } }),
      photos: [15, 9, 2, 3, 26, 25, 5, 6, 7, 10, 11, 12, 16, 17, 21, 24, 27, 28, 1, 4, 8, 13, 14, 9, 15, 2, 16, 24, 26],
    },
  ];

  /**
   * Làm mới 8 mẫu cũ đang trùng kiểu mở/phong cách (19/11/2026): thay trang bìa + kiểu mở thiệp.
   * cover(p, ảnh bìa) dùng bảng màu của mẫu, `p` ghi đè vài màu cho hợp bìa mới.
   */
  const RESTYLE = {
    'mua-yeu-den-trang': { opener: 'cinema', op: { color: '#c9a46a', paper: '#121212' }, cover: (p, src) => COVERS.cinema({ ...p, bg: '#121212', gold: '#c9a46a', kick: '#c9a46a' }, src), desc: 'Đen trắng cá tính kiểu rạp chiếu phim: dải phim hai bên, vé mời ghi tên khách, chuyện tình kể theo chương – mở thiệp bật đèn chiếu.' },
    'dem-thanh-pho': { opener: 'orbit', op: { color: '#e8b04b', paper: '#0e1424' }, cover: (p, src) => COVERS.orbit({ ...p, bg: '#0e1424', glow: '#6d5bd0' }, src), desc: 'Nền xanh đêm, vòng sáng quỹ đạo quanh ảnh cưới, chữ vàng ấm – mở thiệp quỹ đạo ngân hà.' },
    'le-cuoi-tren-doi': { opener: 'scroll', op: { color: '#2f6b4f', paper: '#e8eadf' }, cover: (p, src) => COVERS.scroll({ ...p, accent: '#2f6b4f', accent2: '#d9822b', rod: '#2f5a43', kick: '#2f6b4f' }, src), desc: 'Cuộn thư giấy dó trục xanh, ảnh tròn và ruy băng ngày cưới, lễ cưới ngoài trời trên đồi – mở thiệp cuộn thư.' },
    'hanbok-xuan-thi': { opener: 'lantern', op: { color: '#d9822b', paper: '#fbeacd' }, cover: (p, src) => COVERS.lantern({ ...p, bg: '#fdf3e2', gold: '#c98a2c', kick: '#c98a2c' }, src), desc: 'Cổ phục và váy cưới, đèn lồng cam và mây vàng, mặt trời mọc – mở thiệp đèn lồng.' },
    'hoa-hong-do': { opener: 'pill', op: { color: '#e3c27f', paper: '#7a1424' }, cover: (p, src) => COVERS.pill({ ...p, bg: '#7a1424', gold: '#e9c77f', ink: '#fff3e0', ink2: '#fff3e0', title: F.vibes }, src, { hy: true }), desc: 'Đỏ rượu và vàng nhũ, chữ Hỷ, ba khung viên thuốc lồng nhau quanh ảnh cưới – mở thiệp khung viên thuốc.' },
    'hoang-hon-san-thuong': { opener: 'pill', op: { color: '#8a6bb8', paper: '#e6dcf0' }, cover: (p, src) => COVERS.pill({ ...p, bg: '#ebe2f3', gold: '#8a6bb8', ink: '#3d2c4f', ink2: '#4a3566', title: 'Alex Brush' }, src), desc: 'Tím oải hương hoàng hôn, khung viên thuốc mảnh lồng nhau và chữ viết tay – mở thiệp khung viên thuốc.' },
    'vuon-lua-trang': { opener: 'savedate', op: { color: '#6f8160', paper: '#eef0e6' }, cover: (p, src) => COVERS.savedate({ ...p, title: 'Alex Brush', ink2: '#4f5f42' }, src), desc: 'Váy lụa trắng giữa vườn xanh, ảnh khung vòm “Save The Date” – mở thiệp kiểu lật trang.' },
    'sac-mau-thanh-pho': { opener: 'savedate', op: { color: '#c9821f', paper: '#fff6e2' }, cover: (p, src) => COVERS.savedate({ ...p, gold: '#c9821f', ink2: '#8a5a12', accent2: '#e05a3a' }, src, { title: 'Say Yes!' }), desc: 'Vàng cam rực rỡ, ảnh vòm “Say Yes!” và polaroid vui nhộn – mở thiệp kiểu lật trang.' },
  };

  return { defs, COVERS, RESTYLE };
};
