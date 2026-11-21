import { Trip, TripInput, TripSummary } from '@/types/trip';
import type { SQLiteDatabase } from 'expo-sqlite';

type TripRow = { id: number; title: string; trip_date: string; description: string };

export async function getTrips(db: SQLiteDatabase): Promise<TripSummary[]> {
  return db.getAllAsync<TripSummary>(`
    SELECT
      t.id AS id,
      t.title AS title,
      t.trip_date AS tripDate,
      t.description AS description,
      (SELECT COUNT(*) FROM trip_species s WHERE s.trip_id = t.id) AS speciesCount,
      (SELECT COUNT(*) FROM trip_photos p WHERE p.trip_id = t.id) AS photoCount,
      (SELECT p.file_name FROM trip_photos p WHERE p.trip_id = t.id ORDER BY p.id LIMIT 1) AS coverPhoto
    FROM trips t
    ORDER BY t.trip_date DESC, t.id DESC
  `);
}

export async function getTripById(db: SQLiteDatabase, id: number): Promise<Trip | null> {
  const row = await db.getFirstAsync<TripRow>(
    'SELECT id, title, trip_date, description FROM trips WHERE id = ?',
    id
  );
  if (!row) return null;

  const photos = await db.getAllAsync<{ id: number; file_name: string }>(
    'SELECT id, file_name FROM trip_photos WHERE trip_id = ? ORDER BY id',
    id
  );
  const species = await db.getAllAsync<{ mushroom_id: string }>(
    'SELECT mushroom_id FROM trip_species WHERE trip_id = ?',
    id
  );

  return {
    id: row.id,
    title: row.title,
    tripDate: row.trip_date,
    description: row.description,
    photos: photos.map((p) => ({ id: p.id, fileName: p.file_name })),
    speciesIds: species.map((s) => s.mushroom_id),
  };
}

// Zapisuje zdjęcia i gatunki wyprawy. Gatunki trafiają też do poznanych.
async function replaceRelations(db: SQLiteDatabase, tripId: number, input: TripInput): Promise<void> {
  await db.runAsync('DELETE FROM trip_photos WHERE trip_id = ?', tripId);
  await db.runAsync('DELETE FROM trip_species WHERE trip_id = ?', tripId);

  for (const fileName of input.photoFileNames) {
    await db.runAsync('INSERT INTO trip_photos (trip_id, file_name) VALUES (?, ?)', tripId, fileName);
  }
  for (const mushroomId of input.speciesIds) {
    await db.runAsync('INSERT OR IGNORE INTO trip_species (trip_id, mushroom_id) VALUES (?, ?)', tripId, mushroomId);
    await db.runAsync('INSERT OR IGNORE INTO discoveries (mushroom_id) VALUES (?)', mushroomId);
  }
}

export async function createTrip(db: SQLiteDatabase, input: TripInput): Promise<number> {
  let tripId = 0;
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO trips (title, trip_date, description) VALUES (?, ?, ?)',
      input.title,
      input.tripDate,
      input.description
    );
    tripId = result.lastInsertRowId;
    await replaceRelations(db, tripId, input);
  });
  return tripId;
}

export async function updateTrip(db: SQLiteDatabase, id: number, input: TripInput): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE trips SET title = ?, trip_date = ?, description = ?, updated_at = datetime('now') WHERE id = ?`,
      input.title,
      input.tripDate,
      input.description,
      id
    );
    await replaceRelations(db, id, input);
  });
}

// Zwraca nazwy plików zdjęć, żeby wywołujący mógł je usunąć z pamięci telefonu.
export async function deleteTrip(db: SQLiteDatabase, id: number): Promise<string[]> {
  const photos = await db.getAllAsync<{ file_name: string }>(
    'SELECT file_name FROM trip_photos WHERE trip_id = ?',
    id
  );
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM trip_photos WHERE trip_id = ?', id);
    await db.runAsync('DELETE FROM trip_species WHERE trip_id = ?', id);
    await db.runAsync('DELETE FROM trips WHERE id = ?', id);
  });
  return photos.map((p) => p.file_name);
}