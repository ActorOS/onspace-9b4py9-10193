import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { userSettingsStorage, type VoiceStyle } from '@/services/userSettingsStorage';

const VOICE_STYLES: { id: VoiceStyle; label: string; description: string }[] = [
  { id: 'warmFemale', label: 'Warm Female', description: 'Gentle, grounded tone' },
  { id: 'warmMale', label: 'Warm Male', description: 'Calm, steady presence' },
  { id: 'neutral', label: 'Neutral', description: 'Balanced, minimal' },
];

export default function VoiceSettingsScreen() {
  const router = useRouter();
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('warmFemale');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(75);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await userSettingsStorage.getSettings();
      setVoiceStyle(settings.voiceStyle);
      setVoiceSpeed(settings.voiceSpeed);
      setVoiceVolume(settings.voiceVolume);
    } catch (error) {
      console.error('Failed to load voice settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleChange = async (style: VoiceStyle) => {
    setVoiceStyle(style);
    try {
      await userSettingsStorage.updateSetting('voiceStyle', style);
    } catch (error) {
      console.error('Failed to update voice style:', error);
    }
  };

  const handleSpeedChange = async (speed: number) => {
    setVoiceSpeed(speed);
    try {
      await userSettingsStorage.updateSetting('voiceSpeed', speed);
    } catch (error) {
      console.error('Failed to update voice speed:', error);
    }
  };

  const handleVolumeChange = async (volume: number) => {
    setVoiceVolume(volume);
    try {
      await userSettingsStorage.updateSetting('voiceVolume', volume);
    } catch (error) {
      console.error('Failed to update voice volume:', error);
    }
  };

  const handlePreviewVoice = async () => {
    try {
      const pitch = voiceStyle === 'warmMale' ? 0.8 : voiceStyle === 'warmFemale' ? 1.0 : 0.9;
      
      await Speech.speak("You're safe. Let's return to yourself.", {
        rate: voiceSpeed * 0.65,
        pitch: pitch,
        volume: voiceVolume / 100,
      });
    } catch (error) {
      console.error('Failed to preview voice:', error);
      Alert.alert('Error', 'Failed to play voice preview');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Voice Guidance</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Voice Guidance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Voice Style */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Style</Text>
            {VOICE_STYLES.map((style) => {
              const isSelected = voiceStyle === style.id;
              return (
                <Pressable
                  key={style.id}
                  style={[styles.styleCard, isSelected && styles.styleCardSelected]}
                  onPress={() => handleStyleChange(style.id)}
                >
                  <View style={styles.styleInfo}>
                    <Text style={[styles.styleLabel, isSelected && styles.styleLabelSelected]}>
                      {style.label}
                    </Text>
                    <Text style={styles.styleDescription}>{style.description}</Text>
                  </View>
                  {isSelected && (
                    <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Voice Speed */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Speed</Text>
            <View style={styles.sliderCard}>
              <View style={styles.sliderLabelRow}>
                <Text style={styles.sliderLabel}>Slower</Text>
                <Text style={styles.sliderValue}>{voiceSpeed.toFixed(1)}x</Text>
                <Text style={styles.sliderLabel}>Faster</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0.9}
                maximumValue={1.1}
                value={voiceSpeed}
                onValueChange={setVoiceSpeed}
                onSlidingComplete={handleSpeedChange}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                step={0.05}
              />
            </View>
          </View>

          {/* Voice Volume */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Volume</Text>
            <View style={styles.sliderCard}>
              <View style={styles.sliderLabelRow}>
                <MaterialIcons name="volume-mute" size={20} color={colors.textSecondary} />
                <Text style={styles.sliderValue}>{voiceVolume}%</Text>
                <MaterialIcons name="volume-up" size={20} color={colors.textSecondary} />
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={voiceVolume}
                onValueChange={setVoiceVolume}
                onSlidingComplete={handleVolumeChange}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                step={5}
              />
            </View>
          </View>

          {/* Preview Button */}
          <Pressable style={styles.previewButton} onPress={handlePreviewVoice}>
            <MaterialIcons name="play-arrow" size={24} color={colors.primary} />
            <Text style={styles.previewButtonText}>Preview voice</Text>
          </Pressable>

          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={colors.accent} />
            <Text style={styles.infoText}>
              Voice settings apply to all guided exercises
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  styleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  styleInfo: {
    flex: 1,
  },
  styleLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  styleLabelSelected: {
    color: colors.primary,
  },
  styleDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  sliderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sliderLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  sliderValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
