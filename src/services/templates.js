'use strict';
/**
 * Kho mẫu thiệp SOBA (30 mẫu thiết kế gốc).
 * Thêm mẫu mới: thêm một dòng vào RAW (key không dấu, duy nhất).
 *  thumb:    classic | photo | poster | newspaper | arch | hy   (kiểu ảnh bìa trong kho mẫu & hero thiệp)
 *  cover:    envelope | monogram | film | hy | letter | poster   (hiệu ứng mở thiệp)
 *  ornament: floral | line | hy | leaf | star
 */

// ===== Phông chữ (đều hỗ trợ tiếng Việt trên Google Fonts) =====
const FONT_SPEC = {
  'Be Vietnam Pro': { q: 'Be+Vietnam+Pro:wght@400;500;600;700', fb: 'sans-serif' },
  Montserrat: { q: 'Montserrat:wght@400;500;600;700', fb: 'sans-serif' },
  'Playfair Display': { q: 'Playfair+Display:ital,wght@0,500;0,600;0,700;1,500', fb: 'serif' },
  'Cormorant Garamond': { q: 'Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500', fb: 'serif' },
  Lora: { q: 'Lora:ital,wght@0,400;0,500;0,600;1,400;1,500', fb: 'serif' },
  Prata: { q: 'Prata', fb: 'serif' },
  Oswald: { q: 'Oswald:wght@400;500;600;700', fb: 'sans-serif' },
  'Dancing Script': { q: 'Dancing+Script:wght@500;600;700', fb: 'cursive' },
  'Great Vibes': { q: 'Great+Vibes', fb: 'cursive' },
  'Alex Brush': { q: 'Alex+Brush', fb: 'cursive' },
  Charm: { q: 'Charm:wght@400;700', fb: 'cursive' },
  'Noto Serif': { q: 'Noto+Serif:wght@700', fb: 'serif' },
};
const fontCss = (name) => `'${name}', ${(FONT_SPEC[name] || { fb: 'serif' }).fb}`;
function fontsUrl(names) {
  const qs = [...new Set(names)].filter((n) => FONT_SPEC[n]).map((n) => 'family=' + FONT_SPEC[n].q);
  return `https://fonts.googleapis.com/css2?${qs.join('&')}&display=swap`;
}

// ===== Danh mục =====
const CATEGORIES = [
  { key: 'lang-man', name: 'Lãng mạn', icon: 'heart' },
  { key: 'toi-gian', name: 'Tối giản', icon: 'sparkle' },
  { key: 'truyen-thong', name: 'Truyền thống', icon: 'gift' },
  { key: 'han-quoc', name: 'Hàn Quốc', icon: 'photo' },
  { key: 'thinh-hanh', name: 'Thịnh hành', icon: 'chart' },
  { key: 'dien-anh', name: 'Điện ảnh', icon: 'music' },
  { key: 'vintage', name: 'Vintage', icon: 'mail' },
];

// Bảng màu viết gọn: [bg, surface, ink, muted, accent, accent2, line]
const P = (bg, surface, ink, muted, accent, accent2, line) => ({ bg, surface, ink, muted, accent, accent2, line });

