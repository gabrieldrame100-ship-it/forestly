import { colors } from '@/constants/theme';
import { Heart } from 'lucide-react-native';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

type Props = { active: boolean; onPress: () => void; size?: number };

export default function FavoriteButton({ active, onPress, size = 20 }: Props) {
  const [scale] = useState(() => new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, speed: 40, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 40, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Heart size={size} color={active ? colors.earth : colors.olive} fill={active ? colors.earth : 'none'} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
});