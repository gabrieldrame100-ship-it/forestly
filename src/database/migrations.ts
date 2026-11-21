import type { SQLiteDatabase } from 'expo-sqlite';


const DATABASE_VERSION = 3;

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS favorites (
        mushroom_id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS discoveries (
        mushroom_id TEXT PRIMARY KEY NOT NULL,
        discovered_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        trip_date TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS trip_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trip_species (
        trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
        mushroom_id TEXT NOT NULL,
        PRIMARY KEY (trip_id, mushroom_id)
      );

      CREATE INDEX IF NOT EXISTS idx_trip_photos_trip ON trip_photos(trip_id);
    `);
    currentVersion = 2;
  }

    if (currentVersion === 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY NOT NULL,
        unlocked_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    currentVersion = 3;
  }
  
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}