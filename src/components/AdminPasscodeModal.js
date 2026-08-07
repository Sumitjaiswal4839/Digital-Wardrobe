import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import { ShieldAlert, KeyRound, ArrowRight, X } from 'lucide-react-native';

export default function AdminPasscodeModal({ visible, onClose, onSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = () => {
    const validPass = process.env.EXPO_PUBLIC_ADMIN_PASSCODE || 'sumit123';
    if (passcode.trim() === validPass) {
      setPasscode('');
      setErrorMsg('');
      onSuccess();
    } else {
      setErrorMsg('Incorrect Admin Password! Access Denied.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <ShieldAlert color={COLORS.accentGold} size={20} style={{ marginRight: 6 }} />
              <Text style={styles.modalTitle}>Fullstack Developer Portal</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={COLORS.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.subtitle}>
              Enter Admin Security Password to open the Fullstack Developer Dashboard & Monetization Control Center.
            </Text>

            <View style={styles.inputWrapper}>
              <KeyRound size={16} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter password..."
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                value={passcode}
                onChangeText={(t) => {
                  setPasscode(t);
                  setErrorMsg('');
                }}
                autoFocus
              />
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleVerify}>
              <Text style={styles.loginBtnText}>Unlock Admin Panel</Text>
              <ArrowRight size={14} color="#FFF" style={{ marginLeft: 4 }} />
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
    backgroundColor: 'rgba(11, 14, 20, 0.9)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    padding: SPACING.md,
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
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingVertical: SPACING.md,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  loginBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
