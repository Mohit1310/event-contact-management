import * as SQLite from 'expo-sqlite';
import { Event } from './types';

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

export async function getEvents() {
  return db.getAllSync<Event>(`SELECT * FROM events ORDER BY id DESC;`);
}

export async function addEvent(name: string) {
  return db.runAsync(`INSERT INTO events (name) VALUES (?);`, [name]);
}

export async function deleteEvent(id: number) {
  return db.runAsync(`DELETE FROM events WHERE id = ?`, [id]);
}

export async function updateEvent(id: number, name: string) {
  return db.runAsync(`UPDATE events SET name = ? WHERE id = ?`, [name, id]);
}

export async function deleteContact(id: number) {
  return db.runAsync(`DELETE FROM contacts WHERE id = ?`, [id]);
}
