import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { aftereffectsStorage } from '@/services/aftereffectsStorage';

const RESIDUE_OPTIONS = [
  { label: 'Tension', icon: 'bolt' },
  { label: 'Heaviness', icon: 'arrow-downward' },
  { label: 'Numbness', icon: 'remove-circle-outline' },
  { label: 'Tightness', icon: 'compress' },
  { label: 'Alertness', icon: 'visibility' },
  { label: 'Anger', icon: 'local-fire-department' },
  { label: 'Sadness', icon: 'water-drop' },
  { label: 'Fear', icon: 'warning' },
  { label: 'Nothing', icon: 'check-circle-outline' },
];

const BODY_LOCATIONS = [
  { label: 'Jaw', value: 'jaw' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Chest', value: 'chest' },
  { label: 'Stomach', value: 'stomach' },
  { label: 'Hands', value: 'hands' },
  { label: 'Legs', value: 'legs' },
  { label: 'Throat', value: 'throat' },
  { label: 'Head', value: 'head' },
];

const INTENSITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export default function PostCheckInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const sessionId = params.sessionId as string | undefined;
  const roleId = params.roleId as string | undefined;

  const [selectedResidue, setSelectedResidue] = useState<string[]>([]);
  const [selectedBodyLocations, setSelectedBodyLocations] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleResidue = (label: string) => {
    setSelectedResidue(prev => {
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

  const canSave = selectedResidue.length > 0;

  const handleSave = async (actionTaken: 'held' | 'released') => {
    if (!canSave) {
      Alert.alert('Required', 'Please select at least one residue type');
      return;
    }

    setIsSaving(true);
    try {
      await aftereffectsStorage.saveAftereffect({
        sessionId,
        roleId,
        residueTags: selectedResidue,
        bodyLocation: selectedBodyLocations,
        intensity,
        note: note.trim() || undefined,
        actionTaken,
      });

      if (actionTaken === 'held') {
        Alert.alert('Held', 'This has been recorded in your role container');
        router.replace('/(tabs)');
      } else {
        // Navigate directly to Return to Self / grounding exercises
        router.replace('/grounding');
      }
    } catch (error) {
      console.error('Failed to save aftereffect:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
      setIsSaving(false);
    }
  };

  const handleExit = () => {
    if (selectedResidue.length > 0 && !isSaving) {
      Alert.alert(
        'Leave without holding this?',
        'Your selections will not be saved.',
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
        <Text style={styles.headerTitle}>Exit Work</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Main Question */}
          <View style={styles.questionCard}>
            <Text style={styles.mainQuestion}>What did this work leave behind?</Text>
            <Text style={styles.subText}>
              Notice what the character left in your body and mind.{'\n'}
              This is expected. You do not need to fix it—only name it.
            </Text>
          </View>

          {/* Residue Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What are you carrying?</Text>
            <View style={styles.chipsGrid}>
              {RESIDUE_OPTIONS.map((option) => {
                const isSelected = selectedResidue.includes(option.label);
                return (
                  <Pressable
                    key={option.label}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleResidue(option.label)}
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

          {/* Body Location */}
          {selectedResidue.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Where do you feel it?</Text>
              <Text style={styles.helperText}>Optional — Select one or more locations</Text>
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

          {/* Intensity */}
          {selectedResidue.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How strong is it?</Text>
              <Text style={styles.helperText}>Optional</Text>
              <View style={styles.intensityRow}>
                {INTENSITY_OPTIONS.map((option) => {
                  const isSelected = intensity === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.intensityButton, isSelected && styles.intensityButtonSelected]}
                      onPress={() => setIntensity(option.value as any)}
                    >
                      <Text style={[styles.intensityText, isSelected && styles.intensityTextSelected]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Notes */}
          {selectedResidue.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Anything else to note?</Text>
              <Text style={styles.helperText}>Optional</Text>
              <TextInput
                style={styles.textArea}
                value={note}
                onChangeText={setNote}
                placeholder="What else did this leave behind?"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guidanceHeadline}>You have options</Text>
              <Text style={styles.guidanceText}>
                You can hold this temporarily in your role container, or release it now with guided grounding exercises.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [
            styles.actionButton,
            styles.holdButton,
            !canSave && styles.buttonDisabled,
            pressed && canSave && { opacity: 0.85, transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => handleSave('held')}
          disabled={!canSave || isSaving}
        >
          <MaterialIcons name="inventory-2" size={20} color={!canSave ? colors.textTertiary : colors.textPrimary} />
          <Text style={[styles.actionButtonText, styles.holdButtonText, !canSave && { color: colors.textTertiary }]}>Hold it here</Text>
        </Pressable>

        <Pressable 
          style={({ pressed }) => [
            styles.actionButton,
            styles.releaseButton,
            !canSave && styles.buttonDisabled,
            pressed && canSave && { backgroundColor: colors.primaryDark, transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => handleSave('released')}
          disabled={!canSave || isSaving}
        >
          <MaterialIcons name="air" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Release now</Text>
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
  intensityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  intensityButtonSelected: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
  },
  intensityText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  intensityTextSelected: {
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
    minHeight: 100,
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
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  holdButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  releaseButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  holdButtonText: {
    color: colors.textPrimary,
  },
});
