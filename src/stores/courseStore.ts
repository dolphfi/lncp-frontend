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
  CourseFilters, 
  CourseStats, 
  AddCourseApiPayload, 
  CreateCourseDto, 
  UpdateCourseDto, 
  CourseSortOptions,
  CourseCategory,
  ApiError,
  PaginationOptions
} from '../types/course';

import { courseService } from '../services/courses/courseService';

// =====================================================
// FONCTIONS UTILITAIRES TEMPORAIRES
// =====================================================
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface CourseStore {
  // État
  courses: Course[];
  allCourses: Course[]; // Toutes les données pour le filtrage local
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
  createCourse: (courseData: AddCourseApiPayload) => Promise<void>;
  updateCourse: (courseData: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  
  // Actions pour la disponibilité
  setAvailability: (availabilityData: {
    courseId: string;
    roomId: string;
    trimestre: string;
    statut: string;
  }) => Promise<void>;
  
  // Actions pour les filtres et tri
  setFilters: (filters: Partial<CourseFilters>) => void;
  setSortOptions: (sortOptions: CourseSortOptions) => void;
  changePage: (page: number) => void;
  applyFiltersLocally: () => void;
  
  // Méthodes utilitaires
  filterCourses: (courses: Course[], filters: CourseFilters) => Course[];
  sortCourses: (courses: Course[], sortOptions: { field: keyof Course; order: 'asc' | 'desc' }) => Course[];
  paginateCourses: (courses: Course[], page: number, limit: number) => Course[];
  calculateStats: (courses: Course[]) => void;
  
  // Actions pour les statistiques
  fetchStats: () => Promise<void>;
  resetFilters: () => void;
}

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

// Convertir les données API backend vers le format frontend
const convertApiCourseToCourse = (apiCourse: any): Course => {
  return {
    id: apiCourse.id,
    code: apiCourse.code,
    titre: apiCourse.titre,
    description: apiCourse.description,
    categorie: apiCourse.categorie,
    ponderation: apiCourse.ponderation,
    statut: apiCourse.statut,
    classroomId: apiCourse.classroomId || apiCourse.classroom?.id,
    classroom: apiCourse.classroom,
    isActive: apiCourse.statut === 'Actif' || (apiCourse.isActive ?? true),
    createdAt: apiCourse.createdAt,
    updatedAt: apiCourse.updatedAt
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
      allCourses: [], // Toutes les données pour le filtrage local
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
        field: 'titre',
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
          const { pagination } = get();
          
          // Appel API réel - charger tous les cours par pages (limite backend: 100)
          let allCourses: any[] = [];
          let currentPage = 1;
          const pageSize = 100; // Limite backend
          
          // Charger toutes les pages
          while (true) {
            const response = await courseService.getAllCourses(currentPage, pageSize);
            allCourses = [...allCourses, ...response.data];
            
            // Si on a moins d'éléments que la limite, c'est la dernière page
            if (response.data.length < pageSize) {
              break;
            }
            
            currentPage++;
            
            // Sécurité: éviter une boucle infinie
            if (currentPage > 50) { // Max 5000 cours
              console.warn('Limite de sécurité atteinte lors du chargement des cours');
              break;
            }
          }
          
          console.log(`📚 Chargé ${allCourses.length} cours en ${currentPage} page(s)`);
          
          // Convertir les données API vers le format frontend
          const convertedCourses = allCourses.map(convertApiCourseToCourse);
          
          set(state => {
            state.allCourses = convertedCourses; // Stocker toutes les données
            state.loading = false;
          });
          
          // Appliquer les filtres localement
          get().applyFiltersLocally();
          
        } catch (error) {
          console.error('❌ Erreur chargement cours:', error);
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
      
      createCourse: async (payload: AddCourseApiPayload) => {
        set(state => {
          state.loadingAction = 'create';
          state.error = null;
        });
        
        try {
          console.log('🎓 Création cours via API:', payload);
          
          // Appel API réel
          const newCourse = await courseService.createCourse(payload);
          
          console.log('🎓 Cours créé avec succès:', newCourse);
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchCourses();
          
        } catch (error) {
          console.error('❌ Erreur création cours:', error);
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: error instanceof Error ? error.message : 'Erreur lors de la création du cours',
              code: 'CREATE_ERROR',
              details: []
            };
          });
          throw error;
        }
      },
      
      updateCourse: async (courseData: Partial<Course>) => {
        if (!courseData.id) {
          throw new Error('ID du cours requis pour la mise à jour');
        }
        
        const data = courseData as Course;
        set(state => {
          state.loadingAction = 'update';
          state.error = null;
        });
        
        try {
          const { id, ...updateData } = data;
          
          // Appel API réel
          await courseService.updateCourse(id, updateData as any);
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchCourses();
          
        } catch (error) {
          console.error('❌ Erreur mise à jour cours:', error);
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
          // Appel API réel
          await courseService.deleteCourse(id);
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchCourses();
          
        } catch (error) {
          console.error('❌ Erreur suppression cours:', error);
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
      // ACTIONS DE DISPONIBILITÉ
      // =====================================================
      
      setAvailability: async (availabilityData: {
        courseId: string;
        roomId: string;
        trimestre: string;
        statut: string;
      }) => {
        set(state => {
          state.loadingAction = 'update';
          state.error = null;
        });
        
        try {
          // Appel API réel
          await courseService.setAvailability(availabilityData);
          
          set(state => {
            state.loadingAction = null;
          });
          
          console.log('✅ Disponibilité mise à jour avec succès');
          
        } catch (error) {
          console.error('❌ Erreur mise à jour disponibilité:', error);
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la mise à jour de la disponibilité',
              code: 'AVAILABILITY_ERROR',
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
        
        // Appliquer les filtres localement sans recharger depuis l'API
        get().applyFiltersLocally();
      },
      
      // Nouvelle méthode pour appliquer les filtres localement
      applyFiltersLocally: () => {
        const { allCourses, filters, sortOptions, pagination } = get();
        
        if (!allCourses || allCourses.length === 0) {
          // Si pas de données, charger depuis l'API
          get().fetchCourses();
          return;
        }
        
        // Appliquer les filtres sur les données déjà chargées
        const filteredCourses = get().filterCourses(allCourses, filters);
        const sortedCourses = get().sortCourses(filteredCourses, sortOptions);
        const paginatedCourses = get().paginateCourses(sortedCourses, pagination.page, pagination.limit);
        
        set(state => {
          state.courses = paginatedCourses;
          state.pagination.total = filteredCourses.length;
          state.pagination.totalPages = Math.ceil(filteredCourses.length / pagination.limit);
        });
        
        // Recalculer les statistiques avec les données filtrées
        get().calculateStats(filteredCourses);
      },
      
      // =====================================================
      // MÉTHODES UTILITAIRES DE FILTRAGE
      // =====================================================
      
      filterCourses: (courses: Course[], filters: CourseFilters): Course[] => {
        return courses.filter(course => {
          // Recherche textuelle
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const searchableText = [
              course.titre,
              course.code,
              course.description,
              course.categorie,
              course.classroom?.name
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) {
              return false;
            }
          }
          
          // Filtre par catégorie
          if (filters.category && course.categorie !== filters.category) {
            return false;
          }
          
          // Filtre par statut
          if (filters.status && course.statut !== filters.status) {
            return false;
          }
          
          return true;
        });
      },
      
      sortCourses: (courses: Course[], sortOptions: { field: keyof Course; order: 'asc' | 'desc' }): Course[] => {
        return [...courses].sort((a, b) => {
          const aValue = a[sortOptions.field];
          const bValue = b[sortOptions.field];
          
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;
          
          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          if (aValue > bValue) comparison = 1;
          
          return sortOptions.order === 'desc' ? -comparison : comparison;
        });
      },
      
      paginateCourses: (courses: Course[], page: number, limit: number): Course[] => {
        const startIndex = (page - 1) * limit;
        return courses.slice(startIndex, startIndex + limit);
      },
      
      calculateStats: (courses: Course[]) => {
        // Debug: vérifier les statuts des cours
        console.log('Calcul des stats pour', courses.length, 'cours');
        if (courses.length > 0) {
          console.log('Premier cours:', courses[0]);
          console.log('Statuts uniques:', [...new Set(courses.map(c => c.statut))]);
        }
        
        const stats: CourseStats = {
          total: courses.length,
          // Considérer les cours comme actifs par défaut s'ils n'ont pas de statut
          active: courses.filter(c => 
            !c.statut || 
            c.statut === 'actif' || 
            c.statut === 'active' || 
            c.statut === 'Actif' ||
            c.isActive === true
          ).length,
          inactive: courses.filter(c => 
            c.statut === 'inactif' || 
            c.statut === 'inactive' || 
            c.statut === 'Inactif' ||
            c.isActive === false
          ).length,
          pending: courses.filter(c => 
            c.statut === 'en_attente' || 
            c.statut === 'pending' || 
            c.statut === 'En_attente'
          ).length,
          byCategory: courses.reduce((acc, course) => {
            acc[course.categorie] = (acc[course.categorie] || 0) + 1;
            return acc;
          }, {} as Record<CourseCategory, number>),
          byGrade: courses.reduce((acc, course) => {
            const gradeName = course.classroom?.name || 'Non assigné';
            acc[gradeName] = (acc[gradeName] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          averageWeight: courses.length > 0 ? courses.reduce((sum, course) => sum + (course.ponderation || 0), 0) / courses.length : 0,
          totalWeight: courses.reduce((sum, course) => sum + (course.ponderation || 0), 0),
          topCourses: courses
            .sort((a, b) => (b.ponderation || 0) - (a.ponderation || 0))
            .slice(0, 5)
            .map(course => ({
              courseId: course.id,
              courseCode: course.code,
              courseTitle: course.titre,
              weight: course.ponderation || 0
            }))
        };
        
        set(state => {
          state.stats = stats;
        });
      },
      
      setSortOptions: (sort: { field: keyof Course; order: 'asc' | 'desc' }) => {
        set(state => {
          state.sortOptions = sort;
        });
        
        // Appliquer le tri localement
        get().applyFiltersLocally();
      },
      
      changePage: (page: number) => {
        set(state => {
          state.pagination.page = page;
        });
        
        // Appliquer la pagination localement
        get().applyFiltersLocally();
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
          const { courses } = get();
          const total = courses.length;
          const active = courses.filter(c => c.isActive).length;
          
          const stats: CourseStats = {
            total,
            active,
            inactive: total - active,
            pending: 0,
            byCategory: {} as any,
            byGrade: {},
            averageWeight: 0,
            totalWeight: 0,
            topCourses: []
          };
          
          set(state => { state.stats = stats; });
        } catch (error) {
          console.error('Erreur stats:', error);
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