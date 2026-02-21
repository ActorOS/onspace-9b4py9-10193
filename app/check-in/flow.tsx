import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { roleStorage, type Role } from '@/services/roleStorage';
import { sessionStorage } from '@/services/sessionStorage';
import { aftereffectsStorage } from '@/services/aftereffectsStorage';
import { tierStorage } from '@/services/tierStorage';
import { UpgradePrompt } from '@/components';
import { trackWorkloadSelected } from '@/services/usageTracking';

// Flow states representing the entire check-in journey
type FlowState = 
  | 'arrival' 
  | 'role' 
  | 'weight' 
  | 'in-work' 
  | 'post-work-residue' 
  | 'return-choice' 
  | 'recommended-release-list'
  | 'return-to-self-list'
  | 'somatic-release-list';

type WeightLevel = 'light' | 'medium' | 'heavy';

const FOOTER_HEIGHT = 80;

// Residue options for post-work check-in
const RESIDUE_OPTIONS = [
  { label: 'Tension', icon: 'bolt' },
  { label: 'Heaviness', icon: 'arrow-downward' },
  { label: 'Numbness', icon: 'remove-circle-outline' },
  { label: 'Tightness', icon: 'compress' },
  { label: 'Alertness', icon: 'visibility' },
  { label: 'Anger', icon: 'local-fire-department' },
  { label: 'Sadness', icon: 'water-drop' },
  { label: 'Fear', icon: 'warning' },
  { label: 'Nothing', icon: 'check-circle-outline' },
];

