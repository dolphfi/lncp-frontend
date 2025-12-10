/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES BADGES
 * =====================================================
 * Ce store centralise toute la logique de gestion d'état
 * pour les badges étudiants avec Zustand
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import { ApiError } from '../types/student';
import { badgeService } from './services/badges/badgeService';

// =====================================================
// TYPES POUR LES BADGES
// =====================================================
export interface Badge {
  id: string;
  studentId?: string; // Optionnel car peut être assigné à un employé
  employeeId?: string;
  studentName: string; // Nom complet (étudiant ou employé)
  studentMatricule: string; // Matricule ou code employé
  studentPhoto?: string;
  classroomId: string;
  classroomName: string;
  roomId?: string;
  roomName?: string;
  badgeNumber: string; // Correspond souvent au NFC ID ou un code visuel
  nfcId: string; // Ajout du champ NFC ID
  status: 'active' | 'inactive' | 'lost' | 'damaged';
  issueDate: string;
  expiryDate?: string;
  lastUsed?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Fonction de conversion API -> Store
const convertApiBadgeToStore = (apiBadge: any): Badge => {
  // Adaptation selon la réponse réelle de l'API.
  // Structure: { id, nfcId, status, student: { id, matricule, user: { firstName, lastName, avatarUrl } }, employee: {...} }

  // Normaliser le statut (API renvoie "Actif" en français, on veut "active" en anglais)
  const statusMap: Record<string, 'active' | 'inactive' | 'lost' | 'damaged'> = {
    'Actif': 'active',
    'Inactif': 'inactive',
    'Perdu': 'lost',
    'Endommagé': 'damaged',
    'active': 'active',
    'inactive': 'inactive',
    'lost': 'lost',
    'damaged': 'damaged'
  };

  // Extraire les informations de l'étudiant ou de l'employé
  const student = apiBadge.student;
  const employee = apiBadge.employee;
  const user = student?.user || employee?.user;

  // Construire le nom complet
  let fullName = 'Non assigné';
  if (user?.firstName && user?.lastName) {
    fullName = `${user.firstName} ${user.lastName}`;
  } else if (apiBadge.studentName) {
    fullName = apiBadge.studentName;
  } else if (apiBadge.assignee?.firstName && apiBadge.assignee?.lastName) {
    fullName = `${apiBadge.assignee.firstName} ${apiBadge.assignee.lastName}`;
  }

  // Matricule
  const matricule = student?.matricule || student?.studentId || employee?.employeeId || apiBadge.studentMatricule || '';

  // Photo
  const photo = user?.avatarUrl || apiBadge.studentPhoto || apiBadge.assignee?.avatarUrl;

  return {
    id: apiBadge.id,
    nfcId: apiBadge.nfcId || apiBadge.badgeNumber || '',
    badgeNumber: apiBadge.badgeNumber || apiBadge.nfcId || '',
    status: statusMap[apiBadge.status] || 'inactive',

    // Infos assignataire
    studentId: student?.id || apiBadge.studentId,
    employeeId: employee?.id || apiBadge.employeeId,
    studentName: fullName,
    studentMatricule: matricule,
    studentPhoto: photo,

    classroomId: apiBadge.classroomId || student?.classroomId || '',
    classroomName: apiBadge.classroomName || student?.classroomName || student?.niveauEtude || (employee ? 'Employé' : '-'),

    issueDate: apiBadge.issuedAt || apiBadge.issueDate || apiBadge.createdAt || new Date().toISOString(),
    expiryDate: apiBadge.expiryDate,
    lastUsed: apiBadge.lastUsed,
    notes: apiBadge.notes,
    createdAt: apiBadge.createdAt || new Date().toISOString(),
    updatedAt: apiBadge.updatedAt || new Date().toISOString(),
  };
};

export interface BadgeFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'lost' | 'damaged';
  classroomId?: string;
  roomId?: string;
}

