import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth-gate" />
        <Stack.Screen name="actor-os" />
        <Stack.Screen name="biometric-lock" />
        <Stack.Screen 
          name="email-updates" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="role/[id]" />
        <Stack.Screen 
          name="role/entry" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/pre" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/in-work" 
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen 
          name="check-in/post" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="grounding" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="audition/record" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="audition/[id]" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="audition/edit" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/exercise-breathing" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/exercise-bodyscan" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/exercise-identity" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/exercise-identity-light" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/exercise-identity-full" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/identity-separation-choose" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/identity-separation-tiers" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/exercise-grounding" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/exercise-recovery" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/exercise-recovery-standard" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/exercise-recovery-light" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/exercise-intimacy" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/quick-name" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/quick-location" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/quick-date" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="return/quick-movement" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/load-check" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/light-care" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/medium-care" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/heavy-containment" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/confirm-enter" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/post-work-release" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/return-choice" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/recommended-release-list" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/return-to-self-list" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="check-in/somatic-release-list" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="settings/default-exercise" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="settings/voice-settings" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="settings/delete-data" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="settings/account" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="session/[id]" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="somatic/select-track" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="somatic/play-track" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="release-stack/list" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="release-stack/select-exercises" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="release-stack/reorder" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="release-stack/name" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="release-stack/play" 
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen 
          name="release-stack/edit" 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="intimacy-framework" 
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
