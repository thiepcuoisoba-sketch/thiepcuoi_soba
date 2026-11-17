# HANDOFF – SOBA (bàn giao để tiếp tục trên máy khác)

> Cập nhật: 16/11/2026. Không chứa mật khẩu, API key hay thông tin bí mật.

## 1. Mục tiêu dự án

**SOBA** là nền tảng SaaS tạo **thiệp cưới online** cho thị trường Việt Nam (tham khảo ZenLove, CineLove, Hunbei, Hotwedding, TheDays).
Khách đăng ký → chọn mẫu → tự chỉnh thiệp (form + xem trước trực tiếp) → gửi link có tên riêng từng khách → nhận xác nhận tham dự, lời chúc, mừng cưới QR. Có gói trả phí, thanh toán chuyển khoản VietQR tự kích hoạt qua webhook SePay.

- Stack: **Node.js (≥20) · Express 5 · EJS (render server, SEO) · MySQL (production) / SQLite có sẵn trong Node (dev)**.
- Deploy dự kiến: **GitHub → Hostinger Business/Cloud “Node.js Web App” + MySQL**.
- Giao diện hiện tại: **tông hồng nhạt + be trắng**, bố cục thẻ ảnh lớn kiểu TheDays, nét dễ thương kiểu Hunbei.

## 2. Chức năng đã hoàn thành (đã chạy thử trên trình duyệt)

**Website công khai**
- Trang chủ `/` (layout `explore`): hero nền khảm ảnh mẫu + 3 thiệp ảnh xếp quạt, bong bóng danh mục, hàng “Mẫu thiết kế phổ biến” (31 mẫu ảnh, mẫu `featured` đứng đầu), 4 lối tắt, các hàng mẫu cuộn ngang, 3 bước, danh sách tiện ích, CTA.
- Kho mẫu `/mau-thiep`: lọc danh mục (`?dm=`), gói (`?goi=`), tìm kiếm không dấu (`?q=`), mẫu đã lưu (`?luu=1`, localStorage).
- Popup xem trước (iframe `/demo/:key`), lưu mẫu bằng nút tim, đếm số mẫu đã lưu trên header.
- Trang: `/gioi-thieu` (landing cũ), `/mau-thiep/:key`, `/bang-gia`, `/tinh-nang`, `/huong-dan`, `/cam-nang(/:slug)`, `/cau-hoi-thuong-gap`, `/lien-he` (lưu DB), `/thiep-khach-hang`, `/dieu-khoan`, `/chinh-sach-bao-mat`, `sitemap.xml`, `robots.txt`.
- Header/footer dùng chung (`partials/hw-header.ejs`, `hw-footer.ejs`), menu ngăn kéo + thanh điều hướng dưới đáy trên điện thoại, nút Zalo/hotline nổi.
- Responsive đã kiểm tra không tràn ngang ở 320 / 375 / 820 / 1366–1440px.

**Kho 30 mẫu thiệp gốc** (`src/services/templates.js`): 11 miễn phí, 10 Basic, 9 Premium; 6 kiểu thumbnail (classic, photo, poster, newspaper, arch, hy), 6 kiểu bìa mở thiệp (envelope, monogram, film, hy, letter, poster); font nạp theo từng mẫu. Hình cô dâu chú rể là vector tự vẽ (`partials/couple.ejs`) – **không** dùng ảnh/thiết kế của site khác.

**Trang thiệp khách xem** `/t/:slug?to=Tên`: bìa mở thiệp, tên khách riêng, đếm ngược, lịch tháng, cô dâu chú rể, chuyện tình, sự kiện + Google Maps, album + lightbox, RSVP, sổ lời chúc, hộp mừng cưới VietQR (copy STK), nhạc nền, cánh hoa rơi, điều hướng nhanh. Đếm lượt xem, khoá thiệp khi hết lượt xem/hết hạn lưu trữ.

