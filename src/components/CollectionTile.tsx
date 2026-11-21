import MushroomIllustration from '@/components/MushroomIllustration';
import { categoryMeta } from '@/constants/mushroomMeta';
import { colors, fonts, radius } from '@/constants/theme';
import { Mushroom } from '@/types/mushroom';
import { Lock } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { mushroom: Mushroom; discovered: boolean; size: number; onPress: () => void };

export default function CollectionTile({ mushroom, discovered, size, onPress }: Props) {
  const meta = categoryMeta[mushroom.category];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height: size * 1.2, backgroundColor: discovered ? meta.color + '26' : colors.cream },
        pressed && styles.pressed,
      ]}
    >
      {discovered ? (
        mushroom.image ? (
          <Image source={mushroom.image} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.center}>
            <MushroomIllustration color={meta.color} size={size * 0.5} />
          </View>
        )
      ) : (
        <View style={[styles.center, { opacity: 0.35 }]}>
          <MushroomIllustration color={colors.olive} size={size * 0.45} />
        </View>
      )}

      {!discovered && (
        <View style={styles.lock}>
          <Lock size={13} color={colors.textMuted} />
        </View>
      )}

      <View style={[styles.label, discovered ? styles.labelOn : styles.labelOff]}>
        <Text style={[styles.name, !discovered && styles.nameOff]} numberOfLines={2}>
          {mushroom.polishName}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: radius.md, overflow: 'hidden' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  photo: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', paddingBottom: 24 },
  lock: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 6 },
  labelOn: { backgroundColor: colors.forest + 'E0' },
  labelOff: { backgroundColor: colors.cream },
  name: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, color: colors.cream },
  nameOff: { color: colors.textMuted },
});