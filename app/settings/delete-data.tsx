import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function DeleteDataScreen() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!canDelete) return;

    Alert.alert(
      'Permanently delete all data?',
      'This action cannot be undone. All roles, sessions, auditions, and settings will be erased.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Clear all AsyncStorage data
              await AsyncStorage.clear();
              
              Alert.alert(
                'All data deleted',
                'The app will now restart.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to home
                      router.replace('/(tabs)');
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Failed to delete data:', error);
              Alert.alert('Error', 'Failed to delete data. Please try again.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Delete All Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.warningCard}>
            <MaterialIcons name="warning" size={48} color={colors.error} />
            <Text style={styles.warningTitle}>This cannot be undone</Text>
            <Text style={styles.warningText}>
              Deleting all data will permanently erase:{'\n\n'}
              • All role containers{'\n'}
              • All work sessions{'\n'}
              • All audition records{'\n'}
              • All check-ins and aftereffects{'\n'}
              • All app settings{'\n\n'}
              Your data is stored only on this device.{'\n'}
              Once deleted, it cannot be recovered.
            </Text>
          </View>

          <View style={styles.confirmSection}>
            <Text style={styles.confirmLabel}>
              Type <Text style={styles.confirmKeyword}>DELETE</Text> to confirm:
            </Text>
            <TextInput
              style={styles.confirmInput}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="DELETE"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <Pressable
            style={[styles.deleteButton, !canDelete && styles.deleteButtonDisabled]}
            onPress={handleDelete}
            disabled={!canDelete || isDeleting}
          >
            <MaterialIcons 
              name="delete-forever" 
              size={20} 
              color={canDelete ? colors.background : colors.textTertiary} 
            />
            <Text style={[styles.deleteButtonText, !canDelete && styles.deleteButtonTextDisabled]}>
              {isDeleting ? 'Deleting...' : 'Delete Everything'}
            </Text>
          </Pressable>

          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={colors.accent} />
            <Text style={styles.infoText}>
              Consider exporting your data first if you want to keep a copy.
            </Text>
          </View>
        </View>
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
  backButton: {
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
  content: {
    padding: spacing.lg,
  },
  warningCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error,
    marginBottom: spacing.xl,
  },
  warningTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  warningText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'left',
  },
  confirmSection: {
    marginBottom: spacing.xl,
  },
  confirmLabel: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  confirmKeyword: {
    fontWeight: typography.weights.bold,
    color: colors.error,
  },
  confirmInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.border,
    textAlign: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  deleteButtonDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  deleteButtonTextDisabled: {
    color: colors.textTertiary,
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
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
