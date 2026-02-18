import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { userSettingsStorage } from '@/services/userSettingsStorage';
import { getSupabaseClient } from '@/template';

export default function StayConnectedScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (emailInput: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(emailInput);
  };

  const handleSkip = async () => {
    try {
      // Mark that user has seen this screen
      await userSettingsStorage.markEmailSubscribed();
    } catch (error) {
      console.error('Failed to save skip status:', error);
    }
    // Route to home
    router.replace('/(tabs)');
  };

  const handleContinue = async () => {
    setError('');

    // Validate email format
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      
      // Insert directly into marketing_subscribers table
      const { error: insertError } = await supabase
        .from('marketing_subscribers')
        .insert({
          email: email.trim().toLowerCase(),
          source: 'post_onboarding',
        });

      if (insertError) {
        // Check if duplicate email (code 23505 is unique violation in Postgres)
        if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
          // Treat duplicate as success - user already subscribed
          console.log('Email already subscribed, continuing...');
        } else {
          // Other error - show inline error and allow retry
          console.error('Subscription error:', insertError);
          setError('Could not subscribe right now. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Success - mark as subscribed and navigate to home
      await userSettingsStorage.markEmailSubscribed();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Subscription failed:', error);
      setError('Could not subscribe right now. Please try again.');
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

        <Text style={styles.title}>Get ActorOS updates</Text>
        <Text style={styles.bodyText}>
          Feature releases, event invites, and new recovery tools. Optional.
        </Text>

        <View style={styles.formContainer}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(''); // Clear error on typing
            }}
            placeholder="your@email.com"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
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
          <Text style={styles.secondaryButtonText}>Skip for now</Text>
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
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
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
