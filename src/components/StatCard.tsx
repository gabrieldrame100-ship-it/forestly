import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { icon: ReactNode; value: string; label: string };

export default function StatCard({ icon, value, label }: Props) {
  return (
    <View style={styles.card}>
      {icon}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
    ...shadow,
  },
  value: { fontFamily: fonts.bold, fontSize: 22, color: colors.forest, marginTop: 2 },
  label: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
});