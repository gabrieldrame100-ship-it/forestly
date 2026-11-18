import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { colors, fonts, radius, spacing, shadow } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const today = new Date().toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.lg }}
    >
      <Text style={styles.date}>{today}</Text>
      <Text style={styles.greeting}>Witaj w FORESTLY</Text>
      <Text style={styles.tagline}>Odkrywaj. Zwiedzaj. Kolekcjonuj.</Text>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Odkrywaj świat grzybów</Text>
        <Text style={styles.heroText}>Przeglądaj atlas gatunków i zapisuj swoje wyprawy do lasu.</Text>
        <View style={{ marginTop: spacing.md }}>
          <CustomButton title="Otwórz atlas" variant="secondary" onPress={() => router.push('atlas' as any)} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dziennik wypraw</Text>
        <Text style={styles.cardText}>Zapisuj miejsca, zdjęcia i znalezione gatunki.</Text>
        <View style={{ marginTop: spacing.md }}>
          <CustomButton title="Przejdź do dziennika" onPress={() => router.push('journal' as any)} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  date: { fontFamily: fonts.medium, fontSize: 13, color: colors.earth, textTransform: 'capitalize' },
  greeting: { fontFamily: fonts.bold, fontSize: 28, color: colors.forest, marginTop: spacing.xs },
  tagline: { fontFamily: fonts.regular, fontSize: 14, color: colors.olive, marginBottom: spacing.lg },
  hero: {
    backgroundColor: colors.forest,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  heroTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.cream },
  heroText: { fontFamily: fonts.regular, fontSize: 14, color: colors.cream, opacity: 0.85, marginTop: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow,
  },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 18, color: colors.forest },
  cardText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
});
