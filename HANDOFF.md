# HANDOFF – SOBA (bàn giao để tiếp tục trên máy khác)

> Cập nhật: 19/11/2026 · commit cuối trước khi bàn giao: xem `git log`.
> File này **không** chứa mật khẩu, API key hay thông tin bí mật. Bí mật nằm trong `.env` (không vào git).

---

## 1. Mục tiêu dự án

**SOBA** là nền tảng SaaS tạo **thiệp cưới online** cho thị trường Việt Nam (tham khảo ZenLove, CineLove, Hunbei, Hotwedding, TheDays, 27biggroup).
Luồng chính: khách đăng ký → chọn mẫu → tự chỉnh thiệp (editor form **hoặc** trình thiết kế kéo thả) → gửi link có tên riêng từng khách → nhận xác nhận tham dự, lời chúc, chữ ký lưu bút, mừng cưới qua QR. Có gói trả phí; thanh toán chuyển khoản VietQR, tự kích hoạt qua webhook SePay.

- Stack: **Node.js (≥20, dev ≥22.5) · Express 5 · EJS (render server, SEO) · MySQL (production) / SQLite có sẵn trong Node (dev)**.
- Deploy dự kiến: **GitHub → Hostinger Business/Cloud “Node.js Web App” + MySQL** (hướng dẫn chi tiết trong `README.md` mục 3–7).
- Giao diện website: tông hồng nhạt + be trắng, thẻ ảnh lớn kiểu TheDays, nét dễ thương kiểu Hunbei. Toàn bộ UI tiếng Việt.

---

## 2. Chức năng đã hoàn thành (đã chạy thử trên trình duyệt)

### 2.1. Website công khai
- Trang chủ `/` (layout `explore`): hero nền khảm ảnh mẫu + 3 thiệp ảnh xếp quạt; hàng **“Mẫu thiết kế phổ biến”** (39 mẫu ảnh, mẫu `featured` đứng đầu); các hàng **SOBA tuyển chọn / Đang thịnh hành / Truyền thống Việt / Phong cách Hàn Quốc / Miễn phí / Sang trọng & điện ảnh** – mỗi hàng hiện **mẫu ảnh thật trước (lặp cho đủ 10 thẻ)** rồi tới mẫu vẽ cũ; 3 bước, tiện ích, CTA.
- Kho mẫu `/mau-thiep`: lọc danh mục (`?dm=`), gói (`?goi=`), tìm không dấu (`?q=`), mẫu đã lưu (`?luu=1`, localStorage). Hiện cả mẫu ảnh (theo nhãn → danh mục, `TAG_CAT` trong `src/routes/public.js`) lẫn mẫu vẽ.
- Popup xem trước (iframe `/demo/:key` hoặc `/demo-thiet-ke/:key` với mã `cv:<key>`), danh sách “Có trong mẫu này”, nút “Dùng mẫu này”, nút tim lưu mẫu.
- Trang: `/gioi-thieu`, `/mau-thiep/:key`, `/bang-gia`, `/tinh-nang`, `/huong-dan`, `/cam-nang(/:slug)`, `/cau-hoi-thuong-gap`, `/lien-he` (lưu DB), `/thiep-khach-hang`, `/dieu-khoan`, `/chinh-sach-bao-mat`, `sitemap.xml`, `robots.txt`.
- Header/footer dùng chung, menu ngăn kéo + thanh điều hướng đáy trên điện thoại, nút Zalo/hotline nổi. Responsive đã kiểm tra 320 / 375 / 820 / 1366–1440px.

### 2.2. Thiệp dạng form (30 mẫu vẽ gốc – `src/services/templates.js`)
- 11 Free · 10 Basic · 9 Premium; thumbnail vẽ bằng CSS (`partials/mini.ejs`), 6 kiểu bìa mở thiệp, hình cô dâu chú rể vector tự vẽ.
- Trang khách `/t/:slug?to=Tên`: bìa mở thiệp, tên khách riêng, đếm ngược, lịch, chuyện tình, sự kiện + Google Maps, album + lightbox, RSVP, sổ lời chúc, mừng cưới VietQR, nhạc nền, cánh hoa. Đếm lượt xem, khoá khi hết lượt xem/hết hạn lưu trữ.
- Editor `/thiep/:id/sua`: tự lưu, xem trước iframe, đổi mẫu/màu, tải ảnh, sự kiện, chuyện tình, ngân hàng, nhạc (Basic+), bật/tắt mục, xuất bản.

