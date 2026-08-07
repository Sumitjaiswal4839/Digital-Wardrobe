import { Platform } from 'react-native';
import { getDb, webStorage } from './db';
import { deleteLocalImageIfExists } from '../utils/fileSystem';

export const getCategoriesByGender = async (gender = 'male') => {
  if (Platform.OS === 'web') {
    return webStorage.categories.filter(
      (c) => c.gender === gender || c.gender === 'unisex'
    );
  }

  try {
    const db = await getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM categories WHERE gender = ? OR gender = "unisex" ORDER BY id ASC',
      [gender]
    );
    return rows || [];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const addCustomCategory = async (name, gender = 'male', icon = 'tag', bodyZone = 'top') => {
  if (Platform.OS === 'web') {
    const newCat = {
      id: Date.now(),
      name,
      gender,
      icon,
      is_custom: 1,
      body_zone: bodyZone,
    };
    webStorage.categories.push(newCat);
    return newCat;
  }

  try {
    const db = await getDb();
    const result = await db.runAsync(
      'INSERT INTO categories (name, icon, gender, is_custom, body_zone) VALUES (?, ?, ?, 1, ?)',
      [name, icon, gender, bodyZone]
    );
    return {
      id: result.lastInsertRowId,
      name,
      gender,
      icon,
      is_custom: 1,
      body_zone: bodyZone,
    };
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (id, newName) => {
  if (Platform.OS === 'web') {
    const cat = webStorage.categories.find((c) => c.id === id);
    if (cat && cat.is_custom === 1) {
      cat.name = newName;
    }
    return cat;
  }

  try {
    const db = await getDb();
    const cat = await db.getFirstAsync('SELECT * FROM categories WHERE id = ?', [id]);
    if (!cat || cat.is_custom !== 1) {
      throw new Error('Only custom categories can be renamed');
    }
    await db.runAsync('UPDATE categories SET name = ? WHERE id = ?', [newName, id]);
    return { ...cat, name: newName };
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  if (Platform.OS === 'web') {
    const cat = webStorage.categories.find((c) => c.id === id);
    if (!cat || cat.is_custom !== 1) return false;
    const affectedOutfits = webStorage.outfits.filter((o) => o.category_id === id);
    webStorage.categories = webStorage.categories.filter((c) => c.id !== id);
    webStorage.outfits = webStorage.outfits.filter((o) => o.category_id !== id);
    return { deletedOutfitCount: affectedOutfits.length };
  }

  try {
    const db = await getDb();
    const cat = await db.getFirstAsync('SELECT * FROM categories WHERE id = ?', [id]);
    if (!cat || cat.is_custom !== 1) {
      throw new Error('Only custom categories can be deleted');
    }

    const affectedOutfits = await db.getAllAsync(
      'SELECT image_uri FROM outfits WHERE category_id = ?',
      [id]
    );

    await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);

    if (affectedOutfits && affectedOutfits.length > 0) {
      for (const o of affectedOutfits) {
        if (o?.image_uri) {
          await deleteLocalImageIfExists(o.image_uri);
        }
      }
    }

    return { deletedOutfitCount: affectedOutfits ? affectedOutfits.length : 0 };
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};