const BODY_LOCATIONS = [
  { label: 'Jaw', value: 'jaw' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Chest', value: 'chest' },
  { label: 'Stomach', value: 'stomach' },
  { label: 'Hands', value: 'hands' },
  { label: 'Legs', value: 'legs' },
  { label: 'Throat', value: 'throat' },
  { label: 'Head', value: 'head' },
];

const INTENSITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

// Exercise options
type ExerciseOption = {
  id: string;
  title: string;
  purpose: string;
  icon: string;
  route: string;
  workload?: ('light' | 'medium' | 'heavy')[];
  requiresPro: boolean;
};

const RECOMMENDED_EXERCISES: ExerciseOption[] = [
  {
    id: 'gentle-grounding',
    title: 'Gentle Grounding',
    purpose: 'Sensory grounding to present moment',
    icon: 'my-location',
    route: '/return/exercise-grounding',
    workload: ['light'],
    requiresPro: false,
  },
  {
    id: 'breathing',
    title: 'Breathing & Release',
    purpose: 'Gentle nervous system reset',
    icon: 'spa',
    route: '/return/exercise-breathing',
    workload: ['light', 'medium', 'heavy'],
    requiresPro: false,
  },
  {
    id: 'bodyscan',
    title: 'Body Scan',
    purpose: 'Release character tension',
    icon: 'self-improvement',
    route: '/return/exercise-bodyscan',
    workload: ['medium', 'heavy'],
    requiresPro: false,
  },
  {
    id: 'identity-separation',
    title: 'Identity Separation',
    purpose: 'Choose your level: Light, Standard, or Full',
    icon: 'psychology',
    route: '/return/identity-separation-tiers',
    workload: ['light', 'medium', 'heavy'],
    requiresPro: false,
  },
];

const RETURN_TO_SELF_EXERCISES: ExerciseOption[] = [
  {
    id: 'identity-separation',
    title: 'Identity Separation',
    purpose: 'Choose your level: Light, Standard, or Full',
    icon: 'psychology',
    route: '/return/identity-separation-tiers',
    requiresPro: false,
  },
  {
    id: 'full-recovery-light',
    title: 'Full Body Recovery (Light)',
    purpose: 'Subtle reset after rehearsal',
    icon: 'spa',
    route: '/return/exercise-recovery-light',
    requiresPro: false,
  },
  {
    id: 'full-recovery-standard',
    title: 'Full Body Recovery (Standard)',
    purpose: 'Restore balance after performance',
    icon: 'spa',
    route: '/return/exercise-recovery-standard',
    requiresPro: true,
  },
  {
    id: 'full-recovery',
    title: 'Full Body Recovery',
    purpose: 'Complete recovery after demanding work',
    icon: 'spa',
    route: '/return/exercise-recovery',
    requiresPro: true,
  },
  {
    id: 'quick-name',
    title: 'Name Yourself',
    purpose: 'Ground in your own identity',
    icon: 'badge',
    route: '/return/quick-name',
    requiresPro: false,
  },
  {
    id: 'quick-location',
    title: 'Where Are You',
    purpose: 'Orient to present location',
    icon: 'place',
    route: '/return/quick-location',
    requiresPro: false,
  },
  {
    id: 'quick-date',
    title: 'What Day Is It',
    purpose: 'Orient to present time',
    icon: 'today',
    route: '/return/quick-date',
    requiresPro: false,
  },
];

const SOMATIC_RELEASE_EXERCISES: ExerciseOption[] = [
  {
    id: 'full-recovery-light',
    title: 'Full Body Recovery (Light)',
    purpose: 'Subtle reset after rehearsal',
    icon: 'spa',
    route: '/return/exercise-recovery-light',
    requiresPro: false,
  },
  {
    id: 'full-recovery-standard',
    title: 'Full Body Recovery (Standard)',
    purpose: 'Restore balance after performance',
    icon: 'spa',
    route: '/return/exercise-recovery-standard',
    requiresPro: true,
  },
  {
    id: 'full-recovery',
    title: 'Full Body Recovery',
    purpose: 'Complete recovery after demanding work',
    icon: 'spa',
    route: '/return/exercise-recovery',
    requiresPro: true,
  },
  {
    id: 'intimacy',
    title: 'Intimacy Decompression',
    purpose: 'Release after physical or intimate work',
    icon: 'spa',
    route: '/return/exercise-intimacy',
    requiresPro: false,
  },
  {
    id: 'bodyscan',
    title: 'Body Scan',
    purpose: 'Release character tension',
    icon: 'self-improvement',
    route: '/return/exercise-bodyscan',
    requiresPro: false,
  },
  {
    id: 'breathing',
    title: 'Breathing & Release',
    purpose: 'Nervous system reset',
    icon: 'air',
    route: '/return/exercise-breathing',
    requiresPro: false,
  },
  {
    id: 'movement',
    title: 'Quick Movement',
    purpose: 'Shake out residual energy',
    icon: 'directions-run',
    route: '/return/quick-movement',
    requiresPro: false,
  },
];

export default function CheckInFlowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Flow state management
  const [flowState, setFlowState] = useState<FlowState>('arrival');
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null);

  // Pre-work data
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [weight, setWeight] = useState<WeightLevel | null>(null);

  // Session data
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isEntering, setIsEntering] = useState(false);

  // Post-work data
  const [selectedResidue, setSelectedResidue] = useState<string[]>([]);
  const [selectedBodyLocations, setSelectedBodyLocations] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [note, setNote] = useState('');
  const [isSavingResidue, setIsSavingResidue] = useState(false);

  useEffect(() => {
    loadAvailableRoles();
    checkTier();
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

  const checkTier = async () => {
    const tier = await tierStorage.getTier();
    setIsPro(tier === 'pro');
  };

  const handleNext = () => {
    if (flowState === 'arrival') {
      setFlowState('role');
    } else if (flowState === 'role' && selectedRoleId) {
      setFlowState('weight');
    } else if (flowState === 'weight' && weight) {
      handleEnterWork();
    }
  };

  const handleBack = () => {
    if (flowState === 'role') {
      setFlowState('arrival');
    } else if (flowState === 'weight') {
      setFlowState('role');
    } else if (flowState === 'post-work-residue') {
      // Don't allow back from post-work
      return;
    } else if (flowState === 'return-choice') {
      setFlowState('post-work-residue');
    } else if (flowState === 'recommended-release-list' || flowState === 'return-to-self-list' || flowState === 'somatic-release-list') {
      setFlowState('return-choice');
    }
  };

  const handleEnterWork = async () => {
    if (!selectedRoleId || !weight) return;

    setIsEntering(true);
    
    // Track workload selection
    await trackWorkloadSelected(weight);
    
    try {
      const session = await sessionStorage.createSession({
        roleId: selectedRoleId,
        workloadLevel: weight,
        heaviness: weight,
        ownership: 'self',
        entryBoundaryNote: undefined,
      });

      await roleStorage.updateRole(selectedRoleId, {
        updatedAt: new Date().toISOString(),
      });

      setCurrentSessionId(session.id);
      setFlowState('in-work');
    } catch (error) {
      console.error('Failed to enter work:', error);
      Alert.alert('Error', 'Failed to start work session');
      setIsEntering(false);
    }
  };

  const handleExitWork = async () => {
    if (!currentSessionId) return;

    try {
      await sessionStorage.updateSession(currentSessionId, {
        exitedAt: new Date().toISOString(),
      });

      setFlowState('post-work-residue');
    } catch (error) {
      console.error('Failed to exit work:', error);
      router.replace('/(tabs)');
    }
  };

  const handleSaveResidue = async (actionTaken: 'held' | 'released') => {
    if (selectedResidue.length === 0) {
      Alert.alert('Required', 'Please select at least one residue type');
      return;
    }

    setIsSavingResidue(true);
    try {
      await aftereffectsStorage.saveAftereffect({
        sessionId: currentSessionId || undefined,
        roleId: selectedRoleId || undefined,
        residueTags: selectedResidue,
        bodyLocation: selectedBodyLocations,
        intensity,
        note: note.trim() || undefined,
        actionTaken,
      });

      if (actionTaken === 'held') {
        Alert.alert('Held', 'This has been recorded in your role container');
        router.replace('/(tabs)');
      } else {
        setFlowState('return-choice');
      }
    } catch (error) {
      console.error('Failed to save aftereffect:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setIsSavingResidue(false);
    }
  };

  const handleSelectExercise = (exercise: ExerciseOption) => {
    if (exercise.requiresPro && !isPro) {
      setSelectedExercise(exercise);
      setShowUpgradePrompt(true);
      return;
    }
    // Navigate to exercise route - this EXITS the flow
    router.replace(exercise.route);
  };

  const handleClose = () => {
    // Confirmation before closing
    if (flowState === 'in-work') {
      Alert.alert(
        'Exit Work Session',
        'You are currently in a work session. Exit now?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => router.replace('/(tabs)') }
        ]
      );
    } else if (flowState === 'post-work-residue' && selectedResidue.length > 0) {
      Alert.alert(
        'Leave without holding this?',
        'Your selections will not be saved.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.replace('/(tabs)') }
        ]
      );
    } else {
      router.replace('/(tabs)');
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  const renderContent = () => {
    switch (flowState) {
      case 'arrival':
        return renderArrival();
      case 'role':
        return renderRoleSelection();
      case 'weight':
        return renderWeightSelection();
      case 'in-work':
        return renderInWork();
      case 'post-work-residue':
        return renderPostWorkResidue();
      case 'return-choice':
        return renderReturnChoice();
      case 'recommended-release-list':
        return renderRecommendedReleaseList();
      case 'return-to-self-list':
        return renderReturnToSelfList();
      case 'somatic-release-list':
        return renderSomaticReleaseList();
      default:
        return null;
    }
  };

  const renderArrival = () => (
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

  const renderRoleSelection = () => {
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
              router.replace('/(tabs)');
              setTimeout(() => router.push('/role/entry'), 100);
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
  };

  const renderWeightSelection = () => (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      style={styles.stepContainer}
    >
      <Text style={styles.stepQuestion}>How heavy does this work feel today?</Text>
      <Text style={styles.stepHelper}>Notice without judgement</Text>
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

  const renderInWork = () => {
    if (isEntering) {
      return (
        <View style={styles.stepContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stepSubtext}>Entering work session...</Text>
        </View>
      );
    }

    return (
      <View style={styles.inWorkContent}>
        <View style={styles.statusIndicator}>
          <MaterialIcons name="circle" size={16} color={colors.success} />
        </View>
        <Text style={styles.inWorkTitle}>In Work</Text>
        <Text style={styles.inWorkSubtitle}>Session active</Text>
        <Pressable style={styles.exitButton} onPress={handleExitWork}>
          <Text style={styles.exitButtonText}>Exit Work</Text>
        </Pressable>
      </View>
    );
  };

  const renderPostWorkResidue = () => (
    <View style={styles.postWorkContainer}>
      <View style={styles.questionCard}>
        <Text style={styles.mainQuestion}>What did this work leave behind?</Text>
        <Text style={styles.subText}>
          Notice what the character left in your body and mind.{'\n'}
          This is expected. You do not need to fix it—only name it.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What are you carrying?</Text>
        <View style={styles.chipsGrid}>
          {RESIDUE_OPTIONS.map((option) => {
            const isSelected = selectedResidue.includes(option.label);
            return (
              <Pressable
                key={option.label}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => {
                  setSelectedResidue(prev => 
                    prev.includes(option.label)
                      ? prev.filter(item => item !== option.label)
                      : [...prev, option.label]
                  );
                }}
              >
                <MaterialIcons 
                  name={option.icon as any} 
                  size={18} 
                  color={isSelected ? colors.primary : colors.textSecondary} 
                />
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedResidue.length > 0 && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Where do you feel it?</Text>
            <Text style={styles.helperText}>Optional — Select one or more locations</Text>
            <View style={styles.chipsGrid}>
              {BODY_LOCATIONS.map((location) => {
                const isSelected = selectedBodyLocations.includes(location.value);
                return (
                  <Pressable
                    key={location.value}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => {
                      setSelectedBodyLocations(prev =>
                        prev.includes(location.value)
                          ? prev.filter(item => item !== location.value)
                          : [...prev, location.value]
                      );
                    }}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {location.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How strong is it?</Text>
            <Text style={styles.helperText}>Optional</Text>
            <View style={styles.intensityRow}>
              {INTENSITY_OPTIONS.map((option) => {
                const isSelected = intensity === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.intensityButton, isSelected && styles.intensityButtonSelected]}
                    onPress={() => setIntensity(option.value as any)}
                  >
                    <Text style={[styles.intensityText, isSelected && styles.intensityTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anything else to note?</Text>
            <Text style={styles.helperText}>Optional</Text>
            <TextInput
              style={styles.textArea}
              value={note}
              onChangeText={setNote}
              placeholder="What else did this leave behind?"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </>
      )}

      <View style={styles.infoCard}>
        <MaterialIcons name="info-outline" size={22} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.guidanceHeadline}>You have options</Text>
          <Text style={styles.guidanceText}>
            You can hold this temporarily in your role container, or release it now with guided grounding exercises.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderReturnChoice = () => (
    <View style={styles.returnChoiceContainer}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>How would you like{'\n'}to return?</Text>
        <Text style={styles.subtitle}>Choose what feels right after this work</Text>
      </View>

      <View style={styles.optionsSection}>
        <Pressable
          style={({ pressed }) => [
            styles.optionCard,
            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => setFlowState('recommended-release-list')}
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

        <Pressable
          style={({ pressed }) => [
            styles.optionCard,
            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => setFlowState('return-to-self-list')}
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

        <Pressable
          style={({ pressed }) => [
            styles.optionCard,
            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => setFlowState('somatic-release-list')}
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
  );

  const renderRecommendedReleaseList = () => {
    const filteredExercises = weight 
      ? RECOMMENDED_EXERCISES.filter(ex => ex.workload && ex.workload.includes(weight))
      : RECOMMENDED_EXERCISES;

    return (
      <View style={styles.exerciseListContainer}>
        <View style={styles.introSection}>
          <MaterialIcons name="recommend" size={48} color={colors.primary} style={{ marginBottom: spacing.md }} />
          <Text style={styles.title}>Based on this work</Text>
          {weight && (
            <View style={styles.workloadBadge}>
              <Text style={styles.workloadBadgeText}>
                {weight.charAt(0).toUpperCase() + weight.slice(1)} workload
              </Text>
            </View>
          )}
          <Text style={styles.subtitle}>Choose an exercise to begin</Text>
        </View>

        <View style={styles.exercisesSection}>
          {filteredExercises.map(exercise => {
            const isLocked = exercise.requiresPro && !isPro;
            return (
              <Pressable
                key={exercise.id}
                style={({ pressed }) => [
                  styles.exerciseCard,
                  isLocked && styles.exerciseCardLocked,
                  pressed && !isLocked && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => handleSelectExercise(exercise)}
              >
                <View style={styles.exerciseIcon}>
                  <MaterialIcons 
                    name={exercise.icon as any} 
                    size={28} 
                    color={isLocked ? colors.textTertiary : colors.primary} 
                  />
                </View>
                <View style={styles.exerciseContent}>
                  <View style={styles.exerciseHeader}>
                    <Text style={[styles.exerciseTitle, isLocked && styles.exerciseTitleLocked]}>
                      {exercise.title}
                    </Text>
                    {isLocked && (
                      <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.exercisePurpose, isLocked && styles.exercisePurposeLocked]}>
                    {exercise.purpose}
                  </Text>
                </View>
                <MaterialIcons 
                  name="chevron-right" 
                  size={24} 
                  color={isLocked ? colors.textTertiary : colors.textSecondary} 
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const renderReturnToSelfList = () => (
    <View style={styles.exerciseListContainer}>
      <View style={styles.introSection}>
        <MaterialIcons name="person" size={48} color={colors.primary} style={{ marginBottom: spacing.md }} />
        <Text style={styles.title}>Grounding &{'\n'}Identity Re-orientation</Text>
        <Text style={styles.subtitle}>Voice-led exercises to return to yourself</Text>
      </View>

      <View style={styles.exercisesSection}>
        {RETURN_TO_SELF_EXERCISES.map(exercise => {
          const isLocked = exercise.requiresPro && !isPro;
          return (
            <Pressable
              key={exercise.id}
              style={({ pressed }) => [
                styles.exerciseCard,
                isLocked && styles.exerciseCardLocked,
                pressed && !isLocked && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => handleSelectExercise(exercise)}
            >
              <View style={styles.exerciseIcon}>
                <MaterialIcons 
                  name={exercise.icon as any} 
                  size={28} 
                  color={isLocked ? colors.textTertiary : colors.primary} 
                />
              </View>
              <View style={styles.exerciseContent}>
                <View style={styles.exerciseHeader}>
                  <Text style={[styles.exerciseTitle, isLocked && styles.exerciseTitleLocked]}>
                    {exercise.title}
                  </Text>
                  {isLocked && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.exercisePurpose, isLocked && styles.exercisePurposeLocked]}>
                  {exercise.purpose}
                </Text>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={isLocked ? colors.textTertiary : colors.textSecondary} 
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderSomaticReleaseList = () => (
    <View style={styles.exerciseListContainer}>
      <View style={styles.introSection}>
        <MaterialIcons name="spa" size={48} color={colors.primary} style={{ marginBottom: spacing.md }} />
        <Text style={styles.title}>Body-Led Discharge{'\n'}& Release</Text>
        <Text style={styles.subtitle}>Voice-led exercises with one system voice</Text>
      </View>

      <View style={styles.exercisesSection}>
        {SOMATIC_RELEASE_EXERCISES.map(exercise => {
          const isLocked = exercise.requiresPro && !isPro;
          return (
            <Pressable
              key={exercise.id}
              style={({ pressed }) => [
                styles.exerciseCard,
                isLocked && styles.exerciseCardLocked,
                pressed && !isLocked && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => handleSelectExercise(exercise)}
            >
              <View style={styles.exerciseIcon}>
                <MaterialIcons 
                  name={exercise.icon as any} 
                  size={28} 
                  color={isLocked ? colors.textTertiary : colors.primary} 
                />
              </View>
              <View style={styles.exerciseContent}>
                <View style={styles.exerciseHeader}>
                  <Text style={[styles.exerciseTitle, isLocked && styles.exerciseTitleLocked]}>
                    {exercise.title}
                  </Text>
                  {isLocked && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.exercisePurpose, isLocked && styles.exercisePurposeLocked]}>
                  {exercise.purpose}
                </Text>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={isLocked ? colors.textTertiary : colors.textSecondary} 
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.infoCard}>
        <MaterialIcons name="info-outline" size={20} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoHeadline}>How these work</Text>
          <Text style={styles.infoText}>
            All somatic exercises are voice-led and hands-free once started. The app controls pacing and silence.
          </Text>
        </View>
      </View>
    </View>
  );

  const getButtonState = () => {
    switch (flowState) {
      case 'arrival':
        return { visible: true, enabled: true, label: 'Ready', action: handleNext };
      case 'role':
        if (isLoading || roles.length === 0) return { visible: false, enabled: false, label: '', action: () => {} };
        return { visible: true, enabled: !!selectedRoleId, label: 'Continue', action: handleNext };
      case 'weight':
        return { visible: true, enabled: !!weight, label: 'Enter Work', action: handleNext, icon: 'login' as const };
      case 'in-work':
        return { visible: false, enabled: false, label: '', action: () => {} };
      case 'post-work-residue':
        return { visible: false, enabled: false, label: '', action: () => {} }; // Custom footer
      case 'return-choice':
        return { visible: false, enabled: false, label: '', action: () => {} }; // Custom footer
      case 'recommended-release-list':
      case 'return-to-self-list':
      case 'somatic-release-list':
        return { visible: false, enabled: false, label: '', action: () => {} }; // Custom footer
      default:
        return { visible: false, enabled: false, label: '', action: () => {} };
    }
  };

  const buttonState = getButtonState();
  const canNavigateBack = flowState !== 'arrival' && flowState !== 'in-work' && flowState !== 'post-work-residue';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {canNavigateBack ? (
          <Pressable onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
        
        {flowState !== 'in-work' && (
          <View style={styles.progressIndicator}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[styles.progressDot, flowState !== 'arrival' && styles.progressDotActive]} />
            <View style={[styles.progressDot, (flowState === 'weight' || flowState === 'in-work' || flowState === 'post-work-residue' || flowState === 'return-choice' || flowState === 'recommended-release-list' || flowState === 'return-to-self-list' || flowState === 'somatic-release-list') && styles.progressDotActive]} />
          </View>
        )}
        
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Content - ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: FOOTER_HEIGHT + Math.max(insets.bottom, spacing.md) + 60 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>

      {/* Footer CTAs */}
      {flowState === 'post-work-residue' && (
        <View style={styles.residueFooter}>
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              styles.holdButton,
              selectedResidue.length === 0 && styles.buttonDisabled,
              pressed && selectedResidue.length > 0 && { opacity: 0.85, transform: [{ scale: 0.98 }] }
            ]}
            onPress={() => handleSaveResidue('held')}
            disabled={selectedResidue.length === 0 || isSavingResidue}
          >
            <MaterialIcons name="inventory-2" size={20} color={selectedResidue.length === 0 ? colors.textTertiary : colors.textPrimary} />
            <Text style={[styles.actionButtonText, styles.holdButtonText, selectedResidue.length === 0 && { color: colors.textTertiary }]}>
              Hold it here
            </Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              styles.releaseButton,
              selectedResidue.length === 0 && styles.buttonDisabled,
              pressed && selectedResidue.length > 0 && { backgroundColor: colors.primaryDark, transform: [{ scale: 0.98 }] }
            ]}
            onPress={() => handleSaveResidue('released')}
            disabled={selectedResidue.length === 0 || isSavingResidue}
          >
            <MaterialIcons name="air" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Release now</Text>
          </Pressable>
        </View>
      )}

      {(flowState === 'return-choice' || flowState === 'recommended-release-list' || flowState === 'return-to-self-list' || flowState === 'somatic-release-list') && (
        <View style={[styles.simpleFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <Pressable 
            style={({ pressed }) => [
              styles.skipButton,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        </View>
      )}

      {/* Standard Footer Button */}
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
            {isEntering && flowState === 'weight' ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <>
                {buttonState.icon && (
                  <MaterialIcons name={buttonState.icon} size={24} color={colors.background} />
                )}
                <Text style={styles.footerButtonText}>{buttonState.label}</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature={selectedExercise?.title || 'Advanced Exercises'}
        description={`Pro unlocks ${selectedExercise?.title} and other advanced release exercises for deeper work.`}
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
  inWorkContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  statusIndicator: {
    marginBottom: spacing.xl,
  },
  inWorkTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inWorkSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl * 2,
  },
  exitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  exitButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
  postWorkContainer: {
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mainQuestion: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  helperText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  intensityButtonSelected: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
  },
  intensityText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  intensityTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
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
  guidanceHeadline: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  guidanceText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  returnChoiceContainer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
  exerciseListContainer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  workloadBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  workloadBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  exercisesSection: {
    gap: spacing.md,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseCardLocked: {
    opacity: 0.6,
  },
  exerciseIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  exerciseTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  exerciseTitleLocked: {
    color: colors.textSecondary,
  },
  exercisePurpose: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  exercisePurposeLocked: {
    color: colors.textTertiary,
  },
  proBadge: {
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
  infoHeadline: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  residueFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  holdButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  releaseButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  holdButtonText: {
    color: colors.textPrimary,
  },
  simpleFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  skipButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    width: '100%',
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
