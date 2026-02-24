import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { tierStorage } from '@/services/tierStorage';
import { UpgradePrompt } from '@/components';
import { RETURN_HUB_PATH } from '@/hooks/useReturnHubBack';

type RecoveryTier = {
  id: string;
  title: string;
  duration: string;
  description: string;
  route: string;
  requiresPro: boolean;
  icon: string;
};

const RECOVERY_TIERS: RecoveryTier[] = [
  {
    id: 'light',
    title: 'Light Recovery',
    duration: '5 minutes',
    description: 'Subtle reset after rehearsal or light character work. Quick body awareness and gentle release.',
    route: '/return/exercise-recovery-light',
    requiresPro: false,
    icon: 'wb-sunny',
  },
  {
    id: 'standard',
    title: 'Standard Recovery',
    duration: '10 minutes',
    description: 'Restore balance after performance or demanding scenes. Deeper somatic release and grounding.',
    route: '/return/exercise-recovery-standard',
    requiresPro: true,
    icon: 'brightness-medium',
  },
  {
    id: 'full',
    title: 'Full Recovery',
    duration: '15 minutes',
    description: 'Complete recovery after emotionally or physically intense work. Full-body release and integration.',
    route: '/return/exercise-recovery',
    requiresPro: true,
    icon: 'brightness-high',
  },
];

export default function RecoveryTiersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = (params.returnTo as string) || RETURN_HUB_PATH;
  const insets = useSafeAreaInsets();
  const [isPro, setIsPro] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [selectedTier, setSelectedTier] = useState<RecoveryTier | null>(null);

  useEffect(() => {
    checkTier();
  }, []);

  const checkTier = async () => {
    const tier = await tierStorage.getTier();
    setIsPro(tier === 'pro');
  };

  const handleSelectTier = (tier: RecoveryTier) => {
    if (tier.requiresPro && !isPro) {
      setSelectedTier(tier);
      setShowUpgradePrompt(true);
      return;
    }
    router.replace({ pathname: tier.route, params: { returnTo } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace(returnTo)} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Full Body Recovery</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, spacing.xl) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="spa" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Choose Your Recovery Level</Text>
          <Text style={styles.subtitle}>
            Select the intensity that matches your current needs after this work
          </Text>
        </View>

        <View style={styles.tiersSection}>
          {RECOVERY_TIERS.map((tier) => {
            const isLocked = tier.requiresPro && !isPro;
            return (
              <Pressable
                key={tier.id}
                style={({ pressed }) => [
                  styles.tierCard,
                  isLocked && styles.tierCardLocked,
                  pressed && !isLocked && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => handleSelectTier(tier)}
              >
                <View style={styles.tierHeader}>
                  <View style={[styles.tierIconContainer, isLocked && styles.tierIconContainerLocked]}>
                    <MaterialIcons 
                      name={tier.icon as any} 
                      size={32} 
                      color={isLocked ? colors.textTertiary : colors.primary} 
                    />
                  </View>
                  {isLocked && (
                    <View style={styles.lockBadge}>
                      <MaterialIcons name="lock" size={16} color={colors.textTertiary} />
                    </View>
                  )}
                </View>

                <View style={styles.tierContent}>
                  <View style={styles.tierTitleRow}>
                    <Text style={[styles.tierTitle, isLocked && styles.tierTitleLocked]}>
                      {tier.title}
                    </Text>
                    {isLocked && (
                      <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.tierDuration, isLocked && styles.tierDurationLocked]}>
                    {tier.duration}
                  </Text>
                  <Text style={[styles.tierDescription, isLocked && styles.tierDescriptionLocked]}>
                    {tier.description}
                  </Text>
                </View>

                <View style={styles.tierFooter}>
                  <MaterialIcons 
                    name="chevron-right" 
                    size={28} 
                    color={isLocked ? colors.textTertiary : colors.primary} 
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoHeadline}>What to expect</Text>
            <Text style={styles.infoText}>
              All recovery exercises are voice-led and hands-free. Choose based on how much time and depth you need right now.
            </Text>
          </View>
        </View>
      </ScrollView>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature={selectedTier?.title || 'Advanced Recovery Exercises'}
        description={`Pro unlocks ${selectedTier?.title} and other extended recovery exercises for deeper post-performance integration.`}
      />
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  tiersSection: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  tierCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
  },
  tierCardLocked: {
    opacity: 0.6,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  tierIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierIconContainerLocked: {
    backgroundColor: colors.border,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierContent: {
    gap: spacing.sm,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tierTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  tierTitleLocked: {
    color: colors.textSecondary,
  },
  tierDuration: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  tierDurationLocked: {
    color: colors.textTertiary,
  },
  tierDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tierDescriptionLocked: {
    color: colors.textTertiary,
  },
  tierFooter: {
    alignItems: 'flex-end',
    marginTop: spacing.md,
  },
  proBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  proBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.xl,
  },
  infoHeadline: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
