import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { tierStorage } from '@/services/tierStorage';
import { UpgradePrompt } from '@/components';

type IdentityTier = {
  id: string;
  title: string;
  description: string;
  route: string;
  requiresPro: boolean;
};

const IDENTITY_TIERS: IdentityTier[] = [
  {
    id: 'light',
    title: 'Identity Separation — Light',
    description: 'Quick separation from role',
    route: '/return/exercise-identity-light',
    requiresPro: false,
  },
  {
    id: 'standard',
    title: 'Identity Separation — Standard',
    description: 'Structured return to self',
    route: '/return/exercise-identity',
    requiresPro: true,
  },
  {
    id: 'full',
    title: 'Identity Separation — Full Release',
    description: 'Deep separation after immersive work',
    route: '/return/exercise-identity-full',
    requiresPro: true,
  },
];

export default function IdentitySeparationTiersScreen() {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [selectedTier, setSelectedTier] = useState<IdentityTier | null>(null);

  useEffect(() => {
    checkTier();
  }, []);

  const checkTier = async () => {
    const tier = await tierStorage.getTier();
    setIsPro(tier === 'pro');
  };

  const handleSelectTier = (tier: IdentityTier) => {
    if (tier.requiresPro && !isPro) {
      setSelectedTier(tier);
      setShowUpgradePrompt(true);
      return;
    }
    router.push(tier.route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
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
            <MaterialIcons name="psychology" size={56} color={colors.primary} style={{ marginBottom: spacing.lg }} />
            <Text style={styles.title}>Identity Separation</Text>
            <Text style={styles.subtitle}>
              Choose the level of separation that matches your needs.
            </Text>
          </View>

          {/* Tier Cards */}
          <View style={styles.tiersSection}>
            {IDENTITY_TIERS.map((tier) => {
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
                  <View style={styles.tierIcon}>
                    <MaterialIcons 
                      name="psychology" 
                      size={32} 
                      color={isLocked ? colors.textTertiary : colors.primary} 
                    />
                  </View>
                  <View style={styles.tierContent}>
                    <View style={styles.tierHeader}>
                      <Text style={[styles.tierTitle, isLocked && styles.tierTitleLocked]}>{tier.title}</Text>
                      {isLocked && (
                        <View style={styles.proBadge}>
                          <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.tierDescription, isLocked && styles.tierDescriptionLocked]}>{tier.description}</Text>
                  </View>
                  {isLocked && <MaterialIcons name="lock" size={20} color={colors.textTertiary} style={{ marginRight: spacing.xs }} />}
                  <MaterialIcons 
                    name="chevron-right" 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              All versions are voice-led and hands-free once started. Choose based on how much time and depth you need to separate from the role.
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
          onPress={() => router.back()}
        >
          <Text style={styles.backToListButtonText}>Back to Exercise List</Text>
        </Pressable>
      </View>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature={selectedTier?.title || 'Identity Separation'}
        description={`Pro unlocks ${selectedTier?.title} and other advanced identity separation exercises.`}
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
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    padding: spacing.lg,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
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
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  tierCardLocked: {
    opacity: 0.6,
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
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  tierTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  tierTitleLocked: {
    color: colors.textSecondary,
  },
  tierDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tierDescriptionLocked: {
    color: colors.textTertiary,
  },
  proBadge: {
    paddingHorizontal: spacing.xs,
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
