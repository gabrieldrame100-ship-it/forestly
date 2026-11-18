import { colors, fonts, spacing } from '@/constants/theme';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.forest} />
      <Text style={styles.text}>Ładowanie…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  text: { fontFamily: fonts.medium, fontSize: 15, color: colors.textMuted },
});