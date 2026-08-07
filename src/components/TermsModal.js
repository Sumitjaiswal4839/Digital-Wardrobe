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
import { X, FileText, Check } from 'lucide-react-native';

export default function TermsModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <FileText color={COLORS.primaryLight} size={18} style={{ marginRight: 6 }} />
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={COLORS.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={true}>
            <Text style={styles.effectiveDate}>Effective Date: August 2026</Text>

            <Text style={styles.heading}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By downloading, installing, or using the Digital Wardrobe application, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the application.
            </Text>

            <Text style={styles.heading}>2. Personal & Local Storage Use</Text>
            <Text style={styles.paragraph}>
              Digital Wardrobe operates as a local-first application. All your clothing images, category organization, profile data, and saved outfit look combinations are stored locally on your device in an SQLite database.
            </Text>

            <Text style={styles.heading}>3. User Content & External Image Import</Text>
            <Text style={styles.paragraph}>
              When you upload photos or import clothing images via URLs (from platforms like Google Images, Pinterest, Flipkart, or Amazon), you retain full ownership of your content. You are responsible for ensuring that imported image links are used solely for your personal virtual try-on experience.
            </Text>

            <Text style={styles.heading}>4. User Conduct & Responsible Use</Text>
            <Text style={styles.paragraph}>
              You agree not to use the application to process or store unlawful, defamatory, or non-consensual imagery.
            </Text>

            <Text style={styles.heading}>5. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              Digital Wardrobe is provided "AS IS" without warranties of any kind. We are not liable for data loss occurring due to device resets, uninstallation, or operating system failures.
            </Text>

            <Text style={styles.heading}>6. Updates to Terms</Text>
            <Text style={styles.paragraph}>
              We reserve the right to update these terms at any time. Continued use of the application signifies your acceptance of any modified terms.
            </Text>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.agreeBtn} onPress={onClose}>
              <Check size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.agreeBtnText}>I Understand & Agree</Text>
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
    color: COLORS.accentGold,
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
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  agreeBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
