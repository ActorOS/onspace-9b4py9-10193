import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!track) {
      router.back();
      return;
    }

    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      Speech.stop();
    };
  }, []);

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

  const runBreathSettlingSequence = async () => {
    try {
      // Step 1: Arrival
      setCurrentIndex(0);
      const arrivalSound = await playAudioStep(systemVoiceAudio.breathSettling.arrival);
      await waitForAudioEnd(arrivalSound);
      await wait(4000); // 4 second pause

      // Step 2: Settling
      setCurrentIndex(1);
      const settlingSound = await playAudioStep(systemVoiceAudio.breathSettling.settling);
      await waitForAudioEnd(settlingSound);
      await wait(6000); // 6 second pause

      // Steps 3-4: Breath cycles (3 times)
      for (let i = 0; i < 3; i++) {
        setBreathCycleCount(i + 1);
        
        // Inhale
        setCurrentIndex(2);
        const inhaleSound = await playAudioStep(systemVoiceAudio.breathSettling.inhale);
        await waitForAudioEnd(inhaleSound);
        await wait(4000); // 4 second hold

        // Exhale
        setCurrentIndex(3);
        const exhaleSound = await playAudioStep(systemVoiceAudio.breathSettling.exhale);
        await waitForAudioEnd(exhaleSound);
        await wait(6000); // 6 second hold
      }

      // Step 5: Hold
      setCurrentIndex(4);
      const holdSound = await playAudioStep(systemVoiceAudio.breathSettling.hold);
      await waitForAudioEnd(holdSound);
      await wait(20000); // 20 second hold

      // Step 6: Close
      setCurrentIndex(5);
      const closeSound = await playAudioStep(systemVoiceAudio.breathSettling.close);
      await waitForAudioEnd(closeSound);

      // Complete
      handleComplete();
    } catch (error) {
      console.log('Breath settling sequence failed, showing text fallback:', error);
      setAudioError(true);
      handleComplete();
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

  if (!track) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // For Breath Settling, use fixed 6-step progression
  const totalSteps = trackType === 'breath_settling' ? 6 : track.script.length;
  const progress = totalSteps > 0 ? (currentIndex / totalSteps) * 100 : 0;
  const currentSegment = track.script[currentIndex];
  
  // Breath Settling fallback text
  const getBreathSettlingText = () => {
    if (audioError) {
      return ['Arrive and allow yourself to settle.', 'Let the breath soften.', 'Inhale gently.', 'Exhale slowly.', 'Allow the breath to find its own rhythm.', 'This exercise is complete.'][currentIndex] || '';
    }
    
    switch (currentIndex) {
      case 0: return 'Arriving';
      case 1: return 'Settling';
      case 2: return breathCycleCount > 0 ? `Inhale (${breathCycleCount}/3)` : 'Inhale';
      case 3: return breathCycleCount > 0 ? `Exhale (${breathCycleCount}/3)` : 'Exhale';
      case 4: return 'Holding';
      case 5: return 'Closing';
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
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {totalSteps}
          </Text>
        </View>

        {/* Current Text */}
        {hasStarted ? (
          <View style={styles.textContainer}>
            <Text style={styles.currentText}>
              {trackType === 'breath_settling' ? getBreathSettlingText() : (currentSegment ? currentSegment.text : 'Complete')}
            </Text>
          </View>
        ) : (
          <View style={styles.welcomeContainer}>
            <MaterialIcons name="spa" size={64} color={colors.primary} style={{ marginBottom: spacing.xl }} />
            <Text style={styles.welcomeTitle}>{track.title}</Text>
            <Text style={styles.welcomeText}>
              A {Math.ceil(track.durationSeconds / 60)}-minute body-focused cool-down track.
              {"\n\n"}
              Find a comfortable position—seated or lying down.
              {"\n\n"}
              Once you begin, you can close your eyes and follow the voice guidance through gentle release.
            </Text>
          </View>
        )}

        {/* Instructions */}
        {hasStarted && (
          <View style={styles.instructionsCard}>
            <MaterialIcons name="info-outline" size={20} color={colors.accent} />
            <Text style={styles.instructionsText}>
              Allow your body to settle. Notice without judgment. Let the work pass through.
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      {!hasStarted && (
        <View style={styles.footer}>
          <Pressable style={styles.beginButton} onPress={startPlayback}>
            <Text style={styles.beginButtonText}>Begin Track</Text>
            <MaterialIcons name="play-arrow" size={24} color={colors.background} />
          </Pressable>
        </View>
      )}
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
});
