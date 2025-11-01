/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES CONCOURS/TESTS
 * =====================================================
 * Ce store centralise toute la logique de gestion d'état
 * pour les concours avec Zustand
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import { 
  Test, 
  TestFilters, 
  TestPaginationOptions,
  TestStats,
  TestApiError 
} from '../types/test';

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface TestStore {
  // État
  tests: Test[];
  allTests: Test[]; // Tous les tests pour recherche et stats
  loading: boolean;
  error: TestApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | null;
  
  // Filtres et pagination
  filters: TestFilters;
  pagination: TestPaginationOptions;
  sortOptions: { field: string; order: 'asc' | 'desc' };
  
  // Statistiques
  stats: TestStats | null;
  
  // Actions principales
  fetchTests: () => Promise<void>;
  createTest: (data: any) => Promise<void>;
  updateTest: (data: any & { id: string }) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  
  // Actions de filtrage et tri
  setFilters: (filters: Partial<TestFilters>) => void;
  setSortOptions: (sort: { field: string; order: 'asc' | 'desc' }) => void;
  changePage: (page: number) => void;
  applyFiltersLocally: () => void;
  
  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
  fetchStats: () => Promise<void>;
  
  // Actions pour les endpoints spécifiques
  getTestById: (id: string) => Promise<Test | null>;
  getTestsByGrade: (grade: string) => Promise<Test[]>;
  getTestsByStatus: (status: 'admis' | 'echoue') => Promise<Test[]>;
}

// =====================================================
// UTILITAIRES POUR LA RECHERCHE ET FILTRAGE
// =====================================================

// Fonction pour déterminer le statut basé sur la moyenne
const determineStatus = (moyenne: number, seuilAdmission: number = 10): 'admis' | 'echoue' => {
  return moyenne >= seuilAdmission ? 'admis' : 'echoue';
};

// Fonction pour filtrer les tests
const filterTests = (tests: Test[], filters: TestFilters): Test[] => {
  console.log('Filtrage des tests:', { totalTests: tests.length, filters });
  
  return tests.filter(test => {
    // Recherche par nom du postulant
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = test.postulant.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }
    
    // Filtre par statut
    if (filters.status && test.status !== filters.status) {
      return false;
    }
    
    // Filtre par classe visée
    if (filters.grade && test.grade !== filters.grade) {
      return false;
    }
    
    // Filtre par type de concours
    if (filters.testType && test.testType !== filters.testType) {
      return false;
    }
    
    // Filtre par année du test
    if (filters.testYear) {
      const testYear = new Date(test.testDate).getFullYear();
      if (testYear !== filters.testYear) return false;
    }
    
    // Filtre par moyenne minimale
    if (filters.minMoyenne !== undefined && test.moyenne < filters.minMoyenne) {
      return false;
    }
    
    // Filtre par moyenne maximale
    if (filters.maxMoyenne !== undefined && test.moyenne > filters.maxMoyenne) {
      return false;
    }
    
    return true;
  });
};

