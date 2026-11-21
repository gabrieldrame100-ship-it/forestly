import SearchBar from '@/components/SearchBar';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, spacing } from '@/constants/theme';
import { mushrooms } from '@/data/mushrooms';
import { filterMushrooms } from '@/services/mushroomFilters';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  excludeId?: string | null; // gatunek już wybrany po drugiej stronie
  onSelect: (id: string) => void;
  onClose: () => void;
};

export default function MushroomSelectModal({ visible, excludeId, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const list = useMemo(
    () =>
      filterMushrooms(mushrooms, { query, category: 'all', habitat: 'all', inSeasonNow: false, sort: 'asc' }).filter(
        (m) => m.id !== excludeId
      ),
    [query, excludeId]
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Wybierz gatunek</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>Zamknij</Text>
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
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => {
                setQuery('');
                onSelect(item.id);
              }}
            >
              <View style={[styles.dot, { backgroundColor: categoryMeta[item.category].color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.polishName}</Text>
                <Text style={styles.latin}>{item.latinName}</Text>
              </View>
            </Pressable>
          )}
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
  close: { fontFamily: fonts.semibold, fontSize: 15, color: colors.earth },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontFamily: fonts.semibold, fontSize: 15, color: colors.forest },
  latin: { fontFamily: fonts.regular, fontSize: 12.5, fontStyle: 'italic', color: colors.textMuted },
  separator: { height: 1, backgroundColor: colors.cream },
});