import { Platform } from 'react-native';
import { getSqliteDb } from './sqlite';

let dbInstance = null;

// Default preset categories for Male & Female with body_zone mappings
export const DEFAULT_MALE_CATEGORIES = [
  { name: 'Cargo Pants', icon: 'pocket', gender: 'male', zone: 'bottom' },
  { name: 'Polo T-Shirt', icon: 'shirt', gender: 'male', zone: 'top' },
  { name: 'Round Neck T-Shirt', icon: 'shirt', gender: 'male', zone: 'top' },
  { name: 'Casual Shirt', icon: 'shirt', gender: 'male', zone: 'top' },
  { name: 'Jeans & Denim', icon: 'scissors', gender: 'male', zone: 'bottom' },
  { name: 'Hoodies & Sweatshirts', icon: 'layers', gender: 'male', zone: 'top' },
  { name: 'Jackets & Coats', icon: 'shield', gender: 'male', zone: 'top' },
  { name: 'Footwear & Sneakers', icon: 'footprints', gender: 'male', zone: 'footwear' },
];

export const DEFAULT_FEMALE_CATEGORIES = [
  { name: 'Tops & Crop Tops', icon: 'shirt', gender: 'female', zone: 'top' },
  { name: 'Polo T-Shirt', icon: 'shirt', gender: 'female', zone: 'top' },
  { name: 'Round Neck T-Shirt', icon: 'shirt', gender: 'female', zone: 'top' },
  { name: 'Dresses & One-Piece', icon: 'sparkles', gender: 'female', zone: 'full' },
  { name: 'Cargo Pants', icon: 'pocket', gender: 'female', zone: 'bottom' },
  { name: 'Skirts & Shorts', icon: 'scissors', gender: 'female', zone: 'bottom' },
  { name: 'Jeans & Denim', icon: 'layers', gender: 'female', zone: 'bottom' },
  { name: 'Jackets & Shrugs', icon: 'shield', gender: 'female', zone: 'top' },
  { name: 'Footwear & Heels', icon: 'footprints', gender: 'female', zone: 'footwear' },
];

// Fallback in-memory storage for web environment preview
const webStorage = {
  users: [],
  categories: [],
  outfits: [],
  saved_looks: [],
};

// Initialize categories in webStorage
let catIdCounter = 1;
[...DEFAULT_MALE_CATEGORIES, ...DEFAULT_FEMALE_CATEGORIES].forEach((cat) => {
  webStorage.categories.push({
    id: catIdCounter++,
    name: cat.name,
    icon: cat.icon,
    gender: cat.gender,
    is_custom: 0,
    body_zone: cat.zone,
  });
});

export const getDb = async () => {
  if (Platform.OS === 'web') {
    return null;
  }
  return await getSqliteDb();
};

export const initDatabase = async () => {
  if (Platform.OS === 'web') {
    console.log('Running SQLite in Web Storage compatibility mode.');
    return true;
  }

  try {
    const db = await getDb();

    // Create tables
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        gender TEXT DEFAULT 'male',
        age_group TEXT,
        height_cm TEXT,
        style_preference TEXT,
        fit_preference TEXT,
        favorite_colors TEXT,
        body_photo_uri TEXT,
        is_onboarded INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT DEFAULT 'shirt',
        gender TEXT DEFAULT 'male',
        is_custom INTEGER DEFAULT 0,
        body_zone TEXT DEFAULT 'top'
      );

      CREATE TABLE IF NOT EXISTS outfits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        title TEXT,
        brand TEXT,
        image_uri TEXT NOT NULL,
        source_type TEXT DEFAULT 'local',
        source_url TEXT,
        gender TEXT DEFAULT 'male',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS saved_looks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body_photo_uri TEXT,
        layers_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- SQLite Performance Indexes for ultra-fast query execution
      CREATE INDEX IF NOT EXISTS idx_outfits_category ON outfits(category_id);
      CREATE INDEX IF NOT EXISTS idx_outfits_gender ON outfits(gender);
      CREATE INDEX IF NOT EXISTS idx_categories_gender ON categories(gender);
      CREATE INDEX IF NOT EXISTS idx_looks_created ON saved_looks(created_at);
    `);

    // Check if initial categories exist
    const firstCat = await db.getFirstAsync('SELECT id FROM categories LIMIT 1');
    if (!firstCat) {
      console.log('Seeding default categories into SQLite DB...');
      const allPresets = [...DEFAULT_MALE_CATEGORIES, ...DEFAULT_FEMALE_CATEGORIES];
      for (const cat of allPresets) {
        await db.runAsync(
          'INSERT INTO categories (name, icon, gender, is_custom, body_zone) VALUES (?, ?, ?, 0, ?)',
          [cat.name, cat.icon, cat.gender, cat.zone || 'top']
        );
      }
    }

    // Migration helper: check if body_zone column exists on categories, if not add it
    try {
      await db.execAsync(`ALTER TABLE categories ADD COLUMN body_zone TEXT DEFAULT 'top';`);
    } catch (e) {
      // Column already exists
    }

    // Auto-correct preset category body zones for existing database installs
    try {
      await db.execAsync(`
        UPDATE categories SET body_zone = 'bottom' WHERE name IN ('Cargo Pants', 'Jeans & Denim', 'Skirts & Shorts', 'Pants & Trousers') AND is_custom = 0;
        UPDATE categories SET body_zone = 'footwear' WHERE name IN ('Footwear & Sneakers', 'Footwear & Heels') AND is_custom = 0;
        UPDATE categories SET body_zone = 'full' WHERE name IN ('Dresses & One-Piece', 'Sarees & Lehengas', 'Kurtis & Ethnic Sets') AND is_custom = 0;
        UPDATE categories SET body_zone = 'top' WHERE name IN ('Polo T-Shirt', 'Round Neck T-Shirt', 'Casual Shirt', 'Hoodies & Sweatshirts', 'Jackets & Coats', 'Tops & Crop Tops', 'Jackets & Shrugs') AND is_custom = 0;
      `);
    } catch (e) {
      console.log('Category body_zone migration error:', e);
    }

    // Migration helper for users table
    try {
      await db.execAsync(`ALTER TABLE users ADD COLUMN age_group TEXT;`);
      await db.execAsync(`ALTER TABLE users ADD COLUMN style_preference TEXT;`);
      await db.execAsync(`ALTER TABLE users ADD COLUMN fit_preference TEXT;`);
      await db.execAsync(`ALTER TABLE users ADD COLUMN favorite_colors TEXT;`);
      await db.execAsync(`ALTER TABLE users ADD COLUMN is_onboarded INTEGER DEFAULT 0;`);
    } catch (e) {
      // Columns already exist
    }

    console.log('SQLite database initialized successfully.');
    return true;
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
    return false;
  }
};

export { webStorage };
