import { mushrooms } from '@/data/mushrooms';

export type AchievementMetric = 'species' | 'trips';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  metric: AchievementMetric;
  target: number;
};

export const achievements: Achievement[] = [
  {
    id: 'first-discovery',
    title: 'Pierwsze odkrycie',
    description: 'Poznaj swój pierwszy gatunek.',
    metric: 'species',
    target: 1,
  },
  {
    id: 'forest-explorer',
    title: 'Leśny odkrywca',
    description: 'Poznaj 5 gatunków.',
    metric: 'species',
    target: 5,
  },
  {
    id: 'mushroom-enthusiast',
    title: 'Pasjonat grzybów',
    description: 'Poznaj 10 gatunków.',
    metric: 'species',
    target: 10,
  },
  {
    id: 'nature-collector',
    title: 'Kolekcjoner natury',
    description: 'Poznaj wszystkie gatunki z atlasu.',
    metric: 'species',
    target: mushrooms.length,
  },
  {
    id: 'first-trip',
    title: 'Pierwsza wyprawa',
    description: 'Zapisz swoją pierwszą wyprawę w dzienniku.',
    metric: 'trips',
    target: 1,
  },
];