import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { returnSessionStorage } from '@/services/returnSessionStorage';
import { userSettingsStorage } from '@/services/userSettingsStorage';

interface Step {
  title: string;
  instruction: string;
  bodyPart: string;
  voiceScript?: string;
  pauseDuration: number; // in seconds
  needsChoice?: boolean;
  silence?: number; // seconds of silence after voice
}

const STEPS: Step[] = [
  {
    title: 'Preparation',
    instruction: 'Lie down or sit in a comfortable position.\n\nClose your eyes or soften your gaze.',
    bodyPart: 'preparation',
    voiceScript: 'Lie down. Close your eyes. We will begin.',
    pauseDuration: 5,
    silence: 3,
  },
  {
    title: 'Feet',
    instruction: 'Bring your attention to your feet.\n\nNotice any sensation, tension, or holding.',
    bodyPart: 'feet',
    voiceScript: 'Your feet.',
    pauseDuration: 5,
    needsChoice: true,
    silence: 5,
  },
  {
    title: 'Legs',
    instruction: 'Move your awareness slowly up through your legs.\n\nNotice what you are carrying there.',
    bodyPart: 'legs',
    voiceScript: 'Your legs.',
    pauseDuration: 5,
    needsChoice: true,
    silence: 5,
  },
  {
    title: 'Torso',
    instruction: 'Scan your lower back, abdomen, and chest.\n\nWhat does your core hold?',
    bodyPart: 'torso',
    voiceScript: 'Your torso. What does it hold?',
    pauseDuration: 5,
    needsChoice: true,
    silence: 5,
  },
  {
    title: 'Shoulders',
    instruction: 'Notice your shoulders and upper back.\n\nIs there weight here that is not yours?',
    bodyPart: 'shoulders',
    voiceScript: 'Your shoulders. Is the weight yours?',
    pauseDuration: 5,
    needsChoice: true,
    silence: 5,
  },
  {
    title: 'Arms & Hands',
    instruction: 'Move down through your arms to your hands.\n\nNotice what they have been doing.',
    bodyPart: 'arms',
    voiceScript: 'Your arms. Your hands.',
    pauseDuration: 5,
    needsChoice: true,
    silence: 5,
  },
  {
    title: 'Neck & Throat',
    instruction: 'Bring awareness to your neck and throat.\n\nNotice any tightness or constriction.',
    bodyPart: 'neck',
    voiceScript: 'Your neck. Your throat.',
    pauseDuration: 5,
    needsChoice: true,
    silence: 5,
  },
  {
    title: 'Face & Head',
    instruction: 'Scan your jaw, face, and scalp.\n\nNotice what expression you have been holding.',
    bodyPart: 'head',
    voiceScript: 'Your face. What expression are you holding?',
    pauseDuration: 5,
    needsChoice: true,
    silence: 5,
  },
  {
    title: 'Release',
    instruction: 'Acknowledge what the character left behind in your body.\n\nWith each exhale, let it go.',
    bodyPart: 'release',
    voiceScript: 'Let it go now.',
    pauseDuration: 8,
    silence: 8,
  },
  {
    title: 'Return',
    instruction: 'This body is yours.\nYou are the one who lives here.\n\nWhen you are ready, open your eyes.',
    bodyPart: 'completion',
    voiceScript: 'This body is yours.',
    pauseDuration: 0,
  },
];

export default function BodyScanExerciseScreen() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSettings, setVoiceSettings] = useState({ rate: 0.65, pitch: 0.9, volume: 0.75 });

  const pulseOpacity = useSharedValue(0.6);
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
          exerciseType: 'body_scan',
          durationMinutes: 10,
          completed: false,
        });
        setSessionId(session.id);
      } catch (error) {
        console.error('Failed to start exercise:', error);
      }
    };
    initSession();

    // Gentle pulse animation
    pulseOpacity.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    return () => {
      Speech.stop();
      cancelAnimation(pulseOpacity);
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
    
    if (currentStep.pauseDuration > 0) {
      setCountdown(currentStep.pauseDuration);

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            // Auto-advance after countdown
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
        notes: 'Body Scan exercise completed',
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



  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseOpacity.value,
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Body Scan</Text>
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
              <MaterialIcons name="self-improvement" size={64} color={colors.accent} style={{ marginBottom: spacing.xl }} />
              <Text style={styles.welcomeTitle}>Body Scan</Text>
              <Text style={styles.welcomeText}>
                A 10-minute guided exercise to release character tension held in the body.
                {'\n\n'}
                Find a comfortable position—lying down or seated.
                {'\n\n'}
                Once you begin, you can close your eyes and follow the voice guidance through each part of your body.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>
                {currentStep.title}
              </Text>

              {countdown !== null && countdown > 0 && (
                <>
                  <Animated.View style={[styles.pulseIndicator, pulseAnimatedStyle]} />
                  <View style={styles.countdownCircle}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                  </View>
                </>
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
        ) : currentStep.bodyPart === 'completion' ? (
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
  pulseIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  stepTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    letterSpacing: typography.letterSpacing.title,
  },
  countdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  countdownText: {
    fontSize: 36,
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
