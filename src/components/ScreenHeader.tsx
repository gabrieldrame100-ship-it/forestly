import { colors, fonts, spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { title: string; subtitle?: string };

export default function ScreenHeader({ title, subtitle }: Props) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.back}
        onPress={() => router.back()}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Wróć"
      >
        <ArrowLeft size={22} color={colors.forest} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.forest },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.olive },
});