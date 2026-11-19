'use strict';
/**
 * Bố cục "Thiệp 91" (20/11/2026): dựng lại thiệp HTML `thiep_cuoi_91_premium` do chủ dự án tự làm
 * thành thiệp canvas của SOBA – giữ thứ tự trang, bố cục ảnh/chữ, màn mở vân tay và nhạc nền Love Story,
 * thêm các tiện ích của SOBA mà bản HTML chưa có (tên khách mời, xác nhận tham dự lưu về máy chủ,
 * sổ lời chúc, ký tên lưu bút, bản đồ, thêm vào lịch, âm lịch tự động, QR mừng cưới tự tạo, bộ sưu tập ảnh).
 *
 * Xuất: make(kit) → { defs, build91 }
 *  - build91(ph, t): mảng trang; ph = ảnh theo vị trí (xem SLOTS), t = câu chữ ghi đè (thiệp thật của chủ dự án)
 *  - defs: mẫu "Love Story Đỏ Son" dùng ảnh a51 (Basic)
 */
module.exports = function make(kit) {
  const { T, I, S, G, sec } = kit;

  // Bảng màu & phông giống bản HTML gốc
  const C = { bg: '#ffffff', paper: '#f7f5f1', ink: '#1d1c1a', soft: '#6d6a64', line: '#e6e2db', red: '#b3262d', page: '#ece9e4' };
  const SC = 'Great Vibes';
  const PF = 'Playfair Display';
  const LO = 'Lora';
  const small = (o = {}) => ({ font: LO, size: 11, ls: 3, upper: true, color: C.soft, ...o });
  const body = (o = {}) => ({ font: LO, size: 14, lh: 2, color: C.ink, ...o });
  const wid = { color: C.red, textColor: C.ink, font: LO };
  const heart = (x, y) => [S(x, y, 26, 26, 'circle', { fill: '#ffffff', stroke: C.red, sw: 1 }), T(x, y + 4, 26, 18, '♥', { font: LO, size: 11, color: C.red })];

  /** Các vị trí ảnh của bố cục (33 ảnh) */
  const SLOTS = ['hero', 'pill', 'groom', 'bride', 'meet', 'love', 'ls1', 'ls2', 'ls3', 'ls4', 'tall', 'st1', 'st2', 'st3', 'ca', 'cb', 'cc', 'g1', 'g2', 'g3', 'g4', 'rw', 'rs2', 'rs', 'letter', 'p1', 'p2', 'disc', 'wide', 'venue', 'end', 'mini'];

  /**
   * ph: { hero, pill, ... } (src hoặc { src, oy }) · t: câu chữ ghi đè
   */
  function build91(ph, t = {}) {
    const P = (k) => (typeof ph[k] === 'string' ? { src: ph[k] } : ph[k]);
    const im = (x, y, w, h, k, o = {}) => I(x, y, w, h, P(k).src, { oy: P(k).oy == null ? 50 : P(k).oy, ...o });
    const tx = {
      groomFull: '{chu_re}',
      brideFull: '{co_dau}',
      place: 'Tư gia nhà trai',
      verse: 'Vào ngày {ngay_so} tháng {thang} năm {nam},\nchúng mình sẽ nắm tay nhau\nbước sang một chương mới của cuộc đời.\nTrân trọng mời những người thân yêu\nvà bạn bè thân thiết nhất\nđến chứng kiến tình yêu của chúng mình\nvà cùng chia sẻ niềm vui này.',
      story: [
        ['Gặp gỡ', 'Chúng mình bắt đầu những năm tháng thanh xuân cùng nhau với tư cách những người bạn.'],
        ['Rung động', 'Từ những chuyến đi dài và những câu chuyện không hồi kết, rung động đầu tiên đã đến.'],
        ['Đồng hành', 'Những năm yêu thương, từng bước trở thành một phần không thể thiếu của nhau.'],
        ['Trọn đời', 'Và hôm nay, chúng mình quyết định cùng nhau viết tiếp câu chuyện ấy bằng một lời hứa trọn đời.'],
      ],
      address: 'Số 12 Hoa Sữa, Hoàn Kiếm, Hà Nội',
      addressLines: 'Số 12 Hoa Sữa\nHoàn Kiếm – Hà Nội',
      schedule: [
        ['{gio}', 'Đón Khách', 'Đón tiếp quan viên hai họ, bạn bè và chụp ảnh lưu niệm.'],
        ['11:30', 'Hôn Lễ Thành Hôn', 'Cử hành nghi thức hôn lễ thiêng liêng, trao nhẫn cưới và lời hẹn ước bên nhau.'],
        ['12:00', 'Khai Tiệc Mừng', 'Cùng nâng ly chúc phúc, thưởng thức tiệc cưới ấm cúng và giao lưu âm nhạc.'],
      ],
      song: 'Love Story · Piano',
      foot: '{nam}.{thang}.{ngay_so}',
      gift: {},
      // Lễ vu quy (nhà gái): ceremony 'vu quy', brideFirst → cô dâu đứng trước
      ceremony: 'thành hôn',
      ceremonyTitle: 'Lễ Thành Hôn',
      brideFirst: false,
      ...t,
    };
    const n1 = tx.brideFirst ? tx.brideFull : tx.groomFull;
    const n2 = tx.brideFirst ? tx.groomFull : tx.brideFull;
    const short = tx.brideFirst ? '{co_dau} & {chu_re}' : '{chu_re} & {co_dau}';

    // 1. Bìa: tiêu đề, ảnh lớn, khung viên thuốc "Save the Date", tên đầy đủ, lời mời, tên khách
    const s1 = sec(1230, C.bg, [
      T(20, 50, 380, 60, 'Thiệp Mời Đám Cưới', { font: SC, size: 42, color: C.ink, anim: 'up' }),
      T(20, 112, 380, 20, 'Wedding Invitation', small({ anim: 'up', delay: 0.1 })),
      im(13, 150, 394, 476, 'hero', { anim: 'zoom' }),
      S(28, 506, 128, 262, 'rect', { fill: '#ffffff', radius: 70, shadow: true, anim: 'zoom', delay: 0.2 }),
      im(37, 515, 110, 140, 'pill', { mask: 'arch', anim: 'zoom', delay: 0.2 }),
      T(28, 664, 128, 36, 'Save the Date', { font: SC, size: 25, color: C.ink, anim: 'zoom', delay: 0.2 }),
      T(28, 704, 128, 40, '囍', { font: 'Noto Serif', size: 30, color: C.red, anim: 'zoom', delay: 0.2 }),
      T(170, 646, 228, 58, n1 + '\n& ' + n2, { font: PF, size: 18, bold: true, lh: 1.45, align: 'right', color: C.ink, anim: 'right' }),
      T(170, 708, 228, 22, '{nam} · {thang} · {ngay_so}', { font: PF, size: 14, ls: 2, align: 'right', color: C.ink, anim: 'right', delay: 0.1 }),
      T(170, 732, 228, 40, tx.place, { font: LO, size: 12, lh: 1.5, align: 'right', color: C.soft, anim: 'right', delay: 0.2 }),
      T(36, 820, 348, 206, tx.verse, body({ lh: 2.05, anim: 'up' })),
      S(187, 1046, 46, 1, 'line', { fill: C.ink }),
      T(30, 1078, 360, 20, 'Trân trọng kính mời', small({ color: C.red, anim: 'up' })),
      T(20, 1102, 380, 56, '{ten_khach}', { font: SC, size: 38, color: C.ink, anim: 'up', delay: 0.1 }),
      T(40, 1162, 340, 40, 'tới dự lễ ' + tx.ceremony + ' của chúng mình', { font: LO, size: 13, italic: true, color: C.soft, anim: 'up', delay: 0.2 }),
    ]);

    // 2. Cô dâu chú rể + hai ô ảnh so le (người đứng trước ở bên trái, cao hơn)
    function person(x, y, anim, who) {
      const g = who === 'groom';
      return [
        im(x, y, 186, 250, who, { anim }),
        T(x, y + 262, 186, 18, g ? 'Chú rể' : 'Cô dâu', small({ size: 10.5 })),
        T(x, y + 280, 186, 44, g ? '{chu_re}' : '{co_dau}', { font: SC, size: 32, color: C.ink }),
        T(x, y + 324, 186, 22, g ? tx.groomFull : tx.brideFull, { font: LO, size: 12.5, color: C.soft }),
      ];
    }
    const s2 = sec(880, C.bg, [
      ...person(18, 30, 'left', tx.brideFirst ? 'bride' : 'groom'),
      ...person(216, 74, 'right', tx.brideFirst ? 'groom' : 'bride'),
      im(22, 470, 184, 184, 'meet', { anim: 'left' }),
      T(220, 498, 178, 26, 'Gặp gỡ', { font: PF, size: 17, align: 'left', color: C.ink, anim: 'right' }),
      T(220, 528, 178, 110, 'Có những người chỉ cần gặp một lần là biết sẽ muốn ở bên rất lâu.', body({ size: 13.5, lh: 1.95, align: 'left', anim: 'right' })),
      T(22, 698, 184, 26, 'Thương nhau', { font: PF, size: 17, align: 'right', color: C.ink, anim: 'left' }),
      T(22, 728, 184, 110, 'Từ những điều giản dị nhất, chúng mình đã chọn nhau mỗi ngày.', body({ size: 13.5, lh: 1.95, align: 'right', anim: 'left' })),
      im(216, 670, 184, 184, 'love', { anim: 'right' }),
    ]);

    // 3. Love Story: 4 chương, ảnh tròn xen kẽ hai bên đường chỉ giữa
    const ch = [];
    tx.story.slice(0, 4).forEach(([h, p], i) => {
      const y = 150 + i * 215;
      const rev = i % 2 === 1;
      const px = rev ? 228 : 22;
      const tx0 = rev ? 22 : 236;
      const al = rev ? 'right' : 'left';
      ch.push(
        im(px, y, 170, 170, 'ls' + (i + 1), { mask: 'circle', border: 5, borderColor: i === 3 ? C.red : '#ffffff', shadow: true, anim: rev ? 'right' : 'left' }),
        ...heart(197, y + 72),
        T(tx0, y + 6, 162, 16, 'Chương 0' + (i + 1), small({ size: 10, color: C.red, align: al, anim: rev ? 'left' : 'right' })),
        T(tx0, y + 24, 162, 28, h, { font: PF, size: 18, align: al, color: C.ink, anim: rev ? 'left' : 'right' }),
        T(tx0, y + 56, 162, 110, p, { font: LO, size: 12.5, lh: 1.8, align: al, color: C.soft, anim: rev ? 'left' : 'right' })
      );
    });
    const s3 = sec(1040, C.bg, [
      T(20, 36, 380, 20, 'Chuyện tình chúng mình', small({ anim: 'up' })),
      T(20, 58, 380, 70, 'Love Story', { font: SC, size: 50, color: C.ink, anim: 'up' }),
      S(209, 146, 1, 850, 'rect', { fill: C.ink, o: 0.22 }),
      ...ch,
    ]);

    // 4. Ảnh dọc lớn + câu thơ + 3 ảnh xếp chồng + lời hứa
    const s4 = sec(1460, C.bg, [
      im(18, 30, 384, 540, 'tall', { anim: 'zoom' }),
      S(18, 380, 384, 190, 'rect', { fill: '#000000', grad: 'up', o: 0.45 }),
      T(40, 470, 330, 20, '{ngay_so} · {thang} · {nam}', { font: PF, size: 13, ls: 3, align: 'left', color: '#ffffff', shadow: true }),
      T(36, 492, 340, 60, 'Forever begins', { font: SC, size: 44, align: 'left', color: '#ffffff', shadow: true }),
      T(30, 612, 360, 96, 'Cuộc sống chỉ cần hai điều may mắn:\ngặp được em,\nvà ở bên nhau đến cuối cuộc đời.', body({ lh: 2.05, anim: 'up' })),
      im(40, 736, 340, 176, 'st1', { anim: 'up' }),
      im(40, 922, 340, 176, 'st2', { anim: 'up' }),
      im(40, 1108, 340, 176, 'st3', { anim: 'up' }),
      T(30, 1310, 360, 124, 'Giờ đây, chúng mình quyết định\ntrở thành một gia đình —\nnhững người bạn đồng hành không thể tách rời,\ncùng nhau đi qua mọi mùa của cuộc đời.', body({ italic: true, lh: 2.05, anim: 'up' })),
    ]);

    // 5. Ảnh ghép so le + lưới 2×2
    const s5 = sec(1120, C.bg, [
      im(18, 30, 224, 300, 'ca', { anim: 'left' }),
      im(186, 70, 216, 236, 'cb', { border: 6, borderColor: '#ffffff', anim: 'right' }),
      im(30, 346, 200, 150, 'cc', { anim: 'left' }),
      S(250, 352, 50, 1, 'line', { fill: C.ink, r: -20 }),
      T(248, 368, 154, 150, 'Mọi chuyện bắt đầu từ lần gặp đầu tiên, và sẽ tiếp tục cùng dòng chảy của thời gian.', body({ size: 13.5, bold: true, align: 'left', anim: 'right' })),
      T(30, 548, 360, 64, 'Điều tuyệt vời nhất trên đời\nlà được dành thời gian bên người mình thương.', body({ anim: 'up' })),
      im(18, 636, 188, 220, 'g1', { anim: 'left' }),
      im(214, 636, 188, 220, 'g2', { anim: 'right' }),
      im(18, 864, 188, 220, 'g3', { anim: 'left' }),
      im(214, 864, 188, 220, 'g4', { anim: 'right' }),
    ]);

    // 6. Song hỷ: ảnh ngang + 2 ảnh viền trắng chồng lên · Lời ngỏ trên ảnh lớn
    const s6 = sec(1200, C.bg, [
      T(20, 26, 380, 50, '囍', { font: 'Noto Serif', size: 38, color: C.red, anim: 'up' }),
      T(20, 80, 380, 20, 'Song hỷ lâm môn', small({ anim: 'up' })),
      im(14, 120, 392, 250, 'rw', { anim: 'up' }),
      im(214, 334, 178, 190, 'rs', { border: 6, borderColor: '#ffffff', shadow: true, anim: 'right' }),
      im(28, 400, 150, 118, 'rs2', { border: 6, borderColor: '#ffffff', shadow: true, anim: 'left' }),
      im(14, 590, 392, 580, 'letter', { anim: 'zoom' }),
      S(14, 790, 392, 380, 'rect', { fill: '#000000', grad: 'up', o: 0.7 }),
      T(30, 980, 360, 60, 'Lời ngỏ', { font: SC, size: 46, color: '#ffffff', shadow: true }),
      T(40, 1044, 340, 110, 'Cùng với gia đình hai bên, chúng mình trân trọng kính mời quý vị đến dự lễ ' + tx.ceremony + ' để chứng kiến và chia sẻ khoảnh khắc hạnh phúc này.', body({ size: 13.5, lh: 1.95, color: '#ffffff', shadow: true })),
    ]);

    // 7. Lễ thành hôn: ngày lớn, âm lịch, lịch trình, nút thêm vào lịch
    const tl = [S(44, 230, 1, 340, 'rect', { fill: C.line })];
    tx.schedule.forEach(([tm, h, p], i) => {
      const y = 226 + i * 112;
      tl.push(
        S(40, y + 12, 9, 9, 'circle', { fill: '#ffffff', stroke: C.red, sw: 1 }),
        T(66, y, 320, 28, tm, { font: PF, size: 20, align: 'left', color: C.red, anim: 'up' }),
        T(66, y + 28, 320, 24, h, { font: PF, size: 16, align: 'left', color: C.ink, anim: 'up' }),
        T(66, y + 54, 320, 48, p, { font: LO, size: 13, lh: 1.75, align: 'left', color: C.soft, anim: 'up' })
      );
    });
    const s7 = sec(670, C.bg, [
      T(20, 36, 380, 20, tx.ceremonyTitle, small({ anim: 'up' })),
      S(187, 66, 46, 1, 'line', { fill: C.ink }),
      S(64, 100, 96, 1, 'line', { fill: C.ink }),
      T(64, 106, 96, 22, '{thu}', small({ size: 11.5, ls: 2, color: C.ink })),
      S(64, 134, 96, 1, 'line', { fill: C.ink }),
      T(160, 78, 100, 80, '{ngay_so}', { font: PF, size: 64, color: C.red, anim: 'zoom' }),
      S(260, 100, 96, 1, 'line', { fill: C.ink }),
      T(260, 106, 96, 22, '{thang} · {nam}', small({ size: 11.5, ls: 2, color: C.ink })),
      S(260, 134, 96, 1, 'line', { fill: C.ink }),
      T(20, 166, 380, 22, '(Tức ngày {am_lich})', { font: LO, size: 12.5, color: C.soft, anim: 'up' }),
      ...tl,
      G(120, 600, 180, 40, 'addcal', { ...wid, time: '{gio}', title: (tx.brideFirst ? 'Lễ vu quy ' : 'Đám cưới ') + short, address: tx.address }),
    ]);

    // 8. Âm nhạc: 2 ảnh so le + thẻ đĩa nhạc (chạm đĩa để phát/tạm dừng)
    const s8 = sec(420, C.bg, [
      im(30, 30, 174, 210, 'p1', { anim: 'left' }),
      im(216, 64, 174, 210, 'p2', { anim: 'right' }),
      S(30, 304, 360, 72, 'rect', { fill: '#ffffff', stroke: C.line, sw: 1, radius: 40, anim: 'up' }),
      im(41, 314, 52, 52, 'disc', { mask: 'circle', border: 3, borderColor: '#222222', anim: 'spin' }),
      T(106, 318, 220, 24, tx.song, { font: PF, size: 16, align: 'left', color: C.ink }),
      T(106, 342, 220, 20, 'Chạm vào đĩa nhạc để phát / tạm dừng', { font: LO, size: 11.5, align: 'left', color: C.soft }),
      S(340, 323, 34, 34, 'circle', { fill: C.ink }),
      T(340, 329, 34, 22, '♫', { font: LO, size: 15, color: '#ffffff' }),
    ]);

    // 9. Lịch tháng cưới + đếm ngược
    const s9 = sec(770, C.bg, [
      im(14, 30, 392, 220, 'wide', { anim: 'up' }),
      S(30, 280, 360, 1, 'line', { fill: C.ink }),
      T(30, 290, 200, 36, '{thang}.{nam}', { font: PF, size: 26, align: 'left', color: C.ink }),
      T(190, 298, 200, 22, 'Ngày chung đôi', small({ align: 'right' })),
      G(30, 334, 360, 290, 'calendar', { ...wid, anim: 'up' }),
      S(30, 632, 360, 1, 'line', { fill: C.ink }),
      G(30, 654, 360, 96, 'countdown', { ...wid, anim: 'up' }),
    ]);

    // 10. Địa điểm + bản đồ
    const s10 = sec(720, C.bg, [
      im(14, 30, 392, 250, 'venue', { anim: 'up' }),
      T(20, 306, 380, 20, 'Địa điểm tổ chức', small({ anim: 'up' })),
      T(20, 332, 380, 60, tx.addressLines, { font: PF, size: 18, lh: 1.55, color: C.ink, anim: 'up' }),
      G(30, 410, 360, 280, 'map', { ...wid, address: tx.mapQuery || tx.address, link: tx.mapLink || '', label: 'Xem chỉ đường Google Maps', anim: 'up' }),
    ]);

    // 11. Xác nhận tham dự (lưu về trang Khách mời của cô dâu chú rể)
    const s11 = sec(640, C.paper, [
      T(20, 44, 380, 20, 'R.S.V.P', small({ anim: 'up' })),
      T(20, 66, 380, 40, 'Xác nhận tham dự', { font: PF, size: 24, color: C.ink, anim: 'up' }),
      T(40, 112, 340, 40, 'Hồi âm giúp chúng mình trước ngày cưới để gia đình chuẩn bị chu đáo nhé.', { font: LO, size: 12.5, italic: true, color: C.soft }),
      G(30, 166, 360, 440, 'rsvp', { ...wid }),
    ]);

    // 12. Sổ lời chúc (gói Free tự gỡ)
    const s12 = sec(620, C.bg, [
      T(20, 44, 380, 20, 'Guestbook', small({ anim: 'up' })),
      T(20, 64, 380, 60, 'Sổ lời chúc', { font: SC, size: 44, color: C.ink, anim: 'up' }),
      G(30, 150, 360, 430, 'wishes', { ...wid, privacy: true }),
    ]);

    // 13. Ký tên lưu bút
    const s13 = sec(600, C.paper, [
      T(20, 44, 380, 20, 'Lưu bút', small({ anim: 'up' })),
      T(20, 64, 380, 60, 'Ký tên chúc phúc', { font: SC, size: 40, color: C.ink, anim: 'up' }),
      G(30, 140, 360, 430, 'signature', { ...wid }),
    ]);

    // 14. Hộp mừng cưới online (QR tự tạo theo số tài khoản)
    const s14 = sec(560, C.bg, [
      S(183, 44, 54, 54, 'circle', { stroke: C.red, sw: 1, anim: 'up' }),
      T(183, 56, 54, 30, '🎁', { font: LO, size: 22, anim: 'up' }),
      T(20, 110, 380, 36, 'Hộp Mừng Cưới Online', { font: PF, size: 24, color: C.ink, anim: 'up' }),
      T(40, 148, 340, 24, 'Gửi gắm món quà mừng chúc phúc tới Cô dâu & Chú rể', { font: LO, size: 13.5, color: C.soft, anim: 'up' }),
      G(40, 190, 340, 340, 'gift', { ...wid, style: tx.giftStyle || 'box', ...tx.gift }),
    ]);

    // 15. Lời cảm ơn + chân thiệp
    const s15 = sec(880, C.bg, [
      im(0, 0, 420, 600, 'end', { anim: 'fade' }),
      S(0, 300, 420, 300, 'rect', { fill: '#000000', grad: 'up', o: 0.6 }),
      T(20, 468, 380, 76, 'Thank you', { font: SC, size: 58, color: '#ffffff', shadow: true, anim: 'up' }),
      T(20, 544, 380, 22, 'Rất hân hạnh được đón tiếp!', { font: LO, size: 13, color: '#ffffff', shadow: true, anim: 'up' }),
      im(125, 634, 170, 88, 'mini', { anim: 'up' }),
      T(20, 738, 380, 24, n1 + ' · ' + n2, { font: PF, size: 15, color: C.ink, anim: 'up' }),
      T(20, 766, 380, 40, '囍', { font: 'Noto Serif', size: 26, color: C.red, anim: 'up' }),
      T(20, 812, 380, 20, tx.foot, small({ anim: 'up' })),
    ]);

    return [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15];
  }

  /** Gán ảnh a51 vào các vị trí của bố cục (ảnh bìa: số 12 – chủ dự án chọn) */
  const A51 = {
    hero: { n: 12, oy: 30 }, pill: { n: 30, oy: 15 }, groom: { n: 10, oy: 20 }, bride: { n: 3, oy: 20 }, meet: { n: 19, oy: 30 }, love: { n: 16, oy: 25 },
    ls1: 31, ls2: 33, ls3: 15, ls4: 1, tall: { n: 13, oy: 30 }, st1: { n: 7, oy: 35 }, st2: { n: 31, oy: 30 }, st3: { n: 9, oy: 60 },
    ca: { n: 11, oy: 30 }, cb: { n: 8, oy: 25 }, cc: { n: 34, oy: 58 }, g1: 26, g2: 27, g3: 28, g4: 35, rw: { n: 14, oy: 30 }, rs2: { n: 6, oy: 20 }, rs: { n: 4, oy: 15 },
    letter: { n: 32, oy: 40 }, p1: { n: 2, oy: 20 }, p2: { n: 17, oy: 30 }, disc: 12, wide: { n: 9, oy: 55 }, venue: { n: 28, oy: 40 }, end: { n: 30, oy: 35 }, mini: { n: 16, oy: 40 },
  };

  const defs = [
    {
      key: 'love-story-do-son', name: 'Love Story Đỏ Son', folder: 'a51', tier: 'basic', want: 'basic', opener: 'fingerprint', featured: 4, noAuto: true, song: 'nhac-cuoi-nhe-nhang', fall: 'petals', autostart: true,
      thumb: 12,
      tags: ['Hàn Quốc', 'Tối giản', 'Sang trọng'],
      desc: 'Trắng tinh – đỏ son, chuyện tình bốn chương ảnh tròn, khung “Save the Date” viên thuốc, thẻ đĩa nhạc Love Story – mở thiệp chạm vân tay.',
      op: { color: '#b3262d', paper: '#ffffff', photoIdx: 0 },
      p: {
        page: C.page, bg: C.bg, bg2: C.paper, ink: C.ink, soft: C.soft, accent: C.red, accent2: C.red, line: C.line, gold: C.red, kick: C.red,
        script: SC, title: SC, serif: PF, display: PF, sans: LO, t: {},
      },
      build: (p, ph) => {
        const map = {};
        for (const k of SLOTS) {
          const v = A51[k];
          const n = typeof v === 'number' ? v : v.n;
          map[k] = { src: ph.find((s) => s.endsWith('/' + String(n).padStart(2, '0') + '.jpg')) || ph[0], oy: typeof v === 'number' ? 50 : v.oy };
        }
        return build91(map);
      },
      // Ảnh dùng trong bố cục; ảnh đầu = ảnh bìa (Bộ sưu tập lặp lại các ảnh này cho đủ 50 vị trí)
      photos: [12, 30, 10, 3, 19, 16, 31, 33, 15, 1, 13, 7, 9, 11, 8, 34, 26, 27, 28, 35, 14, 6, 4, 32, 2, 17],
    },
  ];

  return { defs, build91, SLOTS, C };
};
