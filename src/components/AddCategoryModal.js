import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import {
  X,
  Tag,
  Plus,
  CheckSquare,
  Square,
  Check,
  Pencil,
  Trash2,
  Shirt,
  Pocket,
  Footprints,
  Sparkles,
} from 'lucide-react-native';

const PRESET_MALE_CATEGORIES = [
  // Topwear
  { name: 'Polo Neck Tees', group: 'Topwear', zone: 'top' },
  { name: 'Round Neck Tees', group: 'Topwear', zone: 'top' },
  { name: 'Hooded Neck Tees', group: 'Topwear', zone: 'top' },
  { name: 'Full Sleeve Tees', group: 'Topwear', zone: 'top' },
  { name: 'Solid Shirts', group: 'Topwear', zone: 'top' },
  { name: 'Checks Shirts', group: 'Topwear', zone: 'top' },
  { name: 'Printed Shirts', group: 'Topwear', zone: 'top' },
  { name: 'White Shirts', group: 'Topwear', zone: 'top' },
  // Bottomwear
  { name: 'Cargo Pants', group: 'Bottomwear', zone: 'bottom' },
  { name: 'Slim Fit Jeans', group: 'Bottomwear', zone: 'bottom' },
  { name: 'Skinny Fit Jeans', group: 'Bottomwear', zone: 'bottom' },
  { name: 'Regular Fit Jeans', group: 'Bottomwear', zone: 'bottom' },
  { name: 'Trousers', group: 'Bottomwear', zone: 'bottom' },
  { name: 'Trackpants', group: 'Bottomwear', zone: 'bottom' },
  // Winterwear
  { name: 'Sweaters', group: 'Winterwear', zone: 'top' },
  { name: 'Hooded Sweatshirts', group: 'Winterwear', zone: 'top' },
  { name: 'Round Neck Pullovers', group: 'Winterwear', zone: 'top' },
  { name: 'Denim Jackets', group: 'Winterwear', zone: 'top' },
  { name: 'Winter Jackets (Puffer/Parka)', group: 'Winterwear', zone: 'top' },
  { name: 'Leather Jackets', group: 'Winterwear', zone: 'top' },
  { name: 'Sports Jackets', group: 'Winterwear', zone: 'top' },
  // Ethnic & Essentials
  { name: 'Kurtas', group: 'Ethnic & Essentials', zone: 'top' },
  { name: 'Kurta Sets & Sherwani', group: 'Ethnic & Essentials', zone: 'full' },
  { name: 'Ethnic Bottom', group: 'Ethnic & Essentials', zone: 'bottom' },
  { name: 'Vests & Tank Tops', group: 'Ethnic & Essentials', zone: 'top' },
  { name: 'Boxers & Shorts', group: 'Ethnic & Essentials', zone: 'bottom' },
  { name: 'Footwear & Sneakers', group: 'Ethnic & Essentials', zone: 'footwear' },
];