### 2.3. Thiệp thiết kế tự do – kéo thả (`cards.kind = 'canvas'`)
- Dữ liệu JSON trong `cards.data`, nhiều trang xếp dọc, rộng thiết kế 420px; server lọc chặt bằng `sanitizeDoc` (whitelist).
- **Editor** `/thiep/:id/thiet-ke` (`views/dashboard/designer.ejs`, `public/js/designer.js`): kéo thả, đổi cỡ, xoay, căn dóng, khoá, lớp, nhân bản, Ctrl+Z/Y/C/V/D, sửa chữ trực tiếp, chữ tự động `{ten_khach} {chu_re} {co_dau} {ngay} {gio} {thu} {ngay_so} {thang} {nam} {am_lich}`; ảnh (tải lên tự nén ≤2000px, cắt/phóng, khung vuông/tròn/vòm, viền, bộ lọc kể cả **làm mờ**); hình dạng; nền trang; nhạc; trang; “Thay ảnh nhanh”; hiệu ứng xuất hiện (kể cả `rise` – trồi lên từ phong bì, `spin` – đĩa than xoay khi phát nhạc); tự lưu; xuất bản. Điện thoại: thanh công cụ dưới đáy.
- **Tiện ích (widget)**: đếm ngược, lịch, bản đồ (đầy đủ hoặc **chỉ nút “Xem chỉ đường”**), RSVP (nút tròn có/không, **số người 1–10**, khách của nhà trai/gái), sổ lời chúc (nút ✨ **gợi ý lời chúc**, tuỳ chọn **“Chỉ cô dâu, chú rể xem”**), mừng cưới QR (hiện sẵn hoặc **hộp quà chạm để mở**), album, nút gọi, **Ký tên lưu bút**, **Dresscode**, **Thêm vào lịch** (Google Calendar).
- **6 kiểu mở thiệp** (gói Basic+): phong bì dấu sáp, chạm vân tay – rèm, cửa hai cánh chữ Hỷ, lật bìa có ảnh, **rèm lụa & bướm bay**, **bầu trời sao rơi**. Tên khách riêng trên màn mở; nhạc phát khi khách chạm mở.
- **Thanh tiện ích nổi** (Basic+): RSVP, gửi lời chúc (bảng trượt + câu gợi ý), lời chúc bay, bắn tim, hộp mừng cưới QR, thả tim. Nút nhạc là **đĩa nhạc xoay có ảnh bìa**.
- **Ngày âm lịch** tự tính (thuật toán thiên văn, múi giờ +7, có tháng nhuận) – `toLunar`, `lunarText` trong `cv-render.js`.
- Trang khách `views/invitation/canvas.ejs` + `public/js/canvas-guest.js` (co giãn theo màn hình, lightbox, nhạc, cánh hoa, bảng vẽ chữ ký). Demo mẫu `/demo-thiet-ke/:key` dùng **đúng gói của mẫu** và QR ảo `/img/qr-mau.svg`.

### 2.4. 39 mẫu ảnh thật (`src/services/canvas-starters.js`) – 11 Free · 16 Basic · 12 Premium
- **a1–a31** (bố cục “cổ điển”, thư viện `COVERS` / `COUPLE` / `EVENT` / `GALLERY` / `secStory` / `secSchedule` / `secLetter` / `secForms`…). Mỗi mẫu tự được chèn thêm trang **“Hai gia đình”** (`secFamily`: bố mẹ hai bên, lễ Vu Quy / Thành Hôn tại tư gia, âm lịch, nút chỉ đường) và **“Phong bì ảnh”** (`secEnvelope`, trừ 3 mẫu bìa phong bì có `noEnvelope`).
- **a32–a39** (phong cách **“kính mờ”**, thư viện `GL` + `glassBuild`, cờ `noAuto`): bìa ảnh vòm có chữ dọc HAPPY WEDDING + ngày lớn, hoặc bìa tràn ảnh + thẻ kính mờ; hai họ; lễ thành hôn trên thẻ kính mờ đặt trên ảnh làm mờ (ngày 3 cột, âm lịch, thêm vào lịch, lễ vu quy); chú rể / cô dâu riêng; đĩa than; thư mời nhà hàng; timeline có biểu tượng; đếm ngược; ký tên lưu bút; love story theo năm; album so le; xác nhận / lời nhắn riêng tư / dresscode / hộp quà; thank you. Câu văn, dresscode, timeline riêng từng mẫu (`p.t`).
  - Ngân Hà Sao Rơi (a35, Premium, sao), Pháo Hoa Champagne (a36, Premium, rèm), Cung Điện Ánh Vàng (a38, Premium, rèm), Bướm Hồng Studio (a32, Basic, rèm), Vườn Lụa Trắng (a33, Basic, rèm), Hoàng Hôn Sân Thượng (a39, Basic, sao), Mây Trắng Tinh Khôi (a34, Free), Kiến Trúc Trắng (a37, Free).
- 3 mẫu ảnh giữ chỗ (SVG) cũ: `do-ruou-vang`, `kem-anh-kim`, `hong-pastel` + thiệp trống.
- `featured: 2` = chủ dự án chọn đẩy lên đầu (Đồng Cỏ Mùa Hạ, Hồng Pastel Ngọt Ngào, Hỷ Sự Vui Nhộn, Đỏ Son Song Hỷ, Phong Bì Đỏ Nhung, Phiêu Lưu Núi Tuyết, Báo Cưới, Đỏ Đô Chữ Vàng); `featured: 1` = mẫu mới nổi bật.

### 2.4b. Bộ mẫu thứ hai – 8 mẫu Basic (18/11/2026, `src/services/canvas-starters-b.js`)
- Ảnh `a40, a42–a46` (**không có thư mục a41**), mỗi thiệp 14–20 ảnh (có lặp). Bố cục tham khảo 8 mẫu của 27biggroup (21, A1, A9, 17‑V2, 15‑V2, A11, 18‑V2, 20) nhưng câu chữ và hoạ tiết SVG (`public/img/deco`, `public/img/nen`) là của SOBA.
- Trúc Xanh Ấn Đỏ (a46, mở `stamp`), Thư Xanh Hoa Cỏ (a43, `letter`), Nơ Lụa Nâu (a44, `ribbon`), Bản Tin Hạnh Phúc (a40, `news`, lá bay), Ô Liu Thanh Lịch (a42, `oval`), Vòm Trắng Song Hỷ (a45, `letter`), Sao Băng Đêm Xanh (a42, `stars`, lấp lánh), Hồng Trân Châu (a40, `curtain`, dùng lại `glassBuild`).
- `featured: 3` → đứng đầu hàng “Mẫu thiết kế phổ biến” và “SOBA tuyển chọn”.
- Engine mới: 5 kiểu mở thiệp `stamp | letter | ribbon | news | oval` (ảnh lấy từ `opener.photo`), **nút tự cuộn** (`effects.autoscroll`, `effects.autostart` – mọi gói; mẫu mới tự cuộn ngay sau khi mở thiệp), kiểu rơi `effects.fall` = `petals | leaves | hearts | sparkle | snow`. Bảng Thông tin của trình thiết kế có ô chỉnh các mục này.
- Lưu ý: tên lớp `cvo-seal` đã dùng cho dấu sáp của kiểu phong bì → kiểu cửa giấy ấn đỏ đặt khoá `stamp`.

