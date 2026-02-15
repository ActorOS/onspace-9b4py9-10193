import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import type { ReleaseStackExercise } from '@/services/releaseStackStorage';

export default function ReorderExercisesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [exercises, setExercises] = useState<ReleaseStackExercise[]>(
    JSON.parse(params.exercises as string)
  );
  const [addPauses, setAddPauses] = useState(false);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newExercises = [...exercises];
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    setExercises(newExercises);
  };

  const moveDown = (index: number) => {
    if (index === exercises.length - 1) return;
    const newExercises = [...exercises];
    [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    setExercises(newExercises);
  };

  const handleNext = () => {
    router.push({
      pathname: '/release-stack/name',
      params: {
        exercises: JSON.stringify(exercises),
        addPauses: addPauses.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Reorder Exercises</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.introSection}>
            <Text style={styles.introText}>
              Drag to reorder. Exercises will play in this sequence.
            </Text>
          </View>

          <View style={styles.exercisesList}>
            {exercises.map((exercise, index) => (
              <View key={`${exercise.id}-${index}`} style={styles.exerciseCard}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                </View>
                <View style={styles.exerciseActions}>
                  <Pressable
                    style={[styles.moveButton, index === 0 && styles.moveButtonDisabled]}
                    onPress={() => moveUp(index)}
                    disabled={index === 0}
                  >
                    <MaterialIcons 
                      name="arrow-upward" 
                      size={20} 
                      color={index === 0 ? colors.textTertiary : colors.textSecondary} 
                    />
                  </Pressable>
                  <Pressable
                    style={[styles.moveButton, index === exercises.length - 1 && styles.moveButtonDisabled]}
                    onPress={() => moveDown(index)}
                    disabled={index === exercises.length - 1}
                  >
                    <MaterialIcons 
                      name="arrow-downward" 
                      size={20} 
                      color={index === exercises.length - 1 ? colors.textTertiary : colors.textSecondary} 
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          <Pressable
            style={styles.pauseToggle}
            onPress={() => setAddPauses(!addPauses)}
          >
            <View style={styles.pauseToggleLeft}>
              <Text style={styles.pauseToggleTitle}>Add 10-second grounding pause</Text>
              <Text style={styles.pauseToggleSubtext}>Between each exercise</Text>
            </View>
            <View style={[styles.toggle, addPauses && styles.toggleActive]}>
              <View style={[styles.toggleThumb, addPauses && styles.toggleThumbActive]} />
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.background} />
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
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  exerciseNumberText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  moveButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveButtonDisabled: {
    opacity: 0.3,
  },
  pauseToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pauseToggleLeft: {
    flex: 1,
  },
  pauseToggleTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  pauseToggleSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
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
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  nextButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
