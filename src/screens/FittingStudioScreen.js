import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import DraggableOverlay from '../components/DraggableOverlay';
import CategoryPills from '../components/CategoryPills';
import { MANNEQUIN_MODELS, getImageSource } from '../constants/avatars';
import {
  Sparkles,
  RefreshCw,
  Save,
  Shirt,
  Plus,
  UserCheck,
  ChevronUp,
  ChevronDown,
  User,
  Camera,
  Box,
} from 'lucide-react-native';

const ZONE_Y_OFFSET = {
  top: -90,        // shift up from center, onto torso/chest area
  bottom: 60,       // shift down from center, onto hips/legs area
  footwear: 160,    // shift further down, onto feet area
  full: 0,          // dresses/full outfits stay centered
};

export default function FittingStudioScreen({
  user,
  currentGender,
  categories,
  outfits,
  onSaveLook,
  onOpenAvatarSetup,
  onOpenImportUrl,
  pendingAction,
  onPendingActionHandled,
}) {
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Avatar display mode: 'real' (user photo) vs '3d' (3D Bitmoji Mannequin model)
  const [avatarMode, setAvatarMode] = useState('3d');

  // ARKit/ARCore 3D Body Tracker Roadmap Toggle
  const [arTrackingEnabled, setArTrackingEnabled] = useState(false);

  // Determine active background body avatar source
  const userPhotoUri = user?.body_photo_uri;
  const activeAvatarSource =
    avatarMode === 'real' && userPhotoUri
      ? getImageSource(userPhotoUri, currentGender)
      : MANNEQUIN_MODELS[currentGender] || MANNEQUIN_MODELS.male;

  // Filter outfits by selected category and current gender
  const filteredOutfits = outfits.filter((o) => {
    const matchesGender = o.gender === currentGender || !o.gender;
    const matchesCategory = selectedCategoryId === null || o.category_id === selectedCategoryId;
    return matchesGender && matchesCategory;
  });

  const handleAddOutfitToCanvas = (outfit) => {
    const zone = outfit.category_zone || 'top';
    const initialY = ZONE_Y_OFFSET[zone] !== undefined ? ZONE_Y_OFFSET[zone] : 0;

    const newLayer = {
      id: `layer_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      outfit_id: outfit.id,
      image_uri: outfit.image_uri,
      title: outfit.title,
      x: 0,
      y: initialY,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0,
      flipped: false,
      zIndex: layers.length + 1,
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  // Process incoming pending studio actions (e.g. Try On outfit or Load Saved Look)
  React.useEffect(() => {
    if (!pendingAction) return;

    if (pendingAction.type === 'addOutfit' && pendingAction.outfit) {
      handleAddOutfitToCanvas(pendingAction.outfit);
    }

    if (pendingAction.type === 'loadLook' && pendingAction.look) {
      const look = pendingAction.look;
      setLayers(look.layers || []);
      setSelectedLayerId(null);
      if (look.body_photo_uri) {
        setAvatarMode('real');
      } else {
        setAvatarMode('3d');
      }
    }

    if (onPendingActionHandled) {
      onPendingActionHandled();
    }
  }, [pendingAction]);

  const handleUpdateTransform = (layerId, newTransforms) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, ...newTransforms } : l))
    );
  };

  const handleDeleteLayer = (layerId) => {
    setLayers((prev) => prev.filter((l) => l.id !== layerId));
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  };

  const handleBringForward = (layerId) => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id === layerId ? { ...l, zIndex: (l.zIndex || 1) + 5 } : l
      )
    );
  };

  const handleClearCanvas = () => {
    setLayers([]);
    setSelectedLayerId(null);
  };

  const handleSaveCurrentLook = async () => {
    if (layers.length === 0) {
      alert('Please add at least one outfit to your avatar before saving!');
      return;
    }

    const title = `Look #${Math.floor(Math.random() * 900 + 100)}`;
    const photoToSave = avatarMode === 'real' && userPhotoUri ? userPhotoUri : null;
    await onSaveLook(title, photoToSave, layers);
    alert(`Look "${title}" saved to your Lookbook! ✨`);
  };

  const toggleArTracking = () => {
    const nextVal = !arTrackingEnabled;
    setArTrackingEnabled(nextVal);
    if (nextVal) {
      alert('ARKit / ARCore 3D Live Camera Pose Tracking Mode Activated! ✨ (Future 3D Real-Time Mesh Upgrade)');
    }
  };

  return (
    <View style={styles.container}>
      {/* Fitting Studio Toolbar Header */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarTitleRow}>
          <Sparkles color={COLORS.accentGold} size={16} style={{ marginRight: 4 }} />
          <Text style={styles.toolbarTitle}>Virtual Studio</Text>

          {/* ARKit / ARCore Badge */}
          <TouchableOpacity
            style={[styles.arBadge, arTrackingEnabled && styles.arBadgeActive]}
            onPress={toggleArTracking}
          >
            <Box size={10} color={arTrackingEnabled ? '#000' : COLORS.accentCyan} style={{ marginRight: 3 }} />
            <Text style={[styles.arBadgeText, arTrackingEnabled && styles.arBadgeTextActive]}>
              {arTrackingEnabled ? 'AR 3D Active' : 'AR 3D Body'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Display Mode Switcher (3D Bitmoji vs My Photo) */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeBtn, avatarMode === '3d' && styles.modeBtnActive]}
            onPress={() => setAvatarMode('3d')}
          >
            <User size={12} color={avatarMode === '3d' ? '#FFF' : COLORS.textMuted} style={{ marginRight: 3 }} />
            <Text style={[styles.modeBtnText, avatarMode === '3d' && styles.modeBtnTextActive]}>
              3D Avatar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, avatarMode === 'real' && styles.modeBtnActive]}
            onPress={() => setAvatarMode('real')}
          >
            <Camera size={12} color={avatarMode === 'real' ? '#FFF' : COLORS.textMuted} style={{ marginRight: 3 }} />
            <Text style={[styles.modeBtnText, avatarMode === 'real' && styles.modeBtnTextActive]}>
              My Photo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toolbarActions}>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleClearCanvas}
            activeOpacity={0.7}
          >
            <RefreshCw color={COLORS.textSecondary} size={14} />
            <Text style={styles.toolBtnText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolBtn, styles.saveToolBtn]}
            onPress={handleSaveCurrentLook}
            activeOpacity={0.8}
          >
            <Save color="#FFF" size={14} />
            <Text style={styles.saveToolBtnText}>Save Fit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Glassmorphic Studio Canvas Stage */}
      <TouchableOpacity
        style={styles.canvasArea}
        activeOpacity={1}
        onPress={() => setSelectedLayerId(null)}
      >
        {/* Dark Cyber Studio Podium Stage Box */}
        <View style={styles.podiumStage}>
          {/* Spotlight Glow behind avatar */}
          <LinearGradient
            colors={['rgba(108, 92, 231, 0.25)', 'transparent']}
            style={styles.spotlightGlow}
          />

          {/* Full-Body Avatar Base Image */}
          <Image
            source={activeAvatarSource}
            style={styles.bodyImage}
            resizeMode="contain"
          />

          {/* Dark Glass Vignette Border */}
          <LinearGradient
            colors={['transparent', 'rgba(11, 14, 20, 0.4)', 'rgba(11, 14, 20, 0.8)']}
            style={styles.vignetteOverlay}
          />

          {!userPhotoUri && avatarMode === 'real' && (
            <TouchableOpacity
              style={styles.setupPhotoBadge}
              onPress={onOpenAvatarSetup}
            >
              <UserCheck size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.setupPhotoBadgeText}>Upload Your Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Draggable Clothes Overlays */}
        {layers.map((layer) => (
          <DraggableOverlay
            key={layer.id}
            layer={layer}
            isSelected={selectedLayerId === layer.id}
            onSelect={setSelectedLayerId}
            onUpdateTransform={handleUpdateTransform}
            onDelete={handleDeleteLayer}
            onBringForward={handleBringForward}
          />
        ))}
      </TouchableOpacity>

      {/* Snapchat Frosted Glass Drawer Toggle Header */}
      <TouchableOpacity
        style={styles.drawerHeaderContainer}
        onPress={() => setDrawerOpen(!drawerOpen)}
        activeOpacity={0.9}
      >
        {Platform.OS === 'web' ? (
          <View style={styles.webDrawerHeader}>
            <View style={styles.drawerHandle} />
            <View style={styles.drawerTitleRow}>
              <Shirt color={COLORS.primaryLight} size={16} style={{ marginRight: 6 }} />
              <Text style={styles.drawerTitle}>Wardrobe Drawer ({filteredOutfits.length} items)</Text>
              {drawerOpen ? (
                <ChevronDown color={COLORS.textSecondary} size={18} />
              ) : (
                <ChevronUp color={COLORS.textSecondary} size={18} />
              )}
            </View>
          </View>
        ) : (
          <BlurView intensity={80} tint="dark" style={styles.blurDrawerHeader}>
            <View style={styles.drawerHandle} />
            <View style={styles.drawerTitleRow}>
              <Shirt color={COLORS.primaryLight} size={16} style={{ marginRight: 6 }} />
              <Text style={styles.drawerTitle}>Wardrobe Drawer ({filteredOutfits.length} items)</Text>
              {drawerOpen ? (
                <ChevronDown color={COLORS.textSecondary} size={18} />
              ) : (
                <ChevronUp color={COLORS.textSecondary} size={18} />
              )}
            </View>
          </BlurView>
        )}
      </TouchableOpacity>

      {/* Bottom Outfit Carousel Drawer */}
      {drawerOpen && (
        <View style={styles.drawerContent}>
          <CategoryPills
            categories={categories}
            selectedCategory={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onAddCategoryPress={onOpenImportUrl}
          />

          {filteredOutfits.length === 0 ? (
            <View style={styles.emptyDrawer}>
              <Text style={styles.emptyDrawerText}>
                No outfits found in this category.
              </Text>
              <TouchableOpacity
                style={styles.importBtnSmall}
                onPress={onOpenImportUrl}
              >
                <Plus size={12} color={COLORS.accentCyan} style={{ marginRight: 4 }} />
                <Text style={styles.importBtnTextSmall}>Import from Web URL</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.outfitScroll}
            >
              {filteredOutfits.map((outfit) => (
                <TouchableOpacity
                  key={outfit.id}
                  style={styles.outfitThumbCard}
                  onPress={() => handleAddOutfitToCanvas(outfit)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: outfit.image_uri }}
                    style={styles.thumbImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.thumbTitle} numberOfLines={1}>
                    {outfit.title || outfit.category_name || 'Outfit'}
                  </Text>
                  <View style={styles.addBadge}>
                    <Plus size={10} color="#FFF" />
                    <Text style={styles.addBadgeText}>Try On</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  toolbarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarTitle: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  arBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 206, 201, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 201, 0.4)',
  },
  arBadgeActive: {
    backgroundColor: COLORS.accentCyan,
  },
  arBadgeText: {
    color: COLORS.accentCyan,
    fontSize: 9,
    fontWeight: '700',
  },
  arBadgeTextActive: {
    color: '#000',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.full,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeBtnText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    marginLeft: 6,
  },
  toolBtnText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  saveToolBtn: {
    backgroundColor: COLORS.primary,
  },
  saveToolBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  canvasArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#07090E',
  },
  podiumStage: {
    width: '92%',
    height: '94%',
    backgroundColor: '#0B0E1B',
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: COLORS.borderGlass,
    overflow: 'hidden',
  },
  spotlightGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bodyImage: {
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  setupPhotoBadge: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: 'rgba(108, 92, 231, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  setupPhotoBadgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 11,
  },
  drawerHeaderContainer: {
    borderTopLeftRadius: RADIUS.md,
    borderTopRightRadius: RADIUS.md,
    overflow: 'hidden',
  },
  blurDrawerHeader: {
    paddingVertical: 6,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
  },
  webDrawerHeader: {
    backgroundColor: COLORS.bgCard,
    paddingVertical: 6,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
  },
  drawerHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.borderGlass,
    borderRadius: 2,
    marginBottom: 4,
  },
  drawerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerTitle: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 12,
    marginRight: 6,
  },
  drawerContent: {
    backgroundColor: COLORS.bgCard,
    paddingBottom: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
  },
  outfitScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  outfitThumbCard: {
    width: 90,
    height: 110,
    backgroundColor: '#0F131D',
    borderRadius: RADIUS.sm,
    marginRight: 10,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  thumbImage: {
    width: '100%',
    height: 65,
  },
  thumbTitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  addBadge: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    width: '100%',
    justifyContent: 'center',
  },
  addBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },
  emptyDrawer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyDrawerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  importBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 206, 201, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 201, 0.4)',
  },
  importBtnTextSmall: {
    color: COLORS.accentCyan,
    fontSize: 11,
    fontWeight: '700',
  },
});