### 2.4c. Sắp xếp lại gói & kho mẫu (18/11/2026, lần 2 – chủ dự án chốt)
- **Số ảnh theo gói**: Free 10 · Basic 30 · Premium 60 (`plans.js` `limits.photos`).
- **Gói của mẫu ảnh tính tự động theo số ảnh** trong `buildAll` (`countPhotos`, `tierByPhotos`: ≤10 Free, ≤30 Basic, còn lại Premium; không tính hoạ tiết `/img/deco`, `/img/nen`; có tính ảnh trong album). Trường `tier` trong `DEFS` chỉ còn là gợi ý ban đầu. Kết quả hiện tại: **10 Free · 28 Basic · 9 Premium**. Muốn mẫu lên Premium thì thêm ảnh (>30).
- **Nâng 8 mẫu lên Premium** (`PREMIUM_MORE` trong `canvas-starters.js`): Lâu Đài Ánh Nến, Hoa Trắng Tinh Khôi, Lễ Cưới Trên Đồi, Đồng Hoa Mùa Hạ, Thư Xanh Hoa Cỏ, Vòm Trắng Song Hỷ, Ô Liu Thanh Lịch (+ trang “Khoảnh khắc” 6 ảnh và album “Khung hình yêu thương” 12 ảnh), Trúc Xanh Ấn Đỏ (chỉ thêm album vì đã 19 trang). Trang thêm chèn ngay trước trang xác nhận tham dự; ảnh lấy vòng lại trong bộ ảnh của mẫu.
- **Gỡ khỏi kho mẫu** 30 mẫu vẽ dạng form và 3 mẫu ảnh giữ chỗ SVG (`LEGACY_STARTERS` trong `canvas.js`). Thiệp đã tạo từ các mẫu này vẫn xem/sửa bình thường; `/mau-thiep/<mẫu form>` chuyển hướng 301 về `/mau-thiep`; `LISTED = []` trong `routes/public.js`.
- **Làm lại 3 mẫu** (giữ khoá cũ, nay ở `canvas-starters-b.js`): Đỏ Son Song Hỷ (theo Mẫu 15 – đỏ lưới vàng, khung viền đôi), Đỏ Đô Chữ Vàng (theo Mẫu 3 – mây vàng, nhẫn, ruy băng ngày), Báo Cưới (theo Mẫu A17 – hỷ thiếp giấy cổ, 3 ảnh xoè quạt, mở bằng tờ báo).
- **Màn mở `doors`** đổi sang hai cánh cửa hoạ tiết lưới, dải vàng, **trượt sang hai bên**. Các mẫu dùng “lật sách” (`book`) đã chuyển sang `news / letter / oval / curtain` (kiểu `book` vẫn còn trong editor).
- Nhạc: chủ dự án xoá Sweet Dreams và Say Sóng → gỡ khỏi `SONGS`/`public/music` (còn 18 bài); Sao Băng Đêm Xanh dùng Beautiful in White, Bản Tin Hạnh Phúc dùng Marry You.

