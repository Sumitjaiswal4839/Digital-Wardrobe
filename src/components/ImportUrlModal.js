import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import { X, Link2, Sparkles, Check, Image as ImageIcon, ShieldCheck, Scissors } from 'lucide-react-native';
import { downloadImageFromUrl } from '../utils/fileSystem';
import { sanitizeUrl, scanUrlForThreats, resolveProductImageUrl } from '../utils/security';
import { logImportedUrlSecurity } from '../database/adminDb';
import ImageCutoutModal from './ImageCutoutModal';

export default function ImportUrlModal({
  visible,
  onClose,
  categories,
  currentGender,
  onSaveOutfit,
}) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories[0]?.id || 1
  );
  const [previewUri, setPreviewUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [cutoutModalVisible, setCutoutModalVisible] = useState(false);

  const handlePreview = async () => {
    setErrorMsg('');
    const cleanUrl = sanitizeUrl(url);

    if (!cleanUrl || !cleanUrl.startsWith('http')) {
      setErrorMsg('Please enter a valid HTTP/HTTPS image URL');
      return;
    }

    // Security scan against steganography & SQLi threats
    const scan = scanUrlForThreats(cleanUrl);
    setScanResult(scan);

    if (scan.riskLevel === 'HIGH') {
      setErrorMsg('Security Alert: URL flagged with threat risk payload. Import blocked.');
      return;
    }

    setLoading(true);
    try {
      // Auto-extract direct high-res product photo URL if user pasted Flipkart/Amazon/Pinterest link!
      const resolvedImageUri = await resolveProductImageUrl(cleanUrl);
      setPreviewUri(resolvedImageUri);
    } catch (e) {
      setPreviewUri(cleanUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!previewUri) {
      setErrorMsg('Please preview the image first to verify');
      return;
    }

    try {
      setLoading(true);
      const cleanUrl = sanitizeUrl(previewUri);

      // Log security inspection into Admin database
      await logImportedUrlSecurity(cleanUrl);

      const localImageUri = await downloadImageFromUrl(cleanUrl);
      await onSaveOutfit({
        categoryId: selectedCategoryId,
        title: title || 'Imported Outfit',
        brand: brand || 'Web Import',
        imageUri: localImageUri,
        sourceType: 'url',
        sourceUrl: cleanUrl,
        gender: currentGender,
      });

      // Reset state & close
      setUrl('');
      setTitle('');
      setBrand('');
      setPreviewUri(null);
      setScanResult(null);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error('Import failed:', err);
      setErrorMsg('Failed to download image. Make sure URL is accessible.');
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Link2 color={COLORS.accentCyan} size={18} style={{ marginRight: 6 }} />
              <Text style={styles.modalTitle}>Import Image from Web URL</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={COLORS.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Web Image URL (Google / Pinterest / Amazon / Flipkart)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="https://..."
                placeholderTextColor={COLORS.textMuted}
                value={url}
                onChangeText={(t) => {
                  setUrl(t);
                  setPreviewUri(null);
                  setScanResult(null);
                }}
              />
              <TouchableOpacity style={styles.previewBtn} onPress={handlePreview} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.previewBtnText}>Preview</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.tipText}>
              💡 Tip: Paste product links directly (Flipkart / Amazon / Pinterest) or long-press image → "Copy Image Address".
            </Text>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            {/* Security Scan Indicator */}
            {scanResult && (
              <View style={styles.scanBadge}>
                <ShieldCheck size={12} color={scanResult.riskLevel === 'SAFE' ? COLORS.accentGreen : COLORS.accentGold} />
                <Text style={styles.scanBadgeText}>
                  Security Scan: {scanResult.riskLevel} ({scanResult.flags[0]})
                </Text>
              </View>
            )}

            {/* Live Image Preview */}
            {previewUri ? (
              <View>
                <View style={styles.previewBox}>
                  <Image
                    source={{ uri: previewUri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                    onError={() => setErrorMsg('Failed to load image from URL')}
                  />
                </View>
                <TouchableOpacity
                  style={styles.cutoutTriggerBtn}
                  onPress={() => setCutoutModalVisible(true)}
                >
                  <Scissors size={14} color={COLORS.accentGold} style={{ marginRight: 6 }} />
                  <Text style={styles.cutoutTriggerBtnText}>Remove Background (Cutout Tool) ✨</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderBox}>
                <ImageIcon size={32} color={COLORS.textMuted} />
                <Text style={styles.placeholderText}>
                  Paste URL & click Preview to verify your outfit image
                </Text>
              </View>
            )}

            {/* Title & Brand input */}
            <Text style={styles.label}>Outfit Name (Optional)</Text>
            <TextInput
              style={styles.textInputFull}
              placeholder="e.g. Black Oversized Polo T-Shirt"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Brand / Platform (Optional)</Text>
            <TextInput
              style={styles.textInputFull}
              placeholder="e.g. Zara / H&M / Pinterest"
              placeholderTextColor={COLORS.textMuted}
              value={brand}
              onChangeText={setBrand}
            />

            {/* Category Dropdown Selection */}
            <Text style={styles.label}>Select Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                      {cat.name}
                    </Text>
                    {isSelected && <Check size={12} color="#FFF" style={{ marginLeft: 4 }} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ScrollView>

          {/* Actions Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, (!previewUri || loading) && styles.disabledBtn]}
              onPress={handleImport}
              disabled={!previewUri || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Sparkles size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveBtnText}>Save to Wardrobe DB</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ImageCutoutModal
        visible={cutoutModalVisible}
        onClose={() => setCutoutModalVisible(false)}
        imageUri={previewUri}
        onCutoutSaved={(newUri) => setPreviewUri(newUri)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  cutoutTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(253, 203, 110, 0.12)',
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(253, 203, 110, 0.3)',
  },
  cutoutTriggerBtnText: {
    color: COLORS.accentGold,
    fontSize: 11,
    fontWeight: '700',
  },
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
    maxHeight: '90%',
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
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingVertical: SPACING.sm,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  tipText: {
    color: COLORS.accentCyan,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    fontSize: 13,
  },
  previewBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: RADIUS.sm,
    marginLeft: 8,
  },
  previewBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  textInputFull: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    fontSize: 13,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    marginTop: 4,
  },
  scanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginTop: 6,
  },
  scanBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  previewBox: {
    height: 180,
    backgroundColor: '#0F131D',
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    borderStyle: 'dashed',
    padding: SPACING.md,
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  catChipActive: {
    backgroundColor: COLORS.accentCyan,
    borderColor: COLORS.accentCyan,
  },
  catChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
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
  saveBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
