import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { releaseStackStorage, type ReleaseStack } from '@/services/releaseStackStorage';
import { tierStorage } from '@/services/tierStorage';
import { UpgradePrompt } from '@/components';

export default function ReleaseStackListScreen() {
  const router = useRouter();
  const [stacks, setStacks] = useState<ReleaseStack[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadStacks();
      checkTier();
    }, [])
  );

  const loadStacks = async () => {
    const allStacks = await releaseStackStorage.getStacks();
    setStacks(allStacks);
  };

  const checkTier = async () => {
    const tier = await tierStorage.getTier();
    setIsPro(tier === 'pro');
  };

  const handleCreateStack = () => {
    if (!isPro && stacks.length >= 1) {
      setShowUpgradePrompt(true);
      return;
    }
    router.push('/release-stack/select-exercises');
  };

  const handleDeleteStack = (id: string, name: string) => {
    Alert.alert(
      'Delete Stack',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await releaseStackStorage.deleteStack(id);
            loadStacks();
          },
        },
      ]
    );
  };

  const handleDuplicateStack = async (id: string) => {
    if (!isPro && stacks.length >= 1) {
      setShowUpgradePrompt(true);
      return;
    }
    try {
      await releaseStackStorage.duplicateStack(id);
      loadStacks();
    } catch (error) {
      Alert.alert('Error', 'Failed to duplicate stack');
    }
  };

  const getTotalDuration = (stack: ReleaseStack) => {
    // Rough estimates in minutes
    const exerciseDurations: { [key: string]: number } = {
      'breathing': 8,
      'bodyscan': 12,
      'movement': 3,
      'identity-light': 3,
      'identity': 10,
      'identity-full': 12,
      'recovery-light': 5,
      'recovery-standard': 10,
      'recovery': 15,
      'grounding': 7,
      'intimacy': 8,
    };

    const total = stack.exercises.reduce((sum, ex) => {
      const duration = exerciseDurations[ex.id] || 5;
      return sum + duration;
    }, 0);

    const pauseTime = stack.addPausesBetween ? (stack.exercises.length - 1) * 0.17 : 0; // 10 seconds = ~0.17 min
    return Math.round(total + pauseTime);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Release Stack</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.introCard}>
            <MaterialIcons name="layers" size={40} color={colors.primary} />
            <Text style={styles.introTitle}>Custom Recovery Flows</Text>
            <Text style={styles.introText}>
              Build your own release sequence using existing exercises. 
              Stacks play back-to-back automatically.
            </Text>
          </View>

          {!isPro && (
            <View style={styles.limitCard}>
              <MaterialIcons name="info-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.limitText}>
                Free: 1 stack maximum. PRO: Unlimited stacks + duplication.
              </Text>
            </View>
          )}

          {stacks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="layers" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Stacks Yet</Text>
              <Text style={styles.emptyText}>
                Create your first custom release flow
              </Text>
            </View>
          ) : (
            <View style={styles.stacksList}>
              {stacks.map(stack => (
                <Pressable
                  key={stack.id}
                  style={styles.stackCard}
                  onPress={() => router.push(`/release-stack/play?id=${stack.id}`)}
                >
                  <View style={styles.stackCardHeader}>
                    <View style={styles.stackCardMain}>
                      <Text style={styles.stackCardTitle}>{stack.name}</Text>
                      <Text style={styles.stackCardMeta}>
                        {stack.exercises.length} exercise{stack.exercises.length !== 1 ? 's' : ''} · ~{getTotalDuration(stack)} min
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
                  </View>

                  {stack.suggestAfterHeavy && (
                    <View style={styles.stackBadge}>
                      <MaterialIcons name="star" size={14} color={colors.textSecondary} />
                      <Text style={styles.stackBadgeText}>Suggested for heavy workload</Text>
                    </View>
                  )}

                  <View style={styles.stackActions}>
                    {isPro && (
                      <Pressable
                        style={styles.stackActionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDuplicateStack(stack.id);
                        }}
                      >
                        <MaterialIcons name="content-copy" size={18} color={colors.textSecondary} />
                        <Text style={styles.stackActionText}>Duplicate</Text>
                      </Pressable>
                    )}
                    <Pressable
                      style={styles.stackActionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/release-stack/edit?id=${stack.id}`);
                      }}
                    >
                      <MaterialIcons name="edit" size={18} color={colors.textSecondary} />
                      <Text style={styles.stackActionText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={styles.stackActionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteStack(stack.id, stack.name);
                      }}
                    >
                      <MaterialIcons name="delete" size={18} color={colors.error} />
                      <Text style={[styles.stackActionText, { color: colors.error }]}>Delete</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [
            styles.createButton,
            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
          ]}
          onPress={handleCreateStack}
        >
          <MaterialIcons name="add" size={20} color={colors.background} />
          <Text style={styles.createButtonText}>Create New Stack</Text>
        </Pressable>
      </View>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="Unlimited Release Stacks"
        description="Pro unlocks unlimited custom release stacks, duplication, and advanced sequencing options."
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
  content: {
    padding: spacing.lg,
  },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  introTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  introText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  limitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  limitText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  stacksList: {
    gap: spacing.md,
  },
  stackCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stackCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  stackCardMain: {
    flex: 1,
  },
  stackCardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  stackCardMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  stackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginBottom: spacing.sm,
  },
  stackBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  stackActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  stackActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  stackActionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  createButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
