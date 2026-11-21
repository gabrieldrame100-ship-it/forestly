import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftRight, CalendarDays, Leaf, Plus } from 'lucide-react-native';
import MushroomIllustration from '@/components/MushroomIllustration';
import TripCard from '@/components/TripCard';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, radius, spacing, shadow } from '@/constants/theme';
import { useProfile } from '@/context/ProfileContext';
import { useUserData } from '@/context/UserDataContext';
import { mushrooms } from '@/data/mushrooms';
import { useTrips } from '@/hooks/useTrips';
import { monthInRange } from '@/services/mushroomFilters';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName } = useProfile();
  const { discoveredIds, favoriteIds, tripCount } = useUserData();
  const { trips } = useTrips();

  const today = useMemo(() => new Date(), []);
  const dateLabel = today.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

  const mushroomOfTheDay = useMemo(() => {
    const startOfYear = new Date(today.getFullYear(), 0, 0).getTime();
    const dayOfYear = Math.floor((today.getTime() - startOfYear) / 86400000);
    return mushrooms[dayOfYear % mushrooms.length];
  }, [today]);

  const inSeason = useMemo(
    () => mushrooms.filter((m) => monthInRange(today.getMonth() + 1, m.seasonFrom, m.seasonTo)),
    [today]
  );

  const openMushroom = (id: string) => router.push({ pathname: '/mushroom/[id]', params: { id } });
  const heroMeta = categoryMeta[mushroomOfTheDay.category];
  const lastTrip = trips[0];

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
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{dateLabel}</Text>
          <Text style={styles.greeting}>{userName ? `Cześć, ${userName}!` : 'Cześć!'}</Text>
        </View>
        <Pressable
          style={styles.avatar}
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Otwórz profil"
        >
          {userName ? (
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          ) : (
            <Leaf size={20} color={colors.cream} />
          )}
        </Pressable>
      </View>

      <Pressable style={styles.hero} onPress={() => openMushroom(mushroomOfTheDay.id)}>
        {mushroomOfTheDay.image ? (
          <Image source={mushroomOfTheDay.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.heroIllustration, { backgroundColor: heroMeta.color + '26' }]}>
            <MushroomIllustration color={heroMeta.color} size={120} />
          </View>
        )}
        <View style={styles.heroLabel}>
          <Text style={styles.heroLabelText}>Grzyb dnia</Text>
        </View>
        <View style={styles.heroPanel}>
          <Text style={styles.heroName}>{mushroomOfTheDay.polishName}</Text>
          <Text style={styles.heroLatin}>{mushroomOfTheDay.latinName}</Text>
          <View style={styles.heroCategory}>
            <View style={[styles.heroDot, { backgroundColor: heroMeta.color }]} />
            <Text style={styles.heroCategoryText}>{heroMeta.label}</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{discoveredIds.size}/{mushrooms.length}</Text>
          <Text style={styles.statLabel}>Poznane</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{tripCount}</Text>
          <Text style={styles.statLabel}>Wyprawy</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{favoriteIds.size}</Text>
          <Text style={styles.statLabel}>Ulubione</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.action, styles.actionPrimary]} onPress={() => router.push('/trip/new')}>
          <Plus size={22} color={colors.cream} />
          <Text style={[styles.actionText, { color: colors.cream }]}>Nowa wyprawa</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={() => router.push('/calendar')}>
          <CalendarDays size={22} color={colors.forest} />
          <Text style={styles.actionText}>Kalendarz</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={() => router.push('/compare')}>
          <ArrowLeftRight size={22} color={colors.forest} />
          <Text style={styles.actionText}>Porównaj</Text>
        </Pressable>
      </View>

      {inSeason.length > 0 && (
        <View style={{ gap: spacing.sm }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Teraz w sezonie</Text>
            <Text style={styles.sectionCount}>{inSeason.length}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
            {inSeason.map((mushroom) => {
              const color = categoryMeta[mushroom.category].color;
              return (
                <Pressable key={mushroom.id} style={styles.seasonItem} onPress={() => openMushroom(mushroom.id)}>
                  <View style={[styles.seasonCircle, { backgroundColor: color + '26', borderColor: color }]}>
                    {mushroom.image ? (
                      <Image source={mushroom.image} style={styles.seasonPhoto} resizeMode="cover" />
                    ) : (
                      <MushroomIllustration color={color} size={40} />
                    )}
                  </View>
                  <Text style={styles.seasonName} numberOfLines={2}>{mushroom.polishName}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={{ gap: spacing.sm }}>
        <Text style={styles.sectionTitle}>Ostatnia wyprawa</Text>
        {lastTrip ? (
          <TripCard
            trip={lastTrip}
            onPress={() => router.push({ pathname: '/trip/[id]', params: { id: String(lastTrip.id) } })}
          />
        ) : (
          <Pressable style={styles.emptyTrip} onPress={() => router.push('/trip/new')}>
            <Text style={styles.emptyTripTitle}>Dziennik jest pusty</Text>
            <Text style={styles.emptyTripText}>Dotknij, żeby zapisać pierwszą wyprawę do lasu.</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  date: { fontFamily: fonts.medium, fontSize: 13, color: colors.earth, textTransform: 'capitalize' },
  greeting: { fontFamily: fonts.bold, fontSize: 26, color: colors.forest, marginTop: 2 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 18, color: colors.cream },
  hero: { height: 230, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.cream, ...shadow },
  heroIllustration: { alignItems: 'center', justifyContent: 'center', paddingBottom: 50 },
  heroLabel: { position: 'absolute', top: spacing.md, left: spacing.md, backgroundColor: colors.cream, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 5 },
  heroLabelText: { fontFamily: fonts.bold, fontSize: 12, color: colors.forest },
  heroPanel: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.md, backgroundColor: colors.forest + 'E0', gap: 2 },
  heroName: { fontFamily: fonts.bold, fontSize: 20, color: colors.cream },
  heroLatin: { fontFamily: fonts.regular, fontSize: 13, fontStyle: 'italic', color: colors.cream, opacity: 0.8 },
  heroCategory: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  heroDot: { width: 9, height: 9, borderRadius: 5 },
  heroCategoryText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.cream },
  stats: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, paddingVertical: spacing.md, ...shadow },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: fonts.bold, fontSize: 20, color: colors.forest },
  statLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  statDivider: { width: 1, height: 32, backgroundColor: colors.cream },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.cream },
  actionPrimary: { backgroundColor: colors.forest },
  actionText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.forest },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.forest },
  sectionCount: { fontFamily: fonts.semibold, fontSize: 12, color: colors.cream, backgroundColor: colors.olive, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  seasonItem: { width: 78, alignItems: 'center', gap: 6 },
  seasonCircle: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  seasonPhoto: { width: '100%', height: '100%' },
  seasonName: { fontFamily: fonts.medium, fontSize: 11.5, textAlign: 'center', color: colors.forest },
  emptyTrip: { backgroundColor: colors.cream, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  emptyTripTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.forest },
  emptyTripText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.textMuted },
});
