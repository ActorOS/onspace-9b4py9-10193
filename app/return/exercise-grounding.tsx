import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { returnSessionStorage } from '@/services/returnSessionStorage';
import { systemVoiceAudio } from '@/constants/systemAudio';

// Time-governed sensory grounding exercise
// 7-step voice-led flow using 3-2-1 sensory framework
// Strictly time-locked once started - no user interaction needed

const FALLBACK_TEXT = [
  'Take a moment to arrive.',
  'Feel the surface beneath you.',
  'Notice three things you can see.',
  'Notice two things you can hear.',
  'Notice one steady physical sensation.',
  'Let your attention widen.',
  'This exercise is complete.',
];

export default function GentleGroundingExerciseScreen() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = 7;

  useEffect(() => {
    const initSession = async () => {
      try {
        const roleId = await returnSessionStorage.getActiveRoleId();
        const session = await returnSessionStorage.saveExerciseSession({
          createdAt: new Date().toISOString(),
          roleId,
          exerciseType: 'gentle_grounding',
          durationMinutes: 6,
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
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const playAudioStep = async (url: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
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

  const runGroundingSequence = async () => {
    try {
      // Step 1: Arrive (5s pause)
      setCurrentStepIndex(0);
      const arriveSound = await playAudioStep(systemVoiceAudio.exerciseGrounding.arrive);
      await waitForAudioEnd(arriveSound);
      await arriveSound.unloadAsync();
      await wait(5000);

      // Step 2: Contact (8s pause)
      setCurrentStepIndex(1);
      const contactSound = await playAudioStep(systemVoiceAudio.exerciseGrounding.contact);
      await waitForAudioEnd(contactSound);
      await contactSound.unloadAsync();
      await wait(8000);

      // Step 3: See 3 things (25s pause)
      setCurrentStepIndex(2);
      const see3Sound = await playAudioStep(systemVoiceAudio.exerciseGrounding.see3);
      await waitForAudioEnd(see3Sound);
      await see3Sound.unloadAsync();
      await wait(25000);

      // Step 4: Hear 2 things (15s pause)
      setCurrentStepIndex(3);
      const hear2Sound = await playAudioStep(systemVoiceAudio.exerciseGrounding.hear2);
      await waitForAudioEnd(hear2Sound);
      await hear2Sound.unloadAsync();
      await wait(15000);

      // Step 5: Feel 1 thing (15s pause)
      setCurrentStepIndex(4);
      const feel1Sound = await playAudioStep(systemVoiceAudio.exerciseGrounding.feel1);
      await waitForAudioEnd(feel1Sound);
      await feel1Sound.unloadAsync();
      await wait(15000);

      // Step 6: Widen (10s pause)
      setCurrentStepIndex(5);
      const widenSound = await playAudioStep(systemVoiceAudio.exerciseGrounding.widen);
      await waitForAudioEnd(widenSound);
      await widenSound.unloadAsync();
      await wait(10000);

      // Step 7: Close (no pause - immediately complete)
      setCurrentStepIndex(6);
      const closeSound = await playAudioStep(systemVoiceAudio.exerciseGrounding.close);
      await waitForAudioEnd(closeSound);
      await closeSound.unloadAsync();

      // Complete
      setIsComplete(true);
    } catch (error) {
      console.log('Grounding sequence failed, showing text fallback:', error);
      setAudioError(true);
      setIsComplete(true);
    }
  };

  const handleBegin = () => {
    setHasStarted(true);
    runGroundingSequence();
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
        notes: 'Gentle Grounding exercise completed',
      });
      
      router.back();
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

  const getCurrentStepLabel = () => {
    if (!hasStarted) return '';
    if (isComplete) return 'Complete';
    
    const labels = ['Arriving', 'Contact', 'Notice (See)', 'Notice (Hear)', 'Notice (Feel)', 'Widening', 'Closing'];
    return labels[currentStepIndex] || '';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Gentle Grounding</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.stepContainer}>
          {!hasStarted ? (
            <>
              <MaterialIcons name="my-location" size={64} color={colors.primary} style={{ marginBottom: spacing.xl }} />
              <Text style={styles.welcomeTitle}>Gentle Grounding</Text>
              <Text style={styles.welcomeText}>
                A 6-minute sensory grounding exercise to return you to the present moment.
                {'\n\n'}
                Find a comfortable seated position. You may close your eyes once you begin.
                {'\n\n'}
                The voice will guide you through arrival, contact, and sensory noticing before widening your attention.
                {'\n\n'}
                No interaction needed—just listen and notice.
              </Text>
            </>
          ) : (
            <>
              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {isComplete ? 'Complete' : `Step ${currentStepIndex + 1} of ${totalSteps}`}
                </Text>
              </View>

              {/* Current Step Label */}
              <View style={styles.stepLabelContainer}>
                <MaterialIcons 
                  name={isComplete ? 'check-circle' : 'lens'} 
                  size={64} 
                  color={isComplete ? colors.success : colors.primary} 
                  style={{ marginBottom: spacing.lg }}
                />
                <Text style={styles.stepLabel}>{getCurrentStepLabel()}</Text>
                
                {audioError && (
                  <View style={styles.fallbackContainer}>
                    <Text style={styles.fallbackText}>{FALLBACK_TEXT[currentStepIndex]}</Text>
                  </View>
                )}
                
                {!isComplete && !audioError && (
                  <Text style={styles.holdingText}>Hold this space...</Text>
                )}
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        {!hasStarted ? (
          <Pressable style={styles.beginButton} onPress={handleBegin}>
            <Text style={styles.beginButtonText}>Begin</Text>
            <MaterialIcons name="play-arrow" size={24} color={colors.background} />
          </Pressable>
        ) : isComplete ? (
          <Pressable style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>I'm Grounded ✓</Text>
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
  progressContainer: {
    width: '100%',
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
    fontFamily: typography.fonts.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  stepLabelContainer: {
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  holdingText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  fallbackContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  fallbackText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
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
    backgroundColor: colors.success,
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
