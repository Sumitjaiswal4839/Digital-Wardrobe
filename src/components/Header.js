import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import { User, Sparkles } from 'lucide-react-native';

export default function Header({
  user,
  currentGender,
  onGenderChange,
  onOpenProfile,
  onTriggerAdmin,
}) {
  const [tapCount, setTapCount] = useState(0);

  // Secret 3-tap trigger on app title for developer mode
  const handleSecretTap = () => {
    const nextCount = tapCount + 1;
    setTapCount(nextCount);
    if (nextCount >= 3) {
      setTapCount(0);
      onTriggerAdmin();
    }
  };

  const HeaderContent = (
    <View style={styles.innerContainer}>
      {/* User Info & Avatar Badge */}
      <TouchableOpacity style={styles.profileSection} onPress={onOpenProfile} activeOpacity={0.8}>
        {user?.body_photo_uri ? (
          <Image source={{ uri: user.body_photo_uri }} style={styles.avatarImage} />
        ) : (
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.avatarPlaceholder}
          >
            <User color="#FFF" size={20} />
          </LinearGradient>
        )}
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={handleSecretTap} activeOpacity={0.9}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || 'Sumit'}</Text>
              <Sparkles color={COLORS.accentGold} size={14} style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.subtitle}>Digital Wardrobe</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Gender Switcher Toggle */}
      <View style={styles.rightSection}>
        <View style={styles.genderToggleContainer}>
          <TouchableOpacity
            style={[
              styles.genderBtn,
              currentGender === 'male' && styles.genderBtnActiveMale,
            ]}
            onPress={() => onGenderChange('male')}
          >
            <Text
              style={[
                styles.genderBtnText,
                currentGender === 'male' && styles.genderBtnTextActive,
              ]}
            >
              👨 Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderBtn,
              currentGender === 'female' && styles.genderBtnActiveFemale,
            ]}
            onPress={() => onGenderChange('female')}
          >
            <Text
              style={[
                styles.genderBtnText,
                currentGender === 'female' && styles.genderBtnTextActive,
              ]}
            >
              👩 Female
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return <View style={styles.webContainer}>{HeaderContent}</View>;
  }

  return (
    <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
      {HeaderContent}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  webContainer: {
    backgroundColor: COLORS.bgGlass,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: SPACING.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  genderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  genderBtnActiveMale: {
    backgroundColor: COLORS.maleTag,
  },
  genderBtnActiveFemale: {
    backgroundColor: COLORS.femaleTag,
  },
  genderBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  genderBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
});
