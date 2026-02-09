import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, AppState, AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { biometricLockStorage } from '@/services/biometricLockStorage';

export default function BiometricLockScreen() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric Authentication');
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => {
    loadBiometricType();
    // Automatically trigger authentication on mount
    handleAuthenticate();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const loadBiometricType = async () => {
    const capability = await biometricLockStorage.checkCapability();
    const typeName = biometricLockStorage.getBiometricTypeName(capability.biometricType);
    setBiometricType(typeName);
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground - check if we need to re-authenticate
      const shouldAuth = await biometricLockStorage.shouldRequireAuth();
      if (shouldAuth) {
        handleAuthenticate();
      }
    } else if (nextAppState === 'background') {
      // App went to background - record time
      biometricLockStorage.recordBackgroundTime();
    }
  };

  const handleAuthenticate = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    try {
      const result = await biometricLockStorage.authenticate('Unlock Actor OS');
      
      if (result.success) {
        // Clear background time and navigate to home
        biometricLockStorage.clearBackgroundTime();
        router.replace('/(tabs)');
      } else {
        setIsAuthenticating(false);
        setFailedAttempts(prev => prev + 1);
        
        if (result.error === 'Authentication cancelled') {
          // User cancelled - stay on lock screen
          Alert.alert(
            'Authentication Required',
            'You must authenticate to access Actor OS',
            [{ text: 'Try Again', onPress: handleAuthenticate }]
          );
        } else if (result.error === 'No biometrics enrolled') {
          Alert.alert(
            'Biometrics Not Set Up',
            'Please set up Face ID, Touch ID, or Fingerprint in your device settings, then disable and re-enable Biometric Lock in Actor OS Settings.',
            [
              { text: 'Disable Lock', style: 'destructive', onPress: handleDisableLock },
              { text: 'Try Again', onPress: handleAuthenticate }
            ]
          );
        } else {
          Alert.alert(
            'Authentication Failed',
            failedAttempts >= 2 
              ? 'Multiple failed attempts. You can disable Biometric Lock in Settings after unlocking with your device passcode.'
              : 'Please try again',
            [
              failedAttempts >= 2 && { text: 'Disable Lock', style: 'destructive', onPress: handleDisableLock },
              { text: 'Retry', onPress: handleAuthenticate }
            ].filter(Boolean) as any
          );
        }
      }
    } catch (error) {
      setIsAuthenticating(false);
      console.error('Authentication error:', error);
      Alert.alert(
        'Error',
        'An error occurred during authentication',
        [{ text: 'Retry', onPress: handleAuthenticate }]
      );
    }
  };

  const handleDisableLock = async () => {
    Alert.alert(
      'Disable Biometric Lock',
      'Are you sure you want to disable Biometric Lock? This will allow access without authentication.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              await biometricLockStorage.disable();
              biometricLockStorage.clearBackgroundTime();
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Failed to disable lock:', error);
              Alert.alert('Error', 'Failed to disable Biometric Lock');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Lock Icon */}
        <View style={styles.iconContainer}>
          <MaterialIcons name="lock" size={80} color={colors.primary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Actor OS is Locked</Text>
        <Text style={styles.subtitle}>
          Authenticate to access your private role containers and notes
        </Text>

        {/* Biometric Type */}
        <View style={styles.biometricTypeCard}>
          <MaterialIcons 
            name={biometricType.includes('Face') ? 'face' : 'fingerprint'} 
            size={24} 
            color={colors.textSecondary} 
          />
          <Text style={styles.biometricTypeText}>{biometricType}</Text>
        </View>

        {/* Unlock Button */}
        <Pressable
          style={({ pressed }) => [
            styles.unlockButton,
            pressed && { backgroundColor: colors.primaryDark, transform: [{ scale: 0.98 }] }
          ]}
          onPress={handleAuthenticate}
          disabled={isAuthenticating}
        >
          <MaterialIcons name="lock-open" size={24} color="#FFFFFF" />
          <Text style={styles.unlockButtonText}>
            {isAuthenticating ? 'Authenticating...' : 'Unlock'}
          </Text>
        </Pressable>

        {/* Failed Attempts Warning */}
        {failedAttempts >= 2 && (
          <View style={styles.warningCard}>
            <MaterialIcons name="info" size={22} color={colors.cautionText} />
            <Text style={styles.warningText}>
              Multiple failed attempts. You can disable Biometric Lock from Settings after successful authentication.
            </Text>
          </View>
        )}

        {/* Help Text */}
        <Text style={styles.helpText}>
          If you cannot authenticate, please ensure biometrics are set up in your device settings.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  biometricTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  biometricTypeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: spacing.xl,
  },
  unlockButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.cautionText,
    lineHeight: 20,
  },
  helpText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
});