**Tài khoản & bảng điều khiển**
- Đăng ký/đăng nhập email, quên/đặt lại mật khẩu (SMTP; chưa cấu hình thì in link ra log), Google & Facebook (tự ẩn nút nếu thiếu key).
- `/tai-khoan`: danh sách thiệp, thống kê, nhân bản/xoá; `/thiep/tao` chọn mẫu (khoá theo gói).
- Trình chỉnh sửa `/thiep/:id/sua`: tự lưu, xem trước iframe, đổi mẫu/màu nhấn, tải ảnh bìa/cô dâu/chú rể/album, sự kiện, chuyện tình, ngân hàng mừng cưới, nhạc (Basic+), bật/tắt từng mục, xuất bản/ẩn (slug tạo lại theo tên thật ở lần xuất bản đầu).
- `/thiep/:id/khach-moi`: tạo link tên riêng hàng loạt, xem RSVP, xuất CSV (UTF-8 BOM, chống CSV injection), ẩn/hiện lời chúc.
- Thanh toán `/nang-cap?goi=basic|premium`: VietQR + tự kiểm tra trạng thái; webhook `POST /api/webhooks/sepay` (API key, chống xử lý trùng, kiểm tra số tiền).
- Quản trị `/quan-tri`: tổng quan doanh thu, người dùng (đổi gói/quyền), đơn hàng (xác nhận/huỷ thủ công, log webhook), thiệp (đặt nổi bật), liên hệ.

