import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { roleStorage, type Role } from '@/services/roleStorage';
import { sessionStorage, type WorkSession } from '@/services/sessionStorage';

export default function InWorkScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<WorkSession | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) {
      router.replace('/');
      return;
    }

    setIsLoading(true);
    try {
      const allSessions = await sessionStorage.getAllSessions();
      const currentSession = allSessions.find(s => s.id === sessionId);
      
      if (!currentSession) {
        router.replace('/');
        return;
      }

      const allRoles = await roleStorage.getAllRoles();
      const currentRole = allRoles.find(r => r.id === currentSession.roleId);

      setSession(currentSession);
      setRole(currentRole || null);
    } catch (error) {
      console.error('Failed to load session:', error);
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitWork = () => {
    router.push(`/check-in/post?sessionId=${sessionId}`);
  };

  if (isLoading || !session || !role) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const entryTime = new Date(session.enteredAt);
  const now = new Date();
  const durationMs = now.getTime() - entryTime.getTime();
  const durationMinutes = Math.floor(durationMs / 60000);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="circle" size={12} color={colors.success} />
        <Text style={styles.headerTitle}>In Work</Text>
        <View style={{ width: 12 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          
          {/* Current Role Display */}
          <View style={styles.roleCard}>
            <View style={styles.roleCardHeader}>
              <MaterialIcons name="person-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.roleTitle}>{role.characterName}</Text>
            <Text style={styles.roleSubtitle}>{role.production}</Text>
            {session.sessionType && (
              <View style={styles.sessionTypeBadge}>
                <Text style={styles.sessionTypeBadgeText}>{session.sessionType}</Text>
              </View>
            )}
          </View>

          {/* Session Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="access-time" size={20} color={colors.textSecondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Time in work</Text>
                <Text style={styles.infoValue}>
                  {durationMinutes < 60 
                    ? `${durationMinutes} minutes` 
                    : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
                  }
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="login" size={20} color={colors.textSecondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Entered at</Text>
                <Text style={styles.infoValue}>
                  {entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            {session.entryBoundaryNote && (
              <View style={[styles.infoRow, styles.boundaryNote]}>
                <MaterialIcons name="shield" size={20} color={colors.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Your boundary</Text>
                  <Text style={styles.boundaryText}>{session.entryBoundaryNote}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Reminder Card */}
          <View style={styles.reminderCard}>
            <MaterialIcons name="info-outline" size={24} color={colors.accent} />
            <Text style={styles.reminderText}>
              You are holding this character. When you are ready to release, exit work below.
            </Text>
          </View>

          {/* Quick Notes Section (Placeholder for future) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Notes</Text>
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>
                Notes and observations will be available here
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={styles.exitButton}
          onPress={handleExitWork}
        >
          <MaterialIcons name="logout" size={20} color={colors.background} />
          <Text style={styles.exitButtonText}>Exit Work</Text>
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
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  roleCardHeader: {
    marginBottom: spacing.md,
  },
  roleTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0,
  },
  roleSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sessionTypeBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
  },
  sessionTypeBadgeText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  boundaryNote: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs / 2,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  boundaryText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  reminderText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  placeholderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  exitButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
