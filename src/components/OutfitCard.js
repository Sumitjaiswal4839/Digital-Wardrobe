import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import { Trash2, ExternalLink, Sparkles, Pencil, Scissors } from 'lucide-react-native';
import CachedImage from './CachedImage';

export default function OutfitCard({ outfit, onTryOn, onDelete, onEdit, onCutout }) {
  const getSourceBadge = () => {
    if (outfit.source_url) {
      if (outfit.source_url.includes('amazon')) return 'Amazon';
      if (outfit.source_url.includes('flipkart')) return 'Flipkart';
      if (outfit.source_url.includes('pinterest')) return 'Pinterest';
      if (outfit.source_url.includes('google')) return 'Google';
      return 'Web Import';
    }
    return 'My Wardrobe';
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <CachedImage
          source={{ uri: outfit.image_uri }}
          style={styles.image}
          contentFit="contain"
          priority="high"
        />
        <View style={styles.sourceBadge}>
          <ExternalLink size={10} color="#FFF" style={{ marginRight: 3 }} />
          <Text style={styles.sourceText}>{getSourceBadge()}</Text>
        </View>

        <View style={styles.actionBtnRow}>
          {onCutout ? (
            <TouchableOpacity
              style={styles.cutoutBtn}
              onPress={() => onCutout(outfit)}
              activeOpacity={0.7}
            >
              <Scissors size={12} color={COLORS.accentGold} />
            </TouchableOpacity>
          ) : null}

          {onEdit ? (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => onEdit(outfit)}
              activeOpacity={0.7}
            >
              <Pencil size={12} color={COLORS.accentCyan} />
            </TouchableOpacity>
          ) : null}

          {onDelete ? (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(outfit.id)}
              activeOpacity={0.7}
            >
              <Trash2 size={12} color={COLORS.danger} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {outfit.title || outfit.category_name || 'Outfit Item'}
        </Text>
        {outfit.brand ? (
          <Text style={styles.brand} numberOfLines={1}>
            {outfit.brand}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.tryOnBtn}
          onPress={() => onTryOn(outfit)}
          activeOpacity={0.8}
        >
          <Sparkles size={14} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.tryOnText}>Try On Body</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: SPACING.md,
    width: '48%',
  },
  imageContainer: {
    height: 150,
    backgroundColor: '#0F131D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: SPACING.xs,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  sourceBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '600',
  },
  actionBtnRow: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cutoutBtn: {
    backgroundColor: 'rgba(253, 203, 110, 0.2)',
    padding: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(253, 203, 110, 0.4)',
    marginRight: 4,
  },
  editBtn: {
    backgroundColor: 'rgba(0, 206, 201, 0.2)',
    padding: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 201, 0.4)',
    marginRight: 4,
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    padding: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.4)',
  },
  details: {
    padding: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  brand: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  tryOnBtn: {
    marginTop: SPACING.xs + 2,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  tryOnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
