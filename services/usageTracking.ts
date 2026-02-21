import { getSupabaseClient } from '@/template';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@actor_os_device_id';

/**
 * Get or create a persistent device ID for anonymous tracking
 */
async function getDeviceId(): Promise<string | null> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      // Generate a new device ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Failed to get device ID:', error);
    return null;
  }
}

/**
 * Generate a random session ID
 */
function generateSessionId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(7)}_${Math.random().toString(36).substring(7)}`;
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
      console.error('Failed to track workload selected:', error);
    }
  } catch (error) {
    console.error('Failed to track workload selected:', error);
  }
}
