import { achievementIcons } from '@/constants/achievementIcons';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { Award } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const SPARKS = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);

export default function AchievementCelebration() {
  const { celebration, dismissCelebration } = useUserData();
  const scale = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!celebration) return;
    scale.setValue(0);
    burst.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
      Animated.timing(burst, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [celebration, scale, burst]);

  if (!celebration) return null;

  const Icon = achievementIcons[celebration.id] ?? Award;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismissCelebration} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.badgeArea}>
            {SPARKS.map((angle, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.spark,
                  { backgroundColor: index % 2 === 0 ? colors.earth : colors.olive },
                  {
                    opacity: burst.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
                    transform: [
                      {
                        translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * 105] }),
                      },
                      {
                        translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * 105] }),
                      },
                      { scale: burst.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) },
                    ],
                  },
                ]}
              />
            ))}
            <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
              <Icon size={52} color={colors.cream} />
            </Animated.View>
          </View>

          <Text style={styles.kicker}>Nowe osiągnięcie!</Text>
          <Text style={styles.title}>{celebration.title}</Text>
          <Text style={styles.description}>{celebration.description}</Text>

          <Pressable style={styles.button} onPress={dismissCelebration}>
            <Text style={styles.buttonText}>Super!</Text>
          </Pressable>
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
    backgroundColor: colors.forest + 'B3',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  badgeArea: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  badge: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.olive,
  },
  spark: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
  kicker: { fontFamily: fonts.semibold, fontSize: 13, color: colors.earth },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.forest, textAlign: 'center' },
  description: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  button: {
    marginTop: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
  },
  buttonText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.cream },
});