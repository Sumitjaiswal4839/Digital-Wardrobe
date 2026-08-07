import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import { Plus, Tag } from 'lucide-react-native';

export default function CategoryPills({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategoryPress,
}) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* "All Outfits" Pill */}
        <TouchableOpacity
          style={[
            styles.pill,
            selectedCategory === null && styles.pillActive,
          ]}
          onPress={() => onSelectCategory(null)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.pillText,
              selectedCategory === null && styles.pillTextActive,
            ]}
          >
            ✨ All Items
          </Text>
        </TouchableOpacity>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected && styles.pillActive]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Tag
                size={12}
                color={isSelected ? '#FFF' : COLORS.primaryLight}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.pillTextActive,
                ]}
              >
                {cat.name}
              </Text>
              {cat.is_custom === 1 && (
                <View style={styles.customBadge}>
                  <Text style={styles.customBadgeText}>Custom</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Add Custom Category Pill */}
        <TouchableOpacity
          style={[styles.pill, styles.addPill]}
          onPress={onAddCategoryPress}
          activeOpacity={0.7}
        >
          <Plus size={14} color={COLORS.accentCyan} style={{ marginRight: 4 }} />
          <Text style={styles.addPillText}>+ Category</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: SPACING.xs,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  addPill: {
    backgroundColor: 'rgba(0, 206, 201, 0.12)',
    borderColor: 'rgba(0, 206, 201, 0.4)',
  },
  addPillText: {
    color: COLORS.accentCyan,
    fontSize: 12,
    fontWeight: '700',
  },
  customBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  customBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
