import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('contacts_v2.db');

export function initDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (event_id) REFERENCES events (id)
    );
  `);
}
