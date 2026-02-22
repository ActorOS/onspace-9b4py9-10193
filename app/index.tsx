import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { userSettingsStorage } from '@/services/userSettingsStorage';
import { passwordLockStorage } from '@/services/passwordLockStorage';
import { colors } from '@/constants/theme';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      // Check onboarding status
      const hasCompleted = await userSettingsStorage.hasCompletedOnboarding();
      
      if (!hasCompleted) {
        // Show onboarding first
        router.replace('/actor-os');
        return;
      }

      // Check if password lock is enabled
      const passwordEnabled = await passwordLockStorage.isEnabled();
      
      if (passwordEnabled) {
        // Require password authentication
        router.replace('/password-lock');
      } else {
        // Go directly to home
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to check app status:', error);
      // Default to showing onboarding on error
      router.replace('/actor-os');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
