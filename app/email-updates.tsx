import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';
import { userSettingsStorage } from '@/services/userSettingsStorage';

export default function EmailUpdatesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const source = (params.source as string) || 'settings';
  const isPostOnboarding = source === 'post_onboarding';
  
  const [email, setEmail] = useState('');
  const [consented, setConsented] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    loadUserEmail();
  }, []);

  const loadUserEmail = async () => {
    // No auth required - email updates are optional
  };

  const validateEmail = (emailInput: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(emailInput);
  };

  const handleSubscribe = async () => {
    // Validate email
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Require consent
    if (!consented) {
      Alert.alert('Consent Required', 'Please confirm you consent to receive email updates.');
      return;
    }

    setIsLoading(true);

    try {
      // This feature is deprecated in favor of the lightweight stay-connected flow
      // Kept for settings access only
      Alert.alert(
        'Feature Unavailable',
        'Email updates are now managed through the Stay Connected screen during onboarding.'
      );
      setIsLoading(false);
      return;

      /* Deprecated subscription flow
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc('subscribe_marketing', {
        p_email: email.trim().toLowerCase(),
        p_source: isPostOnboarding ? 'post_onboarding' : source,
        p_tags: ['updates']
      });
      */

      if (error) {
        console.error('Subscription error:', error);
        Alert.alert('Error', 'Could not subscribe right now. Please try again.');
        setIsLoading(false);
        return;
      }

      // Check response
      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          setIsSubscribed(true);
          
          // Mark as subscribed in local storage
          await userSettingsStorage.markEmailSubscribed();
        } else {
          Alert.alert('Error', data.error || 'Could not subscribe right now. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Could not subscribe right now. Please try again.');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      Alert.alert('Error', 'Could not subscribe right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (isPostOnboarding) {
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {!isPostOnboarding && source !== 'onboarding' && (
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <MaterialIcons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        )}
        <Text style={styles.headerTitle}>
          {isPostOnboarding ? 'ActorOS Updates' : 'Email Updates'}
        </Text>
        {!isPostOnboarding && source !== 'onboarding' && <View style={styles.headerButton} />}
      </View>

      <View style={styles.content}>
        {!isSubscribed ? (
          <>
            <View style={styles.iconContainer}>
              <MaterialIcons name="mail-outline" size={64} color={colors.textSecondary} />
            </View>

            <Text style={styles.bodyText}>
              {isPostOnboarding 
                ? 'Receive ActorOS updates, new protocol releases, and curated event invitations. Optional.'
                : 'Get ActorOS pilot updates, feature releases, and event invites. Optional.'}
            </Text>

            <View style={styles.formContainer}>
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

              <Pressable 
                style={styles.checkboxRow} 
                onPress={() => !isLoading && setConsented(!consented)}
              >
                <View style={[styles.checkbox, consented && styles.checkboxChecked]}>
                  {consented && (
                    <MaterialIcons name="check" size={16} color={colors.background} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  I consent to receive email updates from ActorOS.
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.successContainer}>
            <MaterialIcons name="check-circle" size={80} color={colors.accent} />
            <Text style={styles.successTitle}>Subscribed.</Text>
            <Text style={styles.successText}>
              You'll receive ActorOS updates at {email}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {!isSubscribed ? (
          <>
            <Pressable 
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
              onPress={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.primaryButtonText}>Subscribe</Text>
              )}
            </Pressable>

            {isPostOnboarding && (
              <Pressable 
                style={styles.secondaryButton} 
                onPress={handleSkip}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>Skip</Text>
              </Pressable>
            )}
          </>
        ) : (
          <Pressable style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>
              {isPostOnboarding ? 'Continue to ActorOS' : 'Done'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
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
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
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