// [key, tên, gói, danh mục, thumb, cover, ornament, [display, heading, body], theme, tiêu đề poster, mô tả, dark?, nổi bật?]
const RAW = [
  ['hong-phan', 'Hồng Phấn', 'free', 'lang-man', 'classic', 'envelope', 'floral', ['Dancing Script', 'Playfair Display', 'Be Vietnam Pro'], P('#FFF6F8', '#FFFFFF', '#4A2533', '#8A6573', '#D04A78', '#F4B6C8', '#F1D3DC'), 'Save the date', 'Sắc hồng phấn dịu dàng, hoạ tiết hoa vẽ tay và phong bì mở thiệp.', false, true, false, true, false, true, false, true, false, true, false, true],
  ['tinh-khoi', 'Tinh Khôi', 'free', 'toi-gian', 'classic', 'monogram', 'line', ['Playfair Display', 'Playfair Display', 'Be Vietnam Pro'], P('#FFFCFB', '#FFFFFF', '#2F2328', '#7C6A70', '#B5546F', '#EFD9DE', '#EADCE0'), 'Save the date', 'Bố cục editorial thanh lịch, nhiều khoảng trắng, điểm nhấn hồng đất.'],
  ['vuon-hong', 'Vườn Hồng', 'basic', 'lang-man', 'classic', 'envelope', 'leaf', ['Dancing Script', 'Lora', 'Be Vietnam Pro'], P('#FBF7F2', '#FFFFFF', '#33402F', '#6F7A68', '#C9567A', '#B8C9A8', '#E3E6D8'), 'Garden wedding', 'Hồng đào kết hợp xanh lá sage, cảm hứng tiệc cưới ngoài trời.'],
  ['song-hy', 'Song Hỷ', 'basic', 'truyen-thong', 'hy', 'hy', 'hy', ['Playfair Display', 'Playfair Display', 'Be Vietnam Pro'], P('#FFF7F2', '#FFFFFF', '#5A1522', '#8C5A5F', '#B3203F', '#D9AE5F', '#F0D9C8'), 'Lễ thành hôn', 'Đỏ hồng và vàng kim, chữ Hỷ cách điệu – truyền thống mà hiện đại.', false, true],
  ['dem-hong', 'Đêm Hồng', 'premium', 'dien-anh', 'classic', 'film', 'star', ['Playfair Display', 'Playfair Display', 'Be Vietnam Pro'], P('#1C1220', '#271A2C', '#FBEFF4', '#C9AEBB', '#FF7EA8', '#E8C27A', '#3D2B43'), 'A love story', 'Phong cách điện ảnh trên nền tím đêm, ánh hồng phát sáng và khung phim.', true, true],
  ['thu-tay', 'Thư Tay', 'premium', 'vintage', 'classic', 'letter', 'floral', ['Dancing Script', 'Lora', 'Lora'], P('#F7EFE6', '#FFFBF5', '#4B3428', '#86705F', '#B9506B', '#E7C9A9', '#E6D5C2'), 'Gửi người thương', 'Lá thư tay trên giấy kem, dấu sáp hồng và nét chữ nghiêng hoài niệm.'],
  ['anh-dao', 'Anh Đào', 'free', 'han-quoc', 'photo', 'monogram', 'line', ['Cormorant Garamond', 'Cormorant Garamond', 'Montserrat'], P('#FFF5F6', '#FFFFFF', '#3E2A30', '#8B7177', '#D9758F', '#F9CFD8', '#F2DDE2'), 'Our wedding day', 'Phong cách Hàn Quốc nhẹ nhàng, tông hồng anh đào và chữ serif mảnh.', false, true],
  ['seoul-nang-som', 'Seoul Nắng Sớm', 'free', 'han-quoc', 'photo', 'monogram', 'line', ['Cormorant Garamond', 'Cormorant Garamond', 'Montserrat'], P('#FAF6F0', '#FFFFFF', '#3A3330', '#857A72', '#B88A6E', '#EADBC8', '#ECE3D8'), 'Wedding invitation', 'Màu kem be ấm áp như studio Hàn, bố cục ảnh lớn tinh giản.'],
  ['we-got-married', 'We Got Married', 'free', 'thinh-hanh', 'poster', 'poster', 'line', ['Oswald', 'Oswald', 'Montserrat'], P('#FFF1F3', '#FFFFFF', '#2B1218', '#7A5560', '#E0315F', '#FFC2D0', '#F6D3DB'), 'We got married', 'Poster chữ lớn đang “hot” trên TikTok, cá tính và trẻ trung.', false, true],
  ['bao-cuoi', 'Báo Cưới', 'basic', 'thinh-hanh', 'newspaper', 'poster', 'line', ['Prata', 'Prata', 'Lora'], P('#F6F1E7', '#FBF8F1', '#231F1A', '#6E665B', '#A3283F', '#D9CBB0', '#D8CCB6'), 'Báo cưới', 'Thiệp phong cách tờ báo cổ điển – “tin nóng: chúng mình cưới rồi!”.', false, true],
  ['hy-do', 'Hỷ Đỏ', 'free', 'truyen-thong', 'hy', 'hy', 'hy', ['Playfair Display', 'Playfair Display', 'Be Vietnam Pro'], P('#FFF8F0', '#FFFFFF', '#5B1010', '#8A5050', '#C8102E', '#E3B04B', '#F1DCC4'), 'Song hỷ lâm môn', 'Đỏ son và vàng kim truyền thống, phù hợp lễ cưới tại tư gia.'],
  ['vu-quy', 'Vu Quy', 'basic', 'truyen-thong', 'hy', 'hy', 'hy', ['Charm', 'Playfair Display', 'Be Vietnam Pro'], P('#FFF6F5', '#FFFFFF', '#5C1F2B', '#8F6168', '#C73E5A', '#E6BC72', '#F3DADA'), 'Lễ vu quy', 'Hồng son pha vàng, dành riêng cho lễ vu quy nhà gái.'],
  ['tan-hon', 'Tân Hôn', 'premium', 'truyen-thong', 'hy', 'hy', 'hy', ['Playfair Display', 'Playfair Display', 'Be Vietnam Pro'], P('#3A0A12', '#4A1018', '#FCEFD9', '#E0C49A', '#E9B65C', '#B3243A', '#5C1A24'), 'Lễ tân hôn', 'Đỏ nhung trầm và ánh kim sang trọng cho lễ tân hôn nhà trai.', true],
  ['mau-don', 'Mẫu Đơn', 'basic', 'truyen-thong', 'arch', 'envelope', 'floral', ['Great Vibes', 'Prata', 'Be Vietnam Pro'], P('#FFF7F7', '#FFFFFF', '#4D1F2A', '#8A646C', '#C2405F', '#F2C6CF', '#F2DADF'), 'Hoa mẫu đơn', 'Hoa mẫu đơn phú quý trong khung vòm, giao thoa Á Đông và hiện đại.'],
  ['trang-tinh', 'Trắng Tinh', 'free', 'toi-gian', 'classic', 'monogram', 'line', ['Cormorant Garamond', 'Cormorant Garamond', 'Montserrat'], P('#FFFFFF', '#FAFAFA', '#1F1B1C', '#6E6869', '#1F1B1C', '#E9E4E5', '#E8E3E4'), 'The wedding of', 'Trắng – đen tối giản tuyệt đối, sang trọng kiểu tạp chí.'],
  ['be-sua', 'Be Sữa', 'free', 'toi-gian', 'arch', 'monogram', 'line', ['Great Vibes', 'Cormorant Garamond', 'Montserrat'], P('#F8F3EC', '#FFFDF9', '#43382F', '#877A6E', '#A7826A', '#E5D6C4', '#E8DFD3'), 'Save our date', 'Tông be sữa ấm, khung vòm mềm mại, hợp ảnh cưới tone nâu.'],
  ['xanh-sage', 'Xanh Sage', 'basic', 'lang-man', 'arch', 'envelope', 'leaf', ['Great Vibes', 'Lora', 'Be Vietnam Pro'], P('#F4F6EF', '#FFFFFF', '#2F3A2B', '#6C7867', '#7F9A6C', '#F2C2CF', '#DDE4D3'), 'Garden of love', 'Xanh sage dịu mắt điểm hoa hồng phấn, phong cách greenery.'],
  ['oai-huong', 'Oải Hương', 'basic', 'lang-man', 'classic', 'envelope', 'floral', ['Great Vibes', 'Playfair Display', 'Be Vietnam Pro'], P('#F8F5FC', '#FFFFFF', '#33294A', '#76698E', '#8E6CC0', '#E2D5F2', '#E6DEF0'), 'Lavender love', 'Tím oải hương mơ màng như cánh đồng Provence.'],
  ['hoang-hon', 'Hoàng Hôn', 'premium', 'dien-anh', 'photo', 'film', 'star', ['Great Vibes', 'Playfair Display', 'Montserrat'], P('#FFF4EE', '#FFFFFF', '#40211C', '#8A6158', '#E0624F', '#FFC9A8', '#F6DACE'), 'Golden hour', 'Ánh hoàng hôn cam hồng, cảm giác thước phim tình yêu lúc chiều tà.'],
  ['dem-sao', 'Đêm Sao', 'premium', 'dien-anh', 'poster', 'film', 'star', ['Cormorant Garamond', 'Cormorant Garamond', 'Montserrat'], P('#101828', '#18233A', '#F4EFE4', '#B9B3A6', '#E7C27D', '#7B8DB8', '#2A3650'), 'Under the stars', 'Xanh đêm và vàng ánh sao – lãng mạn, huyền ảo.', true],
  ['phim-nhua', 'Phim Nhựa', 'basic', 'vintage', 'photo', 'film', 'line', ['Oswald', 'Lora', 'Montserrat'], P('#F3EEE6', '#FBF8F2', '#2A2522', '#756C64', '#C4572D', '#E9C77B', '#DED4C6'), 'Love on film', 'Cảm hứng cuộn phim 35mm, màu ấm hoài niệm.'],
  ['polaroid', 'Polaroid', 'free', 'thinh-hanh', 'photo', 'letter', 'line', ['Charm', 'Lora', 'Be Vietnam Pro'], P('#FAF7F2', '#FFFFFF', '#30292A', '#7C7273', '#D25C7C', '#F5D3DC', '#EAE2DA'), 'Hai đứa mình', 'Khung ảnh polaroid và chữ viết tay – trẻ trung, gần gũi.'],
  ['la-thu-xanh', 'Lá Thư Xanh', 'premium', 'vintage', 'classic', 'letter', 'floral', ['Great Vibes', 'Lora', 'Lora'], P('#EEF2F5', '#FAFCFD', '#26313B', '#66737F', '#4F6D8A', '#C9D6E2', '#D7E0E7'), 'With love', 'Xanh xám bụi thanh lịch, lá thư và dấu sáp xanh.'],
  ['nang-ha', 'Nắng Hạ', 'free', 'lang-man', 'photo', 'envelope', 'leaf', ['Dancing Script', 'Lora', 'Be Vietnam Pro'], P('#FFF7EF', '#FFFFFF', '#4A2E22', '#8C6E60', '#EA7A62', '#FFD6BF', '#F5E1D3'), 'Summer love', 'Màu đào mùa hạ tươi tắn, hợp tiệc cưới ngoài trời.'],
  ['bien-xanh', 'Biển Xanh', 'basic', 'lang-man', 'poster', 'envelope', 'line', ['Great Vibes', 'Playfair Display', 'Montserrat'], P('#F1F7FA', '#FFFFFF', '#1E3442', '#5E7684', '#2F7EA6', '#BFE0EE', '#D6E8F0'), 'Beach wedding', 'Xanh biển trong trẻo cho đám cưới miền biển.'],
  ['do-ruou', 'Đỏ Rượu', 'premium', 'dien-anh', 'classic', 'monogram', 'star', ['Playfair Display', 'Playfair Display', 'Montserrat'], P('#2A0E14', '#36131B', '#F8E9EC', '#CFA9B1', '#E38AA0', '#C9A15C', '#4A1E27'), 'Forever & always', 'Đỏ rượu vang quyến rũ, ánh kim sang trọng.', true],
  ['champagne', 'Champagne', 'premium', 'toi-gian', 'arch', 'monogram', 'line', ['Great Vibes', 'Cormorant Garamond', 'Montserrat'], P('#FBF7EF', '#FFFFFF', '#3B3226', '#857761', '#B8955A', '#EADBB9', '#EBE1CC'), 'Celebrate love', 'Vàng champagne nhã nhặn, khung vòm cao cấp.'],
  ['cinema-love', 'Cinema Love', 'premium', 'dien-anh', 'poster', 'film', 'star', ['Oswald', 'Playfair Display', 'Montserrat'], P('#141012', '#1F191C', '#F7F0F1', '#B8A9AD', '#F0455F', '#F7C948', '#332A2E'), 'Now showing', 'Poster phim chiếu rạp – “Sắp công chiếu: Đám cưới của chúng mình”.', true],
  ['tiem-hoa', 'Tiệm Hoa', 'basic', 'vintage', 'arch', 'letter', 'floral', ['Charm', 'Prata', 'Lora'], P('#FBF4EE', '#FFFDFA', '#4A2C2A', '#8B6D69', '#C7586E', '#F3CDBF', '#EEDDD3'), 'Flower shop', 'Ấm áp như tiệm hoa nhỏ ở góc phố, sắc hồng đất và kem.'],
  ['ngot-ngao', 'Ngọt Ngào', 'free', 'thinh-hanh', 'poster', 'envelope', 'floral', ['Dancing Script', 'Oswald', 'Be Vietnam Pro'], P('#FFF0F5', '#FFFFFF', '#4A1830', '#9A5F7A', '#F0538A', '#FFC4DA', '#FFD9E7'), 'Save the date', 'Hồng kẹo ngọt ngào, chữ lớn vui tươi cho cặp đôi Gen Z.'],
];

