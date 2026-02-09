import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { somaticExitStorage, type SomaticTrack } from '@/services/somaticExitStorage';
import { tierStorage } from '@/services/tierStorage';
import { UpgradePrompt } from '@/components';

export default function SelectSomaticTrackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const sessionId = params.sessionId as string | undefined;
  const roleId = params.roleId as string | undefined;

  const [tracks, setTracks] = useState<SomaticTrack[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    const allTracks = somaticExitStorage.getTracks();
    setTracks(allTracks);
    
    const tier = await tierStorage.getTier();
    setIsPro(tier === 'pro');
  };

  const handleSelectTrack = (track: SomaticTrack) => {
    if (!track.freeAccess && !isPro) {
      setShowUpgradePrompt(true);
      return;
    }

    router.push({
      pathname: '/somatic/play-track',
      params: {
        trackType: track.type,
        sessionId,
        roleId,
      },
    });
  };

  const handleSkip = () => {
    // Skip directly to grounding/return screen
    router.replace('/grounding');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Somatic Exit</Text>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Intro */}
          <View style={styles.introCard}>
            <MaterialIcons name="self-improvement" size={40} color={colors.primary} />
            <Text style={styles.introTitle}>Choose a Somatic Exit Track</Text>
            <Text style={styles.introText}>
              Short, body-based cool-down exercises to help you physically release role residue and return to self.
            </Text>
          </View>

          {/* Tracks */}
          <View style={styles.section}>
            {tracks.map(track => {
              const isLocked = !track.freeAccess && !isPro;
              
              return (
                <Pressable
                  key={track.type}
                  style={[styles.trackCard, isLocked && styles.trackCardLocked]}
                  onPress={() => handleSelectTrack(track)}
                >
                  <View style={styles.trackIcon}>
                    <MaterialIcons 
                      name={track.icon as any} 
                      size={28} 
                      color={isLocked ? colors.textTertiary : colors.primary} 
                    />
                  </View>
                  <View style={styles.trackContent}>
                    <View style={styles.trackHeader}>
                      <Text style={[styles.trackTitle, isLocked && styles.trackTitleLocked]}>
                        {track.title}
                      </Text>
                      {isLocked && (
                        <View style={styles.proBadge}>
                          <MaterialIcons name="lock" size={12} color="#FFFFFF" />
                          <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.trackSubtitle, isLocked && styles.trackSubtitleLocked]}>
                      {track.subtitle}
                    </Text>
                    <View style={styles.trackMeta}>
                      <MaterialIcons 
                        name="schedule" 
                        size={14} 
                        color={isLocked ? colors.textTertiary : colors.textSecondary} 
                      />
                      <Text style={[styles.trackDuration, isLocked && styles.trackDurationLocked]}>
                        {track.duration}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons 
                    name="chevron-right" 
                    size={24} 
                    color={isLocked ? colors.border : colors.textTertiary} 
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={colors.accent} />
            <Text style={styles.infoText}>
              These tracks are body-focused and non-therapeutic. They help mark the transition out of work without emotional analysis.
            </Text>
          </View>
        </View>
      </ScrollView>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="Full Somatic Exit Library"
        description="Pro unlocks all professional cool-down tracks for sustained performance work. Free tier includes General Body Release."
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
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
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
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  introTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  introText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.xl,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackCardLocked: {
    opacity: 0.6,
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  trackContent: {
    flex: 1,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  trackTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  trackTitleLocked: {
    color: colors.textSecondary,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
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
  trackSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  trackSubtitleLocked: {
    color: colors.textTertiary,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  trackDuration: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  trackDurationLocked: {
    color: colors.textTertiary,
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
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
