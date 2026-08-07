import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Camera,
  Image as ImageIcon,
  User,
  Shield,
  Palette,
  Scissors,
  Flame,
  FileText,
  ShieldCheck,
} from 'lucide-react-native';
import { pickImageFromGallery, takePhotoWithCamera } from '../utils/fileSystem';
import { saveOnboardingProfile } from '../database/userDb';

import TermsModal from '../components/TermsModal';
import PrivacyModal from '../components/PrivacyModal';

const AGE_GROUPS = ['Teen (13-17)', 'Gen-Z (18-24)', 'Young Adult (25-34)', 'Adult (35+)', 'Other / Prefer not to say'];
const STYLES = ['Streetwear', 'Casual', 'Formal', 'Minimalist', 'Trendy', 'Athletic', 'Classic', 'Other / Mixed Style'];
const FITS = ['Slim Fit', 'Regular Fit', 'Oversized', 'Relaxed Fit', 'Other / Flexible'];
const COLOR_PALETTES = ['Black & White', 'Earth Tones', 'Pastel Vibe', 'Neon & Vibrant', 'Denim Blues', 'Not Decided / Any Color', 'Fixed Single Color'];

import { MODEL_TEMPLATES, getImageSource } from '../constants/avatars';

export default function OnboardingScreen({ onCompleteOnboarding }) {
  const [step, setStep] = useState(1);

  // 7 Profile Details State
  const [name, setName] = useState('Sumit');
  const [gender, setGender] = useState('male');
  const [ageGroup, setAgeGroup] = useState('Gen-Z (18-24)');
  const [stylePref, setStylePref] = useState('Streetwear');
  const [fitPref, setFitPref] = useState('Oversized');
  const [colorPref, setColorPref] = useState('Black & White');
  const [photoUri, setPhotoUri] = useState(MODEL_TEMPLATES.male[0]);

  // Legal Modals State
  const [termsVisible, setTermsVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const totalSteps = 7;

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      alert('Please enter your name!');
      return;
    }
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleFinishSetup();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handlePickGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) setPhotoUri(uri);
  };

  const handleTakePhoto = async () => {
    const uri = await takePhotoWithCamera();
    if (uri) setPhotoUri(uri);
  };

  const handleFinishSetup = async () => {
    try {
      const userProfile = await saveOnboardingProfile({
        name: name.trim() || 'Sumit',
        gender,
        ageGroup,
        stylePreference: stylePref,
        fitPreference: fitPref,
        favoriteColors: colorPref,
        bodyPhotoUri: photoUri,
      });

      onCompleteOnboarding(userProfile);
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      alert('Something went wrong saving your profile.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />

      {/* Top Header Step Progress Bar */}
      <View style={styles.header}>
        <View style={styles.progressRow}>
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.progressBarSegment,
                idx + 1 <= step && styles.progressBarActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepCounterText}>
          Step {step} of {totalSteps}
        </Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Step 1: Name */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight]}
              style={styles.iconCircle}
            >
              <User size={32} color="#FFF" />
            </LinearGradient>
            <Text style={styles.title}>Welcome to Digital Wardrobe! ✨</Text>
            <Text style={styles.subtitle}>Let's set up your personal style profile.</Text>

            <Text style={styles.label}>What should we call you?</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />
          </View>
        )}

        {/* Step 2: Gender */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Select Your Wardrobe Gender</Text>
            <Text style={styles.subtitle}>
              This customizes your clothing categories and body avatar.
            </Text>

            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.genderCard,
                  gender === 'male' && styles.genderCardActiveMale,
                ]}
                onPress={() => {
                  setGender('male');
                  setPhotoUri(MODEL_TEMPLATES.male[0]);
                }}
              >
                <Text style={styles.genderEmoji}>👨</Text>
                <Text style={styles.genderTitle}>Male</Text>
                <Text style={styles.genderDesc}>Cargo, Polo, Shirts, Denim</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderCard,
                  gender === 'female' && styles.genderCardActiveFemale,
                ]}
                onPress={() => {
                  setGender('female');
                  setPhotoUri(MODEL_TEMPLATES.female[0]);
                }}
              >
                <Text style={styles.genderEmoji}>👩</Text>
                <Text style={styles.genderTitle}>Female</Text>
                <Text style={styles.genderDesc}>Tops, Dresses, Skirts, Cargo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Age Group */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Select Your Age Group</Text>
            <Text style={styles.subtitle}>
              Selecting your age group helps curate accurate & relevant outfit fits for you.
            </Text>

            {AGE_GROUPS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.selectCard, ageGroup === item && styles.selectCardActive]}
                onPress={() => setAgeGroup(item)}
              >
                <Text style={styles.selectCardText}>{item}</Text>
                {ageGroup === item && <Check size={18} color={COLORS.primaryLight} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 4: Style Preference */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What's Your Fashion Style?</Text>
            <Text style={styles.subtitle}>Choose the vibe that defines your aesthetic.</Text>

            <View style={styles.chipGrid}>
              {STYLES.map((item) => {
                const isSelected = stylePref === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setStylePref(item)}
                  >
                    <Flame size={14} color={isSelected ? '#FFF' : COLORS.textMuted} style={{ marginRight: 4 }} />
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 5: Fit Preference */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Preferred Fit & Cut</Text>
            <Text style={styles.subtitle}>How do you like your clothes to fit?</Text>

            {FITS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.selectCard, fitPref === item && styles.selectCardActive]}
                onPress={() => setFitPref(item)}
              >
                <Scissors size={16} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
                <Text style={styles.selectCardText}>{item}</Text>
                {fitPref === item && <Check size={18} color={COLORS.primaryLight} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 6: Favorite Colors */}
        {step === 6 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Favorite Color Palette</Text>
            <Text style={styles.subtitle}>Select your go-to outfit color tones.</Text>

            {COLOR_PALETTES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.selectCard, colorPref === item && styles.selectCardActive]}
                onPress={() => setColorPref(item)}
              >
                <Palette size={16} color={COLORS.accentCyan} style={{ marginRight: 8 }} />
                <Text style={styles.selectCardText}>{item}</Text>
                {colorPref === item && <Check size={18} color={COLORS.accentCyan} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 7: Avatar Body Photo Setup */}
        {step === 7 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Set Your Body Avatar Photo</Text>
            <Text style={styles.subtitle}>
              Take a photo, pick from gallery, or choose a model template to try clothes on!
            </Text>

            <View style={styles.avatarFrame}>
              <Image source={getImageSource(photoUri, gender)} style={styles.avatarImage} resizeMode="contain" />
            </View>

            <View style={styles.uploadBtnRow}>
              <TouchableOpacity style={styles.uploadBtn} onPress={handleTakePhoto}>
                <Camera size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.uploadBtnText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBtn, styles.galleryBtn]}
                onPress={handlePickGallery}
              >
                <ImageIcon size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.uploadBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.templateHeader}>Or select model template:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              {MODEL_TEMPLATES[gender].map((tempUri, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.tempThumb, photoUri === tempUri && styles.tempThumbActive]}
                  onPress={() => setPhotoUri(tempUri)}
                >
                  <Image source={getImageSource(tempUri, gender)} style={styles.tempImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Footer Legal Links */}
      <View style={styles.legalLinksRow}>
        <TouchableOpacity onPress={() => setTermsVisible(true)}>
          <Text style={styles.legalLinkText}>Terms & Conditions</Text>
        </TouchableOpacity>
        <Text style={styles.legalDot}> • </Text>
        <TouchableOpacity onPress={() => setPrivacyVisible(true)}>
          <Text style={styles.legalLinkText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Navigation Buttons */}
      <View style={styles.footer}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <ArrowLeft size={16} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : <View />}

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>
            {step === totalSteps ? 'Enter Digital Wardrobe ✨' : 'Continue'}
          </Text>
          <ArrowRight size={16} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* Legal Modals */}
      <TermsModal visible={termsVisible} onClose={() => setTermsVisible(false)} />
      <PrivacyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  progressRow: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarSegment: {
    flex: 1,
    height: '100%',
    backgroundColor: 'transparent',
  },
  progressBarActive: {
    backgroundColor: COLORS.primary,
  },
  stepCounterText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'right',
    fontWeight: '600',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING.lg,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.xl,
    lineHeight: 18,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  textInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    fontSize: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  genderCard: {
    width: '48%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.borderGlass,
  },
  genderCardActiveMale: {
    borderColor: COLORS.maleTag,
    backgroundColor: 'rgba(69, 170, 242, 0.12)',
  },
  genderCardActiveFemale: {
    borderColor: COLORS.femaleTag,
    backgroundColor: 'rgba(253, 121, 168, 0.12)',
  },
  genderEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  genderTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  genderDesc: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  selectCard: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: 10,
  },
  selectCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  selectCardText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    margin: 4,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  avatarFrame: {
    width: 160,
    height: 200,
    backgroundColor: '#0F131D',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: SPACING.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  uploadBtnRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  uploadBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    marginHorizontal: 4,
  },
  galleryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  uploadBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  templateHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  tempThumb: {
    width: 60,
    height: 80,
    borderRadius: RADIUS.sm,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tempThumbActive: {
    borderColor: COLORS.primary,
  },
  tempImage: {
    width: '100%',
    height: '100%',
  },
  legalLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: COLORS.bgCard,
  },
  legalLinkText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  legalDot: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
  },
  nextBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
