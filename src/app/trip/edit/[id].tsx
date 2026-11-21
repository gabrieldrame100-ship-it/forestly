import CustomButton from '@/components/CustomButton';
import EmptyState from '@/components/EmptyState';
import TripForm from '@/components/TripForm';
import { colors } from '@/constants/theme';
import { getTripById } from '@/database/tripRepository';
import { Trip } from '@/types/trip';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await getTripById(db, Number(id));
        if (!active) return;
        if (result) {
          setTrip(result);
          setStatus('ready');
        } else {
          setStatus('missing');
        }
      } catch (error) {
        console.error(error);
        if (active) setStatus('missing');
      }
    })();
    return () => {
      active = false;
    };
  }, [db, id]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  if (status === 'missing' || !trip) {
    return (
      <View style={{ flex: 1 }}>
        <EmptyState title="Nie znaleziono" message="Nie udało się wczytać tej wyprawy." />
        <View style={{ padding: 24 }}>
          <CustomButton title="Wróć" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return <TripForm trip={trip} />;
}