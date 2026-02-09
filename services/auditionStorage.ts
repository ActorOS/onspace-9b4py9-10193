import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Audition {
  id: string;
  projectTitle: string;
  roleName?: string;
  companyOrCasting?: string;
  date: string;
  stage: 'audition' | 'callback' | 'cast';
  status: 'waiting' | 'released' | 'booked';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const AUDITIONS_STORAGE_KEY = '@actor_os:auditions';

export const auditionStorage = {
  async getAllAuditions(): Promise<Audition[]> {
    try {
      const data = await AsyncStorage.getItem(AUDITIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading auditions:', error);
      return [];
    }
  },

  async saveAudition(audition: Omit<Audition, 'id' | 'createdAt' | 'updatedAt'>): Promise<Audition> {
    try {
      const auditions = await this.getAllAuditions();
      const now = new Date().toISOString();
      
      const newAudition: Audition = {
        ...audition,
        id: `audition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };

      auditions.push(newAudition);
      await AsyncStorage.setItem(AUDITIONS_STORAGE_KEY, JSON.stringify(auditions));
      
      return newAudition;
    } catch (error) {
      console.error('Error saving audition:', error);
      throw error;
    }
  },

  async updateAudition(id: string, updates: Partial<Omit<Audition, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const auditions = await this.getAllAuditions();
      const index = auditions.findIndex(a => a.id === id);
      
      if (index === -1) {
        throw new Error(`Audition with id ${id} not found`);
      }

      auditions[index] = {
        ...auditions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(AUDITIONS_STORAGE_KEY, JSON.stringify(auditions));
    } catch (error) {
      console.error('Error updating audition:', error);
      throw error;
    }
  },

  async deleteAudition(id: string): Promise<void> {
    try {
      const auditions = await this.getAllAuditions();
      const filtered = auditions.filter(a => a.id !== id);
      await AsyncStorage.setItem(AUDITIONS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting audition:', error);
      throw error;
    }
  },

  async getAuditionsByStatus(status: 'waiting' | 'released' | 'booked'): Promise<Audition[]> {
    const auditions = await this.getAllAuditions();
    return auditions.filter(a => a.status === status);
  },

  async getAuditionsByStage(stage: 'audition' | 'callback' | 'cast'): Promise<Audition[]> {
    const auditions = await this.getAllAuditions();
    return auditions.filter(a => a.stage === stage);
  },

  async getAuditionById(id: string): Promise<Audition | null> {
    const auditions = await this.getAllAuditions();
    return auditions.find(a => a.id === id) || null;
  },
};
