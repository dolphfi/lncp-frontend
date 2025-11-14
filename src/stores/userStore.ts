/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES UTILISATEURS
 * =====================================================
 * Store centralisé pour gérer l'état des utilisateurs
 * système
 */

import { create } from 'zustand';
import {
  User,
  UserRole,
  UserFilters,
  UserStats,
  CreateUserDto,
  UpdateUserDto,
} from '../types/user';
import { userService } from '../services/users/userService';

// =====================================================
// INTERFACE DU STORE
// =====================================================

interface UserState {
  // Données
  allUsers: User[];                      // Tous les utilisateurs chargés
  users: User[];                         // Utilisateurs filtrés pour l'affichage
  currentUser: User | null;              // Utilisateur sélectionné pour visualisation/édition
  
  // États UI
  loading: boolean;                      // Chargement en cours
  error: string | null;                  // Message d'erreur
  
  // Pagination
  page: number;                          // Page actuelle
  limit: number;                         // Nombre d'éléments par page
  total: number;                         // Nombre total d'utilisateurs
  
  // Filtres
  filters: UserFilters;                  // Filtres actifs
  
  // Statistiques
  stats: UserStats;                      // Statistiques calculées
  
  // Actions - Chargement des données
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchUserById: (id: string) => Promise<User | null>;
  
  // Actions - CRUD
  createUser: (data: CreateUserDto) => Promise<User>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  unlockUser: (id: string) => Promise<void>;
  
  // Actions - Filtres et recherche
  setFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;
  applyFiltersLocally: () => void;
  
  // Actions - Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  
  // Actions - Utilitaires
  calculateStats: () => void;
  clearError: () => void;
}

// =====================================================
// CRÉATION DU STORE
// =====================================================

