import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type Step = 'duration' | 'ritual';
type DurationType = '15' | '30' | '60' | 'custom';
type RitualType = 'breathing' | 'bodyscan' | 'identity';

const DURATION_OPTIONS = [
  { id: '15', label: '15 min', minutes: 15 },
  { id: '30', label: '30 min', minutes: 30 },
  { id: '60', label: '60 min', minutes: 60 },
  { id: 'custom', label: 'Custom', minutes: 0 },
];

const RITUAL_OPTIONS = [
  { id: 'breathing', label: 'Breathing', icon: 'air', description: '5 minutes of guided breath' },
  { id: 'bodyscan', label: 'Body scan', icon: 'self-improvement', description: 'Release tension physically' },
  { id: 'identity', label: 'Identity separation', icon: 'person-outline', description: 'Remind yourself who you are' },
];

export default function HeavyContainmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [currentStep, setCurrentStep] = useState<Step>('duration');
  const [duration, setDuration] = useState<DurationType | null>(null);
  const [customMinutes, setCustomMinutes] = useState('');
  const [ritual, setRitual] = useState<RitualType | null>(null);
  const [remindMe, setRemindMe] = useState(false);

  const selectDuration = (type: DurationType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDuration(type);
  };

  const selectRitual = (type: RitualType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRitual(type);
  };

  const handleNextStep = () => {
    if (currentStep === 'duration' && duration) {
      setCurrentStep('ritual');
    }
  };

  const handleContinue = () => {
    if (!duration || !ritual) return;

    const finalMinutes = duration === 'custom' ? parseInt(customMinutes) || 30 : 
                         DURATION_OPTIONS.find(d => d.id === duration)?.minutes || 30;

    const sessionData = {
      ...params,
      containmentDuration: finalMinutes.toString(),
      exitRitual: ritual,
      remindToExit: remindMe.toString(),
    };
    
    router.replace({
      pathname: '/check-in/confirm-enter',
      params: sessionData,
    });
  };

  const canProceedDuration = duration && (duration !== 'custom' || (customMinutes && parseInt(customMinutes) > 0));
  const canProceedRitual = ritual;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => currentStep === 'ritual' ? setCurrentStep('duration') : router.back()} 
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Containment plan</Text>
          <Text style={styles.headerSubtitle}>2 minutes to set a boundary</Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, spacing.xl) + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'duration' && (
          <View style={styles.content}>
            <MaterialIcons name="schedule" size={48} color={colors.error} />
            <Text style={styles.question}>How long will you work?</Text>
            <Text style={styles.subtitle}>Set a clear time boundary</Text>

            <View style={styles.optionsGrid}>
              {DURATION_OPTIONS.map(option => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.durationOption,
                    duration === option.id && styles.durationOptionSelected,
                  ]}
                  onPress={() => selectDuration(option.id as DurationType)}
                >
                  <Text
                    style={[
                      styles.durationLabel,
                      duration === option.id && styles.durationLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {duration === option.id && (
                    <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>

            {duration === 'custom' && (
              <View style={styles.customInput}>
                <TextInput
                  style={styles.customInputField}
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  placeholder="Enter minutes"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={styles.customInputLabel}>minutes</Text>
              </View>
            )}
          </View>
        )}

        {currentStep === 'ritual' && (
          <View style={styles.content}>
            <MaterialIcons name="exit-to-app" size={48} color={colors.error} />
            <Text style={styles.question}>How will you exit?</Text>
            <Text style={styles.subtitle}>Choose your exit ritual</Text>

            <View style={styles.optionsGrid}>
              {RITUAL_OPTIONS.map(option => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.ritualOption,
                    ritual === option.id && styles.ritualOptionSelected,
                  ]}
                  onPress={() => selectRitual(option.id as RitualType)}
                >
                  <View style={styles.ritualHeader}>
                    <MaterialIcons
                      name={option.icon as any}
                      size={32}
                      color={ritual === option.id ? colors.primary : colors.textSecondary}
                    />
                    {ritual === option.id && (
                      <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.ritualLabel,
                      ritual === option.id && styles.ritualLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.ritualDescription}>{option.description}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.reminderToggle}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRemindMe(!remindMe);
              }}
            >
              <View style={styles.reminderContent}>
                <MaterialIcons name="notifications" size={24} color={colors.textPrimary} />
                <Text style={styles.reminderLabel}>Remind me to exit</Text>
              </View>
              <View style={[styles.toggle, remindMe && styles.toggleActive]}>
                <View style={[styles.toggleThumb, remindMe && styles.toggleThumbActive]} />
              </View>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Pressable
          style={[
            styles.continueButton,
            (currentStep === 'duration' ? !canProceedDuration : !canProceedRitual) && styles.continueButtonDisabled,
          ]}
          onPress={currentStep === 'duration' ? handleNextStep : handleContinue}
          disabled={currentStep === 'duration' ? !canProceedDuration : !canProceedRitual}
        >
          <Text style={styles.continueButtonText}>
            {currentStep === 'duration' ? 'Next' : 'Continue'}
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.background} />
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  question: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  optionsGrid: {
    width: '100%',
    gap: spacing.md,
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  durationOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  durationLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  durationLabelSelected: {
    color: colors.primary,
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  customInputField: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.primary,
    minWidth: 100,
    textAlign: 'center',
  },
  customInputLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  ritualOption: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  ritualOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  ritualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ritualLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  ritualLabelSelected: {
    color: colors.primary,
  },
  ritualDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xl,
    width: '100%',
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reminderLabel: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  toggleThumbActive: {
    marginLeft: 'auto',
  },
  bottomBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
