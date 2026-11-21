import { Directory, File, Paths } from 'expo-file-system';

const photosDirectory = new Directory(Paths.document, 'trip-photos');

function ensureDirectory(): void {
  if (!photosDirectory.exists) photosDirectory.create();
}

// Kopiuje zdjęcie do pamięci aplikacji i zwraca samą nazwę pliku.
export async function savePhoto(sourceUri: string): Promise<string> {
  ensureDirectory();
  const rawExtension = sourceUri.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
  const extension = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(rawExtension) ? rawExtension : 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  await new File(sourceUri).copy(new File(photosDirectory, fileName));
  return fileName;
}

// Ścieżkę budujemy z nazwy pliku przy każdym odczycie.
export function getPhotoUri(fileName: string): string {
  return new File(photosDirectory, fileName).uri;
}

export function deletePhoto(fileName: string): void {
  try {
    const file = new File(photosDirectory, fileName);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn('Nie udało się usunąć zdjęcia', error);
  }
}