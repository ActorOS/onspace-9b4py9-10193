import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getSupabaseClient } from '@/template';
import { userSettingsStorage } from '@/services/userSettingsStorage';
import { colors } from '@/constants/theme';

export default function IndexScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRoute();
  }, []);

  const checkAuthAndRoute = async () => {
    try {
      // Check Supabase session first
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      // No session → Auth Gate
      if (!session) {
        router.replace('/auth-gate');
        return;
      }

      // Has session → Check onboarding status
      const settings = await userSettingsStorage.getSettings();
      
      if (!settings.onboardingCompleted) {
        // First time user → Onboarding
        router.replace('/actor-os');
      } else {
        // Returning user → Home
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      // On error, assume no auth and show auth gate
      router.replace('/auth-gate');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return null;
}
