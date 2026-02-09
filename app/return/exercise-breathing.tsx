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

// Sequenced breathing exercise with voice-led guidance
// Audio plays automatically with controlled silence between steps
// No user interaction needed once started

export default function BreathingExerciseScreen() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'arrival' | 'inhale' | 'exhale' | 'return' | 'complete'>('arrival');
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
      const checkStatus = async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.didJustFinish) {
          resolve();
        } else {
          timeoutRef.current = setTimeout(checkStatus, 100);
        }
      };
      checkStatus();
    });
  };

  const wait = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, ms);
    });
  };

  const startBreathAnimation = (type: 'inhale' | 'exhale' | 'neutral') => {
    if (type === 'inhale') {
      breathScale.value = withTiming(1.4, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      breathOpacity.value = withTiming(0.8, { duration: 4000 });
    } else if (type === 'exhale') {
      breathScale.value = withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) });
      breathOpacity.value = withTiming(0.3, { duration: 6000 });
    } else {
      breathScale.value = withTiming(1, { duration: 1000 });
      breathOpacity.value = withTiming(0.3, { duration: 1000 });
    }
  };

  const runBreathingSequence = async () => {
    try {
      // Step 1: Arrival
      setCurrentStep('arrival');
      const arrivalSound = await playAudioStep(systemVoiceAudio.exerciseBreathing.arrival);
      await waitForAudioEnd(arrivalSound);
      await wait(3000); // 3 second pause

      // Step 2: Inhale
      setCurrentStep('inhale');
      startBreathAnimation('inhale');
      const inhaleSound = await playAudioStep(systemVoiceAudio.exerciseBreathing.inhale);
      await waitForAudioEnd(inhaleSound);
      await wait(4000); // 4 second inhale hold

      // Step 3: Exhale
      setCurrentStep('exhale');
      startBreathAnimation('exhale');
      const exhaleSound = await playAudioStep(systemVoiceAudio.exerciseBreathing.exhale);
      await waitForAudioEnd(exhaleSound);
      await wait(6000); // 6 second exhale hold

      // Step 4: Return
      setCurrentStep('return');
      startBreathAnimation('neutral');
      const returnSound = await playAudioStep(systemVoiceAudio.exerciseBreathing.return);
      await waitForAudioEnd(returnSound);

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
        return 'Settling in';
      case 'inhale':
        return 'Breathe in';
      case 'exhale':
        return 'Breathe out';
      case 'return':
        return 'Returning';
      case 'complete':
        return 'Complete';
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
                A 5-minute guided exercise to return your nervous system to baseline.
                {'\n\n'}
                Find a comfortable seated position.
                {'\n\n'}
                Once you begin, you can close your eyes and follow the voice guidance—no interaction needed.
              </Text>
            </>
          ) : (
            <>
              <Animated.View style={[styles.breathCircle, breathAnimatedStyle]} />
              <Text style={styles.stepMessage}>{getStepMessage()}</Text>
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
