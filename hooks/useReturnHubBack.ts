import { useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BackHandler } from 'react-native';

// RETURN HUB PATH - The central hub for all return/release flows
export const RETURN_HUB_PATH = '/check-in/return-choice';

/**
 * Hook to enforce navigation back to Return Hub from exercises
 * 
 * Usage:
 * const { onClose } = useReturnHubBack();
 * // Then use onClose() for any back/close button
 */
export function useReturnHubBack() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get returnTo param or default to hub
  const returnTo = (params.returnTo as string) || RETURN_HUB_PATH;

  // Handle back navigation
  const onClose = useCallback(() => {
    router.replace(returnTo);
  }, [router, returnTo]);

  // Register Android hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, [onClose]);

  return { onClose, returnTo };
}
