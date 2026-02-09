import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { returnSessionStorage } from '@/services/returnSessionStorage';
import { userSettingsStorage } from '@/services/userSettingsStorage';

type StepType = 'intro' | 'inhale' | 'hold' | 'exhale' | 'pause' | 'completion';

interface Step {
  type: StepType;
  title: string;
  instruction: string;
  voiceScript?: string;
  duration?: number; // in seconds
  autoAdvance?: boolean;
  silence?: number; // seconds of silence after voice
}

const STEPS: Step[] = [
  {
    type: 'intro',
    title: 'Find Your Ground',
    instruction: 'Sit comfortably. Feel your weight in the chair or on the floor.\n\nThe exercise will begin in a moment.',
    voiceScript: 'Sit. Feel your weight. We will begin now.',
    duration: 5,
    autoAdvance: true,
    silence: 2,
  },
  {
    type: 'pause',
    title: 'Preparation',
    instruction: 'Close your eyes or soften your gaze.\n\nNotice where you are right now.',
    voiceScript: 'Close your eyes. Notice where you are.',
    duration: 3,
    autoAdvance: true,
    silence: 3,
  },
  {
    type: 'inhale',
    title: 'Breathe In',
    instruction: 'Inhale slowly through your nose',
    voiceScript: 'In',
    duration: 4,
    autoAdvance: true,
  },
  {
    type: 'hold',
    title: 'Hold',
    instruction: 'Hold the breath gently',
    voiceScript: 'Hold',
    duration: 4,
    autoAdvance: true,
  },
  {
    type: 'exhale',
    title: 'Breathe Out',
    instruction: 'Exhale slowly through your mouth',
    voiceScript: 'Out',
    duration: 6,
    autoAdvance: true,
  },
  {
    type: 'inhale',
    title: 'Breathe In',
    instruction: 'Inhale slowly through your nose',
    voiceScript: 'In',
    duration: 4,
    autoAdvance: true,
  },
  {
    type: 'hold',
    title: 'Hold',
    instruction: 'Hold the breath gently',
    voiceScript: 'Hold',
    duration: 4,
    autoAdvance: true,
  },
  {
    type: 'exhale',
    title: 'Breathe Out',
    instruction: 'Exhale slowly through your mouth',
    voiceScript: 'Out',
    duration: 6,
    autoAdvance: true,
  },
  {
    type: 'inhale',
    title: 'Breathe In',
    instruction: 'Inhale slowly through your nose',
    voiceScript: 'In',
    duration: 4,
    autoAdvance: true,
  },
  {
    type: 'hold',
    title: 'Hold',
    instruction: 'Hold the breath gently',
    voiceScript: 'Hold',
    duration: 4,
    autoAdvance: true,
  },
  {
    type: 'exhale',
    title: 'Breathe Out',
    instruction: 'Exhale slowly through your mouth',
    voiceScript: 'Out',
    duration: 6,
    autoAdvance: true,
  },
  {
    type: 'pause',
    title: 'Notice',
    instruction: 'Notice how your body feels now.\n\nWhat has shifted?',
    voiceScript: 'Notice what changed.',
    duration: 5,
    autoAdvance: true,
    silence: 5,
  },
  {
    type: 'completion',
    title: 'You Have Returned',
    instruction: 'Your breath is your own.\nThe character does not breathe through you.\n\nYou are here.',
    voiceScript: 'Your breath is yours. You are here.',
  },
];

