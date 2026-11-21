import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

const NAME_KEY = 'forestly.userName';

type ProfileValue = {
  userName: string;
  setUserName: (name: string) => Promise<void>;
  resetProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(NAME_KEY)
      .then((value) => {
        if (!cancelled) setUserNameState(value ?? '');
      })
      .catch((error) => console.error('Błąd odczytu nazwy użytkownika', error))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setUserName = useCallback(async (name: string) => {
    const clean = name.trim();
    setUserNameState(clean);
    try {
      if (clean) await AsyncStorage.setItem(NAME_KEY, clean);
      else await AsyncStorage.removeItem(NAME_KEY);
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Nie udało się zapisać nazwy użytkownika.');
    }
  }, []);

  const resetProfile = useCallback(async () => {
    setUserNameState('');
    await AsyncStorage.removeItem(NAME_KEY);
  }, []);

  const value = useMemo(() => ({ userName, setUserName, resetProfile }), [userName, setUserName, resetProfile]);

  if (!loaded) return null;

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileValue {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile musi być użyte wewnątrz ProfileProvider');
  return context;
}
