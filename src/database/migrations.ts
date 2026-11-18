import type { SQLiteDatabase } from 'expo-sqlite';

// Zwiększ ten numer, gdy dodasz nową migrację poniżej.
const DATABASE_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
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

  // Tu w przyszłości: if (currentVersion === 1) { ...kolejna migracja... }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}