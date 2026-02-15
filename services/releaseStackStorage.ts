import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReleaseStackExercise = {
  id: string;
  name: string;
  route: string;
  requiresPro: boolean;
};

export type ReleaseStack = {
  id: string;
  name: string;
  exercises: ReleaseStackExercise[];
  addPausesBetween: boolean;
  suggestAfterHeavy: boolean;
  createdAt: string;
  updatedAt: string;
};

const STACKS_KEY = 'actor_os_release_stacks';

export const releaseStackStorage = {
  async getStacks(): Promise<ReleaseStack[]> {
    try {
      const json = await AsyncStorage.getItem(STACKS_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Failed to load release stacks:', error);
      return [];
    }
  },

  async getStack(id: string): Promise<ReleaseStack | null> {
    try {
      const stacks = await this.getStacks();
      return stacks.find(s => s.id === id) || null;
    } catch (error) {
      console.error('Failed to load release stack:', error);
      return null;
    }
  },

  async saveStack(stack: Omit<ReleaseStack, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReleaseStack> {
    try {
      const stacks = await this.getStacks();
      const newStack: ReleaseStack = {
        ...stack,
        id: `stack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      stacks.push(newStack);
      await AsyncStorage.setItem(STACKS_KEY, JSON.stringify(stacks));
      return newStack;
    } catch (error) {
      console.error('Failed to save release stack:', error);
      throw error;
    }
  },

  async updateStack(id: string, updates: Partial<Omit<ReleaseStack, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const stacks = await this.getStacks();
      const index = stacks.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Stack not found');
      
      stacks[index] = {
        ...stacks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STACKS_KEY, JSON.stringify(stacks));
    } catch (error) {
      console.error('Failed to update release stack:', error);
      throw error;
    }
  },

  async deleteStack(id: string): Promise<void> {
    try {
      const stacks = await this.getStacks();
      const filtered = stacks.filter(s => s.id !== id);
      await AsyncStorage.setItem(STACKS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete release stack:', error);
      throw error;
    }
  },

  async duplicateStack(id: string): Promise<ReleaseStack> {
    try {
      const original = await this.getStack(id);
      if (!original) throw new Error('Stack not found');
      
      return this.saveStack({
        name: `${original.name} (Copy)`,
        exercises: [...original.exercises],
        addPausesBetween: original.addPausesBetween,
        suggestAfterHeavy: original.suggestAfterHeavy,
      });
    } catch (error) {
      console.error('Failed to duplicate release stack:', error);
      throw error;
    }
  },
};
