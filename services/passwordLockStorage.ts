import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const PASSWORD_LOCK_KEY = '@actor_os:password_lock';
const LAST_BACKGROUND_TIME_KEY = '@actor_os:last_background_time';

const LOCK_TIMEOUT_MS = 30000; // 30 seconds

export interface PasswordLockState {
  enabled: boolean;
  passwordHash: string;
  lastAuthTime?: string;
}

class PasswordLockStorage {
  private lastBackgroundTime: number | null = null;

  private async hashPassword(password: string): Promise<string> {
    // Use SHA-256 to hash the password
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  }

  async isEnabled(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(PASSWORD_LOCK_KEY);
      if (stored) {
        const state: PasswordLockState = JSON.parse(stored);
        return state.enabled;
      }
      return false;
    } catch (error) {
      console.error('Failed to check password lock state:', error);
      return false;
    }
  }

  async hasPassword(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(PASSWORD_LOCK_KEY);
      if (stored) {
        const state: PasswordLockState = JSON.parse(stored);
        return !!state.passwordHash;
      }
      return false;
    } catch (error) {
      console.error('Failed to check password existence:', error);
      return false;
    }
  }

  async setPassword(password: string): Promise<void> {
    try {
      const passwordHash = await this.hashPassword(password);
      const state: PasswordLockState = {
        enabled: true,
        passwordHash,
        lastAuthTime: new Date().toISOString(),
      };
      await AsyncStorage.setItem(PASSWORD_LOCK_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to set password:', error);
      throw error;
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(PASSWORD_LOCK_KEY);
      if (!stored) return false;

      const state: PasswordLockState = JSON.parse(stored);
      const passwordHash = await this.hashPassword(password);
      
      return passwordHash === state.passwordHash;
    } catch (error) {
      console.error('Failed to verify password:', error);
      return false;
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isValid = await this.verifyPassword(oldPassword);
      if (!isValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      const newPasswordHash = await this.hashPassword(newPassword);
      const stored = await AsyncStorage.getItem(PASSWORD_LOCK_KEY);
      if (!stored) {
        return { success: false, error: 'No password set' };
      }

      const state: PasswordLockState = JSON.parse(stored);
      state.passwordHash = newPasswordHash;
      state.lastAuthTime = new Date().toISOString();
      
      await AsyncStorage.setItem(PASSWORD_LOCK_KEY, JSON.stringify(state));
      return { success: true };
    } catch (error) {
      console.error('Failed to change password:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  async enable(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PASSWORD_LOCK_KEY);
      if (!stored) {
        throw new Error('No password set. Please set a password first.');
      }

      const state: PasswordLockState = JSON.parse(stored);
      state.enabled = true;
      state.lastAuthTime = new Date().toISOString();
      await AsyncStorage.setItem(PASSWORD_LOCK_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to enable password lock:', error);
      throw error;
    }
  }

  async disable(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PASSWORD_LOCK_KEY);
      if (!stored) return;

      const state: PasswordLockState = JSON.parse(stored);
      state.enabled = false;
      await AsyncStorage.setItem(PASSWORD_LOCK_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to disable password lock:', error);
      throw error;
    }
  }

  async removePassword(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PASSWORD_LOCK_KEY);
    } catch (error) {
      console.error('Failed to remove password:', error);
      throw error;
    }
  }

  async recordAuthSuccess(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PASSWORD_LOCK_KEY);
      if (stored) {
        const state: PasswordLockState = JSON.parse(stored);
        state.lastAuthTime = new Date().toISOString();
        await AsyncStorage.setItem(PASSWORD_LOCK_KEY, JSON.stringify(state));
      }
    } catch (error) {
      console.error('Failed to record auth success:', error);
    }
  }

  recordBackgroundTime(): void {
    this.lastBackgroundTime = Date.now();
  }

  async shouldRequireAuth(): Promise<boolean> {
    const isEnabled = await this.isEnabled();
    if (!isEnabled) return false;

    // If we have a recorded background time, check if timeout has passed
    if (this.lastBackgroundTime !== null) {
      const timeSinceBackground = Date.now() - this.lastBackgroundTime;
      if (timeSinceBackground > LOCK_TIMEOUT_MS) {
        return true;
      }
    }

    return false;
  }

  clearBackgroundTime(): void {
    this.lastBackgroundTime = null;
  }
}

export const passwordLockStorage = new PasswordLockStorage();
