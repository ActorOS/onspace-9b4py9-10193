import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { sessionStorage } from '@/services/sessionStorage';
import { tierStorage } from '@/services/tierStorage';
import { UpgradePrompt } from '@/components';

type ExerciseOption = {
  id: string;
  title: string;
  purpose: string;
  duration: string;
  icon: string;
  route: string;
  workload: ('light' | 'medium' | 'heavy')[];
  requiresPro: boolean;
};

const EXERCISE_OPTIONS: ExerciseOption[] = [
  {
    id: 'gentle-grounding',
    title: 'Gentle Grounding',
    purpose: 'Sensory grounding to present moment',
    duration: '6 min',
    icon: 'my-location',
    route: '/return/exercise-grounding',
    workload: ['light'],
    requiresPro: false,
  },
  {
    id: 'breathing',
    title: 'Breathing & Release',
    purpose: 'Gentle nervous system reset',
    duration: '8 min',
    icon: 'spa',
    route: '/return/exercise-breathing',
    workload: ['light', 'medium', 'heavy'],
    requiresPro: false,
  },
  {
    id: 'bodyscan',
    title: 'Body Scan',
    purpose: 'Release character tension',
    duration: '12 min',
    icon: 'self-improvement',
    route: '/return/exercise-bodyscan',
    workload: ['medium', 'heavy'],
    requiresPro: false,
  },
  {
    id: 'identity-light',
    title: 'Identity Separation (Light)',
    purpose: 'Quick separation from role',
    duration: '3 min',
    icon: 'psychology',
    route: '/return/exercise-identity-light',
    workload: ['light'],
    requiresPro: false,
  },
  {
    id: 'identity-standard',
    title: 'Identity Separation (Standard)',
    purpose: 'Guided prompts to distinguish self from character',
    duration: '10 min',
    icon: 'psychology',
    route: '/return/exercise-identity',
    workload: ['medium', 'heavy'],
    requiresPro: true,
  },
  {
    id: 'identity-full',
    title: 'Identity Separation',
    purpose: 'Full Release (PRO)',
    duration: '12 min',
    icon: 'psychology',
    route: '/return/exercise-identity-full',
    workload: ['medium', 'heavy'],
    requiresPro: true,
  },
];

export default function RecommendedReleaseListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const sessionId = params.sessionId as string | undefined;
  const [workloadLevel, setWorkloadLevel] = useState<'light' | 'medium' | 'heavy' | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null);

  useEffect(() => {
    loadSessionData();
    checkTier();
  }, []);

  const loadSessionData = async () => {
    if (!sessionId) return;
    try {
      const session = await sessionStorage.getSessionById(sessionId);
      if (session) {
        setWorkloadLevel(session.workloadLevel || session.heaviness || null);
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  };

  const checkTier = async () => {
    const tier = await tierStorage.getTier();
    setIsPro(tier === 'pro');
  };

  const getRecommendedExercises = (): ExerciseOption[] => {
    if (!workloadLevel) return EXERCISE_OPTIONS.filter(ex => !ex.requiresPro || isPro);
    
    // Filter by workload level
    const filtered = EXERCISE_OPTIONS.filter(ex => ex.workload.includes(workloadLevel));
    
    // Sort based on workload
    if (workloadLevel === 'heavy') {
      return filtered.sort((a, b) => parseInt(b.duration) - parseInt(a.duration));
    } else if (workloadLevel === 'light') {
      return filtered.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    }
    return filtered;
  };

  const handleSelectExercise = (exercise: ExerciseOption) => {
    if (exercise.requiresPro && !isPro) {
      setSelectedExercise(exercise);
      setShowUpgradePrompt(true);
      return;
    }
    router.replace(exercise.route);
  };

  const recommendedExercises = getRecommendedExercises();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Recommended Release</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Intro Section */}
          <View style={styles.introSection}>
            <MaterialIcons name="recommend" size={48} color={colors.primary} style={{ marginBottom: spacing.md }} />
            <Text style={styles.title}>Based on this work</Text>
            {workloadLevel && (
              <View style={styles.workloadBadge}>
                <Text style={styles.workloadBadgeText}>
                  {workloadLevel.charAt(0).toUpperCase() + workloadLevel.slice(1)} workload
                </Text>
              </View>
            )}
            <Text style={styles.subtitle}>Choose an exercise to begin</Text>
          </View>

          {/* Exercise Options */}
          {recommendedExercises.length > 0 ? (
            <View style={styles.exercisesSection}>
              {recommendedExercises.map(exercise => {
                const isLocked = exercise.requiresPro && !isPro;
                return (
                  <Pressable
                    key={exercise.id}
                    style={({ pressed }) => [
                      styles.exerciseCard,
                      isLocked && styles.exerciseCardLocked,
                      pressed && !isLocked && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                    ]}
                    onPress={() => handleSelectExercise(exercise)}
                  >
                    <View style={styles.exerciseIcon}>
                      <MaterialIcons 
                        name={exercise.icon as any} 
                        size={28} 
                        color={isLocked ? colors.textTertiary : colors.primary} 
                      />
                    </View>
                    <View style={styles.exerciseContent}>
                      <View style={styles.exerciseHeader}>
                        <Text style={[styles.exerciseTitle, isLocked && styles.exerciseTitleLocked]}>
                          {exercise.title}
                        </Text>
                        {isLocked && (
                          <View style={styles.proBadge}>
                            <Text style={styles.proBadgeText}>PRO</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.exercisePurpose, isLocked && styles.exercisePurposeLocked]}>
                        {exercise.purpose}
                      </Text>
                      <View style={styles.exerciseMeta}>
                        <MaterialIcons name="schedule" size={14} color={isLocked ? colors.textTertiary : colors.textSecondary} />
                        <Text style={[styles.exerciseDuration, isLocked && styles.exerciseDurationLocked]}>
                          {exercise.duration}
                        </Text>
                      </View>
                    </View>
                    <MaterialIcons 
                      name="chevron-right" 
                      size={24} 
                      color={isLocked ? colors.textTertiary : colors.textSecondary} 
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="info-outline" size={32} color={colors.textTertiary} />
              <Text style={styles.emptyStateText}>No recommendations available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [
            styles.skipButton,
            pressed && { opacity: 0.7 }
          ]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </Pressable>
      </View>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature={selectedExercise?.title || 'Advanced Exercises'}
        description={`Pro unlocks ${selectedExercise?.title} and other advanced release exercises for deeper emotional work.`}
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    padding: spacing.lg,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  workloadBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  workloadBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  exercisesSection: {
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
  exerciseCardLocked: {
    opacity: 0.6,
  },
  exerciseIcon: {
    width: 56,
    height: 56,
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
  exerciseTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  exerciseTitleLocked: {
    color: colors.textSecondary,
  },
  exercisePurpose: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  exercisePurposeLocked: {
    color: colors.textTertiary,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  exerciseDuration: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  exerciseDurationLocked: {
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
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  skipButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
});
