import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { auditionStorage } from '@/services/auditionStorage';

export default function EditAuditionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [projectTitle, setProjectTitle] = useState('');
  const [roleName, setRoleName] = useState('');
  const [companyOrCasting, setCompanyOrCasting] = useState('');
  const [stage, setStage] = useState<'audition' | 'callback' | 'cast'>('audition');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAudition();
  }, [id]);

  const loadAudition = async () => {
    if (typeof id !== 'string') return;
    
    setIsLoading(true);
    try {
      const audition = await auditionStorage.getAuditionById(id);
      if (audition) {
        setProjectTitle(audition.projectTitle);
        setRoleName(audition.roleName || '');
        setCompanyOrCasting(audition.companyOrCasting || '');
        setStage(audition.stage);
        setNotes(audition.notes || '');
      } else {
        Alert.alert('Error', 'Audition not found');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load audition:', error);
      Alert.alert('Error', 'Failed to load audition');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (typeof id !== 'string') return;
    
    // Validate required fields
    if (!projectTitle.trim()) {
      Alert.alert('Required Field', 'Please enter a project title');
      return;
    }

    setIsSaving(true);
    try {
      await auditionStorage.updateAudition(id, {
        projectTitle: projectTitle.trim(),
        roleName: roleName.trim() || undefined,
        companyOrCasting: companyOrCasting.trim() || undefined,
        stage,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Updated', 'Audition updated successfully');
      router.back();
    } catch (error) {
      console.error('Failed to update audition:', error);
      Alert.alert('Error', 'Failed to update audition. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Audition</Text>
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
            {isSaving ? 'Saving...' : 'Save Changes'}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
