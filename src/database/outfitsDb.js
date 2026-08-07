import { Platform } from 'react-native';
import { getDb, webStorage } from './db';
import { deleteLocalImageIfExists } from '../utils/fileSystem';

export const getOutfits = async (categoryId = null, gender = 'male') => {
  if (Platform.OS === 'web') {
    let list = webStorage.outfits;
    if (gender) {
      list = list.filter((o) => o.gender === gender);
    }
    if (categoryId) {
      list = list.filter((o) => o.category_id === categoryId);
    }
    return list.map((o) => {
      const cat = webStorage.categories.find((c) => c.id === o.category_id);
      return {
        ...o,
        category_name: cat?.name || 'General',
        category_zone: cat?.body_zone || cat?.zone || 'top',
      };
    });
  }

  try {
    const db = await getDb();
    let query =
      'SELECT o.*, c.name as category_name, c.body_zone as category_zone FROM outfits o LEFT JOIN categories c ON o.category_id = c.id WHERE 1=1';
    const params = [];

    if (gender) {
      query += ' AND o.gender = ?';
      params.push(gender);
    }

    if (categoryId) {
      query += ' AND o.category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY o.id DESC';

    const rows = await db.getAllAsync(query, params);
    return rows || [];
  } catch (error) {
    console.error('Error fetching outfits:', error);
    return [];
  }
};

export const addOutfit = async ({
  categoryId,
  title = '',
  brand = '',
  imageUri,
  sourceType = 'local',
  sourceUrl = '',
  gender = 'male',
}) => {
  if (Platform.OS === 'web') {
    const newOutfit = {
      id: Date.now(),
      category_id: categoryId,
      title,
      brand,
      image_uri: imageUri,
      source_type: sourceType,
      source_url: sourceUrl,
      gender,
      created_at: new Date().toISOString(),
    };
    webStorage.outfits.unshift(newOutfit);
    return newOutfit;
  }

  try {
    const db = await getDb();
    const result = await db.runAsync(
      `INSERT INTO outfits (category_id, title, brand, image_uri, source_type, source_url, gender) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [categoryId, title, brand, imageUri, sourceType, sourceUrl, gender]
    );

    return {
      id: result.lastInsertRowId,
      category_id: categoryId,
      title,
      brand,
      image_uri: imageUri,
      source_type: sourceType,
      source_url: sourceUrl,
      gender,
    };
  } catch (error) {
    console.error('Error adding outfit:', error);
    throw error;
  }
};

export const updateOutfit = async (id, { title, brand, categoryId }) => {
  if (Platform.OS === 'web') {
    const outfit = webStorage.outfits.find((o) => o.id === id);
    if (outfit) {
      if (title !== undefined) outfit.title = title;
      if (brand !== undefined) outfit.brand = brand;
      if (categoryId !== undefined) outfit.category_id = categoryId;
    }
    return outfit;
  }

  try {
    const db = await getDb();
    const existing = await db.getFirstAsync('SELECT * FROM outfits WHERE id = ?', [id]);
    if (!existing) throw new Error('Outfit not found');

    const newTitle = title !== undefined ? title : existing.title;
    const newBrand = brand !== undefined ? brand : existing.brand;
    const newCategoryId = categoryId !== undefined ? categoryId : existing.category_id;

    await db.runAsync(
      'UPDATE outfits SET title = ?, brand = ?, category_id = ? WHERE id = ?',
      [newTitle, newBrand, newCategoryId, id]
    );

    return await db.getFirstAsync('SELECT * FROM outfits WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error updating outfit:', error);
    throw error;
  }
};

export const deleteOutfit = async (id) => {
  if (Platform.OS === 'web') {
    webStorage.outfits = webStorage.outfits.filter((o) => o.id !== id);
    return true;
  }

  try {
    const db = await getDb();
    const outfit = await db.getFirstAsync(
      'SELECT image_uri FROM outfits WHERE id = ?',
      [id]
    );

    await db.runAsync('DELETE FROM outfits WHERE id = ?', [id]);

    if (outfit?.image_uri) {
      await deleteLocalImageIfExists(outfit.image_uri);
    }

    return true;
  } catch (error) {
    console.error('Error deleting outfit:', error);
    return false;
  }
};