const PRESET_FEMALE_CATEGORIES = [
  // Sarees
  { name: 'Embroidered Sarees', group: 'Sarees', zone: 'full' },
  { name: 'Art Silk Sarees', group: 'Sarees', zone: 'full' },
  { name: 'Cotton Sarees', group: 'Sarees', zone: 'full' },
  { name: 'Chiffon Sarees', group: 'Sarees', zone: 'full' },
  { name: 'Georgette Sarees', group: 'Sarees', zone: 'full' },
  { name: 'Cotton Silk Sarees', group: 'Sarees', zone: 'full' },
  { name: 'Party & Festive Sarees', group: 'Sarees', zone: 'full' },
  { name: 'Wedding Sarees', group: 'Sarees', zone: 'full' },
  { name: 'Net Sarees', group: 'Sarees', zone: 'full' },
  { name: 'Banarasi Sarees', group: 'Sarees', zone: 'full' },
  { name: 'Kanjivaram Sarees', group: 'Sarees', zone: 'full' },
  // Kurtis
  { name: 'Straight Kurtis', group: 'Kurtis', zone: 'full' },
  { name: 'Anarkali Kurtis', group: 'Kurtis', zone: 'full' },
  { name: 'A-line Kurtis', group: 'Kurtis', zone: 'full' },
  { name: 'Cotton Kurtis', group: 'Kurtis', zone: 'full' },
  { name: 'Rayon Kurtis', group: 'Kurtis', zone: 'full' },
  // Ethnic Sets
  { name: 'Kurta and Palazzo Set', group: 'Ethnic Sets', zone: 'full' },
  { name: 'Festive & Party Ethnic Sets', group: 'Ethnic Sets', zone: 'full' },
  { name: 'Sharara Sets', group: 'Ethnic Sets', zone: 'full' },
  { name: 'Cotton Kurta Sets', group: 'Ethnic Sets', zone: 'full' },
  // Dress Materials & Lehengas
  { name: 'Cotton Dress Materials', group: 'Dress Materials', zone: 'full' },
  { name: 'Party & Festive Dress Materials', group: 'Dress Materials', zone: 'full' },
  { name: 'Wedding Dress Materials', group: 'Dress Materials', zone: 'full' },
  { name: 'Lehenga & Crop Top', group: 'Lehengas', zone: 'full' },
  { name: 'Wedding & Festive Lehengas', group: 'Lehengas', zone: 'full' },
  { name: 'Embroidered Lehenga Cholis', group: 'Lehengas', zone: 'full' },
  // Western Wear - Dresses
  { name: 'Fit and Flare Dresses', group: 'Western Dresses', zone: 'full' },
  { name: 'Maxi Dresses', group: 'Western Dresses', zone: 'full' },
  { name: 'Party Dresses', group: 'Western Dresses', zone: 'full' },
  { name: 'Casual Dresses', group: 'Western Dresses', zone: 'full' },
  // Tops & Tees
  { name: 'Casual Tops & Crop Tops', group: 'Tops & Tees', zone: 'top' },
  { name: 'Floral Tops', group: 'Tops & Tees', zone: 'top' },
  { name: 'Embroidered Tops', group: 'Tops & Tees', zone: 'top' },
  { name: 'Bell Sleeve Tops', group: 'Tops & Tees', zone: 'top' },
  // Bottomwear
  { name: 'Cargo Pants', group: 'Bottomwear', zone: 'bottom' },
  { name: 'Skinny Jeans', group: 'Bottomwear', zone: 'bottom' },
  { name: 'Flared Jeans', group: 'Bottomwear', zone: 'bottom' },
  { name: 'Skirts & Shorts', group: 'Bottomwear', zone: 'bottom' },
  { name: 'Jeggings & Tights', group: 'Bottomwear', zone: 'bottom' },
  // Winterwear
  { name: 'Women Sweatshirts', group: 'Winterwear', zone: 'top' },
  { name: 'Hooded Sweatshirts', group: 'Winterwear', zone: 'top' },
  { name: 'Round Neck Pullovers', group: 'Winterwear', zone: 'top' },
  { name: 'Printed Sweatshirts', group: 'Winterwear', zone: 'top' },
  { name: 'Denim Jackets', group: 'Winterwear', zone: 'top' },
];

