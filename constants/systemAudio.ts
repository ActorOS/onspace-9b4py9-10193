/**
 * System Voice Audio URLs
 * 
 * Centralized source of truth for all system-narrated audio files.
 * These are pre-recorded voice tracks for onboarding, tutorials, and system guidance.
 */

export const systemVoiceAudio = {
  /**
   * Onboarding welcome message
   * Played when user first enters Actor OS
   */
  onboardingIntro: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/onboarding_welcome_v1.mp3',

  /**
   * Exercise Audio Tracks
   * Voice-guided exercises for Return to Self flow
   */
  exerciseBreathing: {
    arrival: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing/breathing_01_breath.mp3',
    inhale: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing/breathing_02_inhale.mp3',
    exhale: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing/breathing_03_exhale.mp3',
    return: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing/breathing_04_return.mp3',
  },
} as const;

export type SystemAudioKey = keyof typeof systemVoiceAudio;
