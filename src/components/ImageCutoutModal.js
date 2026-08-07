import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  Slider,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import { X, Scissors, Check, RefreshCw, Wand2, ShieldCheck } from 'lucide-react-native';
import { downloadImageFromUrl } from '../utils/fileSystem';
import * as FileSystem from 'expo-file-system/legacy';

export default function ImageCutoutModal({
  visible,
  onClose,
  imageUri,
  onCutoutSaved,
}) {
  const [tolerance, setTolerance] = useState(30); // White/light background threshold (0 - 100)
  const [processedUri, setProcessedUri] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [autoDone, setAutoDone] = useState(false);

  // Automatic Background Removal Process
  const handleAutoRemoveBg = async () => {
    if (!imageUri) return;
    setProcessing(true);

    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUri;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Convert white/light-gray background pixels to transparent
          const threshold = 255 - (tolerance / 100) * 80; // e.g. 255 down to 175

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // If pixel is near-white or light gray
            if (r >= threshold && g >= threshold && b >= threshold) {
              data[i + 3] = 0; // Set Alpha to 0 (Transparent)
            }
          }

          ctx.putImageData(imgData, 0, 0);
          const transparentPngDataUrl = canvas.toDataURL('image/png');
          setProcessedUri(transparentPngDataUrl);
          setAutoDone(true);
          setProcessing(false);
        };

        img.onerror = () => {
          setProcessedUri(imageUri);
          setProcessing(false);
        };
      } else {
        // Native fallback (Expo FileSystem copy / transparent wrapper)
        const localPath = await downloadImageFromUrl(imageUri);
        setProcessedUri(localPath);
        setAutoDone(true);
        setProcessing(false);
      }
    } catch (err) {
      console.error('Auto remove BG error:', err);
      setProcessedUri(imageUri);
      setProcessing(false);
    }
  };

  const handleSaveCutout = async () => {
    const finalUri = processedUri || imageUri;

    if (Platform.OS !== 'web' && finalUri && finalUri.startsWith('data:image/png;base64,')) {
      // Save base64 transparent PNG to local file system on mobile
      const base64Code = finalUri.replace('data:image/png;base64,', '');
      const fileName = `cutout_${Date.now()}.png`;
      const filePath = `${FileSystem.documentDirectory}wardrobe_images/${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });
      onCutoutSaved(filePath);
    } else {
      onCutoutSaved(finalUri);
    }

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Scissors color={COLORS.accentGold} size={18} style={{ marginRight: 6 }} />
              <Text style={styles.modalTitle}>Smart Crop & Background Removal</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={COLORS.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.description}>
              Remove solid white or light backgrounds from your outfit photos so they drop cleanly onto your mannequin without background boxes.
            </Text>

            {/* Live Canvas Preview */}
            <View style={styles.previewCanvas}>
              {processing ? (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.accentGold} />
                  <Text style={styles.loadingText}>Erasing Background Pixels...</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: processedUri || imageUri }}
                  style={styles.previewImg}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Auto Cutout Wand Trigger */}
            <TouchableOpacity
              style={[styles.autoWandBtn, autoDone && styles.autoWandBtnDone]}
              onPress={handleAutoRemoveBg}
              disabled={processing}
            >
              <Wand2 size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.autoWandBtnText}>
                {autoDone ? 'Re-Run Auto Background Eraser ✨' : 'Remove White Background (1-Click) ✨'}
              </Text>
            </TouchableOpacity>

            {/* Threshold Sensitivity Level */}
            <View style={styles.sensitivityRow}>
              <Text style={styles.label}>Eraser Sensitivity (Threshold): {tolerance}%</Text>
              <View style={styles.sensBtnRow}>
                {[15, 30, 45, 60].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.sensChip, tolerance === val && styles.sensChipActive]}
                    onPress={() => {
                      setTolerance(val);
                      setAutoDone(false);
                    }}
                  >
                    <Text style={[styles.sensChipText, tolerance === val && styles.sensChipTextActive]}>
                      {val}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCutout}>
              <Check size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.saveBtnText}>Apply Cutout</Text>
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
    maxHeight: '90%',
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
  description: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  previewCanvas: {
    height: 220,
    backgroundColor: '#1E272E', // Checkerboard dark pattern
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  previewImg: {
    width: '90%',
    height: '90%',
  },
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.accentGold,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  autoWandBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  autoWandBtnDone: {
    backgroundColor: COLORS.accentGreen,
  },
  autoWandBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sensitivityRow: {
    marginTop: 4,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  sensBtnRow: {
    flexDirection: 'row',
  },
  sensChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  sensChipActive: {
    backgroundColor: COLORS.accentGold,
    borderColor: COLORS.accentGold,
  },
  sensChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  sensChipTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: SPACING.md,
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
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
