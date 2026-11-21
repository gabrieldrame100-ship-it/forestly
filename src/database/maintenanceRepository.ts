import type { SQLiteDatabase } from 'expo-sqlite';

export async function clearAllData(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM trip_photos');
    await db.runAsync('DELETE FROM trip_species');
    await db.runAsync('DELETE FROM trips');
    await db.runAsync('DELETE FROM favorites');
    await db.runAsync('DELETE FROM discoveries');
    await db.runAsync('DELETE FROM achievements');
  });
}
