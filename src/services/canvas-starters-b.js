'use strict';
/**
 * Bộ mẫu ảnh thứ hai (18/11/2026): 8 mẫu Basic dùng ảnh a40, a42–a46.
 * Bố cục tham khảo cách sắp xếp của các thiệp cưới online phổ biến (bìa, hai họ, thư mời,
 * nghi lễ, lịch, đếm ngược, timeline, chuyện tình, album, ký tên, hồi âm, mừng cưới, cảm ơn)
 * nhưng toàn bộ câu chữ, hoạ tiết SVG (public/img/deco, public/img/nen) là của SOBA.
 *
 * Mỗi mẫu dùng nhiều ảnh hơn bộ cũ (14–20 ảnh/thiệp, có lặp lại).
 * Xuất ra hàm make(kit) → mảng DEFS cùng định dạng với canvas-starters.js.
 */
module.exports = function make(kit) {
  const { T, I, S, G, sec, W } = kit;
  const DAO = '/img/deco/hoa-dao.svg';
  const TRUC = '/img/deco/truc.svg';
  const LEAF = '/img/deco/la-net.svg';
  const FLW = '/img/deco/hoa-net.svg';
  const FLW_D = '/img/deco/hoa-net-dam.svg';
  const BOW = '/img/deco/no-lua.svg';
  const XE = '/img/deco/xe-may.svg';
  const PAPER = '/img/nen/giay-hat.svg';
  const LINEN = '/img/nen/vai-lanh.svg';
  const QUILT = '/img/nen/chan-bong.svg';
  const TILE = '/img/nen/gach-bong.svg';
  const TILE_BAND = '/img/nen/vien-gach.svg';

  const wid = (p) => ({ color: p.accent, textColor: p.wInk || p.ink, font: p.sans });
  // Kiểu chữ dùng chung theo bảng màu p
  const K = {
    kick: (p, o = {}) => ({ font: p.sans, size: 11, ls: 5, bold: true, color: p.kick || p.accent, upper: true, ...o }),
    title: (p, o = {}) => ({ font: p.title || p.script, size: 40, color: p.gold || p.ink, lh: 1.15, ...o }),
    serif: (p, o = {}) => ({ font: p.serif, size: 16, color: p.ink, ...o }),
    sans: (p, o = {}) => ({ font: p.sans, size: 13, color: p.soft, lh: 1.6, ...o }),
    script: (p, o = {}) => ({ font: p.script, size: 40, color: p.gold || p.ink, ...o }),
  };
  /** Khối tiêu đề: dòng nhỏ + tiêu đề lớn + hoạ tiết. Trả về [els, chiều cao] */
  function hd(p, y, kick, title, o = {}) {
    const els = [];
    if (kick) els.push(T(30, y, 360, 20, '—   ' + kick + '   —', K.kick(p, { anim: 'fade' })));
    els.push(T(20, y + (kick ? 24 : 0), 380, o.h || 58, title, K.title(p, { size: o.size || 40, anim: 'fade', ...(o.t || {}) })));
    const dy = y + (kick ? 24 : 0) + (o.h || 58) + 4;
    if (p.deco === 'dao') els.push(I(196, dy, 28, 28, DAO, { anim: 'zoom' }));
    else if (p.deco === 'leaf') els.push(I(150, dy - 4, 120, 45, LEAF, { anim: 'fade' }));
    else if (p.deco !== 'none') els.push(T(30, dy, 360, 22, '✦', { font: 'Noto Serif', size: 14, color: p.gold || p.accent, anim: 'fade' }));
    return els;
  }
  const HD = 120; // chiều cao khối tiêu đề có dòng nhỏ
  const bgTex = (p) => p.tex || '';
  const S2 = (p, h, els, bg) => sec(h, bg || p.bg, els, bgTex(p));

  // ===================== CÁC TRANG DÙNG CHUNG =====================
  const B = {
    /** Hai họ: hai thẻ nhà trai / nhà gái + lời báo tin */
    parents(p, o = {}) {
      const c = { fill: p.card, stroke: p.cardLine || p.line, sw: 1, radius: p.r == null ? 14 : p.r };
      const els = [
        ...hd(p, 40, o.kick || 'Hai họ', o.title || 'Hai Bên Gia Đình', { size: 36 }),
        S(28, 196, 176, 152, 'rect', { ...c, anim: 'left' }),
        T(28, 214, 176, 20, 'NHÀ TRAI', K.kick(p, { ls: 3, anim: 'left' })),
        T(36, 242, 160, 52, 'Ông Nguyễn Văn Hùng\nBà Lê Thị Thu', K.serif(p, { size: 14.5, lh: 1.6, anim: 'left' })),
        T(36, 304, 160, 20, o.addrG || 'Quận 3, TP. Hồ Chí Minh', K.sans(p, { size: 11.5, italic: true, anim: 'left' })),
        S(216, 196, 176, 152, 'rect', { ...c, anim: 'right' }),
        T(216, 214, 176, 20, 'NHÀ GÁI', K.kick(p, { ls: 3, anim: 'right' })),
        T(224, 242, 160, 52, 'Ông Trần Quốc Bảo\nBà Phạm Thị Mai', K.serif(p, { size: 14.5, lh: 1.6, anim: 'right' })),
        T(224, 304, 160, 20, o.addrB || 'Quận 5, TP. Hồ Chí Minh', K.sans(p, { size: 11.5, italic: true, anim: 'right' })),
        T(40, 370, 340, 44, 'Trân trọng báo tin lễ thành hôn\ncủa con chúng tôi', K.serif(p, { size: 15, italic: true, color: p.soft, lh: 1.5, anim: 'up' })),
      ];
      return S2(p, 440, els, o.bg);
    },
    /** Chú rể / cô dâu: hai ảnh dọc cạnh nhau (crop từ một ảnh đôi nếu cần) */
    pair(p, g, b, o = {}) {
      const fr = { radius: p.r == null ? 10 : p.r, border: 4, borderColor: p.frame || '#ffffff', shadow: true };
      const els = [
        I(26, 40, 178, 250, g.src, { ...fr, zoom: g.zoom || 1, ox: g.ox == null ? 50 : g.ox, oy: g.oy == null ? 40 : g.oy, anim: 'left' }),
        I(216, 40, 178, 250, b.src, { ...fr, zoom: b.zoom || 1, ox: b.ox == null ? 50 : b.ox, oy: b.oy == null ? 40 : b.oy, anim: 'right' }),
        T(26, 306, 178, 18, 'CHÚ RỂ', K.kick(p, { ls: 3, size: 10.5 })),
        T(26, 326, 178, 34, '{chu_re}', K.script(p, { size: 30, anim: 'up' })),
        T(216, 306, 178, 18, 'CÔ DÂU', K.kick(p, { ls: 3, size: 10.5 })),
        T(216, 326, 178, 34, '{co_dau}', K.script(p, { size: 30, anim: 'up' })),
      ];
      if (p.deco === 'dao') els.push(I(186, 26, 30, 30, DAO), I(376, 272, 30, 30, DAO), I(10, 272, 26, 26, DAO));
      return S2(p, o.h || 390, els, o.bg);
    },
    /** Thư mời tiệc: tên khách, ảnh, ngày 3 cột, âm lịch, nhà hàng, chỉ đường */
    invite(p, src, o = {}) {
      const addr = o.addr || '86 Nguyễn Sinh Cung, TP. Huế';
      const c = { fill: p.card, stroke: p.cardLine || p.line, sw: 1, radius: p.r == null ? 16 : p.r };
      const els = [
        ...hd(p, 36, o.kick || 'Thư mời', o.title || 'Trân Trọng Kính Mời', { size: 34 }),
        T(30, 168, 360, 20, 'Kính mời', K.sans(p, { size: 12.5, italic: true })),
        T(20, 188, 380, 52, '{ten_khach}', K.script(p, { size: 40, color: p.accent2 || p.gold || p.accent, anim: 'up' })),
        T(40, 244, 340, 22, o.line || 'tới dự bữa tiệc chung vui cùng gia đình chúng tôi', K.sans(p, { size: 13, italic: true })),
        I(40, 282, 340, 300, src, { radius: p.r == null ? 14 : p.r, border: 4, borderColor: p.frame || '#ffffff', shadow: true, anim: 'zoom' }),
        S(28, 606, 364, 156, 'rect', { ...c, anim: 'up' }),
        T(36, 630, 108, 22, '{gio}', K.serif(p, { size: 20, bold: true, color: p.gold || p.accent })),
        T(36, 656, 108, 20, o.what || 'Khai tiệc', K.sans(p, { size: 12 })),
        S(146, 624, 1, 84, 'line', { fill: p.line }),
        T(148, 618, 124, 20, '{thu}', K.sans(p, { size: 12, color: p.ink, upper: true, ls: 1 })),
        T(148, 636, 124, 54, '{ngay_so}', K.serif(p, { size: 46, bold: true, color: p.gold || p.accent, lh: 1.1 })),
        T(148, 690, 124, 20, 'Tháng {thang} · {nam}', K.sans(p, { size: 12, color: p.ink })),
        S(274, 624, 1, 84, 'line', { fill: p.line }),
        T(276, 630, 108, 22, o.side || 'Tiệc cưới', K.serif(p, { size: 15, italic: true, color: p.ink })),
        T(276, 656, 108, 20, 'tại nhà hàng', K.sans(p, { size: 12 })),
        T(36, 724, 348, 20, '(Nhằm ngày {am_lich})', K.serif(p, { size: 13.5, italic: true, color: p.soft })),
        T(30, 786, 360, 20, 'ĐỊA ĐIỂM', K.kick(p, { ls: 4 })),
        T(20, 810, 380, 40, o.venue || 'Nhà hàng Hương Sen', K.serif(p, { font: p.display || p.serif, size: 28, bold: true, color: p.gold || p.ink })),
        T(40, 852, 340, 40, addr, K.sans(p, { size: 13 })),
        G(120, 900, 180, 40, 'map', { ...wid(p), style: 'button', label: 'Xem chỉ đường', address: addr }),
      ];
      return S2(p, 980, els, o.bg);
    },
    /** Nghi lễ tại tư gia: các thẻ có biểu tượng tròn */
    rites(p, o = {}) {
      const list = o.list || [
        ['⚭', 'Lễ Vu Quy', '08:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà gái\nQuận 5, TP. Hồ Chí Minh'],
        ['⌂', 'Lễ Thành Hôn', '10:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà trai\nQuận 3, TP. Hồ Chí Minh'],
      ];
      const c = { fill: p.card, stroke: p.cardLine || p.line, sw: 1, radius: p.r == null ? 16 : p.r };
      const els = [...hd(p, 36, o.kick || 'Nghi lễ', o.title || 'Lễ Gia Tiên', { size: 38 })];
      list.forEach((it, i) => {
        const y = 170 + i * 216;
        els.push(
          S(34, y, 352, 196, 'rect', { ...c, anim: 'up' }),
          S(186, y + 18, 48, 48, 'circle', { fill: p.iconBg || p.bg2, stroke: p.gold || p.accent, sw: 1, anim: 'zoom' }),
          T(186, y + 26, 48, 32, it[0], { font: 'Noto Serif', size: 20, color: p.gold || p.accent }),
          T(44, y + 76, 332, 30, it[1], K.serif(p, { font: p.display || p.serif, size: 22, bold: true, color: p.ink })),
          T(44, y + 108, 332, 22, it[2], K.sans(p, { size: 13, bold: true, color: p.gold || p.accent, ls: 1 })),
          T(54, y + 134, 312, 46, it[3], K.sans(p, { size: 12.5, lh: 1.6 }))
        );
      });
      els.push(G(120, 170 + list.length * 216 + 4, 180, 40, 'addcal', { ...wid(p), time: '10:00', title: 'Lễ thành hôn {chu_re} & {co_dau}' }));
      return S2(p, 170 + list.length * 216 + 74, els, o.bg);
    },
    /** Lịch tháng cưới */
    calendar(p, o = {}) {
      const els = [
        ...hd(p, 36, o.kick || 'Save the date', o.title || 'Lịch Cưới', { size: 38 }),
        T(30, 166, 360, 24, 'Tháng {thang} · {nam}', K.serif(p, { size: 18, italic: true, color: p.ink })),
        G(40, 200, 340, 300, 'calendar', { ...wid(p), bg: p.calBg || '', anim: 'up' }),
        T(40, 516, 340, 60, o.line || 'Ngày chúng mình chính thức về chung một nhà – hãy lưu lại và dành cho chúng mình một chút thời gian nhé!', K.sans(p, { size: 13, italic: true })),
        G(120, 590, 180, 40, 'addcal', { ...wid(p), time: '{gio}', title: 'Đám cưới {chu_re} & {co_dau}' }),
      ];
      return S2(p, 670, els, o.bg);
    },
    /** Đếm ngược */
    countdown(p, o = {}) {
      return S2(p, 330, [...hd(p, 34, o.kick || 'Đếm ngược', o.title || 'Tới Ngày Chung Đôi', { size: 34 }), T(40, 160, 340, 40, o.line || 'Mỗi ngày trôi qua, chúng mình càng mong được gặp bạn', K.sans(p, { size: 13, italic: true })), G(40, 206, 340, 100, 'countdown', { ...wid(p), anim: 'up' })], o.bg);
    },
    /** Timeline trong khung: giờ | vòng tròn biểu tượng | việc */
    timeline(p, o = {}) {
      const items = o.items || [
        ['10:30', '♡', 'Đón khách'],
        ['11:00', '⚭', 'Cử hành hôn lễ'],
        ['11:30', '✦', 'Khai tiệc'],
        ['13:00', '❀', 'Chụp ảnh lưu niệm'],
      ];
      const els = [...hd(p, 36, o.kick || 'Lịch trình', o.title || 'Chương Trình Hôn Lễ', { size: 34 })];
      const top = 172;
      els.push(S(34, top, 352, items.length * 86 + 30, 'rect', { fill: p.card, stroke: p.cardLine || p.line, sw: 1, radius: p.r == null ? 18 : p.r, anim: 'up' }), S(169.5, top + 28, 1, items.length * 86 - 26, 'line', { fill: p.gold || p.accent, o: 0.6 }));
      items.forEach((it, i) => {
        const y = top + 24 + i * 86;
        els.push(
          T(50, y + 12, 96, 24, it[0], K.serif(p, { size: 18, bold: true, color: p.ink, align: 'right', anim: 'left' })),
          S(148, y, 44, 44, 'circle', { fill: p.gold || p.accent, anim: 'zoom' }),
          T(148, y + 8, 44, 28, it[1], { font: 'Noto Serif', size: 18, color: p.iconInk || '#ffffff' }),
          T(208, y + 12, 170, 24, it[2], K.serif(p, { size: 16, color: p.ink, align: 'left', anim: 'right' }))
        );
      });
      return S2(p, top + items.length * 86 + 80, els, o.bg);
    },
    /** Bản đồ đầy đủ */
    map(p, o = {}) {
      const addr = o.addr || '86 Nguyễn Sinh Cung, TP. Huế';
      return S2(p, 560, [...hd(p, 36, o.kick || 'Địa điểm', o.title || 'Đường Tới Hôn Lễ', { size: 34 }), G(40, 172, 340, 280, 'map', { ...wid(p), address: addr, anim: 'up' }), T(40, 466, 340, 26, o.venue || 'Nhà hàng Hương Sen', K.serif(p, { size: 18, bold: true, color: p.gold || p.ink })), T(40, 494, 340, 40, addr, K.sans(p, { size: 13 }))], o.bg);
    },
    /** Dresscode */
    dress(p, o = {}) {
      return S2(p, 420, [...hd(p, 36, o.kick || 'Trang phục', o.title || 'Sắc Màu Ngày Vui', { size: 34 }), T(40, 166, 340, 66, o.line || 'Rất mong Quý khách diện trang phục theo những gam màu dưới đây để ngày vui thêm hài hoà.', K.sans(p, { size: 13, italic: true })), G(30, 248, 360, 120, 'dresscode', { ...wid(p), colors: o.colors, anim: 'up' })], o.bg);
    },
    /** Album ghép 8 ảnh (2 lớn + 6 nhỏ) có viền */
    album(p, ph, o = {}) {
      const fr = { radius: p.r == null ? 8 : Math.min(p.r, 12), border: 3, borderColor: p.frame || '#ffffff', shadow: true };
      const at = (i) => ph[i % ph.length];
      const els = [
        ...hd(p, 36, o.kick || 'Album', o.title || 'Khoảnh Khắc Bên Nhau', { size: 34 }),
        T(40, 162, 340, 22, o.line || 'Mỗi khoảnh khắc bên nhau đều là kỷ vật quý giá', K.sans(p, { size: 13, italic: true })),
        I(24, 200, 236, 320, at(0), { ...fr, anim: 'left' }),
        I(270, 200, 126, 155, at(1), { ...fr, anim: 'right' }),
        I(270, 365, 126, 155, at(2), { ...fr, anim: 'right', delay: 0.1 }),
        I(24, 530, 120, 150, at(3), { ...fr, anim: 'up' }),
        I(150, 530, 120, 150, at(4), { ...fr, anim: 'up', delay: 0.08 }),
        I(276, 530, 120, 150, at(5), { ...fr, anim: 'up', delay: 0.16 }),
        I(24, 690, 126, 155, at(6), { ...fr, anim: 'left' }),
        I(160, 690, 236, 320, at(7), { ...fr, anim: 'right' }),
        I(24, 855, 126, 155, at(8), { ...fr, anim: 'left', delay: 0.1 }),
      ];
      return S2(p, 1050, els, o.bg);
    },
    /** Dải 3 ảnh nối nhau (ảnh giữa cao hơn) */
    strip(p, ph, o = {}) {
      const fr = { radius: p.r == null ? 6 : Math.min(p.r, 10), border: 3, borderColor: p.frame || '#ffffff', shadow: true };
      return S2(p, o.h || 330, [I(14, 60, 124, 200, ph[0], { ...fr, anim: 'left' }), I(146, 30, 128, 260, ph[1], { ...fr, anim: 'up' }), I(282, 60, 124, 200, ph[2], { ...fr, anim: 'right' })], o.bg);
    },
    /** Chuyện tình: ảnh ngang + mốc + đoạn văn */
    story(p, ph, o = {}) {
      const CH = o.chapters || [
        ['Mùa thu 2019', 'Lần đầu gặp gỡ', 'Một chiều mưa ngang qua phố, hai người xa lạ trú chung một mái hiên. Cơn mưa tạnh, để lại một lời chào và một ánh nhìn.'],
        ['Những năm tháng ấy', 'Cùng nhau lớn lên', 'Những buổi tan làm muộn, những chuyến xe xa nhà… chúng mình học cách thương nhau qua từng điều nhỏ bé.'],
        ['Mùa đông 2025', 'Lời cầu hôn', 'Một chiếc nhẫn, một câu hỏi run run và một cái gật đầu thật khẽ – thế là đủ cho cả một đời.'],
      ];
      const fr = { radius: p.r == null ? 10 : p.r, border: 4, borderColor: p.frame || '#ffffff', shadow: true };
      const els = [...hd(p, 36, o.kick || 'Chuyện của chúng mình', o.title || 'Love Story', { size: 44 })];
      CH.forEach((c, i) => {
        const y = 176 + i * 400;
        els.push(
          I(34, y, 352, 236, ph[i % ph.length], { ...fr, anim: 'up' }),
          T(30, y + 250, 360, 20, c[0], K.kick(p, { ls: 3, size: 11, anim: 'up' })),
          T(30, y + 272, 360, 32, c[1], K.serif(p, { font: p.display || p.serif, size: 22, bold: true, color: p.ink, anim: 'up' })),
          T(44, y + 308, 332, 72, c[2], K.sans(p, { size: 13, lh: 1.65, anim: 'up' }))
        );
        if (p.deco === 'dao') els.push(I(368, y - 12, 30, 30, DAO), I(22, y + 214, 26, 26, DAO));
      });
      return S2(p, 176 + CH.length * 400 + 10, els, o.bg);
    },
    /** Ký tên lưu bút đè lên ảnh */
    sign(p, src, o = {}) {
      return S2(p, 760, [
        ...hd(p, 34, o.kick || 'Lưu bút', o.title || 'Ký Tên Chúc Phúc', { size: 36 }),
        T(40, 160, 340, 40, 'Để lại chữ ký của bạn, cùng chúng mình lưu giữ ngày vui này mãi mãi.', K.sans(p, { size: 13 })),
        I(30, 210, 360, 520, src, { radius: p.r == null ? 20 : p.r, shadow: true, anim: 'fade' }),
        S(30, 210, 360, 520, 'rect', { fill: '#00000040', radius: p.r == null ? 20 : p.r }),
        T(30, 232, 360, 46, '{chu_re}  &  {co_dau}', { font: p.script, size: 32, color: '#ffffff', shadow: true }),
        G(30, 286, 360, 430, 'signature', { ...wid(p) }),
      ], o.bg);
    },
    /** Hồi âm */
    rsvp(p, o = {}) {
      return S2(p, 600, [...hd(p, 34, o.kick || 'Hồi âm', o.title || 'Xác Nhận Tham Dự', { size: 34 }), T(40, 160, 340, 40, o.line || 'Để gia đình chuẩn bị chu đáo, bạn vui lòng hồi âm sớm giúp chúng mình nhé!', K.sans(p, { size: 13 })), G(30, 210, 360, 360, 'rsvp', { ...wid(p) })], o.bg);
    },
    /** Lời chúc (có chế độ riêng tư) */
    wishes(p, o = {}) {
      return S2(p, 620, [...hd(p, 34, o.kick || 'Lời chúc', o.title || 'Gửi Lời Chúc Phúc', { size: 34 }), G(30, 170, 360, 420, 'wishes', { ...wid(p), privacy: true })], o.bg);
    },
    /** Hộp mừng cưới chạm để mở */
    gift(p, o = {}) {
      return S2(p, 500, [...hd(p, 34, o.kick || 'Mừng cưới', o.title || 'Hộp Mừng Cưới', { size: 34 }), T(40, 160, 340, 22, o.line || 'Cảm ơn tấm lòng của bạn dành cho chúng mình', K.sans(p, { size: 13, italic: true })), G(40, 196, 340, 280, 'gift', { ...wid(p), style: 'box' })], o.bg);
    },
    /** Cảm ơn trên ảnh tràn */
    thanks(p, src, o = {}) {
      return sec(720, p.bg, [
        I(0, 0, W, 720, src, { anim: 'zoom' }),
        S(0, 320, W, 400, 'rect', { fill: '#000000c0', grad: 'up' }),
        T(30, 490, 360, 80, o.title || 'Thank You', { font: p.script, size: 60, color: '#ffffff', shadow: true, anim: 'up' }),
        T(50, 574, 320, 50, o.line || 'Sự hiện diện của Quý khách là niềm vinh hạnh cho gia đình chúng tôi.', { font: p.sans, size: 13, color: '#ffffffe0', lh: 1.6, anim: 'up' }),
        T(30, 640, 360, 40, '{chu_re}  &  {co_dau}', { font: p.script, size: 28, color: '#ffffff', anim: 'up' }),
      ]);
    },
  };

  // ===================== 1. TRÚC XANH ẤN ĐỎ (a46) =====================
  // Giấy xanh rêu, cành trúc, chữ vàng nhũ, hoa đào – mở thiệp cửa giấy + ấn đỏ
  function trucXanh(p, ph) {
    const at = (i) => ph[i % ph.length];
    const cover = S2(p, 860, [
      I(-30, -20, 230, 230, TRUC, { anim: 'left' }),
      I(250, 640, 200, 200, TRUC, { r: 180, anim: 'right' }),
      I(290, -10, 160, 160, TRUC, { r: 90, o: 0.45 }),
      T(30, 150, 360, 20, 'SAVE THE DATE', K.kick(p, { color: p.cream, ls: 7, anim: 'fade' })),
      T(30, 196, 360, 30, 'LỄ THÀNH HÔN', { font: p.display, size: 22, ls: 4, color: p.gold, anim: 'fade', delay: 0.15 }),
      T(10, 246, 400, 92, '{chu_re}', K.script(p, { size: 70, color: p.cream, shadow: true, anim: 'up', delay: 0.2 })),
      T(10, 330, 400, 60, '&', K.script(p, { size: 50, color: '#f2b6c4', anim: 'zoom', delay: 0.3 })),
      T(10, 386, 400, 92, '{co_dau}', K.script(p, { size: 70, color: p.cream, shadow: true, anim: 'up', delay: 0.35 })),
      S(60, 512, 70, 1, 'line', { fill: p.gold }),
      T(130, 500, 160, 26, '{ngay_so} · {thang} · {nam}', { font: p.display, size: 17, ls: 3, color: p.gold, anim: 'fade', delay: 0.4 }),
      S(290, 512, 70, 1, 'line', { fill: p.gold }),
      T(30, 536, 360, 22, 'Nhằm ngày {am_lich}', K.serif(p, { size: 14, italic: true, color: p.cream, anim: 'fade', delay: 0.5 })),
      I(140, 600, 26, 26, DAO, { anim: 'zoom', delay: 0.6 }),
      I(197, 620, 22, 22, DAO, { anim: 'zoom', delay: 0.7 }),
      I(252, 600, 26, 26, DAO, { anim: 'zoom', delay: 0.8 }),
      T(30, 680, 360, 20, 'CUỘN XUỐNG', K.kick(p, { color: p.cream, ls: 6, size: 10, anim: 'fade', delay: 1 })),
      T(30, 700, 360, 24, '⌄', { font: 'Noto Serif', size: 22, color: p.gold, anim: 'down', delay: 1.1 }),
    ]);
    const quote = S2(p, 880, [
      I(54, 40, 312, 430, at(1), { mask: 'arch', radius: 8, border: 6, borderColor: p.cream, shadow: true, anim: 'zoom' }),
      I(40, 50, 34, 34, DAO), I(346, 50, 34, 34, DAO), I(70, 24, 24, 24, DAO), I(196, 18, 28, 28, DAO), I(326, 24, 24, 24, DAO),
      T(30, 500, 360, 92, 'Một đời bên nhau,\nvạn điều thương mến', K.script(p, { size: 38, color: p.gold, lh: 1.25, anim: 'up' })),
      T(44, 604, 332, 96, 'Giữa những ngày cuối năm se lạnh, chúng mình quyết định nắm tay nhau, cùng bước tiếp một chặng đường thật dài.', K.serif(p, { size: 15.5, color: p.cream, lh: 1.6, anim: 'up' })),
      T(44, 708, 332, 72, 'Thật vui nếu ngày ấy có bạn ở bên, chung vui và chúc phúc cho chúng mình.', K.serif(p, { size: 15.5, color: p.cream, lh: 1.6, anim: 'up', delay: 0.1 })),
      I(196, 806, 28, 28, DAO),
    ]);
    return [
      cover,
      quote,
      B.parents(p, { addrG: 'Phú Xuân, Huế', addrB: 'Thuận Hoá, Huế' }),
      B.pair(p, { src: at(0), zoom: 1.7, ox: 88, oy: 45 }, { src: at(0), zoom: 1.7, ox: 22, oy: 50 }),
      B.invite(p, at(2), { venue: 'Nhà hàng Hương Sen', addr: '86 Nguyễn Sinh Cung, TP. Huế' }),
      B.story(p, [at(3), at(4), at(5)], { title: 'Trúc Xinh' }),
      B.rites(p, { list: [['⚭', 'Lễ Vu Quy', '08:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà gái\nThuận Hoá, Huế'], ['⌂', 'Lễ Thành Hôn', '09:30 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà trai\nPhú Xuân, Huế']] }),
      B.calendar(p),
      B.countdown(p),
      B.timeline(p),
      B.strip(p, [at(6), at(7), at(8)]),
      B.map(p, { addr: '86 Nguyễn Sinh Cung, TP. Huế' }),
      B.dress(p, { colors: p.t.dress, line: 'Rất mong Quý khách diện trang phục theo những gam màu dưới đây, để ngày vui thêm hài hoà như sắc đào giữa trúc xanh.' }),
      B.album(p, [at(9), at(10), at(11), at(12), at(13), at(6), at(14), at(1), at(3)]),
      B.sign(p, at(15)),
      B.rsvp(p),
      B.wishes(p),
      B.gift(p),
      B.thanks(p, at(16)),
    ];
  }

  // ===================== 2. THƯ XANH HOA CỎ (a43) =====================
  // Nền xanh xô thơm với hoa lá nét trắng, thẻ trắng bo góc, đĩa than, chú rể/cô dâu so le
  function thuXanh(p, ph) {
    const at = (i) => ph[i % ph.length];
    const card = (y, h, o = {}) => S(24, y, 372, h, 'rect', { fill: '#ffffff', radius: 22, shadow: true, ...o });
    const flw = (x, y, s, r, o = 0.9) => I(x, y, s, s, FLW, { r, o });
    const cover = sec(980, p.bg, [
      flw(-60, -40, 240, 0), flw(260, 760, 240, 180), flw(300, 300, 160, 120, 0.5),
      card(30, 900, { anim: 'fade' }),
      I(40, 40, 170, 170, FLW_D, { o: 0.55 }), I(214, 700, 170, 170, FLW_D, { r: 180, o: 0.55 }),
      T(40, 70, 340, 56, 'Wedding Invitation', K.script(p, { size: 40, color: p.accent, anim: 'fade' })),
      T(40, 126, 340, 22, '{ngay_so} • {thang} • {nam}', K.sans(p, { size: 13, ls: 5, color: p.ink, anim: 'fade' })),
      I(90, 170, 240, 430, at(0), { radius: 120, border: 5, borderColor: '#ffffff', shadow: true, anim: 'zoom' }),
      S(84, 164, 252, 442, 'rect', { stroke: p.line, sw: 1, radius: 126 }),
      T(40, 630, 340, 60, '{chu_re}', K.script(p, { size: 46, color: p.ink, anim: 'up' })),
      T(40, 684, 340, 30, '&', K.script(p, { size: 28, color: p.accent })),
      T(40, 714, 340, 60, '{co_dau}', K.script(p, { size: 46, color: p.ink, anim: 'up', delay: 0.1 })),
      I(130, 784, 160, 60, LEAF, { anim: 'fade' }),
      T(40, 850, 340, 22, 'TRÂN TRỌNG KÍNH MỜI', K.kick(p, { color: p.accent, ls: 4 })),
    ], '');
    const vinyl = sec(560, p.bg2, [
      flw(-50, 330, 200, 60, 0.5),
      S(60, 40, 300, 300, 'circle', { fill: '#141414', shadow: true, anim: 'zoom' }),
      S(76, 56, 268, 268, 'ring', { stroke: '#2e2e2e', sw: 1 }),
      S(94, 74, 232, 232, 'ring', { stroke: '#2e2e2e', sw: 1 }),
      I(115, 95, 190, 190, at(1), { mask: 'circle', anim: 'spin' }),
      S(203, 183, 14, 14, 'circle', { fill: p.bg2 }),
      I(250, 230, 150, 150, FLW_D, { r: 200, o: 0.8 }),
      S(60, 400, 120, 1, 'line', { fill: p.accent }), S(240, 400, 120, 1, 'line', { fill: p.accent }),
      S(186, 376, 48, 48, 'ring', { stroke: p.accent, sw: 1.5 }),
      T(186, 384, 48, 30, '▶', { font: 'Be Vietnam Pro', size: 16, color: p.accent }),
      T(40, 450, 340, 60, '“Có những bản nhạc chỉ cần nghe một lần là nhớ cả đời – như ngày mình gặp nhau.”', K.serif(p, { size: 15, italic: true, color: p.soft, lh: 1.5 })),
    ]);
    const zig = sec(860, p.bg2, [
      S(24, 30, 372, 800, 'rect', { fill: '#ffffff', stroke: p.line, sw: 1, radius: 22 }),
      I(44, 56, 170, 300, at(2), { radius: 14, border: 4, borderColor: '#ffffff', shadow: true, anim: 'left' }),
      T(222, 130, 160, 110, '{chu_re}', K.script(p, { size: 44, color: p.ink, lh: 1.1, anim: 'right' })),
      T(222, 250, 160, 20, 'GROOM', K.kick(p, { ls: 6 })),
      I(242, 276, 120, 45, LEAF),
      T(38, 520, 170, 110, '{co_dau}', K.script(p, { size: 44, color: p.ink, lh: 1.1, anim: 'left' })),
      T(38, 640, 170, 20, 'BRIDE', K.kick(p, { ls: 6 })),
      I(62, 666, 120, 45, LEAF),
      I(206, 420, 170, 300, at(3), { radius: 14, border: 4, borderColor: '#ffffff', shadow: true, anim: 'right' }),
    ]);
    const invite = sec(1040, p.bg, [
      flw(-60, 760, 230, 30, 0.6), flw(260, -40, 220, 200, 0.6),
      card(30, 980),
      I(110, 44, 200, 200, FLW_D, { o: 0.6 }),
      T(40, 190, 340, 26, 'TRÂN TRỌNG KÍNH MỜI', K.kick(p, { size: 14, color: p.accent, ls: 3 })),
      S(120, 228, 180, 42, 'rect', { fill: p.bg2, stroke: p.line, sw: 1, radius: 21 }),
      T(120, 238, 180, 24, '{ten_khach}', K.sans(p, { size: 15, color: p.ink, bold: true })),
      T(50, 284, 320, 44, 'TỚI DỰ BỮA TIỆC MỪNG LỄ THÀNH HÔN\nCỦA CHÚNG TÔI', K.sans(p, { size: 11.5, ls: 1, lh: 1.6 })),
      I(130, 340, 160, 60, LEAF),
      T(40, 400, 340, 60, '{chu_re}', K.script(p, { size: 46, color: p.ink, anim: 'up' })),
      T(40, 454, 340, 30, '&', K.script(p, { size: 28, color: p.accent })),
      T(40, 484, 340, 60, '{co_dau}', K.script(p, { size: 46, color: p.ink, anim: 'up' })),
      I(130, 548, 160, 60, LEAF, { r: 180 }),
      T(50, 620, 320, 46, 'Vào lúc {gio} · {thu}\nngày {ngay_so} tháng {thang} năm {nam}', K.serif(p, { size: 16, color: p.ink, lh: 1.5 })),
      T(50, 670, 320, 20, '(Tức ngày {am_lich})', K.serif(p, { size: 13.5, italic: true })),
      T(50, 708, 320, 20, 'TẠI HỘI TRƯỜNG', K.kick(p, { ls: 3 })),
      T(40, 730, 340, 44, 'Garden Hall', K.script(p, { size: 40, color: p.accent })),
      T(60, 780, 300, 44, 'Tầng 2, Khách sạn Thảo Viên, 117 Trần Duy Hưng, Cầu Giấy, Hà Nội', K.sans(p, { size: 12.5 })),
      G(130, 836, 160, 38, 'map', { ...wid(p), style: 'button', label: 'Xem vị trí', address: '117 Trần Duy Hưng, Cầu Giấy, Hà Nội' }),
      S(60, 896, 300, 1, 'line', { fill: p.line }),
      T(44, 912, 160, 64, 'Nhà trai\nÔng Hoàng Minh Bảo\nBà Trần Thị Quỳnh', K.sans(p, { size: 12, color: p.ink, lh: 1.5 })),
      T(216, 912, 160, 64, 'Nhà gái\nÔng Nguyễn Văn Nam\nBà Trịnh Thu Trà', K.sans(p, { size: 12, color: p.ink, lh: 1.5 })),
    ]);
    const pw = { ...p, card: '#ffffff', tex: '' };
    return [
      cover,
      vinyl,
      zig,
      invite,
      B.countdown(pw, { kick: 'Thời gian đếm ngược', title: 'Ngày Chung Đôi', bg: p.bg2 }),
      B.calendar(pw, { bg: p.bg2 }),
      B.rites(pw, { kick: 'Các nghi lễ', title: 'Ngày Chung Đôi', bg: p.bg2, list: [['⚭', 'Lễ Vu Quy', '08:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà gái\nSố 4 Tôn Thất Thuyết, Cầu Giấy, Hà Nội'], ['⌂', 'Lễ Thành Hôn', '10:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà trai\n423 An Dương Vương, Tây Hồ, Hà Nội'], ['✦', 'Tiệc Mừng Cưới', '{gio} · {thu} {ngay_so}.{thang}.{nam}', 'Hội trường Garden Hall\n117 Trần Duy Hưng, Hà Nội']] }),
      B.strip(pw, [at(4), at(5), at(6)], { bg: p.bg2 }),
      B.timeline(pw, { kick: 'Timeline', title: 'Lịch Trình Ngày Chung Đôi', bg: p.bg2, items: [['08:00', '⚭', 'Lễ vu quy'], ['10:00', '⌂', 'Lễ thành hôn'], ['16:30', '♡', 'Đón khách'], ['17:00', '✦', 'Khai tiệc'], ['18:00', '❀', 'Cắt bánh · Rót rượu']] }),
      B.story(pw, [at(7), at(8), at(9)], { bg: p.bg2, chapters: [['Chương 1', 'Lần đầu gặp gỡ', 'Một ngày chẳng có gì đặc biệt, cho đến khi có một người nói chuyện đủ ấm để mình muốn trả lời thêm lần nữa.'], ['Chương 2', 'Thương nhau', 'Từ những câu chuyện vụn vặt mỗi tối, tụi mình nhận ra chỉ cần có nhau là mọi mệt mỏi đều nhẹ đi.'], ['Chương 3', 'Về chung một nhà', 'Không hoàn hảo, có lúc giận hờn, nhưng cuối cùng cả hai vẫn chọn ở lại – vì đã tìm thấy nhau.']] }),
      B.sign(pw, at(10), { kick: 'Signature', title: 'Lưu Bút', bg: p.bg2 }),
      B.album(pw, [at(11), at(12), at(13), at(14), at(15), at(16), at(17), at(0), at(4)], { kick: 'Our moments', title: 'Khoảnh Khắc Ngọt Ngào', bg: p.bg2 }),
      B.rsvp(pw, { bg: p.bg2 }),
      B.wishes(pw, { bg: p.bg2 }),
      B.dress(pw, { colors: p.t.dress, bg: p.bg2 }),
      B.gift(pw, { kick: 'Share the love', bg: p.bg2 }),
      B.thanks(p, at(18)),
    ];
  }

  // ===================== 3. NƠ LỤA NÂU (a44) =====================
  // Nền vải lanh xám kem, chữ nâu socola, nơ lụa trên ảnh, cánh hoa đỏ rơi
  function noLua(p, ph) {
    const at = (i) => ph[i % ph.length];
    const top = S2(p, 980, [
      T(30, 40, 360, 20, 'THIỆP MỜI CƯỚI', K.kick(p, { color: p.ink, ls: 6, anim: 'fade' })),
      S(30, 92, 110, 1, 'line', { fill: p.ink }), S(30, 136, 110, 1, 'line', { fill: p.ink }),
      T(30, 100, 110, 30, '{thu}', K.serif(p, { size: 20, color: p.ink })),
      S(150, 76, 1, 80, 'line', { fill: p.ink }),
      T(150, 72, 120, 26, 'Tháng {thang}', K.serif(p, { size: 18, color: p.ink })),
      T(150, 96, 120, 64, '{ngay_so}', K.serif(p, { font: 'Playfair Display', size: 54, color: p.ink, lh: 1.1, anim: 'zoom' })),
      S(270, 76, 1, 80, 'line', { fill: p.ink }),
      S(280, 92, 110, 1, 'line', { fill: p.ink }), S(280, 136, 110, 1, 'line', { fill: p.ink }),
      T(280, 100, 110, 30, '{nam}', K.serif(p, { size: 20, color: p.ink })),
      T(30, 176, 360, 22, 'GREATEST DAY', K.sans(p, { size: 13, ls: 4, color: p.ink })),
      I(14, 214, 392, 600, at(0), { radius: 4, border: 3, borderColor: p.ink, anim: 'zoom' }),
      I(250, 740, 150, 112, BOW, { r: -8, anim: 'zoom', delay: 0.4 }),
      T(30, 870, 360, 64, '{chu_re}  &  {co_dau}', K.script(p, { size: 40, color: p.ink, anim: 'up' })),
    ]);
    const invite = S2(p, 1120, [
      S(26, 30, 368, 170, 'rect', { fill: '#ffffff80', stroke: '#ffffff', sw: 1, radius: 20, anim: 'up' }),
      T(36, 54, 168, 20, 'NHÀ GÁI', K.kick(p, { color: p.ink, ls: 2 })),
      T(36, 82, 168, 50, 'Ông Đoàn Văn Biên\nBà Trần Thị Hoa', K.sans(p, { size: 12.5, italic: true, color: p.ink })),
      S(209.5, 52, 1, 90, 'line', { fill: p.line }),
      T(216, 54, 168, 20, 'NHÀ TRAI', K.kick(p, { color: p.ink, ls: 2 })),
      T(216, 82, 168, 50, 'Ông Hoàng Văn Sinh\nBà Vũ Thị Hạnh', K.sans(p, { size: 12.5, italic: true, color: p.ink })),
      T(36, 146, 348, 40, 'Trân trọng báo tin lễ thành hôn của con chúng tôi', K.sans(p, { size: 12, italic: true })),
      T(30, 236, 360, 36, 'Trân trọng kính mời', K.serif(p, { font: 'Playfair Display', size: 26, color: p.ink, anim: 'fade' })),
      T(30, 276, 360, 30, '{ten_khach}', K.serif(p, { size: 20, color: p.ink, anim: 'fade' })),
      T(30, 312, 360, 44, 'ĐẾN DỰ BUỔI TIỆC CHUNG VUI\nCÙNG GIA ĐÌNH CHÚNG TÔI', K.sans(p, { size: 13, bold: true, color: p.ink, lh: 1.5 })),
      T(20, 378, 380, 80, '{chu_re}', K.script(p, { size: 62, color: p.ink, anim: 'left' })),
      T(20, 462, 380, 80, '{co_dau}', K.script(p, { size: 62, color: p.ink, anim: 'right' })),
      I(14, 570, 124, 190, at(1), { border: 3, borderColor: p.ink, anim: 'left' }),
      I(146, 550, 128, 230, at(2), { border: 3, borderColor: p.ink, anim: 'up' }),
      I(282, 570, 124, 190, at(3), { border: 3, borderColor: p.ink, anim: 'right' }),
      T(30, 812, 360, 24, 'LỄ THÀNH HÔN', K.serif(p, { size: 18, bold: true, color: p.ink })),
      T(30, 838, 360, 22, 'Vào lúc', K.sans(p, { size: 13, color: p.ink })),
      T(20, 890, 110, 26, '10:00', K.serif(p, { size: 18, color: p.ink })),
      S(134, 866, 1, 80, 'line', { fill: p.ink }),
      T(136, 862, 148, 24, '{thu}', K.serif(p, { size: 16, bold: true, color: p.ink })),
      T(136, 884, 148, 50, '{ngay_so}', K.serif(p, { font: 'Playfair Display', size: 44, color: p.ink, lh: 1.1 })),
      T(136, 932, 148, 22, 'Tháng {thang}', K.serif(p, { size: 15, color: p.ink })),
      S(286, 866, 1, 80, 'line', { fill: p.ink }),
      T(290, 890, 110, 26, 'năm {nam}', K.serif(p, { size: 18, color: p.ink })),
      T(30, 966, 360, 20, '(Tức ngày {am_lich})', K.serif(p, { size: 13.5, italic: true })),
      T(30, 1004, 360, 26, 'TẠI TƯ GIA NHÀ GÁI', K.serif(p, { size: 18, bold: true, color: p.ink })),
      T(50, 1034, 320, 44, 'Km56, thôn 1B, xã Yên Phú\nTỉnh Tuyên Quang', K.sans(p, { size: 13, color: p.ink })),
    ]);
    const party = S2(p, 640, [
      S(26, 30, 368, 560, 'rect', { fill: '#ffffff70', stroke: '#ffffff', sw: 1, radius: 24, anim: 'up' }),
      T(30, 60, 360, 26, 'TIỆC MỪNG CƯỚI', K.serif(p, { size: 19, bold: true, color: p.ink })),
      T(30, 92, 360, 22, '{gio} – {thu}', K.sans(p, { size: 14, color: p.ink })),
      T(30, 120, 360, 40, '{ngay_so} . {thang} . {nam}', K.serif(p, { size: 28, bold: true, ls: 4, color: p.ink })),
      T(30, 164, 360, 20, '(Tức ngày {am_lich})', K.serif(p, { size: 13.5, italic: true })),
      S(50, 206, 320, 300, 'rect', { fill: '#ffffff', stroke: p.line, sw: 1, radius: 18, shadow: true }),
      T(60, 226, 300, 22, '—  Tại nhà hàng  —', K.serif(p, { size: 14, italic: true })),
      T(60, 258, 300, 62, 'Vala', { font: 'Playfair Display', size: 50, color: p.ink, bold: true }),
      T(60, 326, 300, 20, '◆', { font: 'Noto Serif', size: 12, color: '#b4483b' }),
      T(70, 352, 280, 48, 'Số 88 đường Ngô Quyền\nTỉnh Tuyên Quang', K.sans(p, { size: 13, color: p.ink })),
      G(120, 420, 180, 40, 'map', { ...wid(p), style: 'button', label: 'Chỉ đường', address: 'Số 88 Ngô Quyền, Tuyên Quang' }),
      G(120, 528, 180, 40, 'addcal', { ...wid(p), time: '{gio}', title: 'Tiệc cưới {chu_re} & {co_dau}' }),
    ]);
    const timelineOf = S2(p, 520, [
      T(30, 40, 360, 50, 'Timeline of', K.script(p, { size: 40, color: p.ink })),
      T(30, 90, 360, 40, 'THE WEDDING', K.serif(p, { font: 'Playfair Display', size: 26, ls: 4, color: p.ink })),
      S(60, 250, 300, 1, 'line', { fill: p.ink }),
      ...[['10:00', 'Ăn hỏi', '◇'], ['11:00', 'Nghi lễ', '⚭'], ['12:00', 'Nhập tiệc', '✦']].flatMap((it, i) => {
        const x = 30 + i * 120;
        return [
          S(x + 36, 166, 48, 48, 'circle', { fill: '#ffffff', stroke: p.ink, sw: 1, anim: 'zoom' }),
          T(x + 36, 174, 48, 30, it[2], { font: 'Noto Serif', size: 18, color: p.ink }),
          S(x + 56, 245, 10, 10, 'circle', { fill: p.ink }),
          T(x, 270, 120, 26, it[0], K.serif(p, { size: 20, bold: true, color: p.ink, anim: 'up' })),
          T(x, 298, 120, 22, it[1], K.sans(p, { size: 13, color: p.ink, anim: 'up' })),
        ];
      }),
      I(130, 360, 160, 120, BOW, { o: 0.9, anim: 'zoom' }),
    ]);
    const bg = S2(p, 1140, [
      T(30, 40, 360, 50, 'Cô dâu - Chú rể', K.script(p, { size: 40, color: p.ink })),
      I(30, 110, 360, 440, at(4), { border: 3, borderColor: p.ink, anim: 'up' }),
      T(30, 566, 360, 22, 'B  r  i  d  e', K.serif(p, { size: 16, ls: 4, italic: true })),
      T(30, 588, 360, 56, '{co_dau}', K.script(p, { size: 46, color: p.ink })),
      I(30, 660, 360, 400, at(5), { border: 3, borderColor: p.ink, anim: 'up' }),
      T(30, 1070, 360, 22, 'G  r  o  o  m', K.serif(p, { size: 16, ls: 4, italic: true })),
      T(30, 1090, 360, 50, '{chu_re}', K.script(p, { size: 46, color: p.ink })),
    ]);
    const pl = { ...p, card: '#ffffff80', cardLine: '#ffffff' };
    return [
      top,
      invite,
      party,
      timelineOf,
      bg,
      B.sign(pl, at(6), { kick: 'Lưu bút', title: 'Signature' }),
      B.story(pl, [at(7), at(8), at(9)], { kick: 'Beautiful memories', title: 'Our Love Story', chapters: [['Mùa thu 2020', 'Lần đầu gặp gỡ', 'Một khoảnh khắc thoáng qua trên sân trường, đủ để anh lấy hết can đảm làm quen – và em đã mỉm cười đáp lại.'], ['2020 – nay', 'Thanh xuân bên nhau', 'Cùng nhau qua những mùa thi, những chuyến đi xa và cả những ngày chẳng có gì đặc biệt mà vẫn thấy vui.'], ['Ngày chung đôi', 'Một chương mới', 'Câu chuyện dài tập của hai đứa nay được viết tiếp bằng một chương mới – một mái nhà nhỏ đầy yêu thương.']] }),
      B.countdown(pl, { kick: 'We will become a family in', title: 'Countdown' }),
      B.album(pl, [at(10), at(11), at(12), at(13), at(14), at(15), at(16), at(1), at(2)], { kick: 'Anniversary', title: 'Album' }),
      B.rsvp(pl, { kick: 'Xác nhận', title: 'Bạn sẽ đến chứ?', line: 'Chúng tôi rất mong được đón tiếp bạn. Xin hãy xác nhận sự hiện diện để gia đình chuẩn bị chu đáo nhất nhé!' }),
      B.wishes(pl, { kick: 'Guest book', title: 'Lời Chúc Từ Khách Mời' }),
      B.gift(pl, { kick: 'Mừng cưới', title: 'Share The Love', line: 'Chạm vào hộp quà để mở' }),
      B.dress(pl, { colors: p.t.dress, title: 'Dresscode' }),
      B.map(pl, { kick: 'Vị trí', title: 'Địa Chỉ Tiệc Cưới', addr: 'Số 88 Ngô Quyền, Tuyên Quang', venue: 'Nhà hàng Vala' }),
      B.thanks(p, at(17), { title: 'Thank you!', line: 'Sự hiện diện của bạn là niềm vinh hạnh cho gia đình chúng tôi. Chân thành cảm ơn!' }),
    ];
  }

  // ===================== 4. BẢN TIN HẠNH PHÚC (a40) =====================
  // Tờ báo Sài Gòn xưa: măng-sét, tin vui, rao vặt, lịch chiếu, lịch treo tường, radio đếm ngược
  function banTin(p, ph) {
    const at = (i) => ph[i % ph.length];
    const ink = p.ink;
    const page = (n, title, kick) => [
      I(0, 0, W, 28, TILE_BAND),
      T(24, 46, 180, 16, 'TRANG ' + n, K.kick(p, { color: ink, align: 'left', ls: 2, size: 10 })),
      T(216, 46, 180, 16, 'SÀI GÒN · SỐ ĐẶC BIỆT', K.kick(p, { color: ink, align: 'right', ls: 2, size: 10 })),
      S(24, 68, 372, 1, 'line', { fill: ink }),
      T(30, 88, 360, 20, '◆  ' + kick + '  ◆', K.kick(p, { color: '#b23b2e', ls: 3, size: 11 })),
      T(20, 110, 380, 50, title, { font: 'Oswald', size: 34, bold: true, color: ink, upper: true, anim: 'fade' }),
      T(30, 160, 360, 20, '◆', { font: 'Noto Serif', size: 12, color: '#b23b2e' }),
    ];
    const front = sec(1250, p.bg, [
      T(24, 26, 186, 16, 'SỐ ĐẶC BIỆT · NĂM THỨ NHẤT', K.kick(p, { color: ink, align: 'left', ls: 1, size: 9.5 })),
      T(210, 26, 186, 16, 'GIÁ: MỘT LỜI CHÚC', K.kick(p, { color: ink, align: 'right', ls: 1, size: 9.5 })),
      S(24, 46, 372, 1.5, 'rect', { fill: ink }),
      T(14, 52, 392, 60, 'BẢN TIN HẠNH PHÚC', { font: 'Oswald', size: 44, bold: true, color: ink, anim: 'fade' }),
      T(24, 112, 372, 20, 'Tin vui của hai trái tim · Phát hành tại Sài Gòn', K.serif(p, { size: 13, italic: true, color: ink })),
      S(24, 140, 372, 1, 'line', { fill: ink }),
      S(24, 150, 180, 66, 'rect', { stroke: ink, sw: 1 }),
      T(32, 156, 164, 54, 'Thời tiết: nắng đẹp, gió heo may – ngày lành tháng tốt.', K.serif(p, { size: 11.5, color: ink, align: 'left', lh: 1.45 })),
      S(216, 150, 180, 66, 'rect', { stroke: ink, sw: 1 }),
      T(224, 156, 164, 54, 'Mục rao vặt: đã tìm được người thương. Hết chỗ!', K.serif(p, { size: 11.5, color: ink, align: 'left', lh: 1.45 })),
      S(24, 228, 372, 3, 'rect', { fill: ink }), S(24, 234, 372, 1, 'line', { fill: ink }),
      T(24, 240, 372, 24, '{thu} · {ngay_so} tháng {thang} năm {nam}', K.serif(p, { size: 14, color: ink })),
      T(24, 262, 372, 20, 'Nhằm ngày {am_lich}', K.serif(p, { size: 12.5, italic: true, color: ink })),
      S(24, 288, 372, 1, 'line', { fill: ink }),
      S(165, 320, 90, 28, 'rect', { fill: '#b23b2e', anim: 'zoom' }),
      T(165, 324, 90, 20, 'TIN VUI', { font: 'Oswald', size: 13, ls: 3, color: '#ffffff' }),
      T(14, 360, 392, 72, '{chu_re}', K.script(p, { size: 56, color: p.accent, anim: 'up' })),
      T(14, 426, 392, 46, '&', K.script(p, { size: 38, color: '#b23b2e' })),
      T(14, 464, 392, 72, '{co_dau}', K.script(p, { size: 56, color: p.accent, anim: 'up', delay: 0.1 })),
      T(14, 540, 392, 36, 'CHÍNH THỨC VỀ CHUNG MỘT NHÀ', { font: 'Oswald', size: 22, bold: true, color: ink, anim: 'fade' }),
      I(30, 596, 360, 430, at(0), { border: 8, borderColor: '#ffffff', shadow: true, filter: 'warm', anim: 'zoom' }),
      S(300, 570, 82, 82, 'circle', { fill: '#fbf5e8', stroke: '#b23b2e', sw: 2, anim: 'zoom', delay: 0.3 }),
      T(300, 590, 82, 24, '{ngay_so}·{thang}', { font: 'Oswald', size: 18, bold: true, color: '#b23b2e' }),
      T(300, 614, 82, 18, 'HỶ SỰ', K.kick(p, { color: '#b23b2e', size: 9, ls: 2 })),
      T(30, 1032, 360, 36, 'Ảnh: Cô dâu và chú rể dạo phố đi bộ, mùa cưới năm nay.', K.serif(p, { size: 12, italic: true, color: ink, align: 'left' })),
      T(30, 1078, 360, 130, 'Sài Gòn, những ngày cuối năm — Sau bao mùa lá me bay trên phố, hai bạn trẻ đã quyết định nên duyên vợ chồng. Toà soạn trân trọng đưa tin vui này tới bạn đọc gần xa, cùng lời mời tới chung vui trong ngày trọng đại của gia đình.', K.serif(p, { size: 13.5, color: ink, align: 'justify', lh: 1.65 })),
      T(30, 1212, 360, 20, 'Phóng viên Tình Yêu đưa tin', K.serif(p, { size: 12.5, italic: true, color: ink, align: 'right' })),
    ], PAPER);
    const scooter = sec(260, p.bg, [I(120, 30, 180, 120, XE, { anim: 'left' }), T(30, 170, 360, 48, 'Rao vặt: Cần tìm người cùng đi hết cuộc đời – nay đã tìm thấy. Xin cảm ơn!', K.serif(p, { size: 13, italic: true, color: ink })), I(0, 232, W, 28, TILE_BAND)], PAPER);
    const invite = sec(1080, p.bg, [
      ...page(2, 'Thiệp Báo Hỷ', 'Mục tin mừng'),
      S(28, 196, 364, 840, 'rect', { fill: '#fffaf0', stroke: ink, sw: 1.5 }),
      S(36, 204, 348, 824, 'rect', { stroke: ink, sw: 0.6 }),
      T(40, 226, 340, 22, '✦ BÁO HỶ ✦', { font: 'Oswald', size: 15, ls: 4, color: '#b23b2e' }),
      T(40, 262, 340, 26, 'Trân trọng kính mời', K.serif(p, { size: 19, italic: true, color: ink })),
      T(30, 294, 360, 52, '{ten_khach}', K.script(p, { size: 40, color: p.accent, anim: 'up' })),
      T(50, 350, 320, 44, 'cùng gia đình tới dự bữa tiệc thân mật mừng lễ thành hôn của chúng tôi', K.serif(p, { size: 13.5, color: ink, lh: 1.55 })),
      I(60, 410, 300, 300, at(1), { border: 6, borderColor: '#ffffff', shadow: true, filter: 'warm', anim: 'zoom' }),
      T(40, 726, 340, 20, 'Tiệc cưới được tổ chức vào lúc', K.serif(p, { size: 13.5, italic: true, color: ink })),
      T(40, 750, 340, 30, '{gio}', { font: 'Oswald', size: 24, bold: true, color: ink }),
      S(60, 794, 90, 1, 'line', { fill: ink }), S(270, 794, 90, 1, 'line', { fill: ink }),
      T(60, 800, 90, 22, '{thu}', K.serif(p, { size: 13, color: ink })),
      T(150, 778, 120, 62, '{ngay_so}', { font: 'Oswald', size: 52, bold: true, color: '#b23b2e' }),
      T(270, 800, 90, 22, 'Tháng {thang}', K.serif(p, { size: 13, color: ink })),
      S(60, 828, 90, 1, 'line', { fill: ink }), S(270, 828, 90, 1, 'line', { fill: ink }),
      T(40, 846, 340, 22, '(Tức ngày {am_lich})', K.serif(p, { size: 13, italic: true, color: ink })),
      T(40, 880, 340, 20, 'TẠI NHÀ HÀNG', K.kick(p, { color: ink, ls: 3 })),
      T(40, 900, 340, 44, 'Hương Xưa', K.script(p, { size: 38, color: p.accent })),
      T(50, 946, 320, 40, 'Số 68 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', K.serif(p, { size: 12.5, color: ink })),
      G(130, 988, 160, 36, 'addcal', { ...wid(p), time: '{gio}', title: 'Tiệc cưới {chu_re} & {co_dau}' }),
    ], PAPER);
    const family = sec(860, p.bg, [
      ...page(3, 'Hai Họ Kết Thông Gia', 'Tin gia đình'),
      S(28, 196, 364, 140, 'rect', { fill: '#fffaf0', stroke: ink, sw: 1.2 }),
      S(209.5, 210, 1, 112, 'line', { fill: ink }),
      T(36, 210, 168, 20, 'NHÀ TRAI', K.kick(p, { color: '#b23b2e', ls: 2 })),
      T(36, 236, 168, 50, 'Ông Lê Văn Phước\nBà Trần Thị Thu Cúc', K.serif(p, { size: 13.5, color: ink, lh: 1.55 })),
      T(36, 292, 168, 20, 'Quận 3, TP. Hồ Chí Minh', K.serif(p, { size: 11.5, italic: true, color: ink })),
      T(216, 210, 168, 20, 'NHÀ GÁI', K.kick(p, { color: '#b23b2e', ls: 2 })),
      T(216, 236, 168, 50, 'Ông Phạm Minh Trí\nBà Võ Thị Mỹ Lệ', K.serif(p, { size: 13.5, color: ink, lh: 1.55 })),
      T(216, 292, 168, 20, 'Quận 5, TP. Hồ Chí Minh', K.serif(p, { size: 11.5, italic: true, color: ink })),
      T(40, 352, 340, 44, 'Trân trọng báo tin lễ thành hôn\ncủa con chúng tôi', K.serif(p, { size: 14, italic: true, color: ink, lh: 1.5 })),
      I(30, 416, 172, 290, at(2), { mask: 'arch', radius: 4, border: 4, borderColor: ink, filter: 'warm', zoom: 1.6, ox: 75, oy: 40, anim: 'left' }),
      I(218, 416, 172, 290, at(2), { mask: 'arch', radius: 4, border: 4, borderColor: ink, filter: 'warm', zoom: 1.6, ox: 25, oy: 40, anim: 'right' }),
      T(30, 718, 172, 18, 'CHÚ RỂ', K.kick(p, { color: '#b23b2e', ls: 2 })),
      T(30, 738, 172, 40, '{chu_re}', K.script(p, { size: 30, color: p.accent })),
      T(218, 718, 172, 18, 'CÔ DÂU', K.kick(p, { color: '#b23b2e', ls: 2 })),
      T(218, 738, 172, 40, '{co_dau}', K.script(p, { size: 30, color: p.accent })),
      I(0, 812, W, 28, TILE_BAND),
    ], PAPER);
    const NAVY = '#1f3554';
    const cinema = sec(860, p.bg, [
      ...page(4, 'Chương Trình Hôn Lễ', 'Mục giải trí · Lịch chiếu'),
      S(24, 196, 372, 620, 'rect', { fill: NAVY, radius: 14, shadow: true, anim: 'up' }),
      T(24, 206, 372, 22, '•  •  •  •  •  •  •  •  •  •  •  •  •  •  •  •', { font: 'Be Vietnam Pro', size: 12, color: '#f2d27a', ls: 4 }),
      T(24, 236, 372, 46, 'RẠP HẠNH PHÚC', { font: 'Oswald', size: 32, bold: true, color: '#f2d27a', ls: 3 }),
      T(24, 282, 372, 20, 'Suất chiếu đặc biệt · Chỉ một ngày duy nhất', K.serif(p, { size: 13, italic: true, color: '#f5ead2' })),
      ...[['08:00', 'Lễ Vu Quy', 'Tại tư gia nhà gái · Quận 5'], ['10:30', 'Lễ Thành Hôn', 'Tại tư gia nhà trai · Quận 3'], ['{gio}', 'Tiệc Cưới', 'Nhà hàng Hương Xưa · Quận 1']].flatMap((it, i) => {
        const y = 330 + i * 150;
        return [
          S(46, y, 328, 130, 'rect', { stroke: '#f2d27a80', sw: 1, radius: 10 }),
          S(62, y + 22, 44, 44, 'circle', { fill: '#f2d27a' }),
          T(62, y + 31, 44, 26, ['⚭', '⌂', '✦'][i], { font: 'Noto Serif', size: 18, color: NAVY }),
          T(120, y + 18, 240, 20, it[0] + ' · {thu} {ngay_so}.{thang}.{nam}', K.sans(p, { size: 12, bold: true, color: '#f2d27a', align: 'left' })),
          T(120, y + 40, 240, 34, it[1], { font: 'Oswald', size: 24, bold: true, color: '#ffffff', align: 'left', upper: true }),
          T(120, y + 78, 240, 40, it[2], K.serif(p, { size: 12.5, italic: true, color: '#f5ead2', align: 'left' })),
        ];
      }),
      T(24, 786, 372, 22, '•  •  •  •  •  •  •  •  •  •  •  •  •  •  •  •', { font: 'Be Vietnam Pro', size: 12, color: '#f2d27a', ls: 4 }),
    ], PAPER);
    const wall = sec(780, p.bg, [
      ...page(5, 'Ngày Lành Tháng Tốt', 'Lịch treo tường'),
      S(110, 200, 200, 300, 'rect', { fill: '#fffdf6', radius: 10, shadow: true, anim: 'zoom' }),
      S(110, 200, 200, 46, 'rect', { fill: '#b23b2e', radius: 10 }),
      S(110, 230, 200, 16, 'rect', { fill: '#b23b2e' }),
      T(110, 212, 200, 24, 'THÁNG {thang} · {nam}', { font: 'Oswald', size: 15, ls: 2, color: '#ffffff' }),
      T(110, 252, 200, 130, '{ngay_so}', { font: 'Oswald', size: 110, bold: true, color: '#b23b2e', lh: 1.1 }),
      T(110, 384, 200, 30, '{thu}', { font: 'Oswald', size: 22, bold: true, color: ink, upper: true }),
      T(110, 420, 200, 22, '{am_lich}', K.serif(p, { size: 11.5, italic: true, color: ink })),
      S(140, 452, 140, 30, 'rect', { stroke: ink, sw: 1 }),
      T(140, 458, 140, 20, 'NGÀY LÀNH · HỶ SỰ', K.kick(p, { color: ink, ls: 1, size: 10 })),
      G(40, 520, 340, 230, 'calendar', { ...wid(p), anim: 'up' }),
    ], PAPER);
    const radio = sec(560, p.bg, [
      ...page(6, 'Đếm Ngược Ngày Vui', 'Đài phát thanh Tình Yêu'),
      S(40, 196, 340, 190, 'rect', { fill: '#7d4a2c', radius: 22, shadow: true, anim: 'up' }),
      S(56, 212, 160, 158, 'rect', { fill: '#5a321d', radius: 12 }),
      T(56, 222, 160, 140, '|||||||||||||||||\n|||||||||||||||||\n|||||||||||||||||\n|||||||||||||||||', { font: 'Be Vietnam Pro', size: 16, color: '#3d2213', lh: 1.9 }),
      S(230, 212, 134, 70, 'rect', { fill: '#f6e7c4', radius: 6 }),
      T(230, 220, 134, 20, 'ĐÀI TÌNH YÊU', { font: 'Oswald', size: 12, ls: 2, color: ink }),
      T(230, 244, 134, 30, 'MW 600 · 800 · 1000', K.sans(p, { size: 10, color: ink })),
      S(244, 300, 46, 46, 'circle', { fill: '#e6c98f', stroke: '#3d2213', sw: 2 }),
      S(304, 300, 46, 46, 'circle', { fill: '#e6c98f', stroke: '#3d2213', sw: 2 }),
      G(40, 400, 340, 100, 'countdown', { ...wid(p), anim: 'up' }),
      T(40, 506, 340, 40, 'Mỗi ngày trôi qua, chúng tôi lại thêm mong được gặp Quý khách', K.serif(p, { size: 13, italic: true, color: ink })),
    ], PAPER);
    const pn = { ...p, card: '#fffaf0', cardLine: ink, r: 2, title: 'Oswald', gold: ink, kick: '#b23b2e', deco: 'none', frame: '#ffffff' };
    return [
      front,
      scooter,
      invite,
      family,
      cinema,
      wall,
      radio,
      B.timeline(pn, { kick: 'Giờ nào việc nấy', title: 'TRÌNH TỰ BUỔI TIỆC', items: [['17:30', '♡', 'Đón khách'], ['18:00', '⚭', 'Ra mắt hai họ'], ['18:30', '✦', 'Khai tiệc'], ['20:00', '❀', 'Chụp ảnh lưu niệm']] }),
      B.album(pn, [at(3), at(4), at(5), at(6), at(7), at(8), at(9), at(10), at(11)], { kick: 'Ảnh phóng sự', title: 'KHOẢNH KHẮC ĐÁNG NHỚ', line: 'Ghi lại bởi phóng viên Tình Yêu' }),
      B.sign(pn, at(12), { kick: 'Hộp thư bạn đọc', title: 'KÝ TÊN CHÚC PHÚC' }),
      B.rsvp(pn, { kick: 'Phiếu hồi âm', title: 'XÁC NHẬN THAM DỰ' }),
      B.wishes(pn, { kick: 'Thư bạn đọc', title: 'GỬI LỜI CHÚC' }),
      B.gift(pn, { kick: 'Mục đóng góp', title: 'HỘP MỪNG CƯỚI' }),
      B.map(pn, { kick: 'Chỉ đường', title: 'TỚI TIỆC CƯỚI', venue: 'Nhà hàng Hương Xưa', addr: 'Số 68 Đồng Khởi, Quận 1, TP. Hồ Chí Minh' }),
      B.thanks(p, at(13), { title: 'Cảm ơn bạn đọc!' }),
    ];
  }

  // ===================== 5. Ô LIU THANH LỊCH (a42) =====================
  // Ảnh tràn mờ dần vào nền ngà, chữ serif in hoa mảnh, khối ô liu, hoa lá nét mảnh
  function oLiu(p, ph) {
    const at = (i) => ph[i % ph.length];
    const OL = p.olive;
    const flw = (x, y, s, r, o = 0.8) => I(x, y, s, s, FLW_D, { r, o });
    const hero = sec(1000, p.bg, [
      I(0, 0, W, 760, at(0), { anim: 'zoom' }),
      S(0, 0, W, 240, 'rect', { fill: '#00000066', grad: 'down' }),
      S(0, 480, W, 290, 'rect', { fill: p.bg, grad: 'up' }),
      T(30, 50, 360, 90, 'You are invited to\nthe wedding celebration of', K.script(p, { size: 30, color: '#ffffff', shadow: true, lh: 1.25, anim: 'fade' })),
      T(10, 640, 400, 44, '{chu_re}  &  {co_dau}', { font: p.serif, size: 28, color: OL, upper: true, ls: 1, anim: 'up' }),
      T(130, 690, 160, 22, '— ✿ —', { font: 'Noto Serif', size: 14, color: OL }),
      flw(270, 790, 180, 180, 0.7),
      T(30, 800, 360, 46, 'Together, we found home', K.script(p, { size: 30, color: p.ink, anim: 'fade' })),
      T(20, 850, 380, 70, 'SAVE the DATE', { font: p.serif, size: 50, color: p.ink, ls: 2, anim: 'up' }),
      T(30, 930, 360, 30, '{thu}  ·  {ngay_so} . {thang} . {nam}', K.sans(p, { size: 13, ls: 4, color: OL })),
    ]);
    const mono = sec(840, p.bg, [
      flw(-60, 40, 200, 0, 0.6),
      I(60, 30, 300, 420, at(1), { anim: 'zoom' }),
      T(30, 470, 360, 90, '{chu_re} & {co_dau}', { font: p.serif, size: 34, color: OL, ls: 3, lh: 1.25, anim: 'fade' }),
      S(60, 620, 100, 1, 'line', { fill: OL }), S(260, 620, 100, 1, 'line', { fill: OL }),
      T(40, 588, 120, 26, '{thu}', K.sans(p, { size: 12, color: OL, upper: true, ls: 2 })),
      T(40, 628, 120, 22, '{gio}', K.sans(p, { size: 12, color: OL, ls: 2 })),
      S(169.5, 582, 1, 80, 'line', { fill: OL }),
      T(170, 578, 80, 84, '{ngay_so}', { font: p.serif, size: 60, color: OL, lh: 1.2 }),
      S(250.5, 582, 1, 80, 'line', { fill: OL }),
      T(260, 588, 120, 26, 'Tháng {thang}', K.sans(p, { size: 12, color: OL, upper: true, ls: 2 })),
      T(260, 628, 120, 22, '{nam}', K.sans(p, { size: 12, color: OL, ls: 2 })),
      T(30, 690, 360, 22, '(Nhằm ngày {am_lich})', K.serif(p, { size: 14, italic: true, color: p.soft })),
      G(120, 740, 180, 40, 'addcal', { ...wid(p), time: '{gio}', title: 'Đám cưới {chu_re} & {co_dau}' }),
    ]);
    const po = { ...p, bg: OL, ink: '#f3f0e3', soft: '#e3e1cf', gold: '#f3f0e3', kick: '#e9e3c4', card: '#ffffff1a', cardLine: '#ffffff55', wInk: '#3e3e2c', tex: '' };
    const profile = (src, en, token, bio) =>
      sec(720, p.bg, [
        flw(260, 560, 170, 180, 0.6),
        I(40, 40, 340, 470, src, { radius: 6, shadow: true, anim: 'up' }),
        S(40, 380, 340, 130, 'rect', { fill: '#00000080', grad: 'up', radius: 6 }),
        T(56, 408, 300, 40, en, K.script(p, { size: 34, color: '#ffffff', align: 'left' })),
        T(56, 446, 320, 48, token, { font: p.serif, size: 36, color: '#ffffff', ls: 2, upper: true, align: 'left' }),
        T(50, 540, 320, 140, bio, K.sans(p, { size: 13.5, color: p.soft, align: 'left', lh: 1.75, anim: 'up' })),
      ]);
    const events = sec(980, p.bg, [
      ...hd(p, 36, 'Wedding events', 'Sự Kiện Cưới', { size: 38 }),
      ...[['{gio}', 'Lễ Thành Hôn', '{thu}, ngày {ngay_so} tháng {thang} năm {nam}', 'Tại trung tâm tiệc cưới Hoa Viên'], ['18:30', 'Tiệc Cưới', '{thu}, ngày {ngay_so} tháng {thang} năm {nam}', 'Sảnh Sân Vườn, Hoa Viên'], ['09:00', 'Lễ Ăn Hỏi', 'Chủ nhật tuần trước ngày cưới', 'Tại tư gia nhà gái'], ['08:00', 'Lễ Vu Quy', 'Sáng ngày cưới', 'Tại tư gia nhà gái']].flatMap((it, i) => {
        const y = 176 + i * 190;
        return [
          S(34, y, 352, 170, 'rect', { fill: '#ffffff', stroke: p.line, sw: 1, radius: 4, anim: 'up' }),
          T(34, y + 18, 352, 36, it[0], { font: p.serif, size: 30, color: OL }),
          T(34, y + 58, 352, 30, it[1], K.serif(p, { font: p.serif, size: 22, bold: true, color: p.ink, upper: true, ls: 1 })),
          T(44, y + 94, 332, 22, it[2], K.sans(p, { size: 12.5 })),
          T(44, y + 118, 332, 22, it[3], K.sans(p, { size: 12.5, italic: true })),
        ];
      }),
    ]);
    const invite = sec(860, p.bg, [
      flw(-50, 600, 200, 30, 0.6),
      T(30, 40, 360, 26, 'TRÂN TRỌNG KÍNH MỜI', K.kick(p, { color: OL, ls: 4, size: 13 })),
      T(30, 72, 360, 50, '{ten_khach}', K.script(p, { size: 40, color: p.ink, anim: 'up' })),
      T(30, 124, 360, 22, 'Tới dự lễ cưới thân mật của chúng tôi', K.sans(p, { size: 13, italic: true })),
      T(30, 170, 360, 56, '{chu_re}', { font: p.serif, size: 40, color: OL, upper: true, ls: 2, anim: 'fade' }),
      T(30, 222, 360, 30, 'và', K.script(p, { size: 26, color: p.ink })),
      T(30, 250, 360, 56, '{co_dau}', { font: p.serif, size: 40, color: OL, upper: true, ls: 2, anim: 'fade' }),
      S(40, 330, 340, 1, 'line', { fill: p.line }),
      T(40, 344, 166, 64, 'Nhà trai\nÔng Lê Văn Bình\nBà Phạm Thị Mai', K.sans(p, { size: 12.5, color: p.ink, lh: 1.55 })),
      T(214, 344, 166, 64, 'Nhà gái\nÔng Nguyễn Văn An\nBà Trần Thị Hoa', K.sans(p, { size: 12.5, color: p.ink, lh: 1.55 })),
      S(40, 420, 340, 1, 'line', { fill: p.line }),
      T(40, 440, 340, 46, 'Vào lúc {gio} · {thu}\nngày {ngay_so} tháng {thang} năm {nam}', K.serif(p, { size: 16, color: p.ink, lh: 1.5 })),
      T(40, 490, 340, 22, '(Tức ngày {am_lich})', K.serif(p, { size: 13.5, italic: true })),
      T(40, 530, 340, 20, 'TẠI TƯ GIA', K.kick(p, { color: OL, ls: 4 })),
      T(40, 552, 340, 40, 'Nhà Trai', { font: p.serif, size: 30, color: p.ink }),
      T(60, 596, 300, 40, 'Số 12 đường Hoa Sữa, Phường Trung Tâm, Hà Nội', K.sans(p, { size: 13 })),
      G(130, 650, 160, 38, 'map', { ...wid(p), style: 'button', label: 'Chỉ đường', address: 'Số 12 Hoa Sữa, Hà Nội' }),
      T(30, 720, 360, 40, 'Rất hân hạnh được đón tiếp!', K.script(p, { size: 30, color: OL })),
    ]);
    const pw = { ...p, card: '#ffffff', tex: '' };
    return [
      hero,
      mono,
      B.calendar(pw, { kick: 'Save the date', title: 'Tháng Chung Đôi' }),
      B.countdown(po, { kick: 'Countdown time', title: 'Thời Gian Đếm Ngược', bg: OL }),
      profile(at(2), 'The groom', '{chu_re}', 'Chú rể là một chàng trai điềm đạm, chân thành và luôn hết lòng vì những người thân yêu – người bạn đồng hành vững chãi của cô dâu.'),
      profile(at(3), 'The bride', '{co_dau}', 'Cô dâu dịu dàng, tinh tế và luôn mang năng lượng tích cực tới mọi người – niềm tự hào của gia đình và người bạn đời của chú rể.'),
      events,
      invite,
      B.strip(pw, [at(4), at(5), at(6)]),
      B.timeline(po, { kick: 'Timeline', title: 'Lịch Trình Ngày Cưới', bg: OL, items: [['16:00', '♡', 'Đón khách & photobooth'], ['16:30', '⚭', 'Nghi lễ'], ['18:30', '✦', 'Nhập tiệc'], ['19:00', '❀', 'Cắt bánh · Rót rượu'], ['21:00', '☾', 'Tiễn khách']] }),
      B.story(pw, [at(7), at(8), at(9)], { kick: 'Chuyện tình', title: 'Love Story', chapters: [['2019', 'Lần đầu gặp gỡ', 'Một buổi chiều mưa, chiếc ô chung đã đưa hai đứa lại gần nhau hơn.'], ['2023', 'Lời cầu hôn', 'Bên bờ biển lúc hoàng hôn, anh ngỏ lời và em gật đầu.'], ['Hôm nay', 'Về chung một nhà', 'Chúng mình bắt đầu một chương mới, mong có bạn cùng chung vui.']] }),
      B.sign(pw, at(10), { kick: 'Signature', title: 'Lưu Bút' }),
      B.album(pw, [at(11), at(12), at(13), at(14), at(15), at(16), at(17), at(0), at(1)], { kick: 'Our memories', title: 'Wedding Album' }),
      B.rsvp(pw, { kick: 'Confirm', title: 'Xác Nhận Tham Dự' }),
      B.wishes(pw, { kick: 'Send wishes', title: 'Gửi Lời Chúc' }),
      B.gift(pw, { kick: 'Gift', title: 'Hộp Mừng Cưới' }),
      B.dress(pw, { colors: p.t.dress, title: 'Dresscode' }),
      B.thanks(p, at(18)),
    ];
  }

  // ===================== 6. VÒM TRẮNG SONG HỶ (a45) =====================
  // Nền chần bông trắng, khung vòm trắng dày, chữ xanh ngọc xám, phong thư mở thiệp
  function vomTrang(p, ph) {
    const at = (i) => ph[i % ph.length];
    const arch = (x, y, w, h, src, o = {}) => [S(x - 12, y - 12, w + 24, h + 24, 'rect', { fill: '#ffffff', radius: (w + 24) / 2, shadow: true, anim: o.anim || 'up' }), I(x, y, w, h, src, { mask: 'arch', radius: 4, anim: o.anim || 'up', ...o })];
    const cover = sec(980, p.bg, [
      T(30, 40, 360, 56, 'Save The Date', K.script(p, { size: 44, color: p.accent, anim: 'fade' })),
      ...arch(70, 120, 280, 420, at(0), { anim: 'zoom' }),
      T(30, 590, 360, 20, 'KÍNH MỜI', K.kick(p, { color: p.soft, ls: 5 })),
      T(30, 614, 360, 44, '{ten_khach}', K.script(p, { size: 34, color: p.ink })),
      T(30, 690, 360, 64, '{chu_re}', K.script(p, { size: 52, color: p.accent, anim: 'up' })),
      T(30, 748, 360, 34, '&', K.script(p, { size: 30, color: p.ink })),
      T(30, 780, 360, 64, '{co_dau}', K.script(p, { size: 52, color: p.accent, anim: 'up', delay: 0.1 })),
      S(140, 868, 140, 140, 'circle', { fill: '#ffffff', stroke: p.line, sw: 6, shadow: true, anim: 'zoom' }),
      T(140, 900, 140, 70, '囍', { font: 'Noto Serif', size: 56, color: p.accent }),
    ], QUILT);
    const couple = sec(720, p.bg, [
      ...arch(36, 60, 156, 250, at(1), { zoom: 1.6, ox: 22, anim: 'left' }),
      ...arch(228, 60, 156, 250, at(1), { zoom: 1.6, ox: 78, anim: 'right' }),
      T(24, 340, 180, 18, 'CHÚ RỂ', K.kick(p, { color: p.soft, ls: 4 })),
      T(24, 360, 180, 46, '{chu_re}', K.script(p, { size: 34, color: p.accent })),
      T(216, 340, 180, 18, 'CÔ DÂU', K.kick(p, { color: p.soft, ls: 4 })),
      T(216, 360, 180, 46, '{co_dau}', K.script(p, { size: 34, color: p.accent })),
      S(40, 440, 340, 220, 'rect', { fill: '#ffffffd0', stroke: p.line, sw: 1, radius: 18 }),
      T(52, 462, 156, 20, 'NHÀ TRAI', K.kick(p, { ls: 3 })),
      T(52, 488, 156, 60, 'Ông Lê Quang Minh\nBà Trần Thị Thu Trang', K.serif(p, { size: 14, lh: 1.6 })),
      T(212, 462, 156, 20, 'NHÀ GÁI', K.kick(p, { ls: 3 })),
      T(212, 488, 156, 60, 'Ông Phạm Văn Hùng\nBà Nguyễn Thị Lan', K.serif(p, { size: 14, lh: 1.6 })),
      S(209.5, 462, 1, 96, 'line', { fill: p.line }),
      T(52, 584, 316, 50, 'Trân trọng báo tin lễ thành hôn của con chúng tôi', K.serif(p, { size: 15, italic: true, lh: 1.5 })),
    ], QUILT);
    const invite = sec(1000, p.bg, [
      S(24, 30, 372, 940, 'rect', { fill: '#ffffffe0', radius: 186, shadow: true }),
      T(40, 120, 340, 24, 'TRÂN TRỌNG KÍNH MỜI', K.kick(p, { color: p.accent, ls: 4, size: 13 })),
      T(40, 150, 340, 46, '{ten_khach}', K.script(p, { size: 36, color: p.ink })),
      T(50, 200, 320, 40, 'TỚI DỰ BỮA TIỆC MỪNG CƯỚI\nCÙNG GIA ĐÌNH CHÚNG MÌNH', K.sans(p, { size: 11.5, ls: 1, lh: 1.6 })),
      ...arch(110, 268, 200, 280, at(2), { anim: 'zoom' }),
      T(40, 590, 340, 50, '{chu_re}  &  {co_dau}', K.script(p, { size: 38, color: p.accent })),
      T(40, 650, 340, 22, 'VÀO LÚC', K.kick(p, { ls: 4 })),
      T(40, 672, 340, 30, '{gio}', K.serif(p, { size: 24, bold: true })),
      S(80, 716, 70, 1, 'line', { fill: p.ink }), S(270, 716, 70, 1, 'line', { fill: p.ink }),
      T(70, 722, 90, 22, '{thu}', K.sans(p, { size: 12.5, color: p.ink })),
      T(160, 700, 100, 60, '{ngay_so}', K.serif(p, { font: 'Playfair Display', size: 48, color: p.accent, lh: 1.15 })),
      T(260, 722, 90, 22, '{thang} · {nam}', K.sans(p, { size: 12.5, color: p.ink })),
      S(80, 750, 70, 1, 'line', { fill: p.ink }), S(270, 750, 70, 1, 'line', { fill: p.ink }),
      T(40, 768, 340, 20, '(Tức ngày {am_lich})', K.serif(p, { size: 13.5, italic: true })),
      T(40, 800, 340, 20, 'TẠI TƯ GIA', K.kick(p, { ls: 4 })),
      T(40, 822, 340, 40, 'Nhà Trai', K.script(p, { size: 34, color: p.ink })),
      T(70, 866, 280, 40, '423 An Dương Vương, Phú Thượng, Tây Hồ, Hà Nội', K.sans(p, { size: 12.5 })),
      G(140, 912, 140, 36, 'map', { ...wid(p), style: 'button', label: 'Xem vị trí', address: '423 An Dương Vương, Tây Hồ, Hà Nội' }),
    ], QUILT);
    const pq = { ...p, tex: QUILT, card: '#ffffffd8', cardLine: p.line };
    return [
      cover,
      B.calendar(pq, { kick: 'Save the date', title: 'Ngày Chung Đôi' }),
      B.countdown(pq, { kick: 'Countdown', title: 'Cùng Đếm Ngược' }),
      couple,
      invite,
      B.rites(pq, { kick: 'Timeline', title: 'Tổ Chức Lễ Cưới', list: [['◇', 'Ăn Hỏi', '09:00 · tuần trước ngày cưới', 'Tại tư gia nhà gái\nSố 4 Tôn Thất Thuyết, Cầu Giấy, Hà Nội'], ['⚭', 'Rước Dâu', '08:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà gái\nSố 4 Tôn Thất Thuyết, Cầu Giấy, Hà Nội'], ['⌂', 'Lễ Thành Hôn', '10:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà trai\n423 An Dương Vương, Tây Hồ, Hà Nội']] }),
      B.strip(pq, [at(3), at(4), at(5)]),
      B.timeline(pq, { kick: 'Timeline', title: 'Lịch Trình Ngày Chung Đôi', items: [['08:00', '⚭', 'Đón dâu'], ['10:00', '⌂', 'Lễ thành hôn'], ['11:00', '♡', 'Đón khách'], ['11:30', '✦', 'Khai tiệc'], ['12:30', '❀', 'Cắt bánh · Rót rượu']] }),
      B.story(pq, [at(6), at(7), at(8)], { kick: 'Câu chuyện tình yêu', title: 'Điều Đáng Nhớ', chapters: [['Chương 1', 'Lần đầu gặp gỡ', 'Một buổi đi chơi Noel cùng đám bạn, anh để ý cô bé có nụ cười rất xinh – và những tin nhắn bắt đầu từ hôm ấy.'], ['Chương 2', 'Nhận lời yêu', 'Không cần đắn đo thêm, anh ngỏ lời và may mắn thay, em đã gật đầu.'], ['Chương 3', 'Mãi bên nhau nhé!', 'Như trái chín đủ ngày, tình yêu của chúng mình cũng đến lúc về chung một nhà.']] }),
      B.sign(pq, at(9), { kick: 'Signature', title: 'Lưu Bút' }),
      B.album(pq, [at(10), at(11), at(12), at(13), at(14), at(15), at(16), at(17), at(3)], { kick: 'Album', title: 'Khoảnh Khắc Hạnh Phúc' }),
      B.rsvp(pq),
      B.wishes(pq),
      B.gift(pq),
      B.dress(pq, { colors: p.t.dress }),
      B.thanks(p, at(18)),
    ];
  }

  // ===================== 7. SAO BĂNG ĐÊM XANH (a42) =====================
  // Xanh đêm thẳm, chữ vàng nhũ, thẻ kính mờ viền vàng, sao lấp lánh – mở thiệp bầu trời sao
  function saoBang(p, ph) {
    const at = (i) => ph[i % ph.length];
    const stars = (y, h) => T(10, y, 400, h, '✦          ·        ✧              ·\n     ·            ✦          ·          ✧\n  ✧        ·              ✦       ·', { font: 'Be Vietnam Pro', size: 12, color: '#f3dca4a0', lh: 2.8, align: 'left', anim: 'fade' });
    const cover = sec(900, p.bg, [
      stars(40, 160),
      T(30, 70, 360, 20, 'THIỆP MỜI CƯỚI', K.kick(p, { color: p.gold, ls: 7 })),
      T(30, 110, 360, 30, 'LỄ THÀNH HÔN', { font: p.display, size: 22, ls: 4, color: '#f6efe0', anim: 'fade' }),
      I(80, 170, 260, 360, at(0), { mask: 'arch', radius: 6, border: 3, borderColor: p.gold, shadow: true, anim: 'zoom' }),
      S(68, 158, 284, 384, 'rect', { stroke: p.gold, sw: 1, radius: 142, o: 0.6 }),
      T(10, 570, 400, 76, '{chu_re}', K.script(p, { size: 56, color: '#f6efe0', anim: 'up' })),
      T(10, 638, 400, 44, '&', K.script(p, { size: 36, color: p.gold })),
      T(10, 676, 400, 76, '{co_dau}', K.script(p, { size: 56, color: '#f6efe0', anim: 'up', delay: 0.1 })),
      T(30, 770, 360, 30, '{ngay_so} . {thang} . {nam}', { font: p.display, size: 20, ls: 4, color: p.gold }),
      T(30, 806, 360, 22, 'Nhằm ngày {am_lich}', K.serif(p, { size: 14, italic: true, color: '#d9d4e8' })),
      T(30, 840, 360, 40, 'Giữa muôn vàn vì sao, chúng ta đã tìm thấy nhau', K.serif(p, { size: 14.5, italic: true, color: '#d9d4e8' })),
    ]);
    const portraits = sec(560, p.bg, [
      stars(10, 120),
      I(40, 60, 160, 160, at(1), { mask: 'circle', border: 3, borderColor: p.gold, zoom: 1.5, ox: 30, anim: 'left' }),
      I(220, 60, 160, 160, at(1), { mask: 'circle', border: 3, borderColor: p.gold, zoom: 1.5, ox: 70, anim: 'right' }),
      T(30, 240, 180, 18, 'CHÚ RỂ', K.kick(p, { color: p.gold, ls: 3 })),
      T(30, 262, 180, 30, 'Nguyễn {chu_re}', K.serif(p, { size: 17, color: '#f6efe0' })),
      T(210, 240, 180, 18, 'CÔ DÂU', K.kick(p, { color: p.gold, ls: 3 })),
      T(210, 262, 180, 30, 'Trần {co_dau}', K.serif(p, { size: 17, color: '#f6efe0' })),
      I(20, 320, 380, 210, at(2), { radius: 10, border: 2, borderColor: p.gold, anim: 'up' }),
    ]);
    return [
      cover,
      B.parents(p, { addrG: 'Đống Đa, Hà Nội', addrB: 'Ba Đình, Hà Nội' }),
      portraits,
      B.invite(p, at(3), { venue: 'Trung tâm tiệc cưới Ngân Hà', addr: 'Số 88 Trần Duy Hưng, Cầu Giấy, Hà Nội', what: 'Đón khách' }),
      B.rites(p, { list: [['⚭', 'Lễ Vu Quy', '08:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà gái\nBa Đình, Hà Nội'], ['⌂', 'Lễ Thành Hôn', '10:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà trai\nĐống Đa, Hà Nội']] }),
      B.calendar(p),
      B.countdown(p, { line: 'Mỗi ngôi sao rơi là một ngày gần nhau hơn' }),
      B.timeline(p, { kick: 'Timeline', title: 'Lịch Trình Buổi Tiệc', items: [['17:30', '♡', 'Đón khách'], ['18:00', '⚭', 'Cử hành hôn lễ'], ['18:30', '✦', 'Khai tiệc'], ['20:00', '☾', 'Giao lưu & chụp ảnh']] }),
      B.strip(p, [at(4), at(5), at(6)]),
      B.map(p, { addr: 'Số 88 Trần Duy Hưng, Cầu Giấy, Hà Nội', venue: 'Trung tâm tiệc cưới Ngân Hà' }),
      B.dress(p, { kick: 'Dress code', colors: p.t.dress, line: 'Mời Quý khách khoác lên mình sắc màu của những vì sao dưới đây.' }),
      B.album(p, [at(7), at(8), at(9), at(10), at(11), at(12), at(13), at(14), at(15)], { kick: 'Album', title: 'Khoảnh Khắc', line: 'Mỗi khoảnh khắc bên nhau đều lấp lánh như sao trời' }),
      B.sign(p, at(16), { kick: 'Signature' }),
      B.rsvp(p, { kick: 'RSVP' }),
      B.wishes(p, { kick: 'Guest book' }),
      B.gift(p),
      B.thanks(p, at(17)),
    ];
  }

  // ===================== 8. HỒNG TRÂN CHÂU (a40) =====================
  // Hồng phấn ngọc trai: bìa vòm chữ dọc, ngày nổi lớn, Save the Date 3 ảnh + lịch, thẻ kính mờ
  function hongTranChau(p, ph) {
    const at = (i) => ph[i % ph.length];
    const glass = { fill: '#ffffffb0', stroke: '#ffffff', sw: 1.5, radius: 30, shadow: true };
    const cover = sec(940, p.bg, [
      S(30, 30, 360, 560, 'rect', { ...glass, anim: 'fade' }),
      T(30, 46, 360, 30, 'Together for life', K.script(p, { font: 'Alex Brush', size: 24, color: p.soft })),
      I(70, 84, 280, 450, at(0), { mask: 'arch', radius: 14, anim: 'zoom' }),
      S(70, 380, 280, 154, 'rect', { fill: p.bg, grad: 'up', radius: 14 }),
      T(-104, 290, 300, 18, 'H A P P Y   W E D D I N G', K.sans(p, { size: 11, ls: 4, color: p.soft, r: -90 })),
      T(40, 440, 340, 110, '{ngay_so}.{thang}', { font: 'Playfair Display', size: 88, bold: true, color: '#ffffff', ls: 2, shadow: true, anim: 'up' }),
      I(10, 640, 160, 160, FLW_D, { r: 0, o: 0.5 }),
      T(30, 620, 360, 70, '{chu_re}', K.script(p, { font: 'Alex Brush', size: 58, color: p.ink, anim: 'up' })),
      T(30, 684, 360, 34, '&', K.script(p, { size: 28, color: p.accent })),
      T(30, 716, 360, 70, '{co_dau}', K.script(p, { font: 'Alex Brush', size: 58, color: p.ink, anim: 'up', delay: 0.1 })),
      T(30, 810, 360, 22, '{thu}  ·  {ngay}', K.sans(p, { size: 12, ls: 4, color: p.soft })),
      T(30, 850, 360, 40, 'Trân trọng kính mời {ten_khach} tới chung vui', K.serif(p, { size: 15, italic: true, color: p.soft })),
    ]);
    const std = sec(860, p.bg2, [
      S(20, 24, 380, 800, 'rect', { ...glass }),
      T(30, 50, 360, 64, 'Save The Date', { font: 'Playfair Display', size: 40, bold: true, italic: true, color: '#b5a7a2', anim: 'fade' }),
      I(34, 150, 112, 190, at(1), { radius: 10, shadow: true, anim: 'left' }),
      I(154, 126, 112, 190, at(2), { radius: 10, shadow: true, anim: 'up' }),
      I(274, 150, 112, 190, at(3), { radius: 10, shadow: true, anim: 'right' }),
      T(34, 284, 112, 70, '{ngay_so}', { font: 'Playfair Display', size: 50, bold: true, color: '#ffffff', shadow: true }),
      T(154, 260, 112, 70, '{thang}', { font: 'Playfair Display', size: 50, bold: true, color: '#ffffff', shadow: true }),
      T(274, 284, 112, 70, '{nam}', { font: 'Playfair Display', size: 40, bold: true, color: '#ffffff', shadow: true }),
      G(40, 380, 340, 320, 'calendar', { color: p.accent, textColor: p.ink, font: p.sans, bg: '#f6ebe7', anim: 'up' }),
      G(120, 730, 180, 40, 'addcal', { color: p.accent, textColor: p.ink, font: p.sans, time: '{gio}', title: 'Đám cưới {chu_re} & {co_dau}' }),
    ]);
    // Phần còn lại dùng bộ trang kính mờ có sẵn (GL) với nhiều ảnh hơn
    const rest = kit.glassBuild(p, ph.slice(4).concat(ph.slice(0, 4)), { full: true, groom: 13, bride: 14, venue: 'Hoa Viên Palace' }).slice(1);
    return [cover, std, ...rest, B.album(p, [at(15), at(16), at(17), at(18), at(5), at(6), at(7), at(8), at(9)], { kick: 'Happy wedding', title: 'Album Lưu Giữ Khoảnh Khắc' })].slice(0, 20);
  }

  // ===================== LÀM LẠI 18/11/2026: 3 MẪU ĐỎ / BÁO CƯỚI =====================
  const LATTICE = '/img/nen/luoi-vang.svg';
  const CLOUD = '/img/deco/may-vang.svg';
  /** Khung viền đôi (vàng) bao quanh một trang */
  const frame2 = (p, x, y, w, h, o = {}) => [S(x, y, w, h, 'rect', { fill: o.fill || '', stroke: p.gold, sw: 1, anim: 'fade' }), S(x + 7, y + 7, w - 14, h - 14, 'rect', { stroke: p.gold, sw: 0.6, o: 0.8 })];
  /** Ngày 3 cột: thứ | tháng + ngày lớn | năm */
  const date3 = (p, y, o = {}) => [
    S(30, y + 20, 110, 1, 'line', { fill: p.gold }), S(30, y + 62, 110, 1, 'line', { fill: p.gold }),
    T(30, y + 28, 110, 28, '{thu}', K.serif(p, { size: 18, color: p.ink })),
    S(150, y, 1, 84, 'line', { fill: p.gold }),
    T(150, y - 4, 120, 26, 'Tháng {thang}', K.serif(p, { size: 17, color: p.ink })),
    T(150, y + 18, 120, 66, '{ngay_so}', { font: 'Playfair Display', size: o.size || 52, color: p.gold, lh: 1.15, anim: 'zoom' }),
    S(270, y, 1, 84, 'line', { fill: p.gold }),
    S(280, y + 20, 110, 1, 'line', { fill: p.gold }), S(280, y + 62, 110, 1, 'line', { fill: p.gold }),
    T(280, y + 28, 110, 28, '{nam}', K.serif(p, { size: 18, color: p.ink })),
  ];

  /** Đỏ Son Song Hỷ – nền đỏ son lưới vàng, khung viền đôi, “Wedding” viết tay trên ảnh */
  function doSon(p, ph) {
    const at = (i) => ph[i % ph.length];
    const cover = S2(p, 1000, [
      ...date3(p, 40),
      T(30, 136, 360, 22, 'GREATEST DAY', K.sans(p, { size: 13, ls: 5, color: p.ink })),
      I(24, 176, 372, 540, at(0), { border: 6, borderColor: '#fff3e0', shadow: true, anim: 'zoom' }),
      S(24, 560, 372, 156, 'rect', { fill: '#00000066', grad: 'up' }),
      T(120, 620, 280, 100, 'Wedding', { font: 'Great Vibes', size: 76, color: '#ffffff', shadow: true, r: -6, anim: 'left', delay: 0.3 }),
      T(30, 754, 360, 22, 'TRÂN TRỌNG KÍNH MỜI', K.kick(p, { ls: 4, size: 13 })),
      T(20, 780, 380, 50, '{ten_khach}', K.script(p, { size: 38, color: '#fff3e0', anim: 'up' })),
      T(40, 836, 340, 22, 'Tới dự lễ thành hôn của chúng tôi', K.sans(p, { size: 13, italic: true })),
      T(30, 880, 360, 50, '囍', { font: 'Noto Serif', size: 36, color: p.gold, anim: 'zoom' }),
    ]);
    const invite = S2(p, 1080, [
      ...frame2(p, 22, 26, 376, 1024, { fill: '#00000022' }),
      T(30, 60, 360, 30, '囍', { font: 'Noto Serif', size: 26, color: p.gold }),
      T(30, 96, 360, 22, 'TRÂN TRỌNG KÍNH MỜI', K.kick(p, { ls: 4 })),
      T(30, 122, 360, 26, '{ten_khach}', K.serif(p, { size: 19, color: p.ink })),
      T(30, 168, 360, 26, 'Lễ thành hôn', K.serif(p, { font: 'Playfair Display', size: 22, italic: true, color: p.gold })),
      T(20, 202, 380, 76, '{chu_re}', K.script(p, { size: 58, color: '#fff3e0', anim: 'left' })),
      T(20, 270, 380, 36, 'and', K.script(p, { size: 30, color: p.gold })),
      T(20, 302, 380, 76, '{co_dau}', K.script(p, { size: 58, color: '#fff3e0', anim: 'right' })),
      ...date3(p, 410),
      T(40, 506, 340, 22, '(Tức ngày {am_lich})', K.serif(p, { size: 13.5, italic: true })),
      S(140, 542, 140, 34, 'rect', { fill: '#fff3e0', radius: 17 }),
      T(140, 549, 140, 22, 'VÀO LÚC 10:00', K.sans(p, { size: 12.5, bold: true, ls: 2, color: p.bg })),
      T(30, 600, 360, 22, 'TẠI TƯ GIA', K.kick(p, { ls: 4 })),
      T(30, 624, 360, 40, 'Nhà Trai', K.script(p, { size: 36, color: '#fff3e0' })),
      T(50, 672, 320, 44, 'Số 12 đường Hoa Sữa, phường Trung Tâm, Hà Nội', K.sans(p, { size: 13 })),
      G(130, 726, 160, 38, 'map', { ...wid(p), style: 'button', label: 'Xem chỉ đường', address: 'Số 12 Hoa Sữa, Hà Nội' }),
      S(60, 800, 300, 1, 'line', { fill: p.gold, o: 0.7 }),
      T(40, 822, 166, 22, 'NHÀ TRAI', K.kick(p, { ls: 2 })),
      T(40, 848, 166, 50, 'Ông: Lê Văn Bình\nBà: Phạm Thị Mai', K.serif(p, { size: 14, italic: true, color: p.ink, lh: 1.6 })),
      S(209.5, 822, 1, 80, 'line', { fill: p.gold, o: 0.7 }),
      T(214, 822, 166, 22, 'NHÀ GÁI', K.kick(p, { ls: 2 })),
      T(214, 848, 166, 50, 'Ông: Nguyễn Văn An\nBà: Trần Thị Hoa', K.serif(p, { size: 14, italic: true, color: p.ink, lh: 1.6 })),
      T(40, 940, 340, 40, 'Rất hân hạnh được đón tiếp!', K.script(p, { size: 30, color: p.gold })),
    ]);
    const party = S2(p, 640, [
      ...frame2(p, 30, 30, 360, 580, { fill: '#00000022' }),
      T(30, 64, 360, 34, '囍', { font: 'Noto Serif', size: 28, color: p.gold }),
      T(30, 104, 360, 40, 'TIỆC CƯỚI', { font: 'Playfair Display', size: 30, bold: true, color: '#fff3e0', ls: 2 }),
      S(130, 158, 160, 34, 'rect', { fill: '#fff3e0', radius: 17 }),
      T(130, 165, 160, 22, 'VÀO LÚC {gio}', K.sans(p, { size: 12.5, bold: true, ls: 2, color: p.bg })),
      T(40, 210, 340, 24, '{thu}, {ngay_so} tháng {thang} năm {nam}', K.serif(p, { size: 17, color: p.ink })),
      T(40, 238, 340, 20, '(Tức ngày {am_lich})', K.serif(p, { size: 13.5, italic: true })),
      T(40, 286, 340, 44, 'Hoa Viên Palace', K.script(p, { size: 40, color: p.gold })),
      T(40, 336, 340, 22, 'Sảnh Sân Vườn', K.serif(p, { size: 16, italic: true, color: p.ink })),
      T(60, 364, 300, 44, 'Số 88 đường Hồ Tây, phường Tây Hồ, Hà Nội', K.sans(p, { size: 13 })),
      G(130, 424, 160, 38, 'map', { ...wid(p), style: 'button', label: 'Chỉ đường', address: 'Số 88 Hồ Tây, Hà Nội' }),
      G(130, 474, 160, 38, 'addcal', { ...wid(p), title: 'Tiệc cưới {chu_re} & {co_dau}' }),
      T(40, 540, 340, 40, 'Rất hân hạnh được đón tiếp Quý Khách', K.serif(p, { size: 15, italic: true })),
    ]);
    const tl = [['09:00', '◇', 'Lễ ăn hỏi'], ['10:00', '⚭', 'Lễ thành hôn'], ['11:30', '❀', 'Chụp ảnh lưu niệm'], ['17:00', '♡', 'Đón khách dự tiệc'], ['17:30', '✦', 'Khai tiệc']];
    const timeline = S2(p, 1000, [
      ...frame2(p, 24, 30, 372, 940),
      T(30, 54, 360, 54, 'Timeline of', K.script(p, { size: 44, color: '#fff3e0' })),
      T(30, 104, 360, 34, 'THE WEDDING', K.serif(p, { font: 'Playfair Display', size: 24, ls: 4, color: p.gold })),
      I(44, 160, 200, 260, at(1), { border: 5, borderColor: '#fff3e0', r: -4, shadow: true, anim: 'left' }),
      I(176, 300, 200, 250, at(2), { border: 5, borderColor: '#fff3e0', r: 4, shadow: true, anim: 'right' }),
      T(40, 478, 80, 50, '{ngay_so}', { font: 'Playfair Display', size: 40, color: '#fff3e0', align: 'left' }),
      S(80, 470, 1, 100, 'line', { fill: p.gold, r: 30 }),
      T(96, 522, 80, 50, '{thang}', { font: 'Playfair Display', size: 40, color: '#fff3e0', align: 'left' }),
      ...tl.flatMap((it, i) => {
        const y = 600 + i * 70;
        return [
          T(50, y + 8, 80, 24, it[0], K.serif(p, { size: 17, bold: true, color: p.ink, align: 'right' })),
          S(144, y, 40, 40, 'circle', { fill: '#fff3e0', anim: 'zoom' }),
          T(144, y + 7, 40, 26, it[1], { font: 'Noto Serif', size: 16, color: p.bg }),
          T(198, y + 8, 180, 24, it[2], K.serif(p, { size: 16, color: p.ink, align: 'left', anim: 'right' })),
        ];
      }),
    ]);
    const couple = S2(p, 1200, [
      T(30, 34, 360, 44, 'Cô dâu - Chú rể', K.serif(p, { font: 'Playfair Display', size: 30, color: '#fff3e0' })),
      S(185, 86, 50, 1, 'line', { fill: p.gold }),
      I(30, 110, 360, 440, at(7), { border: 4, borderColor: '#fff3e0', shadow: true, anim: 'up' }),
      T(30, 560, 360, 22, 'B  r  i  d  e', K.serif(p, { size: 15, ls: 4, color: p.gold, align: 'left' })),
      T(30, 580, 360, 60, '{co_dau}', K.script(p, { size: 44, color: '#fff3e0', align: 'left' })),
      I(30, 660, 360, 440, at(5), { border: 4, borderColor: '#fff3e0', shadow: true, zoom: 1.7, ox: 82, oy: 35, anim: 'up' }),
      T(30, 1110, 360, 22, 'G  r  o  o  m', K.serif(p, { size: 15, ls: 4, color: p.gold, align: 'left' })),
      T(30, 1130, 360, 60, '{chu_re}', K.script(p, { size: 44, color: '#fff3e0', align: 'left' })),
    ]);
    return [
      cover, invite, party, timeline, couple,
      B.story(p, [at(3), at(4), at(6)], { kick: 'Chuyện tình', title: 'Love Story', chapters: [['2019', 'Lần đầu gặp gỡ', 'Một chiều tình cờ, hai đứa ngồi chung bàn ở quán cà phê nhỏ. Câu chào ngượng ngùng, nụ cười thì nhớ mãi.'], ['2023', 'Lời cầu hôn', 'Dưới ánh đèn lấp lánh, anh khẽ hỏi một câu. Em gật đầu – và hành trình mới bắt đầu từ đó.'], ['Hôm nay', 'Về chung một nhà', 'Sau bao mùa thương, chúng mình nắm tay nhau bước vào ngày trọng đại nhất đời.']] }),
      B.countdown(p, { kick: 'We will become a family in', title: 'Đếm Ngược' }),
      B.calendar(p, { kick: 'Save the date', title: 'Ngày Chung Đôi' }),
      B.album(p, [at(8), at(9), at(10), at(11), at(12), at(13), at(14), at(15), at(1)], { kick: 'Anniversary', title: 'Album' }),
      B.sign(p, at(2), { kick: 'Lưu bút', title: 'Signature' }),
      B.rsvp(p, { kick: 'Xác nhận', title: 'Bạn Sẽ Đến Chứ?' }),
      B.wishes(p, { kick: 'Guest book', title: 'Lời Chúc Từ Khách Mời' }),
      B.gift(p, { kick: 'Mừng cưới', title: 'Share The Love', line: 'Gửi trao yêu thương đến hai chúng mình' }),
      B.thanks(p, at(0)),
    ];
  }

  /** Đỏ Đô Chữ Vàng – đỏ đô, mây vàng, nhẫn cưới, ruy băng ngày cưới, khung ảnh chồng lớp */
  function doDo(p, ph) {
    const at = (i) => ph[i % ph.length];
    const rings = (y) => [S(180, y, 34, 34, 'ring', { stroke: p.gold, sw: 3, anim: 'zoom' }), S(206, y, 34, 34, 'ring', { stroke: p.gold, sw: 3, anim: 'zoom', delay: 0.1 })];
    const pill = (y, text) => [S(110, y, 200, 38, 'rect', { fill: '#00000030', stroke: p.gold, sw: 1, radius: 19 }), T(110, y + 9, 200, 22, text, K.serif(p, { size: 16, color: '#fff3e0' }))];
    const ribbon = (y) => [
      S(26, y + 14, 140, 36, 'rect', { fill: p.gold, radius: 2 }), T(26, y + 22, 140, 22, '{thu}', K.sans(p, { size: 13, bold: true, color: p.bg })),
      S(254, y + 14, 140, 36, 'rect', { fill: p.gold, radius: 2 }), T(254, y + 22, 140, 22, '{nam}', K.sans(p, { size: 13, bold: true, color: p.bg })),
      S(166, y, 88, 64, 'rect', { fill: p.bg, stroke: p.gold, sw: 1.5 }),
      T(166, y + 2, 88, 60, '{ngay_so}', { font: 'Playfair Display', size: 44, color: p.gold, lh: 1.3 }),
    ];
    const cover = S2(p, 1020, [
      I(-30, 0, 220, 88, CLOUD, { o: 0.8 }), I(250, 40, 200, 80, CLOUD, { o: 0.6 }),
      T(30, 40, 360, 20, 'THIỆP MỜI CƯỚI', K.kick(p, { ls: 6 })),
      T(10, 70, 400, 76, '{chu_re}', K.script(p, { size: 58, anim: 'left' })),
      ...rings(150),
      T(10, 182, 400, 76, '{co_dau}', K.script(p, { size: 58, anim: 'right' })),
      I(96, 300, 280, 400, at(1), { border: 5, borderColor: '#f7e7c4', r: 4, o: 0.85, anim: 'right' }),
      I(50, 280, 290, 420, at(0), { border: 6, borderColor: '#fff3e0', shadow: true, anim: 'zoom' }),
      I(-20, 680, 240, 96, CLOUD), I(220, 700, 220, 88, CLOUD, { o: 0.85 }),
      T(30, 800, 360, 20, 'SAVE THE DATE', K.kick(p, { ls: 6, color: '#f7e7c4' })),
      T(30, 826, 360, 44, '{ngay_so} · {thang} · {nam}', { font: 'Playfair Display', size: 32, color: p.gold, ls: 3 }),
      T(30, 884, 360, 20, 'TRÂN TRỌNG KÍNH MỜI', K.kick(p, { ls: 4, color: '#f7e7c4' })),
      ...pill(912, '{ten_khach}'),
    ]);
    const invite = S2(p, 1040, [
      I(260, 10, 200, 80, CLOUD, { o: 0.7 }),
      T(30, 50, 360, 24, 'TRÂN TRỌNG KÍNH MỜI', K.kick(p, { ls: 4, size: 13 })),
      ...pill(84, '{ten_khach}'),
      T(40, 138, 340, 44, 'ĐẾN DỰ BUỔI TIỆC CHUNG VUI\nCÙNG GIA ĐÌNH CHÚNG TÔI', K.sans(p, { size: 12.5, bold: true, ls: 1, color: '#f7e7c4', lh: 1.6 })),
      T(10, 196, 400, 70, '{chu_re}', K.script(p, { size: 52 })),
      ...rings(266),
      T(10, 300, 400, 70, '{co_dau}', K.script(p, { size: 52 })),
      T(30, 404, 360, 26, 'Tháng {thang}', K.serif(p, { size: 20, color: p.gold })),
      ...ribbon(438),
      T(30, 520, 360, 22, '(Tức ngày {am_lich})', K.serif(p, { size: 13.5, italic: true })),
      T(30, 552, 360, 26, 'Vào lúc {gio}', K.serif(p, { size: 18, color: '#fff3e0' })),
      T(30, 600, 360, 22, 'TẠI NHÀ HÀNG', K.kick(p, { ls: 4 })),
      T(10, 626, 400, 62, 'Hoàng Kim', K.script(p, { size: 52 })),
      T(30, 690, 360, 22, '(Sảnh Ngọc Trai)', K.serif(p, { size: 15, italic: true, color: '#f7e7c4' })),
      T(50, 720, 320, 44, 'Số 1 đường 2 Tháng 9, quận Hải Châu, Đà Nẵng', K.sans(p, { size: 13 })),
      G(130, 776, 160, 38, 'map', { ...wid(p), style: 'button', label: 'Xem vị trí', address: 'Đường 2 Tháng 9, Hải Châu, Đà Nẵng' }),
      I(60, 850, 300, 120, CLOUD, { o: 0.9 }),
    ]);
    const family = S2(p, 820, [
      ...hd(p, 36, 'Hai họ', 'Cô dâu & Chú rể', { size: 38 }),
      I(32, 176, 170, 250, at(6), { mask: 'arch', border: 4, borderColor: p.gold, anim: 'left' }),
      I(218, 176, 170, 250, at(7), { mask: 'arch', border: 4, borderColor: p.gold, anim: 'right' }),
      T(26, 446, 182, 20, 'NHÀ TRAI', K.kick(p, { ls: 3 })),
      T(26, 472, 182, 26, 'Chú rể: {chu_re}', K.serif(p, { size: 16, color: '#fff3e0' })),
      T(26, 504, 182, 48, 'Bố: Nguyễn Phước Tấn\nMẹ: Bùi Thị Phương', K.sans(p, { size: 12.5, lh: 1.6 })),
      T(212, 446, 182, 20, 'NHÀ GÁI', K.kick(p, { ls: 3 })),
      T(212, 472, 182, 26, 'Cô dâu: {co_dau}', K.serif(p, { size: 16, color: '#fff3e0' })),
      T(212, 504, 182, 48, 'Bố: Nguyễn Ngọc Toàn\nMẹ: Huỳnh Thị Vân', K.sans(p, { size: 12.5, lh: 1.6 })),
      S(209.5, 446, 1, 110, 'line', { fill: p.gold, o: 0.6 }),
      T(40, 590, 340, 46, 'Trân trọng báo tin lễ thành hôn của con chúng tôi', K.serif(p, { size: 15, italic: true })),
      I(60, 660, 300, 120, CLOUD, { o: 0.8 }),
    ]);
    return [
      cover, invite,
      B.calendar(p, { kick: 'Save the date', title: 'Tháng {thang} · {nam}', line: 'Như giọt nắng rơi xuống mặt hồ, một ngày vui lan toả – hẹn gặp bạn trong ngày hai đứa về chung một nhà.' }),
      B.countdown(p, { kick: 'Đếm ngược', title: 'Ngày Vui', line: 'Từng giây trôi qua là từng bước đưa chúng mình về bên nhau.' }),
      family,
      B.story(p, [at(2), at(3), at(4)], { kick: 'Câu chuyện tình yêu', title: 'Love Story', chapters: [['Chương 1', 'Ấn tượng đầu tiên', 'Gặp nhau tình cờ ở buổi tiệc của bạn chung, anh ấn tượng với cô gái tự tin, rạng rỡ – và tim bắt đầu đập khác đi.'], ['Chương 2', 'Hành trình bên nhau', 'Những buổi hẹn, những chuyến đi, những ngày đi học rồi đi làm… chúng mình cùng lớn lên bên nhau.'], ['Chương 3', 'Yêu đủ rồi, cưới thôi', 'Đi qua thật nhiều mùa thương, hôm nay chúng mình chọn nắm tay nhau thật chặt – về chung một nhà.']] }),
      B.sign(p, at(5), { kick: 'Signature', title: 'Lưu Bút' }),
      B.album(p, [at(0), at(1), at(2), at(3), at(4), at(5), at(6), at(7), at(8)], { kick: 'Album ảnh cưới', title: 'Khoảnh Khắc Ngọt Ngào', line: 'Cùng ngắm nhìn khoảnh khắc ngọt ngào của chúng mình nhé!' }),
      B.rites(p, { kick: 'Sự kiện cưới', title: 'Ngày Chung Đôi', list: [['⚭', 'Lễ Vu Quy', '07:30 · {thu} {ngay_so}.{thang}.{nam}', 'Tại nhà gái\n198 Bế Văn Đàn, Đà Nẵng'], ['⌂', 'Lễ Thành Hôn', '09:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại nhà trai\n25 Lê Lợi, Đà Nẵng'], ['✦', 'Tiệc Cưới', '{gio} · {thu} {ngay_so}.{thang}.{nam}', 'Nhà hàng Hoàng Kim · Sảnh Ngọc Trai']] }),
      B.rsvp(p),
      B.wishes(p),
      B.gift(p),
      B.dress(p, { colors: p.t.dress }),
      B.thanks(p, at(0)),
    ];
  }

  /** Báo Cưới (làm lại theo kiểu “Hỷ thiếp” giấy cổ): khung đỏ, ba ảnh xoè quạt, ngày lớn */
  function baoCuoi(p, ph) {
    const at = (i) => ph[i % ph.length];
    const RED = p.accent;
    const cover = S2(p, 980, [
      S(18, 18, 384, 944, 'rect', { stroke: RED, sw: 1.5 }), S(26, 26, 368, 928, 'rect', { stroke: RED, sw: 0.6 }),
      T(30, 60, 360, 22, 'THIỆP MỜI CƯỚI', K.kick(p, { ls: 6 })),
      T(30, 92, 360, 34, 'Lễ Thành Hôn', K.serif(p, { font: 'Playfair Display', size: 26, italic: true, color: p.ink })),
      I(70, 146, 280, 400, at(0), { mask: 'arch', radius: 4, border: 5, borderColor: '#fffaf0', shadow: true, filter: 'warm', anim: 'zoom' }),
      T(10, 568, 400, 74, '{chu_re}', K.script(p, { size: 56, color: p.ink, anim: 'left' })),
      T(10, 630, 400, 44, '&', K.script(p, { size: 36, color: RED })),
      T(10, 668, 400, 74, '{co_dau}', K.script(p, { size: 56, color: p.ink, anim: 'right' })),
      S(70, 774, 80, 1, 'line', { fill: RED }), S(270, 774, 80, 1, 'line', { fill: RED }),
      T(150, 760, 120, 28, '{ngay_so} · {thang} · {nam}', K.serif(p, { size: 17, color: p.ink, ls: 2 })),
      T(50, 806, 320, 50, 'Từ hôm nay, hai ngả đường chung một lối về – cùng nhau bước tiếp thật vững vàng.', K.serif(p, { size: 14.5, italic: true, lh: 1.55 })),
      T(30, 880, 360, 50, '囍', { font: 'Noto Serif', size: 34, color: RED }),
    ]);
    const invite = S2(p, 1120, [
      T(30, 40, 360, 22, '—   HỶ THIẾP   —', K.kick(p, { ls: 5 })),
      T(30, 66, 360, 54, 'Thư Mời', K.script(p, { size: 46, color: p.ink })),
      T(30, 124, 360, 24, 'Trân trọng kính mời', K.serif(p, { size: 17, italic: true, color: p.ink })),
      T(20, 150, 380, 52, '{ten_khach}', K.script(p, { size: 40, color: RED, anim: 'up' })),
      T(40, 206, 340, 22, 'tới dự bữa tiệc chung vui cùng gia đình chúng tôi', K.sans(p, { size: 13, italic: true })),
      I(30, 280, 150, 220, at(1), { border: 6, borderColor: '#ffffff', shadow: true, r: -8, filter: 'warm', anim: 'left' }),
      I(240, 280, 150, 220, at(2), { border: 6, borderColor: '#ffffff', shadow: true, r: 8, filter: 'warm', anim: 'right' }),
      I(128, 250, 164, 250, at(3), { border: 6, borderColor: '#ffffff', shadow: true, filter: 'warm', anim: 'up' }),
      T(30, 540, 360, 22, 'Tiệc cưới được tổ chức vào lúc', K.serif(p, { size: 15, italic: true })),
      T(30, 566, 360, 36, '{gio}', K.serif(p, { font: 'Playfair Display', size: 28, bold: true, color: p.ink })),
      S(50, 640, 100, 1, 'line', { fill: p.ink }), S(270, 640, 100, 1, 'line', { fill: p.ink }),
      T(50, 648, 100, 24, '{thu}', K.sans(p, { size: 13, bold: true, color: p.ink, upper: true, ls: 1 })),
      T(150, 614, 120, 80, '{ngay_so}', { font: 'Playfair Display', size: 64, bold: true, color: RED, lh: 1.15, anim: 'zoom' }),
      T(270, 648, 100, 24, 'Tháng {thang}', K.sans(p, { size: 13, bold: true, color: p.ink, upper: true, ls: 1 })),
      S(50, 680, 100, 1, 'line', { fill: p.ink }), S(270, 680, 100, 1, 'line', { fill: p.ink }),
      T(30, 700, 360, 24, '{nam}', K.serif(p, { size: 18, color: p.ink, ls: 3 })),
      T(30, 728, 360, 22, '(Tức ngày {am_lich})', K.serif(p, { size: 13.5, italic: true })),
      T(30, 774, 360, 20, 'TẠI', K.kick(p, { ls: 4 })),
      T(30, 798, 360, 24, 'Trung tâm tiệc cưới', K.serif(p, { size: 16, color: p.ink })),
      T(10, 824, 400, 56, 'Vườn Tre Palace', K.script(p, { size: 44, color: RED })),
      T(30, 884, 360, 22, 'Sảnh Ngọc Bích · Tầng 2', K.serif(p, { size: 15, italic: true, color: p.ink })),
      T(50, 912, 320, 44, 'Số 36 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', K.sans(p, { size: 13 })),
      G(130, 970, 160, 38, 'addcal', { ...wid(p), title: 'Tiệc cưới {chu_re} & {co_dau}' }),
      G(130, 1020, 160, 38, 'map', { ...wid(p), style: 'button', label: 'Chỉ đường', address: 'Số 36 Hoàng Quốc Việt, Cầu Giấy, Hà Nội' }),
    ]);
    return [
      cover, invite,
      B.parents(p, { addrG: 'Long Biên, Hà Nội', addrB: 'Tây Hồ, Hà Nội' }),
      B.pair(p, { src: at(1), zoom: 1.7, ox: 25, oy: 40 }, { src: at(1), zoom: 1.7, ox: 75, oy: 40 }),
      B.rites(p, { kick: 'Nghi lễ', title: 'Lễ Cưới', list: [['⚭', 'Lễ Vu Quy', '08:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà gái\nTây Hồ, Hà Nội'], ['⌂', 'Lễ Thành Hôn', '10:00 · {thu} {ngay_so}.{thang}.{nam}', 'Tại tư gia nhà trai\nLong Biên, Hà Nội'], ['✦', 'Tiệc Cưới', '{gio} · {thu} {ngay_so}.{thang}.{nam}', 'Vườn Tre Palace\nSố 36 Hoàng Quốc Việt, Hà Nội']] }),
      B.calendar(p, { kick: 'Save the date', title: 'Ngày Chung Đôi' }),
      B.countdown(p, { kick: 'Đếm ngược', title: 'Chờ Ngày Hạnh Phúc', line: 'Từng ngày trôi qua, chúng mình lại gần hơn tới lời hẹn trọn đời' }),
      B.timeline(p, { kick: 'Lịch trình', title: 'Ngày Vui', items: [['10:30', '♡', 'Đón khách'], ['11:00', '⚭', 'Làm lễ thành hôn'], ['11:30', '✦', 'Khai tiệc'], ['13:00', '❀', 'Chụp ảnh lưu niệm']] }),
      B.map(p, { kick: 'Chỉ đường', title: 'Đường Tới Tiệc Cưới', venue: 'Vườn Tre Palace', addr: 'Số 36 Hoàng Quốc Việt, Cầu Giấy, Hà Nội' }),
      B.story(p, [at(2), at(3), at(0)], { kick: 'Love story', title: 'Chuyện Tình Chúng Mình', chapters: [['Mùa thu 2020 · Hà Nội', 'Lần đầu gặp gỡ', 'Một chiều mưa ở hiên thư viện, hai người lạ cùng trú mưa – và câu chuyện bắt đầu từ đó.'], ['Mùa xuân 2024 · Đà Lạt', 'Lời hẹn ước', 'Giữa rừng thông xanh, anh khẽ hỏi: “Mình về chung một nhà nhé?” – em mỉm cười gật đầu.'], ['Hôm nay', 'Về chung một nhà', 'Hai gia đình nắm tay nhau, chọn ngày lành để đôi mình bắt đầu hành trình mới.']] }),
      B.album(p, [at(4), at(5), at(6), at(7), at(1), at(2), at(3), at(0), at(4)], { kick: 'Khoảnh khắc', title: 'Album Ảnh Cưới', line: 'Mỗi tấm ảnh là một đường chỉ, khâu lại câu chuyện của chúng mình' }),
      B.dress(p, { kick: 'Trang phục', title: 'Dress Code', colors: p.t.dress }),
      B.sign(p, at(3), { kick: 'Ký tên', title: 'Lưu Bút Ngày Vui' }),
      B.rsvp(p),
      B.wishes(p),
      B.gift(p),
      B.thanks(p, at(0)),
    ];
  }

  // ===================== KHAI BÁO 8 MẪU =====================
  const F = { vibes: 'Great Vibes', alex: 'Alex Brush', playfair: 'Playfair Display', corm: 'Cormorant Garamond', lora: 'Lora', prata: 'Prata', mont: 'Montserrat', be: 'Be Vietnam Pro', charm: 'Charm' };
  const defs = [
    // Ba mẫu làm lại 18/11/2026 (giữ nguyên khoá để link cũ không đổi)
    {
      key: 'do-son-song-hy', name: 'Đỏ Son Song Hỷ', folder: 'a12', tier: 'basic', opener: 'doors', featured: 2, noAuto: true, song: 'mai-mai-ben-nhau', fall: 'petals', autostart: true,
      tags: ['Truyền thống', 'Sang trọng'],
      desc: 'Đỏ son lưới vàng, khung viền đôi, chữ “Wedding” viết tay trên ảnh – mở thiệp hai cánh cửa trượt sang hai bên.',
      op: { color: '#8e1520', paper: '#4f070d', photoIdx: 0 },
      p: {
        page: '#4f070d', bg: '#7a0c14', bg2: '#6e0a12', tex: LATTICE, card: '#00000026', cardLine: '#e6c27a88', ink: '#fff3e0', soft: '#f1d6c4', gold: '#f0cd84', accent: '#e2b45c', accent2: '#f6dc9a', line: '#e6c27a66',
        kick: '#f0cd84', iconBg: '#00000022', frame: '#fff3e0', deco: 'star', calBg: '#fff6ea', script: F.vibes, title: F.vibes, serif: F.playfair, display: F.playfair, sans: F.be, wInk: '#5a0a10',
        t: {},
      },
      build: doSon,
      photos: [1, 5, 3, 4, 6, 8, 9, 2, 1, 5, 3, 4, 6, 8, 9, 2],
    },
    {
      key: 'do-do-chu-vang', name: 'Đỏ Đô Chữ Vàng', folder: 'a16', tier: 'basic', opener: 'doors', featured: 2, noAuto: true, song: 'le-duong', fall: 'sparkle', autostart: true,
      tags: ['Đỏ đô', 'Truyền thống'],
      desc: 'Đỏ đô và vàng nhũ, mây cuộn, nhẫn cưới, ruy băng ngày cưới và khung ảnh chồng lớp – cửa hai cánh trượt mở.',
      op: { color: '#6b1019', paper: '#3a060b', photoIdx: 0 },
      p: {
        page: '#3a060b', bg: '#5c0c15', bg2: '#520a12', tex: LATTICE, card: '#00000030', cardLine: '#e3c27f88', ink: '#fff3e0', soft: '#ecd3b8', gold: '#e9c77f', accent: '#d9a74a', accent2: '#f6dc9a', line: '#e3c27f66',
        kick: '#e9c77f', iconBg: '#00000022', frame: '#fff3e0', deco: 'star', calBg: '#fff6ea', script: F.vibes, title: F.vibes, serif: F.corm, display: F.playfair, sans: F.mont, wInk: '#4a0810',
        t: { dress: [{ c: '#6b1019', n: 'Đỏ Đô' }, { c: '#e9c77f', n: 'Vàng Kim' }, { c: '#fff3e0', n: 'Trắng Ngà' }, { c: '#1f1a17', n: 'Đen' }] },
      },
      build: doDo,
      photos: [3, 2, 4, 5, 7, 8, 6, 9, 3, 2],
    },
    {
      key: 'bao-cuoi', name: 'Báo Cưới', folder: 'a15', tier: 'basic', opener: 'news', featured: 2, noAuto: true, song: 'bai-nay-khong-de-di-dien', fall: 'leaves', autostart: true,
      tags: ['Báo cưới', 'Vintage'],
      desc: 'Hỷ thiếp giấy cổ khung đỏ, ba ảnh xoè quạt và ngày cưới lớn – mở thiệp bằng tờ báo tin vui.',
      op: { color: '#a3283f', paper: '#efe4cf', photoIdx: 0 },
      p: {
        page: '#ddd1b9', bg: '#f3ead8', bg2: '#efe4cf', tex: PAPER, card: '#fffaf0', cardLine: '#cdb89a', ink: '#2a211b', soft: '#6b5d50', gold: '#a3283f', accent: '#a3283f', line: '#cdb89a',
        kick: '#a3283f', frame: '#ffffff', script: F.vibes, title: F.playfair, serif: F.lora, display: F.playfair, sans: F.be,
        t: { dress: [{ c: '#a3283f', n: 'Đỏ Son' }, { c: '#f3ead8', n: 'Kem Giấy' }, { c: '#6b5d50', n: 'Nâu Trà' }, { c: '#2a211b', n: 'Đen Mực' }] },
      },
      build: baoCuoi,
      photos: [2, 13, 5, 4, 13, 2, 5, 4],
    },
    {
      key: 'truc-xanh-an-do', name: 'Trúc Xanh Ấn Đỏ', folder: 'a46', tier: 'basic', opener: 'stamp', featured: 3, noAuto: true, song: 'thanh-than', fall: 'petals', autostart: true,
      tags: ['Truyền thống', 'Thiên nhiên'],
      desc: 'Giấy xanh rêu, cành trúc và hoa đào, chữ vàng nhũ – mở thiệp bằng hai cánh cửa giấy và ấn đỏ có ảnh cưới.',
      op: { color: '#9e2b3a', paper: '#56704c', photoIdx: 0 },
      p: {
        page: '#3f5638', bg: '#5b7551', bg2: '#56704c', tex: PAPER, card: '#ffffff14', cardLine: '#e9cf8c66', ink: '#f4ecd6', soft: '#dcd6bd', cream: '#f6efda', gold: '#e9cf8c', accent: '#c9a45a', accent2: '#f3dca4', line: '#e9cf8c55',
        kick: '#e9cf8c', iconBg: '#ffffff10', frame: '#f6efda', deco: 'dao', script: F.vibes, title: F.playfair, serif: F.playfair, display: F.playfair, sans: F.be, wInk: '#3a4a33',
        t: { dress: [{ c: '#5b7551', n: 'Xanh Trúc' }, { c: '#f2b6c4', n: 'Hồng Đào' }, { c: '#e9cf8c', n: 'Vàng Nhũ' }, { c: '#f6efda', n: 'Trắng Ngà' }] },
      },
      build: trucXanh,
      photos: [16, 13, 11, 15, 17, 19, 12, 18, 13, 20, 16, 11, 17, 15, 19, 13, 16],
    },
    {
      key: 'thu-xanh-hoa-co', name: 'Thư Xanh Hoa Cỏ', folder: 'a43', tier: 'basic', opener: 'letter', featured: 3, noAuto: true, song: 'ben-do-hanh-phuc', fall: 'petals', autostart: true,
      tags: ['Thiên nhiên', 'Hàn Quốc'],
      desc: 'Xanh xô thơm với hoa lá nét trắng, phong thư kéo ảnh lên khi mở, đĩa than xoay theo nhạc và chú rể – cô dâu so le.',
      op: { color: '#3f5f48', paper: '#7f9e86', photoIdx: 0 },
      p: {
        page: '#6d8a74', bg: '#7f9e86', bg2: '#f4f6f1', ink: '#3b4a3f', soft: '#6f7d72', accent: '#5f8466', line: '#cfdccf', card: '#ffffff', script: F.vibes, title: F.vibes, serif: F.lora, display: F.lora, sans: F.mont, gold: '#4f7357', deco: 'leaf',
        t: { dress: [{ c: '#a9c2ad', n: 'Xanh Xô Thơm' }, { c: '#f3f1ea', n: 'Trắng Kem' }, { c: '#d9c6a5', n: 'Be Cát' }, { c: '#5f8466', n: 'Xanh Rêu' }] },
      },
      build: thuXanh,
      photos: [1, 10, 9, 8, 6, 11, 14, 2, 3, 18, 5, 4, 19, 21, 22, 7, 20, 23, 10],
    },
    {
      key: 'no-lua-nau', name: 'Nơ Lụa Nâu', folder: 'a44', tier: 'basic', opener: 'ribbon', featured: 3, noAuto: true, song: 'love-like-a-dream', fall: 'petals', autostart: true,
      tags: ['Thanh lịch', 'Hàn Quốc'],
      desc: 'Vải lanh xám kem, chữ nâu socola và nơ lụa – khách chạm tháo nơ để mở thiệp, cánh hoa đỏ rơi nhẹ.',
      op: { color: '#6b2f2a', paper: '#e3e1dc', photoIdx: 0 },
      p: {
        page: '#d9d6cf', bg: '#e6e4df', bg2: '#e6e4df', tex: LINEN, ink: '#4a2a24', soft: '#7a6660', accent: '#6b2f2a', line: '#c9c1b8', card: '#ffffff80', script: F.alex, title: F.alex, serif: F.lora, display: F.playfair, sans: F.be, gold: '#4a2a24', deco: 'none',
        t: { dress: [{ c: '#4a2a24', n: 'Nâu Socola' }, { c: '#e6e4df', n: 'Xám Lanh' }, { c: '#f5f1ea', n: 'Trắng Kem' }, { c: '#a9473f', n: 'Đỏ Gạch' }] },
      },
      build: noLua,
      photos: [4, 3, 5, 1, 9, 16, 15, 13, 18, 7, 10, 14, 6, 11, 17, 2, 8, 5],
    },
    {
      key: 'ban-tin-hanh-phuc', name: 'Bản Tin Hạnh Phúc', folder: 'a40', tier: 'basic', opener: 'news', featured: 3, noAuto: true, song: 'marry-you', fall: 'leaves', autostart: true,
      tags: ['Báo cưới', 'Vintage'],
      desc: 'Tờ báo Sài Gòn xưa: măng-sét “Bản Tin Hạnh Phúc”, lịch chiếu hôn lễ, lịch treo tường, radio đếm ngược và lá me bay.',
      op: { color: '#1f3d63', paper: '#e9dfcc', photoIdx: 0 },
      p: {
        page: '#d9ceb6', bg: '#f4ecdb', bg2: '#f4ecdb', ink: '#26221d', soft: '#5a5147', accent: '#1f3d63', line: '#b9ab8f', card: '#fffaf0', script: F.vibes, title: 'Oswald', serif: F.lora, display: 'Oswald', sans: F.be, gold: '#26221d',
        t: {},
      },
      build: banTin,
      photos: [11, 9, 10, 12, 1, 2, 13, 14, 15, 17, 20, 21, 19, 22],
    },
    {
      key: 'o-liu-thanh-lich', name: 'Ô Liu Thanh Lịch', folder: 'a42', tier: 'basic', opener: 'oval', featured: 3, noAuto: true, song: 'the-gioi-cua-anh', fall: 'petals', autostart: true,
      tags: ['Thanh lịch', 'Tối giản'],
      desc: 'Ảnh tràn mờ dần vào nền ngà, chữ serif in hoa mảnh, khối xanh ô liu và hoa lá nét mảnh – mở thiệp khung ảnh oval.',
      op: { color: '#5e5e45', paper: '#7c7f63', photoIdx: 0 },
      p: {
        page: '#ecebe3', bg: '#f7f5ef', bg2: '#f1efe6', olive: '#7c7f63', ink: '#3e3e2c', soft: '#7d7b6b', accent: '#6b6d50', line: '#d9d6c6', card: '#ffffff', script: F.vibes, title: F.corm, serif: F.corm, display: F.corm, sans: F.mont, gold: '#5e5e45', deco: 'none', r: 4,
        t: { dress: [{ c: '#7c7f63', n: 'Xanh Ô Liu' }, { c: '#f7f5ef', n: 'Trắng Ngà' }, { c: '#cbbfa5', n: 'Be Đá' }, { c: '#3e3e2c', n: 'Nâu Rêu' }] },
      },
      build: oLiu,
      photos: [19, 6, 7, 20, 13, 16, 3, 9, 17, 11, 14, 12, 10, 21, 18, 15, 8, 4, 19],
    },
    {
      key: 'vom-trang-song-hy', name: 'Vòm Trắng Song Hỷ', folder: 'a45', tier: 'basic', opener: 'letter', featured: 3, noAuto: true, song: 'canon-in-love', fall: 'petals', autostart: true,
      tags: ['Tối giản', 'Chữ Hỷ'],
      desc: 'Nền chần bông trắng, khung vòm trắng dày, sắc xanh ngọc xám dịu và dấu Song Hỷ – mở thiệp phong thư kéo ảnh.',
      op: { color: '#5d7f78', paper: '#eef2f1', photoIdx: 0 },
      p: {
        page: '#e6ebea', bg: '#f4f6f5', bg2: '#eef2f1', ink: '#344643', soft: '#748683', accent: '#5d7f78', line: '#d3dcda', card: '#ffffffd8', script: F.vibes, title: F.vibes, serif: F.corm, display: F.corm, sans: F.mont, gold: '#5d7f78', deco: 'leaf',
        t: { dress: [{ c: '#ffffff', n: 'Trắng' }, { c: '#a9c4bf', n: 'Xanh Ngọc' }, { c: '#d6dcdb', n: 'Xám Bạc' }, { c: '#e9d9c6', n: 'Be Sữa' }] },
      },
      build: vomTrang,
      photos: [22, 1, 21, 9, 10, 12, 13, 3, 16, 17, 14, 18, 20, 11, 15, 8, 6, 4, 23],
    },
    {
      key: 'sao-bang-dem-xanh', name: 'Sao Băng Đêm Xanh', folder: 'a42', tier: 'basic', opener: 'stars', featured: 3, noAuto: true, song: 'beautiful-in-white', fall: 'sparkle', autostart: true,
      tags: ['Đêm', 'Ngân hà'],
      desc: 'Xanh đêm thẳm và vàng nhũ, thẻ kính mờ viền vàng, sao lấp lánh – mở thiệp bằng bầu trời sao băng.',
      op: { color: '#e6c77a', paper: '#141a3a', photoIdx: 0 },
      p: {
        page: '#0d1230', bg: '#161d44', bg2: '#121838', card: '#ffffff12', cardLine: '#e6c77a66', ink: '#f2ecdf', soft: '#c9c6d9', gold: '#e6c77a', accent: '#d8b45e', accent2: '#f3dca4', line: '#e6c77a44', kick: '#e6c77a', iconBg: '#ffffff0d', frame: '#e6c77a', deco: 'star',
        script: F.vibes, title: F.playfair, serif: F.playfair, display: F.playfair, sans: F.be, wInk: '#232a52',
        t: { dress: [{ c: '#1b2452', n: 'Xanh Đêm' }, { c: '#e6c77a', n: 'Vàng Sao' }, { c: '#c9c6d9', n: 'Bạc Trăng' }, { c: '#f2ecdf', n: 'Trắng Ngà' }] },
      },
      build: saoBang,
      photos: [19, 6, 13, 16, 3, 9, 17, 11, 14, 12, 20, 21, 18, 15, 8, 4, 2, 10],
    },
    {
      key: 'hong-tran-chau', name: 'Hồng Trân Châu', folder: 'a40', tier: 'basic', opener: 'curtain', featured: 3, noAuto: true, song: 'a-thousand-years', fall: 'petals', autostart: true,
      tags: ['Lãng mạn', 'Hàn Quốc'],
      desc: 'Hồng phấn ngọc trai, bìa vòm chữ dọc với ngày cưới nổi lớn, Save the Date ba ảnh và lịch – rèm lụa & bướm bay mở thiệp.',
      op: { color: '#b48a7a', paper: '#f3e4df', photoIdx: 0 },
      p: {
        page: '#efe0db', bg: '#f8eeeb', bg2: '#f4e7e3', card: '#ffffff', glass: '#fff8f6cc', veil: '#ffffff44', ink: '#5a4440', soft: '#9a8580', accent: '#b48a7a', line: '#ead7d1',
        script: F.vibes, script2: 'Alex Brush', serif: F.corm, sans: F.mont, display: F.playfair, title: 'Alex Brush', gold: '#8a6a60', deco: 'none',
        t: { tag: 'Together for life', quote: '“Gặp được nhau đã là may mắn, đi cùng nhau là hạnh phúc.”', song: 'Our Song', dress: [{ c: '#f3e4df', n: 'Hồng Trân Châu' }, { c: '#ffffff', n: 'Trắng' }, { c: '#d9b8ac', n: 'Hồng Đất' }, { c: '#c9c2bd', n: 'Xám Ngọc' }] },
      },
      build: hongTranChau,
      photos: [7, 17, 12, 21, 5, 6, 1, 13, 14, 15, 2, 20, 19, 7, 12, 22, 16, 9, 10, 3],
    },
  ];
  // Thư viện trang dùng chung cho bộ mẫu thứ ba (canvas-starters-c.js)
  defs.lib = { B, K, hd, S2, F, PAPER, LINEN, FLW, FLW_D, LEAF, DAO, CLOUD, LATTICE };
  return defs;
};
