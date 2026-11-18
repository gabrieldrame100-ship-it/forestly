import CustomButton from '@/components/CustomButton';
import FilterChips, { Chip } from '@/components/FilterChips';
import MushroomCard from '@/components/MushroomCard';
import SearchBar from '@/components/SearchBar';
import { habitatLabels } from '@/constants/mushroomMeta';
import { colors, fonts, spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { mushrooms } from '@/data/mushrooms';
import { filterMushrooms, SortOrder } from '@/services/mushroomFilters';
import { Category, Habitat } from '@/types/mushroom';
import { useRouter } from 'expo-router';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const categoryOptions: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'edible', label: 'Jadalne' },
  { value: 'inedible', label: 'Niejadalne' },
  { value: 'poisonous', label: 'Trujące' },
];

const habitatOptions: { value: Habitat | 'all'; label: string }[] = [
  { value: 'all', label: 'Dowolne siedlisko' },
  ...(Object.keys(habitatLabels) as Habitat[]).map((h) => ({ value: h, label: habitatLabels[h] })),
];

export default function AtlasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favoriteIds, toggleFavorite } = useUserData();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [habitat, setHabitat] = useState<Habitat | 'all'>('all');
  const [inSeasonNow, setInSeasonNow] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sort, setSort] = useState<SortOrder>('asc');

  const results = useMemo(() => {
    const filtered = filterMushrooms(mushrooms, { query, category, habitat, inSeasonNow, sort });
    return onlyFavorites ? filtered.filter((m) => favoriteIds.has(m.id)) : filtered;
  }, [query, category, habitat, inSeasonNow, sort, onlyFavorites, favoriteIds]);

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
    setHabitat('all');
    setInSeasonNow(false);
    setOnlyFavorites(false);
  };

  const emptyMessage =
    onlyFavorites && favoriteIds.size === 0
      ? 'Nie masz jeszcze ulubionych gatunków. Dotknij serca na karcie grzyba.'
      : 'Spróbuj innej frazy albo usuń część filtrów.';

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>Atlas</Text>
      <Text style={styles.subtitle}>
        {results.length} z {mushrooms.length} gatunków
      </Text>
      <SearchBar value={query} onChangeText={setQuery} />
      <FilterChips options={categoryOptions} value={category} onChange={setCategory} />
      <FilterChips options={habitatOptions} value={habitat} onChange={setHabitat} />
      <View style={styles.toolbar}>
        <View style={styles.toolbarChips}>
          <Chip label="W sezonie teraz" active={inSeasonNow} onPress={() => setInSeasonNow((v) => !v)} />
          <Chip label="Ulubione" active={onlyFavorites} onPress={() => setOnlyFavorites((v) => !v)} />
        </View>
        <Pressable style={styles.sortButton} onPress={() => setSort((s) => (s === 'asc' ? 'desc' : 'asc'))}>
          {sort === 'asc' ? (
            <ArrowDownAZ size={18} color={colors.forest} />
          ) : (
            <ArrowUpAZ size={18} color={colors.forest} />
          )}
          <Text style={styles.sortText}>{sort === 'asc' ? 'A–Z' : 'Z–A'}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      data={results}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MushroomCard
          mushroom={item}
          isFavorite={favoriteIds.has(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
          onPress={() => router.push({ pathname: '/mushroom/[id]', params: { id: item.id } })}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nic nie znaleziono</Text>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
          <CustomButton title="Wyczyść filtry" onPress={resetFilters} />
        </View>
      }
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
      }}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { gap: spacing.md, marginBottom: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.forest },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.olive, marginTop: -spacing.sm },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolbarChips: { flexDirection: 'row', gap: spacing.sm },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  sortText: { fontFamily: fonts.medium, fontSize: 13, color: colors.forest },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.forest },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});