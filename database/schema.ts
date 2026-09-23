
import { getDatabase } from "./database";

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY NOT NULL,
      device_id TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      avatar_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL UNIQUE,
      device_id TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transfer_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      file_uri TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      mime_type TEXT,
      created_at TEXT NOT NULL,

      FOREIGN KEY (session_id)
        REFERENCES transfers(session_id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_transfers_session_id
      ON transfers(session_id);

    CREATE INDEX IF NOT EXISTS idx_transfer_files_session_id
      ON transfer_files(session_id);
  `);
}