export const useUserStore = create<UserState>((set, get) => ({
  // État initial
  allUsers: [],
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  filters: {},
  stats: {
    total: 0,
    active: 0,
    locked: 0,
    byRole: {
      SUPER_ADMIN: 0,
      ADMIN: 0,
      SECRETARY: 0,
      TEACHER: 0,
      STUDENT: 0,
      PARENT: 0,
      USER: 0,
      CENSORED: 0,
      COMPTABLE: 0,
      SUPPLEANT: 0,
      DIRECTOR: 0,
    },
  },

  // =====================================================
  // ACTIONS - CHARGEMENT DES DONNÉES
  // =====================================================

  /**
   * Charger tous les utilisateurs avec pagination
   */
  fetchUsers: async (page = 1, limit = 100) => {
    set({ loading: true, error: null });
    try {
      const response = await userService.getAllUsers(page, limit);
      const usersData = response.data || [];
      
      set({ 
        allUsers: usersData,
        total: response.total,
        page: response.page,
        limit: response.limit || limit,
        loading: false 
      });
      
      get().calculateStats();
      get().applyFiltersLocally();
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement des utilisateurs', 
        loading: false 
      });
    }
  },

  /**
   * Charger un utilisateur par son ID
   */
  fetchUserById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const user = await userService.getUserById(id);
      set({ currentUser: user, loading: false });
      return user;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement de l\'utilisateur', 
        loading: false 
      });
      return null;
    }
  },

  // =====================================================
  // ACTIONS - CRUD
  // =====================================================

  /**
   * Créer un nouvel utilisateur
   */
  createUser: async (data: CreateUserDto) => {
    set({ loading: true, error: null });
    try {
      const newUser = await userService.createUser(data);
      
      set((state) => ({
        allUsers: [newUser, ...state.allUsers],
        total: state.total + 1,
        loading: false,
      }));
      
      get().calculateStats();
      get().applyFiltersLocally();
      
      return newUser;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la création de l\'utilisateur', 
        loading: false 
      });
      throw error;
    }
  },

  /**
   * Mettre à jour un utilisateur
   */
  updateUser: async (id: string, data: UpdateUserDto) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await userService.updateUser(id, data);
      
      set((state) => ({
        allUsers: state.allUsers.map((u) =>
          u.id === id ? updatedUser : u
        ),
        loading: false,
      }));
      
      get().calculateStats();
      get().applyFiltersLocally();
      
      return updatedUser;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur', 
        loading: false 
      });
      throw error;
    }
  },

  /**
   * Supprimer un utilisateur
   */
  deleteUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await userService.deleteUser(id);
      
      set((state) => ({
        allUsers: state.allUsers.filter((u) => u.id !== id),
        total: state.total - 1,
        loading: false,
      }));
      
      get().calculateStats();
      get().applyFiltersLocally();
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la suppression de l\'utilisateur', 
        loading: false 
      });
      throw error;
    }
  },

  /**
   * Débloquer un utilisateur
   */
  unlockUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await userService.unlockUser(id);
      
      set((state) => ({
        allUsers: state.allUsers.map((u) =>
          u.id === id ? response.user : u
        ),
        loading: false,
      }));
      
      get().calculateStats();
      get().applyFiltersLocally();
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du déblocage de l\'utilisateur', 
        loading: false 
      });
      throw error;
    }
  },

  // =====================================================
  // ACTIONS - FILTRES ET RECHERCHE
  // =====================================================

  /**
   * Définir les filtres
   */
  setFilters: (newFilters: Partial<UserFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFiltersLocally();
  },

  /**
   * Réinitialiser les filtres
   */
  clearFilters: () => {
    set({ filters: {} });
    get().applyFiltersLocally();
  },

  /**
   * Appliquer les filtres localement (côté client)
   */
  applyFiltersLocally: () => {
    const { allUsers, filters } = get();
    let filtered = [...allUsers];

    // Filtrer par rôle
    if (filters.role) {
      filtered = filtered.filter((u) => u.role === filters.role);
    }

    // Filtrer par statut actif
    if (filters.isActive !== undefined) {
      filtered = filtered.filter((u) => u.isActive === filters.isActive);
    }

    // Filtrer par statut verrouillé
    if (filters.isLocked !== undefined) {
      filtered = filtered.filter((u) => u.isLocked === filters.isLocked);
    }

    // Filtrer par recherche (nom, email)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(searchLower) ||
          u.lastName.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }

    set({ users: filtered });
  },

  // =====================================================
  // ACTIONS - PAGINATION
  // =====================================================

  /**
   * Définir la page actuelle
   */
  setPage: (page: number) => {
    set({ page });
  },

  /**
   * Définir le nombre d'éléments par page
   */
  setLimit: (limit: number) => {
    set({ limit, page: 1 });
  },

  // =====================================================
  // ACTIONS - UTILITAIRES
  // =====================================================

  /**
   * Calculer les statistiques
   */
  calculateStats: () => {
    const { allUsers } = get();

    const stats: UserStats = {
      total: allUsers.length,
      active: allUsers.filter((u) => u.isActive).length,
      locked: allUsers.filter((u) => u.isLocked).length,
      byRole: {
        SUPER_ADMIN: allUsers.filter((u) => u.role === 'SUPER_ADMIN').length,
        ADMIN: allUsers.filter((u) => u.role === 'ADMIN').length,
        SECRETARY: allUsers.filter((u) => u.role === 'SECRETARY').length,
        TEACHER: allUsers.filter((u) => u.role === 'TEACHER').length,
        STUDENT: allUsers.filter((u) => u.role === 'STUDENT').length,
        PARENT: allUsers.filter((u) => u.role === 'PARENT').length,
        USER: allUsers.filter((u) => u.role === 'USER').length,
        CENSORED: allUsers.filter((u) => u.role === 'CENSORED').length,
        COMPTABLE: allUsers.filter((u) => u.role === 'COMPTABLE').length,
        SUPPLEANT: allUsers.filter((u) => u.role === 'SUPPLEANT').length,
        DIRECTOR: allUsers.filter((u) => u.role === 'DIRECTOR').length,
      },
    };

    set({ stats });
  },

  /**
   * Effacer l'erreur
   */
  clearError: () => {
    set({ error: null });
  },
}));
