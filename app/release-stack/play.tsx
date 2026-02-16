
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { releaseStackStorage, type ReleaseStack } from '@/services/releaseStackStorage';
import { Audio } from 'expo-av';

export default function PlayStackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [stack, setStack] = useState<ReleaseStack | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isInExercise, setIsInExercise] = useState(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stackIdRef = useRef<string | null>(null);

  useEffect(() => {
    loadStack();
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
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
  };

  const getTotalDuration = () => {
    if (!stack) return 0;
    const exerciseDurations: { [key: string]: number } = {
      'breathing': 8,
      'bodyscan': 12,
      'movement': 3,
      'identity-light': 3,
      'identity': 10,
      'identity-full': 12,
      'recovery-light': 5,
      'recovery-standard': 10,
      'recovery': 15,
      'grounding': 7,
      'intimacy': 8,
    };

    const total = stack.exercises.reduce((sum, ex) => {
      const duration = exerciseDurations[ex.id] || 5;
      return sum + duration;
    }, 0);

    const pauseTime = stack.addPausesBetween ? (stack.exercises.length - 1) * 0.17 : 0;
    return Math.round(total + pauseTime);
  };

  // Listen for when user returns from an exercise
  useFocusEffect(
    useCallback(() => {
      // If we're in the middle of a stack and returning from an exercise
      if (hasStarted && isInExercise && !isComplete) {
        setIsInExercise(false);
        playNextExercise();
      }
    }, [hasStarted, isInExercise, isComplete])
  );

  const handleBegin = () => {
    setHasStarted(true);
    setCurrentExerciseIndex(0);
    // Start first exercise
    playExercise(0);
  };

  const playExercise = (index: number) => {
    if (!stack || index >= stack.exercises.length) {
      setIsComplete(true);
      return;
    }

    const exercise = stack.exercises[index];
    setIsInExercise(true);
    router.push(exercise.route);
  };

  const playNextExercise = async () => {
    if (!stack) return;

    const nextIndex = currentExerciseIndex + 1;

    // Check if we've completed all exercises
    if (nextIndex >= stack.exercises.length) {
      setIsComplete(true);
      return;
    }

    // Add pause between exercises if enabled
    if (stack.addPausesBetween) {
      setIsPaused(true);
      await new Promise(resolve => {
        pauseTimerRef.current = setTimeout(() => {
          setIsPaused(false);
          setCurrentExerciseIndex(nextIndex);
          playExercise(nextIndex);
          resolve(undefined);
        }, 10000);
      });
    } else {
      setCurrentExerciseIndex(nextIndex);
      playExercise(nextIndex);
    }
  };

  const handleComplete = () => {
    router.replace('/(tabs)');
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Stack',
      'Are you sure you want to exit? Progress will not be saved.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  if (!stack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{stack.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {!hasStarted ? (
          <View style={styles.introContainer}>
            <MaterialIcons name="layers" size={64} color={colors.primary} style={{ marginBottom: spacing.xl }} />
            <Text style={styles.stackName}>{stack.name}</Text>
            <Text style={styles.stackDuration}>~{getTotalDuration()} minutes</Text>

            <View style={styles.exercisesList}>
              <Text style={styles.exercisesTitle}>Exercises in this stack:</Text>
              {stack.exercises.map((exercise, index) => (
                <View key={`${exercise.id}-${index}`} style={styles.exerciseItem}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                </View>
              ))}
            </View>

            {stack.addPausesBetween && (
              <View style={styles.infoCard}>
                <MaterialIcons name="info-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  10-second grounding pause between exercises
                </Text>
              </View>
            )}

            <Text style={styles.instructionText}>
              Once you begin, exercises will play automatically in sequence.
              {'\n\n'}
              No interaction needed between exercises—just follow the guidance.
            </Text>
          </View>
        ) : isComplete ? (
          <View style={styles.completeContainer}>
            <MaterialIcons name="check-circle" size={80} color={colors.accent} style={{ marginBottom: spacing.xl }} />
            <Text style={styles.completeTitle}>You have returned</Text>
            <Text style={styles.completeText}>
              Your custom release stack is complete.
            </Text>
          </View>
        ) : isPaused ? (
          <View style={styles.pauseContainer}>
            <MaterialIcons name="pause-circle-outline" size={80} color={colors.primary} style={{ marginBottom: spacing.xl }} />
            <Text style={styles.pauseTitle}>Grounding Pause</Text>
            <Text style={styles.pauseText}>
              Take 10 seconds to notice where you are
            </Text>
            <Text style={styles.nextExerciseText}>
              Next: {stack.exercises[currentExerciseIndex + 1]?.name}
            </Text>
          </View>
        ) : isInExercise ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: spacing.lg }} />
              <Text style={styles.progressText}>
                Exercise {currentExerciseIndex + 1} of {stack.exercises.length}
              </Text>
              <Text style={styles.currentExercise}>
                {stack.exercises[currentExerciseIndex]?.name}
              </Text>
              <Text style={styles.inProgressText}>
                Complete the exercise to continue your stack
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        {!hasStarted ? (
          <Pressable style={styles.beginButton} onPress={handleBegin}>
            <Text style={styles.beginButtonText}>Begin Stack</Text>
            <MaterialIcons name="play-arrow" size={24} color={colors.background} />
          </Pressable>
        ) : isComplete ? (
          <Pressable style={styles.doneButton} onPress={handleComplete}>
            <Text style={styles.doneButtonText}>Done</Text>
            <MaterialIcons name="check" size={20} color={colors.background} />
          </Pressable>
        ) : null}
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
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  introContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  stackDuration: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  exercisesList: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exercisesTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  instructionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  completeText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pauseContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  pauseText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  nextExerciseText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  currentExercise: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  inProgressText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  beginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  beginButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  doneButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
