import AchievementCard from '@/components/AchievementCard';
import CollectionTile from '@/components/CollectionTile';
import ProgressRing from '@/components/ProgressRing';
import StatCard from '@/components/StatCard';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { achievements } from '@/data/achievements';
import { getMushroomById, mushrooms } from '@/data/mushrooms';
import { Discovery, getRecentDiscoveries } from '@/database/collectionRepository';
import { formatDate } from '@/services/dateUtils';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Heart, Leaf, Notebook } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GRID_COLUMNS = 3;
const GRID_GAP = 10;

const sortedMushrooms = [...mushrooms].sort((a, b) => a.polishName.localeCompare(b.polishName, 'pl'));

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const { width } = useWindowDimensions();
  const { discoveredIds, favoriteIds, tripCount, unlockedAchievementIds } = useUserData();

  const [recent, setRecent] = useState<Discovery[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getRecentDiscoveries(db, 5)
        .then((rows) => {
          if (active) setRecent(rows);
        })
        .catch((error) => console.error(error));
      return () => {
        active = false;
      };
    }, [db, discoveredIds])
  );

  const total = mushrooms.length;
  const count = discoveredIds.size;
  const progress = total === 0 ? 0 : count / total;
  const tileSize = (width - spacing.lg * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  const message = useMemo(() => {
    if (count === 0) return 'Zacznij od oznaczenia pierwszego gatunku jako poznanego.';
    if (count === total) return 'Masz już wszystkie gatunki z atlasu!';
    return `Do pełnej kolekcji brakuje jeszcze ${total - count}.`;
  }, [count, total]);

  const openMushroom = (id: string) => router.push({ pathname: '/mushroom/[id]', params: { id } });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: insets.top + spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      }}
    >
      <View>
        <Text style={styles.title}>Kolekcja</Text>
        <Text style={styles.subtitle}>Twoje poznane gatunki i osiągnięcia</Text>
      </View>

      <View style={styles.progressCard}>
        <ProgressRing progress={progress} label={`${Math.round(progress * 100)}%`} sublabel={`${count} z ${total}`} />
        <View style={styles.progressText}>
          <Text style={styles.progressTitle}>Poznane gatunki</Text>
          <Text style={styles.progressMessage}>{message}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard icon={<Leaf size={20} color={colors.olive} />} value={String(count)} label="Poznane" />
        <StatCard icon={<Notebook size={20} color={colors.earth} />} value={String(tripCount)} label="Wyprawy" />
        <StatCard icon={<Heart size={20} color={colors.earth} />} value={String(favoriteIds.size)} label="Ulubione" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Osiągnięcia</Text>
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            current={achievement.metric === 'species' ? count : tripCount}
            unlocked={unlockedAchievementIds.has(achievement.id)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ostatnio poznane</Text>
        {recent.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Nic tu jeszcze nie ma. Oznacz gatunek jako poznany na jego stronie albo dodaj go do wyprawy.
            </Text>
          </View>
        ) : (
          recent.map((discovery) => {
            const mushroom = getMushroomById(discovery.mushroomId);
            if (!mushroom) return null;
            return (
              <Pressable key={discovery.mushroomId} style={styles.recentRow} onPress={() => openMushroom(mushroom.id)}>
                <View style={[styles.dot, { backgroundColor: categoryMeta[mushroom.category].color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentName}>{mushroom.polishName}</Text>
                  <Text style={styles.recentLatin}>{mushroom.latinName}</Text>
                </View>
                <Text style={styles.recentDate}>{formatDate(discovery.discoveredAt.slice(0, 10))}</Text>
              </Pressable>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wszystkie gatunki</Text>
        <View style={styles.grid}>
          {sortedMushrooms.map((mushroom) => (
            <CollectionTile
              key={mushroom.id}
              mushroom={mushroom}
              discovered={discoveredIds.has(mushroom.id)}
              size={tileSize}
              onPress={() => openMushroom(mushroom.id)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.forest },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.olive },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow,
  },
  progressText: { flex: 1, gap: spacing.xs },
  progressTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.forest },
  progressMessage: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.forest },
  emptyBox: { backgroundColor: colors.cream, borderRadius: radius.md, padding: spacing.md },
  emptyText: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textMuted },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  recentName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.forest },
  recentLatin: { fontFamily: fonts.regular, fontSize: 12.5, fontStyle: 'italic', color: colors.textMuted },
  recentDate: { fontFamily: fonts.medium, fontSize: 12, color: colors.earth },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
});