'use strict';
/**
 * Cấu hình các gói dịch vụ SOBA.
 * Chỉnh giá / giới hạn tại đây – toàn bộ website (bảng giá, kiểm tra giới hạn, thanh toán) dùng chung.
 */
const TIER_ORDER = ['free', 'basic', 'premium'];

const PLANS = {
  free: {
    key: 'free',
    name: 'Miễn phí',
    tagline: 'Trải nghiệm tạo thiệp',
    price: 0,
    originalPrice: 0,
    durationMonths: 0,
    // Số ảnh theo gói (chủ dự án chốt 18/11/2026): Free 10 · Basic 30 · Premium 60 – mẫu ảnh cũng xếp gói theo số ảnh
    limits: { cards: 1, photos: 10, views: 300, storageMonths: 6, guests: 50 },
    // Gói miễn phí: không có màn mở thiệp, không có hộp mừng cưới QR (chủ dự án chốt 16/11/2026)
    features: { watermark: true, customMusic: false, guestNames: true, gift: false, rsvp: true, wishes: false, effects: false },
  },
  basic: {
    key: 'basic',
    name: 'Basic',
    tagline: 'Đầy đủ cho ngày trọng đại',
    price: 129000,
    originalPrice: 299000,
    durationMonths: 12,
    popular: true,
    limits: { cards: 3, photos: 50, views: 10000, storageMonths: 24, guests: 500 },
    features: { watermark: false, customMusic: true, guestNames: true, gift: true, rsvp: true, wishes: true, effects: true },
  },
  premium: {
    key: 'premium',
    name: 'Premium',
    tagline: 'Trọn vẹn & không giới hạn mẫu',
    price: 249000,
    originalPrice: 599000,
    durationMonths: 12,
    limits: { cards: 10, photos: 100, views: 50000, storageMonths: 60, guests: 2000 },
    features: { watermark: false, customMusic: true, guestNames: true, gift: true, rsvp: true, wishes: true, effects: true },
  },
};

/** Hàng so sánh hiển thị trên trang bảng giá */
const COMPARE_ROWS = [
  { group: 'Giới hạn' },
  { label: 'Số thiệp có thể tạo', get: (p) => `${p.limits.cards} thiệp` },
  { label: 'Ảnh tải lên', get: (p) => `${p.limits.photos} ảnh` },
  { label: 'Lượt xem thiệp', get: (p) => (p.limits.views >= 1000 ? `${p.limits.views / 1000}K` : p.limits.views) + ' lượt' },
  { label: 'Thời hạn lưu thiệp', get: (p) => (p.limits.storageMonths >= 12 ? `${p.limits.storageMonths / 12} năm` : `${p.limits.storageMonths} tháng`) },
  { label: 'Danh sách khách mời', get: (p) => `${p.limits.guests} khách` },
  { label: 'Kho mẫu thiệp', get: (p) => ({ free: 'Mẫu miễn phí', basic: 'Miễn phí + Basic', premium: 'Toàn bộ' })[p.key] },
  { group: 'Tính năng' },
  { label: 'Tên khách mời riêng trên từng link', get: (p) => p.features.guestNames },
  { label: 'Xác nhận tham dự (RSVP)', get: (p) => p.features.rsvp },
  { label: 'Sổ lời chúc', get: (p) => p.features.wishes },
  { label: 'Hộp mừng cưới QR ngân hàng', get: (p) => p.features.gift },
  { label: 'Đếm ngược, bản đồ, album ảnh', get: () => true },
  { label: 'Hiệu ứng mở thiệp & cánh hoa rơi', get: (p) => p.features.effects },
  { label: 'Thanh tiện ích: lời chúc bay, bắn tim, hộp quà', get: (p) => p.features.effects },
  { label: 'Tải nhạc nền riêng', get: (p) => p.features.customMusic },
  { label: 'Xoá logo SOBA trên thiệp', get: (p) => !p.features.watermark },
];

const MONTH = 30 * 24 * 3600 * 1000;

/** Gói hiệu lực của người dùng (gói trả phí hết hạn => free) */
function effectivePlanKey(user) {
  if (!user) return 'free';
  if (user.plan !== 'free' && user.plan_expires_at && Number(user.plan_expires_at) < Date.now()) return 'free';
  return PLANS[user.plan] ? user.plan : 'free';
}

function planOf(user) {
  return PLANS[effectivePlanKey(user)];
}

function tierAllowed(planKey, tier) {
  return TIER_ORDER.indexOf(planKey) >= TIER_ORDER.indexOf(tier);
}

module.exports = { PLANS, TIER_ORDER, COMPARE_ROWS, MONTH, effectivePlanKey, planOf, tierAllowed };
