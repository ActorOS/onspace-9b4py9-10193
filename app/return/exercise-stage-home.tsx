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

// 8-step voice-led transition exercise for commute from performance to home
// Designed for nervous system regulation while traveling
// Fully hands-free once started

type StageStep = 
  | 'arrival' 
  | 'externalAwareness' 
  | 'bodyDrop' 
  | 'breathReset' 
  | 'discharge' 
  | 'identityBoundary' 
  | 'sensoryAnchor' 
  | 'close' 
  | 'complete';

export default function StageToHomeExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { onClose, returnTo } = useReturnHubBack();
  const isStackMode = params.stackMode === 'true';
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [trackingSessionId, setTrackingSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<StageStep>('arrival');
  const [audioError, setAudioError] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    const initSession = async () => {
      try {
        const roleId = await returnSessionStorage.getActiveRoleId();
        const session = await returnSessionStorage.saveExerciseSession({
          createdAt: new Date().toISOString(),
          roleId,
          exerciseType: 'stage_to_home',
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

      console.log('[Audio] Setting audio mode...');
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      console.log('[Audio] Loading sound:', url.substring(0, 50) + '...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false, volume: 0.85 }
      );
      
      soundRef.current = sound;
      
      console.log('[Audio] Starting playback...');
      await sound.playAsync();
      
      console.log('[Audio] Playback started successfully');
      return sound;
    } catch (error) {
      console.error('[Audio] Failed to play audio:', error);
      throw error;
    }
  };

  const waitForAudioEnd = (sound: Audio.Sound): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('[Audio] Timeout waiting for audio to finish - advancing to next step');
        sound.setOnPlaybackStatusUpdate(null);
        resolve(); // Resolve instead of reject to allow sequence to continue
      }, 30000); // 30 second timeout (shorter for faster recovery)

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            console.log('[Audio] Audio finished playing');
            clearTimeout(timeout);
            sound.setOnPlaybackStatusUpdate(null);
            resolve();
          } else if (status.error) {
            console.error('[Audio] Playback error:', status.error);
            clearTimeout(timeout);
            sound.setOnPlaybackStatusUpdate(null);
            resolve(); // Resolve instead of reject to allow sequence to continue
          }
        }
      });
    });
  };

  const wait = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, ms);
    });
  };

  const startPulseAnimation = () => {
    pulseOpacity.value = withTiming(0.75, { duration: 2000, easing: Easing.inOut(Easing.ease) });
  };

  const runStageToHomeSequence = async () => {
    try {
      // Step 1: Arrival
      setCurrentStep('arrival');
      startPulseAnimation();
      const arrivalSound = await playAudioStep(systemVoiceAudio.exerciseStageHome.arrival);
      await waitForAudioEnd(arrivalSound);
      await arrivalSound.unloadAsync();
      await wait(5000); // 5 second pause

      // Step 2: External Awareness
      setCurrentStep('externalAwareness');
      startPulseAnimation();
      const awarenessSound = await playAudioStep(systemVoiceAudio.exerciseStageHome.externalAwareness);
      await waitForAudioEnd(awarenessSound);
      await awarenessSound.unloadAsync();
      await wait(8000); // 8 second pause

      // Step 3: Body Drop
      setCurrentStep('bodyDrop');
      startPulseAnimation();
      const bodyDropSound = await playAudioStep(systemVoiceAudio.exerciseStageHome.bodyDrop);
      await waitForAudioEnd(bodyDropSound);
      await bodyDropSound.unloadAsync();
      await wait(10000); // 10 second pause

      // Step 4: Breath Reset
      setCurrentStep('breathReset');
      startPulseAnimation();
      const breathSound = await playAudioStep(systemVoiceAudio.exerciseStageHome.breathReset);
      await waitForAudioEnd(breathSound);
      await breathSound.unloadAsync();
      await wait(12000); // 12 second pause

      // Step 5: Discharge
      setCurrentStep('discharge');
      startPulseAnimation();
      const dischargeSound = await playAudioStep(systemVoiceAudio.exerciseStageHome.discharge);
      await waitForAudioEnd(dischargeSound);
      await dischargeSound.unloadAsync();
      await wait(8000); // 8 second pause

      // Step 6: Identity Boundary
      setCurrentStep('identityBoundary');
      startPulseAnimation();
      const boundarySound = await playAudioStep(systemVoiceAudio.exerciseStageHome.identityBoundary);
      await waitForAudioEnd(boundarySound);
      await boundarySound.unloadAsync();
      await wait(10000); // 10 second pause

      // Step 7: Sensory Anchor
      setCurrentStep('sensoryAnchor');
      startPulseAnimation();
      const anchorSound = await playAudioStep(systemVoiceAudio.exerciseStageHome.sensoryAnchor);
      await waitForAudioEnd(anchorSound);
      await anchorSound.unloadAsync();
      await wait(12000); // 12 second pause

      // Step 8: Close
      setCurrentStep('close');
      startPulseAnimation();
      const closeSound = await playAudioStep(systemVoiceAudio.exerciseStageHome.close);
      await waitForAudioEnd(closeSound);
      await closeSound.unloadAsync();

      // Complete
      setCurrentStep('complete');
    } catch (error) {
      console.log('Stage to Home sequence failed, showing text fallback:', error);
      setAudioError(true);
      setCurrentStep('complete');
    }
  };

  const handleBegin = async () => {
    setHasStarted(true);
    await activateKeepAwakeAsync();
    // Track exercise start
    const tid = await trackExerciseStarted('Stage to Home');
    setTrackingSessionId(tid);
    runStageToHomeSequence();
  };

  const handleComplete = async () => {
    deactivateKeepAwake();
    
    // Track exercise completion
    if (trackingSessionId) {
      await trackExerciseCompleted('Stage to Home', trackingSessionId);
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
          notes: 'Stage to Home exercise completed',
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
        await trackExerciseAbandoned('Stage to Home', trackingSessionId);
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

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseOpacity.value,
    };
  });

  const getStepMessage = () => {
    if (audioError) {
      return 'Audio unavailable. Continue with awareness of your transition.';
    }
    switch (currentStep) {
      case 'arrival':
        return 'Arriving';
      case 'externalAwareness':
        return 'External Awareness';
      case 'bodyDrop':
        return 'Body Drop';
      case 'breathReset':
        return 'Breath Reset';
      case 'discharge':
        return 'Discharge';
      case 'identityBoundary':
        return 'Identity Boundary';
      case 'sensoryAnchor':
        return 'Sensory Anchor';
      case 'close':
        return 'Closing';
      case 'complete':
        return 'Complete';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    if (audioError) return 'Notice your transition from stage to home';
    
    switch (currentStep) {
      case 'arrival':
        return 'Acknowledging the transition';
      case 'externalAwareness':
        return 'Notice your surroundings';
      case 'bodyDrop':
        return 'Releasing performance posture';
      case 'breathReset':
        return 'Returning to natural rhythm';
      case 'discharge':
        return 'Releasing residual energy';
      case 'identityBoundary':
        return 'Separating role from self';
      case 'sensoryAnchor':
        return 'Grounding in the present';
      case 'close':
        return 'You are heading home';
      default:
        return '';
    }
  };

  const getStepIcon = (): string => {
    switch (currentStep) {
      case 'arrival':
        return 'directions-walk';
      case 'externalAwareness':
        return 'visibility';
      case 'bodyDrop':
        return 'accessibility';
      case 'breathReset':
        return 'spa';
      case 'discharge':
        return 'flash-on';
      case 'identityBoundary':
        return 'psychology';
      case 'sensoryAnchor':
        return 'my-location';
      case 'close':
        return 'home';
      default:
        return 'directions-walk';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Stage to Home</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.stepContainer}>
          {!hasStarted ? (
            <>
              <MaterialIcons name="directions-walk" size={64} color={colors.accent} style={{ marginBottom: spacing.xl }} />
              <Text style={styles.welcomeTitle}>Stage to Home</Text>
              <Text style={styles.welcomeText}>
                A guided transition exercise for your commute from performance or rehearsal to home.
                {'\n\n'}
                This exercise is designed to regulate your nervous system while traveling, helping you separate from the work and return to yourself.
                {'\n\n'}
                You can do this sitting in transit, walking, or in a stationary position.
                {'\n\n'}
                The voice will guide you through awareness, release, and grounding before you arrive home.
                {'\n\n'}
                No interaction needed—just listen and transition.
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
                <Animated.View style={[styles.pulseIndicator, pulseAnimatedStyle]} />
              </View>
              <Text style={styles.stepMessage}>{getStepMessage()}</Text>
              <Text style={styles.stepDescription}>{getStepDescription()}</Text>
              {audioError && (
                <Text style={styles.fallbackText}>
                  Continue with your natural transition home
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
  pulseIndicator: {
    width: 80,
    height: 4,
    backgroundColor: colors.accent,
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
