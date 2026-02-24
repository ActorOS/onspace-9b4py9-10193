import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { RETURN_HUB_PATH } from '@/hooks/useReturnHubBack';

type IdentityTier = {
  id: string;
  title: string;
  duration: string;
  description: string;
  route: string;
};

const IDENTITY_TIERS: IdentityTier[] = [
  {
    id: 'light',
    title: 'Identity Separation — Light',
    duration: '3 min',
    description: 'Gentle distinction from role',
    route: '/return/exercise-identity-light',
  },
  {
    id: 'standard',
    title: 'Identity Separation — Standard',
    duration: '10 min',
    description: 'Structured return to self',
    route: '/return/exercise-identity',
  },
  {
    id: 'full',
    title: 'Identity Separation — Full Release',
    duration: '8 min',
    description: 'Deep separation after immersive work',
    route: '/return/exercise-identity-full',
  },
];

export default function IdentitySeparationChooseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = (params.returnTo as string) || RETURN_HUB_PATH;

  const handleSelectTier = (tier: IdentityTier) => {
    router.push({ pathname: tier.route as any, params: { returnTo } });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace(returnTo)} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Identity Separation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Intro Section */}
          <View style={styles.introSection}>
            <MaterialIcons name="psychology" size={48} color={colors.primary} style={{ marginBottom: spacing.md }} />
            <Text style={styles.title}>Choose Depth of{'\n'}Separation</Text>
            <Text style={styles.subtitle}>
              Select the version that matches the intensity of your work session
            </Text>
          </View>

          {/* Tier Cards */}
          <View style={styles.tiersSection}>
            {IDENTITY_TIERS.map((tier) => (
              <Pressable
                key={tier.id}
                style={({ pressed }) => [
                  styles.tierCard,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => handleSelectTier(tier)}
              >
                <View style={styles.tierIcon}>
                  <MaterialIcons 
                    name="psychology" 
                    size={32} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.tierContent}>
                  <Text style={styles.tierTitle}>{tier.title}</Text>
                  <Text style={styles.tierDescription}>{tier.description}</Text>
                  <View style={styles.tierMeta}>
                    <MaterialIcons name="schedule" size={14} color={colors.textSecondary} />
                    <Text style={styles.tierDuration}>{tier.duration}</Text>
                  </View>
                </View>
                <MaterialIcons 
                  name="chevron-right" 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </Pressable>
            ))}
          </View>

          {/* Info Text */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              All versions are voice-led and hands-free once started. Choose based on how much time and depth you need.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [
            styles.backToListButton,
            pressed && { opacity: 0.7 }
          ]}
          onPress={() => router.replace(returnTo)}
        >
          <Text style={styles.backToListButtonText}>Back to Exercise List</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    padding: spacing.lg,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  tiersSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tierContent: {
    flex: 1,
  },
  tierTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  tierDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tierMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  tierDuration: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  infoSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  backToListButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backToListButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
});
