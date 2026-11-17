'use strict';
const crypto = require('crypto');

function removeDiacritics(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function slugify(str = '', max = 50) {
  return removeDiacritics(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/g, '');
}

function randomCode(len = 6, alphabet = 'abcdefghjkmnpqrstuvwxyz23456789') {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

const vnd = (n) => new Intl.NumberFormat('vi-VN').format(Number(n) || 0) + 'đ';

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

/** "2026-12-20" -> Date (giờ địa phương) */
function parseDate(d, t = '00:00') {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = (/^\d{1,2}:\d{2}$/.test(t || '') ? t : '00:00').split(':').map(Number);
  return new Date(y, m - 1, day, hh, mm);
}

function formatDateVi(d) {
  const date = d instanceof Date ? d : parseDate(d);
  if (!date || isNaN(date)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${WEEKDAYS[date.getDay()]}, ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function formatDateTime(ms) {
  if (!ms) return '';
  const d = new Date(Number(ms));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Cắt chuỗi, bỏ ký tự điều khiển */
function clean(v, max = 200) {
  if (v === undefined || v === null) return '';
  return String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

function isSafeUrl(u) {
  if (!u) return false;
  if (u.startsWith('/uploads/') || u.startsWith('/img/') || u.startsWith('/music/')) return true;
  try {
    const url = new URL(u);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Chuyển link Google Maps bất kỳ thành link nhúng an toàn (dựa trên địa chỉ) */
function mapEmbedUrl(address) {
  if (!address) return '';
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&hl=vi`;
}

function mapLink(address, url) {
  if (url && isSafeUrl(url)) return url;
  if (!address) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

module.exports = { removeDiacritics, slugify, randomCode, vnd, parseDate, formatDateVi, formatDateTime, clean, isSafeUrl, mapEmbedUrl, mapLink };
