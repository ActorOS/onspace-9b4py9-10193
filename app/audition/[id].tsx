import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { auditionStorage, type Audition } from '@/services/auditionStorage';

export default function AuditionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [audition, setAudition] = useState<Audition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAudition();
  }, [id]);

  const loadAudition = async () => {
    if (typeof id !== 'string') return;
    
    setIsLoading(true);
    try {
      const data = await auditionStorage.getAuditionById(id);
      setAudition(data);
    } catch (error) {
      console.error('Failed to load audition:', error);
      Alert.alert('Error', 'Failed to load audition details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!audition) return;
    router.push(`/audition/edit?id=${audition.id}`);
  };

  const handleMarkCallback = async () => {
    if (!audition) return;
    
    try {
      await auditionStorage.updateAudition(audition.id, {
        stage: 'callback',
      });
      Alert.alert('Updated', 'Marked as Callback');
      loadAudition();
    } catch (error) {
      console.error('Failed to update audition:', error);
      Alert.alert('Error', 'Failed to update audition');
    }
  };

  const handleMarkCast = async () => {
    if (!audition) return;
    
    try {
      await auditionStorage.updateAudition(audition.id, {
        stage: 'cast',
        status: 'booked',
      });
      Alert.alert('Congratulations', 'Marked as Cast/Booked');
      loadAudition();
    } catch (error) {
      console.error('Failed to update audition:', error);
      Alert.alert('Error', 'Failed to update audition');
    }
  };

  const handleRelease = async () => {
    if (!audition) return;
    
    Alert.alert(
      'Release Audition',
      'Mark this audition as released?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release',
          style: 'destructive',
          onPress: async () => {
            try {
              await auditionStorage.updateAudition(audition.id, {
                status: 'released',
              });
              Alert.alert('Released', 'Audition has been released');
              router.back();
            } catch (error) {
              console.error('Failed to release audition:', error);
              Alert.alert('Error', 'Failed to release audition');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    if (!audition) return;
    
    Alert.alert(
      'Delete Audition',
      'This will permanently delete this audition. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await auditionStorage.deleteAudition(audition.id);
              Alert.alert('Deleted', 'Audition permanently deleted');
              router.back();
            } catch (error) {
              console.error('Failed to delete audition:', error);
              Alert.alert('Error', 'Failed to delete audition');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!audition) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Audition</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Audition not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Audition</Text>
        <Pressable onPress={handleEdit} style={styles.headerButton}>
          <MaterialIcons name="edit" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Info */}
        <View style={styles.section}>
          <Text style={styles.projectTitle}>{audition.projectTitle}</Text>
          {audition.roleName && (
            <Text style={styles.roleName}>{audition.roleName}</Text>
          )}
          {audition.companyOrCasting && (
            <Text style={styles.company}>{audition.companyOrCasting}</Text>
          )}
        </View>

        {/* Status Cards */}
        <View style={styles.section}>
          <View style={styles.statusRow}>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Stage</Text>
              <Text style={styles.statusValue}>
                {audition.stage === 'audition' ? 'Audition' : 
                 audition.stage === 'callback' ? 'Callback' : 'Cast'}
              </Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[
                styles.statusValue,
                audition.status === 'booked' && styles.statusValueBooked,
                audition.status === 'released' && styles.statusValueReleased
              ]}>
                {audition.status === 'waiting' ? 'Waiting' : 
                 audition.status === 'released' ? 'Released' : 'Booked'}
              </Text>
            </View>
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date & Time</Text>
          <View style={styles.infoCard}>
            <MaterialIcons name="event" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>{formatDate(audition.date)}</Text>
          </View>
        </View>

        {/* Notes */}
        {audition.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{audition.notes}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        {audition.status === 'waiting' && (
          <View style={styles.section}>
            <Text style={styles.label}>Actions</Text>
            
            {audition.stage === 'audition' && (
              <Pressable style={styles.actionButton} onPress={handleMarkCallback}>
                <MaterialIcons name="arrow-forward" size={20} color={colors.primary} />
                <Text style={styles.actionButtonText}>Mark as Callback</Text>
              </Pressable>
            )}

            {(audition.stage === 'callback' || audition.stage === 'audition') && (
              <Pressable style={styles.actionButton} onPress={handleMarkCast}>
                <MaterialIcons name="star" size={20} color={colors.accent} />
                <Text style={styles.actionButtonText}>Mark as Cast/Booked</Text>
              </Pressable>
            )}

            <Pressable style={styles.actionButton} onPress={handleRelease}>
              <MaterialIcons name="check-circle" size={20} color={colors.textSecondary} />
              <Text style={styles.actionButtonText}>Release</Text>
            </Pressable>
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.dangerLabel}>Danger Zone</Text>
          <Pressable style={styles.dangerButton} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            <Text style={styles.dangerButtonText}>Delete Permanently</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing.xxl }} />
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
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  projectTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  roleName: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  company: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textTertiary,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statusCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.normal,
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statusValueBooked: {
    color: colors.accent,
  },
  statusValueReleased: {
    color: colors.textTertiary,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.sectionHeader,
    marginBottom: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
  },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  notesText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  dangerLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.semibold,
    color: colors.error,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.sectionHeader,
    marginBottom: spacing.sm,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.lg,
  },
  dangerButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.error,
  },
});
