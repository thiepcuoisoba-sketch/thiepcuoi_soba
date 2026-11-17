'use strict';
/**
 * Lớp truy cập dữ liệu tối giản, chạy được với:
 *  - MySQL/MariaDB (Hostinger) qua mysql2
 *  - SQLite có sẵn trong Node (node:sqlite) khi phát triển trên máy
 * Chỉ dùng SQL tương thích cả hai (placeholder "?").
 */
const fs = require('fs');
const path = require('path');
const config = require('./config');

let driver = null;

async function connect() {
  if (driver) return driver;
  if (config.db.client === 'mysql') {
    const mysql = require('mysql2/promise');
    const pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 8,
      supportBigNumbers: true,
      bigNumberStrings: false,
    });
    driver = {
      dialect: 'mysql',
      async all(sql, params = []) {
        const [rows] = await pool.query(sql, params);
        return rows;
      },
      async run(sql, params = []) {
        const [res] = await pool.query(sql, params);
        return { insertId: res.insertId, changes: res.affectedRows };
      },
      async exec(sql) {
        await pool.query(sql);
      },
      async close() {
        await pool.end();
      },
    };
  } else {
    const { DatabaseSync } = require('node:sqlite');
    fs.mkdirSync(path.dirname(config.db.sqliteFile), { recursive: true });
    const db = new DatabaseSync(config.db.sqliteFile);
    db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    const norm = (p) => p.map((v) => (typeof v === 'boolean' ? (v ? 1 : 0) : v === undefined ? null : v));
    driver = {
      dialect: 'sqlite',
      async all(sql, params = []) {
        return db.prepare(sql).all(...norm(params)).map((r) => ({ ...r }));
      },
      async run(sql, params = []) {
        const res = db.prepare(sql).run(...norm(params));
        return { insertId: Number(res.lastInsertRowid), changes: Number(res.changes) };
      },
      async exec(sql) {
        db.exec(sql);
      },
      async close() {
        db.close();
      },
    };
  }
  return driver;
}

const db = {
  connect,
  get dialect() {
    return driver && driver.dialect;
  },
  async all(sql, params) {
    return (await connect()).all(sql, params);
  },
  async get(sql, params) {
    const rows = await (await connect()).all(sql, params);
    return rows[0] || null;
  },
  async run(sql, params) {
    return (await connect()).run(sql, params);
  },
  async exec(sql) {
    return (await connect()).exec(sql);
  },
  /** Cú pháp "insert ... on conflict do nothing / insert ignore" */
  insertIgnore() {
    return driver.dialect === 'mysql' ? 'INSERT IGNORE' : 'INSERT OR IGNORE';
  },
};

module.exports = db;
