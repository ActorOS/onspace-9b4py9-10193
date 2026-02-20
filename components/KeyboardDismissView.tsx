import React from 'react';
import { Keyboard, Pressable, View, ViewStyle } from 'react-native';

type KeyboardDismissViewProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Wrapper component that dismisses the keyboard when tapped outside of input fields
 */
export function KeyboardDismissView({ children, style }: KeyboardDismissViewProps) {
  return (
    <Pressable
      style={[{ flex: 1 }, style]}
      onPress={() => Keyboard.dismiss()}
      accessible={false}
    >
      <View style={{ flex: 1 }} pointerEvents="box-none">
        {children}
      </View>
    </Pressable>
  );
}
