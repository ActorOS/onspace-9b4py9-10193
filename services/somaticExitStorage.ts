import AsyncStorage from '@react-native-async-storage/async-storage';

const SOMATIC_EXIT_LOG_KEY = '@actor_os:somatic_exit_logs';

export type WorkloadLevel = 'light' | 'medium' | 'heavy';

export type SomaticTrackType = 
  | 'gentle_grounding'
  | 'short_body_release'
  | 'breath_settling'
  | 'full_body_release'
  | 'tension_discharge'
  | 'guided_stillness'
  | 'deep_somatic_release'
  | 'extended_grounding'
  | 'nervous_system_regulation';

export interface SomaticExitLog {
  id: string;
  sessionId?: string;
  roleId?: string;
  trackType: SomaticTrackType;
  timestamp: string;
  completed: boolean;
  durationSeconds?: number;
}

export interface SomaticTrack {
  type: SomaticTrackType;
  title: string;
  subtitle: string;
  duration: string;
  durationSeconds: number;
  freeAccess: boolean;
  workloadLevel: WorkloadLevel;
  icon: string;
  script: SomaticScript[];
}

export interface SomaticScript {
  text: string;
  pauseAfterMs: number;
}

class SomaticExitStorage {
  async logTrackUse(params: {
    sessionId?: string;
    roleId?: string;
    trackType: SomaticTrackType;
    completed: boolean;
    durationSeconds?: number;
  }): Promise<SomaticExitLog> {
    try {
      const log: SomaticExitLog = {
        id: Date.now().toString(),
        sessionId: params.sessionId,
        roleId: params.roleId,
        trackType: params.trackType,
        timestamp: new Date().toISOString(),
        completed: params.completed,
        durationSeconds: params.durationSeconds,
      };

      const logs = await this.getAllLogs();
      logs.push(log);
      await AsyncStorage.setItem(SOMATIC_EXIT_LOG_KEY, JSON.stringify(logs));

      return log;
    } catch (error) {
      console.error('Failed to log somatic exit track:', error);
      throw error;
    }
  }

