import { achievementIcons } from '@/constants/achievementIcons';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { Achievement } from '@/data/achievements';
import { Award, Lock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

type Props = { achievement: Achievement; current: number; unlocked: boolean };

export default function AchievementCard({ achievement, current, unlocked }: Props) {
  const Icon = achievementIcons[achievement.id] ?? Award;
  const ratio = unlocked ? 1 : Math.min(current / achievement.target, 1);

  return (
    <View style={[styles.card, !unlocked && styles.cardLocked]}>
      <View style={[styles.iconWrap, unlocked ? styles.iconUnlocked : styles.iconLocked]}>
        {unlocked ? <Icon size={24} color={colors.cream} /> : <Lock size={20} color={colors.textMuted} />}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, !unlocked && styles.titleLocked]}>{achievement.title}</Text>
        <Text style={styles.description}>{achievement.description}</Text>
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: unlocked ? colors.olive : colors.earth }]}
          />
        </View>
        <Text style={styles.progress}>
          {unlocked ? 'Zdobyte' : `${Math.min(current, achievement.target)} / ${achievement.target}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cardLocked: { backgroundColor: colors.cream },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  iconUnlocked: { backgroundColor: colors.forest },
  iconLocked: { backgroundColor: colors.background },
  info: { flex: 1, gap: 4 },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.forest },
  titleLocked: { color: colors.textMuted },
  description: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.background, overflow: 'hidden', marginTop: 2 },
  fill: { height: '100%', borderRadius: 3 },
  progress: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.earth },
});