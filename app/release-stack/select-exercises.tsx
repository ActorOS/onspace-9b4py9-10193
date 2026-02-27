import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { tierStorage } from '@/services/tierStorage';
import { UpgradePrompt } from '@/components';

type ExerciseOption = {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: string;
  requiresPro: boolean;
};

const AVAILABLE_EXERCISES: ExerciseOption[] = [
  {
    id: 'breathing',
    name: 'Breathing & Release',
    description: 'Nervous system reset',
    route: '/return/exercise-breathing',
    icon: 'air',
    requiresPro: false,
  },
  {
    id: 'bodyscan',
    name: 'Body Scan',
    description: 'Release character tension',
    route: '/return/exercise-bodyscan',
    icon: 'self-improvement',
    requiresPro: false,
  },
  {
    id: 'movement',
    name: 'Quick Movement',
    description: 'Shake out residual energy',
    route: '/return/quick-movement',
    icon: 'directions-run',
    requiresPro: false,
  },
  {
    id: 'identity-light',
    name: 'Identity Separation (Light)',
    description: 'Quick separation from role',
    route: '/return/exercise-identity-light',
    icon: 'psychology',
    requiresPro: false,
  },
  {
    id: 'identity',
    name: 'Identity Separation (Standard)',
    description: 'Structured return to self',
    route: '/return/exercise-identity',
    icon: 'psychology',
    requiresPro: true,
  },
  {
    id: 'identity-full',
    name: 'Identity Separation (Full)',
    description: 'Deep separation after immersive work',
    route: '/return/exercise-identity-full',
    icon: 'psychology',
    requiresPro: true,
  },
  {
    id: 'recovery-light',
    name: 'Full Body Recovery (Light)',
    description: 'Subtle reset after rehearsal',
    route: '/return/exercise-recovery-light',
    icon: 'spa',
    requiresPro: false,
  },
  {
    id: 'recovery-standard',
    name: 'Full Body Recovery (Standard)',
    description: 'Restore balance after performance',
    route: '/return/exercise-recovery-standard',
    icon: 'spa',
    requiresPro: true,
  },
  {
    id: 'recovery',
    name: 'Full Body Recovery',
    description: 'Complete recovery after demanding work',
    route: '/return/exercise-recovery',
    icon: 'spa',
    requiresPro: true,
  },
  {
    id: 'stage-home',
    name: 'Stage to Home',
    description: 'Transition from performance to home',
    route: '/return/exercise-stage-home',
    icon: 'home',
    requiresPro: false,
  },
  {
    id: 'grounding',
    name: 'Gentle Grounding',
    description: 'Sensory grounding exercise',
    route: '/return/exercise-grounding',
    icon: 'spa',
    requiresPro: false,
  },
  {
    id: 'intimacy',
    name: 'Intimacy Decompression',
    description: 'Release after physical or intimate work',
    route: '/return/exercise-intimacy',
    icon: 'spa',
    requiresPro: false,
  },
];

export default function SelectExercisesScreen() {
  const router = useRouter();
  const [selectedExercises, setSelectedExercises] = useState<ExerciseOption[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    checkTier();
  }, []);

  const checkTier = async () => {
    const tier = await tierStorage.getTier();
    setIsPro(tier === 'pro');
  };

  const handleToggleExercise = (exercise: ExerciseOption) => {
    if (exercise.requiresPro && !isPro) {
      setShowUpgradePrompt(true);
      return;
    }

    const isSelected = selectedExercises.some(e => e.id === exercise.id);
    if (isSelected) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const handleNext = () => {
    if (selectedExercises.length === 0) return;
    
    // Pass selected exercises to reorder screen
    const exercisesData = selectedExercises.map(e => ({
      id: e.id,
      name: e.name,
      route: e.route,
      requiresPro: e.requiresPro,
    }));
    
    router.push({
      pathname: '/release-stack/reorder',
      params: { exercises: JSON.stringify(exercisesData) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Select Exercises</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.introSection}>
            <Text style={styles.introText}>
              Choose exercises to include in your stack. They'll play back-to-back automatically.
            </Text>
          </View>

          <View style={styles.exercisesList}>
            {AVAILABLE_EXERCISES.map(exercise => {
              const isSelected = selectedExercises.some(e => e.id === exercise.id);
              const isLocked = exercise.requiresPro && !isPro;

              return (
                <Pressable
                  key={exercise.id}
                  style={[
                    styles.exerciseCard,
                    isSelected && styles.exerciseCardSelected,
                    isLocked && styles.exerciseCardLocked,
                  ]}
                  onPress={() => handleToggleExercise(exercise)}
                >
                  <View style={styles.exerciseIcon}>
                    <MaterialIcons 
                      name={exercise.icon as any} 
                      size={24} 
                      color={isLocked ? colors.textTertiary : colors.primary} 
                    />
                  </View>
                  <View style={styles.exerciseContent}>
                    <View style={styles.exerciseHeader}>
                      <Text style={[styles.exerciseName, isLocked && styles.exerciseNameLocked]}>
                        {exercise.name}
                      </Text>
                      {isLocked && (
                        <View style={styles.proBadge}>
                          <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.exerciseDescription, isLocked && styles.exerciseDescriptionLocked]}>
                      {exercise.description}
                    </Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                    isLocked && styles.checkboxLocked,
                  ]}>
                    {isSelected && !isLocked && (
                      <MaterialIcons name="check" size={18} color={colors.background} />
                    )}
                    {isLocked && (
                      <MaterialIcons name="lock" size={18} color={colors.textTertiary} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} selected
          </Text>
        </View>
        <Pressable 
          style={[styles.nextButton, selectedExercises.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedExercises.length === 0}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.background} />
        </Pressable>
      </View>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="PRO Exercises"
        description="Upgrade to PRO to access advanced exercises including Identity Separation (Standard & Full) and Full Body Recovery (Standard & Full)."
      />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  introSection: {
    marginBottom: spacing.lg,
  },
  introText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  exercisesList: {
    gap: spacing.md,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  exerciseCardLocked: {
    opacity: 0.6,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  exerciseName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  exerciseNameLocked: {
    color: colors.textSecondary,
  },
  exerciseDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  exerciseDescriptionLocked: {
    color: colors.textTertiary,
  },
  proBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  proBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLocked: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerInfo: {
    marginBottom: spacing.sm,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  nextButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
