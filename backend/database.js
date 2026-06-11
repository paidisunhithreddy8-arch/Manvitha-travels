import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'database.sqlite');

let db = null;

export async function getDatabase() {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign key support in SQLite
  await db.run('PRAGMA foreign_keys = ON');

  // Initialize tables
  await initializeTables(db);

  return db;
}

async function initializeTables(dbInstance) {
  // Create customers table
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create reminders table
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS customer_occasionbased_booking_remi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      occasion_type TEXT NOT NULL CHECK(occasion_type IN ('birthday', 'anniversary', 'festival')),
      occasion_date TEXT NOT NULL,
      reminder_date TEXT NOT NULL,
      festival_name TEXT,
      status TEXT NOT NULL CHECK(status IN ('Active', 'Completed', 'Archived')) DEFAULT 'Active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    )
  `);

  // Create alerts table
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reminder_id INTEGER NOT NULL,
      alert_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Active', 'Dismissed')) DEFAULT 'Active',
      urgency TEXT NOT NULL CHECK(urgency IN ('Red', 'Amber')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reminder_id) REFERENCES customer_occasionbased_booking_remi (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for faster queries
  await dbInstance.exec(`
    CREATE INDEX IF NOT EXISTS idx_reminders_customer_id ON customer_occasionbased_booking_remi(customer_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_status ON customer_occasionbased_booking_remi(status);
    CREATE INDEX IF NOT EXISTS idx_alerts_reminder_id ON alerts(reminder_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
  `);
}
