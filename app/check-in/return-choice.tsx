import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { sessionStorage } from '@/services/sessionStorage';

export default function ReturnChoiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const sessionId = params.sessionId as string | undefined;
  const [workloadLevel, setWorkloadLevel] = useState<'light' | 'medium' | 'heavy' | null>(null);

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    if (!sessionId) return;
    try {
      const session = await sessionStorage.getSessionById(sessionId);
      if (session) {
        setWorkloadLevel(session.workloadLevel || session.heaviness || null);
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  };

  const handleRecommendedRelease = () => {
    // Route based on workload intensity
    if (!workloadLevel) {
      // Default to breathing if no workload data
      router.replace('/return/exercise-breathing');
      return;
    }

    switch (workloadLevel) {
      case 'light':
        router.replace('/return/exercise-breathing');
        break;
      case 'medium':
        router.replace('/return/exercise-bodyscan');
        break;
      case 'heavy':
        router.replace('/return/exercise-identity');
        break;
      default:
        router.replace('/return/exercise-breathing');
    }
  };

  const handleReturnToSelf = () => {
    // Route to breath settling (voice-led grounding)
    router.replace({
      pathname: '/somatic/play-track',
      params: { 
        trackId: 'breath_settling',
        trackName: 'Breath Settling',
        fromPostWork: 'true'
      }
    });
  };

  const handleSomaticRelease = () => {
    // Route to body scan (body-led release)
    router.replace('/return/exercise-bodyscan');
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Return</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>How would you like{'\n'}to return?</Text>
            <Text style={styles.subtitle}>Choose what feels right after this work</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsSection}>
            {/* Option 1: Recommended Release */}
            <Pressable
              style={({ pressed }) => [
                styles.optionCard,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={handleRecommendedRelease}
            >
              <View style={styles.optionIcon}>
                <MaterialIcons name="recommend" size={32} color={colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Recommended Release</Text>
                <Text style={styles.optionDescription}>Based on your workload today</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </Pressable>

            {/* Option 2: Return to Self */}
            <Pressable
              style={({ pressed }) => [
                styles.optionCard,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={handleReturnToSelf}
            >
              <View style={styles.optionIcon}>
                <MaterialIcons name="person" size={32} color={colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Return to Self</Text>
                <Text style={styles.optionDescription}>Grounding and identity re-orientation</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </Pressable>

            {/* Option 3: Somatic Release */}
            <Pressable
              style={({ pressed }) => [
                styles.optionCard,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={handleSomaticRelease}
            >
              <View style={styles.optionIcon}>
                <MaterialIcons name="spa" size={32} color={colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Somatic Release</Text>
                <Text style={styles.optionDescription}>Body-led discharge and release</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [
            styles.skipButton,
            pressed && { opacity: 0.7 }
          ]}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
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
    flex: 1,
    padding: spacing.lg,
  },
  titleSection: {
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
  },
  optionsSection: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  optionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  skipButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
});
