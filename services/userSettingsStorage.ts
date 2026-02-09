import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@actor_os:user_settings';

export type ReleaseExerciseType = 'breathing' | 'bodyScan' | 'identitySeparation';
export type VoiceStyle = 'warmFemale' | 'warmMale' | 'neutral';
export type DataExportFormat = 'json' | 'csv';

export interface UserSettings {
  hasCompletedOnboarding: boolean;
  biometricLockEnabled: boolean;
  noPressureNotificationsEnabled: boolean;
  sessionRemindersEnabled: boolean;
  reminderDelayMinutes: number;
  defaultReleaseExercise: ReleaseExerciseType;
  voiceGuidanceEnabled: boolean;
  voiceStyle: VoiceStyle;
  voiceSpeed: number; // 0.9–1.1
  voiceVolume: number; // 0–100
  dataExportFormat: DataExportFormat;
}

const DEFAULT_SETTINGS: UserSettings = {
  hasCompletedOnboarding: false,
  biometricLockEnabled: false,
  noPressureNotificationsEnabled: true,
  sessionRemindersEnabled: false,
  reminderDelayMinutes: 30,
  defaultReleaseExercise: 'breathing',
  voiceGuidanceEnabled: true,
  voiceStyle: 'warmFemale',
  voiceSpeed: 1.0,
  voiceVolume: 75,
  dataExportFormat: 'json',
};

class UserSettingsStorage {
  async getSettings(): Promise<UserSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings added in updates
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      // First time - save defaults
      await this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): Promise<UserSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, [key]: value };
      await this.saveSettings(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update setting:', error);
      throw error;
    }
  }

  async resetToDefaults(): Promise<UserSettings> {
    await this.saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.hasCompletedOnboarding;
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      return false;
    }
  }

  async completeOnboarding(): Promise<void> {
    await this.updateSetting('hasCompletedOnboarding', true);
  }

  async resetOnboarding(): Promise<void> {
    await this.updateSetting('hasCompletedOnboarding', false);
  }
}

export const userSettingsStorage = new UserSettingsStorage();
