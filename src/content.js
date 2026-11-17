'use strict';
/** Nội dung tĩnh của website – chỉnh sửa văn bản tại đây */

const FEATURES = [
  { icon: 'palette', title: 'Kho mẫu tinh tế', text: 'Những mẫu thiệp được thiết kế riêng, đổi màu, phông chữ và bố cục chỉ với vài cú chạm.' },
  { icon: 'user-heart', title: 'Tên khách mời riêng', text: 'Mỗi khách nhận một đường link mang tên riêng: “Trân trọng kính mời anh Huy”.' },
  { icon: 'check-circle', title: 'Xác nhận tham dự', text: 'Khách bấm xác nhận, bạn biết chính xác số người để đặt bàn – xuất file Excel trong 1 giây.' },
  { icon: 'qr', title: 'Hộp mừng cưới QR', text: 'Gắn mã VietQR của cô dâu, chú rể. Khách mừng cưới từ xa, tiền vào thẳng tài khoản của bạn.' },
  { icon: 'map', title: 'Bản đồ chỉ đường', text: 'Nhúng bản đồ Google Maps cho từng sự kiện để khách không bao giờ đi lạc.' },
  { icon: 'music', title: 'Nhạc nền & hiệu ứng', text: 'Mở thiệp bằng phong bì, cánh hoa rơi nhẹ cùng bản nhạc của riêng hai bạn.' },
  { icon: 'chat-heart', title: 'Sổ lời chúc', text: 'Lưu giữ mọi lời chúc phúc của người thân, bạn bè như một cuốn album kỷ niệm.' },
  { icon: 'photo', title: 'Album ảnh cưới', text: 'Khoe trọn bộ ảnh cưới với album đẹp mắt, xem mượt trên mọi điện thoại.' },
];

const STEPS = [
  { title: 'Chọn mẫu thiệp', text: 'Lựa một mẫu bạn yêu thích trong kho mẫu SOBA, xem trước trước khi dùng.' },
  { title: 'Điền thông tin', text: 'Nhập tên, ngày cưới, địa điểm, tải ảnh – thiệp cập nhật ngay bên cạnh.' },
  { title: 'Gửi cho khách mời', text: 'Chia sẻ đường link qua Zalo, Messenger. Theo dõi phản hồi theo thời gian thực.' },
];

const PAINS = [
  { title: 'Mất nhiều thời gian', text: 'để in ấn và trao tận tay hàng trăm tấm thiệp giấy.' },
  { title: 'Gửi ảnh chụp thiếu trang trọng', text: 'khi mời bạn bè ở xa qua tin nhắn.' },
  { title: 'Không biết chính xác số khách', text: 'để đặt bàn tiệc – thừa thì lãng phí, thiếu thì ngại.' },
];

/**
 * Cảm nhận khách hàng THẬT – mục này tự ẩn khi mảng rỗng.
 * Ví dụ: { name: 'Hoàng & Vy', place: 'Hà Nội', text: 'Nội dung khách gửi...' }
 */
const TESTIMONIALS = [];

const FAQ = [
  { q: 'SOBA là gì?', a: 'SOBA là nền tảng tạo thiệp cưới online: bạn chọn mẫu, điền thông tin và gửi cho khách mời bằng một đường link – không cần in ấn, không cần biết thiết kế.' },
  { q: 'Tạo thiệp trên SOBA có miễn phí không?', a: 'Có. Gói Miễn phí cho phép bạn tạo 1 thiệp với đầy đủ tính năng cơ bản. Khi cần thêm mẫu cao cấp, nhiều ảnh và lượt xem hơn, bạn có thể nâng cấp lên Basic hoặc Premium.' },
  { q: 'Khách mời có cần cài ứng dụng hay đăng nhập không?', a: 'Không. Khách chỉ cần bấm vào đường link là xem được thiệp trên mọi điện thoại, máy tính bảng hay máy tính.' },
  { q: 'Tôi có thể ghi tên riêng cho từng khách không?', a: 'Có. Trong mục Khách mời, bạn thêm danh sách tên và SOBA tạo đường link riêng cho từng người, thiệp sẽ hiển thị “Trân trọng kính mời + tên khách”.' },
  { q: 'Tiền mừng cưới qua QR có đi qua SOBA không?', a: 'Không. Mã QR được tạo theo chuẩn VietQR từ số tài khoản bạn cung cấp; khách chuyển khoản trực tiếp vào tài khoản của cô dâu, chú rể. SOBA không giữ hay trung gian bất kỳ khoản tiền nào.' },
  { q: 'Thanh toán gói dịch vụ như thế nào?', a: 'Bạn quét mã VietQR bằng ứng dụng ngân hàng bất kỳ. Hệ thống tự động xác nhận giao dịch và kích hoạt gói trong khoảng 1 phút, không cần chờ duyệt.' },
  { q: 'Thiệp của tôi được lưu trong bao lâu?', a: 'Tùy gói: 6 tháng với gói Miễn phí, 2 năm với Basic và 5 năm với Premium – đủ để bạn xem lại kỷ niệm bất cứ lúc nào.' },
  { q: 'Tôi có sửa được thiệp sau khi đã gửi không?', a: 'Được. Mọi thay đổi được cập nhật ngay trên cùng đường link, khách mời luôn thấy phiên bản mới nhất.' },
];

