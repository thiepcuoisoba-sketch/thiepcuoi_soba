'use strict';
/**
 * Tạo / cập nhật thiệp LỄ VU QUY của chủ dự án (Lan Nhi & Huy Hoàng, 06/12/2026) từ thiệp HTML `thiep_cuoi_moi`,
 * dựng bằng bố cục "Thiệp 91" (src/services/canvas-starters-d.js) với tên cô dâu đứng trước.
 *
 *   node scripts/tao-thiep-vu-quy.js email@chu-thiep.com
 *
 * Chạy lại được: thiệp slug `lan-nhi-huy-hoang` được ghi đè nội dung (giữ lượt xem, lời chúc, RSVP).
 * Ảnh đã nén sẵn ở public/img/khach/lan-nhi-huy-hoang/. Số tài khoản mừng cưới để trống –
 * chủ thiệp tự nhập trong trình thiết kế (ảnh QR riêng qr.png đã gắn sẵn).
 */
const db = require('../src/db');
const { migrate } = require('../src/migrations');
const canvas = require('../src/services/canvas');
const { SET_D } = require('../src/services/canvas-starters');

const SLUG = 'lan-nhi-huy-hoang';
const DIR = '/img/khach/lan-nhi-huy-hoang/';
const p = (f, oy) => ({ src: DIR + f + '.jpg', oy: oy == null ? 50 : oy });

// Ảnh đặt đúng vị trí như bản HTML gốc (cùng bố cục với thiệp 91)
const PH = {
  hero: p('hle03423', 18), pill: p('hle03545', 20), groom: p('groom'), bride: p('bride'), meet: p('dsc04022', 30), love: p('hle03939', 25),
  ls1: p('ls1'), ls2: p('ls2'), ls3: p('ls3'), ls4: p('ls4'), tall: p('dsc04051', 30), st1: p('hle03185'), st2: p('dsc04186'), st3: p('hle02652', 62),
  ca: p('dsc04143', 30), cb: p('dsc04153', 25), cc: p('dsc04216', 58), g1: p('hle03652'), g2: p('hle03675'), g3: p('hle03698'), g4: p('hle03704'),
  rw: p('hle03490', 30), rs2: p('dsc04463', 20), rs: p('hle03523', 15), letter: p('hle02736', 40), p1: p('dsc04424', 20), p2: p('hle03942'), disc: p('hle03851'),
  wide: p('dsc03982', 35), venue: p('hle02797', 55), end: p('hle02841', 40), mini: p('hle02664', 70),
};

const TEXT = {
  brideFirst: true,
  ceremony: 'vu quy',
  ceremonyTitle: 'Lễ Vu Quy',
  groomFull: 'Vũ Huy Hoàng',
  brideFull: 'Ngô Thị Lan Nhi',
  place: 'Trống Đồng Palace · Hà Đông, Hà Nội',
  story: [
    ['Gặp gỡ', 'Chúng mình bắt đầu những năm tháng thanh xuân cùng nhau với tư cách những người bạn đại học.'],
    ['Rung động', 'Từ những câu chuyện trên cung đường dài Hà Giang đến những rung động đầu tiên mùa đông 2024.'],
    ['Đồng hành', 'Hai năm yêu thương và từng bước trở thành một phần không thể thiếu trong cuộc sống của nhau.'],
    ['Trọn đời', 'Và hôm nay, chúng mình quyết định cùng nhau viết tiếp câu chuyện ấy bằng một lời hứa trọn đời.'],
  ],
  address: 'Trống Đồng Palace, TTTM Mê Linh Plaza, Hà Đông, Hà Nội',
  addressLines: 'Trống Đồng Palace\nTTTM Mê Linh Plaza, Hà Đông\nHà Nội, Việt Nam',
  schedule: [
    ['10:30', 'Đón Khách', 'Đón tiếp quan viên hai họ, bạn bè và chụp ảnh lưu niệm.'],
    ['11:00', 'Lễ Vu Quy', 'Cử hành nghi thức vu quy thiêng liêng, trao nhẫn cưới và lời hẹn ước bên nhau.'],
    ['Sau lễ', 'Khai Tiệc Mừng', 'Cùng nâng ly chúc phúc, thưởng thức tiệc cưới ấm cúng và giao lưu âm nhạc.'],
  ],
  song: 'Love Story · Piano',
  foot: '2026.12.06 · Hà Nội',
  mapQuery: '20.9639657,105.7713343',
  mapLink: 'https://maps.app.goo.gl/EgFx88ZbogfC6rDo9',
  // Mừng cưới cô dâu: ảnh qr.png của bản HTML (MSB), hiện sẵn
  giftStyle: 'cards',
  gift: { bride: { bin: '970426', accountNo: '', accountName: 'NGO THI LAN NHI', qrImg: DIR + 'qr.png' } },
};

(async () => {
  const email = String(process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Cách dùng: node scripts/tao-thiep-vu-quy.js email@chu-thiep.com');
    process.exit(1);
  }
  await migrate({ log: () => {} });
  const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) {
    console.error('Không tìm thấy tài khoản ' + email + ' – hãy đăng ký trước.');
    process.exit(1);
  }
  const doc = canvas.sanitizeDoc({
    groom: { name: 'Huy Hoàng' },
    bride: { name: 'Lan Nhi' },
    brideFirst: true,
    date: '2026-12-06',
    time: '10:30',
    pageBg: SET_D.C.page,
    music: { url: canvas.songUrl('nhac-cuoi-nhe-nhang'), autoplay: true },
    effects: { petals: true, toolbar: true, fall: 'petals', autoscroll: true, autostart: true },
    opener: { style: 'fingerprint', color: SET_D.C.red, paper: '#ffffff', font: 'Great Vibes', photo: PH.hero.src },
    sections: SET_D.build91(PH, TEXT),
  });
  const title = 'Lễ vu quy Lan Nhi & Huy Hoàng';
  const now = Date.now();
  const old = await db.get('SELECT id FROM cards WHERE slug = ?', [SLUG]);
  if (old) {
    await db.run("UPDATE cards SET user_id = ?, title = ?, data = ?, status = 'published', kind = 'canvas', updated_at = ?, published_at = COALESCE(published_at, ?) WHERE id = ?", [user.id, title, JSON.stringify(doc), now, now, old.id]);
    console.log('Đã cập nhật thiệp /t/' + SLUG + ' (id ' + old.id + ')');
  } else {
    await db.run(
      "INSERT INTO cards (user_id, slug, template, title, data, status, views, is_showcase, created_at, updated_at, published_at, kind) VALUES (?, ?, ?, ?, ?, 'published', 0, 0, ?, ?, ?, 'canvas')",
      [user.id, SLUG, 'love-story-do-son', title, JSON.stringify(doc), now, now, now]
    );
    console.log('Đã tạo thiệp /t/' + SLUG);
  }
  process.exit(0);
})();
