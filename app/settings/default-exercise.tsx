import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { userSettingsStorage, type ReleaseExerciseType } from '@/services/userSettingsStorage';

const EXERCISES = [
  {
    id: 'breathing' as ReleaseExerciseType,
    title: 'Breathing & Release',
    duration: '5 min',
    description: 'Timed breathing with body awareness',
    icon: 'air',
  },
  {
    id: 'bodyScan' as ReleaseExerciseType,
    title: 'Body Scan',
    duration: '10 min',
    description: 'Progressive body awareness and choice',
    icon: 'accessibility',
  },
  {
    id: 'identitySeparation' as ReleaseExerciseType,
    title: 'Identity Separation',
    duration: '8 min',
    description: 'Clear boundary between self and character',
    icon: 'person-outline',
  },
];

export default function DefaultExerciseScreen() {
  const router = useRouter();
  const [currentDefault, setCurrentDefault] = useState<ReleaseExerciseType>('breathing');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentDefault();
  }, []);

  const loadCurrentDefault = async () => {
    try {
      const settings = await userSettingsStorage.getSettings();
      setCurrentDefault(settings.defaultReleaseExercise);
    } catch (error) {
      console.error('Failed to load default exercise:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExercise = async (exerciseId: ReleaseExerciseType) => {
    try {
      await userSettingsStorage.updateSetting('defaultReleaseExercise', exerciseId);
      Alert.alert('Default updated', '', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to update default exercise:', error);
      Alert.alert('Error', 'Failed to update default exercise');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Default Release Exercise</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Default Release Exercise</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Choose which exercise is suggested first when you return to self.
          </Text>

          {EXERCISES.map((exercise) => {
            const isSelected = currentDefault === exercise.id;
            return (
              <Pressable
                key={exercise.id}
                style={[styles.exerciseCard, isSelected && styles.exerciseCardSelected]}
                onPress={() => handleSelectExercise(exercise.id)}
              >
                <View style={styles.exerciseIcon}>
                  <MaterialIcons
                    name={exercise.icon as any}
                    size={28}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <View style={styles.exerciseInfo}>
                  <View style={styles.exerciseTitleRow}>
                    <Text style={[styles.exerciseTitle, isSelected && styles.exerciseTitleSelected]}>
                      {exercise.title}
                    </Text>
                    <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                  </View>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                </View>
                {isSelected && (
                  <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.md,
  },
  exerciseCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs / 2,
  },
  exerciseTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  exerciseTitleSelected: {
    color: colors.primary,
  },
  exerciseDuration: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  exerciseDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
