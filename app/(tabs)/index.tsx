import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { roleStorage, type Role } from '@/services/roleStorage';
import { sessionStorage, type WorkSession } from '@/services/sessionStorage';
import { trackAppOpen } from '@/services/usageTracking';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeRoles, setActiveRoles] = useState<Role[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const hasTrackedAppOpen = useRef(false);

  const loadActiveRoles = async () => {
    setIsLoading(true);
    try {
      const allRoles = await roleStorage.getActiveRoles();
      // Filter: status IN ("open", "held") and NOT archived
      // Sort: newest first (createdAt descending)
      // Limit: 3
      const filtered = allRoles
        .filter(r => (r.status === 'open' || r.status === 'held') && !r.archived)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      setActiveRoles(filtered);
    } catch (error) {
      console.error('Failed to load active roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const sessions = await sessionStorage.getRecentSessions(5);
      setRecentSessions(sessions);
    } catch (error) {
      console.error('Failed to load recent sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadActiveRoles();
      loadRecentSessions();
      
      // Track app_open only once per session
      if (!hasTrackedAppOpen.current) {
        trackAppOpen();
        hasTrackedAppOpen.current = true;
      }
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatDuration = (enteredAt: string, exitedAt?: string) => {
    if (!exitedAt) return 'In progress';
    const start = new Date(enteredAt);
    const end = new Date(exitedAt);
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getLoadColor = (heaviness?: string) => {
    switch (heaviness) {
      case 'light': return colors.success;
      case 'medium': return colors.warning;
      case 'heavy': return colors.error;
      default: return colors.textTertiary;
    }
  };

  const getLoadLabel = (heaviness?: string) => {
    if (!heaviness) return 'Unknown';
    return heaviness.charAt(0).toUpperCase() + heaviness.slice(1);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeading}>Home</Text>
          <Text style={styles.pageTagline}>A place to return to yourself</Text>
        </View>

        {/* Top Anchor */}
        <View style={styles.anchorSection}>
          <Text style={styles.anchorText}>What are you carrying today?</Text>
          <Text style={styles.anchorSubtext}>
            Check in before you enter or release work.
          </Text>
        </View>

        {/* Current Roles Section */}
        <View style={styles.firstSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Roles</Text>
            <Pressable onPress={() => router.push('/roles')}>
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : activeRoles.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="menu-book" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyStateText}>No active roles</Text>
              <Text style={styles.emptyStateSubtext}>
                Open a role container to begin
              </Text>
              <Pressable 
                style={styles.emptyActionButton}
                onPress={() => router.push('/role/entry')}
              >
                <Text style={styles.emptyActionButtonText}>Open Role Container</Text>
              </Pressable>
            </View>
          ) : (
            activeRoles.map(role => (
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
                <View style={styles.roleCardFooter}>
                  <View style={[styles.statusBadge, role.status === 'open' && styles.statusBadgeOpen]}>
                    <Text style={styles.statusBadgeText}>
                      {role.status === 'open' ? 'Open' : 'Held'}
                    </Text>
                  </View>
                  {role.productionType && (
                    <Text style={styles.roleCardMeta}>· {role.productionType}</Text>
                  )}
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Containment Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Containment Tools</Text>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/check-in/flow')}
          >
            <MaterialIcons name="play-circle-outline" size={24} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Enter Work</Text>
              <Text style={styles.actionSubtext}>Begin with intention.</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </Pressable>

          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/grounding')}
          >
            <MaterialIcons name="spa" size={24} color={colors.accent} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Return to Self</Text>
              <Text style={styles.actionSubtext}>Release and ground</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </Pressable>

          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/release-stack/list')}
          >
            <MaterialIcons name="layers" size={24} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>My Release Stack</Text>
              <Text style={styles.actionSubtext}>Custom recovery flows</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </Pressable>

          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/intimacy-framework')}
          >
            <MaterialIcons name="info-outline" size={24} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Intimacy Work Framework</Text>
              <Text style={styles.actionSubtext}>Industry practices for structured work</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Recent Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Work</Text>
          
          {isLoadingSessions ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : recentSessions.length === 0 ? (
            <View style={styles.recentWorkEmpty}>
              <Text style={styles.recentWorkEmptyText}>No recent work held yet.</Text>
              <Text style={styles.recentWorkEmptySubtext}>
                When you enter and exit roles, they appear here.
              </Text>
            </View>
          ) : (
            recentSessions.map(session => (
              <Pressable
                key={session.id}
                style={styles.sessionCard}
                onPress={() => router.push(`/session/${session.id}`)}
              >
                <View style={styles.sessionCardHeader}>
                  <View style={styles.sessionCardMain}>
                    <Text style={styles.sessionCardRole}>{session.roleName || 'Unknown Role'}</Text>
                    <Text style={styles.sessionCardProduction}>{session.production || ''}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </View>
                <View style={styles.sessionCardMeta}>
                  <View style={styles.sessionMetaItem}>
                    <MaterialIcons name="calendar-today" size={14} color={colors.textTertiary} />
                    <Text style={styles.sessionMetaText}>{formatDate(session.exitedAt || session.enteredAt)}</Text>
                  </View>
                  <View style={styles.sessionMetaItem}>
                    <MaterialIcons name="schedule" size={14} color={colors.textTertiary} />
                    <Text style={styles.sessionMetaText}>{formatDuration(session.enteredAt, session.exitedAt)}</Text>
                  </View>
                  <View style={[styles.sessionLoadBadge, { backgroundColor: getLoadColor(session.heaviness) + '20' }]}>
                    <Text style={[styles.sessionLoadText, { color: getLoadColor(session.heaviness) }]}>
                      {getLoadLabel(session.heaviness)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
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
  pageHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  pageHeading: {
    fontSize: typography.sizes.title,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.normal,
    marginBottom: spacing.xs,
  },
  pageTagline: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: 22,
    opacity: 0.9,
  },
  anchorSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  anchorText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 26,
  },
  anchorSubtext: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  firstSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  viewAllText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  placeholder: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recentWorkEmpty: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentWorkEmptyText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  recentWorkEmptySubtext: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  placeholderSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
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
    marginBottom: spacing.md,
  },
  emptyActionButton: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyActionButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.normal,
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
    marginBottom: spacing.sm,
  },
  roleCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  statusBadgeOpen: {
    backgroundColor: 'rgba(138, 157, 122, 0.2)',
  },
  statusBadgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.normal,
    fontWeight: typography.weights.semibold,
  },
  roleCardMeta: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  actionSubtext: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  sessionCardMain: {
    flex: 1,
  },
  sessionCardRole: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
    letterSpacing: 0,
  },
  sessionCardProduction: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },
  sessionCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  sessionMetaText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  sessionLoadBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  sessionLoadText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.normal,
  },
});
