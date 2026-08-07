import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import { X, Save, Shirt, Tag } from 'lucide-react-native';
import CachedImage from './CachedImage';

export default function EditOutfitModal({
  visible,
  onClose,
  outfit,
  categories = [],
  onSaveOutfitUpdate,
}) {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (outfit) {
      setTitle(outfit.title || '');
      setBrand(outfit.brand || '');
      setSelectedCategoryId(outfit.category_id || (categories[0]?.id || null));
    }
  }, [outfit, categories]);

  if (!outfit) return null;

  const handleSave = async () => {
    if (!selectedCategoryId) {
      alert('Please select a category for this outfit.');
      return;
    }

    setSaving(true);
    try {
      await onSaveOutfitUpdate(outfit.id, {
        title: title.trim(),
        brand: brand.trim(),
        categoryId: selectedCategoryId,
      });
      onClose();
    } catch (err) {
      console.error('Error saving outfit edits:', err);
      alert('Failed to save outfit changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Shirt color={COLORS.accentCyan} size={18} style={{ marginRight: 6 }} />
                <Text style={styles.headerTitle}>Edit Outfit Details</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color={COLORS.textSecondary} size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              {/* Outfit Thumbnail Preview */}
              <View style={styles.previewContainer}>
                <CachedImage
                  source={{ uri: outfit.image_uri }}
                  style={styles.previewImage}
                  contentFit="contain"
                />
              </View>

              {/* Title Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Outfit Name / Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Black Oversized Hoodie"
                  placeholderTextColor={COLORS.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Brand Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Brand / Store (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Zara, H&M, Nike"
                  placeholderTextColor={COLORS.textMuted}
                  value={brand}
                  onChangeText={setBrand}
                />
              </View>

              {/* Category Selector Chips */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                        onPress={() => setSelectedCategoryId(cat.id)}
                      >
                        <Tag size={12} color={isSelected ? '#FFF' : COLORS.textMuted} style={{ marginRight: 4 }} />
                        <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </ScrollView>

            {/* Modal Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Save size={14} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.bgGlass,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: SPACING.md,
  },
  previewContainer: {
    height: 120,
    backgroundColor: '#0F131D',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    padding: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  categoryChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
