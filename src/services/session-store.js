'use strict';
/** Lưu session vào database (bảng sessions) – chạy được trên MySQL & SQLite */
const session = require('express-session');
const db = require('../db');

const DAY = 24 * 3600 * 1000;

class DbStore extends session.Store {
  constructor() {
    super();
    // dọn session hết hạn mỗi giờ
    this.timer = setInterval(() => {
      db.run('DELETE FROM sessions WHERE expires < ?', [Date.now()]).catch(() => {});
    }, 3600 * 1000);
    this.timer.unref();
  }
  expiry(sess) {
    return sess && sess.cookie && sess.cookie.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + DAY;
  }
  get(sid, cb) {
    db.get('SELECT sess, expires FROM sessions WHERE sid = ?', [sid])
      .then((row) => {
        if (!row || Number(row.expires) < Date.now()) return cb(null, null);
        cb(null, JSON.parse(row.sess));
      })
      .catch(cb);
  }
  async set(sid, sess, cb = () => {}) {
    try {
      const json = JSON.stringify(sess);
      const exp = this.expiry(sess);
      const res = await db.run('UPDATE sessions SET sess = ?, expires = ? WHERE sid = ?', [json, exp, sid]);
      if (!res.changes) await db.run(`${db.insertIgnore()} INTO sessions (sid, sess, expires) VALUES (?, ?, ?)`, [sid, json, exp]);
      cb(null);
    } catch (e) {
      cb(e);
    }
  }
  touch(sid, sess, cb = () => {}) {
    db.run('UPDATE sessions SET expires = ? WHERE sid = ?', [this.expiry(sess), sid]).then(() => cb(null), cb);
  }
  destroy(sid, cb = () => {}) {
    db.run('DELETE FROM sessions WHERE sid = ?', [sid]).then(() => cb(null), cb);
  }
}

module.exports = DbStore;
