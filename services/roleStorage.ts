import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CharacterNotes {
  coreWho?: string;
  coreWants?: string;
  coreFears?: string;
  relationshipsKey?: string;
  relationshipsPower?: string;
  relationshipsEmotional?: string;
  characterBelongs?: string;
  actorBelongs?: string;
  currentActive?: string;
}

export interface Role {
  id: string;
  characterName: string;
  production: string;
  productionType?: string;
  whatRoleAsks?: string;
  boundaries?: string;
  characterNotes?: CharacterNotes;
  status: 'open' | 'held' | 'closed';
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  archivedAt?: string;
  startDate?: string;
  endDate?: string;
  isOngoing?: boolean;
}

const ROLES_STORAGE_KEY = '@actor_os:roles';

export const roleStorage = {
  async getAllRoles(): Promise<Role[]> {
    try {
      const data = await AsyncStorage.getItem(ROLES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading roles:', error);
      return [];
    }
  },

  async saveRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'archived'>): Promise<Role> {
    try {
      const roles = await this.getAllRoles();
      const now = new Date().toISOString();
      
      const newRole: Role = {
        ...role,
        id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };

      roles.push(newRole);
      await AsyncStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
      
      return newRole;
    } catch (error) {
      console.error('Error saving role:', error);
      throw error;
    }
  },

  async updateRole(id: string, updates: Partial<Omit<Role, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const roles = await this.getAllRoles();
      const index = roles.findIndex(r => r.id === id);
      
      if (index === -1) {
        throw new Error(`Role with id ${id} not found`);
      }

      roles[index] = {
        ...roles[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  async deleteRole(id: string): Promise<void> {
    try {
      const roles = await this.getAllRoles();
      const filtered = roles.filter(r => r.id !== id);
      await AsyncStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  async getRolesByStatus(status: 'open' | 'held' | 'closed'): Promise<Role[]> {
    const roles = await this.getAllRoles();
    return roles.filter(r => r.status === status);
  },

  async getActiveRoles(): Promise<Role[]> {
    const roles = await this.getAllRoles();
    return roles.filter(r => !r.archived);
  },

  async getArchivedRoles(): Promise<Role[]> {
    const roles = await this.getAllRoles();
    return roles.filter(r => r.archived);
  },

  async getRoleById(id: string): Promise<Role | null> {
    const roles = await this.getAllRoles();
    return roles.find(r => r.id === id) || null;
  },

  async closeRole(id: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.updateRole(id, {
        status: 'closed',
        closedAt: now,
      });
    } catch (error) {
      console.error('Error closing role:', error);
      throw error;
    }
  },

  async archiveRole(id: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.updateRole(id, {
        archived: true,
        archivedAt: now,
      });
    } catch (error) {
      console.error('Error archiving role:', error);
      throw error;
    }
  },

  async unarchiveRole(id: string): Promise<void> {
    try {
      await this.updateRole(id, {
        archived: false,
        archivedAt: undefined,
      });
    } catch (error) {
      console.error('Error unarchiving role:', error);
      throw error;
    }
  },

  async permanentlyDeleteRole(id: string): Promise<void> {
    try {
      // This is a hard delete - removes the role completely
      await this.deleteRole(id);
    } catch (error) {
      console.error('Error permanently deleting role:', error);
      throw error;
    }
  },
};
