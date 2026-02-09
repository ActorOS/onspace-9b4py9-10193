import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const BIOMETRIC_LOCK_KEY = '@actor_os:biometric_lock';
const LAST_BACKGROUND_TIME_KEY = '@actor_os:last_background_time';

const LOCK_TIMEOUT_MS = 30000; // 30 seconds

export interface BiometricCapability {
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricType: 'faceId' | 'touchId' | 'fingerprint' | 'iris' | 'unknown' | null;
  supportsFallback: boolean;
}

export interface BiometricLockState {
  enabled: boolean;
  lastAuthTime?: string;
}

class BiometricLockStorage {
  private lastBackgroundTime: number | null = null;

  async checkCapability(): Promise<BiometricCapability> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: BiometricCapability['biometricType'] = null;
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'faceId';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
      } else if (hasHardware) {
        biometricType = 'unknown';
      }

      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
      const supportsFallback = securityLevel === LocalAuthentication.SecurityLevel.BIOMETRIC ||
                               securityLevel === LocalAuthentication.SecurityLevel.SECRET;

      return {
        hasHardware,
        isEnrolled,
        biometricType,
        supportsFallback,
      };
    } catch (error) {
      console.error('Failed to check biometric capability:', error);
      return {
        hasHardware: false,
        isEnrolled: false,
        biometricType: null,
        supportsFallback: false,
      };
    }
  }

  async authenticate(promptMessage: string = 'Unlock Actor OS'): Promise<{ success: boolean; error?: string }> {
    try {
      const capability = await this.checkCapability();

      if (!capability.hasHardware) {
        return { success: false, error: 'Biometric hardware not available' };
      }

      if (!capability.isEnrolled) {
        return { success: false, error: 'No biometrics enrolled' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        await this.recordAuthSuccess();
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error === 'user_cancel' 
            ? 'Authentication cancelled' 
            : 'Authentication failed' 
        };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication error' };
    }
  }

  async isEnabled(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(BIOMETRIC_LOCK_KEY);
      if (stored) {
        const state: BiometricLockState = JSON.parse(stored);
        return state.enabled;
      }
      return false;
    } catch (error) {
      console.error('Failed to check biometric lock state:', error);
      return false;
    }
  }

  async enable(): Promise<void> {
    try {
      const state: BiometricLockState = {
        enabled: true,
        lastAuthTime: new Date().toISOString(),
      };
      await AsyncStorage.setItem(BIOMETRIC_LOCK_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to enable biometric lock:', error);
      throw error;
    }
  }

  async disable(): Promise<void> {
    try {
      const state: BiometricLockState = {
        enabled: false,
      };
      await AsyncStorage.setItem(BIOMETRIC_LOCK_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to disable biometric lock:', error);
      throw error;
    }
  }

  async recordAuthSuccess(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(BIOMETRIC_LOCK_KEY);
      if (stored) {
        const state: BiometricLockState = JSON.parse(stored);
        state.lastAuthTime = new Date().toISOString();
        await AsyncStorage.setItem(BIOMETRIC_LOCK_KEY, JSON.stringify(state));
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

  getBiometricTypeName(type: BiometricCapability['biometricType']): string {
    switch (type) {
      case 'faceId':
        return 'Face ID';
      case 'touchId':
        return 'Touch ID';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris';
      default:
        return 'Biometric Authentication';
    }
  }
}

export const biometricLockStorage = new BiometricLockStorage();