// Thứ tự hàng "SOBA tuyển chọn" trên trang chủ
const FEATURED = ['anh-dao', 'hong-phan', 'ngot-ngao', 'nang-ha', 'polaroid', 'we-got-married', 'champagne', 'song-hy', 'xanh-sage', 'hoang-hon'];

const TEMPLATES = RAW.map(([key, name, tier, category, thumb, cover, ornament, f, theme, title, description, dark]) => ({
  key,
  name,
  tier,
  category,
  thumb,
  cover,
  ornament,
  title,
  description,
  dark: Boolean(dark),
  featured: FEATURED.includes(key),
  tags: [CATEGORIES.find((c) => c.key === category).name],
  fontNames: { display: f[0], heading: f[1], body: f[2] },
  fonts: { display: fontCss(f[0]), heading: fontCss(f[1]), body: fontCss(f[2]) },
  fontsUrl: fontsUrl([f[0], f[1], f[2], 'Noto Serif']),
  theme,
}));

const byKey = Object.fromEntries(TEMPLATES.map((t) => [t.key, t]));
const ALL_FONTS_URL = fontsUrl(Object.keys(FONT_SPEC).filter((n) => n !== 'Noto Serif'));

function getTemplate(key) {
  return byKey[key] || TEMPLATES[0];
}

const TIER_LABEL = { free: 'Miễn phí', basic: 'Basic', premium: 'Premium' };

module.exports = { FEATURED, TEMPLATES, CATEGORIES, getTemplate, TIER_LABEL, ALL_FONTS_URL, FONT_SPEC, fontCss, fontsUrl, exists: (k) => Boolean(byKey[k]) };
