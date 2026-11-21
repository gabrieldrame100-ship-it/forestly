import type { LucideIcon } from 'lucide-react-native';
import { Ban, Layers, Skull, Utensils } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { mushrooms } from '@/data/mushrooms';
import { Category } from '@/types/mushroom';

type Value = Category | 'all';

const countFor = (value: Value) =>
  value === 'all' ? mushrooms.length : mushrooms.filter((m) => m.category === value).length;

const tiles: { value: Value; label: string; icon: LucideIcon; color: string; count: number }[] = [
  { value: 'all', label: 'Wszystkie', icon: Layers, color: colors.forest, count: countFor('all') },
  { value: 'edible', label: 'Jadalne', icon: Utensils, color: categoryMeta.edible.color, count: countFor('edible') },
  { value: 'inedible', label: 'Niejadalne', icon: Ban, color: categoryMeta.inedible.color, count: countFor('inedible') },
  { value: 'poisonous', label: 'Trujące', icon: Skull, color: categoryMeta.poisonous.color, count: countFor('poisonous') },
];

type Props = { value: Value; onChange: (value: Value) => void };

export default function CategoryTiles({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {tiles.map((tile) => {
        const active = tile.value === value;
        const Icon = tile.icon;
        return (
          <Pressable
            key={tile.value}
            onPress={() => onChange(tile.value)}
            style={[styles.tile, active && { backgroundColor: tile.color, borderColor: tile.color }]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Icon size={20} color={active ? colors.cream : tile.color} />
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1} adjustsFontSizeToFit>
              {tile.label}
            </Text>
            <Text style={[styles.count, active && styles.countActive]}>{tile.count}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.cream,
    backgroundColor: colors.white,
  },
  label: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.forest, marginTop: 2 },
  labelActive: { color: colors.cream },
  count: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
  countActive: { color: colors.cream, opacity: 0.85 },
});
