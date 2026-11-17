'use strict';
/** Danh sách ngân hàng phổ biến theo chuẩn VietQR (mã BIN Napas) */
const BANKS = [
  { bin: '970436', code: 'VCB', name: 'Vietcombank' },
  { bin: '970415', code: 'ICB', name: 'VietinBank' },
  { bin: '970418', code: 'BIDV', name: 'BIDV' },
  { bin: '970405', code: 'VBA', name: 'Agribank' },
  { bin: '970422', code: 'MB', name: 'MB Bank' },
  { bin: '970407', code: 'TCB', name: 'Techcombank' },
  { bin: '970416', code: 'ACB', name: 'ACB' },
  { bin: '970432', code: 'VPB', name: 'VPBank' },
  { bin: '970423', code: 'TPB', name: 'TPBank' },
  { bin: '970403', code: 'STB', name: 'Sacombank' },
  { bin: '970437', code: 'HDB', name: 'HDBank' },
  { bin: '970441', code: 'VIB', name: 'VIB' },
  { bin: '970443', code: 'SHB', name: 'SHB' },
  { bin: '970426', code: 'MSB', name: 'MSB' },
  { bin: '970448', code: 'OCB', name: 'OCB' },
  { bin: '970440', code: 'SEAB', name: 'SeABank' },
  { bin: '970431', code: 'EIB', name: 'Eximbank' },
  { bin: '970449', code: 'LPB', name: 'LPBank' },
  { bin: '970454', code: 'VCCB', name: 'Bản Việt (Timo)' },
];

const byBin = Object.fromEntries(BANKS.map((b) => [b.bin, b]));

/** Ảnh QR VietQR (dịch vụ công khai img.vietqr.io) */
function vietQrUrl({ bank, accountNo, accountName = '', amount = 0, note = '', template = 'compact2' }) {
  if (!bank || !accountNo) return '';
  const params = new URLSearchParams();
  if (amount) params.set('amount', String(amount));
  if (note) params.set('addInfo', note);
  if (accountName) params.set('accountName', accountName);
  const qs = params.toString();
  return `https://img.vietqr.io/image/${encodeURIComponent(bank)}-${encodeURIComponent(accountNo)}-${template}.png${qs ? '?' + qs : ''}`;
}

module.exports = { BANKS, bankByBin: (bin) => byBin[bin] || null, vietQrUrl };