**Trình thiết kế tự do – kéo thả** (thêm 13/11/2026, tham khảo *luồng thao tác* editor CineLove, giao diện & code tự viết)
- Cột `cards.kind` (`form` | `canvas`, migration `002_card_kind`). Thiệp canvas lưu JSON trong `cards.data`: nhiều trang xếp dọc (rộng thiết kế 420px), mỗi trang có các phần tử đặt tự do.
- Tạo: `/thiep/tao` → mục “Thiết kế tự do” (17 mẫu ảnh thật xếp trước + 3 mẫu ảnh giữ chỗ `do-ruou-vang`, `kem-anh-kim`, `hong-pastel` + thiệp trống) → `POST /thiep/tao-thiet-ke` → editor `/thiep/:id/thiet-ke` (`/sua` tự chuyển hướng). Demo mẫu: `/demo-thiet-ke/:key`.
- Editor (`views/dashboard/designer.ejs`, `public/js/designer.js`, `css/designer.css`): kéo thả, đổi cỡ (góc giữ tỉ lệ, chữ tự co theo), xoay, căn dóng (guide), khoá, lớp trên/dưới, nhân bản, Ctrl+Z/Y/C/V/D, phím mũi tên; nhấp đúp sửa chữ trực tiếp; chữ tự động `{ten_khach} {chu_re} {co_dau} {ngay} {gio} {thu}`; ảnh: tải lên (tự nén ≤2000px), thư viện ảnh của thiệp, cắt/phóng/kéo vị trí, khung vuông/tròn/vòm, viền, bộ lọc; hình dạng; tiện ích: đếm ngược, lịch, bản đồ, RSVP, lời chúc, mừng cưới QR, album, nút gọi; nền trang (màu/ảnh), nhạc nền, thêm/xếp/nhân bản/xoá trang, đổi chiều cao trang; “Thay ảnh nhanh”; hiệu ứng xuất hiện; tự lưu `POST /api/thiep/:id/thiet-ke`; xuất bản + popup chia sẻ. Điện thoại: thanh công cụ dưới đáy, bảng dạng ngăn kéo.
- **17 mẫu thiết kế tự do có ảnh thật** (`src/services/canvas-starters.js`, ảnh nén ≤1400px trong `public/img/mau/a1…a17`, nguồn gốc `D:\Claude_1\anh_thiep_mau` – chủ dự án xác nhận đã thoả thuận quyền dùng ảnh). Mỗi mẫu ghép từ thư viện bố cục: bìa (tạp chí, phong bì, khung vòm, dải phim, báo cưới, chữ Hỷ, poster, ảnh trên – chữ dưới, lịch kẹp giấy, polaroid, ảnh tràn viền), lời mời, cô dâu chú rể, ngày giờ (ngày lớn / lịch), album (lưới, collage, polaroid, thước phim), trích dẫn, RSVP + lời chúc + mừng cưới, cảm ơn. Gói: 7 free, 6 Basic, 4 Premium (khoá ở trang chọn mẫu và khi tạo).
- **Trang chủ** (`views/explore/home.ejs`): hero có nền khảm ảnh bìa các mẫu ảnh (lớp phủ kem hồng), 3 thiệp ảnh xếp quạt; hàng “Mẫu thiết kế phổ biến” (17 mẫu ảnh) ngay dưới danh mục. Popup xem trước (`public/js/explore.js`) nhận mã `cv:<key>` → iframe `/demo-thiet-ke/<key>`, nút “Dùng mẫu này” gửi tới `/thiep/tao-thiet-ke`.
- **Nhạc nền giai điệu gốc** (`public/js/soba-music.js`): 7 giai điệu do SOBA tự soạn, phát bằng Web Audio (không dùng file, không vướng bản quyền). Lưu dạng `music.url = 'builtin:<key>'`; bảng Âm nhạc trong editor có nghe thử. Mỗi mẫu được gắn sẵn một giai điệu.
- Hình dạng mới: tam giác (`tri`), nền chuyển dần (`grad`), đổ bóng; chữ tự động thêm `{ngay_so} {thang} {nam}`.
- **Cập nhật 16/11/2026** (tham khảo cách làm của Hunbei/CineLove và mẫu `D:\Claude_1\thiep_cuoi_91_premium` của SOBA; giao diện & code tự viết):
  - **Giá mới**: Basic 129.000đ, Premium 249.000đ (giá gạch 299k/599k giữ nguyên). Gói Free **không có** hộp mừng cưới QR (`features.gift = false`), màn mở thiệp hay thanh tiện ích nổi.
  - **4 kiểu mở thiệp** cho thiệp canvas (`doc.opener.style`): phong bì dấu sáp, chạm vân tay – rèm mở, cửa hai cánh chữ Hỷ, lật bìa có ảnh. Có tên khách riêng trên màn mở; nhạc phát ngay khi khách chạm mở. Editor: bảng **Thông tin → Mở thiệp & tiện ích** (kiểu, màu chính, màu nền, phông tên, bật/tắt thanh tiện ích).
  - **Thanh tiện ích nổi** (`doc.effects.toolbar`): nút RSVP (cuộn tới form), “Gửi lời chúc…” (bảng trượt có câu chúc gợi ý, gửi qua API lời chúc cũ), **lời chúc bay** (bong bóng), **bắn tim**, **hộp mừng cưới QR** (bảng trượt, sao chép STK), **thả tim** (đếm trên máy khách).
  - **QR ảo** `/img/qr-mau.svg` (tự vẽ, không quét được, ghi “QR MẪU”) + STK minh hoạ hiện trong mọi bản demo mẫu trả phí.
  - Demo `/demo-thiet-ke/:key` dùng **đúng gói của mẫu** (mẫu Free → không mở thiệp/QR/thanh tiện ích, có logo SOBA).
  - **14 mẫu ảnh mới** a18–a31: Hanok Tinh Khôi, Ánh Sáng Studio, Mùa Yêu Đen Trắng, Lụa Trắng Thanh Lịch, Hoa Hồng Đỏ, Nắng Trắng Tháng Năm, Hoa Trắng Tinh Khôi, Sắc Màu Thành Phố, Lễ Cưới Trên Đồi, Đêm Thành Phố, Đồng Hoa Mùa Hạ, Hanbok Xuân Thì, Khung Cửa Vòm, Lâu Đài Ánh Nến (3 Free · 6 Basic · 5 Premium). Ảnh bìa luôn có đủ cô dâu chú rể. Tổng: 31 mẫu ảnh (9 Free · 13 Basic · 9 Premium); 11 mẫu trả phí cũ cũng được gắn kiểu mở thiệp.
  - Bố cục mới: bìa `hero` (ảnh lớn + thẻ Save the Date bo tròn), `datebig`, `frame`; trang `secStory` (Love Story 4 chương), `secSchedule` (lịch trình theo giờ), `secLetter` (Lời ngỏ), album `stagger`, `stack`.
  - Trang chủ: 6 mẫu mới `featured` đứng đầu hàng “Mẫu thiết kế phổ biến”; popup xem trước có danh sách **“Có trong mẫu này”** riêng từng mẫu (kiểu mở thiệp, QR, số vị trí ảnh…).
- Hiển thị dùng chung `public/js/cv-render.js` + `css/canvas.css`; trang khách `views/invitation/canvas.ejs` + `js/canvas-guest.js` (co giãn theo màn hình, RSVP/lời chúc dùng API cũ, lightbox, nhạc, cánh hoa). Server làm sạch dữ liệu chặt trong `src/services/canvas.js` (`sanitizeDoc`).

**Bảo mật**: bcrypt, CSRF token, Helmet + CSP, rate limit, honeypot, kiểm tra loại/kích thước upload, escape nội dung người dùng.

