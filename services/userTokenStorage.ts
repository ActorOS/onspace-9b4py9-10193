import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_TOKEN_KEY = '@actor_os:user_token';

class UserTokenStorage {
  /**
   * Get or generate a user token
   * This token is used to link the device to ActorOS without requiring login
   */
  async getOrCreateToken(): Promise<string> {
    try {
      const existing = await AsyncStorage.getItem(USER_TOKEN_KEY);
      if (existing) {
        return existing;
      }

      // Generate new UUID v4 token
      const newToken = this.generateUUID();
      await AsyncStorage.setItem(USER_TOKEN_KEY, newToken);
      return newToken;
    } catch (error) {
      console.error('Failed to get/create user token:', error);
      // Return a temporary token if storage fails
      return this.generateUUID();
    }
  }

  /**
   * Get existing token (returns null if none exists)
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get user token:', error);
      return null;
    }
  }

  /**
   * Clear the user token (for testing or data deletion)
   */
  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear user token:', error);
    }
  }

  /**
   * Generate a UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const userTokenStorage = new UserTokenStorage();
