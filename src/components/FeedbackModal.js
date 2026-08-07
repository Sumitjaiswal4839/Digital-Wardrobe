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
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import { X, Star, MessageSquare, Send, Check } from 'lucide-react-native';

const FEEDBACK_TYPES = ['Bug Report', 'Feature Request', 'UI & Design', 'General Feedback'];

export default function FeedbackModal({ visible, onClose }) {
  const [rating, setRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState('Feature Request');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!comment.trim()) {
      alert('Please enter your feedback or suggestion before submitting!');
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
      alert('Thank you for your feedback! Your response has been recorded. ✨');
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <MessageSquare color={COLORS.accentCyan} size={18} style={{ marginRight: 6 }} />
              <Text style={styles.modalTitle}>Give Your Feedback</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={COLORS.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Star Rating Selection */}
            <Text style={styles.label}>Rate your experience</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starBtn}
                >
                  <Star
                    size={28}
                    color={star <= rating ? COLORS.accentGold : COLORS.textMuted}
                    fill={star <= rating ? COLORS.accentGold : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Feedback Category */}
            <Text style={styles.label}>Feedback Category</Text>
            <View style={styles.typeRow}>
              {FEEDBACK_TYPES.map((type) => {
                const isSelected = feedbackType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, isSelected && styles.typeChipActive]}
                    onPress={() => setFeedbackType(type)}
                  >
                    <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Comment Text Input */}
            <Text style={styles.label}>Your Thoughts or Suggestions</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell us what you love or what we can improve..."
              placeholderTextColor={COLORS.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitted && styles.submittedBtn]}
              onPress={handleSubmit}
              disabled={submitted}
            >
              {submitted ? (
                <>
                  <Check size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Submitted!</Text>
                </>
              ) : (
                <>
                  <Send size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Submit Feedback</Text>
                </>
              )}
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
    paddingVertical: SPACING.sm,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.sm,
    marginBottom: 6,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 6,
  },
  starBtn: {
    padding: 6,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  typeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  typeChipActive: {
    backgroundColor: COLORS.accentCyan,
    borderColor: COLORS.accentCyan,
  },
  typeChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    fontSize: 13,
    minHeight: 90,
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
  submitBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  submittedBtn: {
    backgroundColor: COLORS.success,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
