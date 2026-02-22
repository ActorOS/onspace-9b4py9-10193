import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const PRIVACY_DISCLOSURE_KEY = 'privacy_disclosure_seen';

export default function PrivacyDisclosureScreen() {
  const router = useRouter();

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem(PRIVACY_DISCLOSURE_KEY, 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save privacy disclosure flag:', error);
      router.replace('/(tabs)');
    }
  };

  const handleViewPrivacyNotice = () => {
    router.push('/settings/privacy');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="privacy-tip" size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>Privacy & Data</Text>

        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>
            ActorOS collects anonymous usage data during this pilot to improve the experience.
          </Text>
          <Text style={styles.bodyText}>
            This includes app opens and exercise activity (started/completed/abandoned), session IDs, and timestamps.
          </Text>
          <Text style={styles.bodyText}>
            We do not record audio, private notes, or role materials.
          </Text>
          <Text style={styles.bodyText}>
            If you choose to share your email, it's stored securely and never shared.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.secondaryButton} onPress={handleViewPrivacyNotice}>
          <Text style={styles.secondaryButtonText}>View Privacy Notice</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.background} />
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
    paddingTop: spacing.xxl,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  bodyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  bodyText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
});