export default function BreathingExerciseScreen() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSettings, setVoiceSettings] = useState({ rate: 0.65, pitch: 0.9, volume: 0.75 });

  const breathScale = useSharedValue(1);
  const currentStep = STEPS[currentStepIndex];

  useEffect(() => {
    const initSession = async () => {
      try {
        // Load voice settings from user preferences
        const settings = await userSettingsStorage.getSettings();
        const pitch = settings.voiceStyle === 'warmMale' ? 0.8 : settings.voiceStyle === 'warmFemale' ? 1.0 : 0.9;
        setVoiceSettings({
          rate: settings.voiceSpeed * 0.65,
          pitch: pitch,
          volume: settings.voiceVolume / 100,
        });

        const roleId = await returnSessionStorage.getActiveRoleId();
        const session = await returnSessionStorage.saveExerciseSession({
          createdAt: new Date().toISOString(),
          roleId,
          exerciseType: 'breathing_release',
          durationMinutes: 5,
          completed: false,
        });
        setSessionId(session.id);
      } catch (error) {
        console.error('Failed to start exercise:', error);
      }
    };
    initSession();

    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    // Play voice narration
    if (voiceEnabled && currentStep.voiceScript) {
      setTimeout(() => {
        Speech.speak(currentStep.voiceScript!, {
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
          language: 'en-US',
        });
      }, 300);
    }

    // Breathing animation
    if (currentStep.type === 'inhale') {
      breathScale.value = withTiming(1.4, { duration: 4000, easing: Easing.inOut(Easing.ease) });
    } else if (currentStep.type === 'exhale') {
      breathScale.value = withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) });
    } else if (currentStep.type === 'hold') {
      // Hold current scale
    }

    if (currentStep.duration && currentStep.autoAdvance) {
      setCountdown(currentStep.duration);

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            // Auto-advance after a brief moment
            setTimeout(() => {
              if (currentStepIndex < STEPS.length - 1) {
                setCurrentStepIndex(currentStepIndex + 1);
              }
            }, 500);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCountdown(null);
    }
  }, [currentStepIndex, currentStep, voiceEnabled, hasStarted]);

  const handleBegin = () => {
    setHasStarted(true);
    setCurrentStepIndex(0);
  };

  const handleComplete = async () => {
    if (!sessionId) return;
    
    try {
      await returnSessionStorage.updateExerciseSession(sessionId, {
        completed: true,
        completionAt: new Date().toISOString(),
      });
      
      const roleId = await returnSessionStorage.getActiveRoleId();
      await returnSessionStorage.saveReturnSession({
        createdAt: new Date().toISOString(),
        roleId,
        source: 'release_return',
        completed: true,
        completionType: 'exercise',
        notes: 'Breathing & Release exercise completed',
      });
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete exercise:', error);
      Alert.alert('Error', 'Failed to complete exercise');
    }
  };

  const handleExit = () => {
    Speech.stop();
    Alert.alert(
      'Exit Exercise',
      'Are you sure you want to exit? Your progress will not be saved.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      Speech.stop();
    }
  };

  const getStepColor = () => {
    switch (currentStep.type) {
      case 'inhale': return colors.primary;
      case 'hold': return colors.accent;
      case 'exhale': return colors.textPrimary;
      default: return colors.textSecondary;
    }
  };

  const breathAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathScale.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Breathing & Release</Text>
        <Pressable onPress={toggleVoice} style={styles.headerButton}>
          <MaterialIcons 
            name={voiceEnabled ? "volume-up" : "volume-off"} 
            size={24} 
            color={voiceEnabled ? colors.primary : colors.textTertiary} 
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        {hasStarted && (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }
              ]} 
            />
          </View>
        )}

        <View style={styles.stepContainer}>
          {!hasStarted ? (
            <>
              <MaterialIcons name="spa" size={64} color={colors.primary} style={{ marginBottom: spacing.xl }} />
              <Text style={styles.welcomeTitle}>Breathing & Release</Text>
              <Text style={styles.welcomeText}>
                A 5-minute guided exercise to return your nervous system to baseline.
                {'\n\n'}
                Find a comfortable seated position.
                {'\n\n'}
                Once you begin, you can close your eyes and follow the voice guidance—no interaction needed.
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.stepTitle, { color: getStepColor() }]}>
                {currentStep.title}
              </Text>

              {(currentStep.type === 'inhale' || currentStep.type === 'exhale' || currentStep.type === 'hold') && (
                <Animated.View style={[styles.breathCircle, breathAnimatedStyle, { borderColor: getStepColor() }]} />
              )}

              {countdown !== null && countdown > 0 && (
                <View style={styles.countdownCircle}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </View>
              )}

              <Text style={styles.stepInstruction}>
                {currentStep.instruction}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        {!hasStarted ? (
          <Pressable style={styles.beginButton} onPress={handleBegin}>
            <Text style={styles.beginButtonText}>Begin Exercise</Text>
            <MaterialIcons name="play-arrow" size={24} color={colors.background} />
          </Pressable>
        ) : currentStep.type === 'completion' ? (
          <Pressable style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>I Have Returned</Text>
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
  content: {
    flex: 1,
    paddingTop: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    letterSpacing: typography.letterSpacing.title,
  },
  breathCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: spacing.xl,
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  countdownText: {
    fontSize: 56,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  stepInstruction: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: spacing.lg,
  },
  welcomeTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.xl,
  },
  beginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  beginButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    minHeight: 90,
  },

  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  completeButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
