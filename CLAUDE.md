# CLAUDE.md – SOBA

Nền tảng tạo thiệp cưới online (thị trường Việt Nam). Đọc `HANDOFF.md` để biết tình trạng hiện tại, `README.md` để deploy.

## Giao tiếp
- Người dùng viết tiếng Việt → trả lời bằng tiếng Việt. Toàn bộ UI, nội dung và comment code bằng tiếng Việt.
- Người dùng muốn được **hỏi làm rõ trước khi xây dựng** tính năng lớn.

## Stack & lệnh
- Node.js ≥20 (dev cần ≥22.5 cho `node:sqlite`), Express 5, EJS + express-ejs-layouts, Passport, multer, helmet.
- `npm run dev` (watch) · `npm start` · `npm run migrate` · `npm run make-admin -- email`.
- Dev dùng SQLite (`DB_CLIENT=sqlite`, file `data/soba.sqlite`); production MySQL trên Hostinger.
- Preview server của Claude: cấu hình `soba` trong `D:\Claude_1\.claude\launch.json` (chạy `soba/server.js`, cổng 3000).
- Không có test tự động: kiểm tra bằng cách chạy server và mở trình duyệt (cả khổ 375px và ≥1280px).

## Cấu trúc
- `server.js` → chạy migration rồi `src/app.js`.
- `src/db.js`: lớp DB tự viết (`all/get/run/exec`, placeholder `?`) – **chỉ viết SQL tương thích cả MySQL và SQLite**. Thời gian lưu dạng số ms (`Date.now()`).
- `src/migrations.js`: schema khai báo một lần, sinh DDL theo dialect. **Thêm migration mới vào cuối mảng, không sửa migration đã chạy.**
- `src/routes/`: `public` (marketing + kho mẫu), `invitation` (trang thiệp khách – không session, mount trước session), `auth`, `dashboard` (editor, khách mời, upload), `billing`, `admin` (`/quan-tri`), `webhooks` (SePay).
- `src/services/`: `templates.js` (30 mẫu, danh mục, font, `FEATURED`), `plans.js` (giá & giới hạn gói – Basic 129k, Premium 249k; `features.effects` = mở thiệp/thanh tiện ích/cánh hoa, `features.gift` = QR mừng cưới, cả hai tắt ở Free), `cards.js` (dữ liệu thiệp, sanitize, `buildView`), `orders.js`, `banks.js` (VietQR), `util.js`.
- Thiệp kéo thả (`cards.kind = 'canvas'`): `src/services/canvas.js` (hằng số, `sanitizeDoc`, `STARTERS`, `pageLocals`), `canvas-starters.js` (31 mẫu ảnh ghép từ thư viện bố cục `COVERS`/`COUPLE`/`EVENT`/`GALLERY`/`secStory`/`secSchedule`/`secLetter`…, `DEFS`), editor `views/dashboard/designer.ejs` + `public/js/designer.js` + `css/designer.css`, hiển thị dùng chung `public/js/cv-render.js` + `css/canvas.css`, trang khách `views/invitation/canvas.ejs` + `js/canvas-guest.js`, nhạc gốc `js/soba-music.js` (`builtin:<key>`), thư viện bài hát `public/music` + `SONGS` trong `canvas.js` (`/music/<tệp>`). Trang dựng sẵn mới: `secFamily` (hai gia đình + lễ tư gia), `secEnvelope` (phong bì ảnh, `anim: 'rise'`) – chèn tự động trong `buildAll`. Chữ tự động `{am_lich}` (âm lịch, `cv-render.js`). Route: `/thiep/tao-thiet-ke`, `/thiep/:id/thiet-ke`, `/api/thiep/:id/thiet-ke`, `/demo-thiet-ke/:key`.
- Màn mở thiệp & thanh tiện ích (lời chúc bay, bắn tim, hộp quà QR, thả tim) của thiệp canvas: `doc.opener.style` (`none|envelope|fingerprint|doors|book`) + `doc.effects.toolbar`, chỉ hiện khi gói chủ thiệp có `features.effects` (Basic+); hộp mừng cưới QR cần `features.gift` (Basic+). Code ở `canvas-guest.js` (lớp `cvo-*`, `cvt-*`). Bản demo mẫu dùng gói của chính mẫu đó và QR ảo `/img/qr-mau.svg`.
- Mẫu ảnh mới: thêm một mục vào `DEFS` trong `canvas-starters.js`; ảnh đầu tiên trong `photos` là ảnh bìa và **phải có đủ cô dâu chú rể**; `featured: true` để đưa lên đầu hàng “Mẫu thiết kế phổ biến”; mẫu trả phí đặt `opener`.
- Ảnh mẫu canvas: `public/img/mau/aN/NN.jpg` (đã nén ≤1400px bằng `scripts/nen-anh-mau.js`; `sharp` cài tạm ngoài dự án, không thêm vào `dependencies`). Xem ảnh tổng hợp đánh số trong `data/anh-tong-hop/` để chọn ảnh, bỏ ảnh xoay ngang/quảng cáo. Giới hạn: 20 trang, 80 phần tử/trang – thêm phần tử trang trí thì gộp lại (vd. lỗ phim là một dòng chữ).
- `src/content.js`: FAQ, tính năng, cẩm nang, `TESTIMONIALS` (chỉ thêm cảm nhận thật).
- Views: layout `explore` (trang chủ, kho mẫu), `main` (trang marketing khác), `app` (dashboard/admin); trang thiệp `invitation/show.ejs` dùng `layout: false`.
- CSS: `public/css/app.css` (design tokens `:root` + component chung), `explore.css` (header/footer mới, trang chủ, thẻ mẫu), `invite.css` (trang thiệp, theme qua biến CSS).

