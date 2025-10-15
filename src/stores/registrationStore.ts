/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES INSCRIPTIONS
 * =====================================================
 * Ce store centralise toute la logique de gestion d'état
 * pour les inscriptions avec Zustand
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import { 
  Student, 
  StudentFilters, 
  PaginationOptions,
  StudentStats,
  ApiError 
} from '../types/student';

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface RegistrationStore {
  // État
  registrations: Student[];
  allRegistrations: Student[]; // Toutes les inscriptions pour recherche et stats
  loading: boolean;
  error: ApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | null;
  
  // Filtres et pagination
  filters: StudentFilters;
  pagination: PaginationOptions;
  sortOptions: { field: string; order: 'asc' | 'desc' };
  
  // Statistiques
  stats: StudentStats | null;
  
  // Actions principales
  fetchRegistrations: () => Promise<void>;
  createRegistration: (data: any) => Promise<void>;
  updateRegistration: (data: any & { id: string }) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
  
  // Actions de filtrage et tri
  setFilters: (filters: Partial<StudentFilters>) => void;
  setSortOptions: (sort: { field: string; order: 'asc' | 'desc' }) => void;
  changePage: (page: number) => void;
  applyFiltersLocally: () => void;
  
  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
  fetchStats: () => Promise<void>;
  
  // Actions pour les endpoints spécifiques
  getRegistrationById: (id: string) => Promise<Student | null>;
  getRegistrationsByClassroom: (classroomId: string) => Promise<Student[]>;
  getRegistrationsByRoom: (roomId: string) => Promise<Student[]>;
}

// =====================================================
// UTILITAIRES POUR LA RECHERCHE ET FILTRAGE
// =====================================================

// Fonction pour filtrer les inscriptions
const filterRegistrations = (registrations: Student[], filters: StudentFilters): Student[] => {
  console.log('Filtrage des inscriptions:', { totalRegistrations: registrations.length, filters });
  
  return registrations.filter(registration => {
    // Recherche par nom, prénom, email, matricule
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        registration.firstName.toLowerCase().includes(searchTerm) ||
        registration.lastName.toLowerCase().includes(searchTerm) ||
        (registration.email?.toLowerCase().includes(searchTerm) || false) ||
        registration.studentId.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }
    
    // Filtre par classe/grade
    if (filters.grade && registration.grade !== filters.grade) {
      return false;
    }
    
    // Filtre par salle
    if (filters.roomId && registration.roomId !== filters.roomId) {
      return false;
    }
    
    // Filtre par statut
    if (filters.status && registration.status !== filters.status) {
      return false;
    }
    
    // Filtre par genre
    if (filters.gender) {
      let expectedGender: string;
      if (filters.gender === 'Homme') {
        expectedGender = 'male';
      } else if (filters.gender === 'Femme') {
        expectedGender = 'female';
      } else {
        expectedGender = filters.gender;
      }
      
      if (registration.gender !== expectedGender) {
        return false;
      }
    }
    
    // Filtre par année d'inscription
    if (filters.enrollmentYear) {
      const enrollmentYear = new Date(registration.enrollmentDate).getFullYear();
      if (enrollmentYear !== filters.enrollmentYear) return false;
    }
    
    return true;
  });
};

