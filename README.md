# SOBA – Nền tảng tạo thiệp cưới online

Website + nền tảng SaaS tạo thiệp cưới online: khách đăng ký, chọn mẫu, tự chỉnh sửa thiệp (xem trước trực tiếp), gửi link có tên khách riêng, nhận xác nhận tham dự, lời chúc, mừng cưới QR; thanh toán gói bằng VietQR, tự kích hoạt qua webhook SePay.

**Công nghệ:** Node.js · Express 5 · EJS (render phía server, tốt cho SEO) · MySQL (Hostinger) / SQLite (chạy thử trên máy) · Passport (Email, Google, Facebook).

---

## 1. Chạy thử trên máy

Yêu cầu: **Node.js 22.5+** (để dùng SQLite có sẵn khi phát triển).

```bash
npm install
cp .env.example .env      # rồi sửa: DB_CLIENT=sqlite, NODE_ENV=development, APP_URL=http://localhost:3000
npm run dev               # http://localhost:3000
```

- Email trùng với `ADMIN_EMAIL` sẽ tự có quyền quản trị khi đăng ký → vào `/quan-tri`.
- Hoặc cấp quyền sau: `npm run make-admin -- email@domain.com`.

## 2. Cấu trúc thư mục

```
server.js                 Điểm khởi chạy (Hostinger: Entry file)
src/
  config.js               Đọc biến môi trường
  db.js, migrations.js    Lớp DB (MySQL/SQLite) + tự tạo bảng khi khởi động
  services/plans.js       ⭐ Giá & giới hạn các gói – sửa giá tại đây
  services/templates.js   ⭐ Danh sách mẫu thiệp (màu, font, kiểu bìa) – thêm mẫu tại đây
  content.js              ⭐ Văn bản trang chủ: tính năng, FAQ, cẩm nang, cảm nhận khách hàng
  routes/                 public · auth · dashboard · billing · admin · invitation · webhooks
  views/                  Giao diện EJS (pages, dashboard, admin, invitation)
public/                   CSS, JS, ảnh tĩnh
```

## 3. Đẩy code lên GitHub

```bash
git init
git add .
git commit -m "SOBA: khởi tạo nền tảng thiệp cưới online"
git branch -M main
git remote add origin https://github.com/<tai-khoan>/soba.git
git push -u origin main
```

> File `.env`, thư mục `uploads/` và database SQLite **không** được đưa lên GitHub (đã có trong `.gitignore`).

## 4. Deploy lên Hostinger (gói Business / Cloud – Node.js Web App)

### 4.1. Tạo database MySQL
hPanel → **Databases → MySQL Databases** → tạo database + user, ghi lại: tên DB, user, mật khẩu (host thường là `localhost`).

### 4.2. Tạo Node.js app từ GitHub
hPanel → **Websites → Add Website → Node.js Apps** (hoặc *Node.js* trong trang quản lý website) → **Import Git repository** → kết nối GitHub và chọn repo `soba`.

| Thiết lập | Giá trị |
|---|---|
| Framework preset | Express / Other |
| Node.js version | **22.x** |
| Branch | `main` |
| Install command | `npm install` |
| Build command | *(để trống)* |
| Entry file / Start command | `server.js` / `npm start` |

### 4.3. Khai báo biến môi trường
Trong mục **Environment variables** của app, thêm các biến theo `.env.example`. Tối thiểu:

```
NODE_ENV=production
APP_URL=https://ten-mien-cua-ban.vn
SESSION_SECRET=<chuỗi ngẫu nhiên ≥ 32 ký tự>
DB_CLIENT=mysql
DB_HOST=localhost
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
UPLOAD_DIR=/home/<user>/soba-uploads     # NGOÀI thư mục code để không mất ảnh khi deploy lại
BANK_ID=MB
BANK_ACCOUNT_NO=...
BANK_ACCOUNT_NAME=...
SEPAY_WEBHOOK_KEY=<chuỗi bí mật>
ADMIN_EMAIL=email-cua-ban@gmail.com
```

Tạo `SESSION_SECRET` nhanh: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Bảng database được **tự động tạo** ở lần khởi động đầu tiên.

### 4.4. Gắn tên miền & SSL
Trỏ tên miền vào app, bật SSL (Let’s Encrypt miễn phí trong hPanel). Đảm bảo `APP_URL` dùng `https://`.

### 4.5. Cập nhật phiên bản mới
`git push` lên nhánh `main` → Hostinger tự deploy lại (hoặc bấm **Redeploy**).

## 5. Thanh toán tự động (VietQR + SePay)

1. Đăng ký [SePay](https://sepay.vn), liên kết tài khoản ngân hàng nhận tiền (trùng `BANK_ACCOUNT_NO`).
2. SePay → **Webhooks → Thêm webhook**:
   - URL: `https://ten-mien-cua-ban.vn/api/webhooks/sepay`
   - Kiểu chứng thực: **API Key** → nhập đúng giá trị `SEPAY_WEBHOOK_KEY`.
   - Sự kiện: tiền vào.
3. Khách chọn gói → quét QR (nội dung chuyển khoản `SOBAxxxxxx`) → SePay gọi webhook → gói được kích hoạt, trang thanh toán tự chuyển.
4. Trường hợp khách chuyển sai nội dung: vào `/quan-tri/don-hang` → **Xác nhận** thủ công.

## 6. Đăng nhập Google / Facebook

- **Google:** [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth client ID (Web).
  Authorized redirect URI: `https://ten-mien-cua-ban.vn/auth/google/callback` → điền `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- **Facebook:** [developers.facebook.com](https://developers.facebook.com/) → tạo App → Facebook Login → Valid OAuth Redirect URI:
  `https://ten-mien-cua-ban.vn/auth/facebook/callback` → điền `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`. Cần chuyển App sang chế độ *Live*.
- Bỏ trống biến nào thì nút đăng nhập tương ứng tự ẩn.

## 7. Email (quên mật khẩu)
Tạo hộp thư trong Hostinger Email (vd. `hello@ten-mien.vn`) và điền `SMTP_USER`, `SMTP_PASSWORD`. Khi chưa cấu hình, link đặt lại mật khẩu được in ra log.

## 8. Tuỳ biến nhanh

| Muốn thay đổi | Sửa file |
|---|---|
| Giá, giới hạn gói | `src/services/plans.js` |
| Thêm / sửa mẫu thiệp | `src/services/templates.js` (+ CSS `public/css/invite.css` nếu cần kiểu bìa mới) |
| FAQ, tính năng, bài cẩm nang, cảm nhận khách hàng | `src/content.js` |
| Màu thương hiệu website | biến `:root` đầu file `public/css/app.css` |
| Logo | `src/views/partials/logo.ejs`, `public/img/favicon.svg` |
| Điều khoản / chính sách | `src/views/pages/legal.ejs` (bản mẫu – nên rà soát pháp lý) |
| Thông tin liên hệ, mạng xã hội | biến `CONTACT_*` trong `.env` |

## 9. Bảo mật đã có sẵn
Mật khẩu băm bcrypt · CSRF token cho mọi thao tác ghi · Helmet + CSP · giới hạn tần suất (đăng nhập, RSVP, lời chúc, liên hệ) · honeypot chống spam · kiểm tra loại/kích thước tệp tải lên · webhook xác thực API key + chống xử lý trùng · escape toàn bộ nội dung người dùng · chống CSV injection khi xuất file.
