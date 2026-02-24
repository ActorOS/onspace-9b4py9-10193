
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { roleStorage, type Role } from '@/services/roleStorage';

type Step = 'arrival' | 'role' | 'weight';
type WeightLevel = 'light' | 'medium' | 'heavy';

const FOOTER_HEIGHT = 80;

export default function PreWorkCheckInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<Step>('arrival');
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check-in data
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [weight, setWeight] = useState<WeightLevel | null>(null);

  useEffect(() => {
    loadAvailableRoles();
  }, []);

  const loadAvailableRoles = async () => {
    setIsLoading(true);
    try {
      const allRoles = await roleStorage.getAllRoles();
      const available = allRoles.filter(r => r.status === 'open' || r.status === 'held');
      setRoles(available);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'arrival') {
      setCurrentStep('role');
    } else if (currentStep === 'role' && selectedRoleId) {
      setCurrentStep('weight');
    } else if (currentStep === 'weight' && weight) {
      // Navigate to different screens based on weight selection
      const selectedRole = roles.find(r => r.id === selectedRoleId);
      const sessionParams = {
        roleId: selectedRoleId,
        roleName: selectedRole?.characterName || '',
        production: selectedRole?.production || '',
        heaviness: weight,
      };

      if (weight === 'light') {
        router.push({
          pathname: '/check-in/light-care',
          params: sessionParams,
        });
      } else if (weight === 'medium') {
        router.push({
          pathname: '/check-in/medium-care',
          params: sessionParams,
        });
      } else if (weight === 'heavy') {
        router.push({
          pathname: '/check-in/heavy-containment',
          params: sessionParams,
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'role') setCurrentStep('arrival');
    else if (currentStep === 'weight') setCurrentStep('role');
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // Determine button state for current step
  const getButtonState = () => {
    switch (currentStep) {
      case 'arrival':
        return { visible: true, enabled: true, label: 'Ready', action: handleNext };
      case 'role':
        if (isLoading || roles.length === 0) return { visible: false, enabled: false, label: '', action: () => {} };
        return { visible: true, enabled: !!selectedRoleId, label: 'Continue', action: handleNext };
      case 'weight':
        return { visible: true, enabled: !!weight, label: 'Continue', action: handleNext };
      default:
        return { visible: false, enabled: false, label: '', action: () => {} };
    }
  };

  const buttonState = getButtonState();

  const renderStepContent = () => {
    switch (currentStep) {
      case 'arrival':
        return (
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            style={styles.stepContainer}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="pause-circle-outline" size={64} color={colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Before you enter work</Text>
            <Text style={styles.stepSubtext}>
              Take a moment.{'\n'}Notice where you are.{'\n'}Feel your body in this space.
            </Text>
          </Animated.View>
        );

      case 'role':
        if (isLoading) {
          return (
            <Animated.View
              entering={FadeIn.duration(400)}
              style={styles.stepContainer}
            >
              <ActivityIndicator size="large" color={colors.primary} />
            </Animated.View>
          );
        }

        if (roles.length === 0) {
          return (
            <Animated.View
              entering={FadeIn.duration(400)}
              style={styles.stepContainer}
            >
              <MaterialIcons name="menu-book" size={64} color={colors.textTertiary} />
              <Text style={styles.stepTitle}>No open roles</Text>
              <Text style={styles.stepSubtext}>
                You need to open a role container first
              </Text>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  router.replace('/role/entry');
                }}
              >
                <Text style={styles.secondaryButtonText}>Open Role Container</Text>
              </Pressable>
            </Animated.View>
          );
        }

        return (
          <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepQuestion}>Which role are you entering?</Text>
            <View style={styles.optionsContainer}>
              {roles.map(role => (
                <Pressable
                  key={role.id}
                  style={[
                    styles.roleOption,
                    selectedRoleId === role.id && styles.roleOptionSelected,
                  ]}
                  onPress={() => setSelectedRoleId(role.id)}
                >
                  <View style={styles.roleOptionContent}>
                    <Text style={styles.roleOptionTitle}>{role.characterName}</Text>
                    <Text style={styles.roleOptionSubtitle}>{role.production}</Text>
                  </View>
                  {selectedRoleId === role.id && (
                    <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </Animated.View>
        );

      case 'weight':
        return (
          <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepQuestion}>How heavy does this work feel today?</Text>
            <Text style={styles.stepHelper}>Notice without judgment. This helps us provide the right support.</Text>
            <View style={styles.optionsContainer}>
              <Pressable
                style={[styles.weightOption, weight === 'light' && styles.weightOptionSelected]}
                onPress={() => {
                  setWeight('light');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.weightHeader}>
                  <View style={styles.weightIndicator}>
                    <View style={[styles.weightBar, styles.weightBarLight, weight === 'light' && styles.weightBarActive]} />
                  </View>
                  {weight === 'light' && (
                    <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.weightLabel, weight === 'light' && styles.weightLabelSelected]}>Light</Text>
                <Text style={styles.weightDescription}>Feels manageable, easy to hold</Text>
              </Pressable>

              <Pressable
                style={[styles.weightOption, weight === 'medium' && styles.weightOptionSelected]}
                onPress={() => {
                  setWeight('medium');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.weightHeader}>
                  <View style={styles.weightIndicator}>
                    <View style={[styles.weightBar, styles.weightBarMedium, weight === 'medium' && styles.weightBarActive]} />
                    <View style={[styles.weightBar, styles.weightBarMedium, weight === 'medium' && styles.weightBarActive]} />
                  </View>
                  {weight === 'medium' && (
                    <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.weightLabel, weight === 'medium' && styles.weightLabelSelected]}>Medium</Text>
                <Text style={styles.weightDescription}>Noticeable, requires care</Text>
              </Pressable>

              <Pressable
                style={[styles.weightOption, weight === 'heavy' && styles.weightOptionSelected]}
                onPress={() => {
                  setWeight('heavy');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.weightHeader}>
                  <View style={styles.weightIndicator}>
                    <View style={[styles.weightBar, styles.weightBarHeavy, weight === 'heavy' && styles.weightBarActive]} />
                    <View style={[styles.weightBar, styles.weightBarHeavy, weight === 'heavy' && styles.weightBarActive]} />
                    <View style={[styles.weightBar, styles.weightBarHeavy, weight === 'heavy' && styles.weightBarActive]} />
                  </View>
                  {weight === 'heavy' && (
                    <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.weightLabel, weight === 'heavy' && styles.weightLabelSelected]}>Heavy</Text>
                <Text style={styles.weightDescription}>Demanding, needs containment</Text>
              </Pressable>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {currentStep !== 'arrival' ? (
          <Pressable onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={styles.progressIndicator}>
          {['arrival', 'role', 'weight'].map((step, index) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                index <= ['arrival', 'role', 'weight'].indexOf(currentStep) && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Step Content - ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: FOOTER_HEIGHT + Math.max(insets.bottom, spacing.md) + 60 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        {renderStepContent()}
      </ScrollView>

      {/* Fixed Footer CTA */}
      {buttonState.visible && (
        <View 
          style={[
            styles.fixedFooter,
            { paddingBottom: Math.max(insets.bottom, spacing.md) }
          ]}
        >
          <Pressable
            style={[
              styles.footerButton,
              !buttonState.enabled && styles.footerButtonDisabled
            ]}
            onPress={buttonState.action}
            disabled={!buttonState.enabled}
          >
            <Text style={styles.footerButtonText}>{buttonState.label}</Text>
          </Pressable>
        </View>
      )}
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
  progressIndicator: {
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stepSubtext: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  stepQuestion: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stepHelper: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: spacing.lg,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  optionsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  roleOptionContent: {
    flex: 1,
  },
  roleOptionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
    letterSpacing: 0,
  },
  roleOptionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  weightOption: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  weightOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  weightIndicator: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  weightBar: {
    width: 24,
    height: 6,
    borderRadius: 3,
  },
  weightBarLight: {
    backgroundColor: colors.success,
    opacity: 0.3,
  },
  weightBarMedium: {
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  weightBarHeavy: {
    backgroundColor: colors.error,
    opacity: 0.3,
  },
  weightBarActive: {
    opacity: 1,
  },
  weightLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  weightLabelSelected: {
    color: colors.primary,
  },
  weightDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    zIndex: 1000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonDisabled: {
    opacity: 0.4,
  },
  footerButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
