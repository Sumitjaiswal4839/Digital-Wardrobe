import { Platform } from 'react-native';
import { getDb, webStorage } from './db';

export const getSavedLooks = async () => {
  if (Platform.OS === 'web') {
    return webStorage.saved_looks;
  }

  try {
    const db = await getDb();
    const rows = await db.getAllAsync('SELECT * FROM saved_looks ORDER BY id DESC');
    return rows.map((r) => ({
      ...r,
      layers: JSON.parse(r.layers_json || '[]'),
    }));
  } catch (error) {
    console.error('Error fetching saved looks:', error);
    return [];
  }
};

export const saveLook = async (title, bodyPhotoUri, layers) => {
  const layersJson = JSON.stringify(layers);

  if (Platform.OS === 'web') {
    const newLook = {
      id: Date.now(),
      title,
      body_photo_uri: bodyPhotoUri,
      layers_json: layersJson,
      layers,
      created_at: new Date().toISOString(),
    };
    webStorage.saved_looks.unshift(newLook);
    return newLook;
  }

  try {
    const db = await getDb();
    const result = await db.runAsync(
      `INSERT INTO saved_looks (title, body_photo_uri, layers_json) VALUES (?, ?, ?)`,
      [title, bodyPhotoUri, layersJson]
    );

    return {
      id: result.lastInsertRowId,
      title,
      body_photo_uri: bodyPhotoUri,
      layers,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error saving look:', error);
    throw error;
  }
};

export const deleteSavedLook = async (id) => {
  if (Platform.OS === 'web') {
    webStorage.saved_looks = webStorage.saved_looks.filter((l) => l.id !== id);
    return true;
  }

  try {
    const db = await getDb();
    await db.runAsync('DELETE FROM saved_looks WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting saved look:', error);
    return false;
  }
};
