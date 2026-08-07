import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

export const pickImageFromGallery = async () => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access photo gallery is required!');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    return null;
  }
};

export const takePhotoWithCamera = async () => {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera is required!');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error taking photo with camera:', error);
    return null;
  }
};

export const downloadImageFromUrl = async (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Please provide a valid image URL');
  }

  // Basic URL validation
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('URL must start with http:// or https://');
  }

  if (Platform.OS === 'web') {
    // Web direct URL usage
    return url;
  }

  try {
    const folderPath = `${FileSystem.documentDirectory}wardrobe_images/`;
    const folderInfo = await FileSystem.getInfoAsync(folderPath);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
    }

    const fileName = `outfit_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const fileUri = `${folderPath}${fileName}`;

    const downloadRes = await FileSystem.downloadAsync(url, fileUri);
    if (downloadRes.status === 200) {
      return downloadRes.uri;
    } else {
      throw new Error(`Failed to download image (HTTP Status ${downloadRes.status})`);
    }
  } catch (error) {
    console.error('Error downloading image from URL:', error);
    // Fall back to original URL if local save fails
    return url;
  }
};

/**
 * Safely deletes a downloaded outfit image from app storage if it exists locally.
 * Prevents storage leaks when deleting outfits from database.
 */
export const deleteLocalImageIfExists = async (imageUri) => {
  if (Platform.OS === 'web') return;
  if (!imageUri || typeof imageUri !== 'string') return;

  const localFolderPrefix = `${FileSystem.documentDirectory}wardrobe_images/`;
  if (!imageUri.startsWith(localFolderPrefix)) return;

  try {
    const info = await FileSystem.getInfoAsync(imageUri);
    if (info.exists) {
      await FileSystem.deleteAsync(imageUri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting local outfit image:', error);
    // Best-effort cleanup: do not throw error
  }
};

/**
 * Startup hygiene utility: deletes orphan image files from wardrobe_images/
 * that are no longer referenced in the outfits SQLite database table.
 */
export const cleanOrphanImages = async (activeImageUris = []) => {
  if (Platform.OS === 'web') return;

  try {
    const folderPath = `${FileSystem.documentDirectory}wardrobe_images/`;
    const folderInfo = await FileSystem.getInfoAsync(folderPath);
    if (!folderInfo.exists) return;

    const files = await FileSystem.readDirectoryAsync(folderPath);
    const activeSet = new Set(activeImageUris);

    for (const fileName of files) {
      const fullPath = `${folderPath}${fileName}`;
      if (!activeSet.has(fullPath)) {
        await FileSystem.deleteAsync(fullPath, { idempotent: true });
      }
    }
  } catch (error) {
    console.error('Error cleaning orphan images:', error);
  }
};
