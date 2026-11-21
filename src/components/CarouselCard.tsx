import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import FavoriteButton from '@/components/FavoriteButton';
import MushroomIllustration from '@/components/MushroomIllustration';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, radius, spacing, shadow } from '@/constants/theme';
import { formatSeason } from '@/services/mushroomFilters';
import { Mushroom } from '@/types/mushroom';

type Props = {
  mushroom: Mushroom;
  index: number;
  scrollX: Animated.Value;
  width: number;
  height: number;
  interval: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
};

export default function CarouselCard({
  mushroom,
  index,
  scrollX,
  width,
  height,
  interval,
  isFavorite,
  onToggleFavorite,
  onPress,
}: Props) {
  const meta = categoryMeta[mushroom.category];
  const poisonous = mushroom.category === 'poisonous';

  const inputRange = [(index - 1) * interval, index * interval, (index + 1) * interval];
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.88, 1, 0.88],
    extrapolate: 'clamp',
  });
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.55, 1, 0.55],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ width, height, opacity, transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        style={[styles.card, { backgroundColor: meta.color + '26' }, poisonous && styles.cardPoisonous]}
      >
        {mushroom.image ? (
          <Image source={mushroom.image} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.illustration}>
            <MushroomIllustration color={meta.color} size={120} />
          </View>
        )}

        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: meta.color }]}>
            {poisonous && <ShieldAlert size={14} color="#FFFFFF" />}
            <Text style={styles.badgeText}>{meta.label}</Text>
          </View>
          <View style={styles.heart}>
            <FavoriteButton active={isFavorite} onPress={onToggleFavorite} size={20} />
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.name} numberOfLines={2}>
            {mushroom.polishName}
          </Text>
          <Text style={styles.latin} numberOfLines={1}>
            {mushroom.latinName}
          </Text>
          <Text style={styles.season}>{formatSeason(mushroom)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow,
  },
  cardPoisonous: { borderWidth: 3, borderColor: colors.danger },
  photo: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  illustration: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  topRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeText: { fontFamily: fonts.semibold, fontSize: 12, color: '#FFFFFF' },
  heart: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    backgroundColor: colors.forest + 'E0',
    gap: 2,
  },
  name: { fontFamily: fonts.bold, fontSize: 20, color: colors.cream },
  latin: {
    fontFamily: fonts.regular,
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.cream,
    opacity: 0.8,
  },
  season: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.cream,
    marginTop: 6,
  },
});