// Fonction pour trier les inscriptions
const sortRegistrations = (registrations: Student[], sortOptions: { field: string; order: 'asc' | 'desc' }): Student[] => {
  return [...registrations].sort((a, b) => {
    const aValue = (a as any)[sortOptions.field];
    const bValue = (b as any)[sortOptions.field];
    
    if (aValue < bValue) return sortOptions.order === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOptions.order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Fonction pour paginer les inscriptions
const paginateRegistrations = (registrations: Student[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return registrations.slice(startIndex, endIndex);
};

// Fonction pour calculer les statistiques
const calculateStats = (registrations: Student[]): StudentStats => {
  const total = registrations.length;
  const active = registrations.filter(r => r.status === 'active').length;
  const inactive = registrations.filter(r => r.status === 'inactive').length;
  const suspended = registrations.filter(r => r.status === 'suspended').length;
  
  const byGrade: Record<string, number> = {};
  registrations.forEach(r => {
    byGrade[r.grade] = (byGrade[r.grade] || 0) + 1;
  });
  
  const byGender = {
    male: registrations.filter(r => r.gender === 'male').length,
    female: registrations.filter(r => r.gender === 'female').length
  };
  
  return {
    total,
    active,
    inactive,
    suspended,
    byGrade,
    byGender,
    totalClasses: Object.keys(byGrade).length // Nombre de classes différentes
  };
};

// =====================================================
// CRÉATION DU STORE
// =====================================================
export const useRegistrationStore = create<RegistrationStore>()((
  subscribeWithSelector(
    immer((set, get) => ({
      // État initial
      registrations: [],
      allRegistrations: [],
      loading: false,
      error: null,
      loadingAction: null,
      
      // Filtres et pagination
      filters: {
        search: '',
        gender: undefined,
        status: undefined,
        roomId: undefined,
        grade: undefined,
        enrollmentYear: undefined
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      sortOptions: {
        field: 'firstName',
        order: 'asc'
      },
      
      // Statistiques
      stats: null,
      
      // =====================================================
      // ACTIONS PRINCIPALES
      // =====================================================
      
      fetchRegistrations: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Remplacer par un appel API réel
          // Pour l'instant, utiliser des données mock
          const mockRegistrations: Student[] = [];
          
          set({ 
            allRegistrations: mockRegistrations,
            loading: false 
          });
          
          // Appliquer les filtres localement
          get().applyFiltersLocally();
          
          // Calculer les statistiques
          await get().fetchStats();
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors du chargement des inscriptions',
              code: error.code || 'FETCH_ERROR'
            },
            loading: false 
          });
        }
      },
      
      createRegistration: async (data: any) => {
        set({ loadingAction: 'create', error: null });
        try {
          // TODO: Remplacer par un appel API réel
          console.log('Création d\'inscription:', data);
          
          // Recharger les inscriptions
          await get().fetchRegistrations();
          
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors de la création de l\'inscription',
              code: error.code || 'CREATE_ERROR'
            },
            loadingAction: null 
          });
          throw error;
        }
      },
      
      updateRegistration: async (data: any & { id: string }) => {
        set({ loadingAction: 'update', error: null });
        try {
          // TODO: Remplacer par un appel API réel
          console.log('Mise à jour d\'inscription:', data);
          
          // Recharger les inscriptions
          await get().fetchRegistrations();
          
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors de la mise à jour de l\'inscription',
              code: error.code || 'UPDATE_ERROR'
            },
            loadingAction: null 
          });
          throw error;
        }
      },
      
      deleteRegistration: async (id: string) => {
        set({ loadingAction: 'delete', error: null });
        try {
          // TODO: Remplacer par un appel API réel
          console.log('Suppression d\'inscription:', id);
          
          // Recharger les inscriptions
          await get().fetchRegistrations();
          
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors de la suppression de l\'inscription',
              code: error.code || 'DELETE_ERROR'
            },
            loadingAction: null 
          });
          throw error;
        }
      },
      
      // =====================================================
      // ACTIONS DE FILTRAGE ET TRI
      // =====================================================
      
      setFilters: (newFilters: Partial<StudentFilters>) => {
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
        const { allRegistrations, filters, sortOptions, pagination } = get();
        
        // Filtrer
        let filtered = filterRegistrations(allRegistrations, filters);
        
        // Trier
        filtered = sortRegistrations(filtered, sortOptions);
        
        // Calculer la pagination
        const total = filtered.length;
        const totalPages = Math.ceil(total / pagination.limit);
        
        // Paginer
        const paginated = paginateRegistrations(filtered, pagination.page, pagination.limit);
        
        set({
          registrations: paginated,
          pagination: {
            ...pagination,
            total,
            totalPages
          }
        });
      },
      
      // =====================================================
      // ACTIONS UTILITAIRES
      // =====================================================
      
      clearError: () => {
        set({ error: null });
      },
      
      resetFilters: () => {
        set({
          filters: {
            search: '',
            gender: undefined,
            status: undefined,
            roomId: undefined,
            grade: undefined,
            enrollmentYear: undefined
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
          const { allRegistrations } = get();
          const stats = calculateStats(allRegistrations);
          set({ stats });
        } catch (error: any) {
          console.error('Erreur lors du calcul des statistiques:', error);
        }
      },
      
      // =====================================================
      // ACTIONS POUR LES ENDPOINTS SPÉCIFIQUES
      // =====================================================
      
      getRegistrationById: async (id: string) => {
        try {
          // TODO: Remplacer par un appel API réel
          const { allRegistrations } = get();
          return allRegistrations.find(r => r.id === id) || null;
        } catch (error: any) {
          console.error('Erreur lors de la récupération de l\'inscription:', error);
          return null;
        }
      },
      
      getRegistrationsByClassroom: async (classroomId: string) => {
        try {
          // TODO: Remplacer par un appel API réel
          const { allRegistrations } = get();
          return allRegistrations.filter(r => r.grade === classroomId);
        } catch (error: any) {
          console.error('Erreur lors de la récupération des inscriptions par classe:', error);
          return [];
        }
      },
      
      getRegistrationsByRoom: async (roomId: string) => {
        try {
          // TODO: Remplacer par un appel API réel
          const { allRegistrations } = get();
          return allRegistrations.filter(r => r.roomId === roomId);
        } catch (error: any) {
          console.error('Erreur lors de la récupération des inscriptions par salle:', error);
          return [];
        }
      }
    }))
  )
));
