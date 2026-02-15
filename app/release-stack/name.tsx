import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { releaseStackStorage } from '@/services/releaseStackStorage';

export default function NameStackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [stackName, setStackName] = useState('');
  const [suggestAfterHeavy, setSuggestAfterHeavy] = useState(false);

  const handleSave = async () => {
    if (stackName.trim().length === 0) {
      Alert.alert('Name Required', 'Please enter a name for your stack.');
      return;
    }

    try {
      const exercises = JSON.parse(params.exercises as string);
      const addPauses = params.addPauses === 'true';

      await releaseStackStorage.saveStack({
        name: stackName.trim(),
        exercises,
        addPausesBetween: addPauses,
        suggestAfterHeavy,
      });

      router.replace('/release-stack/list');
    } catch (error) {
      console.error('Failed to save stack:', error);
      Alert.alert('Error', 'Failed to save your stack. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Name Your Stack</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>Stack Name</Text>
          <TextInput
            style={styles.input}
            value={stackName}
            onChangeText={setStackName}
            placeholder="e.g. Post Show Reset"
            placeholderTextColor={colors.textTertiary}
            autoFocus
          />
        </View>

        <Pressable
          style={styles.suggestionToggle}
          onPress={() => setSuggestAfterHeavy(!suggestAfterHeavy)}
        >
          <View style={styles.suggestionToggleLeft}>
            <Text style={styles.suggestionToggleTitle}>Suggest after heavy workload</Text>
            <Text style={styles.suggestionToggleSubtext}>
              This stack will be recommended after demanding work
            </Text>
          </View>
          <View style={[styles.toggle, suggestAfterHeavy && styles.toggleActive]}>
            <View style={[styles.toggleThumb, suggestAfterHeavy && styles.toggleThumbActive]} />
          </View>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.saveButton, stackName.trim().length === 0 && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={stackName.trim().length === 0}
        >
          <Text style={styles.saveButtonText}>Save Stack</Text>
          <MaterialIcons name="check" size={20} color={colors.background} />
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
  backButton: {
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionToggleLeft: {
    flex: 1,
  },
  suggestionToggleTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  suggestionToggleSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.borderLight,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  saveButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
