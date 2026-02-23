import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useReturnHubBack } from '@/hooks/useReturnHubBack';

export default function QuickMovementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { onClose, returnTo } = useReturnHubBack();
  const isStackMode = params.stackMode === 'true';

  const handleDone = async () => {
    try {
      // Only save return session if not in stack mode
      if (!isStackMode) {
        const roleId = await returnSessionStorage.getActiveRoleId();
        await returnSessionStorage.saveReturnSession({
          createdAt: new Date().toISOString(),
          roleId,
          source: 'release_return',
          completed: true,
          completionType: 'quick',
          notes: 'Quick return: Movement',
        });
      }
      router.replace(returnTo);
    } catch (error) {
      console.error('Failed to log return session:', error);
      Alert.alert('Error', 'Failed to log session');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Movement</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.instructionCard}>
          <MaterialIcons name="directions-walk" size={48} color={colors.primary} />
          <Text style={styles.instruction}>Move your body in a way that is yours.</Text>
          <Text style={styles.instructionSub}>
            Shake your hands.{'\n'}
            Roll your shoulders.{'\n'}
            Stretch your neck.{'\n'}
            Jump twice.{'\n\n'}
            Any movement the character does not own.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    justifyContent: 'center',
  },
  instructionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  instruction: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  instructionSub: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
