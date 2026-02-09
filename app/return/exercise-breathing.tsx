import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { returnSessionStorage } from '@/services/returnSessionStorage';
import { systemVoiceAudio } from '@/constants/systemAudio';

// Detailed sequenced breathing exercise with voice-led guidance
// 8-segment flow with repetition cycles for deep settling
// No user interaction needed once started - fully hands-free

export default function BreathingExerciseScreen() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'arrival' | 'settle' | 'inhale' | 'exhale' | 'repeat' | 'quiet' | 'return' | 'complete'>('arrival');
  const [cycleCount, setCycleCount] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const breathScale = useSharedValue(1);
  const breathOpacity = useSharedValue(0.3);

  useEffect(() => {
    const initSession = async () => {
      try {
        const roleId = await returnSessionStorage.getActiveRoleId();
        const session = await returnSessionStorage.saveExerciseSession({
          createdAt: new Date().toISOString(),
          roleId,
          exerciseType: 'breathing_release',
          durationMinutes: 8,
          completed: false,
        });
        setSessionId(session.id);
      } catch (error) {
        console.error('Failed to start exercise:', error);
      }
    };
    initSession();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const playAudioStep = async (url: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, volume: 0.85 }
      );
      
      soundRef.current = sound;
      return sound;
    } catch (error) {
      console.log('Audio step failed:', error);
      throw error;
    }
  };

  const waitForAudioEnd = (sound: Audio.Sound): Promise<void> => {
    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.setOnPlaybackStatusUpdate(null); // Clear listener
          resolve();
        }
      });
    });
  };

  const wait = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, ms);
    });
  };

  const startBreathAnimation = (type: 'inhale' | 'exhale' | 'neutral') => {
    if (type === 'inhale') {
      breathScale.value = withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      breathOpacity.value = withTiming(0.85, { duration: 4000 });
    } else if (type === 'exhale') {
      breathScale.value = withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) });
      breathOpacity.value = withTiming(0.3, { duration: 6000 });
    } else {
      breathScale.value = withTiming(1.15, { duration: 2000 });
      breathOpacity.value = withTiming(0.4, { duration: 2000 });
    }
  };

  const runBreathingSequence = async () => {
    try {
      // Step 1: Arrival
      setCurrentStep('arrival');
      const arrivalSound = await playAudioStep(systemVoiceAudio.exerciseBreathing.arrival);
      await waitForAudioEnd(arrivalSound);
      await arrivalSound.unloadAsync();
      await wait(4000); // 4 second pause

      // Step 2: Settle
      setCurrentStep('settle');
      startBreathAnimation('neutral');
      const settleSound = await playAudioStep(systemVoiceAudio.exerciseBreathing.settle);
      await waitForAudioEnd(settleSound);
      await settleSound.unloadAsync();
      await wait(4000); // 4 second pause

      // Step 3: First guided inhale
      setCurrentStep('inhale');
      startBreathAnimation('inhale');
      const inhale1Sound = await playAudioStep(systemVoiceAudio.exerciseBreathing.inhale4);
      await waitForAudioEnd(inhale1Sound);
      await inhale1Sound.unloadAsync();
      await wait(4000); // 4 second inhale hold

      // Step 4: First guided exhale
      setCurrentStep('exhale');
      startBreathAnimation('exhale');
      const exhale1Sound = await playAudioStep(systemVoiceAudio.exerciseBreathing.exhale6);
      await waitForAudioEnd(exhale1Sound);
      await exhale1Sound.unloadAsync();
      await wait(6000); // 6 second exhale hold

      // Steps 5-6: Repeat cycles (3 times total)
      for (let i = 0; i < 3; i++) {
        setCycleCount(i + 1);
        setCurrentStep('repeat');

        // Inhale cue
        startBreathAnimation('inhale');
        const repeatInhaleSound = await playAudioStep(systemVoiceAudio.exerciseBreathing.repeatCue);
        await waitForAudioEnd(repeatInhaleSound);
        await repeatInhaleSound.unloadAsync();
        await wait(4000); // 4 second inhale hold

        // Exhale cue
        startBreathAnimation('exhale');
        const repeatExhaleSound = await playAudioStep(systemVoiceAudio.exerciseBreathing.repeatExhaleCue);
        await waitForAudioEnd(repeatExhaleSound);
        await repeatExhaleSound.unloadAsync();
        await wait(6000); // 6 second exhale hold
      }

      // Step 7: Quiet hold
      setCurrentStep('quiet');
      startBreathAnimation('neutral');
      const quietSound = await playAudioStep(systemVoiceAudio.exerciseBreathing.quietHold);
      await waitForAudioEnd(quietSound);
      await quietSound.unloadAsync();
      await wait(30000); // 30 second silent hold

      // Step 8: Return and close
      setCurrentStep('return');
      const returnSound = await playAudioStep(systemVoiceAudio.exerciseBreathing.returnClose);
      await waitForAudioEnd(returnSound);
      await returnSound.unloadAsync();

      // Complete
      setCurrentStep('complete');
    } catch (error) {
      console.log('Breathing sequence failed, showing text fallback:', error);
      setAudioError(true);
      setCurrentStep('complete');
    }
  };

  const handleBegin = () => {
    setHasStarted(true);
    runBreathingSequence();
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
    if (soundRef.current) {
      soundRef.current.stopAsync();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    Alert.alert(
      'Exit Exercise',
      'Are you sure you want to exit? Your progress will not be saved.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const breathAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathScale.value }],
      opacity: breathOpacity.value,
    };
  });

  const getStepMessage = () => {
    if (audioError) {
      return 'Audio unavailable. Follow your natural breathing rhythm.';
    }
    switch (currentStep) {
      case 'arrival':
        return 'Arriving';
      case 'settle':
        return 'Settling';
      case 'inhale':
        return 'Breathe in';
      case 'exhale':
        return 'Breathe out';
      case 'repeat':
        return cycleCount > 0 ? `Cycle ${cycleCount} of 3` : 'Breathing';
      case 'quiet':
        return 'Quiet hold';
      case 'return':
        return 'Returning';
      case 'complete':
        return 'Complete';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    if (audioError) return 'Continue with natural breathing';
    
    switch (currentStep) {
      case 'arrival':
        return 'Finding your place';
      case 'settle':
        return 'Allowing yourself to be here';
      case 'inhale':
      case 'exhale':
        return 'Following the voice guidance';
      case 'repeat':
        return 'Breathing with the rhythm';
      case 'quiet':
        return 'Resting in stillness';
      case 'return':
        return 'Coming back';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Breathing & Release</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.stepContainer}>
          {!hasStarted ? (
            <>
              <MaterialIcons name="spa" size={64} color={colors.primary} style={{ marginBottom: spacing.xl }} />
              <Text style={styles.welcomeTitle}>Breathing & Release</Text>
              <Text style={styles.welcomeText}>
                An 8-minute guided exercise to return your nervous system to baseline.
                {'\n\n'}
                Find a comfortable seated position. You may close your eyes once you begin.
                {'\n\n'}
                The voice will guide you through arrival, settling, breathing cycles, and a quiet hold before returning.
                {'\n\n'}
                No interaction needed—just listen and breathe.
              </Text>
            </>
          ) : (
            <>
              <Animated.View style={[styles.breathCircle, breathAnimatedStyle]} />
              <Text style={styles.stepMessage}>{getStepMessage()}</Text>
              <Text style={styles.stepDescription}>{getStepDescription()}</Text>
              {audioError && (
                <Text style={styles.fallbackText}>
                  Continue with your natural breathing rhythm
                </Text>
              )}
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
        ) : currentStep === 'complete' ? (
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
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primary,
    marginBottom: spacing.xl * 2,
  },
  stepMessage: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  stepDescription: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  fallbackText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
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
