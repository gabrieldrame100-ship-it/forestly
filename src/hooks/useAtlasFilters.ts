import { useMemo, useState } from 'react';
import { mushrooms } from '@/data/mushrooms';
import { filterMushrooms, SortOrder } from '@/services/mushroomFilters';
import { Category, Habitat } from '@/types/mushroom';

export function useAtlasFilters(favoriteIds: Set<string>) {
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

  const activeFilterCount =
    (habitat !== 'all' ? 1 : 0) +
    (inSeasonNow ? 1 : 0) +
    (onlyFavorites ? 1 : 0);

  const signature =
    `${query}|${category}|${habitat}|${inSeasonNow}|${onlyFavorites}|${sort}|${results.length}`;

  const resetSheetFilters = () => {
    setHabitat('all');
    setInSeasonNow(false);
    setOnlyFavorites(false);
    setSort('asc');
  };

  const resetAll = () => {
    resetSheetFilters();
    setQuery('');
    setCategory('all');
  };

  return {
    results,
    signature,
    activeFilterCount,
    query,
    setQuery,
    category,
    setCategory,
    habitat,
    setHabitat,
    inSeasonNow,
    setInSeasonNow,
    onlyFavorites,
    setOnlyFavorites,
    sort,
    setSort,
    resetSheetFilters,
    resetAll,
  };
}
