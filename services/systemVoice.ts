/**
 * System Voice Configuration
 * 
 * SINGLE SOURCE OF TRUTH for all voice audio in Actor OS.
 * 
 * All audio files are pre-recorded professional voice tracks hosted on Supabase.
 * NO text-to-speech (TTS) should be used anywhere in the app.
 * 
 * Usage:
 * - Import SystemVoice from '@/services/systemVoice'
 * - Use SystemVoice.onboarding.intro, SystemVoice.exercises.breathingIntro, etc.
 * - Play with expo-av Audio.Sound.createAsync()
 */

const SUPABASE_STORAGE_BASE = 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System';

export const SystemVoice = {
  /**
   * ONBOARDING & ENTRY
   */
  onboarding: {
    intro: `${SUPABASE_STORAGE_BASE}/system/onboarding_welcome_v1.mp3`,
  },

  /**
   * CHECK-IN FLOW
   */
  checkIn: {
    enterWorkIntention: `${SUPABASE_STORAGE_BASE}/check-in/enter_work_intention.mp3`,
    loadCheckIntro: `${SUPABASE_STORAGE_BASE}/check-in/load_check_intro.mp3`,
    lightCareGuidance: `${SUPABASE_STORAGE_BASE}/check-in/light_care_guidance.mp3`,
    mediumCareGuidance: `${SUPABASE_STORAGE_BASE}/check-in/medium_care_guidance.mp3`,
    heavyContainmentGuidance: `${SUPABASE_STORAGE_BASE}/check-in/heavy_containment_guidance.mp3`,
  },

  /**
   * RETURN TO SELF EXERCISES
   */
  exercises: {
    // Breathing & Release
    breathingIntro: `${SUPABASE_STORAGE_BASE}/exercises/breathing_intro.mp3`,
    breathingStepIn: `${SUPABASE_STORAGE_BASE}/exercises/breathing_in.mp3`,
    breathingStepHold: `${SUPABASE_STORAGE_BASE}/exercises/breathing_hold.mp3`,
    breathingStepOut: `${SUPABASE_STORAGE_BASE}/exercises/breathing_out.mp3`,
    breathingComplete: `${SUPABASE_STORAGE_BASE}/exercises/breathing_complete.mp3`,

    // Body Scan
    bodyScanIntro: `${SUPABASE_STORAGE_BASE}/exercises/body_scan_intro.mp3`,
    bodyScanFeet: `${SUPABASE_STORAGE_BASE}/exercises/body_scan_feet.mp3`,
    bodyScanLegs: `${SUPABASE_STORAGE_BASE}/exercises/body_scan_legs.mp3`,
    bodyScanTorso: `${SUPABASE_STORAGE_BASE}/exercises/body_scan_torso.mp3`,
    bodyScanShoulders: `${SUPABASE_STORAGE_BASE}/exercises/body_scan_shoulders.mp3`,
    bodyScanArms: `${SUPABASE_STORAGE_BASE}/exercises/body_scan_arms.mp3`,
    bodyScanNeck: `${SUPABASE_STORAGE_BASE}/exercises/body_scan_neck.mp3`,
    bodyScanHead: `${SUPABASE_STORAGE_BASE}/exercises/body_scan_head.mp3`,
    bodyScanRelease: `${SUPABASE_STORAGE_BASE}/exercises/body_scan_release.mp3`,
    bodyScanComplete: `${SUPABASE_STORAGE_BASE}/exercises/body_scan_complete.mp3`,

    // Identity Separation
    identityIntro: `${SUPABASE_STORAGE_BASE}/exercises/identity_intro.mp3`,
    identityReflection: `${SUPABASE_STORAGE_BASE}/exercises/identity_reflection.mp3`,
    identityAffirmation: `${SUPABASE_STORAGE_BASE}/exercises/identity_affirmation.mp3`,
    identityComplete: `${SUPABASE_STORAGE_BASE}/exercises/identity_complete.mp3`,
  },

  /**
   * SOMATIC EXIT TRACKS
   * 
   * Full voice-led cool-down tracks organized by workload intensity.
   * Each track is a complete multi-minute experience.
   */
  somaticTracks: {
    // Light Workload
    gentleGrounding: `${SUPABASE_STORAGE_BASE}/somatic/gentle_grounding_full.mp3`,
    shortBodyRelease: `${SUPABASE_STORAGE_BASE}/somatic/short_body_release_full.mp3`,
    breathSettling: `${SUPABASE_STORAGE_BASE}/somatic/breath_settling_full.mp3`,

    // Medium Workload
    fullBodyRelease: `${SUPABASE_STORAGE_BASE}/somatic/full_body_release_full.mp3`,
    tensionDischarge: `${SUPABASE_STORAGE_BASE}/somatic/tension_discharge_full.mp3`,
    guidedStillness: `${SUPABASE_STORAGE_BASE}/somatic/guided_stillness_full.mp3`,

    // Heavy Workload
    deepSomaticRelease: `${SUPABASE_STORAGE_BASE}/somatic/deep_somatic_release_full.mp3`,
    extendedGrounding: `${SUPABASE_STORAGE_BASE}/somatic/extended_grounding_full.mp3`,
    nervousSystemRegulation: `${SUPABASE_STORAGE_BASE}/somatic/nervous_system_regulation_full.mp3`,
  },

  /**
   * GROUNDING & SAFETY
   */
  grounding: {
    returnConfirmation: `${SUPABASE_STORAGE_BASE}/grounding/return_confirmation.mp3`,
    safetyReminder: `${SUPABASE_STORAGE_BASE}/grounding/safety_reminder.mp3`,
  },
} as const;

/**
 * Type-safe keys for all voice audio categories
 */
export type SystemVoiceCategory = keyof typeof SystemVoice;
export type OnboardingVoiceKey = keyof typeof SystemVoice.onboarding;
export type CheckInVoiceKey = keyof typeof SystemVoice.checkIn;
export type ExerciseVoiceKey = keyof typeof SystemVoice.exercises;
export type SomaticTrackVoiceKey = keyof typeof SystemVoice.somaticTracks;
export type GroundingVoiceKey = keyof typeof SystemVoice.grounding;

/**
 * Helper function to validate voice URL exists
 */
export function getVoiceUrl(category: SystemVoiceCategory, key: string): string | null {
  const categoryObj = SystemVoice[category] as Record<string, string>;
  return categoryObj[key] || null;
}

/**
 * ⚠️ IMPORTANT IMPLEMENTATION NOTES:
 * 
 * 1. ALL voice content must use pre-recorded audio from this configuration
 * 2. NEVER use expo-speech or any TTS library for voice guidance
 * 3. Use expo-av's Audio.Sound for playback
 * 4. Gracefully handle audio failures (log and continue, don't crash)
 * 5. Clean up audio on component unmount
 * 6. Respect user voice settings (volume, enabled/disabled)
 * 
 * Example usage:
 * 
 * ```typescript
 * import { Audio } from 'expo-av';
 * import { SystemVoice } from '@/services/systemVoice';
 * 
 * const playOnboardingIntro = async () => {
 *   try {
 *     const { sound } = await Audio.Sound.createAsync(
 *       { uri: SystemVoice.onboarding.intro },
 *       { shouldPlay: true, volume: 0.8 }
 *     );
 *     // Store sound reference for cleanup
 *   } catch (error) {
 *     console.log('Audio playback failed:', error);
 *     // Continue without audio
 *   }
 * };
 * ```
 */
