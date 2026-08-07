import { Platform } from 'react-native';
import { getDb, webStorage } from './db';
import { scanUrlForThreats, sanitizeUrl } from '../utils/security';

// In-memory fallback mock for web
const webAdminStorage = {
  feedbacks: [
    {
      id: 1,
      user_name: 'Sumit',
      rating: 5,
      category: 'UI & Design',
      comment: 'Super clean dark mode glassmorphism UI! Fitting studio drag-and-drop outfit overlay works really fast.',
      status: 'Reviewed',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  adsConfig: {
    banner_enabled: 1,
    interstitial_freq: 3,
    rewarded_enabled: 1,
    daily_revenue: 0,
    monthly_revenue: 0,
    impressions: 0,
    clicks: 0,
    ecpm: 0,
  },
  urlLogs: [
    {
      id: 1,
      url: 'https://i.pinimg.com/736x/cb/4f/92/cb4f92d7a8e2.jpg',
      domain: 'pinimg.com',
      risk_level: 'SAFE',
      flags_json: JSON.stringify(['Passed Security Sanitization Checks']),
      status: 'Approved',
      created_at: new Date().toISOString(),
    },
  ],
};

export const initAdminDatabase = async () => {
  if (Platform.OS === 'web') return true;

  try {
    const db = await getDb();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS admin_feedbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        category TEXT DEFAULT 'General Feedback',
        comment TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_ads_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        banner_enabled INTEGER DEFAULT 1,
        interstitial_freq INTEGER DEFAULT 3,
        rewarded_enabled INTEGER DEFAULT 1,
        daily_revenue REAL DEFAULT 0,
        monthly_revenue REAL DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        ecpm REAL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS admin_url_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        domain TEXT,
        risk_level TEXT DEFAULT 'SAFE',
        flags_json TEXT,
        status TEXT DEFAULT 'Approved',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default ad config if empty
    const firstAdConfig = await db.getFirstAsync('SELECT id FROM admin_ads_config LIMIT 1');
    if (!firstAdConfig) {
      await db.runAsync(
        `INSERT INTO admin_ads_config (banner_enabled, interstitial_freq, rewarded_enabled, daily_revenue, monthly_revenue, impressions, clicks, ecpm)
         VALUES (1, 3, 1, 0, 0, 0, 0, 0)`
      );
    }

    return true;
  } catch (error) {
    console.error('Error initializing admin database:', error);
    return false;
  }
};

/**
 * Computes real local wardrobe analytics directly from SQLite database tables
 */
export const getWardrobeInsights = async () => {
  if (Platform.OS === 'web') {
    const totalOutfits = webStorage.outfits ? webStorage.outfits.length : 0;
    const totalSavedLooks = webStorage.savedLooks ? webStorage.savedLooks.length : 0;
    const totalCustomCats = webStorage.categories
      ? webStorage.categories.filter((c) => c.is_custom === 1).length
      : 0;

    const categoryCounts = {};
    (webStorage.outfits || []).forEach((o) => {
      categoryCounts[o.category_id] = (categoryCounts[o.category_id] || 0) + 1;
    });

    let topCatName = 'N/A';
    let maxCount = 0;
    Object.keys(categoryCounts).forEach((catId) => {
      if (categoryCounts[catId] > maxCount) {
        maxCount = categoryCounts[catId];
        const found = (webStorage.categories || []).find((c) => String(c.id) === String(catId));
        if (found) topCatName = found.name;
      }
    });

    const user = webStorage.users[0] || {};
    const styleVibe = user.style_preference || 'Streetwear';
    const fitPref = user.fit_preference || 'Oversized';
    const favoriteColors = user.favorite_colors || 'Black & White';

    let daysActive = 1;
    if (user.created_at) {
      const created = new Date(user.created_at).getTime();
      const diff = Date.now() - created;
      daysActive = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
    }

    return {
      totalOutfits,
      totalSavedLooks,
      totalCustomCats,
      topCategory: topCatName,
      styleVibe,
      fitPref,
      favoriteColors,
      daysActive,
    };
  }

  try {
    const db = await getDb();

    // Total outfits count
    const outfitRow = await db.getFirstAsync('SELECT COUNT(*) as count FROM outfits');
    const totalOutfits = outfitRow ? outfitRow.count : 0;

    // Total saved looks count
    const looksRow = await db.getFirstAsync('SELECT COUNT(*) as count FROM saved_looks');
    const totalSavedLooks = looksRow ? looksRow.count : 0;

    // Total custom categories count
    const customCatsRow = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM categories WHERE is_custom = 1'
    );
    const totalCustomCats = customCatsRow ? customCatsRow.count : 0;

    // Top Category by outfit count
    const topCatRow = await db.getFirstAsync(
      `SELECT c.name, COUNT(o.id) as outfit_count 
       FROM outfits o 
       JOIN categories c ON o.category_id = c.id 
       GROUP BY o.category_id 
       ORDER BY outfit_count DESC 
       LIMIT 1`
    );
    const topCategory = topCatRow ? topCatRow.name : 'N/A';

    // User profile preference details
    const user = await db.getFirstAsync('SELECT * FROM users LIMIT 1');
    const styleVibe = user?.style_preference || 'Streetwear';
    const fitPref = user?.fit_preference || 'Oversized';
    const favoriteColors = user?.favorite_colors || 'Black & White';

    let daysActive = 1;
    if (user?.created_at) {
      const created = new Date(user.created_at).getTime();
      const diff = Date.now() - created;
      daysActive = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
    }

    return {
      totalOutfits,
      totalSavedLooks,
      totalCustomCats,
      topCategory,
      styleVibe,
      fitPref,
      favoriteColors,
      daysActive,
    };
  } catch (error) {
    console.error('Error fetching wardrobe insights:', error);
    return {
      totalOutfits: 0,
      totalSavedLooks: 0,
      totalCustomCats: 0,
      topCategory: 'N/A',
      styleVibe: 'Streetwear',
      fitPref: 'Oversized',
      favoriteColors: 'Black & White',
      daysActive: 1,
    };
  }
};

/**
 * Submits user feedback (Stores safely using parameterized SQL)
 */
export const submitUserFeedback = async ({ userName, rating, category, comment }) => {
  const cleanComment = sanitizeUrl(comment);
  const cleanName = sanitizeUrl(userName) || 'Anonymous';

  if (Platform.OS === 'web') {
    const newFeedback = {
      id: Date.now(),
      user_name: cleanName,
      rating,
      category,
      comment: cleanComment,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    webAdminStorage.feedbacks.unshift(newFeedback);
    return newFeedback;
  }

  try {
    const db = await getDb();
    const result = await db.runAsync(
      `INSERT INTO admin_feedbacks (user_name, rating, category, comment, status) VALUES (?, ?, ?, ?, 'Pending')`,
      [cleanName, rating, category, cleanComment]
    );
    return {
      id: result.lastInsertRowId,
      user_name: cleanName,
      rating,
      category,
      comment: cleanComment,
      status: 'Pending',
    };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export const getAdminFeedbacks = async () => {
  if (Platform.OS === 'web') {
    return webAdminStorage.feedbacks;
  }

  try {
    const db = await getDb();
    const rows = await db.getAllAsync('SELECT * FROM admin_feedbacks ORDER BY id DESC');
    return rows || [];
  } catch (error) {
    console.error('Error fetching admin feedbacks:', error);
    return [];
  }
};

export const updateFeedbackStatus = async (id, status) => {
  if (Platform.OS === 'web') {
    const fb = webAdminStorage.feedbacks.find((f) => f.id === id);
    if (fb) fb.status = status;
    return true;
  }

  try {
    const db = await getDb();
    await db.runAsync('UPDATE admin_feedbacks SET status = ? WHERE id = ?', [status, id]);
    return true;
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return false;
  }
};

/**
 * AdMob Monetization Controls
 */
export const getAdminAdsConfig = async () => {
  if (Platform.OS === 'web') {
    return webAdminStorage.adsConfig;
  }

  try {
    const db = await getDb();
    const config = await db.getFirstAsync('SELECT * FROM admin_ads_config LIMIT 1');
    return config || webAdminStorage.adsConfig;
  } catch (error) {
    console.error('Error fetching ads config:', error);
    return webAdminStorage.adsConfig;
  }
};

export const updateAdminAdsConfig = async (fields) => {
  if (Platform.OS === 'web') {
    webAdminStorage.adsConfig = { ...webAdminStorage.adsConfig, ...fields };
    return webAdminStorage.adsConfig;
  }

  try {
    const db = await getDb();
    const current = await getAdminAdsConfig();
    const banner = fields.banner_enabled ?? current.banner_enabled;
    const freq = fields.interstitial_freq ?? current.interstitial_freq;
    const rewarded = fields.rewarded_enabled ?? current.rewarded_enabled;

    await db.runAsync(
      `UPDATE admin_ads_config SET banner_enabled = ?, interstitial_freq = ?, rewarded_enabled = ? WHERE id = ?`,
      [banner, freq, rewarded, current.id || 1]
    );

    return getAdminAdsConfig();
  } catch (error) {
    console.error('Error updating ads config:', error);
    throw error;
  }
};

/**
 * Steganography & URL Security Inspection Logs
 */
export const logImportedUrlSecurity = async (url) => {
  const scan = scanUrlForThreats(url);
  const domain = url.split('/')[2] || 'unknown';

  if (Platform.OS === 'web') {
    const newLog = {
      id: Date.now(),
      url,
      domain,
      risk_level: scan.riskLevel,
      flags: scan.flags,
      status: scan.riskLevel === 'HIGH' ? 'Flagged' : 'Approved',
      created_at: new Date().toISOString(),
    };
    webAdminStorage.urlLogs.unshift(newLog);
    return newLog;
  }

  try {
    const db = await getDb();
    const flagsJson = JSON.stringify(scan.flags);
    const status = scan.riskLevel === 'HIGH' ? 'Flagged' : 'Approved';

    const result = await db.runAsync(
      `INSERT INTO admin_url_logs (url, domain, risk_level, flags_json, status) VALUES (?, ?, ?, ?, ?)`,
      [url, domain, scan.riskLevel, flagsJson, status]
    );

    return {
      id: result.lastInsertRowId,
      url,
      domain,
      risk_level: scan.riskLevel,
      flags: scan.flags,
      status,
    };
  } catch (error) {
    console.error('Error logging URL security:', error);
    return null;
  }
};

export const getAdminUrlLogs = async () => {
  if (Platform.OS === 'web') {
    return webAdminStorage.urlLogs;
  }

  try {
    const db = await getDb();
    const rows = await db.getAllAsync('SELECT * FROM admin_url_logs ORDER BY id DESC');
    return rows.map((r) => ({
      ...r,
      flags: JSON.parse(r.flags_json || '[]'),
    }));
  } catch (error) {
    console.error('Error fetching admin URL logs:', error);
    return [];
  }
};
