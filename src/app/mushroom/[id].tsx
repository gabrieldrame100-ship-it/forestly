import CategoryBadge from '@/components/CategoryBadge';
import CustomButton from '@/components/CustomButton';
import EmptyState from '@/components/EmptyState';
import MushroomIllustration from '@/components/MushroomIllustration';
import SeasonBar from '@/components/SeasonBar';
import { categoryMeta, habitatLabels } from '@/constants/mushroomMeta';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { getMushroomById } from '@/data/mushrooms';
import { formatSeason } from '@/services/mushroomFilters';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ShieldAlert } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FeatureRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureValue}>{value}</Text>
    </View>
  );
}

export default function MushroomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const mushroom = id ? getMushroomById(id) : undefined;

  if (!mushroom) {
    return (
      <View style={{ flex: 1 }}>
        <EmptyState title="Nie znaleziono" message="Nie mogliśmy znaleźć tego grzyba." />
        <View style={styles.notFoundButton}>
          <CustomButton title="Wróć" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const color = categoryMeta[mushroom.category].color;
  const similar = mushroom.similar
    .map((similarId) => getMushroomById(similarId))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={[styles.hero, { backgroundColor: color + '26', paddingTop: insets.top + 56 }]}>
          {mushroom.image ? (
            <Image source={mushroom.image} style={styles.heroPhoto} resizeMode="cover" />
          ) : (
            <MushroomIllustration color={color} size={140} />
          )}
        </View>

        <View style={styles.body}>
          <CategoryBadge category={mushroom.category} />
          <Text style={styles.name}>{mushroom.polishName}</Text>
          <Text style={styles.latin}>{mushroom.latinName}</Text>

          {mushroom.warning && (
            <View style={[styles.warning, mushroom.category === 'poisonous' && styles.warningDanger]}>
              <ShieldAlert size={20} color={mushroom.category === 'poisonous' ? colors.danger : colors.earth} />
              <Text style={styles.warningText}>{mushroom.warning}</Text>
            </View>
          )}

          <Section title="Opis">
            <Text style={styles.paragraph}>{mushroom.description}</Text>
          </Section>

          <Section title={`Sezon: ${formatSeason(mushroom)}`}>
            <SeasonBar from={mushroom.seasonFrom} to={mushroom.seasonTo} color={color} />
            <Text style={styles.note}>
              Wygląd zależy od pogody i lokalnych warunków. Obecny miesiąc jest wyróżniony obramowaniem.
            </Text>
          </Section>

          <Section title="Siedlisko">
            <Text style={styles.paragraph}>{mushroom.habitats.map((h) => habitatLabels[h]).join(', ')}</Text>
          </Section>

          <Section title="Cechy">
            <FeatureRow label="Kapelusz" value={mushroom.cap} />
            <FeatureRow label="Trzon" value={mushroom.stem} />
            <FeatureRow label="Hymenofor" value={mushroom.hymenophore} />
          </Section>

          <Section title="Ciekawostki">
            {mushroom.funFacts.map((fact) => (
              <View key={fact} style={styles.factRow}>
                <View style={styles.dot} />
                <Text style={styles.paragraph}>{fact}</Text>
              </View>
            ))}
          </Section>

          {similar.length > 0 && (
            <Section title="Podobne gatunki">
              <View style={styles.similarRow}>
                {similar.map((s) => (
                  <Pressable
                    key={s.id}
                    style={styles.similarChip}
                    onPress={() => router.push({ pathname: '/mushroom/[id]', params: { id: s.id } })}
                  >
                    <Text style={styles.similarName}>{s.polishName}</Text>
                    <Text style={styles.similarLatin}>{s.latinName}</Text>
                  </Pressable>
                ))}
              </View>
            </Section>
          )}

          
        </View>
      </ScrollView>

      <Pressable style={[styles.back, { top: insets.top + 8 }]} onPress={() => router.back()} hitSlop={8}>
        <ArrowLeft size={22} color={colors.forest} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', justifyContent: 'center', paddingBottom: spacing.xl, minHeight: 260 },
  heroPhoto: { width: 140, height: 140, borderRadius: 70 },
  back: {
    position: 'absolute',
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    marginTop: -spacing.lg,
  },
  name: { fontFamily: fonts.bold, fontSize: 26, color: colors.forest, marginTop: spacing.xs },
  latin: { fontFamily: fonts.regular, fontSize: 16, fontStyle: 'italic', color: colors.textMuted },
  warning: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    marginTop: spacing.sm,
  },
  warningDanger: { backgroundColor: colors.danger + '1A' },
  warningText: { flex: 1, fontFamily: fonts.semibold, fontSize: 13.5, lineHeight: 19, color: colors.forest },
  section: { marginTop: spacing.md, gap: spacing.sm },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.forest },
  paragraph: { flex: 1, fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 21, color: colors.text },
  note: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  featureRow: { gap: 2, paddingVertical: spacing.xs },
  featureLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.earth },
  featureValue: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 21, color: colors.text },
  factRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.olive, marginTop: 8 },
  similarRow: { gap: spacing.sm },
  similarChip: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cream,
  },
  similarName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.forest },
  similarLatin: { fontFamily: fonts.regular, fontSize: 12.5, fontStyle: 'italic', color: colors.textMuted },
  notFoundButton: { position: 'absolute', bottom: spacing.xl, left: spacing.lg, right: spacing.lg },
});