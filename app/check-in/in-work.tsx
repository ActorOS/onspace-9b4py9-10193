import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { roleStorage, type Role } from '@/services/roleStorage';
import { sessionStorage, type WorkSession } from '@/services/sessionStorage';

export default function InWorkScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<WorkSession | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) {
      router.replace('/');
      return;
    }

    setIsLoading(true);
    try {
      const allSessions = await sessionStorage.getAllSessions();
      const currentSession = allSessions.find(s => s.id === sessionId);
      
      if (!currentSession) {
        router.replace('/');
        return;
      }

      const allRoles = await roleStorage.getAllRoles();
      const currentRole = allRoles.find(r => r.id === currentSession.roleId);

      setSession(currentSession);
      setRole(currentRole || null);
    } catch (error) {
      console.error('Failed to load session:', error);
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitWork = () => {
    // Route directly to Release & Return screen instead of post flow
    router.push(`/grounding?sessionId=${sessionId}`);
  };

  if (isLoading || !session || !role) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const entryTime = new Date(session.enteredAt);
  const now = new Date();
  const durationMs = now.getTime() - entryTime.getTime();
  const durationMinutes = Math.floor(durationMs / 60000);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.statusIndicator}>
          <MaterialIcons name="circle" size={16} color={colors.success} />
        </View>

        <Text style={styles.title}>In Work</Text>
        <Text style={styles.subtitle}>Session active</Text>

        <Pressable
          style={styles.exitButton}
          onPress={handleExitWork}
        >
          <Text style={styles.exitButtonText}>Exit Work</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C5B8A8', // Slightly darker than normal background for containment
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  statusIndicator: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl * 2,
  },
  exitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  exitButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
});
