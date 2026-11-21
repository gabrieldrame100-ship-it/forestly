import { getTrips } from '@/database/tripRepository';
import { TripSummary } from '@/types/trip';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

export function useTrips() {
  const db = useSQLiteContext();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setTrips(await getTrips(db));
    } catch (e) {
      console.error(e);
      setError('Nie udało się wczytać wypraw.');
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { trips, loading, error, reload: load };
}