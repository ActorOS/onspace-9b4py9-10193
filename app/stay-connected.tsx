import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { userTokenStorage } from '@/services/userTokenStorage';
import { getSupabaseClient } from '@/template';

export default function StayConnectedScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [consentUpdates, setConsentUpdates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailInput: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(emailInput);
  };

  const handleSkip = async () => {
    try {
      // Generate anonymous token and store locally
      await userTokenStorage.getOrCreateToken();
      // Route to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to generate token:', error);
      // Continue anyway
      router.replace('/(tabs)');
    }
  };

  const handleContinue = async () => {
    // Validate email if provided
    if (email.trim() && !validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      // Get or create local user token
      const userToken = await userTokenStorage.getOrCreateToken();

      // Call backend Edge Function to register
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.functions.invoke('register-user', {
        body: {
          email: email.trim().toLowerCase() || null,
          consent_updates: consentUpdates,
          user_token: userToken,
          source: 'post_onboarding'
        }
      });

      if (error) {
        console.error('Registration error:', error);
        Alert.alert('Error', 'Could not connect right now. Your data is saved locally.');
        router.replace('/(tabs)');
        return;
      }

      // Success - route to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Connection failed:', error);
      // Don't block the user - let them continue
      Alert.alert('Notice', 'Your data is saved locally on this device.');
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="link" size={64} color={colors.textSecondary} />
        </View>

        <Text style={styles.title}>Stay Connected</Text>
        <Text style={styles.bodyText}>
          Add your email to save your progress and receive ActorOS updates. Optional.
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com (optional)"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Pressable 
            style={styles.checkboxRow} 
            onPress={() => !isLoading && setConsentUpdates(!consentUpdates)}
          >
            <View style={[styles.checkbox, consentUpdates && styles.checkboxChecked]}>
              {consentUpdates && (
                <MaterialIcons name="check" size={16} color={colors.background} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I'd like to receive updates from ActorOS.
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={styles.primaryButtonText}>Continue</Text>
          )}
        </Pressable>

        <Pressable 
          style={styles.secondaryButton} 
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Skip</Text>
        </Pressable>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  bodyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  formContainer: {
    width: '100%',
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
    marginBottom: spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
