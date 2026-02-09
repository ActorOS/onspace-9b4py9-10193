import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { sessionStorage, type WorkSession, type ReleaseStatus } from '@/services/sessionStorage';

const REFLECTION_PROMPTS = [
  { id: 'emotion', label: 'Emotion', icon: 'favorite', placeholder: 'What emotion are you holding?' },
  { id: 'physicalSensation', label: 'Physical sensation', icon: 'accessibility', placeholder: 'Where do you feel it in your body?' },
  { id: 'thought', label: 'Thought', icon: 'psychology', placeholder: 'What thought is lingering?' },
];

export default function SessionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<WorkSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for reflection
  const [emotion, setEmotion] = useState('');
  const [physicalSensation, setPhysicalSensation] = useState('');
  const [thought, setThought] = useState('');
  const [nothingLeftBehind, setNothingLeftBehind] = useState(false);
  const [releaseStatus, setReleaseStatus] = useState<ReleaseStatus>(null);

  const loadSession = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const loadedSession = await sessionStorage.getSessionById(id as string);
      setSession(loadedSession);
      
      if (loadedSession?.reflection) {
        setEmotion(loadedSession.reflection.emotion || '');
        setPhysicalSensation(loadedSession.reflection.physicalSensation || '');
        setThought(loadedSession.reflection.thought || '');
        setNothingLeftBehind(loadedSession.reflection.nothingLeftBehind || false);
      }
      
      if (loadedSession?.releaseStatus) {
        setReleaseStatus(loadedSession.releaseStatus);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSession();
    }, [id])
  );

  const saveReflection = async () => {
    if (!id || !session) return;
    setIsSaving(true);
    try {
      await sessionStorage.updateSession(id as string, {
        reflection: {
          emotion: emotion.trim() || undefined,
          physicalSensation: physicalSensation.trim() || undefined,
          thought: thought.trim() || undefined,
          nothingLeftBehind,
        },
        releaseStatus,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to save reflection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save when reflection changes
  React.useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => {
      saveReflection();
    }, 1000);
    return () => clearTimeout(timer);
  }, [emotion, physicalSensation, thought, nothingLeftBehind, releaseStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (enteredAt: string, exitedAt?: string) => {
    if (!exitedAt) return 'In progress';
    const start = new Date(enteredAt);
    const end = new Date(exitedAt);
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getLoadColor = (heaviness?: string) => {
    switch (heaviness) {
      case 'light': return colors.success;
      case 'medium': return colors.warning;
      case 'heavy': return colors.error;
      default: return colors.textTertiary;
    }
  };

  const getLoadLabel = (heaviness?: string) => {
    if (!heaviness) return 'Unknown';
    return heaviness.charAt(0).toUpperCase() + heaviness.slice(1);
  };

  const getReleaseStatusConfig = (status: ReleaseStatus) => {
    switch (status) {
      case 'grounded':
        return { label: 'Grounded', icon: 'check-circle', color: colors.success };
      case 'partially-released':
        return { label: 'Partially released', icon: 'radio-button-checked', color: colors.warning };
      case 'still-holding':
        return { label: 'Still holding something', icon: 'circle', color: colors.error };
      default:
        return null;
    }
  };

  const handleReleaseStatusSelect = (status: ReleaseStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReleaseStatus(status);
  };

  const handleReleaseNow = () => {
    router.push('/grounding');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.errorText}>Session not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Session Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Session Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Summary</Text>
          
          <View style={styles.summaryCard}>
            <Text style={styles.roleName}>{session.roleName || 'Unknown Role'}</Text>
            <Text style={styles.production}>{session.production || ''}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>{formatDate(session.exitedAt || session.enteredAt)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>
                {formatTime(session.enteredAt)} – {session.exitedAt ? formatTime(session.exitedAt) : 'In progress'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{formatDuration(session.enteredAt, session.exitedAt)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Load rating</Text>
              <View style={[styles.loadBadge, { backgroundColor: getLoadColor(session.heaviness) + '30' }]}>
                <Text style={[styles.loadBadgeText, { color: getLoadColor(session.heaviness) }]}>
                  {getLoadLabel(session.heaviness)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* What This Work Left Behind */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What This Work Left Behind</Text>
            {isSaving && (
              <View style={styles.savingIndicator}>
                <ActivityIndicator size="small" color={colors.textTertiary} />
                <Text style={styles.savingText}>Saving...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.reflectionCard}>
            {REFLECTION_PROMPTS.map(prompt => (
              <View key={prompt.id} style={styles.reflectionField}>
                <View style={styles.reflectionFieldHeader}>
                  <MaterialIcons name={prompt.icon as any} size={20} color={colors.textSecondary} />
                  <Text style={styles.reflectionFieldLabel}>{prompt.label}</Text>
                </View>
                <TextInput
                  style={styles.reflectionInput}
                  value={prompt.id === 'emotion' ? emotion : prompt.id === 'physicalSensation' ? physicalSensation : thought}
                  onChangeText={prompt.id === 'emotion' ? setEmotion : prompt.id === 'physicalSensation' ? setPhysicalSensation : setThought}
                  placeholder={prompt.placeholder}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            ))}
            
            <Pressable
              style={[styles.nothingOption, nothingLeftBehind && styles.nothingOptionSelected]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setNothingLeftBehind(!nothingLeftBehind);
              }}
            >
              <MaterialIcons
                name={nothingLeftBehind ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={nothingLeftBehind ? colors.primary : colors.textTertiary}
              />
              <Text style={[styles.nothingOptionText, nothingLeftBehind && styles.nothingOptionTextSelected]}>
                Nothing / I'm clear
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Release Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Release Status</Text>
          
          <View style={styles.releaseStatusCard}>
            {(['grounded', 'partially-released', 'still-holding'] as ReleaseStatus[]).map(status => {
              const config = getReleaseStatusConfig(status);
              if (!config) return null;
              
              return (
                <Pressable
                  key={status}
                  style={[styles.releaseStatusOption, releaseStatus === status && styles.releaseStatusOptionSelected]}
                  onPress={() => handleReleaseStatusSelect(status)}
                >
                  <MaterialIcons
                    name={config.icon as any}
                    size={24}
                    color={releaseStatus === status ? config.color : colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.releaseStatusLabel,
                      releaseStatus === status && { color: config.color, fontWeight: typography.weights.semibold },
                    ]}
                  >
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Release Now Action */}
        {releaseStatus === 'still-holding' && (
          <View style={styles.section}>
            <Pressable 
              style={({ pressed }) => [
                styles.releaseNowButton,
                pressed && { backgroundColor: colors.primaryDark, transform: [{ scale: 0.98 }] }
              ]} 
              onPress={handleReleaseNow}
            >
              <MaterialIcons name="spa" size={24} color="#FFFFFF" />
              <Text style={styles.releaseNowButtonText}>Release now</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
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
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.sectionHeader,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  savingText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  production: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  loadBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  loadBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.normal,
  },
  reflectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
  },
  reflectionField: {
    gap: spacing.sm,
  },
  reflectionFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reflectionFieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  reflectionInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    minHeight: 80,
  },
  nothingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  nothingOptionSelected: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
  },
  nothingOptionText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  nothingOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  releaseStatusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  releaseStatusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  releaseStatusOptionSelected: {
    backgroundColor: colors.surfaceElevated,
  },
  releaseStatusLabel: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  releaseNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  releaseNowButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
