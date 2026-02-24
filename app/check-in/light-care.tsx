import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const CARE_OPTIONS = [
  { id: 'breath', label: 'Breath', icon: 'air' },
  { id: 'intention', label: 'Clear intention', icon: 'center-focus-strong' },
  { id: 'boundary', label: 'Time boundary', icon: 'schedule' },
  { id: 'aftercare', label: 'Aftercare planned', icon: 'favorite' },
];

export default function LightCareScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const toggleOption = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    // Pass data forward to confirm screen
    const sessionData = {
      ...params,
      careOptions: selectedOptions.join(','),
      careNote: note,
    };
    
    router.replace({
      pathname: '/check-in/confirm-enter',
      params: sessionData,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Hold it gently</Text>
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
        <View style={styles.content}>
          <MaterialIcons name="emoji-nature" size={48} color={colors.success} />
          <Text style={styles.question}>What would help you hold this gently today?</Text>
          <Text style={styles.subtitle}>Choose what feels right</Text>

          <View style={styles.optionsGrid}>
            {CARE_OPTIONS.map(option => (
              <Pressable
                key={option.id}
                style={[
                  styles.optionChip,
                  selectedOptions.includes(option.id) && styles.optionChipSelected,
                ]}
                onPress={() => toggleOption(option.id)}
              >
                <MaterialIcons
                  name={option.icon as any}
                  size={24}
                  color={selectedOptions.includes(option.id) ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    selectedOptions.includes(option.id) && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedOptions.includes(option.id) && (
                  <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Add a note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Anything else to remember..."
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={200}
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  optionLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  noteSection: {
    width: '100%',
    marginTop: spacing.xl,
  },
  noteLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
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
  continueButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
