import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export default function CustomButton({ title, onPress, variant = 'primary' }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, { color: isPrimary ? colors.cream : colors.forest }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.forest },
  secondary: { backgroundColor: colors.cream },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  text: { fontFamily: fonts.semibold, fontSize: 15 },
});
