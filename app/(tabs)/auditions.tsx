import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { auditionStorage, type Audition } from '@/services/auditionStorage';

export default function AuditionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [auditions, setAuditions] = useState<Audition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuditions = async () => {
    setIsLoading(true);
    try {
      const allAuditions = await auditionStorage.getAllAuditions();
      // Sort by date descending (newest first)
      const sorted = allAuditions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAuditions(sorted);
    } catch (error) {
      console.error('Failed to load auditions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAuditions();
    }, [])
  );

  // Filter auditions by status
  const waitingAuditions = auditions.filter(a => a.status === 'waiting');
  const releasedAuditions = auditions.filter(a => a.status === 'released');
  
  // Stats calculations
  const totalAuditions = auditions.length;
  const callbacksCount = auditions.filter(a => a.stage === 'callback').length;
  const castCount = auditions.filter(a => a.stage === 'cast' || a.status === 'booked').length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Audition Aftermath</Text>
          <Text style={styles.subtitle}>Hold the waiting, silence, and release</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalAuditions}</Text>
            <Text style={styles.statLabel}>Auditions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{callbacksCount}</Text>
            <Text style={styles.statLabel}>Callbacks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{castCount}</Text>
            <Text style={styles.statLabel}>Cast</Text>
          </View>
        </View>

        {/* Add Button */}
        <View style={styles.section}>
          <Pressable 
            style={styles.addButton}
            onPress={() => router.push('/audition/record')}
          >
            <MaterialIcons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.addButtonText}>Record Audition</Text>
          </Pressable>
        </View>

        {/* Waiting Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waiting for response</Text>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : waitingAuditions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="schedule" size={40} color={colors.textTertiary} />
              <Text style={styles.emptyStateText}>No auditions in waiting</Text>
              <Text style={styles.emptyStateSubtext}>The silence is held here</Text>
            </View>
          ) : (
            waitingAuditions.map(audition => (
              <Pressable 
                key={audition.id} 
                style={styles.auditionCard}
                onPress={() => router.push(`/audition/${audition.id}`)}
              >
                <View style={styles.auditionCardHeader}>
                  <View style={styles.auditionCardMain}>
                    <Text style={styles.auditionTitle}>{audition.projectTitle}</Text>
                    {audition.roleName && (
                      <Text style={styles.auditionRole}>{audition.roleName}</Text>
                    )}
                    {audition.companyOrCasting && (
                      <Text style={styles.auditionCompany}>{audition.companyOrCasting}</Text>
                    )}
                  </View>
                  <View style={styles.auditionCardMeta}>
                    <View style={[styles.stageBadge, styles[`stageBadge_${audition.stage}`]]}>
                      <Text style={styles.stageBadgeText}>
                        {audition.stage === 'audition' ? 'Audition' : 
                         audition.stage === 'callback' ? 'Callback' : 'Cast'}
                      </Text>
                    </View>
                    <Text style={styles.auditionDate}>{formatDate(audition.date)}</Text>
                  </View>
                </View>
                {audition.notes && (
                  <Text style={styles.auditionNotes} numberOfLines={2}>{audition.notes}</Text>
                )}
              </Pressable>
            ))
          )}
        </View>

        {/* Released Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Released auditions</Text>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : releasedAuditions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.placeholder}>Roles you have let go</Text>
            </View>
          ) : (
            releasedAuditions.map(audition => (
              <Pressable 
                key={audition.id} 
                style={styles.auditionCard}
                onPress={() => router.push(`/audition/${audition.id}`)}
              >
                <View style={styles.auditionCardHeader}>
                  <View style={styles.auditionCardMain}>
                    <Text style={[styles.auditionTitle, styles.releasedText]}>{audition.projectTitle}</Text>
                    {audition.roleName && (
                      <Text style={[styles.auditionRole, styles.releasedText]}>{audition.roleName}</Text>
                    )}
                  </View>
                  <Text style={styles.auditionDate}>{formatDate(audition.date)}</Text>
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
    letterSpacing: typography.letterSpacing.normal,
  },
  statsCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacing.sectionHeader,
    marginBottom: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButtonText: {
    fontSize: typography.sizes.md,
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
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  placeholder: {
    fontSize: typography.sizes.md,
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
  auditionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  auditionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  auditionCardMain: {
    flex: 1,
  },
  auditionCardMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  auditionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  auditionRole: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  auditionCompany: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  auditionDate: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  stageBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  stageBadge_audition: {
    backgroundColor: 'rgba(138, 157, 122, 0.2)',
  },
  stageBadge_callback: {
    backgroundColor: 'rgba(180, 150, 100, 0.2)',
  },
  stageBadge_cast: {
    backgroundColor: 'rgba(138, 157, 122, 0.3)',
  },
  stageBadgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.normal,
    fontWeight: typography.weights.semibold,
  },
  auditionNotes: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  releasedText: {
    opacity: 0.6,
  },
});
