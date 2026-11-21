import CarouselCard from '@/components/CarouselCard';
import CustomButton from '@/components/CustomButton';
import FilterChips from '@/components/FilterChips';
import FilterSheet from '@/components/FilterSheet';
import GridTile from '@/components/GridTile';
import SearchBar from '@/components/SearchBar';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { mushrooms } from '@/data/mushrooms';
import { useAtlasFilters } from '@/hooks/useAtlasFilters';
import { Category, Mushroom } from '@/types/mushroom';
import { useRouter } from 'expo-router';
import { ArrowLeftRight, CalendarDays, GalleryHorizontal, LayoutGrid, SlidersHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CARD_GAP = 14;
const GRID_COLUMNS = 3;
const GRID_GAP = 10;

const categoryOptions: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'edible', label: 'Jadalne' },
  { value: 'inedible', label: 'Niejadalne' },
  { value: 'poisonous', label: 'Trujące' },
];

type ViewMode = 'carousel' | 'grid';

type CarouselViewProps = {
  data: Mushroom[];
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onOpen: (id: string) => void;
};

// Karuzela ma własny stan (pozycję przewijania). Ekran nadaje jej `key`, więc po zmianie
// filtrów albo widoku powstaje od nowa i sama zaczyna od pierwszej karty.
function CarouselView({ data, favoriteIds, onToggleFavorite, onOpen }: CarouselViewProps) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [scrollX] = useState(() => new Animated.Value(0));

  const cardWidth = width * 0.72;
  const cardHeight = Math.min(cardWidth * 1.45, height * 0.5);
  const interval = cardWidth + CARD_GAP;
  const sidePadding = (width - cardWidth) / 2;

  const renderCard = ({ item, index: itemIndex }: ListRenderItemInfo<Mushroom>) => (
    <CarouselCard
      mushroom={item}
      index={itemIndex}
      scrollX={scrollX}
      width={cardWidth}
      height={cardHeight}
      interval={interval}
      isFavorite={favoriteIds.has(item.id)}
      onToggleFavorite={() => onToggleFavorite(item.id)}
      onPress={() => onOpen(item.id)}
    />
  );

  return (
    <View style={styles.carouselArea}>
      <Animated.FlatList
        data={data}
        horizontal
        keyExtractor={(item: Mushroom) => item.id}
        renderItem={renderCard}
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        style={{ flexGrow: 0 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        onMomentumScrollEnd={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / interval))}
      />
      <Text style={styles.counter}>
        {Math.min(index + 1, data.length)} / {data.length}
      </Text>
    </View>
  );
}

export default function AtlasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { favoriteIds, toggleFavorite } = useUserData();
  const filters = useAtlasFilters(favoriteIds);
  const { results } = filters;

  const [viewMode, setViewMode] = useState<ViewMode>('carousel');
  const [sheetOpen, setSheetOpen] = useState(false);

  const gridPadding = spacing.lg;
  const tileSize = (width - gridPadding * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  const openDetail = (id: string) => router.push({ pathname: '/mushroom/[id]', params: { id } });

  const renderTile = ({ item }: ListRenderItemInfo<Mushroom>) => (
    <GridTile
      mushroom={item}
      size={tileSize}
      isFavorite={favoriteIds.has(item.id)}
      onPress={() => openDetail(item.id)}
    />
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Atlas</Text>
            <Text style={styles.subtitle}>
              {results.length} z {mushrooms.length} gatunków
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/calendar')}
              accessibilityRole="button"
              accessibilityLabel="Kalendarz sezonowości"
            >
              <CalendarDays size={20} color={colors.forest} />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/compare')}
              accessibilityRole="button"
              accessibilityLabel="Porównaj gatunki"
            >
              <ArrowLeftRight size={20} color={colors.forest} />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => setViewMode((mode) => (mode === 'carousel' ? 'grid' : 'carousel'))}
              accessibilityRole="button"
              accessibilityLabel={viewMode === 'carousel' ? 'Pokaż siatkę' : 'Pokaż karuzelę'}
            >
              {viewMode === 'carousel' ? (
                <LayoutGrid size={20} color={colors.forest} />
              ) : (
                <GalleryHorizontal size={20} color={colors.forest} />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar value={filters.query} onChangeText={filters.setQuery} />
          </View>
          <Pressable
            style={styles.filterButton}
            onPress={() => setSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Otwórz filtry"
          >
            <SlidersHorizontal size={20} color={colors.cream} />
            {filters.activeFilterCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{filters.activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <FilterChips options={categoryOptions} value={filters.category} onChange={filters.setCategory} />
      </View>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nic nie znaleziono</Text>
          <Text style={styles.emptyText}>
            {filters.onlyFavorites && favoriteIds.size === 0
              ? 'Nie masz jeszcze ulubionych gatunków. Dotknij serca na karcie grzyba.'
              : 'Spróbuj innej frazy albo usuń część filtrów.'}
          </Text>
          <CustomButton title="Wyczyść filtry" onPress={filters.resetAll} />
        </View>
      ) : viewMode === 'carousel' ? (
        <CarouselView
          key={filters.signature}
          data={results}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          onOpen={openDetail}
        />
      ) : (
        <FlatList
          key="grid"
          data={results}
          numColumns={GRID_COLUMNS}
          keyExtractor={(item) => item.id}
          renderItem={renderTile}
          columnWrapperStyle={{ gap: GRID_GAP }}
          ItemSeparatorComponent={() => <View style={{ height: GRID_GAP }} />}
          contentContainerStyle={{
            paddingHorizontal: gridPadding,
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
          }}
        />
      )}

      <FilterSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        resultCount={results.length}
        habitat={filters.habitat}
        onHabitatChange={filters.setHabitat}
        inSeasonNow={filters.inSeasonNow}
        onInSeasonNowChange={filters.setInSeasonNow}
        onlyFavorites={filters.onlyFavorites}
        onOnlyFavoritesChange={filters.setOnlyFavorites}
        sort={filters.sort}
        onSortChange={filters.setSort}
        onReset={filters.resetSheetFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, gap: spacing.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.forest },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.olive },
  actions: { flexDirection: 'row', gap: spacing.sm },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.earth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontFamily: fonts.bold, fontSize: 11, color: '#FFFFFF' },
  carouselArea: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },
  counter: {
    textAlign: 'center',
    marginTop: spacing.md,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.olive,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.forest },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});