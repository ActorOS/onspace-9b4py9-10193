import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Aftereffect {
  id: string;
  createdAt: string;
  sessionId?: string;
  roleId?: string;
  residueTags: string[];
  bodyLocation: string[];
  intensity?: 'low' | 'medium' | 'high';
  note?: string;
  actionTaken: 'held' | 'released';
}

const AFTEREFFECTS_STORAGE_KEY = '@actor_os:aftereffects';

export const aftereffectsStorage = {
  async getAllAftereffects(): Promise<Aftereffect[]> {
    try {
      const data = await AsyncStorage.getItem(AFTEREFFECTS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading aftereffects:', error);
      return [];
    }
  },

  async saveAftereffect(aftereffect: Omit<Aftereffect, 'id' | 'createdAt'>): Promise<Aftereffect> {
    try {
      const aftereffects = await this.getAllAftereffects();
      const now = new Date().toISOString();
      
      const newAftereffect: Aftereffect = {
        ...aftereffect,
        id: `aftereffect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
      };

      aftereffects.push(newAftereffect);
      await AsyncStorage.setItem(AFTEREFFECTS_STORAGE_KEY, JSON.stringify(aftereffects));
      
      return newAftereffect;
    } catch (error) {
      console.error('Error saving aftereffect:', error);
      throw error;
    }
  },

  async getAftereffectsByRoleId(roleId: string): Promise<Aftereffect[]> {
    const aftereffects = await this.getAllAftereffects();
    return aftereffects.filter(a => a.roleId === roleId);
  },

  async getAftereffectsBySessionId(sessionId: string): Promise<Aftereffect[]> {
    const aftereffects = await this.getAllAftereffects();
    return aftereffects.filter(a => a.sessionId === sessionId);
  },

  async getHeldAftereffects(): Promise<Aftereffect[]> {
    const aftereffects = await this.getAllAftereffects();
    return aftereffects.filter(a => a.actionTaken === 'held');
  },

  async getReleasedAftereffects(): Promise<Aftereffect[]> {
    const aftereffects = await this.getAllAftereffects();
    return aftereffects.filter(a => a.actionTaken === 'released');
  },

  async deleteAftereffect(id: string): Promise<void> {
    try {
      const aftereffects = await this.getAllAftereffects();
      const filtered = aftereffects.filter(a => a.id !== id);
      await AsyncStorage.setItem(AFTEREFFECTS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting aftereffect:', error);
      throw error;
    }
  },
};
