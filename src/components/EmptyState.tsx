import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

type Props = { title: string; message: string };

export default function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.forest, marginBottom: spacing.sm },
  message: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
});
