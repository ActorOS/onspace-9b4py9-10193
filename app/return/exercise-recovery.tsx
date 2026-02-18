import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { returnSessionStorage } from '@/services/returnSessionStorage';
import { systemVoiceAudio } from '@/constants/systemAudio';
import { tierStorage } from '@/services/tierStorage';

// Full Body Recovery Sequence
// Comprehensive somatic release with guided breath + discharge - ~14-16 minutes
// Fully hands-free once started

type RecoveryStep = 
  | 'arrival' 
  | 'breathOrientation' 
  | 'guidedBreath1' 
  | 'guidedBreath2' 
  | 'guidedBreath3' 
  | 'guidedBreath4' 
  | 'guidedBreath5' 
  | 'guidedBreath6' 
  | 'faceRelease' 
  | 'shoulderRelease' 
  | 'discharge' 
  | 'resetBreath1' 
  | 'resetBreath2' 
  | 'resetBreath3' 
  | 'resetBreath4' 
  | 'resetBreath5' 
  | 'scan' 
  | 'reclaim' 
  | 'close' 
  | 'complete';

export default function FullBodyRecoveryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isStackMode = params.stackMode === 'true';
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('arrival');
  const [audioError, setAudioError] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const waveOpacity = useSharedValue(0.4);

  useEffect(() => {
    checkProAccess();
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

  const checkProAccess = async () => {
    const tier = await tierStorage.getTier();
    if (tier !== 'pro') {
      Alert.alert(
        'Pro Feature',
        'Full Body Recovery is a Pro feature. Upgrade to access extended somatic exercises.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    }
  };

  const initSession = async () => {
    try {
      const roleId = await returnSessionStorage.getActiveRoleId();
      const session = await returnSessionStorage.saveExerciseSession({
        createdAt: new Date().toISOString(),
        roleId,
        exerciseType: 'full_body_recovery',
        durationMinutes: 15,
        completed: false,
      });
      setSessionId(session.id);
    } catch (error) {
      console.error('Failed to start exercise:', error);
    }
  };

  const playAudioStep = async (url: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
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
          sound.setOnPlaybackStatusUpdate(null);
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

  const startWaveAnimation = () => {
    waveOpacity.value = withTiming(0.75, { duration: 2000, easing: Easing.inOut(Easing.ease) });
  };

  const runRecoverySequence = async () => {
    try {
      // Step 1: Arrival
      setCurrentStep('arrival');
      startWaveAnimation();
      const arrivalSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.arrival);
      await waitForAudioEnd(arrivalSound);
      await arrivalSound.unloadAsync();
      await wait(8000);

      // Step 2: Breath Orientation
      setCurrentStep('breathOrientation');
      startWaveAnimation();
      const breathOrientationSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.breathOrientation);
      await waitForAudioEnd(breathOrientationSound);
      await breathOrientationSound.unloadAsync();
      await wait(6000);

      // Guided Breath Loop (6 cycles)
      for (let i = 1; i <= 6; i++) {
        setCurrentStep(`guidedBreath${i}` as RecoveryStep);
        startWaveAnimation();
        
        // Inhale
        const inhaleSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.inhale);
        await waitForAudioEnd(inhaleSound);
        await inhaleSound.unloadAsync();
        await wait(4000);
        
        // Exhale
        const exhaleSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.exhale);
        await waitForAudioEnd(exhaleSound);
        await exhaleSound.unloadAsync();
        await wait(6000);
      }

      // Step 3: Face Release
      setCurrentStep('faceRelease');
      startWaveAnimation();
      const faceReleaseSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.faceRelease);
      await waitForAudioEnd(faceReleaseSound);
      await faceReleaseSound.unloadAsync();
      await wait(10000);

      // Step 4: Shoulder Release
      setCurrentStep('shoulderRelease');
      startWaveAnimation();
      const shoulderReleaseSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.shoulderRelease);
      await waitForAudioEnd(shoulderReleaseSound);
      await shoulderReleaseSound.unloadAsync();
      await wait(12000);

      // Step 5: Discharge
      setCurrentStep('discharge');
      startWaveAnimation();
      const dischargeSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.discharge);
      await waitForAudioEnd(dischargeSound);
      await dischargeSound.unloadAsync();
      await wait(25000);

      // Nervous System Reset Breath (5 cycles)
      for (let i = 1; i <= 5; i++) {
        setCurrentStep(`resetBreath${i}` as RecoveryStep);
        startWaveAnimation();
        
        // Inhale
        const inhaleSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.inhale);
        await waitForAudioEnd(inhaleSound);
        await inhaleSound.unloadAsync();
        await wait(4000);
        
        // Exhale
        const exhaleSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.exhale);
        await waitForAudioEnd(exhaleSound);
        await exhaleSound.unloadAsync();
        await wait(8000);
      }

      // Step 6: Scan
      setCurrentStep('scan');
      startWaveAnimation();
      const scanSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.scan);
      await waitForAudioEnd(scanSound);
      await scanSound.unloadAsync();
      await wait(20000);

      // Step 7: Reclaim
      setCurrentStep('reclaim');
      startWaveAnimation();
      const reclaimSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.reclaim);
      await waitForAudioEnd(reclaimSound);
      await reclaimSound.unloadAsync();
      await wait(10000);

      // Step 8: Close
      setCurrentStep('close');
      startWaveAnimation();
      const closeSound = await playAudioStep(systemVoiceAudio.exerciseRecovery.close);
      await waitForAudioEnd(closeSound);
      await closeSound.unloadAsync();

      // Complete
      setCurrentStep('complete');
    } catch (error) {
      console.log('Recovery sequence failed, showing text fallback:', error);
      setAudioError(true);
      setCurrentStep('complete');
    }
  };

  const handleBegin = async () => {
    setHasStarted(true);
    await activateKeepAwakeAsync();
    runRecoverySequence();
  };

  const handleComplete = async () => {
    deactivateKeepAwake();
    
    if (!sessionId) return;
    
    try {
      await returnSessionStorage.updateExerciseSession(sessionId, {
        completed: true,
        completionAt: new Date().toISOString(),
      });
      
      if (!isStackMode) {
        const roleId = await returnSessionStorage.getActiveRoleId();
        await returnSessionStorage.saveReturnSession({
          createdAt: new Date().toISOString(),
          roleId,
          source: 'release_return',
          completed: true,
          completionType: 'exercise',
          notes: 'Full Body Recovery Sequence completed',
        });
      }
      
      if (isStackMode) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to complete exercise:', error);
      Alert.alert('Error', 'Failed to complete exercise');
    }
  };

  const handleExit = () => {
    deactivateKeepAwake();
    
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

  const waveAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: waveOpacity.value,
    };
  });

  const getStepMessage = () => {
    if (audioError) {
      return 'Audio unavailable. Continue with silent awareness.';
    }
    
    if (currentStep.startsWith('guidedBreath')) {
      return 'Guided Breath';
    }
    if (currentStep.startsWith('resetBreath')) {
      return 'Reset Breath';
    }
    
    switch (currentStep) {
      case 'arrival':
        return 'Arriving';
      case 'breathOrientation':
        return 'Breath Orientation';
      case 'faceRelease':
        return 'Face Release';
      case 'shoulderRelease':
        return 'Shoulder Release';
      case 'discharge':
        return 'Somatic Discharge';
      case 'scan':
        return 'Body Scan';
      case 'reclaim':
        return 'Reclaiming Self';
      case 'close':
        return 'Closing';
      case 'complete':
        return 'Complete';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    if (audioError) {
      return 'Continue with awareness of your breath and body.';
    }
    
    if (currentStep.startsWith('guidedBreath')) {
      return 'Follow the breath cues';
    }
    if (currentStep.startsWith('resetBreath')) {
      return 'Allow your nervous system to settle';
    }
    
    switch (currentStep) {
      case 'arrival':
        return 'Taking your position';
      case 'breathOrientation':
        return 'Preparing to breathe';
      case 'faceRelease':
        return 'Release jaw and facial tension';
      case 'shoulderRelease':
        return 'Drop shoulders and arms';
      case 'discharge':
        return 'Movement and release';
      case 'scan':
        return 'Whole body integration';
      case 'reclaim':
        return 'Return to yourself';
      case 'close':
        return 'The work is complete';
      default:
        return '';
    }
  };

  const getStepIcon = (): string => {
    if (currentStep.startsWith('guidedBreath') || currentStep.startsWith('resetBreath')) {
      return 'air';
    }
    
    switch (currentStep) {
      case 'arrival':
        return 'self-improvement';
      case 'breathOrientation':
        return 'air';
      case 'faceRelease':
      case 'shoulderRelease':
        return 'accessibility-new';
      case 'discharge':
        return 'trending-down';
      case 'scan':
        return 'visibility';
      case 'reclaim':
        return 'person-pin';
      case 'close':
        return 'check-circle';
      default:
        return 'spa';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Full Recovery</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.stepContainer}>
          {!hasStarted ? (
            <>
              <MaterialIcons name="spa" size={64} color={colors.textPrimary} style={{ marginBottom: spacing.xl }} />
              <Text style={styles.welcomeTitle}>Full Body Recovery</Text>
              <Text style={styles.subtitleText}>Guided Sequence</Text>
              <Text style={styles.welcomeText}>
                Complete recovery after demanding work.
                {'\n\n'}
                Find a comfortable position. You may close your eyes once you begin.
                {'\n\n'}
                Breath, release, discharge, scan, and reclaim.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <MaterialIcons 
                  name={getStepIcon() as any} 
                  size={80} 
                  color={colors.primary} 
                />
                <Animated.View style={[styles.waveIndicator, waveAnimatedStyle]} />
              </View>
              <Text style={styles.stepMessage}>{getStepMessage()}</Text>
              <Text style={styles.stepDescription}>{getStepDescription()}</Text>
              {audioError && (
                <Text style={styles.fallbackText}>
                  Continue with awareness of your breath and body
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
  iconContainer: {
    marginBottom: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveIndicator: {
    width: 80,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  subtitleText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
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