const ARTICLES = [
  {
    slug: 'thiep-cuoi-online-la-gi',
    title: 'Thiệp cưới online là gì? 7 lý do các cặp đôi hiện đại lựa chọn',
    category: 'Kiến thức',
    minutes: 5,
    excerpt: 'Thiệp cưới online không chỉ tiết kiệm chi phí mà còn giúp bạn quản lý khách mời, nhận lời chúc và mừng cưới dễ dàng hơn.',
    body: [
      ['p', 'Thiệp cưới online là một trang web nhỏ dành riêng cho đám cưới của bạn, được gửi tới khách mời qua một đường link. Thay vì tấm thiệp giấy, khách nhận được lời mời sống động với ảnh cưới, nhạc nền, bản đồ và nút xác nhận tham dự.'],
      ['h2', '1. Tiết kiệm chi phí và thời gian'],
      ['p', 'Bạn không cần in ấn, không cần đi trao thiệp cho từng nhà. Một đường link có thể gửi cho hàng trăm khách chỉ trong vài phút.'],
      ['h2', '2. Biết chính xác số khách tham dự'],
      ['p', 'Tính năng RSVP giúp khách xác nhận có đến hay không, đi mấy người. Bạn có số liệu chính xác để đặt bàn với nhà hàng.'],
      ['h2', '3. Mời khách ở xa một cách trang trọng'],
      ['p', 'Với bạn bè ở nước ngoài hay tỉnh khác, thiệp online trang trọng hơn nhiều so với một bức ảnh chụp thiệp giấy.'],
      ['h2', '4. Lưu giữ kỷ niệm'],
      ['p', 'Sổ lời chúc và album ảnh được lưu lại, trở thành món quà kỷ niệm mà hai bạn có thể mở xem bất cứ lúc nào.'],
    ],
  },
  {
    slug: 'rsvp-thiep-cuoi-online',
    title: 'RSVP trên thiệp cưới online: chốt số khách trước khi đặt bàn',
    category: 'Kinh nghiệm',
    minutes: 6,
    excerpt: 'Cách dùng tính năng xác nhận tham dự để dự trù số bàn tiệc chính xác, tránh lãng phí và tình huống thiếu chỗ.',
    body: [
      ['p', 'RSVP (Répondez s’il vous plaît) nghĩa là “xin vui lòng phản hồi”. Trên thiệp cưới online, đây là biểu mẫu nhỏ để khách cho bạn biết họ có tham dự hay không.'],
      ['h2', 'Đặt hạn phản hồi hợp lý'],
      ['p', 'Nên đặt hạn trước ngày cưới 10–14 ngày, vừa đủ để bạn chốt số bàn với nhà hàng.'],
      ['h2', 'Gửi link có tên riêng'],
      ['p', 'Khi mỗi khách nhận đường link có tên riêng, tỉ lệ phản hồi tăng rõ rệt vì khách cảm thấy được mời trân trọng.'],
      ['h2', 'Nhắc khéo những người chưa trả lời'],
      ['p', 'Xem danh sách phản hồi trong trang quản lý, đối chiếu với danh sách khách mời và nhắn tin nhắc nhẹ những người chưa xác nhận.'],
    ],
  },
  {
    slug: 'cach-gui-thiep-cuoi-qua-zalo',
    title: 'Cách gửi thiệp cưới online qua Zalo, Messenger trang trọng nhất',
    category: 'Hướng dẫn',
    minutes: 4,
    excerpt: 'Vài mẹo nhỏ giúp lời mời qua tin nhắn của bạn vẫn lịch sự, ấm áp và được khách mời trân trọng.',
    body: [
      ['p', 'Gửi thiệp qua tin nhắn là cách nhanh nhất, nhưng để giữ sự trang trọng, bạn nên chuẩn bị một lời nhắn ngắn đi kèm.'],
      ['h2', 'Mẫu lời nhắn gợi ý'],
      ['p', '“Chào anh/chị, em xin gửi thiệp mời đám cưới của vợ chồng em vào ngày … Rất mong anh/chị dành chút thời gian chung vui cùng gia đình ạ.”'],
      ['h2', 'Gửi riêng từng người'],
      ['p', 'Hạn chế gửi vào nhóm chung. Dùng link có tên riêng của SOBA và gửi trực tiếp cho từng khách sẽ trọn vẹn hơn.'],
      ['h2', 'Gọi điện với người lớn tuổi'],
      ['p', 'Với ông bà, cô chú, hãy gọi điện hoặc mời trực tiếp, sau đó gửi link để họ tiện xem địa chỉ và bản đồ.'],
    ],
  },
];

module.exports = { FEATURES, STEPS, PAINS, TESTIMONIALS, FAQ, ARTICLES };
