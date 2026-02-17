import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (emailInput: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(emailInput);
  };

  const handleEmailPasswordAuth = async () => {
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();

      if (mode === 'signup') {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: password,
          options: {
            data: {
              email: email.trim().toLowerCase(),
            },
          },
        });

        if (error) {
          Alert.alert('Sign Up Failed', error.message || 'Unable to create account.');
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // Check if email confirmation is required
          if (data.user.identities && data.user.identities.length === 0) {
            Alert.alert(
              'Confirm Your Email',
              'Please check your email and click the confirmation link to activate your account.',
              [{ text: 'OK', onPress: () => setMode('login') }]
            );
            setIsLoading(false);
            return;
          }

          // Proceed to email updates
          router.replace('/email-updates?source=post_onboarding');
        }
      } else {
        // Log in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password,
        });

        if (error) {
          Alert.alert('Login Failed', error.message || 'Invalid email or password.');
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // Proceed to email updates
          router.replace('/email-updates?source=post_onboarding');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Alert.alert(
      'Google Sign-In',
      'Google authentication requires additional setup. For now, please use email and password.',
      [{ text: 'OK' }]
    );
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Login',
      'You can explore Actor OS without an account, but your data will only be stored locally on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue Without Account', onPress: () => router.replace('/(tabs)') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <MaterialIcons name="person" size={64} color={colors.primary} />
            <Text style={styles.title}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Sign in to sync your work across devices'
                : 'Join Actor OS to save and sync your data'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <Pressable
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            )}

            <Pressable
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleEmailPasswordAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <MaterialIcons name="login" size={20} color={colors.textPrimary} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>

            <Pressable
              style={styles.switchMode}
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
              disabled={isLoading}
            >
              <Text style={styles.switchModeText}>
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <Text style={styles.switchModeLink}>
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </Pressable>

            <Pressable
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  passwordToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    paddingHorizontal: spacing.md,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  googleButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  switchMode: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  switchModeLink: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  skipButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
