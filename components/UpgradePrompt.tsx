import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface UpgradePromptProps {
  visible: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
}

export function UpgradePrompt({ visible, onClose, feature, description }: UpgradePromptProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="lock-outline" size={48} color={colors.primary} />
          </View>
          
          <Text style={styles.title}>Available in Pro</Text>
          
          <Text style={styles.featureName}>{feature}</Text>
          
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              Actor OS Free provides a complete foundation for entering and releasing work.
              Pro unlocks full containment tools for sustained professional use.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable 
              style={styles.dismissButton}
              onPress={onClose}
            >
              <Text style={styles.dismissButtonText}>Not Now</Text>
            </Pressable>
            
            <Pressable 
              style={styles.upgradeButton}
              onPress={() => {
                // TODO: Navigate to upgrade flow
                onClose();
              }}
            >
              <Text style={styles.upgradeButtonText}>Learn More</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  featureName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  dismissButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dismissButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  upgradeButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
});
