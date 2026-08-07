import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import { Sparkles, Trash2, Layers, ArrowRight, Heart } from 'lucide-react-native';
import CachedImage from '../components/CachedImage';

export default function SavedLooksScreen({ savedLooks, onLoadLook, onDeleteLook }) {
  const [pageLimit, setPageLimit] = useState(10);

  const visibleLooks = savedLooks.slice(0, pageLimit);

  const handleLoadMore = () => {
    if (pageLimit < savedLooks.length) {
      setPageLimit((prev) => prev + 10);
    }
  };

  const renderLookCard = ({ item: look }) => {
    const layersCount = look.layers?.length || 0;
    return (
      <View style={styles.lookCard}>
        <View style={styles.previewFrame}>
          {look.body_photo_uri ? (
            <CachedImage
              source={{ uri: look.body_photo_uri }}
              style={styles.previewImage}
              contentFit="contain"
            />
          ) : (
            <View style={styles.noImagePlaceholder} />
          )}

          {/* Render layered thumbnails */}
          {look.layers &&
            look.layers.map((l) => (
              <CachedImage
                key={l.id}
                source={{ uri: l.image_uri }}
                style={[
                  styles.layerThumb,
                  {
                    transform: [
                      { translateX: (l.x || 0) * 0.4 },
                      { translateY: (l.y || 0) * 0.4 },
                      { scale: (l.scale || 1) * 0.5 },
                    ],
                  },
                ]}
                contentFit="contain"
              />
            ))}

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => onDeleteLook(look.id)}
          >
            <Trash2 size={12} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.lookTitle}>{look.title}</Text>
            <View style={styles.layerBadge}>
              <Layers size={10} color={COLORS.accentCyan} style={{ marginRight: 3 }} />
              <Text style={styles.layerBadgeText}>{layersCount} Items</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.loadBtn}
            onPress={() => onLoadLook(look)}
          >
            <Text style={styles.loadBtnText}>Try Fit</Text>
            <ArrowRight size={12} color="#FFF" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Sparkles color={COLORS.accentGold} size={18} style={{ marginRight: 6 }} />
        <Text style={styles.headerTitle}>My Saved Fits ({savedLooks.length})</Text>
      </View>

      {savedLooks.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Saved Fits Yet</Text>
          <Text style={styles.emptySubtitle}>
            Combine outfits in the Virtual Fitting Studio and tap "Save Fit" to store your favorite looks!
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleLooks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderLookCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.content}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
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
  content: {
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  lookCard: {
    width: '48%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: SPACING.md,
  },
  previewFrame: {
    height: 180,
    backgroundColor: '#0F131D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.bgCard,
  },
  layerThumb: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    padding: 6,
    borderRadius: RADIUS.full,
  },
  cardFooter: {
    padding: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lookTitle: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  layerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  layerBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  loadBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  loadBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
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
  },
});