  async getAllLogs(): Promise<SomaticExitLog[]> {
    try {
      const stored = await AsyncStorage.getItem(SOMATIC_EXIT_LOG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Failed to load somatic exit logs:', error);
      return [];
    }
  }

  async getLogsBySession(sessionId: string): Promise<SomaticExitLog[]> {
    const all = await this.getAllLogs();
    return all.filter(log => log.sessionId === sessionId);
  }

  async getLogsByRole(roleId: string): Promise<SomaticExitLog[]> {
    const all = await this.getAllLogs();
    return all.filter(log => log.roleId === roleId);
  }

  getTracks(): SomaticTrack[] {
    return SOMATIC_TRACKS;
  }

  getTrack(type: SomaticTrackType): SomaticTrack | undefined {
    return SOMATIC_TRACKS.find(track => track.type === type);
  }

  getTracksForWorkload(workloadLevel: WorkloadLevel): SomaticTrack[] {
    return SOMATIC_TRACKS.filter(track => track.workloadLevel === workloadLevel);
  }
}

// Somatic Track Scripts organized by workload
const SOMATIC_TRACKS: SomaticTrack[] = [
  // LIGHT WORKLOAD TRACKS
  {
    type: 'gentle_grounding',
    title: 'Gentle Grounding',
    subtitle: 'Quick return to baseline',
    duration: '3 min',
    durationSeconds: 180,
    freeAccess: true,
    workloadLevel: 'light',
    icon: 'self-improvement',
    script: [
      { text: 'Find a comfortable place to stand.', pauseAfterMs: 3000 },
      { text: 'Notice your feet on the ground.', pauseAfterMs: 4000 },
      { text: 'Let your breath settle into its natural rhythm.', pauseAfterMs: 4000 },
      { text: 'Allow your shoulders to drop.', pauseAfterMs: 4000 },
      { text: 'Release any holding in your jaw.', pauseAfterMs: 4000 },
      { text: 'Feel the support beneath you.', pauseAfterMs: 4000 },
      { text: 'The work has ended. You are here.', pauseAfterMs: 4000 },
      { text: 'Take one slow breath.', pauseAfterMs: 4000 },
      { text: 'Exhale and let the character settle.', pauseAfterMs: 4000 },
      { text: 'Your body is your own.', pauseAfterMs: 4000 },
      { text: 'You are present. You are yourself.', pauseAfterMs: 5000 },
    ],
  },
  {
    type: 'short_body_release',
    title: 'Short Body Release',
    subtitle: 'Release minor holding patterns',
    duration: '3 min',
    durationSeconds: 180,
    freeAccess: true,
    workloadLevel: 'light',
    icon: 'air',
    script: [
      { text: 'Stand with your feet grounded.', pauseAfterMs: 3000 },
      { text: 'Shake out your hands.', pauseAfterMs: 3000 },
      { text: 'Roll your shoulders back and down.', pauseAfterMs: 4000 },
      { text: 'Gently roll your head side to side.', pauseAfterMs: 4000 },
      { text: 'Take a slow breath in.', pauseAfterMs: 4000 },
      { text: 'Exhale with a sigh.', pauseAfterMs: 4000 },
      { text: 'Wiggle your toes. Feel your feet.', pauseAfterMs: 4000 },
      { text: 'Let your jaw release.', pauseAfterMs: 4000 },
      { text: 'Notice what feels lighter.', pauseAfterMs: 4000 },
      { text: 'The work is complete. You are here.', pauseAfterMs: 5000 },
    ],
  },
  {
    type: 'breath_settling',
    title: 'Breath Settling',
    subtitle: 'Return breathing to neutral',
    duration: '4 min',
    durationSeconds: 240,
    freeAccess: false,
    workloadLevel: 'light',
    icon: 'spa',
    script: [
      { text: 'Find a place to sit or stand comfortably.', pauseAfterMs: 3000 },
      { text: 'Place one hand on your chest.', pauseAfterMs: 4000 },
      { text: 'Notice your breath without changing it.', pauseAfterMs: 4000 },
      { text: 'Inhale slowly for four counts.', pauseAfterMs: 5000 },
      { text: 'Hold for four.', pauseAfterMs: 5000 },
      { text: 'Exhale for six.', pauseAfterMs: 7000 },
      { text: 'Again. Inhale for four.', pauseAfterMs: 5000 },
      { text: 'Hold.', pauseAfterMs: 5000 },
      { text: 'Exhale for six.', pauseAfterMs: 7000 },
      { text: 'Let your breath return to its own rhythm.', pauseAfterMs: 5000 },
      { text: 'Notice the stillness.', pauseAfterMs: 5000 },
      { text: 'Your nervous system is settling.', pauseAfterMs: 5000 },
      { text: 'You are here. You are safe.', pauseAfterMs: 5000 },
    ],
  },
  
  // MEDIUM WORKLOAD TRACKS
  {
    type: 'full_body_release',
    title: 'Full Body Release',
    subtitle: 'Release moderate physical holding',
    duration: '5 min',
    durationSeconds: 300,
    freeAccess: false,
    workloadLevel: 'medium',
    icon: 'accessibility-new',
    script: [
      { text: 'Stand with your feet hip-width apart.', pauseAfterMs: 4000 },
      { text: 'Scan your body from head to toe.', pauseAfterMs: 5000 },
      { text: 'Notice where the work left its mark.', pauseAfterMs: 5000 },
      { text: 'Clench your fists tightly.', pauseAfterMs: 4000 },
      { text: 'Hold for three counts.', pauseAfterMs: 4000 },
      { text: 'Release and shake out your hands.', pauseAfterMs: 5000 },
      { text: 'Raise your shoulders to your ears.', pauseAfterMs: 4000 },
      { text: 'Hold.', pauseAfterMs: 4000 },
      { text: 'Let them drop with a sigh.', pauseAfterMs: 5000 },
      { text: 'Roll your head gently side to side.', pauseAfterMs: 5000 },
      { text: 'Let your jaw soften.', pauseAfterMs: 4000 },
      { text: 'Bend forward and let your head hang.', pauseAfterMs: 5000 },
      { text: 'Slowly roll back up to standing.', pauseAfterMs: 6000 },
      { text: 'Take a deep breath in.', pauseAfterMs: 4000 },
      { text: 'Exhale fully.', pauseAfterMs: 5000 },
      { text: 'Your body is your own again.', pauseAfterMs: 5000 },
    ],
  },
  {
    type: 'tension_discharge',
    title: 'Tension Discharge',
    subtitle: 'Release accumulated stress',
    duration: '6 min',
    durationSeconds: 360,
    freeAccess: false,
    workloadLevel: 'medium',
    icon: 'bolt',
    script: [
      { text: 'Find your stance. Feet grounded.', pauseAfterMs: 4000 },
      { text: 'Notice where your body is braced.', pauseAfterMs: 5000 },
      { text: 'Tension was useful in the work. It is not needed here.', pauseAfterMs: 6000 },
      { text: 'Clench your fists as tight as you can.', pauseAfterMs: 4000 },
      { text: 'Hold. Feel the tension.', pauseAfterMs: 4000 },
      { text: 'Release. Let your hands open.', pauseAfterMs: 5000 },
      { text: 'Tense your shoulders. Raise them to your ears.', pauseAfterMs: 4000 },
      { text: 'Hold.', pauseAfterMs: 4000 },
      { text: 'Let them drop. Sigh it out.', pauseAfterMs: 5000 },
      { text: 'Press your tongue to the roof of your mouth.', pauseAfterMs: 4000 },
      { text: 'Hold.', pauseAfterMs: 4000 },
      { text: 'Release. Let your jaw soften.', pauseAfterMs: 5000 },
      { text: 'Shake out your arms and hands.', pauseAfterMs: 5000 },
      { text: 'Roll your shoulders.', pauseAfterMs: 4000 },
      { text: 'Move in any way that feels releasing.', pauseAfterMs: 6000 },
      { text: 'The work is complete. The tension is discharged.', pauseAfterMs: 6000 },
    ],
  },
  {
    type: 'guided_stillness',
    title: 'Guided Stillness',
    subtitle: 'Find neutral after activation',
    duration: '5 min',
    durationSeconds: 300,
    freeAccess: false,
    workloadLevel: 'medium',
    icon: 'visibility',
    script: [
      { text: 'Find a place to sit or stand.', pauseAfterMs: 4000 },
      { text: 'Allow your eyes to soften or close.', pauseAfterMs: 5000 },
      { text: 'Notice the sounds around you.', pauseAfterMs: 6000 },
      { text: 'Notice the temperature of the air.', pauseAfterMs: 5000 },
      { text: 'Feel your breath moving.', pauseAfterMs: 5000 },
      { text: 'You do not need to change anything.', pauseAfterMs: 5000 },
      { text: 'Simply observe.', pauseAfterMs: 5000 },
      { text: 'The work has ended.', pauseAfterMs: 5000 },
      { text: 'What remains is settling.', pauseAfterMs: 5000 },
      { text: 'Let your body rest.', pauseAfterMs: 6000 },
      { text: 'Let the character image fade.', pauseAfterMs: 6000 },
      { text: 'Return your attention to your own presence.', pauseAfterMs: 6000 },
      { text: 'You are here. Still. Safe.', pauseAfterMs: 6000 },
    ],
  },

  // HEAVY WORKLOAD TRACKS
  {
    type: 'deep_somatic_release',
    title: 'Deep Somatic Release',
    subtitle: 'Release deeply held patterns',
    duration: '8 min',
    durationSeconds: 480,
    freeAccess: false,
    workloadLevel: 'heavy',
    icon: 'waves',
    script: [
      { text: 'Find a safe place to stand or lie down.', pauseAfterMs: 4000 },
      { text: 'This work was heavy. Your body knows.', pauseAfterMs: 5000 },
      { text: 'You will release it layer by layer.', pauseAfterMs: 6000 },
      { text: 'Begin at your feet. Notice their contact with the ground.', pauseAfterMs: 6000 },
      { text: 'Tense your feet and calves. Hold.', pauseAfterMs: 5000 },
      { text: 'Release. Let the tension drain out.', pauseAfterMs: 6000 },
      { text: 'Move to your thighs. Tense them.', pauseAfterMs: 5000 },
      { text: 'Hold. Feel the tightness.', pauseAfterMs: 5000 },
      { text: 'Release. Let go.', pauseAfterMs: 6000 },
      { text: 'Tense your stomach and lower back.', pauseAfterMs: 5000 },
      { text: 'Hold.', pauseAfterMs: 5000 },
      { text: 'Release. Breathe into the space.', pauseAfterMs: 6000 },
      { text: 'Tense your chest and shoulders.', pauseAfterMs: 5000 },
      { text: 'Hold.', pauseAfterMs: 5000 },
      { text: 'Release. Let your chest soften.', pauseAfterMs: 6000 },
      { text: 'Clench your fists. Tense your arms.', pauseAfterMs: 5000 },
      { text: 'Hold.', pauseAfterMs: 5000 },
      { text: 'Release. Shake them out.', pauseAfterMs: 6000 },
      { text: 'Scrunch your face. Tense your jaw.', pauseAfterMs: 5000 },
      { text: 'Hold.', pauseAfterMs: 5000 },
      { text: 'Release. Let your face soften.', pauseAfterMs: 6000 },
      { text: 'Scan your entire body.', pauseAfterMs: 6000 },
      { text: 'Notice what has shifted.', pauseAfterMs: 6000 },
      { text: 'Take three slow breaths.', pauseAfterMs: 10000 },
      { text: 'The character has left your body.', pauseAfterMs: 6000 },
      { text: 'You are yourself again.', pauseAfterMs: 6000 },
    ],
  },
  {
    type: 'extended_grounding',
    title: 'Extended Grounding',
    subtitle: 'Reorient after high demand',
    duration: '7 min',
    durationSeconds: 420,
    freeAccess: false,
    workloadLevel: 'heavy',
    icon: 'landscape',
    script: [
      { text: 'Stand with your feet grounded. Feel their weight.', pauseAfterMs: 5000 },
      { text: 'This work required a lot. You gave it.', pauseAfterMs: 6000 },
      { text: 'Now you return to yourself.', pauseAfterMs: 5000 },
      { text: 'Look around the room. Name five things you see.', pauseAfterMs: 10000 },
      { text: 'Notice four textures. What can you touch?', pauseAfterMs: 10000 },
      { text: 'Listen for three sounds.', pauseAfterMs: 10000 },
      { text: 'Notice two scents, if any.', pauseAfterMs: 8000 },
      { text: 'Take one slow breath.', pauseAfterMs: 6000 },
      { text: 'You are here, in this space.', pauseAfterMs: 5000 },
      { text: 'The world of the character is not here.', pauseAfterMs: 6000 },
      { text: 'Wiggle your toes. Feel your feet.', pauseAfterMs: 5000 },
      { text: 'Shift your weight side to side.', pauseAfterMs: 6000 },
      { text: 'Roll your shoulders.', pauseAfterMs: 5000 },
      { text: 'Gently shake out your body.', pauseAfterMs: 6000 },
      { text: 'Say your own name out loud.', pauseAfterMs: 6000 },
      { text: 'State the date and time.', pauseAfterMs: 6000 },
      { text: 'Describe where you are.', pauseAfterMs: 8000 },
      { text: 'You are back. You are here. You are yourself.', pauseAfterMs: 8000 },
    ],
  },
  {
    type: 'nervous_system_regulation',
    title: 'Nervous System Down-Regulation',
    subtitle: 'Restore baseline after intensity',
    duration: '10 min',
    durationSeconds: 600,
    freeAccess: false,
    workloadLevel: 'heavy',
    icon: 'favorite',
    script: [
      { text: 'Find a comfortable place to sit or lie down.', pauseAfterMs: 5000 },
      { text: 'Place one hand on your chest, one on your stomach.', pauseAfterMs: 5000 },
      { text: 'Notice your heartbeat.', pauseAfterMs: 6000 },
      { text: 'Notice your breath.', pauseAfterMs: 6000 },
      { text: 'Intense work activates your nervous system. That is expected.', pauseAfterMs: 7000 },
      { text: 'Now you will bring it back to baseline.', pauseAfterMs: 6000 },
      { text: 'Inhale slowly for a count of four.', pauseAfterMs: 6000 },
      { text: 'Hold for four.', pauseAfterMs: 5000 },
      { text: 'Exhale slowly for six.', pauseAfterMs: 7000 },
      { text: 'Hold for two.', pauseAfterMs: 3000 },
      { text: 'Again. Inhale for four.', pauseAfterMs: 6000 },
      { text: 'Hold for four.', pauseAfterMs: 5000 },
      { text: 'Exhale for six.', pauseAfterMs: 7000 },
      { text: 'Hold for two.', pauseAfterMs: 3000 },
      { text: 'Continue this rhythm for six more cycles.', pauseAfterMs: 45000 },
      { text: 'Now let your breath return to its natural pace.', pauseAfterMs: 8000 },
      { text: 'Notice the space between breaths.', pauseAfterMs: 7000 },
      { text: 'Notice the stillness.', pauseAfterMs: 7000 },
      { text: 'Your heart rate is slowing.', pauseAfterMs: 7000 },
      { text: 'Your body is releasing what it held.', pauseAfterMs: 7000 },
      { text: 'Scan your body from head to toe.', pauseAfterMs: 8000 },
      { text: 'Notice what feels different.', pauseAfterMs: 7000 },
      { text: 'Take one final slow breath.', pauseAfterMs: 6000 },
      { text: 'You are regulated. You are safe. You are here.', pauseAfterMs: 8000 },
    ],
  },
];

export const somaticExitStorage = new SomaticExitStorage();
