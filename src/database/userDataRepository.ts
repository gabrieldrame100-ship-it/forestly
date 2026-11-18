import type { SQLiteDatabase } from 'expo-sqlite';

type IdRow = { mushroom_id: string };

export async function getFavoriteIds(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<IdRow>('SELECT mushroom_id FROM favorites');
  return rows.map((row) => row.mushroom_id);
}

export async function setFavorite(db: SQLiteDatabase, mushroomId: string, value: boolean): Promise<void> {
  if (value) {
    await db.runAsync('INSERT OR IGNORE INTO favorites (mushroom_id) VALUES (?)', mushroomId);
  } else {
    await db.runAsync('DELETE FROM favorites WHERE mushroom_id = ?', mushroomId);
  }
}

export async function getDiscoveredIds(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<IdRow>('SELECT mushroom_id FROM discoveries');
  return rows.map((row) => row.mushroom_id);
}

export async function setDiscovered(db: SQLiteDatabase, mushroomId: string, value: boolean): Promise<void> {
  if (value) {
    await db.runAsync('INSERT OR IGNORE INTO discoveries (mushroom_id) VALUES (?)', mushroomId);
  } else {
    await db.runAsync('DELETE FROM discoveries WHERE mushroom_id = ?', mushroomId);
  }
}