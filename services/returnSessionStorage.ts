import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReturnSession {
  id: string;
  createdAt: string;
  roleId?: string;
  source: 'release_return';
  completed: boolean;
  completionType: 'quick' | 'exercise';
  notes?: string;
}

export interface ExerciseSession {
  id: string;
  createdAt: string;
  roleId?: string;
  exerciseType: 'breathing_release' | 'body_scan' | 'identity_separation';
  durationMinutes: number;
  completed: boolean;
  completionAt?: string;
}

const RETURN_SESSIONS_KEY = '@actor_os:return_sessions';
const EXERCISE_SESSIONS_KEY = '@actor_os:exercise_sessions';

export const returnSessionStorage = {
  // Return Sessions
  async getAllReturnSessions(): Promise<ReturnSession[]> {
    try {
      const data = await AsyncStorage.getItem(RETURN_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading return sessions:', error);
      return [];
    }
  },

  async saveReturnSession(session: Omit<ReturnSession, 'id'>): Promise<ReturnSession> {
    try {
      const sessions = await this.getAllReturnSessions();
      
      const newSession: ReturnSession = {
        ...session,
        id: `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      sessions.push(newSession);
      await AsyncStorage.setItem(RETURN_SESSIONS_KEY, JSON.stringify(sessions));
      
      return newSession;
    } catch (error) {
      console.error('Error saving return session:', error);
      throw error;
    }
  },

  // Exercise Sessions
  async getAllExerciseSessions(): Promise<ExerciseSession[]> {
    try {
      const data = await AsyncStorage.getItem(EXERCISE_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading exercise sessions:', error);
      return [];
    }
  },

  async saveExerciseSession(session: Omit<ExerciseSession, 'id'>): Promise<ExerciseSession> {
    try {
      const sessions = await this.getAllExerciseSessions();
      
      const newSession: ExerciseSession = {
        ...session,
        id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      sessions.push(newSession);
      await AsyncStorage.setItem(EXERCISE_SESSIONS_KEY, JSON.stringify(sessions));
      
      return newSession;
    } catch (error) {
      console.error('Error saving exercise session:', error);
      throw error;
    }
  },

  async updateExerciseSession(id: string, updates: Partial<Omit<ExerciseSession, 'id'>>): Promise<void> {
    try {
      const sessions = await this.getAllExerciseSessions();
      const index = sessions.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new Error(`Exercise session with id ${id} not found`);
      }

      sessions[index] = {
        ...sessions[index],
        ...updates,
      };

      await AsyncStorage.setItem(EXERCISE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error updating exercise session:', error);
      throw error;
    }
  },

  async getExerciseSessionById(id: string): Promise<ExerciseSession | null> {
    const sessions = await this.getAllExerciseSessions();
    return sessions.find(s => s.id === id) || null;
  },

  // Get active role (most recent open or held role)
  async getActiveRoleId(): Promise<string | undefined> {
    try {
      const rolesData = await AsyncStorage.getItem('@actor_os:roles');
      if (!rolesData) return undefined;
      
      const roles = JSON.parse(rolesData);
      const activeRoles = roles.filter((r: any) => 
        (r.status === 'open' || r.status === 'held') && !r.archived
      );
      
      if (activeRoles.length === 0) return undefined;
      
      // Return the most recently updated active role
      const sorted = activeRoles.sort((a: any, b: any) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      return sorted[0].id;
    } catch (error) {
      console.error('Error getting active role:', error);
      return undefined;
    }
  },
};
