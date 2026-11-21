import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import MushroomIllustration from '@/components/MushroomIllustration';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, radius } from '@/constants/theme';
import { Mushroom } from '@/types/mushroom';

type Props = {
  mushroom: Mushroom;
  size: number;
  isFavorite: boolean;
  onPress: () => void;
};

export default function GridTile({ mushroom, size, isFavorite, onPress }: Props) {
  const meta = categoryMeta[mushroom.category];
  const poisonous = mushroom.category === 'poisonous';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height: size * 1.25, backgroundColor: meta.color + '26' },
        poisonous && styles.poisonous,
        pressed && styles.pressed,
      ]}
    >
      {mushroom.image ? (
        <Image source={mushroom.image} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.illustration}>
          <MushroomIllustration color={meta.color} size={size * 0.5} />
        </View>
      )}
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      {isFavorite && (
        <View style={styles.heart}>
          <Heart size={14} color={colors.earth} fill={colors.earth} />
        </View>
      )}
      <View style={styles.label}>
        <Text style={styles.name} numberOfLines={2}>
          {mushroom.polishName}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: radius.md, overflow: 'hidden' },
  poisonous: { borderWidth: 2, borderColor: colors.danger },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  photo: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  illustration: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  dot: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  heart: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 6,
    backgroundColor: colors.forest + 'E0',
  },
  name: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, color: colors.cream },
});
