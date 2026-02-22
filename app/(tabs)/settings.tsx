
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { userSettingsStorage, type UserSettings } from '@/services/userSettingsStorage';
import { roleStorage } from '@/services/roleStorage';
import { sessionStorage } from '@/services/sessionStorage';
import { aftereffectsStorage } from '@/services/aftereffectsStorage';
import { auditionStorage } from '@/services/auditionStorage';
import { returnSessionStorage } from '@/services/returnSessionStorage';
import { tierStorage, type UserTier } from '@/services/tierStorage';
import { biometricLockStorage, type BiometricCapability } from '@/services/biometricLockStorage';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [biometricCapability, setBiometricCapability] = useState<BiometricCapability | null>(null);
  const [biometricLockEnabled, setBiometricLockEnabled] = useState(false);
  const [currentTier, setCurrentTier] = useState<UserTier>('free');

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      checkBiometricCapability();
      loadBiometricLockStatus();
      loadTier();
    }, [])
  );

  const loadTier = async () => {
    try {
      const tier = await tierStorage.getTier();
      setCurrentTier(tier);
    } catch (error) {
      console.error('Failed to load tier:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const loaded = await userSettingsStorage.getSettings();
      setSettings(loaded);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const checkBiometricCapability = async () => {
    try {
      const capability = await biometricLockStorage.checkCapability();
      setBiometricCapability(capability);
    } catch (error) {
      console.error('Failed to check biometric capability:', error);
      setBiometricCapability(null);
    }
  };

  const loadBiometricLockStatus = async () => {
    try {
      const enabled = await biometricLockStorage.isEnabled();
      setBiometricLockEnabled(enabled);
    } catch (error) {
      console.error('Failed to load biometric lock status:', error);
      setBiometricLockEnabled(false);
    }
  };

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    try {
      const updated = await userSettingsStorage.updateSetting(key, value);
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!biometricCapability) {
      Alert.alert('Error', 'Unable to check biometric capability');
      return;
    }

    if (value) {
      // Check capability before enabling
      if (!biometricCapability.hasHardware) {
        Alert.alert(
          'Not Supported',
          'Biometric authentication is not supported on this device.'
        );
        return;
      }

      if (!biometricCapability.isEnrolled) {
        const biometricName = biometricLockStorage.getBiometricTypeName(biometricCapability.biometricType);
        Alert.alert(
          'Biometrics Not Set Up',
          `Please set up ${biometricName} in your device settings, then try again.`,
          [
            { text: 'OK' }
          ]
        );
        return;
      }

      // Test biometric authentication before enabling
      const result = await biometricLockStorage.authenticate('Enable Biometric Lock');

      if (result.success) {
        await biometricLockStorage.enable();
        setBiometricLockEnabled(true);
        Alert.alert(
          'Biometric Lock Enabled',
          'Actor OS will now require authentication when you open the app or return after 30 seconds of inactivity.'
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error || 'Unable to enable Biometric Lock'
        );
      }
    } else {
      // Confirm before disabling
      Alert.alert(
        'Disable Biometric Lock',
        'Your role containers and notes will be accessible without authentication. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await biometricLockStorage.disable();
              setBiometricLockEnabled(false);
            }
          }
        ]
      );
    }
  };

  const handleExportData = async () => {
    try {
      // Gather all data
      const allRoles = await roleStorage.getAllRoles();
      const allSessions = await sessionStorage.getAllSessions();
      const allAftereffects = await aftereffectsStorage.getAllAftereffects();
      const allAuditions = await auditionStorage.getAllAuditions();
      const allReturnSessions = await returnSessionStorage.getAllReturnSessions();

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        roles: allRoles,
        sessions: allSessions,
        aftereffects: allAftereffects,
        auditions: allAuditions,
        returnSessions: allReturnSessions,
        settings: settings,
      };

      // Create file
      const fileName = `actor-os-export-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2)
      );

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Actor OS Data',
        });
      }

      Alert.alert('Export created', 'Your data has been exported');
    } catch (error) {
      console.error('Failed to export data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const getReminderDelayLabel = () => {
    if (!settings) return '30 min';
    const minutes = settings.reminderDelayMinutes;
    return `${minutes} min`;
  };

  const handleReminderDelayPress = () => {
    if (!settings) return;

    const options = [15, 30, 45, 60];
    const currentIndex = options.indexOf(settings.reminderDelayMinutes);
    const nextIndex = (currentIndex + 1) % options.length;
    const nextValue = options[nextIndex];

    updateSetting('reminderDelayMinutes', nextValue);
  };

  const getDefaultExerciseLabel = () => {
    if (!settings) return 'Breathing & Release';
    switch (settings.defaultReleaseExercise) {
      case 'breathing':
        return 'Breathing & Release';
      case 'bodyScan':
        return 'Body Scan';
      case 'identitySeparation':
        return 'Identity Separation';
      default:
        return 'Breathing & Release';
    }
  };

  if (!settings) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Boundaries and preferences</Text>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <MaterialIcons name="lock" size={20} color={colors.textSecondary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Biometric Lock</Text>
                <Text style={styles.settingDescription}>
                  {!biometricCapability 
                    ? 'Checking capability...'
                    : !biometricCapability.hasHardware
                    ? 'Not supported on this device'
                    : !biometricCapability.isEnrolled
                    ? `${biometricLockStorage.getBiometricTypeName(biometricCapability.biometricType)} not set up`
                    : biometricLockEnabled
                    ? 'App locked after 30s inactivity'
                    : 'Require authentication to open app'}
                </Text>
              </View>
              <Switch
                value={biometricLockEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={colors.textPrimary}
                disabled={!biometricCapability || !biometricCapability.hasHardware}
              />
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={colors.accent} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>No Pressure Notifications</Text>
              <Text style={styles.infoSubtext}>
                Actor OS is entered when work has taken something, not maintained as obligation
              </Text>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <MaterialIcons name="notifications" size={20} color={colors.textSecondary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Session Reminders</Text>
                <Text style={styles.settingDescription}>
                  Gentle prompt to close work session
                </Text>
              </View>
              <Switch
                value={settings.sessionRemindersEnabled}
                onValueChange={(value) => updateSetting('sessionRemindersEnabled', value)}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={colors.textPrimary}
              />
            </View>
          </View>

          {settings.sessionRemindersEnabled && (
            <Pressable style={styles.settingCard} onPress={handleReminderDelayPress}>
              <View style={styles.settingRow}>
                <MaterialIcons name="schedule" size={20} color={colors.textSecondary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Reminder Delay</Text>
                  <Text style={styles.settingDescription}>
                    Time before reminder after entering work
                  </Text>
                </View>
                <Text style={styles.settingValue}>{getReminderDelayLabel()}</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Containment Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Containment preferences</Text>
          
          <Pressable 
            style={styles.settingCard}
            onPress={() => router.push('/settings/default-exercise')}
          >
            <View style={styles.settingRow}>
              <MaterialIcons name="spa" size={20} color={colors.textSecondary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Default Release Exercise</Text>
                <Text style={styles.settingDescription}>{getDefaultExerciseLabel()}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </View>
          </Pressable>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <MaterialIcons name="volume-up" size={20} color={colors.textSecondary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Voice Guidance</Text>
                <Text style={styles.settingDescription}>
                  Enable voice during exercises
                </Text>
              </View>
              <Switch
                value={settings.voiceGuidanceEnabled}
                onValueChange={(value) => updateSetting('voiceGuidanceEnabled', value)}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={colors.textPrimary}
              />
            </View>
          </View>

          {settings.voiceGuidanceEnabled && (
            <Pressable 
              style={styles.settingCard}
              onPress={() => router.push('/settings/voice-settings')}
            >
              <View style={styles.settingRow}>
                <MaterialIcons name="tune" size={20} color={colors.textSecondary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Voice Settings</Text>
                  <Text style={styles.settingDescription}>
                    Style, speed, and volume
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </View>
            </Pressable>
          )}
        </View>

        {/* Privacy & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          
          <Pressable 
            style={styles.settingCard}
            onPress={() => router.push('/settings/privacy')}
          >
            <View style={styles.settingRow}>
              <MaterialIcons name="privacy-tip" size={20} color={colors.textSecondary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Privacy Notice</Text>
                <Text style={styles.settingDescription}>View data collection details</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </View>
          </Pressable>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data management</Text>
          
          <Pressable style={styles.settingCard} onPress={handleExportData}>
            <View style={styles.settingRow}>
              <MaterialIcons name="cloud-download" size={20} color={colors.textSecondary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Export All Data</Text>
                <Text style={styles.settingDescription}>Download your data as JSON</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </View>
          </Pressable>

          <Pressable 
            style={styles.settingCard}
            onPress={() => router.push('/settings/delete-data')}
          >
            <View style={styles.settingRow}>
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.error }]}>
                  Delete All Data
                </Text>
                <Text style={styles.settingDescription}>
                  Permanently erase all app data
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </View>
          </Pressable>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoCard}>
            <MaterialIcons name="shield" size={20} color={colors.accent} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Actor OS v1.0.0</Text>
              <Text style={styles.infoSubtext}>
                A private occupational containment system for actors.{'\n'}
                Your work never leaves your device.
              </Text>
            </View>
          </View>

          <Pressable 
            style={styles.settingCard}
            onPress={async () => {
              Alert.alert(
                'Reset Onboarding',
                'The onboarding screen will appear next time you open the app. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    style: 'default',
                    onPress: async () => {
                      try {
                        await userSettingsStorage.resetOnboarding();
                        Alert.alert('Done', 'Onboarding will show on next app launch');
                      } catch (error) {
                        console.error('Failed to reset onboarding:', error);
                        Alert.alert('Error', 'Failed to reset onboarding');
                      }
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.settingRow}>
              <MaterialIcons name="replay" size={20} color={colors.textSecondary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Show Onboarding Again</Text>
                <Text style={styles.settingDescription}>
                  Reset and view the welcome screen
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </View>
          </Pressable>
        </View>

        {/* Tier Section - Pilot/Founder Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership</Text>
          
          <View style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                  <Text style={styles.tierName}>
                    {currentTier === 'pro' ? 'Pro' : 'Free'}
                  </Text>
                  {currentTier === 'pro' && (
                    <View style={styles.founderBadge}>
                      <MaterialIcons name="star" size={12} color="#FFFFFF" />
                      <Text style={styles.founderBadgeText}>PILOT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.tierDescription}>
                  {currentTier === 'pro' 
                    ? 'Full containment system — Founder/Pilot access' 
                    : 'Foundation + one active role'}
                </Text>
              </View>
            </View>
            
            {currentTier === 'pro' && (
              <View style={styles.featureList}>
                <View style={styles.featureRow}>
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>Unlimited Role Containers</Text>
                </View>
                <View style={styles.featureRow}>
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>Advanced Character Notes</Text>
                </View>
                <View style={styles.featureRow}>
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>Full Somatic Exit Tracks</Text>
                </View>
                <View style={styles.featureRow}>
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>Aftermath Mode</Text>
                </View>
                <View style={styles.featureRow}>
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>Role Closure Rituals</Text>
                </View>
                <View style={styles.featureRow}>
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>Full History & Archives</Text>
                </View>
              </View>
            )}
            
            <Pressable 
              style={styles.tierToggleButton}
              onPress={async () => {
                const newTier = currentTier === 'pro' ? 'free' : 'pro';
                await tierStorage.setTier(newTier);
                setCurrentTier(newTier);
                Alert.alert(
                  'Tier Changed', 
                  `Now using ${newTier.toUpperCase()} tier.\n\nThis setting is for pilot testing and demonstration purposes.`
                );
              }}
            >
              <MaterialIcons 
                name={currentTier === 'pro' ? 'lock-open' : 'lock'} 
                size={18} 
                color={currentTier === 'pro' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[styles.tierToggleText, currentTier === 'pro' && { color: colors.primary }]}>
                {currentTier === 'pro' ? 'Switch to Free (for testing)' : 'Enable Pro Access'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.title,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.title,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacing.normal,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacing.sectionHeader,
    marginBottom: spacing.xs,
  },
  settingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  settingValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  infoSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tierCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tierName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  tierDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  founderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
  },
  founderBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  featureList: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  tierToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierToggleText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
});
