import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PanResponder,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from './src/theme/theme';
import {
  initDatabase,
} from './src/database/db';
import {
  getCategoriesByGender,
  addCustomCategory,
  updateCategory,
  deleteCategory,
} from './src/database/categoriesDb';
import {
  getOutfits,
  addOutfit,
  updateOutfit,
  deleteOutfit,
} from './src/database/outfitsDb';
import { getUserProfile, updateUserProfile, deleteUserProfile } from './src/database/userDb';
import { getSavedLooks, saveLook, deleteSavedLook } from './src/database/looksDb';
import { initAdminDatabase } from './src/database/adminDb';

import Header from './src/components/Header';
import ImportUrlModal from './src/components/ImportUrlModal';
import AddCategoryModal from './src/components/AddCategoryModal';
import AdminPasscodeModal from './src/components/AdminPasscodeModal';

import OnboardingScreen from './src/screens/OnboardingScreen';
import FittingStudioScreen from './src/screens/FittingStudioScreen';
import WardrobeCatalogScreen from './src/screens/WardrobeCatalogScreen';
import SavedLooksScreen from './src/screens/SavedLooksScreen';
import AvatarSetupScreen from './src/screens/AvatarSetupScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

import { Sparkles, Shirt, Heart, User, Plus } from 'lucide-react-native';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'catalog' | 'looks' | 'avatar'
  const [currentGender, setCurrentGender] = useState('male');
  
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [savedLooks, setSavedLooks] = useState([]);

  // Pending action to pass into FittingStudioScreen (e.g. Try On outfit or Load Saved Look)
  const [pendingStudioAction, setPendingStudioAction] = useState(null);

  // Admin Portal & Security States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPasscodeVisible, setAdminPasscodeVisible] = useState(false);

  // Modals visibility
  const [importUrlModalVisible, setImportUrlModalVisible] = useState(false);
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);

  // Touch gesture responder for 3-finger left swipe trigger
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        return evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 3;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < -60 && evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 3) {
          setAdminPasscodeVisible(true);
        }
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // Initialize SQLite database and load records
  useEffect(() => {
    async function prepare() {
      const dbOk = await initDatabase();
      const adminDbOk = await initAdminDatabase();

      if (dbOk && adminDbOk) {
        const u = await getUserProfile();
        setUser(u);
        if (u && u.is_onboarded === 1) {
          setIsOnboarded(true);
          const userGender = u.gender || 'male';
          setCurrentGender(userGender);
          await loadData(userGender);
        } else {
          setIsOnboarded(false);
        }
        setDbReady(true);
      }
    }
    prepare();
  }, []);

  const loadData = async (gender = currentGender) => {
    try {
      const u = await getUserProfile();
      setUser(u);

      const cats = await getCategoriesByGender(gender);
      setCategories(cats);

      const outs = await getOutfits(null, gender);
      setOutfits(outs);

      const looks = await getSavedLooks();
      setSavedLooks(looks);
    } catch (err) {
      console.error('Error loading DB data:', err);
    }
  };

  const handleCompleteOnboarding = async (userProfile) => {
    setUser(userProfile);
    setIsOnboarded(true);
    const userGender = userProfile.gender || 'male';
    setCurrentGender(userGender);
    await loadData(userGender);
    setActiveTab('studio');
  };

  const handleGenderChange = async (gender) => {
    setCurrentGender(gender);
    await loadData(gender);
  };

  const handleSaveOutfit = async (outfitData) => {
    await addOutfit(outfitData);
    await loadData(currentGender);
  };

  const handleUpdateOutfit = async (id, updates) => {
    await updateOutfit(id, updates);
    await loadData(currentGender);
  };

  const handleDeleteOutfit = async (id) => {
    await deleteOutfit(id);
    await loadData(currentGender);
  };

  const handleSaveCategory = async (name, gender, zone) => {
    await addCustomCategory(name, gender, 'tag', zone);
    await loadData(currentGender);
  };

  const handleUpdateCategory = async (id, newName) => {
    await updateCategory(id, newName);
    await loadData(currentGender);
  };

  const handleDeleteCategory = async (id) => {
    await deleteCategory(id);
    await loadData(currentGender);
  };

  const handleUpdateUser = async (updatedData) => {
    const updated = await updateUserProfile(updatedData);
    setUser(updated);
    if (updatedData.isOnboarded === 0) {
      setIsOnboarded(false);
    }
  };

  const handleDeleteProfile = async () => {
    await deleteUserProfile();
    setUser(null);
    setIsOnboarded(false);
  };

  const handleSaveLook = async (title, bodyPhotoUri, layers) => {
    await saveLook(title, bodyPhotoUri, layers);
    await loadData(currentGender);
  };

  const handleDeleteLook = async (id) => {
    await deleteSavedLook(id);
    await loadData(currentGender);
  };

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing Digital Wardrobe DB...</Text>
      </View>
    );
  }

  // Fullstack Developer Admin Panel View
  if (isAdminMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
        <AdminDashboardScreen onExitAdmin={() => setIsAdminMode(false)} />
      </SafeAreaView>
    );
  }

  // First Launch Onboarding Flow
  if (!isOnboarded) {
    return (
      <OnboardingScreen onCompleteOnboarding={handleCompleteOnboarding} />
    );
  }

  const BottomBarContent = (
    <View style={styles.bottomBarInner}>
      <TouchableOpacity
        style={[styles.navItem, activeTab === 'studio' && styles.navItemActive]}
        onPress={() => setActiveTab('studio')}
      >
        <Sparkles
          size={20}
          color={activeTab === 'studio' ? COLORS.accentGold : COLORS.textMuted}
        />
        <Text
          style={[
            styles.navText,
            activeTab === 'studio' && styles.navTextActiveGold,
          ]}
        >
          Studio
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'catalog' && styles.navItemActive]}
        onPress={() => setActiveTab('catalog')}
      >
        <Shirt
          size={20}
          color={activeTab === 'catalog' ? COLORS.primaryLight : COLORS.textMuted}
        />
        <Text
          style={[
            styles.navText,
            activeTab === 'catalog' && styles.navTextActive,
          ]}
        >
          Wardrobe
        </Text>
      </TouchableOpacity>

      {/* Center Quick URL Import Floating Action Button */}
      <TouchableOpacity
        style={styles.fabBtn}
        onPress={() => setImportUrlModalVisible(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.fabGradient}
        >
          <Plus size={22} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'looks' && styles.navItemActive]}
        onPress={() => setActiveTab('looks')}
      >
        <Heart
          size={20}
          color={activeTab === 'looks' ? COLORS.secondary : COLORS.textMuted}
        />
        <Text
          style={[
            styles.navText,
            activeTab === 'looks' && styles.navTextActiveSecondary,
          ]}
        >
          Saved Fits
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'avatar' && styles.navItemActive]}
        onPress={() => setActiveTab('avatar')}
      >
        <User
          size={20}
          color={activeTab === 'avatar' ? COLORS.accentCyan : COLORS.textMuted}
        />
        <Text
          style={[
            styles.navText,
            activeTab === 'avatar' && styles.navTextActiveCyan,
          ]}
        >
          Avatar
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} {...panResponder.panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />

      {/* Snapchat / Instagram Style Top Header with Frosted Glass Blur */}
      <Header
        user={user}
        currentGender={currentGender}
        onGenderChange={handleGenderChange}
        onOpenProfile={() => setActiveTab('avatar')}
        onTriggerAdmin={() => setAdminPasscodeVisible(true)}
      />

      {/* Main Screen Content */}
      <View style={styles.mainContainer}>
        {activeTab === 'studio' && (
          <FittingStudioScreen
            user={user}
            currentGender={currentGender}
            categories={categories}
            outfits={outfits}
            onSaveLook={handleSaveLook}
            onOpenAvatarSetup={() => setActiveTab('avatar')}
            onOpenImportUrl={() => setImportUrlModalVisible(true)}
            pendingAction={pendingStudioAction}
            onPendingActionHandled={() => setPendingStudioAction(null)}
          />
        )}

        {activeTab === 'catalog' && (
          <WardrobeCatalogScreen
            categories={categories}
            outfits={outfits}
            currentGender={currentGender}
            onTryOnOutfit={(outfit) => {
              setPendingStudioAction({ type: 'addOutfit', outfit });
              setActiveTab('studio');
            }}
            onDeleteOutfit={handleDeleteOutfit}
            onUpdateOutfit={handleUpdateOutfit}
            onOpenImportUrl={() => setImportUrlModalVisible(true)}
            onAddCustomCategory={() => setAddCategoryModalVisible(true)}
            onSaveOutfit={handleSaveOutfit}
          />
        )}

        {activeTab === 'looks' && (
          <SavedLooksScreen
            savedLooks={savedLooks}
            onLoadLook={(look) => {
              setPendingStudioAction({ type: 'loadLook', look });
              setActiveTab('studio');
            }}
            onDeleteLook={handleDeleteLook}
          />
        )}

        {activeTab === 'avatar' && (
          <AvatarSetupScreen
            user={user}
            currentGender={currentGender}
            onUpdateUser={handleUpdateUser}
            onDeleteProfile={handleDeleteProfile}
          />
        )}
      </View>

      {/* Snapchat Frosted Glass Blur Bottom Navigation Bar */}
      {Platform.OS === 'web' ? (
        <View style={styles.webBottomBar}>{BottomBarContent}</View>
      ) : (
        <BlurView intensity={70} tint="dark" style={styles.blurBottomBar}>
          {BottomBarContent}
        </BlurView>
      )}

      {/* Web Image URL Import Modal */}
      <ImportUrlModal
        visible={importUrlModalVisible}
        onClose={() => setImportUrlModalVisible(false)}
        categories={categories}
        currentGender={currentGender}
        onSaveOutfit={handleSaveOutfit}
      />

      {/* Custom Category Modal */}
      <AddCategoryModal
        visible={addCategoryModalVisible}
        onClose={() => setAddCategoryModalVisible(false)}
        currentGender={currentGender}
        categories={categories}
        outfits={outfits}
        onSaveCategory={handleSaveCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Admin Developer Passcode Modal */}
      <AdminPasscodeModal
        visible={adminPasscodeVisible}
        onClose={() => setAdminPasscodeVisible(false)}
        onSuccess={() => {
          setAdminPasscodeVisible(false);
          setIsAdminMode(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  mainContainer: {
    flex: 1,
  },
  blurBottomBar: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
  },
  webBottomBar: {
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  navItemActive: {
    transform: [{ scale: 1.05 }],
  },
  navText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  navTextActive: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  navTextActiveGold: {
    color: COLORS.accentGold,
    fontWeight: '700',
  },
  navTextActiveSecondary: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  navTextActiveCyan: {
    color: COLORS.accentCyan,
    fontWeight: '700',
  },
  fabBtn: {
    top: -14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgDark,
  },
});
