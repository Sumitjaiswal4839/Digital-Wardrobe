import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import {
  Camera,
  Image as ImageIcon,
  UserCheck,
  Sparkles,
  Check,
  RotateCcw,
  Flame,
  Scissors,
  Palette,
  Trash2,
  MessageSquare,
  FileText,
  ShieldCheck,
} from 'lucide-react-native';
import { pickImageFromGallery, takePhotoWithCamera } from '../utils/fileSystem';

import FeedbackModal from '../components/FeedbackModal';
import TermsModal from '../components/TermsModal';
import PrivacyModal from '../components/PrivacyModal';

import { MODEL_TEMPLATES, getImageSource } from '../constants/avatars';

export default function AvatarSetupScreen({
  user,
  currentGender,
  onUpdateUser,
  onDeleteProfile,
}) {
  const [name, setName] = useState(user?.name || 'Sumit');
  const [photoUri, setPhotoUri] = useState(
    user?.body_photo_uri || MODEL_TEMPLATES[currentGender][0]
  );
  const [saving, setSaving] = useState(false);

  // Modals state
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const handlePickGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      setPhotoUri(uri);
    }
  };

  const handleTakePhoto = async () => {
    const uri = await takePhotoWithCamera();
    if (uri) {
      setPhotoUri(uri);
    }
  };

  const handleSelectTemplate = (templateUri) => {
    setPhotoUri(templateUri);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await onUpdateUser({
      name: name.trim() || 'Sumit',
      gender: currentGender,
      bodyPhotoUri: photoUri,
    });
    setSaving(false);
    alert('Avatar profile saved successfully! ✨');
  };

  const handleResetOnboarding = async () => {
    await onUpdateUser({ isOnboarded: 0 });
  };

  const handleDeletePress = () => {
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(
        'Are you sure you want to delete your profile & wardrobe data? This will reset your profile and restart setup.'
      );
      if (confirmed) {
        onDeleteProfile();
      }
    } else {
      Alert.alert(
        'Delete Profile & Data',
        'Are you sure you want to delete your profile? This will reset your profile and take you back to Onboarding Setup.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Profile',
            style: 'destructive',
            onPress: onDeleteProfile,
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar Preview Card */}
      <View style={styles.previewCard}>
        <Text style={styles.sectionTitle}>Full-Body Avatar Photo</Text>
        <Text style={styles.sectionSubtitle}>
          Upload your photo to try outfits on your real body
        </Text>

        <View style={styles.avatarFrame}>
          <Image
            source={getImageSource(photoUri, currentGender)}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>

        {/* Upload Action Buttons */}
        <View style={styles.uploadBtnRow}>
          <TouchableOpacity style={styles.uploadBtn} onPress={handleTakePhoto}>
            <Camera size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.uploadBtnText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadBtn, styles.galleryBtn]}
            onPress={handlePickGallery}
          >
            <ImageIcon size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.uploadBtnText}>Photo Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preset Model Templates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Or Choose a Model Avatar Template</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {MODEL_TEMPLATES[currentGender].map((templateUri, idx) => {
            const isSelected = photoUri === templateUri;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.templateCard, isSelected && styles.templateCardActive]}
                onPress={() => handleSelectTemplate(templateUri)}
              >
                <Image source={getImageSource(templateUri, currentGender)} style={styles.templateImage} resizeMode="cover" />
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Check size={12} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Style Profile Details Card */}
      <View style={styles.section}>
        <View style={styles.profileHeaderRow}>
          <Text style={styles.sectionTitle}>Your Style Profile</Text>
          <TouchableOpacity style={styles.resetBadgeBtn} onPress={handleResetOnboarding}>
            <RotateCcw size={12} color={COLORS.accentCyan} style={{ marginRight: 4 }} />
            <Text style={styles.resetBadgeText}>Re-run Setup Wizard</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={COLORS.textMuted}
        />

        <View style={styles.tagGrid}>
          <View style={styles.tagItem}>
            <Flame size={14} color={COLORS.secondary} style={{ marginRight: 4 }} />
            <Text style={styles.tagLabel}>Style: </Text>
            <Text style={styles.tagValue}>{user?.style_preference || 'Streetwear'}</Text>
          </View>

          <View style={styles.tagItem}>
            <Scissors size={14} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
            <Text style={styles.tagLabel}>Fit: </Text>
            <Text style={styles.tagValue}>{user?.fit_preference || 'Oversized'}</Text>
          </View>

          <View style={styles.tagItem}>
            <Palette size={14} color={COLORS.accentCyan} style={{ marginRight: 4 }} />
            <Text style={styles.tagLabel}>Palette: </Text>
            <Text style={styles.tagValue}>{user?.favorite_colors || 'Black & White'}</Text>
          </View>

          <View style={styles.tagItem}>
            <Text style={styles.tagLabel}>Age Group: </Text>
            <Text style={styles.tagValue}>{user?.age_group || 'Gen-Z (18-24)'}</Text>
          </View>
        </View>
      </View>

      {/* Save Profile Button */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSaveProfile}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Sparkles size={18} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Avatar Profile'}</Text>
      </TouchableOpacity>

      {/* App Support & Legal Options Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info & Legal</Text>

        <TouchableOpacity style={styles.menuRow} onPress={() => setFeedbackVisible(true)}>
          <MessageSquare size={16} color={COLORS.accentCyan} style={{ marginRight: 10 }} />
          <Text style={styles.menuRowText}>Give Feedback / Request Feature</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={() => setTermsVisible(true)}>
          <FileText size={16} color={COLORS.primaryLight} style={{ marginRight: 10 }} />
          <Text style={styles.menuRowText}>Terms & Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={() => setPrivacyVisible(true)}>
          <ShieldCheck size={16} color={COLORS.accentGreen} style={{ marginRight: 10 }} />
          <Text style={styles.menuRowText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Profile Section */}
      <View style={styles.deleteSection}>
        <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={styles.deleteProfileBtn}
          onPress={handleDeletePress}
          activeOpacity={0.8}
        >
          <Trash2 size={16} color={COLORS.danger} style={{ marginRight: 6 }} />
          <Text style={styles.deleteProfileBtnText}>Delete Profile & Reset App</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <FeedbackModal visible={feedbackVisible} onClose={() => setFeedbackVisible(false)} />
      <TermsModal visible={termsVisible} onClose={() => setTermsVisible(false)} />
      <PrivacyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    padding: SPACING.md,
  },
  previewCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  avatarFrame: {
    width: 220,
    height: 280,
    backgroundColor: '#0F131D',
    borderRadius: RADIUS.md,
    marginVertical: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  uploadBtnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    marginHorizontal: 4,
  },
  galleryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  uploadBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: SPACING.md,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resetBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 206, 201, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 201, 0.3)',
  },
  resetBadgeText: {
    color: COLORS.accentCyan,
    fontSize: 10,
    fontWeight: '700',
  },
  templateCard: {
    width: 90,
    height: 120,
    borderRadius: RADIUS.md,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  templateCardActive: {
    borderColor: COLORS.primary,
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    padding: 4,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    fontSize: 14,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  tagLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  tagValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  menuRowText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteSection: {
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  dangerZoneTitle: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  deleteProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.18)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  deleteProfileBtnText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 13,
  },
});
