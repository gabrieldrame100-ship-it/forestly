import { categoryMeta } from '@/constants/mushroomMeta';
import { fonts, radius } from '@/constants/theme';
import { Category } from '@/types/mushroom';
import { StyleSheet, Text, View } from 'react-native';

export default function CategoryBadge({ category }: { category: Category }) {
  const meta = categoryMeta[category];
  return (
    <View style={[styles.badge, { backgroundColor: meta.color + '26' }]}>
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  text: { fontFamily: fonts.semibold, fontSize: 12 },
});