## 3. Chức năng đang phát triển / còn dang dở

- [x] Commit đầu tiên 17/11/2026 (nhánh `master`). **Chưa có remote GitHub.**
- [ ] **Chưa chạy thử với MySQL thật** (chỉ test SQLite). Cần kiểm tra lần deploy đầu trên Hostinger.
- [x] Giá gói đã chốt 16/11: Basic 129k, Premium 249k (`src/services/plans.js`). Giá gạch (299k/599k) chưa chốt lại.
- [ ] Thiệp dạng **form** (30 mẫu cũ) chưa có thanh tiện ích nổi; màn mở thiệp của form vẫn hiện với cả gói Free (chỉ QR đã tắt cho Free).
- [ ] Đã xem trên điện thoại: 4 kiểu mở thiệp, thanh tiện ích, hộp QR, mẫu Hoa Trắng Tinh Khôi (đủ trang), bìa của Lụa Trắng/Hanbok/Đêm Thành Phố/Hanok Tinh Khôi. Chưa duyệt hết từng trang của 13 mẫu mới còn lại.
- [x] Nút “Dùng mẫu này” ở popup trang chủ khi đã đăng nhập: đã thử 16/11 – mẫu miễn phí mở đúng editor `/thiep/:id/thiet-ke`, mẫu Basic với tài khoản Free chuyển sang `/bang-gia`.
- [ ] Mới xem kỹ 2/17 mẫu ảnh trên điện thoại (bìa của cả 17 đã kiểm tra); cần xem hết các trang còn lại của 15 mẫu.
- [ ] Nhạc: có 7 giai điệu gốc phát bằng Web Audio (chưa ai nghe thử đánh giá); thiệp dạng form vẫn chỉ cho dán link https hoặc tải mp3 (Basic+). Chưa có thư viện bài hát thật (vướng bản quyền).
- [ ] Chưa có ảnh **og:image** (ảnh chia sẻ Facebook/Zalo) cho website.
- [ ] Mục **cảm nhận khách hàng** đang rỗng (`TESTIMONIALS` trong `src/content.js`) – chỉ thêm cảm nhận thật.
- [ ] Logo/thông tin liên hệ/mạng xã hội là tạm – thay trong `.env` (`CONTACT_*`) và `partials/logo.ejs`.
- [ ] Điều khoản & chính sách bảo mật là **bản mẫu** – cần rà soát pháp lý.
- [ ] Google/Facebook login và SePay **chưa test với key thật**.
- [ ] Chưa có test tự động.
- [ ] Trình thiết kế tự do: chưa chọn nhiều phần tử cùng lúc, chưa có kho sticker/hoạ tiết; 3 mẫu ảnh giữ chỗ cũ có thể bỏ khi đủ mẫu ảnh thật.

## 4. Lỗi / hạn chế đang tồn tại

- `public/css/app.css` còn **CSS cũ không dùng** (`.site-header`, `.nav`, `.mobile-nav`, `.site-footer`, `.fab-contact`) từ header cũ – vô hại, có thể dọn.
- `src/views/partials/tpl-card.ejs` (thẻ mẫu kiểu cũ) vẫn dùng ở `/gioi-thieu` và `/mau-thiep/:key` – giao diện hơi khác thẻ mới ở trang chủ.
- Head nạp **toàn bộ ~10 họ font Google** để thumbnail hiển thị đúng → hơi nặng; có thể tối ưu.
- Ảnh tải lên **không được nén/resize** (chưa dùng `sharp`), giới hạn 12MB/tệp.
- Mẫu đã lưu chỉ lưu trên **localStorage** (không đồng bộ theo tài khoản).
- Thời hạn lưu thiệp tính theo **gói hiện tại** của chủ thiệp (hạ gói có thể làm thiệp hết hạn sớm).
- Nhiều ảnh mẫu còn **chữ ký studio** in trong ảnh (WONKYU ở a6–a8, a18–a21, a27, a29; deFarang ở a23–a25; THE CLASSY ở a31; VC STUDIO ở ảnh 1 của a16) – nên thay ảnh hoặc cắt bớt nếu không muốn hiện.
- `public/img/mau` nặng ~55MB (430 ảnh) – sẽ nằm trong git; ổn với Hostinger nhưng tránh thêm ảnh lớn bừa bãi (có thể nén lại 1200px nếu cần nhẹ hơn).
- Script nén ảnh mẫu `scripts/nen-anh-mau.js` cần thư viện `sharp`, **không** có trong `dependencies` (cài tạm ở thư mục khác, xem đầu file). Script tạo `public/img/mau/aN/01.jpg…` và ảnh tổng hợp đánh số ở `data/anh-tong-hop/` để chọn ảnh bìa.
- Số lượt “thả tim” trên thanh tiện ích chỉ lưu trên máy khách (localStorage), chưa đếm chung trên server.
- Trên Hostinger, nếu `UPLOAD_DIR` nằm trong thư mục code thì **ảnh có thể mất khi deploy lại** → phải đặt ngoài.