## Quy ước quan trọng
- Mẫu thiệp: thêm một dòng vào `RAW` trong `templates.js`. Thumbnail vẽ bằng CSS (`partials/mini.ejs`, đơn vị `cqw` theo container) – không dùng ảnh ngoài.
- **Không sao chép thiết kế/ảnh/thiệp của site khác** (Hunbei, TheDays, CineLove…) – chỉ tham khảo bố cục/phong cách, tạo mẫu gốc. Ngoại lệ duy nhất: ảnh trong `D:\Claude_1\anh_thiep_mau\a1–a31` (chủ dự án xác nhận đã có thoả thuận; a18–a31 xác nhận 16/11/2026). Không dùng ảnh quảng cáo/logo studio hay ảnh có in tên thật của cặp đôi (vd. a29 #17, a27 #4 #14, a26 #16 #17). Nhạc nền: chỉ dùng bài trong `public/music` (chủ dự án xác nhận có giấy phép 17/11/2026) hoặc giai điệu tự soạn; thêm bài mới phải được chủ dự án xác nhận quyền.
- JSON khởi tạo cho JS đặt trong `<script type="application/json">` (đọc bằng `JSON.parse(el.textContent)`), tạo bằng `canvas.safeJson` / `tplJson`.
- Không bịa số liệu/cảm nhận khách hàng.
- Mọi form ghi dữ liệu có đăng nhập phải gửi `_csrf` (hoặc header `x-csrf-token` cho fetch/multipart).
- JSON nhúng vào HTML phải escape `<` (xem `app.locals.tplJson`).
- Màu: dùng biến CSS trong `:root` của `app.css` (tên biến `--pink-*`, `--primary`, `--olive`… giữ nguyên dù tông màu đã đổi nhiều lần).
- CSP chỉ cho script `'self'` → không dùng inline script/handler (`onclick`…).
- Khi đổi CSS/JS, khởi động lại server để `assetVersion` đổi (cache-busting). Preview server của Claude không tự nạp lại `src/` → dừng và chạy lại.
- Thêm trường mới vào thiệp canvas: khai báo trong `sanitizeDoc` (whitelist) – trường không khai báo sẽ bị xoá khi lưu.
- Tài khoản thử localhost: thông tin trong `data/dev-test-account.txt` (gitignore) – không ghi mật khẩu vào tài liệu/chat. Gói Free chỉ tạo được 1 thiệp.

## Bí mật
- `.env` không commit; mẫu ở `.env.example`. Không đưa key/mật khẩu vào file được commit hay tài liệu.
