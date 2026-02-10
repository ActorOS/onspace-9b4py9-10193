import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { sessionStorage } from '@/services/sessionStorage';
import { tierStorage } from '@/services/tierStorage';

type ExerciseOption = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: string;
  route: string;
  workload: ('light' | 'medium' | 'heavy')[];
};

const EXERCISE_OPTIONS: ExerciseOption[] = [
  {
    id: 'breathing',
    title: 'Breathing & Release',
    subtitle: 'Gentle nervous system reset',
    duration: '8 min',
    icon: 'spa',
    route: '/return/exercise-breathing',
    workload: ['light', 'medium', 'heavy'],
  },
  {
    id: 'bodyscan',
    title: 'Body Scan',
    subtitle: 'Release character tension',
    duration: '12 min',
    icon: 'self-improvement',
    route: '/return/exercise-bodyscan',
    workload: ['medium', 'heavy'],
  },
  {
    id: 'identity',
    title: 'Identity Separation',
    subtitle: 'Distinguish self from role',
    duration: '10 min',
    icon: 'psychology',
    route: '/return/exercise-identity',
    workload: ['medium', 'heavy'],
  },
  {
    id: 'identity-light',
    title: 'Identity Separation (Light)',
    subtitle: 'Quick role boundary work',
    duration: '3 min',
    icon: 'psychology',
    route: '/return/exercise-identity-light',
    workload: ['light'],
  },
];

export default function PostWorkReleaseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const sessionId = params.sessionId as string | undefined;
  const [workloadLevel, setWorkloadLevel] = useState<'light' | 'medium' | 'heavy' | null>(null);
  const [sessionDuration, setSessionDuration] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);

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
        if (session.enteredAt && session.exitedAt) {
          const durationMs = new Date(session.exitedAt).getTime() - new Date(session.enteredAt).getTime();
          setSessionDuration(Math.floor(durationMs / 1000 / 60)); // Convert to minutes
        }
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
    if (!workloadLevel) return [];
    
    // Filter exercises by workload level
    const filtered = EXERCISE_OPTIONS.filter(ex => ex.workload.includes(workloadLevel));
    
    // Prioritize based on workload and duration
    if (workloadLevel === 'heavy') {
      // Heavy workload: prioritize longer, deeper exercises
      return filtered.sort((a, b) => {
        const durationA = parseInt(a.duration);
        const durationB = parseInt(b.duration);
        return durationB - durationA; // Longest first
      }).slice(0, 3);
    } else if (workloadLevel === 'medium') {
      // Medium: balanced selection
      return filtered.slice(0, 3);
    } else {
      // Light: prioritize shorter exercises
      return filtered.sort((a, b) => {
        const durationA = parseInt(a.duration);
        const durationB = parseInt(b.duration);
        return durationA - durationB; // Shortest first
      }).slice(0, 2);
    }
  };

  const handleSelectExercise = (route: string) => {
    router.replace(route);
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const recommendedExercises = getRecommendedExercises();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Release Recommendation</Text>
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
            <MaterialIcons name="favorite" size={48} color={colors.primary} style={{ marginBottom: spacing.md }} />
            <Text style={styles.title}>Based on this work,{'\n'}we suggest:</Text>
            {workloadLevel && (
              <View style={styles.workloadBadge}>
                <Text style={styles.workloadBadgeText}>
                  {workloadLevel.charAt(0).toUpperCase() + workloadLevel.slice(1)} workload
                </Text>
              </View>
            )}
          </View>

          {/* Exercise Options */}
          {recommendedExercises.length > 0 ? (
            <View style={styles.exercisesSection}>
              {recommendedExercises.map(exercise => (
                <Pressable
                  key={exercise.id}
                  style={({ pressed }) => [
                    styles.exerciseCard,
                    pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                  ]}
                  onPress={() => handleSelectExercise(exercise.route)}
                >
                  <View style={styles.exerciseIcon}>
                    <MaterialIcons 
                      name={exercise.icon as any} 
                      size={28} 
                      color={colors.primary} 
                    />
                  </View>
                  <View style={styles.exerciseContent}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    <Text style={styles.exerciseSubtitle}>{exercise.subtitle}</Text>
                    <View style={styles.exerciseMeta}>
                      <MaterialIcons name="schedule" size={14} color={colors.textSecondary} />
                      <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="info-outline" size={32} color={colors.textTertiary} />
              <Text style={styles.emptyStateText}>No specific recommendations available</Text>
            </View>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoHeadline}>These are optional</Text>
              <Text style={styles.infoText}>
                You can choose one now, or return to it later. Release exercises support intentional separation between you and the role.
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
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Not now</Text>
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
  workloadBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workloadBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
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
  exerciseTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  exerciseSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
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
