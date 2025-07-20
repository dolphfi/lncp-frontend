/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES COURS
 * =====================================================
 * Ce store centralise toute la logique de gestion d'état
 * pour les cours avec Zustand (École classique)
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import { 
  Course, 
  CreateCourseDto, 
  UpdateCourseDto, 
  CourseFilters, 
  PaginationOptions,
  CourseStats,
  ApiError 
} from '../types/course';

import { 
  mockCourses, 
  delay, 
  generateCourseId, 
  searchCourses, 
  sortCourses, 
  paginateCourses,
  calculateCourseStats
} from '../data/mockCourses';

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface CourseStore {
  // État
  courses: Course[];
  loading: boolean;
  error: ApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | null;
  
  // Filtres et pagination
  filters: CourseFilters;
  pagination: PaginationOptions;
  sortOptions: {
    field: keyof Course;
    order: 'asc' | 'desc';
  };
  
  // Statistiques
  stats: CourseStats | null;
  
  // Actions principales
  fetchCourses: () => Promise<void>;
  createCourse: (data: CreateCourseDto) => Promise<void>;
  updateCourse: (data: UpdateCourseDto & { id: string }) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  
  // Actions de filtrage et tri
  setFilters: (filters: Partial<CourseFilters>) => void;
  setSortOptions: (sort: { field: keyof Course; order: 'asc' | 'desc' }) => void;
  changePage: (page: number) => void;
  
  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
  fetchStats: () => Promise<void>;
}

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

// Convertir les données du formulaire en objet Course
const convertFormDataToCourse = (data: CreateCourseDto): Course => {
  return {
    id: generateCourseId(),
    code: data.code,
    title: data.title,
    description: data.description,
    category: data.category,
    weight: data.weight,
    grade: data.grade,
    schedule: data.schedule,
    prerequisites: data.prerequisites,
    objectives: data.objectives,
    materials: data.materials,
    syllabus: data.syllabus,
    status: data.status,
    isActive: true, // Par défaut, un nouveau cours est actif
    enrollmentStartDate: new Date(data.enrollmentStartDate).toISOString(),
    enrollmentEndDate: new Date(data.enrollmentEndDate).toISOString(),
    startDate: new Date(data.startDate).toISOString(),
    endDate: new Date(data.endDate).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// =====================================================
// CRÉATION DU STORE ZUSTAND
// =====================================================
export const useCourseStore = create<CourseStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // =====================================================
      // ÉTAT INITIAL
      // =====================================================
      courses: [],
      loading: false,
      error: null,
      loadingAction: null,
      
      // Filtres et pagination
      filters: {
        search: '',
        category: undefined,
        grade: '',
        status: undefined,
        isActive: undefined
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      sortOptions: {
        field: 'code',
        order: 'asc'
      },
      
      // Statistiques
      stats: null,
      
      // =====================================================
      // ACTIONS PRINCIPALES
      // =====================================================
      
      fetchCourses: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1000);
          
          const { filters, sortOptions, pagination } = get();
          
          // Appliquer les filtres
          let filteredCourses = searchCourses(mockCourses, filters.search || '', {
            category: filters.category || undefined,
            grade: filters.grade || undefined,
            status: filters.status || undefined,
            isActive: filters.isActive
          });
          
          // Appliquer le tri
          filteredCourses = sortCourses(filteredCourses, sortOptions.field, sortOptions.order);
          
          // Appliquer la pagination
          const paginatedResult = paginateCourses(filteredCourses, pagination.page, pagination.limit);
          
          set(state => {
            state.courses = paginatedResult.data;
            state.pagination = paginatedResult.pagination;
            state.loading = false;
          });
          
        } catch (error) {
          set(state => {
            state.loading = false;
            state.error = {
              message: 'Erreur lors du chargement des cours',
              code: 'FETCH_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
        }
      },
      
      createCourse: async (data: CreateCourseDto) => {
        set(state => {
          state.loadingAction = 'create';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1500);
          
          // Créer le nouveau cours
          const newCourse = convertFormDataToCourse(data);
          
          // Ajouter à la liste des cours mock
          mockCourses.push(newCourse);
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchCourses();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la création du cours',
              code: 'CREATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      updateCourse: async (data: UpdateCourseDto & { id: string }) => {
        set(state => {
          state.loadingAction = 'update';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1200);
          
          const { id, ...updateData } = data;
          
          // Trouver le cours à mettre à jour
          const courseIndex = mockCourses.findIndex(course => course.id === id);
          
          if (courseIndex === -1) {
            throw new Error('Cours non trouvé');
          }
          
          // Mettre à jour le cours
          const updatedCourse = {
            ...mockCourses[courseIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
          };
          
          mockCourses[courseIndex] = updatedCourse;
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchCourses();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la mise à jour du cours',
              code: 'UPDATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      deleteCourse: async (id: string) => {
        set(state => {
          state.loadingAction = 'delete';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(800);
          
          // Trouver l'index du cours à supprimer
          const courseIndex = mockCourses.findIndex(course => course.id === id);
          
          if (courseIndex === -1) {
            throw new Error('Cours non trouvé');
          }
          
          // Supprimer le cours
          mockCourses.splice(courseIndex, 1);
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchCourses();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la suppression du cours',
              code: 'DELETE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      // =====================================================
      // ACTIONS DE FILTRAGE ET TRI
      // =====================================================
      
      setFilters: (filterUpdates: Partial<CourseFilters>) => {
        set(state => {
          state.filters = { ...state.filters, ...filterUpdates };
          state.pagination.page = 1; // Retour à la première page lors du filtrage
        });
        
        // Recharger les données avec les nouveaux filtres
        get().fetchCourses();
      },
      
      setSortOptions: (sort: { field: keyof Course; order: 'asc' | 'desc' }) => {
        set(state => {
          state.sortOptions = sort;
        });
        
        // Recharger les données avec le nouveau tri
        get().fetchCourses();
      },
      
      changePage: (page: number) => {
        set(state => {
          state.pagination.page = page;
        });
        
        // Recharger les données pour la nouvelle page
        get().fetchCourses();
      },
      
      // =====================================================
      // ACTIONS UTILITAIRES
      // =====================================================
      
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
      
      resetFilters: () => {
        set(state => {
          state.filters = {
            search: '',
            category: undefined,
            grade: '',
            status: undefined,
            isActive: undefined
          };
          state.pagination.page = 1;
        });
        
        // Recharger les données sans filtres
        get().fetchCourses();
      },
      
      fetchStats: async () => {
        try {
          // Simuler un délai d'API
          await delay(800);
          
          // Calculer les statistiques à partir des cours actuels
          const stats = calculateCourseStats(mockCourses);
          
          set(state => {
            state.stats = stats;
          });
          
        } catch (error) {
          set(state => {
            state.error = {
              message: 'Erreur lors du chargement des statistiques',
              code: 'STATS_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
        }
      }
    }))
  )
);

// =====================================================
// HOOKS UTILITAIRES
// =====================================================

export const useCourses = () => {
  return useCourseStore(state => state.courses);
};

export const useCourseLoading = () => {
  return useCourseStore(state => state.loading);
};

export const useCourseError = () => {
  return useCourseStore(state => state.error);
};

export const useCourseStats = () => {
  return useCourseStore(state => state.stats);
};

export const useCourseFilters = () => {
  return useCourseStore(state => state.filters);
};

export const useCoursePagination = () => {
  return useCourseStore(state => state.pagination);
}; 