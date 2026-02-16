import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { returnSessionStorage } from '@/services/returnSessionStorage';
import { systemVoiceAudio } from '@/constants/systemAudio';
import { tierStorage } from '@/services/tierStorage';
import { UpgradePrompt } from '@/components';

// Identity Separation Full Release - 16-step comprehensive version
// Deep separation process for medium/heavy workload sessions - ~12 minutes
// Fully hands-free once started

type IdentityFullStep = 
  | 'arrival' 
  | 'noticeRole' 
  | 'locate' 
  | 'name' 
  | 'boundary' 
  | 'releaseEffort' 
  | 'discharge' 
  | 'allowShake' 
  | 'breathResettle' 
  | 'returnBreath' 
  | 'reclaimName' 
  | 'reclaimPosture' 
  | 'reclaimSpace' 
  | 'boundaryReclaim' 
  | 'reintegration' 
  | 'close' 
  | 'complete';

export default function IdentitySeparationFullScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isStackMode = params.stackMode === 'true';
  const [isPro, setIsPro] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<IdentityFullStep>('arrival');
  const [audioError, setAudioError] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const waveOpacity = useSharedValue(0.4);

  useEffect(() => {
    const checkAccessAndInit = async () => {
      try {
        // Check Pro status first
        const tier = await tierStorage.getTier();
        const isProUser = tier === 'pro';
        setIsPro(isProUser);
        
        if (!isProUser) {
          setIsCheckingAccess(false);
          setShowUpgradePrompt(true);
          return;
        }
        
        // Initialize session for Pro users
        const roleId = await returnSessionStorage.getActiveRoleId();
        const session = await returnSessionStorage.saveExerciseSession({
          createdAt: new Date().toISOString(),
          roleId,
          exerciseType: 'identity_separation_full',
          durationMinutes: 12,
          completed: false,
        });
        setSessionId(session.id);
        setIsCheckingAccess(false);
      } catch (error) {
        console.error('Failed to check access or start exercise:', error);
        setIsCheckingAccess(false);
      }
    };
    checkAccessAndInit();

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

  const runFullIdentitySequence = async () => {
    try {
      // Step 1: Arrival
      setCurrentStep('arrival');
      startWaveAnimation();
      const arrivalSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.arrival);
      await waitForAudioEnd(arrivalSound);
      await arrivalSound.unloadAsync();
      await wait(6000);

      // Step 2: Notice Role
      setCurrentStep('noticeRole');
      startWaveAnimation();
      const noticeRoleSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.noticeRole);
      await waitForAudioEnd(noticeRoleSound);
      await noticeRoleSound.unloadAsync();
      await wait(8000);

      // Step 3: Locate
      setCurrentStep('locate');
      startWaveAnimation();
      const locateSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.locate);
      await waitForAudioEnd(locateSound);
      await locateSound.unloadAsync();
      await wait(10000);

      // Step 4: Name
      setCurrentStep('name');
      startWaveAnimation();
      const nameSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.name);
      await waitForAudioEnd(nameSound);
      await nameSound.unloadAsync();
      await wait(8000);

      // Step 5: Boundary
      setCurrentStep('boundary');
      startWaveAnimation();
      const boundarySound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.boundary);
      await waitForAudioEnd(boundarySound);
      await boundarySound.unloadAsync();
      await wait(10000);

      // Step 6: Release Effort
      setCurrentStep('releaseEffort');
      startWaveAnimation();
      const releaseEffortSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.releaseEffort);
      await waitForAudioEnd(releaseEffortSound);
      await releaseEffortSound.unloadAsync();
      await wait(10000);

      // Step 7: Discharge
      setCurrentStep('discharge');
      startWaveAnimation();
      const dischargeSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.discharge);
      await waitForAudioEnd(dischargeSound);
      await dischargeSound.unloadAsync();
      await wait(12000);

      // Step 8: Allow Shake/Tremor
      setCurrentStep('allowShake');
      startWaveAnimation();
      const allowShakeSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.allowShake);
      await waitForAudioEnd(allowShakeSound);
      await allowShakeSound.unloadAsync();
      await wait(20000);

      // Step 9: Breath Resettle
      setCurrentStep('breathResettle');
      startWaveAnimation();
      const breathResettleSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.breathResettle);
      await waitForAudioEnd(breathResettleSound);
      await breathResettleSound.unloadAsync();
      await wait(15000);

      // Step 10: Return Breath
      setCurrentStep('returnBreath');
      startWaveAnimation();
      const returnBreathSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.returnBreath);
      await waitForAudioEnd(returnBreathSound);
      await returnBreathSound.unloadAsync();
      await wait(12000);

      // Step 11: Reclaim Name
      setCurrentStep('reclaimName');
      startWaveAnimation();
      const reclaimNameSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.reclaimName);
      await waitForAudioEnd(reclaimNameSound);
      await reclaimNameSound.unloadAsync();
      await wait(10000);

      // Step 12: Reclaim Posture
      setCurrentStep('reclaimPosture');
      startWaveAnimation();
      const reclaimPostureSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.reclaimPosture);
      await waitForAudioEnd(reclaimPostureSound);
      await reclaimPostureSound.unloadAsync();
      await wait(10000);

      // Step 13: Reclaim Space
      setCurrentStep('reclaimSpace');
      startWaveAnimation();
      const reclaimSpaceSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.reclaimSpace);
      await waitForAudioEnd(reclaimSpaceSound);
      await reclaimSpaceSound.unloadAsync();
      await wait(12000);

      // Step 14: Boundary Reclaim
      setCurrentStep('boundaryReclaim');
      startWaveAnimation();
      const boundaryReclaimSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.boundaryReclaim);
      await waitForAudioEnd(boundaryReclaimSound);
      await boundaryReclaimSound.unloadAsync();
      await wait(12000);

      // Step 15: Reintegration
      setCurrentStep('reintegration');
      startWaveAnimation();
      const reintegrationSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.reintegration);
      await waitForAudioEnd(reintegrationSound);
      await reintegrationSound.unloadAsync();
      await wait(15000);

      // Step 16: Close
      setCurrentStep('close');
      startWaveAnimation();
      const closeSound = await playAudioStep(systemVoiceAudio.exerciseIdentityFull.close);
      await waitForAudioEnd(closeSound);
      await closeSound.unloadAsync();

      // Complete
      setCurrentStep('complete');
    } catch (error) {
      console.log('Full identity sequence failed, showing text fallback:', error);
      setAudioError(true);
      setCurrentStep('complete');
    }
  };

  const handleBegin = () => {
    setHasStarted(true);
    runFullIdentitySequence();
  };

  const handleComplete = async () => {
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
          notes: 'Identity Separation (Full Release) exercise completed',
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
    if (soundRef.current) {
      soundRef.current.stopAsync();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!isPro) {
      router.back();
      return;
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

  const handleUpgradeClose = () => {
    setShowUpgradePrompt(false);
    router.back();
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
      case 'noticeRole':
        return 'Notice the Role';
      case 'locate':
        return 'Locate';
      case 'name':
        return 'Your Name';
      case 'boundary':
        return 'The Boundary';
      case 'releaseEffort':
        return 'Release Effort';
      case 'discharge':
        return 'Discharge';
      case 'allowShake':
        return 'Allow Tremor';
      case 'breathResettle':
        return 'Breath Resettle';
      case 'returnBreath':
        return 'Return to Breath';
      case 'reclaimName':
        return 'Reclaim Your Name';
      case 'reclaimPosture':
        return 'Reclaim Your Posture';
      case 'reclaimSpace':
        return 'Reclaim Your Space';
      case 'boundaryReclaim':
        return 'Reclaim Boundary';
      case 'reintegration':
        return 'Reintegration';
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
      return 'Continue with awareness of the separation between role and self. You are distinct. You are here.';
    }
    
    switch (currentStep) {
      case 'arrival':
        return 'Taking your position';
      case 'noticeRole':
        return 'Acknowledge what you carried';
      case 'locate':
        return 'Where is the role held?';
      case 'name':
        return 'Who you are';
      case 'boundary':
        return 'Where you end and the role begins';
      case 'releaseEffort':
        return 'Let go of holding';
      case 'discharge':
        return 'Allow what needs to leave';
      case 'allowShake':
        return 'Shake, tremble, or discharge as needed';
      case 'breathResettle':
        return 'Let your breath find its natural rhythm';
      case 'returnBreath':
        return 'Come back to your own rhythm';
      case 'reclaimName':
        return 'Your identity is yours';
      case 'reclaimPosture':
        return 'Your body is yours';
      case 'reclaimSpace':
        return 'You occupy your own presence';
      case 'boundaryReclaim':
        return 'Reclaim what is yours, release what is not';
      case 'reintegration':
        return 'Whole and complete in yourself';
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
      case 'noticeRole':
      case 'locate':
        return 'visibility';
      case 'name':
        return 'psychology';
      case 'boundary':
        return 'border-clear';
      case 'releaseEffort':
      case 'discharge':
      case 'allowShake':
        return 'trending-down';
      case 'breathResettle':
      case 'returnBreath':
        return 'air';
      case 'boundaryReclaim':
        return 'border-clear';
      case 'reintegration':
        return 'check-circle';
      case 'reclaimName':
      case 'reclaimPosture':
      case 'reclaimSpace':
        return 'person-pin';
      case 'close':
        return 'check-circle';
      default:
        return 'psychology';
    }
  };

  // Show upgrade prompt if not Pro
  if (!isPro && !isCheckingAccess) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleExit} style={styles.headerButton}>
            <MaterialIcons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Full Release</Text>
          <View style={styles.headerButton} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.stepContainer}>
            <MaterialIcons name="lock" size={64} color={colors.textSecondary} style={{ marginBottom: spacing.xl }} />
            <Text style={styles.welcomeTitle}>PRO Feature</Text>
            <Text style={styles.welcomeText}>
              Identity Separation — Full Release is a PRO-only exercise.
              {"\n\n"}
              Upgrade to unlock the complete separation process with deep discharge and reintegration.
            </Text>
          </View>
        </View>
        
        <UpgradePrompt
          visible={showUpgradePrompt}
          onClose={handleUpgradeClose}
          feature="Identity Separation (Full Release)"
          description="Pro unlocks the complete 12-minute Identity Separation exercise with deep discharge and reintegration steps for demanding emotional work."
        />
      </SafeAreaView>
    );
  }
  
  // Show loading state while checking
  if (isCheckingAccess) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.stepContainer}>
            <Text style={styles.stepMessage}>Checking access...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Full Release</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.stepContainer}>
          {!hasStarted ? (
            <>
              <MaterialIcons name="psychology" size={64} color={colors.textPrimary} style={{ marginBottom: spacing.xl }} />
              <Text style={styles.welcomeTitle}>Identity Separation</Text>
              <Text style={styles.subtitleText}>Full Release Version</Text>
              <Text style={styles.welcomeText}>
                Deep separation after immersive work.
                {'\n\n'}
                Find a comfortable position. You may close your eyes once you begin.
                {'\n\n'}
                Notice, locate, name, release, discharge, resettle, and reclaim.
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
