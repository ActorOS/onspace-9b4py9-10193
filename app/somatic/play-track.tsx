import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing, withSequence } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { somaticExitStorage, type SomaticTrackType, type SomaticScript } from '@/services/somaticExitStorage';
import { userSettingsStorage } from '@/services/userSettingsStorage';
import { systemVoiceAudio } from '@/constants/systemAudio';

export default function PlaySomaticTrackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const trackType = params.trackType as SomaticTrackType;
  const sessionId = params.sessionId as string | undefined;
  const roleId = params.roleId as string | undefined;

  const [track, setTrack] = useState(somaticExitStorage.getTrack(trackType));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [breathCycleCount, setBreathCycleCount] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'arrival' | 'settling' | 'breathing' | 'holding' | 'closing' | 'complete'>('arrival');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animated values for Pro experience
  const breathRingScale = useSharedValue(1);
  const breathRingOpacity = useSharedValue(0.3);
  const contentOpacity = useSharedValue(1);
  const ctaOpacity = useSharedValue(0);
  
  // Total duration for Breath Settling: approximately 120 seconds (2 minutes)
  const totalDuration = 120;

  useEffect(() => {
    if (!track) {
      router.back();
      return;
    }

    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      Speech.stop();
    };
  }, []);
  
  // Start progress tracking for Pro experience
  useEffect(() => {
    if (hasStarted && isPlaying && trackType === 'breath_settling') {
      progressIntervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [hasStarted, isPlaying, trackType]);

  const startPlayback = async () => {
    if (!track) return;
    
    setHasStarted(true);
    setStartTime(Date.now());
    setIsPlaying(true);
    setCurrentIndex(0);
    
    // Use voice-led sequence for Breath Settling
    if (trackType === 'breath_settling') {
      runBreathSettlingSequence();
    } else {
      playCurrentSegment(0);
    }
  };

  const playCurrentSegment = async (index: number) => {
    if (!track || index >= track.script.length) {
      // Playback complete
      handleComplete();
      return;
    }

    const segment = track.script[index];
    
    // Get user voice settings
    const settings = await userSettingsStorage.getSettings();
    const voiceParams = getVoiceParams(settings.voiceStyle);

    await Speech.speak(segment.text, {
      language: 'en-US',
      pitch: voiceParams.pitch,
      rate: voiceParams.rate * settings.voiceSpeed,
      volume: settings.voiceVolume / 100,
      onDone: () => {
        // Wait for pause duration, then play next
        timeoutRef.current = setTimeout(() => {
          setCurrentIndex(index + 1);
          playCurrentSegment(index + 1);
        }, segment.pauseAfterMs);
      },
    });
  };

  const getVoiceParams = (voiceStyle: string) => {
    switch (voiceStyle) {
      case 'warmFemale':
        return { pitch: 1.1, rate: 0.75 };
      case 'warmMale':
        return { pitch: 0.85, rate: 0.75 };
      case 'neutral':
      default:
        return { pitch: 1.0, rate: 0.8 };
    }
  };

  // Voice-led Breath Settling sequence
  const playAudioStep = async (url: string) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, volume: 0.85 },
        null, // Don't set status update here, we'll do it in waitForAudioEnd
        false // Don't download first
      );
      
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
      breathRingScale.value = withTiming(1.4, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      breathRingOpacity.value = withTiming(0.6, { duration: 4000 });
    } else if (type === 'exhale') {
      breathRingScale.value = withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) });
      breathRingOpacity.value = withTiming(0.2, { duration: 6000 });
    } else {
      breathRingScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      breathRingOpacity.value = withTiming(0.25, { duration: 2000 });
    }
  };
  
  const fadeContent = (visible: boolean) => {
    contentOpacity.value = withTiming(visible ? 1 : 0.2, { duration: 1500, easing: Easing.ease });
  };
  
  const showCompletionCTA = () => {
    ctaOpacity.value = withTiming(1, { duration: 2000, easing: Easing.ease });
  };

  const runBreathSettlingSequence = async () => {
    try {
      fadeContent(false); // Minimize distractions during audio
      
      // Step 1: Arrival
      setCurrentPhase('arrival');
      startBreathAnimation('neutral');
      const arrivalSound = await playAudioStep(systemVoiceAudio.breathSettling.arrival);
      await waitForAudioEnd(arrivalSound);
      await arrivalSound.unloadAsync();
      await wait(4000); // 4 second pause

      // Step 2: Settling
      setCurrentPhase('settling');
      const settlingSound = await playAudioStep(systemVoiceAudio.breathSettling.settling);
      await waitForAudioEnd(settlingSound);
      await settlingSound.unloadAsync();
      await wait(6000); // 6 second pause

      // Steps 3-4: Breath cycles (3 times)
      setCurrentPhase('breathing');
      for (let i = 0; i < 3; i++) {
        setBreathCycleCount(i + 1);
        
        // Inhale
        startBreathAnimation('inhale');
        const inhaleSound = await playAudioStep(systemVoiceAudio.breathSettling.inhale);
        await waitForAudioEnd(inhaleSound);
        await inhaleSound.unloadAsync();
        await wait(4000); // 4 second hold

        // Exhale
        startBreathAnimation('exhale');
        const exhaleSound = await playAudioStep(systemVoiceAudio.breathSettling.exhale);
        await waitForAudioEnd(exhaleSound);
        await exhaleSound.unloadAsync();
        await wait(6000); // 6 second hold
      }

      // Step 5: Hold
      setCurrentPhase('holding');
      startBreathAnimation('neutral');
      const holdSound = await playAudioStep(systemVoiceAudio.breathSettling.hold);
      await waitForAudioEnd(holdSound);
      await holdSound.unloadAsync();
      await wait(20000); // 20 second hold

      // Step 6: Close
      setCurrentPhase('closing');
      const closeSound = await playAudioStep(systemVoiceAudio.breathSettling.close);
      await waitForAudioEnd(closeSound);
      await closeSound.unloadAsync();
      
      // Final pause before showing completion
      await wait(2000); // 2 second pause to let final audio settle

      // Complete - only after all audio and silence has finished
      setCurrentPhase('complete');
      setIsPlaying(false);
      fadeContent(true);
      showCompletionCTA();
    } catch (error) {
      console.log('Breath settling sequence failed, showing text fallback:', error);
      setAudioError(true);
      setCurrentPhase('complete');
      setIsPlaying(false);
      fadeContent(true);
      showCompletionCTA();
    }
  };

  const handleExit = async () => {
    Speech.stop();
    if (soundRef.current) {
      soundRef.current.stopAsync();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (hasStarted && isPlaying) {
      // Log incomplete usage if playback was started
      const durationSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      await somaticExitStorage.logTrackUse({
        sessionId,
        roleId,
        trackType,
        completed: false,
        durationSeconds,
      });
    }

    router.back();
  };

  const handleComplete = async () => {
    setIsPlaying(false);
    
    // Log completed usage
    const durationSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : track?.durationSeconds || 0;
    await somaticExitStorage.logTrackUse({
      sessionId,
      roleId,
      trackType,
      completed: true,
      durationSeconds,
    });

    // Auto-proceed to grounding screen
    router.replace('/grounding');
  };

  // Animated styles for Pro experience
  const breathRingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathRingScale.value }],
      opacity: breathRingOpacity.value,
    };
  });
  
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });
  
  const ctaAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: ctaOpacity.value,
    };
  });
  
  if (!track) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // For Breath Settling Pro: time-based progress instead of step-based
  const progress = trackType === 'breath_settling' 
    ? Math.min((elapsedSeconds / totalDuration) * 100, 100)
    : track.script.length > 0 ? (currentIndex / track.script.length) * 100 : 0;
  const currentSegment = track.script[currentIndex];
  
  // Pro version: minimal phase text (single quiet words)
  const getProPhaseText = () => {
    if (audioError) return '';
    
    switch (currentPhase) {
      case 'arrival': return 'Arriving';
      case 'settling': return 'Settling';
      case 'breathing': return 'Breathing';
      case 'holding': return 'Holding';
      case 'closing': return 'Closing';
      case 'complete': return '';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.exitButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{track.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {trackType === 'breath_settling' && hasStarted ? (
          // Pro Voice-Led Experience: Minimal UI with breathing anchor
          <View style={styles.proExperienceContainer}>
            {/* Subtle time-based progress */}
            <View style={styles.proProgressContainer}>
              <View style={styles.proProgressBar}>
                <View style={[styles.proProgressFill, { width: `${progress}%` }]} />
              </View>
            </View>
            
            {/* Breathing Ring Visual Anchor */}
            <View style={styles.breathAnchorContainer}>
              <Animated.View style={[styles.breathRing, breathRingStyle]} />
            </View>
            
            {/* Minimal Phase Text - Fades during audio */}
            {currentPhase !== 'complete' && (
              <Animated.View style={[styles.phaseTextContainer, contentAnimatedStyle]}>
                <Text style={styles.proPhaseText}>{getProPhaseText()}</Text>
              </Animated.View>
            )}
            
            {/* Completion CTA - Fades in only at end */}
            {currentPhase === 'complete' && (
              <Animated.View style={[styles.proCompletionContainer, ctaAnimatedStyle]}>
                <Text style={styles.proCompletionText}>Complete</Text>
              </Animated.View>
            )}
          </View>
        ) : trackType !== 'breath_settling' && hasStarted ? (
          // Free version: Standard step-based UI
          <>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentIndex + 1} of {track.script.length}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.currentText}>
                {currentSegment ? currentSegment.text : 'Complete'}
              </Text>
            </View>
            <View style={styles.instructionsCard}>
              <MaterialIcons name="info-outline" size={20} color={colors.accent} />
              <Text style={styles.instructionsText}>
                Allow your body to settle. Notice without judgment. Let the work pass through.
              </Text>
            </View>
          </>
        ) : (
          // Welcome screen (both versions)
          <View style={styles.welcomeContainer}>
            <MaterialIcons name="spa" size={64} color={colors.primary} style={{ marginBottom: spacing.xl }} />
            <Text style={styles.welcomeTitle}>{track.title}</Text>
            {trackType === 'breath_settling' && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
            <Text style={styles.welcomeText}>
              {trackType === 'breath_settling' 
                ? "A 2-minute voice-led settling practice.\n\nFind a comfortable position. You may close your eyes once you begin.\n\nThe voice will guide you—no interaction needed."
                : `A ${Math.ceil(track.durationSeconds / 60)}-minute body-focused cool-down track.\n\nFind a comfortable position—seated or lying down.\n\nOnce you begin, you can close your eyes and follow the voice guidance through gentle release.`
              }
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      {!hasStarted ? (
        <View style={styles.footer}>
          <Pressable style={styles.beginButton} onPress={startPlayback}>
            <Text style={styles.beginButtonText}>Begin</Text>
            <MaterialIcons name="play-arrow" size={24} color={colors.background} />
          </Pressable>
        </View>
      ) : trackType === 'breath_settling' && currentPhase === 'complete' ? (
        <Animated.View style={[styles.footer, ctaAnimatedStyle]}>
          <Pressable 
            style={styles.completeButton} 
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>I Have Returned</Text>
          </Pressable>
        </Animated.View>
      ) : null}
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
  exitButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  
  // Pro Voice-Led Experience Styles
  proExperienceContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
  },
  proProgressBar: {
    height: 2,
    backgroundColor: colors.border + '40', // Very subtle
    borderRadius: 1,
    overflow: 'hidden',
  },
  proProgressFill: {
    height: '100%',
    backgroundColor: colors.primary + '60', // Soft, not distracting
  },
  breathAnchorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl * 3,
  },
  breathRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.primary + '50',
    backgroundColor: colors.primary + '10',
  },
  phaseTextContainer: {
    position: 'absolute',
    bottom: spacing.xl * 4,
  },
  proPhaseText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  proCompletionContainer: {
    alignItems: 'center',
  },
  proCompletionText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  
  // Free Version (Standard) Styles
  progressContainer: {
    marginBottom: spacing.xxl,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  textContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  welcomeTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  proBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  proBadgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.bold,
    color: colors.background,
    letterSpacing: 1.5,
  },
  welcomeText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.xl,
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.xl,
  },
  instructionsText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    minHeight: 90,
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
  completeButton: {
    alignItems: 'center',
    justifyContent: 'center',
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
