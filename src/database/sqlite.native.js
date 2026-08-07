import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export const getSqliteDb = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('digital_wardrobe.db');
  }
  return dbInstance;
};
