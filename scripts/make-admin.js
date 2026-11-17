'use strict';
/** Cấp quyền admin: npm run make-admin -- email@domain.com */
const db = require('../src/db');
const { migrate } = require('../src/migrations');
(async () => {
  const email = String(process.argv[2] || '').trim().toLowerCase();
  if (!email) { console.error('Cách dùng: npm run make-admin -- email@domain.com'); process.exit(1); }
  await migrate({ log: () => {} });
  const r = await db.run("UPDATE users SET role = 'admin' WHERE email = ?", [email]);
  console.log(r.changes ? `Đã cấp quyền admin cho ${email}` : `Không tìm thấy tài khoản ${email} – hãy đăng ký trước.`);
  process.exit(0);
})();
