import CustomButton from '@/components/CustomButton';
import FilterChips, { Chip } from '@/components/FilterChips';
import MushroomCard from '@/components/MushroomCard';
import SearchBar from '@/components/SearchBar';
import { habitatLabels } from '@/constants/mushroomMeta';
import { colors, fonts, spacing } from '@/constants/theme';
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

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [habitat, setHabitat] = useState<Habitat | 'all'>('all');
  const [inSeasonNow, setInSeasonNow] = useState(false);
  const [sort, setSort] = useState<SortOrder>('asc');

  const results = useMemo(
    () => filterMushrooms(mushrooms, { query, category, habitat, inSeasonNow, sort }),
    [query, category, habitat, inSeasonNow, sort]
  );

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
    setHabitat('all');
    setInSeasonNow(false);
  };

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
        <Chip label="W sezonie" active={inSeasonNow} onPress={() => setInSeasonNow((v) => !v)} />
        <Pressable style={styles.sortButton} onPress={() => setSort((s) => (s === 'asc' ? 'desc' : 'asc'))}>
          {sort === 'asc' ? (
            <ArrowDownAZ size={18} color={colors.forest} />
          ) : (
            <ArrowUpAZ size={18} color={colors.forest} />
          )}
          <Text style={styles.sortText}>{sort === 'asc' ? 'A do Z' : 'Z do A'}</Text>
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
          onPress={() => router.push({ pathname: '/mushroom/[id]', params: { id: item.id } })}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nie znaleziono grzybów</Text>
          <Text style={styles.emptyText}>Spróbuj innego wyszukiwania lub usuń część filtrów.</Text>
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
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  sortText: { fontFamily: fonts.medium, fontSize: 13, color: colors.forest },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.forest },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginBottom: spacing.md },
});