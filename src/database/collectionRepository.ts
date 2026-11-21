import type { SQLiteDatabase } from 'expo-sqlite';

export type Discovery = { mushroomId: string; discoveredAt: string };

export async function getRecentDiscoveries(db: SQLiteDatabase, limit: number): Promise<Discovery[]> {
  return db.getAllAsync<Discovery>(
    `SELECT mushroom_id AS mushroomId, discovered_at AS discoveredAt
     FROM discoveries
     ORDER BY discovered_at DESC, rowid DESC
     LIMIT ?`,
    limit
  );
}

export async function getTripCount(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM trips');
  return row?.count ?? 0;
}

export async function getUnlockedAchievementIds(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ id: string }>('SELECT id FROM achievements');
  return rows.map((row) => row.id);
}

export async function unlockAchievement(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('INSERT OR IGNORE INTO achievements (id) VALUES (?)', id);
}