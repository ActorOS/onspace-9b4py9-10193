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
  title: string;
  purpose: string;
  duration: string;
  icon: string;
  route: string;
  requiresPro: boolean;
};

const SOMATIC_RELEASE_EXERCISES: ExerciseOption[] = [
  {
    id: 'full-recovery-light',
    title: 'Full Body Recovery (Light)',
    purpose: 'Quick somatic release and reset',
    duration: '5 min',
    icon: 'spa',
    route: '/return/exercise-recovery-light',
    requiresPro: false,
  },
  {
    id: 'full-recovery-standard',
    title: 'Full Body Recovery (Standard)',
    purpose: 'Balanced somatic release with discharge',
    duration: '10 min',
    icon: 'spa',
    route: '/return/exercise-recovery-standard',
    requiresPro: false,
  },
  {
    id: 'full-recovery',
    title: 'Full Body Recovery',
    purpose: 'Complete somatic release with discharge',
    duration: '15 min',
    icon: 'spa',
    route: '/return/exercise-recovery',
    requiresPro: false,
  },
  {
    id: 'bodyscan',
    title: 'Body Scan',
    purpose: 'Release character tension',
    duration: '12 min',
    icon: 'self-improvement',
    route: '/return/exercise-bodyscan',
    requiresPro: false,
  },
  {
    id: 'breathing',
    title: 'Breathing & Release',
    purpose: 'Nervous system reset',
    duration: '8 min',
    icon: 'air',
    route: '/return/exercise-breathing',
    requiresPro: false,
  },
  {
    id: 'movement',
    title: 'Quick Movement',
    purpose: 'Shake out residual energy',
    duration: '2 min',
    icon: 'directions-run',
    route: '/return/quick-movement',
    requiresPro: false,
  },
];

export default function SomaticReleaseListScreen() {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null);

  useEffect(() => {
    checkTier();
  }, []);

  const checkTier = async () => {
    const tier = await tierStorage.getTier();
    setIsPro(tier === 'pro');
  };

  const handleSelectExercise = (exercise: ExerciseOption) => {
    if (exercise.requiresPro && !isPro) {
      setSelectedExercise(exercise);
      setShowUpgradePrompt(true);
      return;
    }
    router.replace(exercise.route);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Somatic Release</Text>
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
            <MaterialIcons name="spa" size={48} color={colors.primary} style={{ marginBottom: spacing.md }} />
            <Text style={styles.title}>Body-Led Discharge{'\n'}& Release</Text>
            <Text style={styles.subtitle}>Voice-led exercises with one system voice</Text>
          </View>

          {/* Exercise Options */}
          <View style={styles.exercisesSection}>
            {SOMATIC_RELEASE_EXERCISES.map(exercise => {
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

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoHeadline}>How these work</Text>
              <Text style={styles.infoText}>
                All somatic exercises are voice-led and hands-free once started. The app controls pacing and silence. No system TTS—one consistent Actor OS voice.
              </Text>
            </View>
          </View>
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
        feature={selectedExercise?.title || 'Advanced Somatic Work'}
        description={`Pro unlocks ${selectedExercise?.title} and other advanced body-led release exercises.`}
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
    lineHeight: 32,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  exercisesSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoHeadline: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
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
