import CustomButton from '@/components/CustomButton';
import EmptyState from '@/components/EmptyState';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { getMushroomById } from '@/data/mushrooms';
import { deleteTrip, getTripById } from '@/database/tripRepository';
import { formatDate } from '@/services/dateUtils';
import { deletePhoto, getPhotoUri } from '@/services/photoStorage';
import { Trip } from '@/types/trip';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, CalendarDays, Pencil, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const { reload } = useUserData();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
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
    }, [db, id])
  );

  const confirmDelete = () => {
    if (!trip) return;
    Alert.alert('Usunąć wyprawę?', 'Tej operacji nie można cofnąć. Zdjęcia tej wyprawy też zostaną usunięte.', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            const fileNames = await deleteTrip(db, trip.id);
            fileNames.forEach((name) => deletePhoto(name));
            await reload();
            router.back();
          } catch (error) {
            console.error(error);
            Alert.alert('Błąd', 'Nie udało się usunąć wyprawy.');
          }
        },
      },
    ]);
  };

  if (status === 'loading') {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  if (status === 'missing' || !trip) {
    return (
      <View style={{ flex: 1 }}>
        <EmptyState title="Nie znaleziono" message="Nie udało się wczytać tej wyprawy." />
        <View style={{ padding: spacing.lg }}>
          <CustomButton title="Wróć" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const species = trip.speciesIds
    .map((speciesId) => getMushroomById(speciesId))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.md,
        }}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.forest} />
        </Pressable>

        <View style={{ gap: spacing.xs }}>
          <Text style={styles.title}>{trip.title}</Text>
          <View style={styles.dateRow}>
            <CalendarDays size={16} color={colors.earth} />
            <Text style={styles.date}>{formatDate(trip.tripDate)}</Text>
          </View>
        </View>

        {trip.description.length > 0 && <Text style={styles.description}>{trip.description}</Text>}

        {trip.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zdjęcia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {trip.photos.map((photo) => (
                <Pressable key={photo.id} onPress={() => setViewerUri(getPhotoUri(photo.fileName))}>
                  <Image source={{ uri: getPhotoUri(photo.fileName) }} style={styles.photo} resizeMode="cover" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Poznane gatunki</Text>
          {species.length === 0 ? (
            <Text style={styles.muted}>Do tej wyprawy nie dodano gatunków.</Text>
          ) : (
            species.map((m) => (
              <Pressable
                key={m.id}
                style={styles.speciesRow}
                onPress={() => router.push({ pathname: '/mushroom/[id]', params: { id: m.id } })}
              >
                <View style={[styles.dot, { backgroundColor: categoryMeta[m.category].color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.speciesName}>{m.polishName}</Text>
                  <Text style={styles.speciesLatin}>{m.latinName}</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Pressable
            style={styles.editButton}
            onPress={() => router.push({ pathname: '/trip/edit/[id]', params: { id: String(trip.id) } })}
          >
            <Pencil size={18} color={colors.cream} />
            <Text style={styles.editText}>Edytuj wyprawę</Text>
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={confirmDelete}>
            <Trash2 size={18} color={colors.danger} />
            <Text style={styles.deleteText}>Usuń wyprawę</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={viewerUri !== null} transparent animationType="fade" onRequestClose={() => setViewerUri(null)}>
        <Pressable style={styles.viewer} onPress={() => setViewerUri(null)}>
          {viewerUri && <Image source={{ uri: viewerUri }} style={styles.viewerImage} resizeMode="contain" />}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.forest },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { fontFamily: fonts.medium, fontSize: 14, color: colors.earth },
  description: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.forest },
  muted: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  photo: { width: 200, height: 150, borderRadius: radius.md },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cream,
    padding: spacing.md,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  speciesName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.forest },
  speciesLatin: { fontFamily: fonts.regular, fontSize: 12.5, fontStyle: 'italic', color: colors.textMuted },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
  },
  editText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.cream },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  deleteText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.danger },
  viewer: { flex: 1, backgroundColor: '#000000E6', alignItems: 'center', justifyContent: 'center' },
  viewerImage: { width: '100%', height: '90%' },
});