// Fonction pour trier les tests
const sortTests = (tests: Test[], sortOptions: { field: string; order: 'asc' | 'desc' }): Test[] => {
  return [...tests].sort((a, b) => {
    const aValue = (a as any)[sortOptions.field];
    const bValue = (b as any)[sortOptions.field];
    
    if (aValue < bValue) return sortOptions.order === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOptions.order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Fonction pour paginer les tests
const paginateTests = (tests: Test[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return tests.slice(startIndex, endIndex);
};

// Fonction pour calculer les statistiques
const calculateStats = (tests: Test[]): TestStats => {
  const total = tests.length;
  const admis = tests.filter(t => t.status === 'admis').length;
  const echoue = tests.filter(t => t.status === 'echoue').length;
  
  const moyenneGenerale = total > 0 
    ? Math.round((tests.reduce((sum, t) => sum + t.moyenne, 0) / total) * 100) / 100
    : 0;
  
  const tauxReussite = total > 0 ? Math.round((admis / total) * 100 * 100) / 100 : 0;
  
  const byGrade: Record<string, number> = {};
  tests.forEach(t => {
    if (t.grade) {
      byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
    }
  });
  
  const byTestType: Record<string, number> = {};
  tests.forEach(t => {
    if (t.testType) {
      byTestType[t.testType] = (byTestType[t.testType] || 0) + 1;
    }
  });
  
  return {
    total,
    admis,
    echoue,
    moyenneGenerale,
    tauxReussite,
    byGrade,
    byTestType
  };
};

// =====================================================
// CRÉATION DU STORE
// =====================================================
export const useTestStore = create<TestStore>()((
  subscribeWithSelector(
    immer((set, get) => ({
      // État initial
      tests: [],
      allTests: [],
      loading: false,
      error: null,
      loadingAction: null,
      
      // Filtres et pagination
      filters: {
        search: '',
        status: undefined,
        grade: undefined,
        testType: undefined,
        testYear: undefined,
        minMoyenne: undefined,
        maxMoyenne: undefined
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      sortOptions: {
        field: 'testDate',
        order: 'desc'
      },
      
      // Statistiques
      stats: null,
      
      // =====================================================
      // ACTIONS PRINCIPALES
      // =====================================================
      
      fetchTests: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Remplacer par un appel API réel
          // Pour l'instant, utiliser des données mock
          const mockTests: Test[] = [
            {
              id: '1',
              postulant: 'Jean Dupont',
              moyenne: 13.67,
              status: 'admis',
              testDate: '2024-10-15T00:00:00Z',
              testType: 'Concours d\'entrée',
              grade: 'NSI',
              remarks: 'Bon niveau général',
              notes: [
                { matiere: 'Mathématiques', note: 15 },
                { matiere: 'Français', note: 12 },
                { matiere: 'Sciences', note: 14 }
              ],
              createdAt: '2024-10-15T10:00:00Z',
              updatedAt: '2024-10-15T10:00:00Z'
            },
            {
              id: '2',
              postulant: 'Marie Martin',
              moyenne: 8.0,
              status: 'echoue',
              testDate: '2024-10-15T00:00:00Z',
              testType: 'Concours d\'entrée',
              grade: 'NSI',
              remarks: 'Niveau insuffisant',
              notes: [
                { matiere: 'Mathématiques', note: 8 },
                { matiere: 'Français', note: 9 },
                { matiere: 'Sciences', note: 7 }
              ],
              createdAt: '2024-10-15T10:00:00Z',
              updatedAt: '2024-10-15T10:00:00Z'
            },
            {
              id: '3',
              postulant: 'Pierre Durand',
              moyenne: 16.33,
              status: 'admis',
              testDate: '2024-10-20T00:00:00Z',
              testType: 'Concours d\'entrée',
              grade: 'NSII',
              remarks: 'Excellent candidat',
              notes: [
                { matiere: 'Mathématiques', note: 16 },
                { matiere: 'Français', note: 18 },
                { matiere: 'Sciences', note: 15 }
              ],
              createdAt: '2024-10-20T10:00:00Z',
              updatedAt: '2024-10-20T10:00:00Z'
            }
          ];
          
          set({ 
            allTests: mockTests,
            loading: false 
          });
          
          // Appliquer les filtres localement
          get().applyFiltersLocally();
          
          // Calculer les statistiques
          await get().fetchStats();
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors du chargement des tests',
              code: error.code || 'FETCH_ERROR'
            },
            loading: false 
          });
        }
      },
      
      createTest: async (data: any) => {
        set({ loadingAction: 'create', error: null });
        try {
          // Déterminer le statut basé sur la moyenne
          const status = determineStatus(data.moyenne);
          
          const newTest: Test = {
            ...data,
            id: `test_${Date.now()}`,
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          console.log('Création de test:', newTest);
          
          // TODO: Remplacer par un appel API réel
          // Pour l'instant, ajouter localement
          set((state) => {
            state.allTests.push(newTest);
          });
          
          // Recharger les tests
          await get().fetchTests();
          
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors de la création du test',
              code: error.code || 'CREATE_ERROR'
            },
            loadingAction: null 
          });
          throw error;
        }
      },
      
      updateTest: async (data: any & { id: string }) => {
        set({ loadingAction: 'update', error: null });
        try {
          // Recalculer le statut si la moyenne a changé
          let updatedData = { ...data };
          if (data.moyenne !== undefined) {
            updatedData.status = determineStatus(data.moyenne);
          }
          updatedData.updatedAt = new Date().toISOString();
          
          console.log('Mise à jour de test:', updatedData);
          
          // TODO: Remplacer par un appel API réel
          
          // Recharger les tests
          await get().fetchTests();
          
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors de la mise à jour du test',
              code: error.code || 'UPDATE_ERROR'
            },
            loadingAction: null 
          });
          throw error;
        }
      },
      
      deleteTest: async (id: string) => {
        set({ loadingAction: 'delete', error: null });
        try {
          console.log('Suppression de test:', id);
          
          // TODO: Remplacer par un appel API réel
          
          // Recharger les tests
          await get().fetchTests();
          
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors de la suppression du test',
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
      
      setFilters: (newFilters: Partial<TestFilters>) => {
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
        const { allTests, filters, sortOptions, pagination } = get();
        
        // Filtrer
        let filtered = filterTests(allTests, filters);
        
        // Trier
        filtered = sortTests(filtered, sortOptions);
        
        // Calculer la pagination
        const total = filtered.length;
        const totalPages = Math.ceil(total / pagination.limit);
        
        // Paginer
        const paginated = paginateTests(filtered, pagination.page, pagination.limit);
        
        set({
          tests: paginated,
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
            status: undefined,
            grade: undefined,
            testType: undefined,
            testYear: undefined,
            minMoyenne: undefined,
            maxMoyenne: undefined
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
          const { allTests } = get();
          const stats = calculateStats(allTests);
          set({ stats });
        } catch (error: any) {
          console.error('Erreur lors du calcul des statistiques:', error);
        }
      },
      
      // =====================================================
      // ACTIONS POUR LES ENDPOINTS SPÉCIFIQUES
      // =====================================================
      
      getTestById: async (id: string) => {
        try {
          const { allTests } = get();
          return allTests.find(t => t.id === id) || null;
        } catch (error: any) {
          console.error('Erreur lors de la récupération du test:', error);
          return null;
        }
      },
      
      getTestsByGrade: async (grade: string) => {
        try {
          const { allTests } = get();
          return allTests.filter(t => t.grade === grade);
        } catch (error: any) {
          console.error('Erreur lors de la récupération des tests par classe:', error);
          return [];
        }
      },
      
      getTestsByStatus: async (status: 'admis' | 'echoue') => {
        try {
          const { allTests } = get();
          return allTests.filter(t => t.status === status);
        } catch (error: any) {
          console.error('Erreur lors de la récupération des tests par statut:', error);
          return [];
        }
      }
    }))
  )
));