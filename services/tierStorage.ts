import AsyncStorage from '@react-native-async-storage/async-storage';

const TIER_KEY = '@actor_os:user_tier';

export type UserTier = 'free' | 'pro';

export interface TierFeatures {
  maxActiveRoles: number;
  canAccessAdvancedNotes: boolean;
  canAccessAftermathMode: boolean;
  canAccessFullReleaseLibrary: boolean;
  canAccessRoleClosure: boolean;
  canAccessFullHistory: boolean;
  canExportData: boolean;
}

const FREE_FEATURES: TierFeatures = {
  maxActiveRoles: 1,
  canAccessAdvancedNotes: false,
  canAccessAftermathMode: false,
  canAccessFullReleaseLibrary: false,
  canAccessRoleClosure: false,
  canAccessFullHistory: false,
  canExportData: false,
};

const PRO_FEATURES: TierFeatures = {
  maxActiveRoles: Infinity,
  canAccessAdvancedNotes: true,
  canAccessAftermathMode: true,
  canAccessFullReleaseLibrary: true,
  canAccessRoleClosure: true,
  canAccessFullHistory: true,
  canExportData: true,
};

class TierStorage {
  async getTier(): Promise<UserTier> {
    try {
      const stored = await AsyncStorage.getItem(TIER_KEY);
      if (stored === 'pro') return 'pro';
      if (stored === 'free') return 'free';
      // Default to Pro for pilot/founder access
      await this.setTier('pro');
      return 'pro';
    } catch (error) {
      console.error('Failed to load tier:', error);
      return 'free';
    }
  }

  async setTier(tier: UserTier): Promise<void> {
    try {
      await AsyncStorage.setItem(TIER_KEY, tier);
    } catch (error) {
      console.error('Failed to save tier:', error);
      throw error;
    }
  }

  async getFeatures(): Promise<TierFeatures> {
    const tier = await this.getTier();
    return tier === 'pro' ? PRO_FEATURES : FREE_FEATURES;
  }

  async canCreateRole(currentActiveRoleCount: number): Promise<boolean> {
    const features = await this.getFeatures();
    return currentActiveRoleCount < features.maxActiveRoles;
  }

  async upgradeToPro(): Promise<void> {
    await this.setTier('pro');
  }

  // For testing/development - allows downgrading
  async setToFree(): Promise<void> {
    await this.setTier('free');
  }
}

export const tierStorage = new TierStorage();
