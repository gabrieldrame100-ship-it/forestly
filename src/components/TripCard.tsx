import MushroomIllustration from '@/components/MushroomIllustration';
import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { formatDate } from '@/services/dateUtils';
import { getPhotoUri } from '@/services/photoStorage';
import { TripSummary } from '@/types/trip';
import { CalendarDays, Camera, Leaf } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { trip: TripSummary; onPress: () => void };

export default function TripCard({ trip, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.media}>
        {trip.coverPhoto ? (
          <Image source={{ uri: getPhotoUri(trip.coverPhoto) }} style={styles.photo} resizeMode="cover" />
        ) : (
          <MushroomIllustration color={colors.olive} size={56} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {trip.title}
        </Text>
        <View style={styles.row}>
          <CalendarDays size={14} color={colors.earth} />
          <Text style={styles.date}>{formatDate(trip.tripDate)}</Text>
        </View>
        {trip.description.length > 0 && (
          <Text style={styles.description} numberOfLines={2}>
            {trip.description}
          </Text>
        )}
        <View style={styles.meta}>
          <View style={styles.row}>
            <Leaf size={14} color={colors.olive} />
            <Text style={styles.metaText}>{trip.speciesCount}</Text>
          </View>
          <View style={styles.row}>
            <Camera size={14} color={colors.olive} />
            <Text style={styles.metaText}>{trip.photoCount}</Text>
          </View>
        </View>
      </View>
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
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  info: { flex: 1, gap: 4, justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.forest },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  date: { fontFamily: fonts.medium, fontSize: 12, color: colors.earth },
  description: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  meta: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
  metaText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
});