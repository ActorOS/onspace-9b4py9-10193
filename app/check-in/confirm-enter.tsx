import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { sessionStorage } from '@/services/sessionStorage';
import { roleStorage } from '@/services/roleStorage';

export default function ConfirmEnterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [isEntering, setIsEntering] = useState(false);

  const heaviness = params.heaviness as string;
  const roleId = params.roleId as string;
  const roleName = params.roleName as string;
  const production = params.production as string;
  const careOptions = params.careOptions ? (params.careOptions as string).split(',') : [];
  const careNote = params.careNote as string;
  const containmentDuration = params.containmentDuration as string;
  const exitRitual = params.exitRitual as string;
  const remindToExit = params.remindToExit === 'true';

  const getLoadColor = () => {
    switch (heaviness) {
      case 'light': return colors.success;
      case 'medium': return colors.warning;
      case 'heavy': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getLoadIcon = () => {
    switch (heaviness) {
      case 'light': return 'emoji-nature';
      case 'medium': return 'healing';
      case 'heavy': return 'shield';
      default: return 'info';
    }
  };

  const formatCareOptions = () => {
    const optionLabels: { [key: string]: string } = {
      breath: 'Breath',
      intention: 'Clear intention',
      boundary: 'Time boundary',
      aftercare: 'Aftercare planned',
      slow: 'Slow down',
      ground: 'Ground',
      risk: 'Name the risk',
      support: 'Ask for support',
    };
    return careOptions.map(id => optionLabels[id] || id).join(', ');
  };

  const formatExitRitual = () => {
    const ritualLabels: { [key: string]: string } = {
      breathing: 'Breathing',
      bodyscan: 'Body scan',
      identity: 'Identity separation',
    };
    return ritualLabels[exitRitual] || exitRitual;
  };

  const handleEnterWork = async () => {
    if (!roleId || !heaviness) {
      Alert.alert('Error', 'Missing required session data');
      return;
    }

    setIsEntering(true);
    try {
      // Create the work session with all collected data
      const session = await sessionStorage.createSession({
        roleId,
        roleName, // Store denormalized role name
        production, // Store denormalized production name
        heaviness: heaviness as 'light' | 'medium' | 'heavy',
        entryBoundaryNote: careNote || undefined,
      });

      // Update the role's last activity
      await roleStorage.updateRole(roleId, {
        updatedAt: new Date().toISOString(),
      });

      // Navigate to the in-work screen
      router.replace({
        pathname: '/check-in/in-work',
        params: { sessionId: session.id },
      });
    } catch (error) {
      console.error('Failed to enter work:', error);
      Alert.alert('Error', 'Failed to start work session. Please try again.');
      setIsEntering(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard this check-in?',
      'Your progress will not be saved.',
      [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm & Enter</Text>
        <Pressable onPress={handleCancel} style={styles.closeButton}>
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
          <MaterialIcons name="check-circle-outline" size={64} color={colors.success} />
          <Text style={styles.title}>You are ready to enter</Text>
          <Text style={styles.subtitle}>Review your preparation</Text>

          {/* Role Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="menu-book" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Role</Text>
            </View>
            <Text style={styles.roleName}>{roleName}</Text>
            <Text style={styles.production}>{production}</Text>
          </View>

          {/* Load Level Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name={getLoadIcon() as any} size={24} color={getLoadColor()} />
              <Text style={styles.cardTitle}>Load Level</Text>
            </View>
            <Text style={[styles.loadValue, { color: getLoadColor() }]}>
              {heaviness.charAt(0).toUpperCase() + heaviness.slice(1)}
            </Text>
          </View>

          {/* Care Options Card */}
          {careOptions.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="favorite" size={24} color={colors.accent} />
                <Text style={styles.cardTitle}>Care Plan</Text>
              </View>
              <Text style={styles.cardValue}>{formatCareOptions()}</Text>
            </View>
          )}

          {/* Care Note Card */}
          {careNote && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="note" size={24} color={colors.textSecondary} />
                <Text style={styles.cardTitle}>Note</Text>
              </View>
              <Text style={styles.cardValue}>{careNote}</Text>
            </View>
          )}

          {/* Containment Plan Card */}
          {containmentDuration && exitRitual && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="shield" size={24} color={colors.error} />
                <Text style={styles.cardTitle}>Containment Plan</Text>
              </View>
              <View style={styles.containmentRow}>
                <Text style={styles.containmentLabel}>Duration:</Text>
                <Text style={styles.containmentValue}>{containmentDuration} minutes</Text>
              </View>
              <View style={styles.containmentRow}>
                <Text style={styles.containmentLabel}>Exit ritual:</Text>
                <Text style={styles.containmentValue}>{formatExitRitual()}</Text>
              </View>
              {remindToExit && (
                <View style={styles.reminderBadge}>
                  <MaterialIcons name="notifications-active" size={16} color={colors.primary} />
                  <Text style={styles.reminderText}>Exit reminder enabled</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Pressable
          style={[styles.enterButton, isEntering && styles.enterButtonDisabled]}
          onPress={handleEnterWork}
          disabled={isEntering}
        >
          {isEntering ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <>
              <MaterialIcons name="login" size={24} color={colors.background} />
              <Text style={styles.enterButtonText}>Enter Work</Text>
            </>
          )}
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
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
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
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  },
  loadValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  cardValue: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  containmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  containmentLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  containmentValue: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  reminderText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  bottomBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
  },
  enterButtonDisabled: {
    opacity: 0.6,
  },
  enterButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
});
