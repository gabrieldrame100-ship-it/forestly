import { Award, Compass, Flag, Sprout, Trophy } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export const achievementIcons: Record<string, LucideIcon> = {
  'first-discovery': Sprout,
  'forest-explorer': Compass,
  'mushroom-enthusiast': Award,
  'nature-collector': Trophy,
  'first-trip': Flag,
};
