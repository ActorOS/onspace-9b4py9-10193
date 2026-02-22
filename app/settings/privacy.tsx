import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function PrivacyNoticeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Notice</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* What we collect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What we collect</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.bulletPoint}>• Anonymous device identifier</Text>
              <Text style={styles.bulletPoint}>• App usage events (app open, exercise started/completed/abandoned)</Text>
              <Text style={styles.bulletPoint}>• Session IDs and timestamps</Text>
              <Text style={styles.bulletPoint}>• Optional email address (if provided)</Text>
            </View>
          </View>

          {/* What we do not collect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What we do not collect</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.bulletPoint}>• Audio recordings</Text>
              <Text style={styles.bulletPoint}>• Personal performance content</Text>
              <Text style={styles.bulletPoint}>• Private notes</Text>
              <Text style={styles.bulletPoint}>• Role materials</Text>
            </View>
          </View>

          {/* Why we collect this */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why we collect this</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.bodyText}>
                To understand what's useful, improve clarity and flow, and make ActorOS more reliable during the pilot.
              </Text>
            </View>
          </View>

          {/* Data storage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data storage</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.bodyText}>
                Data is stored securely using OnSpace Cloud (Supabase-compatible backend).
              </Text>
            </View>
          </View>

          {/* Email addresses */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email addresses</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.bodyText}>
                If you provide your email, it may be used for ActorOS updates, feature releases, and event invites. You can opt out at any time.
              </Text>
            </View>
          </View>

          {/* Contact / deletion */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact / deletion</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.bodyText}>
                To request deletion of your email or pilot data, contact: contact@onspace.ai
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Last updated: 2026-02-22</Text>
          </View>
        </View>
      </ScrollView>
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
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.title,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.normal,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bulletPoint: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  bodyText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
});
