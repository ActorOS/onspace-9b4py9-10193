import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { aftereffectsStorage } from '@/services/aftereffectsStorage';

const EMOTION_OPTIONS = [
  { label: 'Tension', icon: 'bolt' },
  { label: 'Fatigue', icon: 'battery-alert' },
  { label: 'Sadness', icon: 'water-drop' },
  { label: 'Energy', icon: 'flash-on' },
  { label: 'Calm', icon: 'spa' },
  { label: 'Anxiety', icon: 'warning' },
  { label: 'Numbness', icon: 'remove-circle-outline' },
  { label: 'Alertness', icon: 'visibility' },
  { label: 'Nothing notable', icon: 'check-circle-outline' },
];

const BODY_LOCATIONS = [
  { label: 'Chest', value: 'chest' },
  { label: 'Jaw', value: 'jaw' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Stomach', value: 'stomach' },
  { label: 'Throat', value: 'throat' },
  { label: 'Head', value: 'head' },
  { label: 'Hands', value: 'hands' },
  { label: 'Legs', value: 'legs' },
];

export default function LoadCheckScreen() {
  const router = useRouter();

  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedBodyLocations, setSelectedBodyLocations] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleEmotion = (label: string) => {
    setSelectedEmotions(prev => {
      if (prev.includes(label)) {
        return prev.filter(item => item !== label);
      } else {
        return [...prev, label];
      }
    });
  };

  const toggleBodyLocation = (value: string) => {
    setSelectedBodyLocations(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const canComplete = selectedEmotions.length > 0;

  const handleComplete = async () => {
    if (!canComplete) {
      Alert.alert('Required', 'Please select at least one emotion or state');
      return;
    }

    setIsSaving(true);
    try {
      await aftereffectsStorage.saveAftereffect({
        residueTags: selectedEmotions,
        bodyLocation: selectedBodyLocations,
        note: note.trim() || undefined,
        actionTaken: 'held',
      });

      Alert.alert('Recorded', 'Your check-in has been saved');
      router.back();
    } catch (error) {
      console.error('Failed to save load check:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
      setIsSaving(false);
    }
  };

  const handleExit = () => {
    if (selectedEmotions.length > 0 && !isSaving) {
      Alert.alert(
        'Leave without saving?',
        'Your selections will not be recorded.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Load Check-In</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Main Question */}
          <View style={styles.questionCard}>
            <Text style={styles.mainQuestion}>What are you carrying right now?</Text>
            <Text style={styles.subText}>
              Notice what is present in your body and mind.{'\n'}
              No need to explain or justify — simply observe.
            </Text>
          </View>

          {/* Emotion Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What do you notice?</Text>
            <View style={styles.chipsGrid}>
              {EMOTION_OPTIONS.map((option) => {
                const isSelected = selectedEmotions.includes(option.label);
                return (
                  <Pressable
                    key={option.label}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleEmotion(option.label)}
                  >
                    <MaterialIcons 
                      name={option.icon as any} 
                      size={18} 
                      color={isSelected ? colors.primary : colors.textSecondary} 
                    />
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Body Location (Optional) */}
          {selectedEmotions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Where do you feel it?</Text>
              <Text style={styles.helperText}>Optional</Text>
              <View style={styles.chipsGrid}>
                {BODY_LOCATIONS.map((location) => {
                  const isSelected = selectedBodyLocations.includes(location.value);
                  return (
                    <Pressable
                      key={location.value}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => toggleBodyLocation(location.value)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {location.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Notes (Optional) */}
          {selectedEmotions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Anything else?</Text>
              <Text style={styles.helperText}>Optional</Text>
              <TextInput
                style={styles.textArea}
                value={note}
                onChangeText={setNote}
                placeholder="What else do you notice?"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Grounding Note */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guidanceHeadline}>You are observing, not diagnosing</Text>
              <Text style={styles.guidanceText}>
                This check-in helps you track patterns over time. Nothing here is urgent or needs fixing.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <Pressable 
          style={[styles.completeButton, !canComplete && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={!canComplete || isSaving}
        >
          <MaterialIcons name="check" size={20} color={colors.background} />
          <Text style={styles.completeButtonText}>Complete Check-In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mainQuestion: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  helperText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.md,
  },
  guidanceHeadline: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  guidanceText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  completeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
