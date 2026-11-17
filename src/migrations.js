'use strict';
/**
 * Định nghĩa schema một lần, sinh DDL cho MySQL hoặc SQLite.
 * Thêm migration mới bằng cách nối thêm phần tử vào mảng MIGRATIONS (không sửa cái cũ).
 */
const db = require('./db');

const T = {
  id: { mysql: 'BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY', sqlite: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
  ref: { mysql: 'BIGINT UNSIGNED', sqlite: 'INTEGER' },
  str: (n) => ({ mysql: `VARCHAR(${n})`, sqlite: 'TEXT' }),
  text: { mysql: 'MEDIUMTEXT', sqlite: 'TEXT' },
  int: { mysql: 'INT', sqlite: 'INTEGER' },
  big: { mysql: 'BIGINT', sqlite: 'INTEGER' },
};

function table(name, cols, extra = []) {
  return (dialect) => {
    const lines = Object.entries(cols).map(([col, def]) => {
      const [type, ...rest] = Array.isArray(def) ? def : [def];
      return `  ${col} ${type[dialect]}${rest.length ? ' ' + rest.join(' ') : ''}`;
    });
    const suffix = dialect === 'mysql' ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci' : '';
    return [`CREATE TABLE IF NOT EXISTS ${name} (\n${lines.concat(extra).join(',\n')}\n)${suffix}`];
  };
}

function index(name, tableName, cols, unique = false) {
  return (dialect) => {
    if (dialect === 'sqlite') {
      return [`CREATE ${unique ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS ${name} ON ${tableName} (${cols})`];
    }
    return [`CREATE ${unique ? 'UNIQUE ' : ''}INDEX ${name} ON ${tableName} (${cols})`];
  };
}

const MIGRATIONS = [
  {
    id: '001_init',
    steps: [
      table('users', {
        id: T.id,
        email: [T.str(190), 'NOT NULL'],
        password_hash: T.str(100),
        name: [T.str(120), "NOT NULL DEFAULT ''"],
        avatar: T.str(500),
        google_id: T.str(64),
        facebook_id: T.str(64),
        role: [T.str(16), "NOT NULL DEFAULT 'user'"],
        plan: [T.str(16), "NOT NULL DEFAULT 'free'"],
        plan_expires_at: T.big,
        reset_token: T.str(80),
        reset_expires_at: T.big,
        created_at: [T.big, 'NOT NULL'],
      }),
      index('ux_users_email', 'users', 'email', true),
      index('ix_users_google', 'users', 'google_id'),
      index('ix_users_facebook', 'users', 'facebook_id'),

      table('cards', {
        id: T.id,
        user_id: [T.ref, 'NOT NULL'],
        slug: [T.str(80), 'NOT NULL'],
        template: [T.str(40), 'NOT NULL'],
        title: [T.str(200), "NOT NULL DEFAULT ''"],
        data: [T.text, 'NOT NULL'],
        status: [T.str(16), "NOT NULL DEFAULT 'draft'"],
        views: [T.int, 'NOT NULL DEFAULT 0'],
        is_showcase: [T.int, 'NOT NULL DEFAULT 0'],
        created_at: [T.big, 'NOT NULL'],
        updated_at: [T.big, 'NOT NULL'],
        published_at: T.big,
      }),
      index('ux_cards_slug', 'cards', 'slug', true),
      index('ix_cards_user', 'cards', 'user_id'),

      table('rsvps', {
        id: T.id,
        card_id: [T.ref, 'NOT NULL'],
        name: [T.str(120), 'NOT NULL'],
        phone: T.str(30),
        attending: [T.str(8), "NOT NULL DEFAULT 'yes'"],
        guests: [T.int, 'NOT NULL DEFAULT 1'],
        side: T.str(10),
        message: T.str(1000),
        created_at: [T.big, 'NOT NULL'],
      }),
      index('ix_rsvps_card', 'rsvps', 'card_id'),

      table('wishes', {
        id: T.id,
        card_id: [T.ref, 'NOT NULL'],
        name: [T.str(120), 'NOT NULL'],
        message: [T.str(1000), 'NOT NULL'],
        hidden: [T.int, 'NOT NULL DEFAULT 0'],
        created_at: [T.big, 'NOT NULL'],
      }),
      index('ix_wishes_card', 'wishes', 'card_id'),

      table('guests', {
        id: T.id,
        card_id: [T.ref, 'NOT NULL'],
        name: [T.str(120), 'NOT NULL'],
        group_name: T.str(60),
        created_at: [T.big, 'NOT NULL'],
      }),
      index('ix_guests_card', 'guests', 'card_id'),

      table('uploads', {
        id: T.id,
        user_id: [T.ref, 'NOT NULL'],
        card_id: T.ref,
        file: [T.str(255), 'NOT NULL'],
        kind: [T.str(10), "NOT NULL DEFAULT 'image'"],
        size: [T.int, 'NOT NULL DEFAULT 0'],
        created_at: [T.big, 'NOT NULL'],
      }),
      index('ix_uploads_card', 'uploads', 'card_id'),

      table('orders', {
        id: T.id,
        code: [T.str(20), 'NOT NULL'],
        user_id: [T.ref, 'NOT NULL'],
        plan: [T.str(16), 'NOT NULL'],
        amount: [T.int, 'NOT NULL'],
        status: [T.str(12), "NOT NULL DEFAULT 'pending'"],
        transaction_ref: T.str(100),
        paid_at: T.big,
        created_at: [T.big, 'NOT NULL'],
      }),
      index('ux_orders_code', 'orders', 'code', true),
      index('ix_orders_user', 'orders', 'user_id'),

      table('payment_logs', {
        id: T.id,
        provider_id: T.str(64),
        payload: [T.text, 'NOT NULL'],
        order_id: T.ref,
        note: T.str(255),
        created_at: [T.big, 'NOT NULL'],
      }),
      index('ux_payment_provider', 'payment_logs', 'provider_id', true),

      table('contacts', {
        id: T.id,
        name: [T.str(120), 'NOT NULL'],
        phone: T.str(30),
        email: T.str(190),
        message: [T.str(2000), 'NOT NULL'],
        created_at: [T.big, 'NOT NULL'],
      }),

      table('sessions', {
        sid: [T.str(128), 'NOT NULL PRIMARY KEY'],
        sess: [T.text, 'NOT NULL'],
        expires: [T.big, 'NOT NULL'],
      }),
      index('ix_sessions_expires', 'sessions', 'expires'),
    ],
  },
  {
    // Loại thiệp: 'form' (editor form + mẫu cố định) hoặc 'canvas' (editor kéo thả tự do)
    id: '002_card_kind',
    steps: [
      (dialect) => [
        dialect === 'mysql'
          ? "ALTER TABLE cards ADD COLUMN kind VARCHAR(16) NOT NULL DEFAULT 'form'"
          : "ALTER TABLE cards ADD COLUMN kind TEXT NOT NULL DEFAULT 'form'",
      ],
    ],
  },
  {
    // Chữ ký lưu bút của khách (ảnh PNG dạng data URL, tối đa ~80KB)
    id: '003_signatures',
    steps: [
      table('signatures', {
        id: T.id,
        card_id: [T.ref, 'NOT NULL'],
        name: [T.str(60), 'NOT NULL'],
        data: [T.text, 'NOT NULL'],
        created_at: [T.big, 'NOT NULL'],
      }),
      index('ix_signatures_card', 'signatures', 'card_id'),
    ],
  },
];

async function migrate({ log = console.log } = {}) {
  await db.connect();
  const dialect = db.dialect;
  await db.exec(
    dialect === 'mysql'
      ? 'CREATE TABLE IF NOT EXISTS schema_migrations (id VARCHAR(100) NOT NULL PRIMARY KEY, run_at BIGINT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
      : 'CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, run_at INTEGER NOT NULL)'
  );
  const done = new Set((await db.all('SELECT id FROM schema_migrations')).map((r) => r.id));
  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    for (const step of m.steps) {
      for (const sql of step(dialect)) await db.exec(sql);
    }
    await db.run('INSERT INTO schema_migrations (id, run_at) VALUES (?, ?)', [m.id, Date.now()]);
    log(`[SOBA] Đã chạy migration ${m.id}`);
  }
}

module.exports = { migrate };