### 2.4d. Bộ mẫu thứ ba & làm mới kho mẫu (19/11/2026, `src/services/canvas-starters-c.js`)
- **Gói theo số ảnh mới: Free 10 · Basic 50 · Premium 100** (`plans.js` `limits.photos`, `tierByPhotos` ≤10 / ≤50 / >50). Mẫu vốn Premium (cách tính cũ hoặc `PREMIUM_MORE`) được lặp ảnh trong trang **“Bộ sưu tập”** cho đủ 52 ảnh; mẫu Basic thêm 6–9 ảnh lặp; mẫu Free giữ ≤10 ảnh. Kết quả: **10 Free · 32 Basic · 9 Premium** (51 mẫu).
- **Trang “Bộ sưu tập”** (`secCollection`, album 3 cột cờ `collection: true`, chèn trước trang xác nhận tham dự). Trong trình thiết kế, ảnh tải lên khi **không chọn phần tử nào** tự vào album này (chưa có thì tạo trang mới), album tự cao thêm theo số ảnh. Album tối đa 60 ảnh (`LIMITS.album`).
- **4 mẫu Basic mới (~40 ảnh, 20 trang)**, `featured: 4`: Khu Vườn Lời Hứa (a47, mở `savedate`), Biển Xanh Jeju (a48, `pill`), Đèn Lồng Hanok (a49, `lantern`, nhạc Thành Thân), Buổi Công Chiếu Tình Yêu (a50, `cinema`). Ảnh a47/a48/a50 có vài tấm in chữ KOREA WEDDING PLEDGE / BRIDE (đã tránh dùng phần lớn), a49 toàn bộ có chữ WONKYU.
- **6 kiểu mở thiệp mới** (tham khảo 27biggroup, vẽ lại bằng CSS/SVG của SOBA): `savedate` (lật trang), `scroll` (cuộn thư trục gỗ), `cinema` (rạp phim + vé mời), `lantern` (đèn lồng, mây, mặt trời mọc), `pill` (khung viên thuốc, có chữ Hỷ khi nền đậm), `orbit` (quỹ đạo ngân hà). Mỗi kiểu có trang bìa tương ứng (`COVERS` trong canvas-starters-c.js).
- **Làm mới 8 mẫu cũ** (`RESTYLE`: thay bìa + kiểu mở): Mùa Yêu Đen Trắng → cinema, Đêm Thành Phố → orbit, Lễ Cưới Trên Đồi → scroll, Hanbok Xuân Thì → lantern, Hoa Hồng Đỏ → pill đỏ chữ Hỷ, Hoàng Hôn Sân Thượng → pill tím, Vườn Lụa Trắng & Sắc Màu Thành Phố → savedate.
- **Nhạc**: thêm Golden Hour, In Love (Low G), One Day at a Time (21 bài).
- **Watermark** chữ chéo rất mờ “SOBA · MẪU THIỆP” chỉ ở bản xem mẫu (`/demo-thiet-ke`, popup xem trước).
- **Thẻ mẫu** ở trang chủ/kho mẫu vẽ đúng trang đầu của thiệp (`public/js/cv-thumbs.js` + `GET /api/mau-thiet-ke/:key/bia` trả tối đa 5 trang đầu); rê chuột thì thiệp tự cuộn xuống. Trên điện thoại (không có hover) chỉ hiện trang đầu.
- **Mẫu đỏ xen kẽ lên đầu** (`RED_KEYS`, `interleaveRed` trong `routes/public.js`): Đỏ Son Song Hỷ, Hoa Hồng Đỏ, Đỏ Đô Chữ Vàng, Phong Bì Đỏ Nhung, Hỷ Sự Vui Nhộn, Báo Cưới.

### 2.4e. Điều chỉnh 19/11/2026 (lần 2)
- **Gói Miễn phí không còn sổ lời chúc** (`plans.js` `features.wishes: false`): `stripWishes` trong `canvas.js` gỡ tiện ích lời chúc + tiêu đề, dồn phần dưới lên (trang chỉ còn tiêu đề thì bỏ). Áp dụng cho mẫu Free và khi hiển thị thiệp của chủ gói Free; `POST /t/:slug/loi-chuc` trả 403; trình thiết kế khoá tiện ích Sổ lời chúc ở gói Free.
- **Đồng bộ vị trí ảnh đúng bằng gói**: mọi mẫu Free có đúng 10, Basic 50, Premium 100 vị trí ảnh (phần thiếu lặp ảnh trong trang “Bộ sưu tập”, >36 ảnh thì 4 cột). Album tối đa 100 ảnh.
- **Ảnh thẻ mẫu** là ảnh cô dâu chú rể (trường `thumb` = số ảnh trong thư mục, mặc định ảnh bìa); rê chuột mới hiện thiệp thật và cuộn xuống.
- **Liên hệ**: thiepcuoisoba@gmail.com · 0326 409 003 (Zalo cùng số) – trong `.env` và mặc định ở `config.js`.

