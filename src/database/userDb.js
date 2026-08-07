import { Platform } from 'react-native';
import { getDb, webStorage } from './db';
import { deleteLocalImageIfExists } from '../utils/fileSystem';

export const getUserProfile = async () => {
  if (Platform.OS === 'web') {
    return webStorage.users[0] || null;
  }

  try {
    const db = await getDb();
    const user = await db.getFirstAsync('SELECT * FROM users LIMIT 1');
    return user || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const saveOnboardingProfile = async ({
  name,
  gender,
  ageGroup,
  stylePreference,
  fitPreference,
  favoriteColors,
  bodyPhotoUri,
}) => {
  if (Platform.OS === 'web') {
    const newUser = {
      id: 1,
      name,
      gender,
      age_group: ageGroup,
      style_preference: stylePreference,
      fit_preference: fitPreference,
      favorite_colors: favoriteColors,
      body_photo_uri: bodyPhotoUri || '',
      is_onboarded: 1,
      created_at: new Date().toISOString(),
    };
    webStorage.users = [newUser];
    return newUser;
  }

  try {
    const db = await getDb();
    const existing = await db.getFirstAsync('SELECT id FROM users LIMIT 1');

    if (existing) {
      await db.runAsync(
        `UPDATE users SET 
          name = ?,
          gender = ?,
          age_group = ?,
          style_preference = ?,
          fit_preference = ?,
          favorite_colors = ?,
          body_photo_uri = ?,
          is_onboarded = 1
         WHERE id = ?`,
        [
          name,
          gender,
          ageGroup,
          stylePreference,
          fitPreference,
          favoriteColors,
          bodyPhotoUri || '',
          existing.id,
        ]
      );
    } else {
      await db.runAsync(
        `INSERT INTO users (name, gender, age_group, style_preference, fit_preference, favorite_colors, body_photo_uri, is_onboarded)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          name,
          gender,
          ageGroup,
          stylePreference,
          fitPreference,
          favoriteColors,
          bodyPhotoUri || '',
        ]
      );
    }
    return getUserProfile();
  } catch (error) {
    console.error('Error saving onboarding profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (fields) => {
  const {
    name,
    gender,
    ageGroup,
    stylePreference,
    fitPreference,
    favoriteColors,
    bodyPhotoUri,
    isOnboarded,
  } = fields;

  if (Platform.OS === 'web') {
    if (webStorage.users[0]) {
      if (name !== undefined) webStorage.users[0].name = name;
      if (gender !== undefined) webStorage.users[0].gender = gender;
      if (ageGroup !== undefined) webStorage.users[0].age_group = ageGroup;
      if (stylePreference !== undefined) webStorage.users[0].style_preference = stylePreference;
      if (fitPreference !== undefined) webStorage.users[0].fit_preference = fitPreference;
      if (favoriteColors !== undefined) webStorage.users[0].favorite_colors = favoriteColors;
      if (bodyPhotoUri !== undefined) webStorage.users[0].body_photo_uri = bodyPhotoUri;
      if (isOnboarded !== undefined) webStorage.users[0].is_onboarded = isOnboarded;
      return webStorage.users[0];
    }
  }

  try {
    const db = await getDb();
    const user = await db.getFirstAsync('SELECT id FROM users LIMIT 1');

    if (user) {
      await db.runAsync(
        `UPDATE users SET 
          name = COALESCE(?, name), 
          gender = COALESCE(?, gender), 
          age_group = COALESCE(?, age_group),
          style_preference = COALESCE(?, style_preference),
          fit_preference = COALESCE(?, fit_preference),
          favorite_colors = COALESCE(?, favorite_colors),
          body_photo_uri = COALESCE(?, body_photo_uri),
          is_onboarded = COALESCE(?, is_onboarded)
         WHERE id = ?`,
        [
          name ?? null,
          gender ?? null,
          ageGroup ?? null,
          stylePreference ?? null,
          fitPreference ?? null,
          favoriteColors ?? null,
          bodyPhotoUri ?? null,
          isOnboarded ?? null,
          user.id,
        ]
      );
    }
    return getUserProfile();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const deleteUserProfile = async () => {
  if (Platform.OS === 'web') {
    webStorage.users = [];
    webStorage.outfits = [];
    webStorage.savedLooks = [];
    return true;
  }

  try {
    const db = await getDb();
    const allOutfits = await db.getAllAsync('SELECT image_uri FROM outfits');

    await db.runAsync('DELETE FROM users');
    await db.runAsync('DELETE FROM outfits');
    await db.runAsync('DELETE FROM saved_looks');

    if (allOutfits && allOutfits.length > 0) {
      for (const outfit of allOutfits) {
        if (outfit?.image_uri) {
          await deleteLocalImageIfExists(outfit.image_uri);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return false;
  }
};
