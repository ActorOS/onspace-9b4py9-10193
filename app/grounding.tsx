import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { returnSessionStorage } from '@/services/returnSessionStorage';
import { sessionStorage } from '@/services/sessionStorage';

export default function GroundingScreen() {
  const router = useRouter();

  const handleReturned = async () => {
    try {
      // Get the active work session
      const activeSession = await sessionStorage.getActiveSession();
      
      if (activeSession) {
        // Complete the active work session
        await sessionStorage.updateSession(activeSession.id, {
          exitedAt: new Date().toISOString(),
          returnCompletedAt: new Date().toISOString(),
        });
      }

      // Log the return session
      const roleId = activeSession?.roleId || await returnSessionStorage.getActiveRoleId();
      await returnSessionStorage.saveReturnSession({
        createdAt: new Date().toISOString(),
        roleId,
        source: 'release_return',
        completed: true,
        completionType: 'exercise',
        notes: 'Full return to self completed',
      });

      // Navigate to home where Recent Work will show the completed session
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete session:', error);
      Alert.alert('Error', 'Failed to complete session');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Release & Return</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Intro */}
          <View style={styles.introCard}>
            <MaterialIcons name="spa" size={40} color={colors.primary} />
            <Text style={styles.introTitle}>Return to Yourself</Text>
            <Text style={styles.introText}>
              Choose an exercise to help separate from the character and 
              return to your own identity.
            </Text>
          </View>

          {/* Exercise Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Release Exercises</Text>

            <Pressable 
              style={styles.exerciseCard}
              onPress={() => router.push('/return/exercise-breathing')}
            >
              <View style={styles.exerciseIcon}>
                <MaterialIcons name="air" size={28} color={colors.primary} />
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>Breathing and Release</Text>
                <Text style={styles.exerciseDescription}>
                  Return your nervous system to baseline
                </Text>
                <View style={styles.exerciseMeta}>
                  <MaterialIcons name="schedule" size={14} color={colors.textTertiary} />
                  <Text style={styles.exerciseTime}>5 min</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </Pressable>

            <Pressable 
              style={styles.exerciseCard}
              onPress={() => router.push('/return/exercise-bodyscan')}
            >
              <View style={styles.exerciseIcon}>
                <MaterialIcons name="self-improvement" size={28} color={colors.accent} />
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>Body Scan</Text>
                <Text style={styles.exerciseDescription}>
                  Release character tension held in the body
                </Text>
                <View style={styles.exerciseMeta}>
                  <MaterialIcons name="schedule" size={14} color={colors.textTertiary} />
                  <Text style={styles.exerciseTime}>10 min</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </Pressable>

            <Pressable 
              style={styles.exerciseCard}
              onPress={() => router.push('/return/exercise-identity-light')}
            >
              <View style={styles.exerciseIcon}>
                <MaterialIcons name="psychology" size={28} color={colors.primary} />
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>Identity Separation (Light)</Text>
                <Text style={styles.exerciseDescription}>
                  Quick separation from role
                </Text>
                <View style={styles.exerciseMeta}>
                  <MaterialIcons name="schedule" size={14} color={colors.textTertiary} />
                  <Text style={styles.exerciseTime}>3 min</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </Pressable>

            <Pressable 
              style={styles.exerciseCard}
              onPress={() => router.push('/return/exercise-identity')}
            >
              <View style={styles.exerciseIcon}>
                <MaterialIcons name="psychology" size={28} color={colors.accent} />
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>Identity Separation (Standard)</Text>
                <Text style={styles.exerciseDescription}>
                  Guided prompts to distinguish self from character
                </Text>
                <View style={styles.exerciseMeta}>
                  <MaterialIcons name="schedule" size={14} color={colors.textTertiary} />
                  <Text style={styles.exerciseTime}>10 min</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </Pressable>

            <Pressable 
              style={styles.exerciseCard}
              onPress={() => router.push('/return/exercise-identity-full')}
            >
              <View style={styles.exerciseIcon}>
                <MaterialIcons name="psychology" size={28} color={colors.textPrimary} />
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>Identity Separation (Full)</Text>
                <Text style={styles.exerciseDescription}>
                  Deep separation + full return to self
                </Text>
                <View style={styles.exerciseMeta}>
                  <MaterialIcons name="schedule" size={14} color={colors.textTertiary} />
                  <Text style={styles.exerciseTime}>12 min</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </Pressable>
          </View>

          {/* Quick Return */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Return to Self</Text>
            
            <View style={styles.quickResetGrid}>
              <Pressable 
                style={styles.quickResetButton}
                onPress={() => router.push('/return/quick-name')}
              >
                <MaterialIcons name="person" size={24} color={colors.primary} />
                <Text style={styles.quickResetText}>I am [Your Name]</Text>
              </Pressable>

              <Pressable 
                style={styles.quickResetButton}
                onPress={() => router.push('/return/quick-location')}
              >
                <MaterialIcons name="place" size={24} color={colors.primary} />
                <Text style={styles.quickResetText}>Where I Am</Text>
              </Pressable>

              <Pressable 
                style={styles.quickResetButton}
                onPress={() => router.push('/return/quick-date')}
              >
                <MaterialIcons name="today" size={24} color={colors.primary} />
                <Text style={styles.quickResetText}>Today's Date</Text>
              </Pressable>

              <Pressable 
                style={styles.quickResetButton}
                onPress={() => router.push('/return/quick-movement')}
              >
                <MaterialIcons name="directions-walk" size={24} color={colors.primary} />
                <Text style={styles.quickResetText}>Move Body</Text>
              </Pressable>
            </View>
          </View>

          {/* Support & Safety */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support & Safety</Text>
            
            <View style={styles.supportCard}>
              <View style={styles.supportHeader}>
                <MaterialIcons name="support-agent" size={24} color={colors.textPrimary} />
                <Text style={styles.supportTitle}>
                  If you are experiencing severe distress or feel unsafe
                </Text>
              </View>
              
              <Text style={styles.supportText}>
                Please reach out for professional help:
              </Text>

              <View style={styles.contactsList}>
                <View style={styles.contactRegion}>
                  <Text style={styles.contactRegionLabel}>UK</Text>
                  <Text style={styles.contactNumber}>Samaritans: 116 123</Text>
                  <Text style={styles.contactNumber}>NHS: 111</Text>
                  <Text style={styles.contactNumber}>Emergency: 999</Text>
                </View>

                <View style={styles.contactRegion}>
                  <Text style={styles.contactRegionLabel}>US</Text>
                  <Text style={styles.contactNumber}>988 Suicide & Crisis Lifeline</Text>
                  <Text style={styles.contactNumber}>Emergency: 911</Text>
                </View>

                <View style={styles.contactRegion}>
                  <Text style={styles.contactRegionLabel}>Global</Text>
                  <Text style={styles.contactLink}>findahelpline.com</Text>
                </View>
              </View>
            </View>

            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerText}>
                Actor OS is not a medical or therapy service. This app provides tools for professional actors to manage role boundaries and emotional containment. If you need clinical support, please contact a licensed mental health provider.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [
            styles.doneButton,
            pressed && { backgroundColor: colors.primaryDark, transform: [{ scale: 0.98 }] }
          ]}
          onPress={handleReturned}
        >
          <Text style={styles.doneButtonText}>I Have Returned</Text>
          <MaterialIcons name="check" size={20} color="#FFFFFF" />
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
  closeButton: {
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
  },
  introText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: typography.weights.medium,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  exerciseDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  exerciseTime: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  quickResetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickResetButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickResetText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  supportCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    marginBottom: spacing.md,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  supportTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  supportText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  contactsList: {
    gap: spacing.lg,
  },
  contactRegion: {
    gap: spacing.xs,
  },
  contactRegionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs / 2,
  },
  contactNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  contactLink: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  disclaimerCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: 16,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 20,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  doneButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
