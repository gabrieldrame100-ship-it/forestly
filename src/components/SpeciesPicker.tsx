import SearchBar from '@/components/SearchBar';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { mushrooms } from '@/data/mushrooms';
import { filterMushrooms } from '@/services/mushroomFilters';
import { Check } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
};

export default function SpeciesPicker({ visible, selectedIds, onChange, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const list = useMemo(
    () => filterMushrooms(mushrooms, { query, category: 'all', habitat: 'all', inSeasonNow: false, sort: 'asc' }),
    [query]
  );

  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Gatunki na wyprawie</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.done}>Gotowe ({selectedIds.length})</Text>
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
          <SearchBar value={query} onChangeText={setQuery} />
        </View>
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const selected = selectedIds.includes(item.id);
            return (
              <Pressable style={styles.row} onPress={() => toggle(item.id)}>
                <View style={[styles.dot, { backgroundColor: categoryMeta[item.category].color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.polishName}</Text>
                  <Text style={styles.latin}>{item.latinName}</Text>
                </View>
                <View style={[styles.check, selected && styles.checkActive]}>
                  {selected && <Check size={16} color={colors.cream} />}
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.forest },
  done: { fontFamily: fonts.semibold, fontSize: 15, color: colors.earth },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontFamily: fonts.semibold, fontSize: 15, color: colors.forest },
  latin: { fontFamily: fonts.regular, fontSize: 12.5, fontStyle: 'italic', color: colors.textMuted },
  check: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.olive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  separator: { height: 1, backgroundColor: colors.cream },
});