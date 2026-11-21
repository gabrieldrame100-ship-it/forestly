import LoadingScreen from '@/components/LoadingScreen';
import {
  getDiscoveredIds,
  getFavoriteIds,
  setDiscovered,
  setFavorite,
} from '@/database/userDataRepository';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

type UserDataValue = {
  favoriteIds: Set<string>;
  discoveredIds: Set<string>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleDiscovered: (id: string) => Promise<void>;
  reload: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [favorites, discovered] = await Promise.all([getFavoriteIds(db), getDiscoveredIds(db)]);
        if (cancelled) return;
        setFavoriteIds(new Set(favorites));
        setDiscoveredIds(new Set(discovered));
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
  }, [db]);

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
      const [favorites, discovered] = await Promise.all([getFavoriteIds(db), getDiscoveredIds(db)]);
      setFavoriteIds(new Set(favorites));
      setDiscoveredIds(new Set(discovered));
    } catch (error) {
      console.error(error);
    }
  }, [db]);

   const value = useMemo(
    () => ({ favoriteIds, discoveredIds, toggleFavorite, toggleDiscovered, reload }),
    [favoriteIds, discoveredIds, toggleFavorite, toggleDiscovered, reload]
  );

  if (loading) return <LoadingScreen />;

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataValue {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData musi być użyte wewnątrz UserDataProvider');
  return context;
}