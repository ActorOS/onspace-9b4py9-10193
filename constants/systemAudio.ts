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
    arrival: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing.1/breathing_01_arrival.mp3',
    settle: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing.1/breathing_02_settle.mp3',
    inhale4: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing.1/breathing_03_exhale_4.mp3',
    exhale6: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing.1/breathing_04_exhale_6.mp3',
    repeatCue: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing.1/breathing_05_repeat_cue.mp3',
    repeatExhaleCue: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing.1/breaathing_06_repeat_exhale_cue.mp3',
    quietHold: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing.1/breathing_07_quiet_hold.mp3',
    returnClose: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breathing.1/breathing_08_return_close.mp3',
  },
} as const;

export type SystemAudioKey = keyof typeof systemVoiceAudio;
