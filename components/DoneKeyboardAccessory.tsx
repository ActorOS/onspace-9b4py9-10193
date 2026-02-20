import React from 'react';
import { Platform, View, Text, StyleSheet, Pressable, InputAccessoryView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type DoneKeyboardAccessoryProps = {
  nativeID: string;
  onDone?: () => void;
};

/**
 * iOS keyboard accessory bar with a "Done" button
 * Usage: Add inputAccessoryViewID prop to TextInput with matching nativeID
 */
export function DoneKeyboardAccessory({ nativeID, onDone }: DoneKeyboardAccessoryProps) {
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View style={styles.container}>
        <View style={styles.spacer} />
        <Pressable 
          style={({ pressed }) => [
            styles.doneButton,
            pressed && styles.doneButtonPressed
          ]}
          onPress={onDone}
        >
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  doneButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  doneButtonPressed: {
    opacity: 0.7,
  },
  doneText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
});
