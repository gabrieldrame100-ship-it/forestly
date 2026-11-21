import { colors, fonts, radius, spacing } from '@/constants/theme';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

type ChipProps = { label: string; active: boolean; onPress: () => void };

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function FilterChips<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          active={option.value === value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.sm,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.olive + '80',
  },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.forest },
  labelActive: { color: colors.cream },
});