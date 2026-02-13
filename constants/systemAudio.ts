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
    arrival: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation%20(light)/identity_light_01_arrival.mp3',
    nameSelf: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation%20(light)/identity_light_02_name_self.mp3',
    separate: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation%20(light)/identity_light_03_separate.mp3',
    close: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/identity-seperation%20(light)/identity_light_04_close.mp3',
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

  /**
   * Identity Separation Full Release (16-step comprehensive version)
   * Deep separation process for medium/heavy workload sessions - ~12 minutes
   */
  exerciseIdentityFull: {
    arrival: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_01_arrival.mp3',
    noticeRole: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_02_notice_role.mp3',
    locate: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_03_locate.mp3',
    name: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_04_name.mp3',
    boundary: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_05_boundary.mp3',
    releaseEffort: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_06_release_effort.mp3',
    discharge: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_07_discharge.mp3',
    allowShake: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_08_allow_shake.mp3',
    breathResettle: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_09_breath_resettle.mp3',
    returnBreath: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_10_return_breath.mp3',
    reclaimName: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_11_reclaim_name.mp3',
    reclaimPosture: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_12_reclaim_posture.mp3',
    reclaimSpace: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_13_reclaim_space.mp3',
    boundaryReclaim: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_14_boundary_reclaim.mp3',
    reintegration: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_15_reintegration.mp3',
    close: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/Identity%20seperation%20full/identity_full_16_close.mp3',
  },

  /**
   * Full Body Recovery Sequence
   * Comprehensive somatic release with guided breath + discharge - ~14-16 minutes
   */
  exerciseRecovery: {
    arrival: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/recovery/segment_01_%20arrival.mp3',
    breathOrientation: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/recovery/segment_02_breath_orientation.mp3',
    inhale: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/recovery/voice_segment_A.mp3',
    exhale: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/recovery/voice_segment_B.mp3',
    faceRelease: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/recovery/segment_04_jaw+face_release.mp3',
    shoulderRelease: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/recovery/segment_05_shoulder+arm%20drop.mp3',
    discharge: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/recovery/segment_06_somatic+discharge.mp3',
    scan: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/recovery/segment_08_body+scan+intergration.mp3',
    reclaim: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/recovery/segment_09_reclaiming+self.mp3',
    close: 'https://szaenpzeozualdgfbcqt.supabase.co/storage/v1/object/public/Audio%20-%20System/system/voice-main/recovery/segment_10_close%20.mp3',
  },
} as const;

export type SystemAudioKey = keyof typeof systemVoiceAudio;
