import { monthLetters } from '@/constants/mushroomMeta';
import { colors, fonts, radius } from '@/constants/theme';
import { monthInRange } from '@/services/mushroomFilters';
import { StyleSheet, Text, View } from 'react-native';

type Props = { from: number; to: number; color: string };

export default function SeasonBar({ from, to, color }: Props) {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <View style={styles.row}>
      {monthLetters.map((letter, index) => {
        const month = index + 1;
        const active = monthInRange(month, from, to);
        return (
          <View key={month} style={styles.cell}>
            <View
              style={[
                styles.bar,
                { backgroundColor: active ? color : colors.cream },
                month === currentMonth && styles.current,
              ]}
            />
            <Text style={[styles.letter, month === currentMonth && styles.letterCurrent]}>{letter}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  cell: { flex: 1, alignItems: 'center', gap: 6 },
  bar: { width: '100%', height: 28, borderRadius: radius.sm / 2 },
  current: { borderWidth: 2, borderColor: colors.forest },
  letter: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
  letterCurrent: { fontFamily: fonts.bold, color: colors.forest },
});