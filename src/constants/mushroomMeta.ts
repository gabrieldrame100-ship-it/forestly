import { colors } from '@/constants/theme';
import { Category, Habitat } from '@/types/mushroom';

export const categoryMeta: Record<Category, { label: string; color: string }> = {
  edible: { label: 'Jadalny', color: colors.olive },
  inedible: { label: 'Niejadalny', color: colors.earth },
  poisonous: { label: 'Trujący', color: colors.danger },
};

export const habitatLabels: Record<Habitat, string> = {
  coniferous: 'Las iglasty',
  deciduous: 'Las liściasty',
  mixed: 'Las mieszany',
  meadow: 'Łąki i pastwiska',
  deadwood: 'Martwe drewno',
};

export const monthShort = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

export const monthLetters = ['S', 'L', 'M', 'K', 'M', 'C', 'L', 'S', 'W', 'P', 'L', 'G'];