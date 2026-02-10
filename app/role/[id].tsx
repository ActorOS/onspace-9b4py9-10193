import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { roleStorage, type Role } from '@/services/roleStorage';
import { sessionStorage } from '@/services/sessionStorage';
import { somaticExitStorage } from '@/services/somaticExitStorage';
import { tierStorage } from '@/services/tierStorage';
import { UpgradePrompt } from '@/components';

export default function RoleWorkspaceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [role, setRole] = useState<Role | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState({ name: '', description: '' });
  const [isPro, setIsPro] = useState(false);
  const [currentWorkloadLevel, setCurrentWorkloadLevel] = useState<'light' | 'medium' | 'heavy' | null>(null);

  // Character notes sections state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core']));
  const [editingField, setEditingField] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState({
    coreWho: '',
    coreWants: '',
    coreFears: '',
    relationshipsKey: '',
    relationshipsPower: '',
    relationshipsEmotional: '',
    characterBelongs: '',
    actorBelongs: '',
    currentActive: '',
  });

  // Debounced autosave
  useEffect(() => {
    if (!role || !id) return;
    
    const saveTimer = setTimeout(async () => {
      try {
        await roleStorage.updateRole(id as string, {
          characterNotes: localNotes,
        });
      } catch (error) {
        console.error('Failed to save notes:', error);
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [localNotes, id]);

  const toggleSection = async (section: string) => {
    // Advanced notes (relationships, boundary, current) are Pro-only
    if (['relationships', 'boundary', 'current'].includes(section)) {
      const features = await tierStorage.getFeatures();
      if (!features.canAccessAdvancedNotes) {
        setUpgradeFeature({
          name: 'Advanced Character Notes',
          description: 'Pro unlocks structured note-taking with relationships, boundaries, and active tracking to support emotional containment.'
        });
        setShowUpgradePrompt(true);
        return;
      }
    }

    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const updateNoteField = (field: string, value: string) => {
    setLocalNotes(prev => ({ ...prev, [field]: value }));
  };

  const loadRole = async () => {
    if (!id) return;
    try {
      const loadedRole = await roleStorage.getRoleById(id as string);
      setRole(loadedRole);
      if (loadedRole?.characterNotes) {
        setLocalNotes({
          coreWho: loadedRole.characterNotes.coreWho || '',
          coreWants: loadedRole.characterNotes.coreWants || '',
          coreFears: loadedRole.characterNotes.coreFears || '',
          relationshipsKey: loadedRole.characterNotes.relationshipsKey || '',
          relationshipsPower: loadedRole.characterNotes.relationshipsPower || '',
          relationshipsEmotional: loadedRole.characterNotes.relationshipsEmotional || '',
          characterBelongs: loadedRole.characterNotes.characterBelongs || '',
          actorBelongs: loadedRole.characterNotes.actorBelongs || '',
          currentActive: loadedRole.characterNotes.currentActive || '',
        });
      }
    } catch (error) {
      console.error('Failed to load role:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRole();
      checkTier();
      loadCurrentWorkload();
    }, [id])
  );

  const loadCurrentWorkload = async () => {
    if (!id) return;
    try {
      const activeSession = await sessionStorage.getActiveSession();
      if (activeSession && activeSession.roleId === id) {
        setCurrentWorkloadLevel(activeSession.workloadLevel || activeSession.heaviness || null);
      } else {
        setCurrentWorkloadLevel(null);
      }
    } catch (error) {
      console.error('Failed to load current workload:', error);
      setCurrentWorkloadLevel(null);
    }
  };

  const checkTier = async () => {
    const tier = await tierStorage.getTier();
    setIsPro(tier === 'pro');
  };

  const handleCloseRole = async () => {
    if (!id) return;
    try {
      await roleStorage.closeRole(id as string);
      setShowCloseModal(false);
      setShowMenu(false);
      await loadRole();
    } catch (error) {
      console.error('Failed to close role:', error);
    }
  };

  const handleArchiveRole = async () => {
    if (!id) return;
    try {
      await roleStorage.archiveRole(id as string);
      setShowArchiveModal(false);
      setShowMenu(false);
      router.back();
    } catch (error) {
      console.error('Failed to archive role:', error);
    }
  };

  const handlePermanentDelete = async () => {
    if (!id || deleteConfirmText !== 'DELETE') return;
    try {
      await roleStorage.permanentlyDeleteRole(id as string);
      setShowDeleteModal(false);
      setShowMenu(false);
      router.back();
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  if (!role) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading role...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Role Container</Text>
        <Pressable style={styles.menuButton} onPress={() => setShowMenu(true)}>
          <MaterialIcons name="more-vert" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          { paddingBottom: !role.archived && role.status !== 'closed' ? 100 : spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Role Header */}
          <View style={styles.roleHeader}>
            <Text style={styles.roleTitle}>{role.characterName}</Text>
            <Text style={styles.projectName}>
              {role.production} · {role.status.charAt(0).toUpperCase() + role.status.slice(1)}
            </Text>
            {role.archived && (
              <View style={styles.archivedBadge}>
                <MaterialIcons name="archive" size={16} color={colors.textSecondary} />
                <Text style={styles.archivedText}>Archived</Text>
              </View>
            )}
          </View>





          {/* Character Notes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Character Notes</Text>
            </View>
            
            {/* Core of the Character */}
            <View style={styles.notesSection}>
              <Pressable 
                style={styles.notesSectionHeader}
                onPress={() => toggleSection('core')}
              >
                <Text style={styles.notesSectionTitle}>Core of the Character</Text>
                <MaterialIcons 
                  name={expandedSections.has('core') ? 'expand-less' : 'expand-more'} 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </Pressable>
              
              {expandedSections.has('core') && (
                <View style={styles.notesSectionContent}>
                  <View style={styles.noteField}>
                    <Text style={styles.noteFieldLabel}>Who is this character at their core?</Text>
                    <TextInput
                      style={styles.noteFieldInput}
                      value={localNotes.coreWho}
                      onChangeText={(text) => updateNoteField('coreWho', text)}
                      placeholder="Their essence, their fundamental nature..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                  
                  <View style={styles.noteField}>
                    <Text style={styles.noteFieldLabel}>What do they want most?</Text>
                    <TextInput
                      style={styles.noteFieldInput}
                      value={localNotes.coreWants}
                      onChangeText={(text) => updateNoteField('coreWants', text)}
                      placeholder="Their deepest desire, their primary objective..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                  
                  <View style={styles.noteField}>
                    <Text style={styles.noteFieldLabel}>What are they afraid of?</Text>
                    <TextInput
                      style={styles.noteFieldInput}
                      value={localNotes.coreFears}
                      onChangeText={(text) => updateNoteField('coreFears', text)}
                      placeholder="Their core fear, what they are running from..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Relationships */}
            <View style={styles.notesSection}>
              <Pressable 
                style={styles.notesSectionHeader}
                onPress={() => toggleSection('relationships')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text style={styles.notesSectionTitle}>Relationships</Text>
                  {!isPro && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </View>
                <MaterialIcons 
                  name={expandedSections.has('relationships') ? 'expand-less' : 'expand-more'} 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </Pressable>
              
              {expandedSections.has('relationships') && (
                <View style={styles.notesSectionContent}>
                  <View style={styles.noteField}>
                    <Text style={styles.noteFieldLabel}>Key relationships</Text>
                    <TextInput
                      style={styles.noteFieldInput}
                      value={localNotes.relationshipsKey}
                      onChangeText={(text) => updateNoteField('relationshipsKey', text)}
                      placeholder="Who matters most to this character..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                  
                  <View style={styles.noteField}>
                    <Text style={styles.noteFieldLabel}>Power dynamics</Text>
                    <TextInput
                      style={styles.noteFieldInput}
                      value={localNotes.relationshipsPower}
                      onChangeText={(text) => updateNoteField('relationshipsPower', text)}
                      placeholder="Who has power, who wants it, how does it shift..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                  
                  <View style={styles.noteField}>
                    <Text style={styles.noteFieldLabel}>Emotional attachments</Text>
                    <TextInput
                      style={styles.noteFieldInput}
                      value={localNotes.relationshipsEmotional}
                      onChangeText={(text) => updateNoteField('relationshipsEmotional', text)}
                      placeholder="Who do they love, need, fear losing..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Character vs Me (Boundary Section) */}
            <View style={styles.notesSection}>
              <Pressable 
                style={styles.notesSectionHeader}
                onPress={() => toggleSection('boundary')}
              >
                <View style={styles.boundaryHeader}>
                  <Text style={styles.notesSectionTitle}>Character vs Me</Text>
                  <MaterialIcons name="shield" size={16} color={colors.primary} style={{ marginLeft: spacing.xs }} />
                  {!isPro && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </View>
                <MaterialIcons 
                  name={expandedSections.has('boundary') ? 'expand-less' : 'expand-more'} 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </Pressable>
              
              {expandedSections.has('boundary') && (
                <View style={styles.notesSectionContent}>
                  <View style={styles.boundaryField}>
                    <View style={styles.boundaryFieldHeader}>
                      <MaterialIcons name="theater-comedy" size={20} color={colors.accent} />
                      <Text style={styles.noteFieldLabel}>What belongs to the character</Text>
                    </View>
                    <TextInput
                      style={[styles.noteFieldInput, styles.boundaryInput]}
                      value={localNotes.characterBelongs}
                      onChangeText={(text) => updateNoteField('characterBelongs', text)}
                      placeholder="This is theirs, not mine..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                  
                  <View style={styles.boundaryDivider} />
                  
                  <View style={styles.boundaryField}>
                    <View style={styles.boundaryFieldHeader}>
                      <MaterialIcons name="person" size={20} color={colors.primary} />
                      <Text style={styles.noteFieldLabel}>What belongs to me</Text>
                    </View>
                    <TextInput
                      style={[styles.noteFieldInput, styles.boundaryInput]}
                      value={localNotes.actorBelongs}
                      onChangeText={(text) => updateNoteField('actorBelongs', text)}
                      placeholder="This is mine, I keep this..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Current Notes */}
            <View style={styles.notesSection}>
              <Pressable 
                style={styles.notesSectionHeader}
                onPress={() => toggleSection('current')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text style={styles.notesSectionTitle}>Current Notes</Text>
                  {!isPro && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </View>
                <MaterialIcons 
                  name={expandedSections.has('current') ? 'expand-less' : 'expand-more'} 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </Pressable>
              
              {expandedSections.has('current') && (
                <View style={styles.notesSectionContent}>
                  <View style={styles.noteField}>
                    <Text style={styles.noteFieldLabel}>What feels active or unresolved right now?</Text>
                    <TextInput
                      style={[styles.noteFieldInput, { minHeight: 120 }]}
                      value={localNotes.currentActive}
                      onChangeText={(text) => updateNoteField('currentActive', text)}
                      placeholder="What is present, what needs attention..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* What This Role Asks */}
          {role.whatRoleAsks && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What This Role Asks</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>{role.whatRoleAsks}</Text>
              </View>
            </View>
          )}

          {/* Boundaries */}
          {role.boundaries && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Boundaries Set</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>{role.boundaries}</Text>
              </View>
            </View>
          )}

          {/* Work Sessions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Work Sessions</Text>
              <Text style={styles.badge}>0</Text>
            </View>
            <View style={styles.emptyState}>
              <MaterialIcons name="movie" size={32} color={colors.textTertiary} />
              <Text style={styles.emptyStateText}>No sessions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                What this role leaves behind will appear here
              </Text>
            </View>
          </View>

          {/* Load Pattern */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Load Pattern</Text>
            <View style={styles.patternCard}>
              <MaterialIcons name="show-chart" size={24} color={colors.textTertiary} />
              <Text style={styles.patternText}>
                What this role consistently leaves behind
              </Text>
            </View>
          </View>

          <View style={{ height: spacing.xl }} />
        </View>
      </ScrollView>

      {/* Action Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuModal}>
            {role.status !== 'closed' && !role.archived && (
              <Pressable 
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  setShowCloseModal(true);
                }}
              >
                <MaterialIcons name="check-circle" size={20} color={colors.accent} />
                <Text style={styles.menuItemText}>Close Role</Text>
              </Pressable>
            )}
            
            {!role.archived && (
              <Pressable 
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  setShowArchiveModal(true);
                }}
              >
                <MaterialIcons name="archive" size={20} color={colors.primary} />
                <Text style={styles.menuItemText}>Archive</Text>
              </Pressable>
            )}

            {role.archived && (
              <Pressable 
                style={styles.menuItem}
                onPress={async () => {
                  await roleStorage.unarchiveRole(role.id);
                  setShowMenu(false);
                  await loadRole();
                }}
              >
                <MaterialIcons name="unarchive" size={20} color={colors.primary} />
                <Text style={styles.menuItemText}>Unarchive</Text>
              </Pressable>
            )}

            <View style={styles.menuDivider} />

            <Pressable 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowDeleteModal(true);
              }}
            >
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>
                Permanently Delete
              </Text>
            </Pressable>

            <Pressable 
              style={[styles.menuItem, styles.menuItemCancel]}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.menuItemCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Close Role Modal */}
      <Modal
        visible={showCloseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCloseModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowCloseModal(false)}
        >
          <Pressable style={styles.confirmModal}>
            <View style={styles.confirmHeader}>
              <MaterialIcons name="check-circle" size={32} color={colors.accent} />
              <Text style={styles.confirmTitle}>Close This Role?</Text>
            </View>
            <Text style={styles.confirmText}>
              This marks the role as closed. Production has ended, and you are formally releasing this container.
            </Text>
            <Text style={styles.confirmSubtext}>
              The role will move to "Closed" but remain accessible for review.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable 
                style={[styles.confirmButton, styles.confirmButtonSecondary]}
                onPress={() => setShowCloseModal(false)}
              >
                <Text style={styles.confirmButtonTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.confirmButton, styles.confirmButtonPrimary]}
                onPress={handleCloseRole}
              >
                <Text style={styles.confirmButtonText}>Close Role</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Archive Modal */}
      <Modal
        visible={showArchiveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowArchiveModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowArchiveModal(false)}
        >
          <Pressable style={styles.confirmModal}>
            <View style={styles.confirmHeader}>
              <MaterialIcons name="archive" size={32} color={colors.primary} />
              <Text style={styles.confirmTitle}>Archive This Role?</Text>
            </View>
            <Text style={styles.confirmText}>
              This removes the role from your active containers. It will be hidden from home and main lists.
            </Text>
            <Text style={styles.confirmSubtext}>
              You can unarchive it later from the Archived view.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable 
                style={[styles.confirmButton, styles.confirmButtonSecondary]}
                onPress={() => setShowArchiveModal(false)}
              >
                <Text style={styles.confirmButtonTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.confirmButton, styles.confirmButtonPrimary]}
                onPress={handleArchiveRole}
              >
                <Text style={styles.confirmButtonText}>Archive</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText('');
        }}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            setShowDeleteModal(false);
            setDeleteConfirmText('');
          }}
        >
          <Pressable style={styles.confirmModal}>
            <View style={styles.confirmHeader}>
              <MaterialIcons name="warning" size={32} color={colors.error} />
              <Text style={[styles.confirmTitle, { color: colors.error }]}>
                Danger Zone
              </Text>
            </View>
            <Text style={styles.confirmText}>
              This permanently deletes the role and all associated work sessions, aftereffects, and audition records.
            </Text>
            <Text style={[styles.confirmSubtext, { color: colors.error }]}>
              This action cannot be undone.
            </Text>
            <Text style={styles.deletePrompt}>
              Type DELETE to confirm:
            </Text>
            <TextInput
              style={styles.deleteInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="DELETE"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
            />
            <View style={styles.confirmActions}>
              <Pressable 
                style={[styles.confirmButton, styles.confirmButtonSecondary]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
              >
                <Text style={styles.confirmButtonTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[
                  styles.confirmButton, 
                  styles.confirmButtonDanger,
                  deleteConfirmText !== 'DELETE' && styles.confirmButtonDisabled
                ]}
                onPress={handlePermanentDelete}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                <Text style={[
                  styles.confirmButtonText,
                  deleteConfirmText !== 'DELETE' && styles.confirmButtonTextDisabled
                ]}>
                  Delete Forever
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sticky Footer Action */}
      {!role.archived && role.status !== 'closed' && (
        <View style={styles.footer}>
          <Pressable 
            style={({ pressed }) => [
              styles.enterButton,
              pressed && { backgroundColor: colors.primaryDark, transform: [{ scale: 0.98 }] }
            ]}
            onPress={() => router.push('/check-in/pre')}
          >
            <MaterialIcons name="play-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.enterButtonText}>Enter This Role</Text>
          </Pressable>
        </View>
      )}

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature={upgradeFeature.name}
        description={upgradeFeature.description}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
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
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.sectionHeader,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  roleHeader: {
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: typography.sizes.display,
    fontFamily: typography.fonts.display,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    letterSpacing: 0,
    marginBottom: spacing.xs,
  },
  projectName: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  archivedText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.sectionHeader,
  },
  badge: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textTertiary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 20,
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  enterButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
  },
  notesSectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  notesSectionContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  noteField: {
    gap: spacing.sm,
  },
  noteFieldLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  noteFieldInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
    minHeight: 80,
  },
  boundaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boundaryField: {
    gap: spacing.sm,
  },
  boundaryFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  boundaryInput: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  boundaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  patternCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patternText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },
  placeholder: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  menuModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  menuItemText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  menuItemCancel: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
  },
  menuItemCancelText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  confirmModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  confirmTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.displayBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.sectionHeader,
    marginTop: spacing.md,
  },
  confirmText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  confirmSubtext: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  deletePrompt: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: typography.weights.semibold,
  },
  deleteInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonSecondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButtonPrimary: {
    backgroundColor: colors.primary,
  },
  confirmButtonDanger: {
    backgroundColor: colors.error,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
  confirmButtonTextSecondary: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  confirmButtonTextDisabled: {
    color: colors.textTertiary,
  },
  containmentHelperText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontWeight: typography.weights.medium,
  },
  guidanceHeadline: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  guidanceText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  releaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  releaseCardLocked: {
    opacity: 0.6,
  },
  releaseIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  releaseContent: {
    flex: 1,
  },
  releaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  releaseTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  releaseTitleLocked: {
    color: colors.textSecondary,
  },
  releaseSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  releaseSubtitleLocked: {
    color: colors.textTertiary,
  },
  releaseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  releaseDuration: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  releaseDurationLocked: {
    color: colors.textTertiary,
  },
  proBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  proBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
