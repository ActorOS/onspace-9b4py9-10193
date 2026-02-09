import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { roleStorage } from '@/services/roleStorage';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const FOOTER_HEIGHT = 80;

export default function RoleEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [characterName, setCharacterName] = useState('');
  const [production, setProduction] = useState('');
  const [productionType, setProductionType] = useState('');
  const [whatRoleAsks, setWhatRoleAsks] = useState('');
  const [boundaries, setBoundaries] = useState('');
  
  // Date state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isOngoing, setIsOngoing] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const canContinueStep2 = characterName.trim() !== '' && production.trim() !== '';

  const handleClose = () => {
    router.back();
  };

  const handleNext = () => {
    if (step < 6) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await roleStorage.saveRole({
        characterName: characterName.trim(),
        production: production.trim(),
        productionType: productionType || undefined,
        whatRoleAsks: whatRoleAsks.trim() || undefined,
        boundaries: boundaries.trim() || undefined,
        status: 'open',
        startDate: startDate?.toISOString(),
        endDate: isOngoing ? undefined : endDate?.toISOString(),
        isOngoing: isOngoing || undefined,
      });
      
      router.dismiss();
    } catch (error) {
      console.error('Failed to save role:', error);
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: FOOTER_HEIGHT + Math.max(insets.bottom, spacing.md) + spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          
          {/* STEP 1: THRESHOLD ACKNOWLEDGMENT */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.centerContent}>
                <MaterialIcons name="folder-open" size={64} color={colors.primary} />
                <Text style={styles.mainTitle}>
                  You are about to open a new role container
                </Text>
                <Text style={styles.bodyText}>
                  This space will hold what this character leaves behind.
                </Text>
                <Text style={styles.bodyText}>
                  You will be able to close this container when the work ends.
                </Text>
              </View>
            </View>
          )}

          {/* STEP 2: ROLE IDENTITY */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Who will you be holding?</Text>
              
              <View style={styles.inputSection}>
                <Text style={styles.label}>Character Name</Text>
                <TextInput
                  style={styles.input}
                  value={characterName}
                  onChangeText={setCharacterName}
                  placeholder="Enter character name"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.label}>Where is this work?</Text>
                <TextInput
                  style={styles.input}
                  value={production}
                  onChangeText={setProduction}
                  placeholder="Production or project name"
                  placeholderTextColor={colors.textTertiary}
                />
                
                <Text style={styles.helperText}>Examples:</Text>
                <View style={styles.exampleChips}>
                  {['Feature film', 'Theatre production', 'Self-tape', 'Workshop'].map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.exampleChip,
                        productionType === type && styles.exampleChipSelected,
                      ]}
                      onPress={() => setProductionType(type)}
                    >
                      <Text style={[
                        styles.exampleChipText,
                        productionType === type && styles.exampleChipTextSelected,
                      ]}>
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.label}>When does this work begin and end?</Text>
                <Text style={styles.helperText}>
                  Optional — This helps prepare for closure
                </Text>
                
                {/* Start Date */}
                <Pressable 
                  style={styles.dateButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <MaterialIcons name="event" size={20} color={colors.textSecondary} />
                  <Text style={[
                    styles.dateButtonText,
                    startDate && styles.dateButtonTextSelected
                  ]}>
                    {startDate ? formatDate(startDate) : 'Start date (if known)'}
                  </Text>
                  {startDate && (
                    <Pressable 
                      onPress={(e) => {
                        e.stopPropagation();
                        setStartDate(null);
                      }}
                      hitSlop={8}
                    >
                      <MaterialIcons name="close" size={18} color={colors.textTertiary} />
                    </Pressable>
                  )}
                </Pressable>

                {showStartPicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onStartDateChange}
                    textColor={colors.textPrimary}
                    themeVariant="dark"
                  />
                )}

                {/* Ongoing Toggle */}
                <Pressable 
                  style={styles.toggleRow}
                  onPress={() => {
                    setIsOngoing(!isOngoing);
                    if (!isOngoing) {
                      setEndDate(null);
                    }
                  }}
                >
                  <View style={[
                    styles.toggleBox,
                    isOngoing && styles.toggleBoxChecked
                  ]}>
                    {isOngoing && (
                      <MaterialIcons name="check" size={16} color={colors.background} />
                    )}
                  </View>
                  <Text style={styles.toggleLabel}>This role is ongoing</Text>
                </Pressable>

                {/* End Date */}
                {!isOngoing && (
                  <>
                    <Pressable 
                      style={styles.dateButton}
                      onPress={() => setShowEndPicker(true)}
                    >
                      <MaterialIcons name="event" size={20} color={colors.textSecondary} />
                      <Text style={[
                        styles.dateButtonText,
                        endDate && styles.dateButtonTextSelected
                      ]}>
                        {endDate ? formatDate(endDate) : 'End date (if known)'}
                      </Text>
                      {endDate && (
                        <Pressable 
                          onPress={(e) => {
                            e.stopPropagation();
                            setEndDate(null);
                          }}
                          hitSlop={8}
                        >
                          <MaterialIcons name="close" size={18} color={colors.textTertiary} />
                        </Pressable>
                      )}
                    </Pressable>

                    {showEndPicker && (
                      <DateTimePicker
                        value={endDate || startDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onEndDateChange}
                        minimumDate={startDate || undefined}
                        textColor={colors.textPrimary}
                        themeVariant="dark"
                      />
                    )}
                  </>
                )}
              </View>
            </View>
          )}

          {/* STEP 3: WHAT THIS ROLE ASKS */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>What does this role ask of you?</Text>
              <Text style={styles.bodyText}>
                What will this character require you to carry?
              </Text>

              <View style={styles.inputSection}>
                <TextInput
                  style={styles.textArea}
                  value={whatRoleAsks}
                  onChangeText={setWhatRoleAsks}
                  placeholder="This is not character backstory — it's: What burden am I about to take on?"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                
                <Text style={styles.helperText}>You can leave this blank if not yet known</Text>
                
                <View style={styles.examplesCard}>
                  <Text style={styles.examplesTitle}>Examples:</Text>
                  <Text style={styles.exampleItem}>• Physical transformation</Text>
                  <Text style={styles.exampleItem}>• Emotional extremes</Text>
                  <Text style={styles.exampleItem}>• Trauma material</Text>
                  <Text style={styles.exampleItem}>• High alertness</Text>
                  <Text style={styles.exampleItem}>• Not yet known</Text>
                </View>
              </View>
            </View>
          )}

          {/* STEP 4: SET YOUR BOUNDARIES */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Set your boundaries</Text>
              <Text style={styles.bodyText}>
                What will you not carry beyond this work?
              </Text>
              <Text style={styles.bodyText}>
                What stays in the container?
              </Text>

              <View style={styles.infoCard}>
                <MaterialIcons name="shield" size={22} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidanceHeadline}>Boundaries are structure, not weakness</Text>
                  <Text style={styles.guidanceText}>
                    Setting clear boundaries protects both you and your work. They define what belongs to the character and what remains yours.
                  </Text>
                </View>
              </View>

              <View style={styles.inputSection}>
                <TextInput
                  style={styles.textArea}
                  value={boundaries}
                  onChangeText={setBoundaries}
                  placeholder="Optional — You can return to this anytime"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                
                <View style={styles.examplesCard}>
                  <Text style={styles.examplesTitle}>Examples:</Text>
                  <Text style={styles.exampleItem}>• This character's rage is not mine</Text>
                  <Text style={styles.exampleItem}>• I will not take this home</Text>
                  <Text style={styles.exampleItem}>• I close this role after each session</Text>
                </View>
              </View>
            </View>
          )}

          {/* STEP 5: ACKNOWLEDGMENT OF RESIDUE */}
          {step === 5 && (
            <View style={styles.stepContainer}>
              <View style={styles.centerContent}>
                <MaterialIcons name="info-outline" size={64} color={colors.accent} />
                <Text style={styles.mainTitle}>This role will leave traces</Text>
                <Text style={styles.bodyText}>That is expected.</Text>
                <Text style={styles.bodyText}>
                  This container will help you track what it leaves behind.
                </Text>
                <Text style={styles.bodyText}>
                  When the work ends, you will have the option to formally close this role.
                </Text>
              </View>
            </View>
          )}

          {/* STEP 6: CONTAINER OPENED */}
          {step === 6 && (
            <View style={styles.stepContainer}>
              <View style={styles.centerContent}>
                <MaterialIcons name="check-circle" size={64} color={colors.primary} />
                <Text style={styles.mainTitle}>Container opened</Text>
                <Text style={styles.bodyText}>
                  {characterName || 'This role'} is now held in Actor OS
                </Text>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Character:</Text>
                    <Text style={styles.summaryValue}>{characterName}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Production:</Text>
                    <Text style={styles.summaryValue}>{production}</Text>
                  </View>
                  {productionType && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Type:</Text>
                      <Text style={styles.summaryValue}>{productionType}</Text>
                    </View>
                  )}
                  {startDate && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Start:</Text>
                      <Text style={styles.summaryValue}>{formatDate(startDate)}</Text>
                    </View>
                  )}
                  {!isOngoing && endDate && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>End:</Text>
                      <Text style={styles.summaryValue}>{formatDate(endDate)}</Text>
                    </View>
                  )}
                  {isOngoing && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Duration:</Text>
                      <Text style={styles.summaryValue}>Ongoing</Text>
                    </View>
                  )}
                </View>

                <View style={styles.nextStepsCard}>
                  <Text style={styles.nextStepsTitle}>What would you like to do?</Text>
                  
                  {isSaving ? (
                    <View style={styles.savingContainer}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.savingText}>Opening container...</Text>
                    </View>
                  ) : (
                    <>
                      <Pressable 
                        style={styles.nextStepButton}
                        onPress={async () => {
                          await handleComplete();
                          router.push('/check-in/pre');
                        }}
                      >
                        <MaterialIcons name="play-circle-outline" size={24} color={colors.primary} />
                        <Text style={styles.nextStepButtonText}>Enter this role now</Text>
                      </Pressable>

                      <Pressable 
                        style={styles.nextStepButton}
                        onPress={handleComplete}
                      >
                        <MaterialIcons name="edit" size={24} color={colors.textSecondary} />
                        <Text style={styles.nextStepButtonText}>Add character notes</Text>
                      </Pressable>

                      <Pressable 
                        style={styles.nextStepButton}
                        onPress={handleComplete}
                      >
                        <MaterialIcons name="home" size={24} color={colors.textSecondary} />
                        <Text style={styles.nextStepButtonText}>Return home</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[
        styles.footer,
        {
          paddingBottom: insets.bottom + spacing.md,
        }
      ]}>
        {step > 1 && step < 6 && (
          <Pressable onPress={handleBack} style={styles.backFooterButton}>
            <MaterialIcons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={styles.backFooterButtonText}>Back</Text>
          </Pressable>
        )}
        
        <View style={{ flex: 1 }} />

        {step === 1 && (
          <Pressable 
            onPress={handleNext} 
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed
            ]}
          >
            <Text style={styles.primaryButtonText}>I Understand — Continue</Text>
          </Pressable>
        )}

        {step === 2 && (
          <Pressable 
            onPress={handleNext} 
            style={({ pressed }) => [
              styles.primaryButton,
              !canContinueStep2 && styles.primaryButtonDisabled,
              pressed && canContinueStep2 && styles.primaryButtonPressed
            ]}
            disabled={!canContinueStep2}
          >
            <Text style={[
              styles.primaryButtonText,
              !canContinueStep2 && styles.primaryButtonTextDisabled
            ]}>Continue</Text>
          </Pressable>
        )}

        {step === 3 && (
          <Pressable 
            onPress={handleNext} 
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed
            ]}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        )}

        {step === 4 && (
          <Pressable 
            onPress={handleNext} 
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed
            ]}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        )}

        {step === 5 && (
          <Pressable 
            onPress={handleNext} 
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed
            ]}
          >
            <Text style={styles.primaryButtonText}>Open This Role Container</Text>
          </Pressable>
        )}
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
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  content: {
    padding: spacing.lg,
  },
  stepContainer: {
    flex: 1,
    paddingTop: spacing.xxl,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  mainTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    lineHeight: 32,
    letterSpacing: 0,
  },
  stepTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    letterSpacing: 0,
  },
  bodyText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    fontWeight: typography.weights.medium,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  helperText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 140,
    marginBottom: spacing.md,
  },
  exampleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  exampleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exampleChipSelected: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
  },
  exampleChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  exampleChipTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  dateButtonText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textTertiary,
  },
  dateButtonTextSelected: {
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  toggleBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleLabel: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  examplesCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  examplesTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  exampleItem: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  guidanceHeadline: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  guidanceText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  nextStepsCard: {
    width: '100%',
    marginTop: spacing.lg,
  },
  nextStepsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  nextStepButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    gap: spacing.md,
    zIndex: 1000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minHeight: 80,
  },
  backFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backFooterButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    zIndex: 10,
  },
  primaryButtonTextDisabled: {
    color: colors.textTertiary,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  savingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