export interface BadgeStats {
  total: number;
  active: number;
  inactive: number;
  lost: number;
  damaged: number;
  byClassroom: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface BadgeStore {
  // État
  badges: Badge[];
  allBadges: Badge[];
  loading: boolean;
  error: ApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | 'print' | null;

  // Filtres et pagination
  filters: BadgeFilters;
  pagination: PaginationOptions;
  sortOptions: { field: string; order: 'asc' | 'desc' };

  // Statistiques
  stats: BadgeStats | null;

  // Actions principales
  fetchBadges: () => Promise<void>;
  createBadge: (data: Partial<Badge>) => Promise<void>;
  updateBadge: (data: Partial<Badge> & { id: string }) => Promise<void>;
  deleteBadge: (id: string) => Promise<void>;
  printBadge: (id: string) => Promise<void>;
  reportLost: (id: string) => Promise<void>;
  reportDamaged: (id: string) => Promise<void>;
  reactivateBadge: (id: string) => Promise<void>;

  // Actions de filtrage et tri
  setFilters: (filters: Partial<BadgeFilters>) => void;
  setSortOptions: (sort: { field: string; order: 'asc' | 'desc' }) => void;
  changePage: (page: number) => void;
  applyFiltersLocally: () => void;

  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
  fetchStats: () => Promise<void>;

  // Actions spécifiques
  getBadgeByNumber: (badgeNumber: string) => Promise<Badge | null>;
  getBadgesByStudent: (studentId: string) => Promise<Badge[]>;
  getBadgesByClassroom: (classroomId: string) => Promise<Badge[]>;
}

// =====================================================
// UTILITAIRES
// =====================================================

const filterBadges = (badges: Badge[], filters: BadgeFilters): Badge[] => {
  return badges.filter(badge => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        badge.studentName.toLowerCase().includes(searchTerm) ||
        badge.studentMatricule.toLowerCase().includes(searchTerm) ||
        badge.badgeNumber.toLowerCase().includes(searchTerm) ||
        badge.classroomName.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    if (filters.status && badge.status !== filters.status) return false;
    if (filters.classroomId && badge.classroomId !== filters.classroomId) return false;
    if (filters.roomId && badge.roomId !== filters.roomId) return false;

    return true;
  });
};

const sortBadges = (badges: Badge[], sortOptions: { field: string; order: 'asc' | 'desc' }): Badge[] => {
  return [...badges].sort((a, b) => {
    const aValue = (a as any)[sortOptions.field];
    const bValue = (b as any)[sortOptions.field];

    if (aValue < bValue) return sortOptions.order === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOptions.order === 'asc' ? 1 : -1;
    return 0;
  });
};

