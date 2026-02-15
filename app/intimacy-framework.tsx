import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type Section = {
  id: string;
  title: string;
  content: string;
};

const FRAMEWORK_SECTIONS: Section[] = [
  {
    id: 'context',
    title: 'Context & Narrative Purpose',
    content: 'Intimacy in performance serves the story and character objectives. It is a technical skill requiring the same professional preparation as stage combat or dance. The work is contextualised within the narrative, not personal experience.',
  },
  {
    id: 'consent',
    title: 'Consent & Boundaries',
    content: 'All physical contact is pre-negotiated and agreed upon by all participants. Boundaries are defined before rehearsal begins and can be adjusted at any point. Consent is ongoing and can be withdrawn without explanation or penalty.',
  },
  {
    id: 'communication',
    title: 'Clear Communication Protocol',
    content: 'Participants use clear verbal communication to establish comfort levels, request adjustments, and signal pauses. A shared vocabulary for body parts, movements, and boundaries ensures clarity and reduces ambiguity.',
  },
  {
    id: 'choreography',
    title: 'Choreographed Movement',
    content: 'Intimate physical action is choreographed in repeatable sequences, similar to fight choreography. This removes improvisation and ensures consistency, predictability, and safety across performances.',
  },
  {
    id: 'protective',
    title: 'Protective Measures',
    content: 'Industry-standard modesty garments, barriers, and positioning techniques are used to maintain professional distance. Closed sets, limited observers, and privacy protocols protect performer dignity.',
  },
  {
    id: 'environment',
    title: 'Controlled Environment',
    content: 'Intimacy work takes place in structured, supervised environments with designated intimacy coordinators or directors trained in consent-based practices. The space is controlled, time-limited, and professionally managed.',
  },
  {
    id: 'closure',
    title: 'Closure & Separation',
    content: 'Following intimate work, performers engage in intentional closure practices to separate from the physical and emotional content. This may include verbal acknowledgment, physical grounding, or a transition ritual to mark the end of the work.',
  },
];

const CHECKLIST_ITEMS = [
  'Has choreography been discussed?',
  'Are boundaries clearly defined?',
  'Is there a pause protocol?',
  'Is there a check-out plan?',
];

export default function IntimacyFrameworkScreen() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Intimacy Work Framework</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Industry-aligned practices for structured and professional intimacy work.
          </Text>

          <View style={styles.introCard}>
            <Text style={styles.introText}>
              Intimate scenes in professional performance environments are structured, choreographed, 
              and consent-based. These principles help separate personal experience from technical work.
            </Text>
          </View>

          {/* Framework Sections */}
          <View style={styles.sectionsContainer}>
            {FRAMEWORK_SECTIONS.map((section, index) => {
              const isExpanded = expandedSections.has(section.id);
              return (
                <View key={section.id} style={styles.sectionCard}>
                  <Pressable
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(section.id)}
                  >
                    <View style={styles.sectionNumber}>
                      <Text style={styles.sectionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <MaterialIcons
                      name={isExpanded ? 'expand-less' : 'expand-more'}
                      size={24}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                  {isExpanded && (
                    <View style={styles.sectionContent}>
                      <Text style={styles.sectionText}>{section.content}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Checklist Section */}
          <View style={styles.checklistCard}>
            <Text style={styles.checklistTitle}>Before Participating in Intimacy Work</Text>
            <Text style={styles.checklistSubtitle}>
              Ensure these foundational elements are in place:
            </Text>
            <View style={styles.checklistItems}>
              {CHECKLIST_ITEMS.map((item, index) => (
                <View key={index} style={styles.checklistItem}>
                  <View style={styles.checklistBullet} />
                  <Text style={styles.checklistItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>
              This framework reflects industry standards for professional intimacy coordination. 
              It is informational only and does not constitute training or certification. 
              Professional intimacy work should be supervised by qualified intimacy coordinators 
              or directors trained in consent-based practices.
            </Text>
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
  subtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  introText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  sectionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  sectionTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  sectionContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingLeft: spacing.lg + 32 + spacing.md,
  },
  sectionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  checklistCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checklistTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  checklistSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  checklistItems: {
    gap: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checklistBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textPrimary,
    marginTop: 7,
  },
  checklistItemText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    lineHeight: 20,
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
    color: colors.textSecondary,
    lineHeight: 16,
    textAlign: 'center',
  },
});
