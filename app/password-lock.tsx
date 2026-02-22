import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, AppState, AppStateStatus, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { passwordLockStorage } from '@/services/passwordLockStorage';
import { KeyboardDismissView, DoneKeyboardAccessory } from '@/components';

export default function PasswordLockScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground - check if we need to re-authenticate
      const shouldAuth = await passwordLockStorage.shouldRequireAuth();
      if (!shouldAuth) {
        // Timeout hasn't passed, allow access
        passwordLockStorage.clearBackgroundTime();
        router.replace('/(tabs)');
      }
    } else if (nextAppState === 'background') {
      // App went to background - record time
      passwordLockStorage.recordBackgroundTime();
    }
  };

  const handleUnlock = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsAuthenticating(true);
    try {
      const isValid = await passwordLockStorage.verifyPassword(password);
      
      if (isValid) {
        await passwordLockStorage.recordAuthSuccess();
        passwordLockStorage.clearBackgroundTime();
        router.replace('/(tabs)');
      } else {
        setFailedAttempts(prev => prev + 1);
        setPassword('');
        
        if (failedAttempts >= 4) {
          Alert.alert(
            'Too Many Failed Attempts',
            'You can disable Password Lock from Settings after successful authentication with the correct password.',
            [
              { text: 'Try Again' }
            ]
          );
        } else {
          Alert.alert(
            'Incorrect Password',
            `Please try again. ${5 - failedAttempts - 1} attempts remaining.`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'An error occurred during authentication');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisableLock = async () => {
    Alert.alert(
      'Disable Password Lock',
      'Enter your password to disable Password Lock. This will allow access without authentication.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            const promptPassword = async () => {
              Alert.prompt(
                'Enter Password',
                'Enter your current password to disable lock',
                async (inputPassword) => {
                  const isValid = await passwordLockStorage.verifyPassword(inputPassword || '');
                  if (isValid) {
                    try {
                      await passwordLockStorage.disable();
                      passwordLockStorage.clearBackgroundTime();
                      Alert.alert('Success', 'Password Lock disabled', [
                        { text: 'OK', onPress: () => router.replace('/(tabs)') }
                      ]);
                    } catch (error) {
                      console.error('Failed to disable lock:', error);
                      Alert.alert('Error', 'Failed to disable Password Lock');
                    }
                  } else {
                    Alert.alert('Incorrect Password', 'Please try again', [
                      { text: 'Retry', onPress: promptPassword }
                    ]);
                  }
                },
                'secure-text'
              );
            };
            promptPassword();
          }
        }
      ]
    );
  };

  return (
    <KeyboardDismissView>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Lock Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="lock" size={80} color={colors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Actor OS is Locked</Text>
          <Text style={styles.subtitle}>
            Enter your password to access your private role containers and notes
          </Text>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              onSubmitEditing={handleUnlock}
              returnKeyType="go"
              editable={!isAuthenticating}
            />
            <Pressable 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? 'visibility' : 'visibility-off'} 
                size={24} 
                color={colors.textSecondary} 
              />
            </Pressable>
          </View>

          {/* Unlock Button */}
          <Pressable
            style={({ pressed }) => [
              styles.unlockButton,
              pressed && { backgroundColor: colors.primaryDark, transform: [{ scale: 0.98 }] },
              isAuthenticating && { opacity: 0.6 }
            ]}
            onPress={handleUnlock}
            disabled={isAuthenticating || !password.trim()}
          >
            <MaterialIcons name="lock-open" size={24} color="#FFFFFF" />
            <Text style={styles.unlockButtonText}>
              {isAuthenticating ? 'Unlocking...' : 'Unlock'}
            </Text>
          </Pressable>

          {/* Failed Attempts Warning */}
          {failedAttempts >= 3 && (
            <View style={styles.warningCard}>
              <MaterialIcons name="warning" size={22} color={colors.error} />
              <Text style={styles.warningText}>
                Multiple failed attempts. {5 - failedAttempts} attempts remaining.
              </Text>
            </View>
          )}

          {/* Disable Lock Option */}
          {failedAttempts >= 5 && (
            <Pressable style={styles.disableButton} onPress={handleDisableLock}>
              <Text style={styles.disableButtonText}>Disable Password Lock</Text>
            </Pressable>
          )}

          {/* Help Text */}
          <Text style={styles.helpText}>
            Forgot your password? You can disable Password Lock from Settings after successful authentication.
          </Text>
        </View>
        
        <DoneKeyboardAccessory />
      </SafeAreaView>
    </KeyboardDismissView>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  passwordInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  eyeButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
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
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.error + '40',
    marginBottom: spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.error,
    lineHeight: 20,
  },
  disableButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  disableButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.error,
  },
  helpText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
});
