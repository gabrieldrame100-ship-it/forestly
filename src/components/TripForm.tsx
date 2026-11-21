import CustomButton from '@/components/CustomButton';
import DatePickerModal from '@/components/DatePickerModal';
import SpeciesPicker from '@/components/SpeciesPicker';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { getMushroomById } from '@/data/mushrooms';
import { createTrip, updateTrip } from '@/database/tripRepository';
import { formatDate, fromDateString, toDateString } from '@/services/dateUtils';
import { deletePhoto, getPhotoUri, savePhoto } from '@/services/photoStorage';
import { Trip, TripInput } from '@/types/trip';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, CalendarDays, Camera, ImagePlus, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAX_PHOTOS = 10;

// fileName === null oznacza zdjęcie dopiero wybrane, jeszcze niezapisane w pamięci aplikacji.
type FormPhoto = { key: string; uri: string; fileName: string | null };

type Props = { trip?: Trip };

export default function TripForm({ trip }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const { reload } = useUserData();

  const [title, setTitle] = useState(trip?.title ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(trip ? fromDateString(trip.tripDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState(trip?.description ?? '');
  const [speciesIds, setSpeciesIds] = useState<string[]>(trip?.speciesIds ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<FormPhoto[]>(
    trip
      ? trip.photos.map((p) => ({ key: `old-${p.id}`, uri: getPhotoUri(p.fileName), fileName: p.fileName }))
      : []
  );

  const addPhotos = (uris: string[]) => {
    setPhotos((prev) => {
      const free = MAX_PHOTOS - prev.length;
      const added = uris.slice(0, free).map((uri, i) => ({
        key: `new-${Date.now()}-${i}`,
        uri,
        fileName: null,
      }));
      return [...prev, ...added];
    });
  };

  const pickFromLibrary = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      Alert.alert('Limit zdjęć', `Do jednej wyprawy możesz dodać maksymalnie ${MAX_PHOTOS} zdjęć.`);
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.7,
      });
      if (!result.canceled) addPhotos(result.assets.map((asset) => asset.uri));
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Nie udało się otworzyć galerii.');
    }
  };

  const takePhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit zdjęć', `Do jednej wyprawy możesz dodać maksymalnie ${MAX_PHOTOS} zdjęć.`);
      return;
    }
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Brak zgody', 'Aby zrobić zdjęcie, zezwól aplikacji na dostęp do aparatu w ustawieniach telefonu.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled) addPhotos(result.assets.map((asset) => asset.uri));
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Nie udało się otworzyć aparatu.');
    }
  };

  const handleSave = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setTitleError('Podaj tytuł wyprawy.');
      return;
    }

    setSaving(true);
    const copiedNames: string[] = [];
    try {
      const fileNames: string[] = [];
      for (const photo of photos) {
        if (photo.fileName) {
          fileNames.push(photo.fileName);
        } else {
          const name = await savePhoto(photo.uri);
          copiedNames.push(name);
          fileNames.push(name);
        }
      }

      const input: TripInput = {
        title: cleanTitle,
        tripDate: toDateString(date),
        description: description.trim(),
        speciesIds,
        photoFileNames: fileNames,
      };

      if (trip) {
        await updateTrip(db, trip.id, input);
        trip.photos
          .map((p) => p.fileName)
          .filter((name) => !fileNames.includes(name))
          .forEach((name) => deletePhoto(name));
        await reload();
        router.back();
      } else {
        const newId = await createTrip(db, input);
        await reload();
        router.replace({ pathname: '/trip/[id]', params: { id: String(newId) } });
      }
    } catch (error) {
      console.error(error);
      copiedNames.forEach((name) => deletePhoto(name));
      Alert.alert('Błąd', 'Nie udało się zapisać wyprawy. Spróbuj ponownie.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.md,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={22} color={colors.forest} />
          </Pressable>
          <Text style={styles.heading}>{trip ? 'Edytuj wyprawę' : 'Nowa wyprawa'}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tytuł</Text>
          <TextInput
            style={[styles.input, titleError !== null && styles.inputError]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError(null);
            }}
            placeholder="np. Niedzielne grzybobranie"
            placeholderTextColor={colors.textMuted}
            maxLength={80}
          />
          {titleError && <Text style={styles.error}>{titleError}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Data</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <CalendarDays size={18} color={colors.earth} />
            <Text style={styles.dateText}>{formatDate(toDateString(date))}</Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Opis</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Miejsce, pogoda, wrażenia…"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Zdjęcia ({photos.length}/{MAX_PHOTOS})
          </Text>
          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <View key={photo.key} style={styles.thumb}>
                  <Image source={{ uri: photo.uri }} style={styles.thumbImage} resizeMode="cover" />
                  <Pressable
                    style={styles.removePhoto}
                    onPress={() => setPhotos((prev) => prev.filter((p) => p.key !== photo.key))}
                    hitSlop={8}
                  >
                    <X size={14} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <View style={styles.photoButtons}>
            <Pressable style={styles.outlineButton} onPress={pickFromLibrary}>
              <ImagePlus size={18} color={colors.forest} />
              <Text style={styles.outlineText}>Z galerii</Text>
            </Pressable>
            <Pressable style={styles.outlineButton} onPress={takePhoto}>
              <Camera size={18} color={colors.forest} />
              <Text style={styles.outlineText}>Aparat</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Poznane gatunki</Text>
          <View style={styles.chips}>
            {speciesIds.map((id) => {
              const mushroom = getMushroomById(id);
              if (!mushroom) return null;
              return (
                <View key={id} style={styles.chip}>
                  <Text style={styles.chipText}>{mushroom.polishName}</Text>
                  <Pressable onPress={() => setSpeciesIds((prev) => prev.filter((x) => x !== id))} hitSlop={8}>
                    <X size={14} color={colors.cream} />
                  </Pressable>
                </View>
              );
            })}
            <Pressable style={styles.addChip} onPress={() => setPickerOpen(true)}>
              <Plus size={16} color={colors.forest} />
              <Text style={styles.outlineText}>Dodaj gatunki</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>Gatunki dodane do wyprawy zostaną oznaczone jako poznane.</Text>
        </View>

        <CustomButton
          title={saving ? 'Zapisywanie…' : 'Zapisz wyprawę'}
          onPress={saving ? () => {} : handleSave}
        />
      </ScrollView>

      <DatePickerModal
        visible={showDatePicker}
        value={date}
        onConfirm={(selected) => {
          setDate(selected);
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
      />

      <SpeciesPicker
        visible={pickerOpen}
        selectedIds={speciesIds}
        onChange={setSpeciesIds}
        onClose={() => setPickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { fontFamily: fonts.bold, fontSize: 24, color: colors.forest },
  field: { gap: spacing.sm },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.forest },
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
  inputError: { borderColor: colors.danger },
  multiline: { minHeight: 110 },
  error: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.danger },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cream,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  dateText: { fontFamily: fonts.medium, fontSize: 15, color: colors.forest },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumb: { width: 88, height: 88, borderRadius: radius.md, overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.forest + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtons: { flexDirection: 'row', gap: spacing.sm },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.forest,
  },
  outlineText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.forest },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
  },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.cream },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.forest,
    borderStyle: 'dashed',
  },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
});