import CustomButton from '@/components/CustomButton';
import MushroomIllustration from '@/components/MushroomIllustration';
import TripCard from '@/components/TripCard';
import { colors, fonts, shadow, spacing } from '@/constants/theme';
import { useTrips } from '@/hooks/useTrips';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, loading, error, reload } = useTrips();

  const openNew = () => router.push('/trip/new');

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.forest} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Coś poszło nie tak</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <CustomButton title="Spróbuj ponownie" onPress={reload} />
        </View>
      );
    }
    return (
      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            onPress={() => router.push({ pathname: '/trip/[id]', params: { id: String(item.id) } })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <MushroomIllustration color={colors.olive} size={96} />
            <Text style={styles.emptyTitle}>Twój dziennik jest pusty</Text>
            <Text style={styles.emptyText}>Zapisuj swoje wyprawy do lasu: miejsca, zdjęcia i znalezione gatunki.</Text>
            <CustomButton title="Dodaj pierwszą wyprawę" onPress={openNew} />
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Dziennik</Text>
        <Text style={styles.subtitle}>
          {trips.length === 0 ? 'Brak wypraw' : `Zapisane wyprawy: ${trips.length}`}
        </Text>
      </View>

      {renderBody()}

      <Pressable
        style={styles.fab}
        onPress={openNew}
        accessibilityRole="button"
        accessibilityLabel="Dodaj wyprawę"
      >
        <Plus size={26} color={colors.cream} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.forest },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.olive },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.forest, marginTop: spacing.sm },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
});