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
import { trackExerciseStarted, trackExerciseCompleted } from '@/services/usageTracking';

// Detailed 10-step body scan exercise with voice-led guidance
// Slow progression from feet to head with extended holds
// Fully hands-free once started

type ScanStep = 
  | 'arrival' 
  | 'grounding' 
  | 'feet' 
  | 'legs' 
  | 'pelvis' 
  | 'torso' 
  | 'shoulders' 
  | 'neck' 
  | 'whole' 
  | 'return' 
  | 'complete';

export default function BodyScanExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isStackMode = params.stackMode === 'true';
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [trackingSessionId, setTrackingSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ScanStep>('arrival');
  const [audioError, setAudioError] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scanOpacity = useSharedValue(0.4);

  useEffect(() => {
    const initSession = async () => {
      try {
        const roleId = await returnSessionStorage.getActiveRoleId();
        const session = await returnSessionStorage.saveExerciseSession({
          createdAt: new Date().toISOString(),
          roleId,
          exerciseType: 'body_scan',
          durationMinutes: 12,
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

  const startScanAnimation = (area: string) => {
    // Subtle pulse for current body area focus
    scanOpacity.value = withTiming(0.75, { duration: 2000, easing: Easing.inOut(Easing.ease) });
  };

  const runBodyScanSequence = async () => {
    try {
      // Step 1: Arrival
      setCurrentStep('arrival');
      startScanAnimation('arrival');
      const arrivalSound = await playAudioStep(systemVoiceAudio.exerciseBodyScan.arrival);
      await waitForAudioEnd(arrivalSound);
      await arrivalSound.unloadAsync();
      await wait(4000); // 4 second pause

      // Step 2: Grounding
      setCurrentStep('grounding');
      startScanAnimation('grounding');
      const groundingSound = await playAudioStep(systemVoiceAudio.exerciseBodyScan.grounding);
      await waitForAudioEnd(groundingSound);
      await groundingSound.unloadAsync();
      await wait(6000); // 6 second pause

      // Step 3: Feet
      setCurrentStep('feet');
      startScanAnimation('feet');
      const feetSound = await playAudioStep(systemVoiceAudio.exerciseBodyScan.feet);
      await waitForAudioEnd(feetSound);
      await feetSound.unloadAsync();
      await wait(10000); // 10 second hold

      // Step 4: Legs
      setCurrentStep('legs');
      startScanAnimation('legs');
      const legsSound = await playAudioStep(systemVoiceAudio.exerciseBodyScan.legs);
      await waitForAudioEnd(legsSound);
      await legsSound.unloadAsync();
      await wait(12000); // 12 second hold

      // Step 5: Pelvis
      setCurrentStep('pelvis');
      startScanAnimation('pelvis');
      const pelvisSound = await playAudioStep(systemVoiceAudio.exerciseBodyScan.pelvis);
      await waitForAudioEnd(pelvisSound);
      await pelvisSound.unloadAsync();
      await wait(12000); // 12 second hold

      // Step 6: Torso
      setCurrentStep('torso');
      startScanAnimation('torso');
      const torsoSound = await playAudioStep(systemVoiceAudio.exerciseBodyScan.torso);
      await waitForAudioEnd(torsoSound);
      await torsoSound.unloadAsync();
      await wait(15000); // 15 second hold

      // Step 7: Shoulders & Arms
      setCurrentStep('shoulders');
      startScanAnimation('shoulders');
      const shouldersSound = await playAudioStep(systemVoiceAudio.exerciseBodyScan.shouldersArms);
      await waitForAudioEnd(shouldersSound);
      await shouldersSound.unloadAsync();
      await wait(12000); // 12 second hold

      // Step 8: Neck & Face
      setCurrentStep('neck');
      startScanAnimation('neck');
      const neckSound = await playAudioStep(systemVoiceAudio.exerciseBodyScan.neckFace);
      await waitForAudioEnd(neckSound);
      await neckSound.unloadAsync();
      await wait(12000); // 12 second hold

      // Step 9: Whole Body
      setCurrentStep('whole');
      startScanAnimation('whole');
      const wholeSound = await playAudioStep(systemVoiceAudio.exerciseBodyScan.wholeBody);
      await waitForAudioEnd(wholeSound);
      await wholeSound.unloadAsync();
      await wait(30000); // 30 second integration hold

      // Step 10: Return & Close
      setCurrentStep('return');
      const returnSound = await playAudioStep(systemVoiceAudio.exerciseBodyScan.returnClose);
      await waitForAudioEnd(returnSound);
      await returnSound.unloadAsync();

      // Complete
      setCurrentStep('complete');
    } catch (error) {
      console.log('Body scan sequence failed, showing text fallback:', error);
      setAudioError(true);
      setCurrentStep('complete');
    }
  };

  const handleBegin = async () => {
    setHasStarted(true);
    await activateKeepAwakeAsync();
    // Track exercise start
    const tid = await trackExerciseStarted('Body Scan');
    setTrackingSessionId(tid);
    runBodyScanSequence();
  };

  const handleComplete = async () => {
    deactivateKeepAwake();
    
    // Track exercise completion
    if (trackingSessionId) {
      await trackExerciseCompleted('Body Scan', trackingSessionId);
    }
    
    if (!sessionId) return;
    
    try {
      await returnSessionStorage.updateExerciseSession(sessionId, {
        completed: true,
        completionAt: new Date().toISOString(),
      });
      
      // Only save return session if not in stack mode
      if (!isStackMode) {
        const roleId = await returnSessionStorage.getActiveRoleId();
        await returnSessionStorage.saveReturnSession({
          createdAt: new Date().toISOString(),
          roleId,
          source: 'release_return',
          completed: true,
          completionType: 'exercise',
          notes: 'Body Scan exercise completed',
        });
      }
      
      // If in stack mode, go back to play screen; otherwise go home
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

  const scanAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: scanOpacity.value,
    };
  });

  const getStepMessage = () => {
    if (audioError) {
      return 'Audio unavailable. Continue with silent body awareness.';
    }
    switch (currentStep) {
      case 'arrival':
        return 'Arriving';
      case 'grounding':
        return 'Grounding';
      case 'feet':
        return 'Feet';
      case 'legs':
        return 'Legs';
      case 'pelvis':
        return 'Pelvis & Hips';
      case 'torso':
        return 'Torso & Core';
      case 'shoulders':
        return 'Shoulders & Arms';
      case 'neck':
        return 'Neck & Face';
      case 'whole':
        return 'Whole Body';
      case 'return':
        return 'Returning';
      case 'complete':
        return 'Complete';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    if (audioError) return 'Scan your body with awareness';
    
    switch (currentStep) {
      case 'arrival':
        return 'Finding your position';
      case 'grounding':
        return 'Settling into the ground';
      case 'feet':
        return 'Noticing your foundation';
      case 'legs':
        return 'Awareness moving through legs';
      case 'pelvis':
        return 'Center of stability';
      case 'torso':
        return 'Your breathing space';
      case 'shoulders':
        return 'Release what you carry';
      case 'neck':
        return 'Expression and voice';
      case 'whole':
        return 'Integration and wholeness';
      case 'return':
        return 'This body is yours';
      default:
        return '';
    }
  };

  const getBodyIcon = (): string => {
    switch (currentStep) {
      case 'arrival':
      case 'grounding':
        return 'self-improvement';
      case 'feet':
      case 'legs':
        return 'directions-walk';
      case 'pelvis':
      case 'torso':
        return 'favorite';
      case 'shoulders':
        return 'accessibility';
      case 'neck':
        return 'face';
      case 'whole':
      case 'return':
        return 'spa';
      default:
        return 'self-improvement';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Body Scan</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.stepContainer}>
          {!hasStarted ? (
            <>
              <MaterialIcons name="self-improvement" size={64} color={colors.accent} style={{ marginBottom: spacing.xl }} />
              <Text style={styles.welcomeTitle}>Body Scan</Text>
              <Text style={styles.welcomeText}>
                Guided journey through your body to release character tension and return to yourself.
                {'\n\n'}
                Find a comfortable position—lying down or seated with support.
                {'\n\n'}
                The voice will guide you from feet to head, pausing at each area to allow awareness and release.
                {'\n\n'}
                No interaction needed—just listen, feel, and let go.
              </Text>
            </>
          ) : (
            <>
              <Animated.View style={[styles.bodyIcon, scanAnimatedStyle]}>
                <MaterialIcons 
                  name={getBodyIcon() as any} 
                  size={80} 
                  color={colors.primary} 
                />
              </Animated.View>
              <Text style={styles.stepMessage}>{getStepMessage()}</Text>
              <Text style={styles.stepDescription}>{getStepDescription()}</Text>
              {audioError && (
                <Text style={styles.fallbackText}>
                  Continue with natural body awareness
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
  bodyIcon: {
    marginBottom: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
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
