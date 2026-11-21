import CategoryBadge from '@/components/CategoryBadge';
import MushroomIllustration from '@/components/MushroomIllustration';
import MushroomSelectModal from '@/components/MushroomSelectModal';
import ScreenHeader from '@/components/ScreenHeader';
import { categoryMeta, habitatLabels } from '@/constants/mushroomMeta';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { getMushroomById, mushrooms } from '@/data/mushrooms';
import { formatSeason } from '@/services/mushroomFilters';
import { Mushroom } from '@/types/mushroom';
import { ArrowLeftRight, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const rows: { label: string; value: (m: Mushroom) => string }[] = [
  { label: 'Kapelusz', value: (m) => m.cap },
  { label: 'Trzon', value: (m) => m.stem },
  { label: 'Hymenofor', value: (m) => m.hymenophore },
  { label: 'Siedlisko', value: (m) => m.habitats.map((h) => habitatLabels[h]).join(', ') },
  { label: 'Sezon', value: (m) => formatSeason(m) },
  { label: 'Opis', value: (m) => m.description },
];

// Pary podobnych gatunków wyliczone z danych atlasu (bez powtórzeń).
const similarPairs: [Mushroom, Mushroom][] = (() => {
  const seen = new Set<string>();
  const pairs: [Mushroom, Mushroom][] = [];
  mushrooms.forEach((m) =>
    m.similar.forEach((otherId) => {
      const other = getMushroomById(otherId);
      if (!other) return;
      const key = [m.id, other.id].sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      pairs.push([m, other]);
    })
  );
  return pairs;
})();

function Slot({ mushroom, onPress }: { mushroom?: Mushroom; onPress: () => void }) {
  if (!mushroom) {
    return (
      <Pressable style={[styles.slot, styles.slotEmpty]} onPress={onPress}>
        <Plus size={24} color={colors.forest} />
        <Text style={styles.slotEmptyText}>Wybierz gatunek</Text>
      </Pressable>
    );
  }
  const color = categoryMeta[mushroom.category].color;
  return (
    <Pressable style={styles.slot} onPress={onPress}>
      <View style={[styles.slotMedia, { backgroundColor: color + '26' }]}>
        {mushroom.image ? (
          <Image source={mushroom.image} style={styles.slotPhoto} resizeMode="cover" />
        ) : (
          <MushroomIllustration color={color} size={56} />
        )}
      </View>
      <Text style={styles.slotName} numberOfLines={2}>
        {mushroom.polishName}
      </Text>
      <Text style={styles.slotLatin} numberOfLines={1}>
        {mushroom.latinName}
      </Text>
    </Pressable>
  );
}

export default function CompareScreen() {
  const insets = useSafeAreaInsets();
  const [leftId, setLeftId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<'left' | 'right' | null>(null);

  const left = leftId ? getMushroomById(leftId) : undefined;
  const right = rightId ? getMushroomById(rightId) : undefined;

  const handleSelect = (id: string) => {
    if (selecting === 'left') setLeftId(id);
    if (selecting === 'right') setRightId(id);
    setSelecting(null);
  };

  const swap = () => {
    setLeftId(rightId);
    setRightId(leftId);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.lg,
        }}
      >
        <ScreenHeader title="Porównaj gatunki" subtitle="Cechy dwóch grzybów obok siebie" />

        <Text style={styles.disclaimer}>
          Porównanie ma charakter edukacyjny i nie służy do sprawdzania, czy znaleziony grzyb jest jadalny.
        </Text>

        <View style={styles.slots}>
          <Slot mushroom={left} onPress={() => setSelecting('left')} />
          <Pressable
            style={styles.swap}
            onPress={swap}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Zamień miejscami"
          >
            <ArrowLeftRight size={18} color={colors.forest} />
          </Pressable>
          <Slot mushroom={right} onPress={() => setSelecting('right')} />
        </View>

        {left && right ? (
          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Kategoria</Text>
              <View style={styles.rowCells}>
                <View style={styles.cell}>
                  <CategoryBadge category={left.category} />
                </View>
                <View style={styles.divider} />
                <View style={styles.cell}>
                  <CategoryBadge category={right.category} />
                </View>
              </View>
            </View>
            {rows.map((row) => (
              <View key={row.label} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <View style={styles.rowCells}>
                  <View style={styles.cell}>
                    <Text style={styles.cellText}>{row.value(left)}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.cell}>
                    <Text style={styles.cellText}>{row.value(right)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.hint}>Wybierz dwa gatunki albo zacznij od pary podobnych grzybów:</Text>
            {similarPairs.map(([a, b]) => (
              <Pressable
                key={`${a.id}-${b.id}`}
                style={styles.pair}
                onPress={() => {
                  setLeftId(a.id);
                  setRightId(b.id);
                }}
              >
                <Text style={styles.pairText} numberOfLines={2}>
                  {a.polishName} i {b.polishName}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <MushroomSelectModal
        visible={selecting !== null}
        excludeId={selecting === 'left' ? rightId : leftId}
        onSelect={handleSelect}
        onClose={() => setSelecting(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  disclaimer: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.textMuted },
  slots: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  slot: {
    flex: 1,
    minHeight: 168,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: 4,
    alignItems: 'center',
  },
  slotEmpty: {
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.forest,
    backgroundColor: colors.background,
  },
  slotEmptyText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.forest },
  slotMedia: {
    width: '100%',
    height: 90,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slotPhoto: { width: '100%', height: '100%' },
  slotName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.forest, textAlign: 'center', marginTop: 4 },
  slotLatin: { fontFamily: fonts.regular, fontSize: 11.5, fontStyle: 'italic', color: colors.textMuted },
  swap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  table: { gap: spacing.sm },
  row: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  rowLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.earth },
  rowCells: { flexDirection: 'row', gap: spacing.md },
  cell: { flex: 1 },
  divider: { width: 1, backgroundColor: colors.cream },
  cellText: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.text },
  hint: { fontFamily: fonts.medium, fontSize: 14, color: colors.forest },
  pair: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cream,
    padding: spacing.md,
  },
  pairText: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.forest },
});