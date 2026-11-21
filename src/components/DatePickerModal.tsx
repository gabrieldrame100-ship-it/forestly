import { colors, fonts, radius, spacing } from '@/constants/theme';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const MONTHS = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];
const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

type Props = {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
};

export default function DatePickerModal({ visible, value, onConfirm, onClose }: Props) {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const [selected, setSelected] = useState(value);

  // Za każdym razem, gdy okno się otwiera, zaczynamy od aktualnie wybranej daty.
  useEffect(() => {
    if (visible) {
      setSelected(value);
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }, [visible, value]);

  const changeMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  // Poniedziałek jest pierwszym dniem tygodnia.
  const offset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();
  const isSameDay = (day: number, date: Date) =>
    date.getFullYear() === viewYear && date.getMonth() === viewMonth && date.getDate() === day;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.monthRow}>
            <Pressable style={styles.arrow} onPress={() => changeMonth(-1)} hitSlop={8}>
              <ChevronLeft size={22} color={colors.forest} />
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <Pressable style={styles.arrow} onPress={() => changeMonth(1)} hitSlop={8}>
              <ChevronRight size={22} color={colors.forest} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((weekday) => (
              <Text key={weekday} style={styles.weekday}>
                {weekday}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (day === null) return <View key={`empty-${index}`} style={styles.cell} />;
              const active = isSameDay(day, selected);
              const isToday = isSameDay(day, today);
              return (
                <View key={day} style={styles.cell}>
                  <Pressable
                    style={[styles.day, isToday && styles.today, active && styles.dayActive]}
                    onPress={() => setSelected(new Date(viewYear, viewMonth, day))}
                  >
                    <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.cancel}>Anuluj</Text>
            </Pressable>
            <Pressable style={styles.confirm} onPress={() => onConfirm(selected)}>
              <Text style={styles.confirmText}>Wybierz</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest + '73',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.forest },
  weekRow: { flexDirection: 'row' },
  weekday: {
    width: '14.2857%',
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.earth,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', alignItems: 'center', paddingVertical: 2 },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: colors.olive },
  dayActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  dayText: { fontFamily: fonts.medium, fontSize: 15, color: colors.forest },
  dayTextActive: { color: colors.cream },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.lg },
  cancel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.earth },
  confirm: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
  },
  confirmText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.cream },
});