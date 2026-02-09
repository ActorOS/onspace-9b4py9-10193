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
  onboardingIntro: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/onboarding_welcome-v1.mp3',
} as const;

export type SystemAudioKey = keyof typeof systemVoiceAudio;
