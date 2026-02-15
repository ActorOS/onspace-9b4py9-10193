import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { releaseStackStorage, type ReleaseStack } from '@/services/releaseStackStorage';

export default function EditStackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [stack, setStack] = useState<ReleaseStack | null>(null);
  const [stackName, setStackName] = useState('');
  const [suggestAfterHeavy, setSuggestAfterHeavy] = useState(false);

  useEffect(() => {
    loadStack();
  }, []);

  const loadStack = async () => {
    const stackId = params.id as string;
    const loadedStack = await releaseStackStorage.getStack(stackId);
    if (!loadedStack) {
      Alert.alert('Error', 'Stack not found');
      router.back();
      return;
    }
    setStack(loadedStack);
    setStackName(loadedStack.name);
    setSuggestAfterHeavy(loadedStack.suggestAfterHeavy);
  };

  const handleSave = async () => {
    if (!stack) return;
    
    if (stackName.trim().length === 0) {
      Alert.alert('Name Required', 'Please enter a name for your stack.');
      return;
    }

    try {
      await releaseStackStorage.updateStack(stack.id, {
        name: stackName.trim(),
        suggestAfterHeavy,
      });

      router.back();
    } catch (error) {
      console.error('Failed to update stack:', error);
      Alert.alert('Error', 'Failed to update your stack. Please try again.');
    }
  };

  if (!stack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Stack</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Stack Name</Text>
            <TextInput
              style={styles.input}
              value={stackName}
              onChangeText={setStackName}
              placeholder="e.g. Post Show Reset"
              placeholderTextColor={colors.textTertiary}
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

          <View style={styles.exercisesSection}>
            <Text style={styles.label}>Exercises ({stack.exercises.length})</Text>
            <Text style={styles.infoText}>
              To change exercises or order, create a new stack
            </Text>
            <View style={styles.exercisesList}>
              {stack.exercises.map((exercise, index) => (
                <View key={`${exercise.id}-${index}`} style={styles.exerciseItem}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.saveButton, stackName.trim().length === 0 && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={stackName.trim().length === 0}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
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
  scrollView: {
    flex: 1,
  },
  content: {
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
    marginBottom: spacing.xl,
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
  exercisesSection: {
    marginBottom: spacing.xl,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  exercisesList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  exerciseNumberText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  exerciseName: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
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