export default function AddCategoryModal({
  visible,
  onClose,
  currentGender,
  categories = [],
  outfits = [],
  onSaveCategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  const [activeGenderTab, setActiveGenderTab] = useState(currentGender || 'male');
  const [customName, setCustomName] = useState('');
  const [customZone, setCustomZone] = useState('top'); // 'top' | 'bottom' | 'footwear' | 'full'
  const [selectedPresets, setSelectedPresets] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  // Inline Category Editing State
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');

  const categoryList = activeGenderTab === 'male' ? PRESET_MALE_CATEGORIES : PRESET_FEMALE_CATEGORIES;
  const customCategories = categories.filter((c) => c.is_custom === 1);

  const toggleCheckbox = (catName) => {
    setSelectedPresets((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const handleSelectAll = () => {
    const newSelected = { ...selectedPresets };
    categoryList.forEach((c) => {
      newSelected[c.name] = true;
    });
    setSelectedPresets(newSelected);
  };

  const handleDeselectAll = () => {
    const newSelected = { ...selectedPresets };
    categoryList.forEach((c) => {
      newSelected[c.name] = false;
    });
    setSelectedPresets(newSelected);
  };

  const handleSave = async () => {
    setErrorMsg('');
    const toAdd = [];

    // Custom input category
    if (customName.trim()) {
      toAdd.push({ name: customName.trim(), zone: customZone });
    }

    // Checked preset categories
    Object.keys(selectedPresets).forEach((catName) => {
      if (selectedPresets[catName]) {
        const foundPreset = categoryList.find((p) => p.name === catName);
        toAdd.push({ name: catName, zone: foundPreset?.zone || 'top' });
      }
    });

    if (toAdd.length === 0) {
      setErrorMsg('Please select at least one checkbox category or type a custom name!');
      return;
    }

    // Save each category with its body zone
    for (const item of toAdd) {
      await onSaveCategory(item.name, activeGenderTab, item.zone);
    }

    setCustomName('');
    setCustomZone('top');
    setSelectedPresets({});
    onClose();
  };

  const handleStartRename = (cat) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const handleSaveRename = async (catId) => {
    if (!editingCatName.trim()) return;
    try {
      await onUpdateCategory(catId, editingCatName.trim());
      setEditingCatId(null);
      setEditingCatName('');
    } catch (err) {
      alert(err.message || 'Failed to rename category');
    }
  };

  const handleDeleteCategoryPress = (cat) => {
    const affectedCount = outfits.filter((o) => o.category_id === cat.id).length;

    const message = affectedCount > 0
      ? `Deleting "${cat.name}" will also permanently delete ${affectedCount} outfit(s) inside it!`
      : `Are you sure you want to delete custom category "${cat.name}"?`;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(message)) {
        onDeleteCategory(cat.id);
      }
    } else {
      Alert.alert(
        `Delete Category "${cat.name}"?`,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Category & Outfits',
            style: 'destructive',
            onPress: () => onDeleteCategory(cat.id),
          },
        ]
      );
    }
  };

  // Group preset items by category group heading
  const groupedCategories = categoryList.reduce((acc, cat) => {
    if (!acc[cat.group]) acc[cat.group] = [];
    acc[cat.group].push(cat.name);
    return acc;
  }, {});

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Tag color={COLORS.primaryLight} size={18} style={{ marginRight: 6 }} />
              <Text style={styles.modalTitle}>Manage Fashion Categories</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={COLORS.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          {/* Gender Tab Switcher Checkboxes */}
          <View style={styles.genderTabRow}>
            <TouchableOpacity
              style={[styles.genderTabBtn, activeGenderTab === 'male' && styles.genderTabBtnMale]}
              onPress={() => setActiveGenderTab('male')}
            >
              <Text style={styles.genderTabEmoji}>👨</Text>
              <Text style={[styles.genderTabText, activeGenderTab === 'male' && styles.genderTabTextActive]}>
                Male Categories
              </Text>
              {activeGenderTab === 'male' && <Check size={14} color={COLORS.maleTag} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.genderTabBtn, activeGenderTab === 'female' && styles.genderTabBtnFemale]}
              onPress={() => setActiveGenderTab('female')}
            >
              <Text style={styles.genderTabEmoji}>👩</Text>
              <Text style={[styles.genderTabText, activeGenderTab === 'female' && styles.genderTabTextActive]}>
                Female Categories
              </Text>
              {activeGenderTab === 'female' && <Check size={14} color={COLORS.femaleTag} />}
            </TouchableOpacity>
          </View>

          {/* User Custom Categories List Section */}
          {customCategories.length > 0 && (
            <View style={styles.customCatSection}>
              <Text style={styles.customCatHeaderTitle}>My Custom Categories ({customCategories.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                {customCategories.map((cat) => {
                  const isEditing = editingCatId === cat.id;
                  const outfitCount = outfits.filter((o) => o.category_id === cat.id).length;
                  return (
                    <View key={cat.id} style={styles.customChip}>
                      {isEditing ? (
                        <View style={styles.inlineEditRow}>
                          <TextInput
                            style={styles.inlineInput}
                            value={editingCatName}
                            onChangeText={setEditingCatName}
                            autoFocus
                          />
                          <TouchableOpacity
                            style={styles.inlineSaveBtn}
                            onPress={() => handleSaveRename(cat.id)}
                          >
                            <Check size={12} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <>
                          <Tag size={12} color={COLORS.accentCyan} style={{ marginRight: 4 }} />
                          <Text style={styles.customChipText}>
                            {cat.name} ({outfitCount})
                          </Text>
                          <TouchableOpacity
                            style={styles.chipActionBtn}
                            onPress={() => handleStartRename(cat)}
                          >
                            <Pencil size={11} color={COLORS.accentCyan} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.chipActionBtn}
                            onPress={() => handleDeleteCategoryPress(cat)}
                          >
                            <Trash2 size={11} color={COLORS.danger} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Custom Category Input Box & Zone Picker */}
          <View style={styles.customInputSection}>
            <Text style={styles.label}>Create New Custom Category Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Gym Wear, Oversized Cargo Jackets"
              placeholderTextColor={COLORS.textMuted}
              value={customName}
              onChangeText={(t) => {
                setCustomName(t);
                setErrorMsg('');
              }}
            />

            {/* Garment Body Zone Picker */}
            <View style={styles.zonePickerContainer}>
              <Text style={styles.label}>Garment Body Zone (Canvas Placement):</Text>
              <View style={styles.zoneChipRow}>
                {[
                  { key: 'top', label: 'Topwear', icon: Shirt },
                  { key: 'bottom', label: 'Bottomwear', icon: Pocket },
                  { key: 'footwear', label: 'Footwear', icon: Footprints },
                  { key: 'full', label: 'Full Outfit', icon: Sparkles },
                ].map((z) => {
                  const IconComp = z.icon;
                  const isSelected = customZone === z.key;
                  return (
                    <TouchableOpacity
                      key={z.key}
                      style={[styles.zoneChip, isSelected && styles.zoneChipActive]}
                      onPress={() => setCustomZone(z.key)}
                    >
                      <IconComp
                        size={12}
                        color={isSelected ? COLORS.accentGold : COLORS.textMuted}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.zoneChipText, isSelected && styles.zoneChipTextActive]}>
                        {z.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Select All / Deselect All Controls */}
          <View style={styles.selectAllRow}>
            <Text style={styles.sectionHeaderTitle}>Select Preset Categories ({activeGenderTab.toUpperCase()})</Text>
            <View style={styles.selectBtnGroup}>
              <TouchableOpacity onPress={handleSelectAll} style={styles.smallActionBtn}>
                <Text style={styles.smallActionBtnText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeselectAll} style={styles.smallActionBtn}>
                <Text style={styles.smallActionBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {/* Scrollable Checkbox Category List Grouped */}
          <ScrollView style={styles.checkboxScrollView} showsVerticalScrollIndicator={true}>
            {Object.keys(groupedCategories).map((groupName) => (
              <View key={groupName} style={styles.groupContainer}>
                <Text style={styles.groupHeaderTitle}>{groupName}</Text>
                <View style={styles.checkboxGrid}>
                  {groupedCategories[groupName].map((catName) => {
                    const isChecked = !!selectedPresets[catName];
                    return (
                      <TouchableOpacity
                        key={catName}
                        style={[styles.checkboxCard, isChecked && styles.checkboxCardChecked]}
                        onPress={() => toggleCheckbox(catName)}
                        activeOpacity={0.7}
                      >
                        {isChecked ? (
                          <CheckSquare size={18} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
                        ) : (
                          <Square size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                        )}
                        <Text
                          style={[styles.checkboxLabel, isChecked && styles.checkboxLabelChecked]}
                          numberOfLines={1}
                        >
                          {catName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Plus size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.saveBtnText}>Add Selected Categories</Text>
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
    maxHeight: '92%',
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
  genderTabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  genderTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  genderTabBtnMale: {
    borderColor: COLORS.maleTag,
    backgroundColor: 'rgba(69, 170, 242, 0.12)',
  },
  genderTabBtnFemale: {
    borderColor: COLORS.femaleTag,
    backgroundColor: 'rgba(253, 121, 168, 0.12)',
  },
  genderTabEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  genderTabText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  genderTabTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  customCatSection: {
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(0, 206, 201, 0.06)',
    padding: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 201, 0.2)',
  },
  customCatHeaderTitle: {
    color: COLORS.accentCyan,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  customChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  customChipText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  chipActionBtn: {
    padding: 3,
    marginLeft: 4,
  },
  inlineEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFF',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    width: 100,
  },
  inlineSaveBtn: {
    backgroundColor: COLORS.primary,
    padding: 4,
    borderRadius: RADIUS.full,
    marginLeft: 4,
  },
  customInputSection: {
    marginBottom: 8,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    fontSize: 13,
  },
  zonePickerContainer: {
    marginTop: 8,
  },
  zoneChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  zoneChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  zoneChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  zoneChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    color: COLORS.accentGold,
    fontSize: 12,
    fontWeight: '700',
  },
  selectBtnGroup: {
    flexDirection: 'row',
  },
  smallActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginLeft: 6,
  },
  smallActionBtnText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    marginVertical: 4,
  },
  checkboxScrollView: {
    maxHeight: 180,
    marginVertical: 6,
  },
  groupContainer: {
    marginBottom: 10,
  },
  groupHeaderTitle: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  checkboxCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  checkboxCardChecked: {
    backgroundColor: 'rgba(108, 92, 231, 0.18)',
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  checkboxLabelChecked: {
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.primary,
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
