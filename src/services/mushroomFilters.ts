import { monthShort } from '@/constants/mushroomMeta';
import { Category, Habitat, Mushroom } from '@/types/mushroom';

export type SortOrder = 'asc' | 'desc';

export type Filters = {
  query: string;
  category: Category | 'all';
  habitat: Habitat | 'all';
  inSeasonNow: boolean;
  sort: SortOrder;
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const monthInRange = (month: number, from: number, to: number) =>
  from <= to ? month >= from && month <= to : month >= from || month <= to;

export const isInSeason = (m: Mushroom, month: number) => monthInRange(month, m.seasonFrom, m.seasonTo);

export const formatSeason = (m: Mushroom) => `${monthShort[m.seasonFrom - 1]} – ${monthShort[m.seasonTo - 1]}`;

export function filterMushrooms(list: Mushroom[], filters: Filters): Mushroom[] {
  const month = new Date().getMonth() + 1;
  const query = normalize(filters.query.trim());

  const result = list.filter((m) => {
    if (query && !normalize(m.polishName).includes(query) && !normalize(m.latinName).includes(query)) {
      return false;
    }
    if (filters.category !== 'all' && m.category !== filters.category) return false;
    if (filters.habitat !== 'all' && !m.habitats.includes(filters.habitat)) return false;
    if (filters.inSeasonNow && !isInSeason(m, month)) return false;
    return true;
  });

  result.sort((a, b) => a.polishName.localeCompare(b.polishName, 'pl'));
  if (filters.sort === 'desc') result.reverse();
  return result;
}