### 2.4f. Thiệp 91 của chủ dự án & mẫu Love Story (19/11/2026, `src/services/canvas-starters-d.js`)
- Thiệp HTML `D:\Claude_1\thiep_cuoi_91_premium` (Huy Hoàng & Lan Nhi, 12/12/2026) dựng lại thành thiệp canvas bằng `build91(ảnh, chữ)`: giữ thứ tự trang, bố cục ảnh/chữ, mở thiệp vân tay, nhạc Love Story (`nhac-cuoi-nhe-nhang.mp3` – chính là music.mp3 của thiệp 91, tên hiển thị đổi thành "Love Story (piano)").
- Thêm chức năng SOBA mà bản HTML chưa có: tên khách mời trên bìa, RSVP lưu về máy chủ, sổ lời chúc, ký tên lưu bút, bản đồ nhúng, nút thêm vào lịch, âm lịch tự động, QR mừng cưới VietQR (Vietcombank) thay ảnh qr.png.
- Thiệp thật: `node scripts/tao-thiep-91.js <email chủ thiệp>` → `/t/huy-hoang-lan-nhi`, đã xuất bản, `is_showcase = 1`. Ảnh nén ở `public/img/khach/huy-hoang-lan-nhi/`. Dev DB: thiệp id 22 thuộc tester@soba.local. **Production: đăng ký tài khoản của chủ dự án, nâng Basic/Premium rồi chạy lại script với email đó.**
- Mẫu `love-story-do-son` (ảnh a51, ảnh bìa a51 #12, Basic 50 ảnh – `want: 'basic'` cố định gói, 16 trang). Bỏ ảnh a51 có chữ/logo studio (#5, #18, #20–25, #29).
- Mục "Thiệp khách hàng" (trang chủ + /thiep-khach-hang) hiện được thiệp canvas: ảnh bìa + tên cặp đôi (`partials/show-thumb.ejs`).
- Trang khách canvas: thẻ "Bài hát đã được phát cho bạn nghe" hiện một lần khi nhạc bắt đầu (`boot.songName`, lớp `.cv-song`).

### 2.5. Nhạc nền
- **Thư viện 18 bài** trong `public/music/` (~74MB; 5 bài thêm 18/11/2026: Bến Đỗ Hạnh Phúc, Love Like a Dream, Thế Giới Của Anh, Thành Thân, Canon In Love), khai báo `SONGS` trong `src/services/canvas.js`, lưu `music.url = '/music/<tệp>'`. Chủ dự án xác nhận **đã có giấy phép** (17/11/2026). Mỗi mẫu ảnh gắn 1 bài (`song:` trong `DEFS`, lặp lại giữa các mẫu). Editor có nhóm “Nhạc cưới” (chọn + nghe thử), mọi gói đều dùng được.
- 7 giai điệu gốc phát bằng Web Audio (`public/js/soba-music.js`, `builtin:<key>`) vẫn giữ.
- Nhạc tự tải lên: gói Basic+.

### 2.6. Tài khoản, bảng điều khiển, thanh toán, quản trị
- Đăng ký/đăng nhập email, quên/đặt lại mật khẩu (SMTP; chưa cấu hình thì in link ra log), Google & Facebook (tự ẩn nút nếu thiếu key).
- `/tai-khoan`: danh sách thiệp, thống kê, nhân bản/xoá. `/thiep/tao`: chọn mẫu (khoá theo gói), mục “Thiết kế tự do”.
- `/thiep/:id/khach-moi`: tạo link tên riêng hàng loạt, tab **Phản hồi** (RSVP, tổng số người, xuất CSV UTF‑8 BOM chống CSV injection), tab **Lời chúc** (ẩn/hiện; lời chúc riêng tư hiện “Đang ẩn khỏi thiệp”), tab **Chữ ký** (xem/xoá chữ ký lưu bút).
- Thanh toán `/nang-cap?goi=basic|premium`: VietQR + tự kiểm tra; webhook `POST /api/webhooks/sepay` (API key, chống xử lý trùng, kiểm tra số tiền).
- Quản trị `/quan-tri`: doanh thu, người dùng (đổi gói/quyền), đơn hàng, thiệp (nổi bật), liên hệ. **Tài khoản admin không giới hạn số thiệp**.
- Giá: Free 0đ · **Basic 129.000đ** · **Premium 249.000đ** / 12 tháng (giá gạch 299k/599k).

### 2.7. Bảo mật
bcrypt, CSRF token, Helmet + CSP (script chỉ `'self'`), rate limit, honeypot, kiểm tra loại/kích thước upload, escape nội dung người dùng, chữ ký chỉ nhận PNG data URL ≤80KB, tối đa 500 chữ ký/thiệp.

---

## 3. Chức năng đang phát triển / công việc còn dang dở

- [x] **Đã push GitHub** (19/11/2026): https://github.com/thiepcuoisoba-sketch/thiepcuoi_soba – nhánh `master`, remote `origin`. Sau khi sửa: `git push`.
- [ ] **Chưa deploy, chưa chạy thử với MySQL thật** (chỉ test SQLite). Migration `003_signatures` cũng chưa chạy trên MySQL.
- [ ] Chưa duyệt kỹ 4 mẫu mới a47–a50 và 8 bìa làm mới trên điện thoại thật (đã xem màn mở thiệp + bìa trên khổ máy tính).
- [ ] Thẻ chọn mẫu trong `/thiep/tao` (dashboard) vẫn dùng ảnh tĩnh, chưa dùng bìa vẽ trực tiếp như trang chủ.
- [ ] Chưa duyệt **từng trang** của mọi mẫu ảnh trên điện thoại. Đã xem kỹ: Hanok Tinh Khôi, Hoa Trắng Tinh Khôi, Phim Đen Trắng, Hỷ Sự Vui Nhộn, Bướm Hồng Studio, Ngân Hà Sao Rơi. 8 mẫu mới (18/11) đã xem tổng quan trên khổ máy tính, chưa xem kỹ từng trang trên điện thoại thật. Còn lại cần xem: 6 mẫu kính mờ (a33, a34, a36–a39) và các trang “Hai gia đình” / “Phong bì ảnh” của a1–a31.
- [ ] Tên bố mẹ, địa chỉ lễ tư gia, tên nhà hàng, timeline trong mẫu là **chữ mẫu** – chủ thiệp sửa bằng nhấp đúp; chưa có ô nhập riêng ở bảng Thông tin.
- [ ] Thiệp dạng **form** (30 mẫu cũ): chưa có thanh tiện ích nổi, ký tên, dresscode, thư viện nhạc; màn mở thiệp form vẫn hiện với gói Free.
- [ ] Google/Facebook login, SePay, SMTP **chưa test với key thật**.
- [ ] **SePay – đang làm dở (21/11/2026):**
  - Chủ dự án đã liên kết tài khoản **MB 0326409003 – VU HUY HOANG** với SePay (đã xác nhận là MB).
  - `.env` trên máy đã đổi: `BANK_ID=MB`, `BANK_ACCOUNT_NO=0326409003`, `BANK_ACCOUNT_NAME=VU HUY HOANG`.
  - **Xong 21/11/2026:** Hostinger đã đổi `BANK_ID=MB`, `BANK_ACCOUNT_NO=0326409003`, `BANK_ACCOUNT_NAME=VU HUY HOANG`, `APP_URL` đúng, đã thêm `SEPAY_WEBHOOK_KEY` (cùng giá trị dòng 36 `.env` máy) → đã redeploy; `/nang-cap?goi=basic` trên web thật ra QR MB 0326409003, số tiền 129.000đ, nội dung `SOBAxxxxxx`. QR là VietQR động theo từng đơn – **không** thay bằng ảnh QR tĩnh (mất số tiền/mã đơn → SePay không tự kích hoạt).
  - **Webhook SePay chạy thật (21/11/2026 17:03):** webhook #74706 `thiepcuoisoba` (API Key) đã lưu; chuyển thử thật 129.000đ đơn `SOBAF9CRBR` → HTTP 200 "Đã kích hoạt gói", tài khoản lên Basic. Lỗi 401 trước đó do `SEPAY_WEBHOOK_KEY` bị xoá khỏi hPanel – khoá phải giống hệt API Key trong SePay. Lưu ý hPanel: sửa biến chỉ có hiệu lực sau **Áp dụng thay đổi** (tự redeploy); tải lại trang thì mất thay đổi chưa áp dụng.
  - (Ghi chú cũ) Webhook SePay (my.sepay.vn → Webhooks) chưa lưu: tên `thiepcuoisoba`, URL `https://thiepcuoisoba.com/api/webhooks/sepay`, Tiền vào, JSON, bật tự gửi lại, tài khoản MB trên, chứng thực **API Key** = đúng `SEPAY_WEBHOOK_KEY`. Sau đó chuyển thử 129.000đ với mã `SOBAxxxxxx`, xem "Lịch sử gửi".
  - Claude không đăng nhập hộ được: chủ dự án tự đăng nhập Hostinger trong khung trình duyệt của app Claude (Ctrl+Shift+B), rồi Claude sửa biến môi trường.
- [ ] Chưa có ảnh **og:image** cho website; logo/liên hệ/mạng xã hội là tạm (`.env` `CONTACT_*`, `partials/logo.ejs`); điều khoản & chính sách là **bản mẫu** cần rà soát pháp lý; `TESTIMONIALS` rỗng (chỉ thêm cảm nhận thật).
- [ ] Trình thiết kế: chưa chọn nhiều phần tử cùng lúc, chưa có kho sticker/hoạ tiết.
- [ ] Chưa có test tự động.

---

## 4. Lỗi / hạn chế đang tồn tại

- Nhiều ảnh mẫu còn **chữ ký studio** in trong ảnh: WONKYU (a6–a8, a18–a21, a27, a29), deFarang (a23–a25), THE CLASSY (a31), VC STUDIO (a16 ảnh 1), WEDDING PLEDGE / FIA / LAENDY / MELEVO / VIVIENDA / BRIDE / KOREA WEDDING PLEDGE (a32–a39).
- Repo nặng: `public/img/mau` ~67MB (543 ảnh), `public/music` ~56MB, thư mục `.git` ~120MB. Ổn với GitHub/Hostinger nhưng tránh thêm tệp lớn bừa bãi.
- Ảnh khách tải lên **không được nén phía server** (chỉ trình thiết kế canvas nén ở trình duyệt), giới hạn 12MB/tệp.
- `public/css/app.css` còn CSS cũ không dùng (`.site-header`, `.nav`, `.mobile-nav`, `.site-footer`, `.fab-contact`); `partials/tpl-card.ejs` (thẻ mẫu cũ) vẫn dùng ở `/gioi-thieu`, `/mau-thiep/:key`.
- Head nạp nhiều họ font Google để thumbnail đúng → hơi nặng.
- Mẫu đã lưu & số “thả tim” chỉ lưu localStorage, không đồng bộ server.
- Thời hạn lưu thiệp tính theo **gói hiện tại** của chủ thiệp.
- Hiệu ứng (mở thiệp, xuất hiện) chỉ chạy khi tab đang hiển thị – trong khung xem trước bị ẩn của Claude, thẻ mở thiệp có thể đứng ở trạng thái mờ (không phải lỗi thiệp).
- **Ảnh tải lên (đã sửa 21/11/2026):** trước đây `UPLOAD_DIR=./uploads` → mỗi lần deploy lại mất sạch ảnh khách (thiệp `/t/huy-hoang-lan-nhi-eqqk` mất 27/27 ảnh, `/t/minh-anh-thu-ha-53ka` mất 1 ảnh). Hostinger dựng mỗi lần deploy trong `.../hbuilds/versions/<mã>/` nên `../soba-uploads` cũng không an toàn. Hiện đặt `UPLOAD_DIR=/home/u671684285/domains/thiepcuoisoba.com/soba-uploads`; `/quan-tri` có ô "Lưu trữ ảnh tải lên" (ghi được?, giữ qua deploy ✓, danh sách thiệp thiếu ảnh) – đã kiểm chứng ✓ qua một lần redeploy. 27 ảnh của thiệp eqqk tải lên 19/11 21:48 – 20/11 09:39, trước bản sao lưu 20/11 17:21 → có thể lấy lại từ hPanel → Sao lưu → Khôi phục tệp (thư mục `uploads/202611` của bản build cũ), rồi chép vào `soba-uploads/202611/`; chưa làm (khung trình duyệt của Claude bị chặn mở trình quản lý tập tin). **Không** khôi phục cả trang.
  - **Lớp 2 – bản sao trong DB (21/11/2026, migration `004_upload_blobs`):** mỗi ảnh/nhạc tải lên được chép vào bảng `upload_blobs`; `/uploads/...` mất trên đĩa thì tự lấy lại từ DB (`services/storage.js` → `selfHeal`). Lúc khởi động và nút **"Khôi phục ảnh bị mất ngay"** ở `/quan-tri` chạy `maintain()`: cứu ảnh thiệp đang dùng từ DB hoặc từ thư mục deploy cũ `hbuilds/versions/*/…/uploads`, và sao lưu vào DB mọi ảnh trên đĩa. Xoá thiệp chỉ xoá tệp khi không thiệp nào khác (thiệp nhân bản) còn dùng.
  - Lần chạy đầu trên production: cứu 0/28 (Hostinger đã xoá thư mục deploy cũ). Để lấy lại 27 ảnh thiệp eqqk: hPanel → Sao lưu → Khôi phục và tải xuống → bản 20/11 17:21 → Hiển thị tệp → vào `domains/thiepcuoisoba.com/hbuilds/versions/<bản cũ>/…/uploads` → chọn thư mục `uploads` → **Khôi phục đã chọn** (chỉ thư mục này) → rồi bấm "Khôi phục ảnh bị mất ngay" ở `/quan-tri` để web tự chép sang `soba-uploads` + DB.
  - Chống tái diễn: production **từ chối nhận ảnh** (lỗi 409, báo khách) nếu `UPLOAD_DIR` nằm trong thư mục deploy – không bao giờ nhận ảnh rồi để mất; `/quan-tri` hiện cảnh báo đỏ khi đang chặn. Nút **"Tải bản sao lưu toàn bộ ảnh (.tar)"** (`GET /quan-tri/sao-luu-anh`) để chủ dự án sao lưu định kỳ ra ngoài máy chủ.

---

## 5. Quyết định kỹ thuật đã thống nhất

| Chủ đề | Quyết định |
|---|---|
| Phạm vi | Nền tảng đầy đủ như ZenLove (tài khoản, editor, gói trả phí) |
| Editor | Hai editor song song theo `cards.kind`: `form` (30 mẫu vẽ) và `canvas` (kéo thả tự do, máy tính + điện thoại) |
| Thiệp canvas | JSON trong `cards.data`, rộng 420px; server lọc bằng `sanitizeDoc` (whitelist – trường mới phải khai báo); editor và trang khách dùng chung `cv-render.js` |
| Mẫu ảnh | Khai báo trong `DEFS` (`canvas-starters.js`); ảnh đầu tiên phải **có đủ cô dâu & chú rể**; mẫu trả phí đặt `opener`; `noAuto` cho mẫu tự có hai họ |
| Bản quyền | Không sao chép thiết kế/ảnh/thiệp của site khác – chỉ tham khảo bố cục, luồng, tiện ích. Ngoại lệ: ảnh `D:\Claude_1\anh_thiep_mau\a1–a39` và nhạc `D:\Claude_1\nhac_cuoi` – chủ dự án xác nhận có quyền |
| Nhạc | Thư viện `public/music` (`SONGS`) + giai điệu tự soạn Web Audio |
| Hosting | Hostinger Business/Cloud Node.js Web App + MySQL |
| DB | Lớp `src/db.js` tự viết, SQL tương thích MySQL & SQLite; migration tự chạy khi khởi động – **thêm migration mới vào cuối, không sửa cái cũ** (đang có 001, 002, 003) |
| Thanh toán | VietQR + webhook SePay (không dùng VNPay/MoMo) |
| Đăng nhập | Email + mật khẩu, Google, Facebook (Passport); session lưu bảng `sessions` |
| Trang thiệp khách | Không tạo session (mount trước middleware session) |
| Giá gói | Free 0đ · Basic 129.000đ · Premium 249.000đ / 12 tháng |
| Phân quyền tính năng | Free: thiệp + RSVP + lời chúc + chữ ký + đếm ngược/lịch/bản đồ, có logo SOBA. Basic/Premium: thêm mở thiệp, thanh tiện ích, hộp mừng cưới QR, cánh hoa, nhạc tự tải, bỏ logo. Mẫu Premium chỉ gói Premium dùng. Admin không giới hạn số thiệp |
| QR trong demo | QR ảo tự vẽ `/img/qr-mau.svg` + STK minh hoạ – không dùng STK thật |
| Giao diện web | Hồng nhạt `#FFF1F3` + be trắng `#FFFAF7`, nút `#D6456C`; Be Vietnam Pro, Great Vibes, Cormorant Garamond; Alex Brush cho mẫu kính mờ |
| Ngôn ngữ | Toàn bộ UI, nội dung, comment code bằng tiếng Việt |

---

## 6. Bước tiếp theo đề xuất

1. ~~Tạo repo GitHub → push~~ – xong 19/11/2026 (`origin` = github.com/thiepcuoisoba-sketch/thiepcuoi_soba). Nên để repo **riêng tư** vì có ảnh cưới và số tài khoản của chủ dự án (thiệp 91).
2. Tạo DB MySQL + Node.js app trên Hostinger, khai báo biến môi trường, deploy, kiểm tra migration 001–003 chạy được trên MySQL (`README.md` mục 4).
3. Cấu hình SePay webhook, Google/Facebook OAuth, SMTP Hostinger (`README.md` mục 5–7).
4. Duyệt từng trang các mẫu còn lại trên điện thoại (mục 3); quyết định xử lý chữ ký studio trong ảnh.
5. Thêm ô nhập “Hai gia đình / lễ tư gia / nhà hàng / timeline” vào bảng Thông tin của trình thiết kế (hiện phải nhấp đúp sửa chữ).
6. Cân nhắc đưa thanh tiện ích, ký tên, thư viện nhạc sang thiệp dạng form.
7. Logo thật, og:image, thông tin liên hệ, điều khoản chính thức; chốt giá gạch.
8. Tối ưu: nén ảnh upload phía server, giảm font tải ở head, dọn CSS cũ.

---

## 7. Cài đặt & chạy trên máy mới

Yêu cầu: **Node.js 22.5+** (để dùng SQLite tích hợp khi dev; production MySQL chạy được từ Node 20), Git. Máy cũ dùng Node v26.13.1 trên Windows.

```bash
git clone <repo> soba        # hoặc chép nguyên thư mục soba
cd soba
npm install
cp .env.example .env         # rồi sửa: NODE_ENV=development, APP_URL=http://localhost:3000, DB_CLIENT=sqlite, SESSION_SECRET, ADMIN_EMAIL
npm run dev                  # http://localhost:3000 – migration tự chạy, bảng tự tạo
```

- Nếu chép theo `data/soba.sqlite*` và `uploads/` từ máy cũ → giữ nguyên dữ liệu thử (thiệp, khách, chữ ký). Không có thì DB mới tự tạo trống.
- **Preview server cho Claude**: tạo `<thư mục cha của soba>/.claude/launch.json`:
  `{"version":"0.0.1","configurations":[{"name":"soba","runtimeExecutable":"node","runtimeArgs":["soba/server.js"],"port":3000}]}`
- Đổi CSS/JS hoặc file trong `src/` xong phải **khởi động lại server** (cache-busting theo `assetVersion`; preview server của Claude chạy `node` không `--watch`).
- Thử nhanh: `/`, `/mau-thiep?dm=truyen-thong`, `/demo-thiet-ke/ngan-ha-sao-roi` (mở thiệp sao rơi), `/demo-thiet-ke/buom-hong-studio` (rèm & bướm), `/demo-thiet-ke/hanok-tinh-khoi`, `/demo-thiet-ke/dong-hoa-mua-ha` (mẫu Free), `/bang-gia`.
- Kiểm tra cú pháp: `for f in server.js src/*.js src/routes/*.js src/services/*.js scripts/*.js public/js/*.js; do node --check "$f"; done`
- Tài khoản thử dev: `tester@soba.local` (Premium đến 2036 + admin), mật khẩu trong `data/dev-test-account.txt` (không vào git). Tài khoản có email trùng `ADMIN_EMAIL` tự thành admin khi đăng ký; hoặc `npm run make-admin -- email@domain.com`.
- Giả lập thanh toán khi dev: `POST /api/webhooks/sepay` với header `Authorization: Apikey <SEPAY_WEBHOOK_KEY>` và nội dung chứa mã đơn `SOBAxxxxxx`.
- **Thêm bộ ảnh mẫu mới** (aN): cài `sharp` ngoài dự án (`mkdir ../tools && cd ../tools && npm init -y && npm i sharp`), rồi `NODE_PATH=../tools/node_modules node scripts/nen-anh-mau.js ../anh_thiep_mau <từ> [đến]` → `public/img/mau/aN/NN.jpg` + ảnh tổng hợp đánh số `data/anh-tong-hop/aN.jpg` để chọn ảnh.
- Git trên máy cũ đặt tên/email riêng cho repo (`git config user.name/user.email`) và `core.autocrlf=false` – máy mới cần đặt lại.

---

## 8. File cần sao lưu khi chuyển máy

| File / thư mục | Trong git? | Ghi chú |
|---|---|---|
| `soba/` (trừ `node_modules/`) | **Có** | Toàn bộ mã nguồn, ảnh mẫu, nhạc. Đã có trên GitHub (`git clone https://github.com/thiepcuoisoba-sketch/thiepcuoi_soba.git`) – chỉ cần chép thêm `.env` và DB |
| `soba/.git/` | – | Lịch sử commit (~120MB) – chép cùng thư mục `soba` nếu chưa push |
| `soba/.env` | **Không** | Cấu hình & bí mật – chép thủ công qua kênh an toàn |
| `soba/data/soba.sqlite`, `-shm`, `-wal` | Không | DB thử nghiệm (tài khoản, thiệp, chữ ký) – tuỳ chọn. Tắt server trước khi chép để file `-wal` gộp vào |
| `soba/uploads/` | Không | Ảnh đã tải lên khi thử (tuỳ chọn) |
| `soba/data/dev-test-account.txt` | Không | Tài khoản thử localhost (tuỳ chọn) |
| `D:\Claude_1\.claude\launch.json` | Không (ngoài repo) | Cấu hình preview server của Claude (có thể tạo lại theo mục 7) |
| `D:\Claude_1\anh_thiep_mau\a1…a39` | Không (ngoài repo, ~320MB) | Ảnh gốc độ phân giải cao – cần khi nén lại/chọn ảnh khác. `a10` có tệp tên chứa ký tự đặc biệt → nên **nén zip** cả thư mục rồi chép để không sót tệp |
| `D:\Claude_1\nhac_cuoi\` | Không (ngoài repo, ~56MB) | Nhạc gốc – bản dùng thật đã chép vào `public/music` |
| `D:\Claude_1\thiep_cuoi_91_premium\` | Không | Mẫu thiệp HTML tham khảo của SOBA |
| `D:\Claude_1\tools\` | Không | Chỉ chứa `sharp` cài tạm – không cần sao lưu, cài lại được |
| `C:\Users\<tên>\.claude\projects\D--Claude-1\memory\` | Không | Bộ nhớ Claude của dự án (tuỳ chọn) |
| `soba/data/anh-tong-hop/` | Không | Ảnh tổng hợp đánh số – tạo lại được bằng script |