const paginateBadges = (badges: Badge[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return badges.slice(startIndex, endIndex);
};

const calculateStats = (badges: Badge[]): BadgeStats => {
  const total = badges.length;
  const active = badges.filter(b => b.status === 'active').length;
  const inactive = badges.filter(b => b.status === 'inactive').length;
  const lost = badges.filter(b => b.status === 'lost').length;
  const damaged = badges.filter(b => b.status === 'damaged').length;

  const byClassroom: Record<string, number> = {};
  badges.forEach(b => {
    byClassroom[b.classroomName] = (byClassroom[b.classroomName] || 0) + 1;
  });

  const byStatus: Record<string, number> = {
    active,
    inactive,
    lost,
    damaged
  };

  return {
    total,
    active,
    inactive,
    lost,
    damaged,
    byClassroom,
    byStatus
  };
};

// =====================================================
// CRÉATION DU STORE
// =====================================================
export const useBadgeStore = create<BadgeStore>()((
  subscribeWithSelector(
    immer((set, get) => ({
      // État initial
      badges: [],
      allBadges: [],
      loading: false,
      error: null,
      loadingAction: null,

      filters: {
        search: '',
        status: undefined,
        classroomId: undefined,
        roomId: undefined
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      sortOptions: {
        field: 'badgeNumber',
        order: 'asc'
      },

      stats: null,

      // Actions principales
      fetchBadges: async () => {
        set({ loading: true, error: null });
        try {
          const response = await badgeService.getAllBadges();
          // Conversion des données
          const badges = (Array.isArray(response) ? response : []).map(convertApiBadgeToStore);

          set({
            allBadges: badges,
            loading: false
          });

          get().applyFiltersLocally();
          await get().fetchStats();
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors du chargement des badges',
              code: error.code || 'FETCH_ERROR'
            },
            loading: false
          });
        }
      },

      createBadge: async (data: Partial<Badge>) => {
        set({ loadingAction: 'create', error: null });
        try {
          // Si on a nfcId et un studentId/employeeId, c'est une assignation
          if (data.nfcId) {
            if (data.studentId || data.employeeId) {
              await badgeService.assignBadge({
                nfcId: data.nfcId,
                studentId: data.studentId,
                employeeId: data.employeeId
              });
            } else {
              // Sinon c'est juste une création de badge (nouveau stock)
              await badgeService.createBadge(data.nfcId);
            }
          } else {
            throw new Error("NFC ID requis pour créer un badge");
          }

          await get().fetchBadges();
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors de la création',
              code: error.code || 'CREATE_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      updateBadge: async (data: Partial<Badge> & { id: string }) => {
        set({ loadingAction: 'update', error: null });
        try {
          // Mise à jour générique (ex: nfcId ou statut si supporté par patch)
          if (data.nfcId) {
            await badgeService.updateBadge(data.id, { nfcId: data.nfcId });
          }
          // Si d'autres champs, on peut devoir faire d'autres appels ou adapter le service

          await get().fetchBadges();
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors de la mise à jour',
              code: error.code || 'UPDATE_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      deleteBadge: async (id: string) => {
        set({ loadingAction: 'delete', error: null });
        try {
          await badgeService.deleteBadge(id);
          await get().fetchBadges();
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors de la suppression',
              code: error.code || 'DELETE_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      printBadge: async (id: string) => {
        set({ loadingAction: 'print', error: null });
        try {
          // Simulation d'impression (pas d'endpoint backend fourni)
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors de l\'impression',
              code: error.code || 'PRINT_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      reportLost: async (id: string) => {
        set({ loadingAction: 'update', error: null });
        try {
          await badgeService.updateStatus(id, 'lost');
          await get().fetchBadges();
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors de la déclaration',
              code: error.code || 'REPORT_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      reportDamaged: async (id: string) => {
        set({ loadingAction: 'update', error: null });
        try {
          await badgeService.updateStatus(id, 'damaged');
          await get().fetchBadges();
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors de la déclaration',
              code: error.code || 'REPORT_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      reactivateBadge: async (id: string) => {
        set({ loadingAction: 'update', error: null });
        try {
          await badgeService.updateStatus(id, 'active');
          await get().fetchBadges();
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors de la réactivation',
              code: error.code || 'REACTIVATE_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      // Actions de filtrage et tri
      setFilters: (newFilters: Partial<BadgeFilters>) => {
        set((state) => {
          state.filters = { ...state.filters, ...newFilters };
        });
        get().applyFiltersLocally();
      },

      setSortOptions: (sort: { field: string; order: 'asc' | 'desc' }) => {
        set({ sortOptions: sort });
        get().applyFiltersLocally();
      },

      changePage: (page: number) => {
        set((state) => {
          state.pagination.page = page;
        });
        get().applyFiltersLocally();
      },

      applyFiltersLocally: () => {
        const { allBadges, filters, sortOptions, pagination } = get();

        let filtered = filterBadges(allBadges, filters);
        filtered = sortBadges(filtered, sortOptions);

        const total = filtered.length;
        const totalPages = Math.ceil(total / pagination.limit);
        const paginated = paginateBadges(filtered, pagination.page, pagination.limit);

        set({
          badges: paginated,
          pagination: {
            ...pagination,
            total,
            totalPages
          }
        });
      },

      // Actions utilitaires
      clearError: () => {
        set({ error: null });
      },

      resetFilters: () => {
        set({
          filters: {
            search: '',
            status: undefined,
            classroomId: undefined,
            roomId: undefined
          },
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        });
        get().applyFiltersLocally();
      },

      fetchStats: async () => {
        try {
          const { allBadges } = get();
          const stats = calculateStats(allBadges);
          set({ stats });
        } catch (error: any) {
          console.error('Erreur lors du calcul des statistiques:', error);
        }
      },

      // Actions spécifiques
      getBadgeByNumber: async (badgeNumber: string) => {
        try {
          const { allBadges } = get();
          return allBadges.find(b => b.badgeNumber === badgeNumber) || null;
        } catch (error: any) {
          console.error('Erreur:', error);
          return null;
        }
      },

      getBadgesByStudent: async (studentId: string) => {
        try {
          const { allBadges } = get();
          return allBadges.filter(b => b.studentId === studentId);
        } catch (error: any) {
          console.error('Erreur:', error);
          return [];
        }
      },

      getBadgesByClassroom: async (classroomId: string) => {
        try {
          const { allBadges } = get();
          return allBadges.filter(b => b.classroomId === classroomId);
        } catch (error: any) {
          console.error('Erreur:', error);
          return [];
        }
      }
    }))
  )
));
