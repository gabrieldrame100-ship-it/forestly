import { useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Award, Heart, Leaf, Notebook, Trash2 } from 'lucide-react-native';
import CustomButton from '@/components/CustomButton';
import StatCard from '@/components/StatCard';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useProfile } from '@/context/ProfileContext';
import { useUserData } from '@/context/UserDataContext';
import { achievements } from '@/data/achievements';
import { mushrooms } from '@/data/mushrooms';
import { clearAllData } from '@/database/maintenanceRepository';
import { deleteAllPhotos } from '@/services/photoStorage';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const { userName, setUserName, resetProfile } = useProfile();
  const { discoveredIds, favoriteIds, tripCount, unlockedAchievementIds, reload } = useUserData();

  const [draft, setDraft] = useState(userName);
  const [resetting, setResetting] = useState(false);
  const changed = draft.trim() !== userName;

  const saveName = async () => {
    await setUserName(draft);
    Keyboard.dismiss();
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await clearAllData(db);
      deleteAllPhotos();
      await resetProfile();
      setDraft('');
      await reload();
      Alert.alert('Gotowe', 'Wszystkie dane zostały usunięte.');
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Nie udało się usunąć danych.');
    } finally {
      setResetting(false);
    }
  };

  const confirmReset = () => {
    Alert.alert(
      'Usunąć wszystkie dane?',
      'Zniknie wszystko: wyprawy ze zdjęciami, ulubione, poznane gatunki, osiągnięcia i nazwa użytkownika. Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usuń wszystko', style: 'destructive', onPress: handleReset },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: insets.top + spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Profil</Text>

      <View style={styles.userCard}>
        <View style={styles.avatar}>
          {userName ? (
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          ) : (
            <Leaf size={30} color={colors.cream} />
          )}
        </View>
        <Text style={styles.userName}>{userName || 'Grzybiarz'}</Text>
        <Text style={styles.userHint}>Discover. Explore. Collect.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nazwa użytkownika</Text>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Jak mamy się do Ciebie zwracać?"
          placeholderTextColor={colors.textMuted}
          maxLength={24}
          returnKeyType="done"
          onSubmitEditing={changed ? saveName : undefined}
        />
        <CustomButton title="Zapisz nazwę" onPress={changed ? saveName : () => {}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statystyki</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon={<Leaf size={20} color={colors.olive} />}
            value={`${discoveredIds.size}/${mushrooms.length}`}
            label="Poznane gatunki"
          />
          <StatCard icon={<Notebook size={20} color={colors.earth} />} value={String(tripCount)} label="Wyprawy" />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon={<Heart size={20} color={colors.earth} />} value={String(favoriteIds.size)} label="Ulubione" />
          <StatCard
            icon={<Award size={20} color={colors.olive} />}
            value={`${unlockedAchievementIds.size}/${achievements.length}`}
            label="Osiągnięcia"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dane</Text>
        <Text style={styles.paragraph}>Wszystkie dane są zapisane tylko na tym telefonie i działają bez internetu.</Text>
        <Pressable style={styles.dangerButton} onPress={resetting ? undefined : confirmReset}>
          <Trash2 size={18} color={colors.danger} />
          <Text style={styles.dangerText}>{resetting ? 'Usuwanie…' : 'Usuń wszystkie dane'}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>O FORESTLY</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutName}>FORESTLY</Text>
          <Text style={styles.paragraph}>
            Atlas grzybów, dziennik wypraw i kolekcja poznanych gatunków. Aplikacja ma charakter edukacyjny i nie służy
            do oceny jadalności grzybów.
          </Text>
          <Text style={styles.version}>Wersja 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.forest },
  userCard: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 30, color: colors.cream },
  userName: { fontFamily: fonts.bold, fontSize: 22, color: colors.forest },
  userHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.olive },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.forest },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cream,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  paragraph: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  dangerText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.danger },
  aboutCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  aboutName: { fontFamily: fonts.bold, fontSize: 16, color: colors.forest },
  version: { fontFamily: fonts.medium, fontSize: 12, color: colors.olive, marginTop: 4 },
});
