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
import { trackExerciseStarted, trackExerciseCompleted, trackExerciseAbandoned } from '@/services/usageTracking';
import { useReturnHubBack } from '@/hooks/useReturnHubBack';

// 9-step voice-led Identity Separation exercise
// Helps performers distinguish self from character
// Fully hands-free once started

type IdentityStep = 
  | 'arrival' 
  | 'nameSelf' 
  | 'acknowledgeRole' 
  | 'locateBoundary' 
  | 'separate' 
  | 'returnToSelf' 
  | 'releaseResponsibility' 
  | 'groundSelf' 
  | 'close' 
  | 'complete';

export default function IdentitySeparationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { onClose, returnTo } = useReturnHubBack();
  const isStackMode = params.stackMode === 'true';
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [trackingSessionId, setTrackingSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<IdentityStep>('arrival');
  const [audioError, setAudioError] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const waveOpacity = useSharedValue(0.4);

  useEffect(() => {
    const initSession = async () => {
      try {
        const roleId = await returnSessionStorage.getActiveRoleId();
        const session = await returnSessionStorage.saveExerciseSession({
          createdAt: new Date().toISOString(),
          roleId,
          exerciseType: 'identity_separation',
          durationMinutes: 10,
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

  const startWaveAnimation = () => {
    waveOpacity.value = withTiming(0.75, { duration: 2000, easing: Easing.inOut(Easing.ease) });
  };

  const runIdentitySeparationSequence = async () => {
    try {
      // Step 1: Arrival
      setCurrentStep('arrival');
      startWaveAnimation();
      const arrivalSound = await playAudioStep(systemVoiceAudio.exerciseIdentity.arrival);
      await waitForAudioEnd(arrivalSound);
      await arrivalSound.unloadAsync();
      await wait(5000); // 5 second pause

      // Step 2: Name Self
      setCurrentStep('nameSelf');
      startWaveAnimation();
      const nameSelfSound = await playAudioStep(systemVoiceAudio.exerciseIdentity.nameSelf);
      await waitForAudioEnd(nameSelfSound);
      await nameSelfSound.unloadAsync();
      await wait(8000); // 8 second hold

      // Step 3: Acknowledge Role
      setCurrentStep('acknowledgeRole');
      startWaveAnimation();
      const acknowledgeRoleSound = await playAudioStep(systemVoiceAudio.exerciseIdentity.acknowledgeRole);
      await waitForAudioEnd(acknowledgeRoleSound);
      await acknowledgeRoleSound.unloadAsync();
      await wait(10000); // 10 second hold

      // Step 4: Locate Boundary
      setCurrentStep('locateBoundary');
      startWaveAnimation();
      const locateBoundarySound = await playAudioStep(systemVoiceAudio.exerciseIdentity.locateBoundary);
      await waitForAudioEnd(locateBoundarySound);
      await locateBoundarySound.unloadAsync();
      await wait(12000); // 12 second hold

      // Step 5: Separate
      setCurrentStep('separate');
      startWaveAnimation();
      const separateSound = await playAudioStep(systemVoiceAudio.exerciseIdentity.separate);
      await waitForAudioEnd(separateSound);
      await separateSound.unloadAsync();
      await wait(20000); // 20 second hold (core separation moment)

      // Step 6: Return to Self
      setCurrentStep('returnToSelf');
      startWaveAnimation();
      const returnToSelfSound = await playAudioStep(systemVoiceAudio.exerciseIdentity.returnToSelf);
      await waitForAudioEnd(returnToSelfSound);
      await returnToSelfSound.unloadAsync();
      await wait(12000); // 12 second hold

      // Step 7: Release Responsibility
      setCurrentStep('releaseResponsibility');
      startWaveAnimation();
      const releaseResponsibilitySound = await playAudioStep(systemVoiceAudio.exerciseIdentity.releaseResponsibility);
      await waitForAudioEnd(releaseResponsibilitySound);
      await releaseResponsibilitySound.unloadAsync();
      await wait(15000); // 15 second hold

      // Step 8: Ground Self
      setCurrentStep('groundSelf');
      startWaveAnimation();
      const groundSelfSound = await playAudioStep(systemVoiceAudio.exerciseIdentity.groundSelf);
      await waitForAudioEnd(groundSelfSound);
      await groundSelfSound.unloadAsync();
      await wait(12000); // 12 second hold

      // Step 9: Close
      setCurrentStep('close');
      startWaveAnimation();
      const closeSound = await playAudioStep(systemVoiceAudio.exerciseIdentity.close);
      await waitForAudioEnd(closeSound);
      await closeSound.unloadAsync();

      // Complete
      setCurrentStep('complete');
    } catch (error) {
      console.log('Identity separation sequence failed, showing text fallback:', error);
      setAudioError(true);
      setCurrentStep('complete');
    }
  };

  const handleBegin = async () => {
    setHasStarted(true);
    await activateKeepAwakeAsync();
    // Track exercise start
    const tid = await trackExerciseStarted('Identity Separation (Standard)');
    setTrackingSessionId(tid);
    runIdentitySeparationSequence();
  };

  const handleComplete = async () => {
    deactivateKeepAwake();
    
    // Track exercise completion
    if (trackingSessionId) {
      await trackExerciseCompleted('Identity Separation (Standard)', trackingSessionId);
    }
    
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
          notes: 'Identity Separation exercise completed',
        });
      }
      
      if (isStackMode) {
        router.back();
      } else {
        router.replace(returnTo);
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
    
    // Track abandonment if exercise was started but not completed
    const trackAbandon = async () => {
      if (hasStarted && currentStep !== 'complete' && trackingSessionId) {
        await trackExerciseAbandoned('Identity Separation (Standard)', trackingSessionId);
      }
    };
    
    Alert.alert(
      'Exit Exercise',
      'Are you sure you want to exit? Your progress will not be saved.',
      [
        { text: 'Stay', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive', 
          onPress: () => {
            trackAbandon();
            onClose();
          }
        },
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
    switch (currentStep) {
      case 'arrival':
        return 'Arriving';
      case 'nameSelf':
        return 'Your Name';
      case 'acknowledgeRole':
        return 'Acknowledging the Role';
      case 'locateBoundary':
        return 'Finding the Boundary';
      case 'separate':
        return 'Separation';
      case 'returnToSelf':
        return 'Returning to Self';
      case 'releaseResponsibility':
        return 'Release';
      case 'groundSelf':
        return 'Grounding';
      case 'close':
        return 'Closing';
      case 'complete':
        return 'Complete';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    if (audioError) return 'Notice the difference between self and role';
    
    switch (currentStep) {
      case 'arrival':
        return 'Taking your position';
      case 'nameSelf':
        return 'Who you are';
      case 'acknowledgeRole':
        return 'Who they are';
      case 'locateBoundary':
        return 'Where you end, they begin';
      case 'separate':
        return 'Making the distinction';
      case 'returnToSelf':
        return 'Coming back to your center';
      case 'releaseResponsibility':
        return 'Not yours to carry';
      case 'groundSelf':
        return 'Your feet, your breath, your name';
      case 'close':
        return 'The work is done';
      default:
        return '';
    }
  };

  const getStepIcon = (): string => {
    switch (currentStep) {
      case 'arrival':
        return 'self-improvement';
      case 'nameSelf':
      case 'acknowledgeRole':
        return 'psychology';
      case 'locateBoundary':
      case 'separate':
        return 'grain';
      case 'returnToSelf':
      case 'groundSelf':
        return 'person';
      case 'releaseResponsibility':
        return 'spa';
      case 'close':
        return 'check-circle';
      default:
        return 'psychology';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Identity Separation</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.stepContainer}>
          {!hasStarted ? (
            <>
              <MaterialIcons name="psychology" size={64} color={colors.textPrimary} style={{ marginBottom: spacing.xl }} />
              <Text style={styles.welcomeTitle}>Identity Separation</Text>
              <Text style={styles.subtitleText}>Standard Version</Text>
              <Text style={styles.welcomeText}>
                Structured return to self.
                {'\n\n'}
                Find a comfortable seated position. You may close your eyes once you begin.
                {'\n\n'}
                The voice will guide you through arrival, naming, boundary work, separation, and return to self.
                {'\n\n'}
                No interaction needed—just listen and allow the distinction to form.
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
                  Continue with awareness of your own identity
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
