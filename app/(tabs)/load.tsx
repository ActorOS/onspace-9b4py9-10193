import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { aftereffectsStorage, type Aftereffect } from '@/services/aftereffectsStorage';
import { roleStorage, type Role } from '@/services/roleStorage';

type TimeFilter = 'week' | 'month' | 'year';

export default function LoadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [aftereffects, setAftereffects] = useState<Aftereffect[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const loadData = async () => {
    try {
      const allAftereffects = await aftereffectsStorage.getAllAftereffects();
      const allRoles = await roleStorage.getAllRoles();
      setAftereffects(allAftereffects);
      setRoles(allRoles);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Filter aftereffects by time range
  const getFilteredAftereffects = () => {
    const now = new Date();
    const cutoffDate = new Date();

    if (timeFilter === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeFilter === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }

    return aftereffects.filter(a => new Date(a.createdAt) >= cutoffDate);
  };

  const filteredAftereffects = getFilteredAftereffects();
  const hasData = filteredAftereffects.length > 0;

  // Calculate role influence
  const getRoleInfluence = () => {
    if (!hasData || roles.length === 0) return [];

    const roleFrequency: { [key: string]: { role: Role; count: number } } = {};

    filteredAftereffects.forEach(aftereffect => {
      if (aftereffect.roleId) {
        const role = roles.find(r => r.id === aftereffect.roleId);
        if (role) {
          if (!roleFrequency[role.id]) {
            roleFrequency[role.id] = { role, count: 0 };
          }
          roleFrequency[role.id].count++;
        }
      }
    });

    return Object.values(roleFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const roleInfluence = getRoleInfluence();

  // Get visualization data based on time filter
  const getVisualizationData = () => {
    if (!hasData) return [];

    // Density based on time filter
    let maxPoints = 21; // Week: ~3 per day
    if (timeFilter === 'month') {
      maxPoints = 60; // Month: ~2 per day
    } else if (timeFilter === 'year') {
      maxPoints = 120; // Year: ~10 per month
    }

    // Map aftereffects to visualization points
    const points = filteredAftereffects.slice(-maxPoints);
    return points;
  };

  const visualizationData = getVisualizationData();

  // Gentle load visualization with smooth transitions
  const renderLoadVisualization = () => {
    if (!hasData) {
      return (
        <Animated.View 
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(400)}
          style={styles.chartEmpty}
        >
          <MaterialIcons name="show-chart" size={48} color={colors.textTertiary} />
          <Text style={styles.chartEmptyText}>Not enough data yet</Text>
          <Text style={styles.chartEmptySubtext}>
            Check in regularly to see patterns over time
          </Text>
        </Animated.View>
      );
    }

    const screenWidth = Dimensions.get('window').width - (spacing.lg * 2) - (spacing.xl * 2);
    
    // Calculate dot size and spacing based on time filter for density variation
    let dotSize = 6;
    let dotGap = spacing.sm;
    if (timeFilter === 'month') {
      dotSize = 5;
      dotGap = spacing.xs;
    } else if (timeFilter === 'year') {
      dotSize = 4;
      dotGap = spacing.xs;
    }

    const maxDotsPerRow = Math.floor(screenWidth / (dotSize + dotGap));
    const displayData = visualizationData.slice(-maxDotsPerRow * 4); // Show last 4 rows max

    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(400)}
        style={styles.chartContainer}
        key={`${timeFilter}-${displayData.length}`}
      >
        <View style={styles.dotsGrid}>
          {displayData.map((aftereffect, index) => {
            // Subtle opacity variation based on recency, not intensity
            const recencyOpacity = 0.3 + (index / displayData.length) * 0.5;
            
            return (
              <Animated.View
                key={`${aftereffect.id}-${index}`}
                entering={FadeIn.delay(index * 15).duration(300)}
                style={[
                  styles.dot,
                  {
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    opacity: recencyOpacity,
                  }
                ]}
              />
            );
          })}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Load</Text>
          <Text style={styles.subtitle}>What you are carrying from work</Text>
        </View>

        {/* Check-In Card (Primary Action) */}
        <View style={styles.section}>
          <Pressable 
            style={styles.checkInCard}
            onPress={() => router.push('/check-in/load-check')}
          >
            <MaterialIcons name="add-circle-outline" size={32} color={colors.primary} />
            <Text style={styles.checkInText}>Check what you are carrying</Text>
            <Text style={styles.checkInSubtext}>
              Notice what is still with you from recent work
            </Text>
          </Pressable>
        </View>

        {/* Time Filter */}
        <View style={styles.section}>
          <View style={styles.timelineButtons}>
            <Pressable 
              style={[styles.timelineButton, timeFilter === 'week' && styles.timelineButtonActive]}
              onPress={() => setTimeFilter('week')}
            >
              <Text style={[
                styles.timelineButtonText,
                timeFilter === 'week' && styles.timelineButtonTextActive
              ]}>
                Week
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.timelineButton, timeFilter === 'month' && styles.timelineButtonActive]}
              onPress={() => setTimeFilter('month')}
            >
              <Text style={[
                styles.timelineButtonText,
                timeFilter === 'month' && styles.timelineButtonTextActive
              ]}>
                Month
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.timelineButton, timeFilter === 'year' && styles.timelineButtonActive]}
              onPress={() => setTimeFilter('year')}
            >
              <Text style={[
                styles.timelineButtonText,
                timeFilter === 'year' && styles.timelineButtonTextActive
              ]}>
                Year
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Load Overview (Visual) */}
        <View style={styles.section}>
          {renderLoadVisualization()}
        </View>

        {/* Role Influence */}
        {hasData && roleInfluence.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Roles contributing to load</Text>
            {roleInfluence.map(({ role, count }) => (
              <View key={role.id} style={styles.roleInfluenceCard}>
                <View style={styles.roleInfluenceMain}>
                  <Text style={styles.roleInfluenceName}>{role.characterName}</Text>
                  <Text style={styles.roleInfluenceProduction}>{role.production}</Text>
                </View>
                <View style={styles.roleInfluenceMeta}>
                  <Text style={styles.roleInfluenceFrequency}>
                    {count === 1 ? 'Recent' : count < 3 ? 'Present' : 'Frequently present'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Gentle Closing Copy */}
        <View style={styles.closingSection}>
          <Text style={styles.closingText}>
            Noticing is enough. Release happens in its own time.
          </Text>
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
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.normal,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacing.normal,
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
  checkInCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkInText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  checkInSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  timelineButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timelineButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineButtonActive: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
  },
  timelineButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  timelineButtonTextActive: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 140,
    justifyContent: 'center',
  },
  dotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    backgroundColor: colors.textSecondary,
  },
  chartEmpty: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 180,
    justifyContent: 'center',
  },
  chartEmptyText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  chartEmptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  roleInfluenceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleInfluenceMain: {
    flex: 1,
  },
  roleInfluenceName: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  roleInfluenceProduction: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },
  roleInfluenceMeta: {
    alignItems: 'flex-end',
  },
  roleInfluenceFrequency: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  closingSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  closingText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
