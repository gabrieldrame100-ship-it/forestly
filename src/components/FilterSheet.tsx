import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip } from '@/components/FilterChips';
import CustomButton from '@/components/CustomButton';
import { habitatLabels } from '@/constants/mushroomMeta';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { SortOrder } from '@/services/mushroomFilters';
import { Habitat } from '@/types/mushroom';

type Props = {
  visible: boolean;
  onClose: () => void;
  resultCount: number;
  habitat: Habitat | 'all';
  onHabitatChange: (value: Habitat | 'all') => void;
  inSeasonNow: boolean;
  onInSeasonNowChange: (value: boolean) => void;
  onlyFavorites: boolean;
  onOnlyFavoritesChange: (value: boolean) => void;
  sort: SortOrder;
  onSortChange: (value: SortOrder) => void;
  onReset: () => void;
};

const habitatOptions: { value: Habitat | 'all'; label: string }[] = [
  { value: 'all', label: 'Dowolne' },
  ...(Object.keys(habitatLabels) as Habitat[]).map((h) => ({
    value: h,
    label: habitatLabels[h],
  })),
];

export default function FilterSheet({
  visible,
  onClose,
  resultCount,
  habitat,
  onHabitatChange,
  inSeasonNow,
  onInSeasonNowChange,
  onlyFavorites,
  onOnlyFavoritesChange,
  sort,
  onSortChange,
  onReset,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />

          <View style={styles.titleRow}>
            <Text style={styles.title}>Filtry</Text>
            <Pressable onPress={onReset} hitSlop={10}>
              <Text style={styles.reset}>Wyczyść</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Siedlisko</Text>
          <View style={styles.wrap}>
            {habitatOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                active={habitat === option.value}
                onPress={() => onHabitatChange(option.value)}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Dodatkowe</Text>
          <View style={styles.wrap}>
            <Chip
              label="W sezonie teraz"
              active={inSeasonNow}
              onPress={() => onInSeasonNowChange(!inSeasonNow)}
            />
            <Chip
              label="Ulubione"
              active={onlyFavorites}
              onPress={() => onOnlyFavoritesChange(!onlyFavorites)}
            />
          </View>

          <Text style={styles.sectionTitle}>Sortowanie</Text>
          <View style={styles.wrap}>
            <Chip label="A–Z" active={sort === 'asc'} onPress={() => onSortChange('asc')} />
            <Chip label="Z–A" active={sort === 'desc'} onPress={() => onSortChange('desc')} />
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <CustomButton title={`Pokaż wyniki (${resultCount})`} onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.forest + '73' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cream,
    marginBottom: spacing.md,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.forest },
  reset: { fontFamily: fonts.semibold, fontSize: 14, color: colors.earth },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.forest,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