## 5. Quyết định kỹ thuật đã thống nhất

| Chủ đề | Quyết định |
|---|---|
| Phạm vi | Nền tảng đầy đủ như ZenLove (tài khoản, editor, gói trả phí) |
| Editor | Hai editor chạy song song theo `cards.kind`: `form` (form + xem trước, 30 mẫu) và `canvas` (kéo thả tự do, máy tính + điện thoại) |
| Thiệp canvas | JSON trong `cards.data`, rộng thiết kế 420px; server lọc bằng `sanitizeDoc` (whitelist); editor và trang khách dùng chung `cv-render.js` |
| Nhạc mẫu | Giai điệu tự soạn (`builtin:<key>`, Web Audio) thay vì dùng bài hát có bản quyền |
| Hosting | Hostinger Business/Cloud Node.js Web App + MySQL |
| DB | Lớp `src/db.js` tự viết, SQL tương thích MySQL & SQLite; migration tự chạy khi khởi động (`src/migrations.js`) – **thêm migration mới, không sửa migration cũ** |
| Thanh toán | VietQR chuyển khoản + webhook SePay (không dùng VNPay/MoMo) |
| Đăng nhập | Email + mật khẩu, Google, Facebook (Passport) |
| Session | Lưu trong bảng `sessions` (store tự viết) |
| Trang thiệp khách | Không tạo session (mount trước middleware session) |
| Mẫu thiệp | 30 mẫu **gốc** của SOBA; không sao chép thiết kế/ảnh của Hunbei/CineLove/TheDays… (chỉ tham khảo cách làm, hiệu ứng, tiện ích). Ngoại lệ: ảnh trong `anh_thiep_mau/a1–a31` được chủ dự án xác nhận đã thoả thuận quyền dùng (bố cục mẫu vẫn tự làm) |
| Ảnh bìa mẫu ảnh | Ảnh đầu tiên (`photos[0]`) phải có **đủ cô dâu & chú rể** |
| Giá gói | Free 0đ · Basic 129.000đ · Premium 249.000đ / 12 tháng (chốt 16/11/2026) |
| Phân quyền tính năng | Free: thiệp + RSVP + lời chúc + đếm ngược/lịch/bản đồ, có logo SOBA. Basic/Premium thêm: màn mở thiệp, thanh tiện ích nổi, hộp mừng cưới QR, cánh hoa, nhạc tự tải, bỏ logo. Mẫu Premium chỉ gói Premium dùng được |
| Mở thiệp canvas | 4 kiểu `envelope / fingerprint / doors / book`, lưu ở `doc.opener`; mỗi mẫu trả phí gắn sẵn 1 kiểu, chủ thiệp đổi được |
| QR trong demo | QR ảo tự vẽ `/img/qr-mau.svg` + STK minh hoạ – không bao giờ dùng STK thật trong mẫu |
| Giao diện | Hồng nhạt `#FFF1F3` + be trắng `#FFFAF7`, nút hồng `#D6456C`; tiêu đề Be Vietnam Pro đậm, chữ viết tay Great Vibes, tên mẫu Cormorant Garamond |
| Ngôn ngữ | Toàn bộ UI tiếng Việt |

## 6. Bước tiếp theo đề xuất

