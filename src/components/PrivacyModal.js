import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import { X, ShieldCheck, Check } from 'lucide-react-native';

export default function PrivacyModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <ShieldCheck color={COLORS.accentGreen} size={18} style={{ marginRight: 6 }} />
              <Text style={styles.modalTitle}>Privacy Policy</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={COLORS.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={true}>
            <Text style={styles.effectiveDate}>Privacy Policy — 100% Local & Offline Storage</Text>

            <Text style={styles.heading}>1. Zero Data Collection & Local Privacy</Text>
            <Text style={styles.paragraph}>
              Digital Wardrobe respects your privacy above all else. Your full-body photos, style choices, clothing wardrobe items, and saved looks are stored strictly inside your phone's local SQLite database. We DO NOT upload or sell your private photos or wardrobe data to any remote server.
            </Text>

            <Text style={styles.heading}>2. Camera & Photo Library Permissions</Text>
            <Text style={styles.paragraph}>
              Camera and Photo Gallery permissions are used exclusively to let you take photos of yourself or select clothing images from your local device storage. Photos remain strictly on your phone.
            </Text>

            <Text style={styles.heading}>3. External Web Image Downloads</Text>
            <Text style={styles.paragraph}>
              When you paste an image URL to import outfits from Google, Pinterest, Flipkart, or Amazon, the image is fetched directly by your device via `expo-file-system` and stored in your device's local app storage.
            </Text>

            <Text style={styles.heading}>4. User Control & Data Deletion</Text>
            <Text style={styles.paragraph}>
              You have complete control over your data. You can delete individual clothing items, saved looks, or execute a complete profile & data wipe anytime via the "Delete Profile & Reset App" button in your Avatar settings.
            </Text>

            <Text style={styles.heading}>5. Contact & Questions</Text>
            <Text style={styles.paragraph}>
              If you have any questions regarding your data privacy, you can reach out via the Feedback section in the app settings.
            </Text>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.agreeBtn} onPress={onClose}>
              <Check size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.agreeBtnText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayBg,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    padding: SPACING.md,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingVertical: SPACING.md,
  },
  effectiveDate: {
    color: COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  heading: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  paragraph: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
    alignItems: 'flex-end',
  },
  agreeBtn: {
    backgroundColor: COLORS.accentGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  agreeBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
});
