import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { returnSessionStorage } from '@/services/returnSessionStorage';
import { userSettingsStorage } from '@/services/userSettingsStorage';
import { roleStorage } from '@/services/roleStorage';
import { sessionStorage } from '@/services/sessionStorage';

interface Step {
  type: 'intro' | 'reflection' | 'affirmation' | 'completion';
  title: string;
  instruction: string;
  voiceScript?: string;
  duration?: number;
  silence?: number; // seconds of silence after voice
}

const STEPS: Step[] = [
  {
    type: 'intro',
    title: 'Separation Begins Here',
    instruction: 'You are about to mark the boundary between yourself and the role.\n\nThis is a deliberate act of reclaiming your identity.',
    voiceScript: 'Mark the boundary. Reclaim your identity. We will begin.',
    duration: 5,
    silence: 3,
  },
  {
    type: 'reflection',
    title: 'What Is Yours?',
    instruction: 'Think of one thing that belongs to you, not the character.\n\nA memory, a person, a place, a feeling.\n\nStay with that for a moment.',
    voiceScript: 'What belongs to you? Stay with that.',
    duration: 8,
    silence: 8,
  },
  {
    type: 'affirmation',
    title: 'Speak the Truth',
    instruction: 'Listen, and repeat after me.',
    voiceScript: '',
    duration: 0,
  },
  {
    type: 'completion',
    title: 'I Am Myself',
    instruction: 'The separation is complete.\n\nYou are no longer carrying them.\nYou are here, as yourself.',
    voiceScript: 'You are no longer carrying them.',
  },
];

export default function IdentitySeparationScreen() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [userName, setUserName] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSettings, setVoiceSettings] = useState({ rate: 0.65, pitch: 0.9, volume: 0.75 });

  const waveOpacity = useSharedValue(0.4);
  const currentStep = STEPS[currentStepIndex];

  useEffect(() => {
    const initSession = async () => {
      try {
        // Load voice settings from user preferences
        const settings = await userSettingsStorage.getSettings();
        const pitch = settings.voiceStyle === 'warmMale' ? 0.8 : settings.voiceStyle === 'warmFemale' ? 1.0 : 0.9;
        setVoiceSettings({
          rate: settings.voiceSpeed * 0.65,
          pitch: pitch,
          volume: settings.voiceVolume / 100,
        });

        // Load character and user names
        const activeSession = await sessionStorage.getActiveSession();
        if (activeSession) {
          const role = await roleStorage.getRole(activeSession.roleId);
          if (role) {
            setCharacterName(role.characterName);
          }
        }
        // User name could come from settings if we add a profile
        // For now, we'll use a generic prompt

        const roleId = await returnSessionStorage.getActiveRoleId();
        const session = await returnSessionStorage.saveExerciseSession({
          createdAt: new Date().toISOString(),
          roleId,
          exerciseType: 'identity_separation',
          durationMinutes: 8,
          completed: false,
        });
        setSessionId(session.id);
      } catch (error) {
        console.error('Failed to start exercise:', error);
      }
    };
    initSession();

    // Gentle wave animation
    waveOpacity.value = withRepeat(
      withTiming(0.8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    return () => {
      Speech.stop();
      cancelAnimation(waveOpacity);
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    
    // Special handling for affirmation step
    if (currentStep.type === 'affirmation') {
      const affirmationScript = `I am ${userName || 'myself'}. I am not ${characterName}. I return to myself now.`;
      if (voiceEnabled) {
        setTimeout(() => {
          Speech.speak(affirmationScript, {
            rate: voiceSettings.rate * 0.85, // Slower for affirmation
            pitch: voiceSettings.pitch,
            volume: voiceSettings.volume,
            language: 'en-US',
            onDone: () => {
              // Auto-advance to completion after affirmation
              setTimeout(() => {
                if (currentStepIndex < STEPS.length - 1) {
                  setCurrentStepIndex(currentStepIndex + 1);
                }
              }, 2000);
            },
          });
        }, 500);
      }
      return;
    }
    
    // Play voice narration
    if (voiceEnabled && currentStep.voiceScript) {
      setTimeout(() => {
        Speech.speak(currentStep.voiceScript!, {
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
          language: 'en-US',
        });
      }, 300);
    }

    // Handle countdown and auto-advance
    if (currentStep.duration && currentStep.duration > 0) {
      setCountdown(currentStep.duration);

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            // Auto-advance after countdown
            setTimeout(() => {
              if (currentStepIndex < STEPS.length - 1) {
                setCurrentStepIndex(currentStepIndex + 1);
              }
            }, 500);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCountdown(null);
    }
  }, [currentStepIndex, voiceEnabled, hasStarted, characterName, userName]);

  const handleBegin = () => {
    setHasStarted(true);
    setCurrentStepIndex(0);
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
        notes: `Identity Separation: ${characterName} → ${userName}`,
      });
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete exercise:', error);
      Alert.alert('Error', 'Failed to complete exercise');
    }
  };

  const handleExit = () => {
    Speech.stop();
    Alert.alert(
      'Exit Exercise',
      'Are you sure you want to exit? Your progress will not be saved.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      Speech.stop();
    }
  };

  const getAffirmationText = () => {
    const user = userName || 'myself';
    const character = characterName || 'the character';
    return `I am ${user}.\n\nI am not ${character}.\n\nI return to myself now.`;
  };

  const waveAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: waveOpacity.value,
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Identity Separation</Text>
        <Pressable onPress={toggleVoice} style={styles.headerButton}>
          <MaterialIcons 
            name={voiceEnabled ? "volume-up" : "volume-off"} 
            size={24} 
            color={voiceEnabled ? colors.textPrimary : colors.textTertiary} 
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        {hasStarted && (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }
              ]} 
            />
          </View>
        )}

        <View style={styles.stepContainer}>
          {!hasStarted ? (
            <>
              <MaterialIcons name="psychology" size={64} color={colors.textPrimary} style={{ marginBottom: spacing.xl }} />
              <Text style={styles.welcomeTitle}>Identity Separation</Text>
              <Text style={styles.welcomeText}>
                An 8-minute guided exercise to distinguish self from character.
                {characterName ? `\n\nYou have been holding ${characterName}.` : ''}
                {userName ? `\n\nYou are ${userName}.` : ''}
                {!userName && '\n\nWhat is your name? (Think of it before you begin.)'}
                {characterName && '\n\nYou are about to separate.\n\nOnce you begin, you can close your eyes and follow the voice guidance.'}
              </Text>
            </>
          ) : (
            <>
              <Animated.View style={[styles.waveIndicator, waveAnimatedStyle]} />
              
              <Text style={styles.stepTitle}>
                {currentStep.title}
              </Text>

              {countdown !== null && countdown > 0 && (
                <View style={styles.countdownCircle}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </View>
              )}

              <Text style={styles.stepInstruction}>
                {currentStep.type === 'affirmation' ? getAffirmationText() : currentStep.instruction}
              </Text>
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
        ) : currentStep.type === 'completion' ? (
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
  progressBar: {
    height: 4,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveIndicator: {
    width: 80,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginBottom: spacing.xl,
  },
  stepTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    letterSpacing: typography.letterSpacing.title,
  },
  stepInstruction: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: spacing.lg,
  },
  countdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  countdownText: {
    fontSize: 36,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.primary,
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
