import { getSupabaseClient } from '@/template';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'actoros_device_id';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create a persistent device ID for anonymous tracking
 */
async function getDeviceId(): Promise<string | null> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      // Generate a new UUID device ID
      deviceId = generateUUID();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Failed to get device ID:', error);
    return null;
  }
}

/**
 * Generate a random session ID (UUID)
 */
function generateSessionId(): string {
  return generateUUID();
}

/**
 * Track exercise started event
 */
export async function trackExerciseStarted(
  exerciseName: string,
  sessionId?: string
): Promise<string> {
  const supabase = getSupabaseClient();
  const deviceId = await getDeviceId();
  const trackingSessionId = sessionId || generateSessionId();

  try {
    const { error } = await supabase
      .from('pilot_usage')
      .insert({
        event_type: 'exercise_started',
        exercise_name: exerciseName,
        session_id: trackingSessionId,
        user_id: deviceId,
      });

    if (error) {
      console.error('Failed to track exercise started:', error);
    }
  } catch (error) {
    console.error('Failed to track exercise started:', error);
  }

  return trackingSessionId;
}

/**
 * Track exercise completed event
 */
export async function trackExerciseCompleted(
  exerciseName: string,
  sessionId: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const deviceId = await getDeviceId();

  try {
    const { error } = await supabase
      .from('pilot_usage')
      .insert({
        event_type: 'exercise_completed',
        exercise_name: exerciseName,
        session_id: sessionId,
        user_id: deviceId,
      });

    if (error) {
      console.error('Failed to track exercise completed:', error);
    }
  } catch (error) {
    console.error('Failed to track exercise completed:', error);
  }
}

/**
 * Track workload selection event
 */
export async function trackWorkloadSelected(workload: string): Promise<void> {
  const supabase = getSupabaseClient();
  const deviceId = await getDeviceId();
  const sessionId = generateSessionId();

  try {
    const { error } = await supabase
      .from('pilot_usage')
      .insert({
        event_type: 'workload_selected',
        exercise_name: workload,
        session_id: sessionId,
        user_id: deviceId,
      });

    if (error) {
      console.warn('[Analytics] Failed to track workload selected:', error);
    }
  } catch (error) {
    console.warn('[Analytics] Failed to track workload selected:', error);
  }
}

/**
 * Track app open event (first load per session)
 */
export async function trackAppOpen(): Promise<void> {
  const supabase = getSupabaseClient();
  const deviceId = await getDeviceId();
  const sessionId = generateSessionId();

  try {
    const { error } = await supabase
      .from('pilot_usage')
      .insert({
        event_type: 'app_open',
        exercise_name: null,
        session_id: sessionId,
        user_id: deviceId,
      });

    if (error) {
      console.warn('[Analytics] Failed to track app open:', error);
    }
  } catch (error) {
    console.warn('[Analytics] Failed to track app open:', error);
  }
}

/**
 * Track exercise abandon event (user exits before completion)
 */
export async function trackExerciseAbandoned(
  exerciseName: string,
  sessionId: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const deviceId = await getDeviceId();

  try {
    const { error } = await supabase
      .from('pilot_usage')
      .insert({
        event_type: 'exercise_abandon',
        exercise_name: exerciseName,
        session_id: sessionId,
        user_id: deviceId,
      });

    if (error) {
      console.warn('[Analytics] Failed to track exercise abandoned:', error);
    }
  } catch (error) {
    console.warn('[Analytics] Failed to track exercise abandoned:', error);
  }
}
