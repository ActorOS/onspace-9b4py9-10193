import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { auditionStorage } from '@/services/auditionStorage';

export default function RecordAuditionScreen() {
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState('');
  const [roleName, setRoleName] = useState('');
  const [companyOrCasting, setCompanyOrCasting] = useState('');
  const [stage, setStage] = useState<'audition' | 'callback' | 'cast'>('audition');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validate required fields
    if (!projectTitle.trim()) {
      Alert.alert('Required Field', 'Please enter a project title');
      return;
    }

    setIsSaving(true);
    try {
      await auditionStorage.saveAudition({
        projectTitle: projectTitle.trim(),
        roleName: roleName.trim() || undefined,
        companyOrCasting: companyOrCasting.trim() || undefined,
        date: new Date().toISOString(),
        stage,
        status: 'waiting',
        notes: notes.trim() || undefined,
      });

      // Show confirmation
      Alert.alert('Recorded', 'Audition recorded successfully');
      
      // Navigate back
      router.back();
    } catch (error) {
      console.error('Failed to save audition:', error);
      Alert.alert('Error', 'Failed to save audition. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Record Audition</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Title */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Project Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={projectTitle}
            onChangeText={setProjectTitle}
            placeholder="e.g., Hamlet, The Crown, etc."
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />
        </View>

        {/* Role Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Role Name</Text>
          <TextInput
            style={styles.input}
            value={roleName}
            onChangeText={setRoleName}
            placeholder="e.g., Ophelia, Diana, etc."
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />
        </View>

        {/* Company or Casting */}
        <View style={styles.section}>
          <Text style={styles.label}>Company or Casting</Text>
          <TextInput
            style={styles.input}
            value={companyOrCasting}
            onChangeText={setCompanyOrCasting}
            placeholder="e.g., RSC, Netflix, etc."
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />
        </View>

        {/* Stage Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Stage</Text>
          <View style={styles.stageSelector}>
            <Pressable
              style={[
                styles.stageButton,
                stage === 'audition' && styles.stageButtonActive,
              ]}
              onPress={() => setStage('audition')}
            >
              <Text
                style={[
                  styles.stageButtonText,
                  stage === 'audition' && styles.stageButtonTextActive,
                ]}
              >
                Audition
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.stageButton,
                stage === 'callback' && styles.stageButtonActive,
              ]}
              onPress={() => setStage('callback')}
            >
              <Text
                style={[
                  styles.stageButtonText,
                  stage === 'callback' && styles.stageButtonTextActive,
                ]}
              >
                Callback
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.stageButton,
                stage === 'cast' && styles.stageButtonActive,
              ]}
              onPress={() => setStage('cast')}
            >
              <Text
                style={[
                  styles.stageButtonText,
                  stage === 'cast' && styles.stageButtonTextActive,
                ]}
              >
                Cast
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any notes or observations..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Pressable
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
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
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.title,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.sectionHeader,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  stageSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stageButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  stageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stageButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  stageButtonTextActive: {
    color: colors.background,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
