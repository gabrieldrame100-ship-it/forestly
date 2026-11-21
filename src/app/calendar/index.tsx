import MushroomCard from '@/components/MushroomCard';
import ScreenHeader from '@/components/ScreenHeader';
import { MONTH_NAMES, MONTH_SHORT } from '@/constants/months';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { mushrooms } from '@/data/mushrooms';
import { monthInRange } from '@/services/mushroomFilters';
import { Category } from '@/types/mushroom';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CHART_HEIGHT = 120;
const categories: Category[] = ['edible', 'inedible', 'poisonous'];

const speciesLabel = (n: number) => (n === 1 ? 'gatunek' : n >= 2 && n <= 4 ? 'gatunki' : 'gatunków');

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favoriteIds, toggleFavorite } = useUserData();

  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthCounts = useMemo(
    () =>
      MONTH_NAMES.map(
        (_, index) => mushrooms.filter((m) => monthInRange(index + 1, m.seasonFrom, m.seasonTo)).length
      ),
    []
  );
  const maxCount = Math.max(...monthCounts, 1);

  const inSeason = useMemo(
    () =>
      mushrooms
        .filter((m) => monthInRange(selectedMonth, m.seasonFrom, m.seasonTo))
        .sort((a, b) => a.polishName.localeCompare(b.polishName, 'pl')),
    [selectedMonth]
  );

  const categoryCounts = categories.map((category) => ({
    category,
    count: inSeason.filter((m) => m.category === category).length,
  }));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.lg,
      }}
    >
      <ScreenHeader title="Kalendarz sezonowości" subtitle="Kiedy można spotkać poszczególne gatunki" />

      <View style={styles.chartCard}>
        <View style={styles.chart}>
          {monthCounts.map((count, index) => {
            const month = index + 1;
            const selected = month === selectedMonth;
            const barHeight = Math.max(6, (count / maxCount) * CHART_HEIGHT);
            return (
              <Pressable
                key={month}
                style={styles.column}
                onPress={() => setSelectedMonth(month)}
                accessibilityRole="button"
                accessibilityLabel={`${MONTH_NAMES[index]}: ${count} ${speciesLabel(count)}`}
              >
                <Text style={[styles.count, selected && styles.countSelected]}>{count}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      { height: barHeight, backgroundColor: selected ? colors.forest : colors.olive + '99' },
                    ]}
                  />
                </View>
                <Text style={[styles.monthLabel, selected && styles.monthLabelSelected]}>{MONTH_SHORT[index]}</Text>
                <View style={[styles.nowDot, month !== currentMonth && { opacity: 0 }]} />
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.note}>
          Kropka oznacza obecny miesiąc. Terminy są orientacyjne dla Polski, a rzeczywiste występowanie zależy od
          lokalnej pogody i warunków.
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <View style={styles.monthHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.monthTitle}>{MONTH_NAMES[selectedMonth - 1]}</Text>
            <Text style={styles.monthSubtitle}>
              {inSeason.length} {speciesLabel(inSeason.length)} w sezonie
            </Text>
          </View>
          {selectedMonth !== currentMonth && (
            <Pressable style={styles.nowButton} onPress={() => setSelectedMonth(currentMonth)}>
              <Text style={styles.nowButtonText}>Obecny miesiąc</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.legend}>
          {categoryCounts.map(({ category, count }) => (
            <View key={category} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: categoryMeta[category].color }]} />
              <Text style={styles.legendText}>
                {categoryMeta[category].label}: {count}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {inSeason.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>W tym miesiącu żaden gatunek z atlasu nie ma sezonu.</Text>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {inSeason.map((mushroom) => (
            <MushroomCard
              key={mushroom.id}
              mushroom={mushroom}
              isFavorite={favoriteIds.has(mushroom.id)}
              onToggleFavorite={() => toggleFavorite(mushroom.id)}
              onPress={() => router.push({ pathname: '/mushroom/[id]', params: { id: mushroom.id } })}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  column: { flex: 1, alignItems: 'center', gap: 4 },
  count: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
  countSelected: { fontFamily: fonts.bold, color: colors.forest },
  barTrack: { height: CHART_HEIGHT, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6 },
  monthLabel: { fontFamily: fonts.medium, fontSize: 10.5, color: colors.textMuted },
  monthLabelSelected: { fontFamily: fonts.bold, color: colors.forest },
  nowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.earth },
  note: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  monthHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  monthTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.forest },
  monthSubtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.olive },
  nowButton: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.forest,
  },
  nowButtonText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.forest },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: fonts.medium, fontSize: 13, color: colors.forest },
  empty: { backgroundColor: colors.cream, borderRadius: radius.md, padding: spacing.md },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
});