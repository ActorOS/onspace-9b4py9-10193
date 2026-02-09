import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SessionReflection {
  emotion?: string;
  physicalSensation?: string;
  thought?: string;
  nothingLeftBehind?: boolean;
}

export type ReleaseStatus = 'grounded' | 'partially-released' | 'still-holding' | null;

export interface WorkSession {
  id: string;
  roleId: string;
  roleName?: string; // Denormalized for quick display
  production?: string; // Denormalized for quick display
  sessionType?: 'Rehearsal' | 'Self-tape' | 'Run' | 'Research' | 'Other';
  workloadLevel?: 'light' | 'medium' | 'heavy'; // Replaces 'heaviness' with professional terminology
  heaviness?: 'light' | 'medium' | 'heavy'; // Deprecated, kept for backward compatibility
  ownership?: 'self' | 'role' | 'shared';
  entryBoundaryNote?: string;
  enteredAt: string;
  exitedAt?: string;
  exitNotes?: string;
  residueLevel?: number; // 1-5 scale
  reflection?: SessionReflection;
  releaseStatus?: ReleaseStatus;
  returnCompletedAt?: string;
}

const SESSIONS_STORAGE_KEY = '@actor_os:work_sessions';

export const sessionStorage = {
  async getAllSessions(): Promise<WorkSession[]> {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading sessions:', error);
      return [];
    }
  },

  async createSession(session: Omit<WorkSession, 'id' | 'enteredAt'>): Promise<WorkSession> {
    try {
      const sessions = await this.getAllSessions();
      const now = new Date().toISOString();
      
      const newSession: WorkSession = {
        ...session,
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        enteredAt: now,
      };

      sessions.push(newSession);
      await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async updateSession(id: string, updates: Partial<Omit<WorkSession, 'id' | 'enteredAt'>>): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const index = sessions.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new Error(`Session with id ${id} not found`);
      }

      sessions[index] = {
        ...sessions[index],
        ...updates,
      };

      await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  async getActiveSession(): Promise<WorkSession | null> {
    const sessions = await this.getAllSessions();
    // Find most recent session without exitedAt
    const active = sessions
      .filter(s => !s.exitedAt)
      .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime())
      [0];
    return active || null;
  },

  async getSessionsByRole(roleId: string): Promise<WorkSession[]> {
    const sessions = await this.getAllSessions();
    return sessions
      .filter(s => s.roleId === roleId)
      .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime());
  },

  async getRecentSessions(limit: number = 10): Promise<WorkSession[]> {
    const sessions = await this.getAllSessions();
    return sessions
      .filter(s => s.exitedAt) // Only completed sessions
      .sort((a, b) => new Date(b.exitedAt!).getTime() - new Date(a.exitedAt!).getTime())
      .slice(0, limit);
  },

  async getSessionById(id: string): Promise<WorkSession | null> {
    const sessions = await this.getAllSessions();
    return sessions.find(s => s.id === id) || null;
  },
};
