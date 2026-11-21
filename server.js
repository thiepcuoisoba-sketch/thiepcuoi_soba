'use strict';
/**
 * SOBA – điểm khởi chạy ứng dụng (Hostinger: "Entry file" = server.js)
 */
const config = require('./src/config');
const { migrate } = require('./src/migrations');
const createApp = require('./src/app');

(async () => {
  try {
    await migrate();
  } catch (e) {
    console.error('[SOBA] Không kết nối / khởi tạo được database:', e.message);
    process.exit(1);
  }
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[SOBA] Đang chạy tại ${config.appUrl} (cổng ${config.port}, db: ${config.db.client})`);
    console.log(`[SOBA] Thư mục ảnh tải lên: ${config.uploadDir}`);
    // Cứu ảnh bị mất + sao lưu ảnh vào DB (chạy nền, không chặn web)
    setTimeout(() => require('./src/services/storage').maintain(), 3000);
  });
})();
