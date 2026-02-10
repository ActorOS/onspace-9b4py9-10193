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

  /**
   * Body Scan Exercise
   * 10-step voice-guided body scan from feet to head
   */
  exerciseBodyScan: {
    arrival: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/body-scan/bodyscan_01_arrival.mp3',
    grounding: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/body-scan/bodyscan_02_grounding.mp3',
    feet: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/body-scan/bodyscan_03_feet.mp3',
    legs: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/body-scan/bodyscan_04_legs.mp3',
    pelvis: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/body-scan/bodyscan_05_pelvis.mp3',
    torso: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/body-scan/bodyscan_06_torso.mp3',
    shouldersArms: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/body-scan/bodyscan_07_shoulders_arms.mp3',
    neckFace: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/body-scan/bodyscan_08_neck_face.mp3',
    wholeBody: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/body-scan/bodyscan_09_whole_body.mp3',
    returnClose: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/body-scan/bodyscan_10_return_close.mp3',
  },

  /**
   * Identity Separation Exercise
   * 9-step voice-guided process for separating self from role
   */
  exerciseIdentity: {
    arrival: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation/identity_01_arrival.mp3',
    nameSelf: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation/identity_02_name_self.mp3',
    acknowledgeRole: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation/idneity_03_ackowledge_role.mp3',
    locateBoundary: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation/identity_04_locate_boundary.mp3',
    separate: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation/identity_05_seperate.mp3',
    returnToSelf: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation/identity_06_return_to_self.mp3',
    releaseResponsibility: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation/identity_07_release_responsibility.mp3',
    groundSelf: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation/identity_08_ground_self.mp3',
    close: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation/identity_09_close.mp3',
  },

  /**
   * Identity Separation Light (4-step condensed version)
   * Quick separation process for light workload sessions
   */
  exerciseIdentityLight: {
    arrival: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-light/identity_light_01_arrival.mp3',
    nameSelf: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-light/identity_light_02_name_self.mp3',
    separate: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-light/identity_light_03_separate.mp3',
    close: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-light/identity_light_04_close.mp3',
  },

  /**
   * Breath Settling (Somatic Track)
   * 6-step time-governed breathing exercise for light workload sessions
   */
  breathSettling: {
    arrival: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breath-settling/breath_01_arrival.mp3',
    settling: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breath-settling/breath_02_settling.mp3',
    inhale: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breath-settling/breath_03_inhale.mp3',
    exhale: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breath-settling/breath_04_exhale.mp3',
    hold: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breath-settling/breath_05_hold.mp3',
    close: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/breath-settling/breath_06_close.mp3',
  },

  /**
   * Gentle Grounding Exercise
   * 7-step time-governed sensory grounding using 5-4-3-2-1 framework
   */
  exerciseGrounding: {
    arrive: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/gentle-grounding/grounding_01_arrive.mp3',
    contact: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/gentle-grounding/grounding_02_contact.mp3',
    see3: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/gentle-grounding/grounding_03_see.mp3',
    hear2: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/gentle-grounding/grounding_04_hear.mp3',
    feel1: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/gentle-grounding/grounding_05_feel.mp3',
    widen: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/gentle-grounding/grounding_06_widen.mp3',
    close: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/gentle-grounding/grounding_07_close.mp3',
  },
} as const;

export type SystemAudioKey = keyof typeof systemVoiceAudio;
