import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { roleStorage, type Role } from '@/services/roleStorage';
import { tierStorage } from '@/services/tierStorage';
import { UpgradePrompt } from '@/components';

export default function RolesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const allRoles = showArchived 
        ? await roleStorage.getArchivedRoles()
        : await roleStorage.getActiveRoles();
      setRoles(allRoles);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoles();
    }, [showArchived])
  );

  const openRoles = roles.filter(r => r.status === 'open');
  const heldRoles = roles.filter(r => r.status === 'held');
  const closedRoles = roles.filter(r => r.status === 'closed');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Role Containers</Text>
          <Text style={styles.subtitle}>Roles you have held</Text>
          
          {/* Archive Toggle */}
          <Pressable 
            style={styles.archiveToggle}
            onPress={() => setShowArchived(!showArchived)}
          >
            <MaterialIcons 
              name={showArchived ? 'unarchive' : 'archive'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={styles.archiveToggleText}>
              {showArchived ? 'View Active' : 'View Archived'}
            </Text>
          </Pressable>
        </View>

        {/* Open Roles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Open roles</Text>
            <Pressable 
              style={styles.addButton}
              onPress={async () => {
                const activeRoles = roles.filter(r => r.status === 'open' || r.status === 'held');
                const canCreate = await tierStorage.canCreateRole(activeRoles.length);
                if (canCreate) {
                  router.push('/role/entry');
                } else {
                  setShowUpgradePrompt(true);
                }
              }}
            >
              <MaterialIcons name="add" size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>New Role</Text>
            </Pressable>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : openRoles.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="menu-book" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyStateText}>No open roles</Text>
              <Text style={styles.emptyStateSubtext}>
                Open a role container when work begins
              </Text>
            </View>
          ) : (
            openRoles.map(role => (
              <Pressable 
                key={role.id}
                style={styles.roleCard}
                onPress={() => router.push(`/role/${role.id}`)}
              >
                <View style={styles.roleCardHeader}>
                  <Text style={styles.roleCardTitle}>{role.characterName}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </View>
                <Text style={styles.roleCardSubtitle}>{role.production}</Text>
                {role.productionType && (
                  <View style={styles.roleCardTag}>
                    <Text style={styles.roleCardTagText}>{role.productionType}</Text>
                  </View>
                )}
              </Pressable>
            ))
          )}
        </View>

        {/* Held Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Held roles</Text>
          {heldRoles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.placeholder}>Roles you are carrying between sessions</Text>
            </View>
          ) : (
            heldRoles.map(role => (
              <Pressable 
                key={role.id}
                style={styles.roleCard}
                onPress={() => router.push(`/role/${role.id}`)}
              >
                <View style={styles.roleCardHeader}>
                  <Text style={styles.roleCardTitle}>{role.characterName}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </View>
                <Text style={styles.roleCardSubtitle}>{role.production}</Text>
              </Pressable>
            ))
          )}
        </View>

        {/* Closed Roles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Closed roles</Text>
          {closedRoles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.placeholder}>Roles you have formally released</Text>
            </View>
          ) : (
            closedRoles.map(role => (
              <Pressable 
                key={role.id}
                style={styles.roleCard}
                onPress={() => router.push(`/role/${role.id}`)}
              >
                <View style={styles.roleCardHeader}>
                  <Text style={styles.roleCardTitle}>{role.characterName}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </View>
                <Text style={styles.roleCardSubtitle}>{role.production}</Text>
                {role.closedAt && (
                  <Text style={styles.roleCardMeta}>
                    Closed {new Date(role.closedAt).toLocaleDateString()}
                  </Text>
                )}
              </Pressable>
            ))
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="Multiple Role Containers"
        description="Free tier allows one active role at a time. Pro unlocks unlimited role containers for overlapping work."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.title,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.title,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.normal,
  },
  archiveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  archiveToggleText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacing.sectionHeader,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  placeholder: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  loadingState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  roleCardTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    letterSpacing: 0,
  },
  roleCardSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  roleCardTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  roleCardTagText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.normal,
  },
  roleCardMeta: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