1. Duyệt từng trang 13 mẫu ảnh mới còn lại trên điện thoại (`/demo-thiet-ke/<key>`), chỉnh vị trí ảnh nếu bị cắt mặt; quyết định xử lý chữ ký studio in trong ảnh.
2. (Hỏi chủ dự án) thêm thanh tiện ích nổi + QR mẫu cho 30 mẫu thiệp dạng form; có tắt màn mở thiệp form với gói Free cho thống nhất không.
3. Tạo repo GitHub (riêng tư) → push (`README.md` mục 3). Đã commit lần đầu 17/11.
4. Tạo DB MySQL + Node.js app trên Hostinger, khai báo biến môi trường, deploy & kiểm tra (`README.md` mục 4).
5. Cấu hình SePay webhook, Google/Facebook OAuth, SMTP Hostinger.
6. Chốt giá gạch (299k/599k), logo thật, thông tin liên hệ; viết điều khoản chính thức.
7. Tối ưu: nén ảnh upload, giảm font tải ở head, dọn CSS cũ, thống nhất thẻ mẫu ở `/gioi-thieu`, cân nhắc nén `public/img/mau` xuống 1200px.

## 7. Cài đặt & chạy trên máy mới

Yêu cầu: **Node.js 22.5+** (để dùng SQLite tích hợp khi dev; production MySQL chạy được từ Node 20), Git.

```bash
cd soba
npm install
cp .env.example .env        # sửa: NODE_ENV=development, APP_URL=http://localhost:3000, DB_CLIENT=sqlite, SESSION_SECRET, ADMIN_EMAIL
npm run dev                 # http://localhost:3000 (bảng DB tự tạo)
```

- Nếu mang theo `data/soba.sqlite*` và `uploads/` từ máy cũ thì giữ nguyên dữ liệu thử nghiệm; nếu không, DB mới sẽ tự tạo trống.
- Preview server cho Claude: tạo `D:\Claude_1\.claude\launch.json` (thư mục cha của `soba`) với nội dung
  `{"version":"0.0.1","configurations":[{"name":"soba","runtimeExecutable":"node","runtimeArgs":["soba/server.js"],"port":3000}]}`.
- Đổi CSS/JS hoặc file trong `src/` xong phải khởi động lại server (cache-busting theo `assetVersion`; preview server của Claude chạy `node` không có `--watch`).
- Thử nhanh sau khi cài: mở `/`, `/demo-thiet-ke/hanok-tinh-khoi` (mở thiệp lật bìa + thanh tiện ích), `/demo-thiet-ke/dong-hoa-mua-ha` (mẫu Free – không mở thiệp/QR), `/bang-gia` (129.000 / 249.000).
- Kiểm tra cú pháp toàn bộ: `for f in server.js src/*.js src/routes/*.js src/services/*.js scripts/*.js public/js/*.js; do node --check "$f"; done`.
- Tài khoản thử dev: `tester@soba.local`, mật khẩu ghi trong `data/dev-test-account.txt` (không vào git).
- Tài khoản có email trùng `ADMIN_EMAIL` tự thành admin khi đăng ký; hoặc `npm run make-admin -- email@domain.com`.
- Giả lập thanh toán khi dev: `POST /api/webhooks/sepay` với header `Authorization: Apikey <SEPAY_WEBHOOK_KEY>` và nội dung chứa mã đơn `SOBAxxxxxx`.

## 8. File cần sao lưu khi chuyển máy

| File / thư mục | Có trong git? | Ghi chú |
|---|---|---|
| Toàn bộ thư mục `soba/` (trừ `node_modules/`) | Có (sau khi commit) | Mã nguồn |
| `soba/.env` | **Không** | Cấu hình & bí mật – chép thủ công, an toàn |
| `soba/data/soba.sqlite`, `-shm`, `-wal` | Không | DB thử nghiệm (tuỳ chọn) |
| `soba/uploads/` | Không | Ảnh đã tải lên khi thử (tuỳ chọn) |
| `D:\Claude_1\.claude\launch.json` | Không (ngoài repo) | Cấu hình preview server của Claude |
| `soba/data/dev-test-account.txt` | Không | Tài khoản thử trên localhost (tuỳ chọn) |
| `D:\Claude_1\anh_thiep_mau\a1…a31` | Không (ngoài repo, ~245MB) | Ảnh gốc độ phân giải cao của 31 mẫu – bản nén đã có trong `public/img/mau`; cần khi muốn nén lại/chọn ảnh khác |
| `D:\Claude_1\thiep_cuoi_91_premium\` | Không (ngoài repo) | Mẫu thiệp HTML tham khảo của SOBA (bố cục, hiệu ứng mở thiệp, thanh tiện ích) |
| `C:\Users\<tên máy>\.claude\projects\D--Claude-1\memory\` | Không | Bộ nhớ Claude của dự án (tuỳ chọn) |
