import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { somaticExitStorage, type SomaticTrackType, type SomaticScript } from '@/services/somaticExitStorage';
import { userSettingsStorage } from '@/services/userSettingsStorage';

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      Speech.stop();
    };
  }, []);

  const startPlayback = async () => {
    if (!track) return;
    
    setHasStarted(true);
    setStartTime(Date.now());
    setIsPlaying(true);
    setCurrentIndex(0);
    playCurrentSegment(0);
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

  const handleExit = async () => {
    Speech.stop();
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

  const progress = track.script.length > 0 ? (currentIndex / track.script.length) * 100 : 0;
  const currentSegment = track.script[currentIndex];

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
            {currentIndex + 1} of {track.script.length}
          </Text>
        </View>

        {/* Current Text */}
        {hasStarted ? (
          <View style={styles.textContainer}>
            <Text style={styles.currentText}>
              {currentSegment ? currentSegment.text : 'Complete'}
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
