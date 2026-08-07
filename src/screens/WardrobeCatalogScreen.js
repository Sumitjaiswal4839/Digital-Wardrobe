import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import CategoryPills from '../components/CategoryPills';
import OutfitCard from '../components/OutfitCard';
import EditOutfitModal from '../components/EditOutfitModal';
import {
  Search,
  Plus,
  Link2,
  Image as ImageIcon,
  FolderOpen,
} from 'lucide-react-native';
import { pickImageFromGallery } from '../utils/fileSystem';

export default function WardrobeCatalogScreen({
  categories,
  outfits,
  currentGender,
  onTryOnOutfit,
  onDeleteOutfit,
  onUpdateOutfit,
  onOpenImportUrl,
  onAddCustomCategory,
  onSaveOutfit,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Outfit Modal state
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [cutoutTargetOutfit, setCutoutTargetOutfit] = useState(null);

  // Pagination state for lazy loading
  const [pageLimit, setPageLimit] = useState(12);

  const handlePickLocalOutfit = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      const firstCat = categories[0]?.id || 1;
      await onSaveOutfit({
        categoryId: firstCat,
        title: 'New Gallery Outfit',
        brand: 'My Wardrobe',
        imageUri: uri,
        sourceType: 'local',
        gender: currentGender,
      });
    }
  };

  const filteredOutfits = outfits.filter((o) => {
    const matchesGender = o.gender === currentGender || !o.gender;
    const matchesCategory = selectedCategory === null || o.category_id === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      (o.title && o.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.brand && o.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.category_name && o.category_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesGender && matchesCategory && matchesSearch;
  });

  // Slice list for infinite scroll lazy loading
  const visibleOutfits = filteredOutfits.slice(0, pageLimit);

  const handleLoadMore = () => {
    if (pageLimit < filteredOutfits.length) {
      setPageLimit((prev) => prev + 10);
    }
  };

  const renderOutfitItem = ({ item }) => (
    <OutfitCard
      outfit={item}
      onTryOn={onTryOnOutfit}
      onDelete={onDeleteOutfit}
      onEdit={(outfitToEdit) => setEditingOutfit(outfitToEdit)}
      onCutout={(outfitToCut) => setCutoutTargetOutfit(outfitToCut)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Search & Import Header */}
      <View style={styles.topSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cargo, polo, t-shirt..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handlePickLocalOutfit}>
            <ImageIcon size={14} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>+ Add Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.importActionBtn]}
            onPress={onOpenImportUrl}
          >
            <Link2 size={14} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Import URL</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Pills Filter */}
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onAddCategoryPress={onAddCustomCategory}
      />

      {/* Lazy Loaded FlatList Outfits Grid */}
      {filteredOutfits.length === 0 ? (
        <View style={styles.emptyState}>
          <FolderOpen size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Outfits Found</Text>
          <Text style={styles.emptySubtitle}>
            Upload a local photo or paste an image URL from Pinterest / Amazon / Flipkart!
          </Text>
          <TouchableOpacity style={styles.emptyImportBtn} onPress={onOpenImportUrl}>
            <Link2 size={14} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.emptyImportText}>Import Web Image URL</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visibleOutfits}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOutfitItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Outfit Modal */}
      <EditOutfitModal
        visible={!!editingOutfit}
        onClose={() => setEditingOutfit(null)}
        outfit={editingOutfit}
        categories={categories}
        onSaveOutfitUpdate={onUpdateOutfit}
      />

      {/* Background Removal / Cutout Modal */}
      {cutoutTargetOutfit && (
        <ImageCutoutModal
          visible={!!cutoutTargetOutfit}
          onClose={() => setCutoutTargetOutfit(null)}
          imageUri={cutoutTargetOutfit.image_uri}
          onCutoutSaved={async (newUri) => {
            await onUpdateOutfit(cutoutTargetOutfit.id, { image_uri: newUri });
            setCutoutTargetOutfit(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  topSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: SPACING.xs + 4,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    marginRight: 6,
  },
  importActionBtn: {
    backgroundColor: COLORS.accentCyan,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  gridContent: {
    padding: SPACING.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  emptyImportBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  emptyImportText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
