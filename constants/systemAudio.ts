/**
 * DEPRECATED: This file is deprecated.
 * 
 * Use `@/services/systemVoice` instead.
 * 
 * This file is kept temporarily for backward compatibility
 * but will be removed in a future version.
 */

import { SystemVoice } from '@/services/systemVoice';

/**
 * @deprecated Use SystemVoice.onboarding.intro from '@/services/systemVoice' instead
 */
export const systemVoiceAudio = {
  onboardingIntro: SystemVoice.onboarding.intro,
} as const;

/**
 * @deprecated Use SystemVoice types from '@/services/systemVoice' instead
 */
export type SystemAudioKey = keyof typeof systemVoiceAudio;
