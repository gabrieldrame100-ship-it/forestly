import LoadingScreen from '@/components/LoadingScreen';
import { Achievement, achievements } from '@/data/achievements';
import { getTripCount, getUnlockedAchievementIds, unlockAchievement } from '@/database/collectionRepository';
import {
  getDiscoveredIds,
  getFavoriteIds,
  setDiscovered,
  setFavorite,
} from '@/database/userDataRepository';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

type UserDataValue = {
  favoriteIds: Set<string>;
  discoveredIds: Set<string>;
  unlockedAchievementIds: Set<string>;
  tripCount: number;
  celebration: Achievement | null; // osiągnięcie, które właśnie wyświetlamy
  toggleFavorite: (id: string) => Promise<void>;
  toggleDiscovered: (id: string) => Promise<void>;
  reload: () => Promise<void>;
  dismissCelebration: () => void;
};

const UserDataContext = createContext<UserDataValue | null>(null);

const withToggled = (set: Set<string>, id: string, value: boolean) => {
  const copy = new Set(set);
  if (value) copy.add(id);
  else copy.delete(id);
  return copy;
};

export function UserDataProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(new Set());
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [tripCount, setTripCount] = useState(0);
  const [celebrationQueue, setCelebrationQueue] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Pierwsze sprawdzenie osiągnięć po starcie przebiega po cichu, bez animacji.
  const syncedRef = useRef(false);
  // Osiągnięcia, które właśnie zapisujemy (żeby nie zapisać ich dwa razy).
  const pendingRef = useRef(new Set<string>());

  const fetchAll = useCallback(async () => {
    const [favorites, discovered, unlocked, trips] = await Promise.all([
      getFavoriteIds(db),
      getDiscoveredIds(db),
      getUnlockedAchievementIds(db),
      getTripCount(db),
    ]);
    setFavoriteIds(new Set(favorites));
    setDiscoveredIds(new Set(discovered));
    setUnlockedIds(new Set(unlocked));
    setTripCount(trips);
  }, [db]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await fetchAll();
      } catch (error) {
        console.error('Błąd odczytu danych użytkownika', error);
        Alert.alert('Błąd', 'Nie udało się wczytać zapisanych danych.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchAll]);

  // Sprawdza, czy użytkownik zdobył nowe osiągnięcia.
  useEffect(() => {
    if (loading) return;

    const progress = { species: discoveredIds.size, trips: tripCount };
    const fresh = achievements.filter(
      (a) => progress[a.metric] >= a.target && !unlockedIds.has(a.id) && !pendingRef.current.has(a.id)
    );

    const isFirstCheck = !syncedRef.current;
    syncedRef.current = true;
    if (fresh.length === 0) return;

    fresh.forEach((a) => pendingRef.current.add(a.id));

    (async () => {
      try {
        for (const achievement of fresh) await unlockAchievement(db, achievement.id);
        setUnlockedIds((prev) => new Set([...prev, ...fresh.map((a) => a.id)]));
        if (!isFirstCheck) setCelebrationQueue((prev) => [...prev, ...fresh]);
      } catch (error) {
        console.error(error);
        fresh.forEach((a) => pendingRef.current.delete(a.id));
      }
    })();
  }, [loading, discoveredIds, tripCount, unlockedIds, db]);

  // Najpierw zmieniamy ekran (szybka reakcja), potem zapisujemy w bazie.
  // Jeśli zapis się nie uda, cofamy zmianę i informujemy użytkownika.
  const toggleFavorite = useCallback(
    async (id: string) => {
      const value = !favoriteIds.has(id);
      setFavoriteIds((prev) => withToggled(prev, id, value));
      try {
        await setFavorite(db, id, value);
      } catch (error) {
        console.error(error);
        setFavoriteIds((prev) => withToggled(prev, id, !value));
        Alert.alert('Błąd', 'Nie udało się zapisać zmiany. Spróbuj ponownie.');
      }
    },
    [db, favoriteIds]
  );

  const toggleDiscovered = useCallback(
    async (id: string) => {
      const value = !discoveredIds.has(id);
      setDiscoveredIds((prev) => withToggled(prev, id, value));
      try {
        await setDiscovered(db, id, value);
      } catch (error) {
        console.error(error);
        setDiscoveredIds((prev) => withToggled(prev, id, !value));
        Alert.alert('Błąd', 'Nie udało się zapisać zmiany. Spróbuj ponownie.');
      }
    },
    [db, discoveredIds]
  );

  // Wczytuje dane ponownie (np. po zapisaniu wyprawy), bez ekranu ładowania.
  const reload = useCallback(async () => {
    try {
      await fetchAll();
    } catch (error) {
      console.error(error);
    }
  }, [fetchAll]);

  const dismissCelebration = useCallback(() => {
    setCelebrationQueue((prev) => prev.slice(1));
  }, []);

  const value = useMemo(
    () => ({
      favoriteIds,
      discoveredIds,
      unlockedAchievementIds: unlockedIds,
      tripCount,
      celebration: celebrationQueue[0] ?? null,
      toggleFavorite,
      toggleDiscovered,
      reload,
      dismissCelebration,
    }),
    [
      favoriteIds,
      discoveredIds,
      unlockedIds,
      tripCount,
      celebrationQueue,
      toggleFavorite,
      toggleDiscovered,
      reload,
      dismissCelebration,
    ]
  );

  if (loading) return <LoadingScreen />;

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataValue {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData musi być użyte wewnątrz UserDataProvider');
  return context;
}