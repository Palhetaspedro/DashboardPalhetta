import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "palhetta.db");

let db: Database;

export async function initDb(): Promise<Database> {
  const SQL = await initSqlJs();

  // Load existing database or create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // ─── Schema ──────────────────────────────────────────────────────────────────────

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin','seller','buyer','user')),
      plan       TEXT NOT NULL DEFAULT 'free' CHECK(plan IN ('free','starter','pro','enterprise')),
      avatar     TEXT DEFAULT '',
      phone      TEXT DEFAULT '',
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan        TEXT NOT NULL CHECK(plan IN ('free','starter','pro','enterprise')),
      status      TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','past_due','cancelled','expired')),
      starts_at   TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at  TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sales (
      id          TEXT PRIMARY KEY,
      seller_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      buyer_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
      product     TEXT NOT NULL,
      specs       TEXT DEFAULT '',
      amount      REAL NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
      thumb       TEXT DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token      TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id          TEXT PRIMARY KEY,
      order_id    TEXT REFERENCES sales(id) ON DELETE SET NULL,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason      TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','review','resolved')),
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT DEFAULT '',
      price       REAL NOT NULL,
      category    TEXT DEFAULT '',
      thumb       TEXT DEFAULT '',
      discount    INTEGER DEFAULT 0,
      old_price   REAL DEFAULT 0,
      active      INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sales_seller ON sales(seller_id);
    CREATE INDEX IF NOT EXISTS idx_sales_buyer ON sales(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_disputes_user ON disputes(user_id);
    CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  `);

  saveDb();
  return dbProxy;
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// ─── Wrapper to provide a better-sqlite3-like API ──────────────────────────────

interface RunResult {
  changes: number;
}

class Statement {
  private sql: string;

  constructor(sql: string) {
    this.sql = sql;
  }

  private toArray(params: any[]): any[] {
    return params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
  }

  all(...params: any[]): any[] {
    const results = db.exec(this.sql, this.toArray(params));
    if (results.length === 0) return [];
    const columns = results[0].columns;
    return results[0].values.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  get(...params: any[]): any | undefined {
    const results = this.all(...params);
    return results[0];
  }

  run(...params: any[]): RunResult {
    const args = this.toArray(params);
    db.run(this.sql, args);
    saveDb();
    return { changes: db.getRowsModified() };
  }
}

// Export a db proxy that mimics better-sqlite3 interface
const dbProxy = {
  prepare(sql: string): Statement {
    return new Statement(sql);
  },

  exec(sql: string): void {
    db.exec(sql);
    saveDb();
  },

  pragma(_sql: string): any {
    return [];
  },
};

export default dbProxy;
