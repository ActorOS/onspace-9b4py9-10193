import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { userSettingsStorage } from '@/services/userSettingsStorage';
import { biometricLockStorage } from '@/services/biometricLockStorage';
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

      // Check if biometric lock is enabled
      const biometricEnabled = await biometricLockStorage.isEnabled();
      
      if (biometricEnabled) {
        // Require biometric authentication
        router.replace('/biometric-lock');
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
