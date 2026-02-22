import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { userSettingsStorage } from '@/services/userSettingsStorage';
import { systemVoiceAudio } from '@/constants/systemAudio';
import { getSupabaseClient } from '@/template';

export default function ActorOSScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [dimensions, setDimensions] = useState({ width: 375, height: 667 });
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const updateDimensions = () => setDimensions(Dimensions.get('window'));
    updateDimensions();
    const subscription = Dimensions.addEventListener('change', updateDimensions);

    // Fade in and scale animation
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
    
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
      mass: 0.8,
    });
    
    translateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // Load and play onboarding audio
    loadAndPlayAudio();

    return () => {
      subscription?.remove();
      // Cleanup audio on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadAndPlayAudio = async () => {
    try {
      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load the onboarding audio
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: systemVoiceAudio.onboardingIntro },
        { shouldPlay: true, volume: 0.8 },
        null
      );
      
      setSound(audioSound);
    } catch (error) {
      // Graceful fallback: Log error but continue silently
      console.log('Onboarding audio playback failed, continuing without audio:', error);
      // App continues to function normally without audio
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  const handleContinue = async () => {
    try {
      // Stop audio if playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      
      // Mark onboarding as completed
      await userSettingsStorage.completeOnboarding();
      
      // Bypass email - go directly to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still navigate even if storage fails
      router.replace('/(tabs)');
    }
  };

  // Logo height should be 55-60% of screen height
  const logoHeight = Math.max(1, dimensions.height * 0.58);
  const logoWidth = Math.max(1, dimensions.width * 0.90);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, animatedStyle]}>
          <Image 
            source={{ uri: 'https://cdn-ai.onspace.ai/onspace/files/PDGAXfQNuqYSui8437zvz9/1000005139.png' }}
            style={[styles.logo, { width: logoWidth, height: logoHeight }]}
            contentFit="contain"
            transition={200}
          />
        </Animated.View>
      </View>
      
      {/* Fixed Footer Button */}
      <View style={[
        styles.footer,
        { paddingBottom: Math.max(insets.bottom, spacing.lg) }
      ]}>
        <Pressable 
          style={({ pressed }) => [
            styles.enterButton,
            pressed && styles.enterButtonPressed
          ]} 
          onPress={handleContinue}
        >
          <Text style={styles.enterButtonText}>Enter Actor OS</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Space for footer button
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    resizeMode: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  enterButton: {
    width: '100%',
    paddingVertical: spacing.lg + spacing.xs,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(154, 143, 119, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(138, 128, 109, 0.4)',
  },
  enterButtonPressed: {
    backgroundColor: 'rgba(154, 143, 119, 0.4)',
    borderColor: 'rgba(138, 128, 109, 0.5)',
  },
  enterButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    letterSpacing: 0,
    opacity: 0.85,
  },
});
