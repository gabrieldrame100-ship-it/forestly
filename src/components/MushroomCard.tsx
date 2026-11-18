import CategoryBadge from '@/components/CategoryBadge';
import FavoriteButton from '@/components/FavoriteButton';
import MushroomIllustration from '@/components/MushroomIllustration';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { formatSeason } from '@/services/mushroomFilters';
import { Mushroom } from '@/types/mushroom';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  mushroom: Mushroom;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export default function MushroomCard({ mushroom, onPress, isFavorite = false, onToggleFavorite }: Props) {
  const color = categoryMeta[mushroom.category].color;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.media, { backgroundColor: color + '26' }]}>
        {mushroom.image ? (
          <Image source={mushroom.image} style={styles.photo} resizeMode="cover" />
        ) : (
          <MushroomIllustration color={color} size={64} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {mushroom.polishName}
        </Text>
        <Text style={styles.latin} numberOfLines={1}>
          {mushroom.latinName}
        </Text>
        <View style={styles.footer}>
          <CategoryBadge category={mushroom.category} />
          <Text style={styles.season}>{formatSeason(mushroom)}</Text>
        </View>
      </View>
      {onToggleFavorite && (
        <View style={styles.favorite}>
          <FavoriteButton active={isFavorite} onPress={onToggleFavorite} size={18} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.md,
    ...shadow,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  media: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  info: { flex: 1, justifyContent: 'center', gap: 2, paddingRight: 28 },
  name: { fontFamily: fonts.semibold, fontSize: 16, color: colors.forest },
  latin: { fontFamily: fonts.regular, fontSize: 13, fontStyle: 'italic', color: colors.textMuted },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  season: { fontFamily: fonts.medium, fontSize: 12, color: colors.earth },
  favorite: { position: 'absolute', top: spacing.sm + 2, right: spacing.md },
});