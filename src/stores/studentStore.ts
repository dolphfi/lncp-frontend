/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES ÉLÈVES
 * =====================================================
 * Ce store centralise toute la logique de gestion d'état
 * pour les élèves avec Zustand
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import { 
  Student, 
  CreateStudentDto, 
  UpdateStudentDto, 
  StudentFilters, 
  PaginationOptions,
  StudentStats,
  StudentSortOptions,
  ApiError 
} from '../types/student';

import { 
  mockStudents, 
  mockStats, 
  delay, 
  generateId, 
  searchStudents, 
  sortStudents, 
  paginateStudents 
} from '../data/mockStudents';

import { CreateStudentFormData, UpdateStudentFormData } from '../schemas/studentSchema';

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface StudentStore {
  // État
  students: Student[];
  loading: boolean;
  error: ApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | null;
  
  // Filtres et pagination
  filters: StudentFilters;
  pagination: PaginationOptions;
  sortOptions: StudentSortOptions;
  
  // Statistiques
  stats: StudentStats | null;
  
  // Actions principales
  fetchStudents: () => Promise<void>;
  createStudent: (data: CreateStudentFormData) => Promise<void>;
  updateStudent: (data: UpdateStudentFormData & { id: string }) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Actions de filtrage et tri
  setFilters: (filters: Partial<StudentFilters>) => void;
  setSortOptions: (sort: StudentSortOptions) => void;
  changePage: (page: number) => void;
  
  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
  fetchStats: () => Promise<void>;
}

// =====================================================
// UTILITAIRES POUR LA CONVERSION DES DONNÉES
// =====================================================

// Convertir CreateStudentFormData en Student
const convertFormDataToStudent = (data: CreateStudentFormData): Student => {
  return {
    id: generateId(),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    dateOfBirth: new Date(data.dateOfBirth).toISOString(),
    gender: data.gender,
    address: data.address,
    grade: data.grade,
    enrollmentDate: new Date(data.enrollmentDate).toISOString(),
    studentId: data.studentId,
    parentContact: {
      name: data.parentContact.name,
      phone: data.parentContact.phone,
      email: data.parentContact.email,
      relationship: data.parentContact.relationship
    },
    status: data.status,
    avatar: data.avatar || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// =====================================================
// CRÉATION DU STORE ZUSTAND
// =====================================================
export const useStudentStore = create<StudentStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // =====================================================
      // ÉTAT INITIAL
      // =====================================================
      students: [],
      loading: false,
      error: null,
      loadingAction: null,
      
      // Filtres et pagination
      filters: {
        search: '',
        grade: '',
        status: undefined,
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
      
      fetchStudents: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1000);
          
          const { filters, sortOptions, pagination } = get();
          
          // Appliquer les filtres
          let filteredStudents = searchStudents(mockStudents, filters.search || '', {
            grade: filters.grade || undefined,
            status: filters.status || undefined
          });
          
          // Appliquer le tri
          filteredStudents = sortStudents(filteredStudents, sortOptions.field, sortOptions.order);
          
          // Appliquer la pagination
          const paginatedResult = paginateStudents(filteredStudents, pagination.page, pagination.limit);
          
          set(state => {
            state.students = paginatedResult.data;
            state.pagination = paginatedResult.pagination;
            state.loading = false;
          });
          
        } catch (error) {
          set(state => {
            state.loading = false;
            state.error = {
              message: 'Erreur lors du chargement des élèves',
              code: 'FETCH_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
        }
      },
      
      createStudent: async (data: CreateStudentFormData) => {
        set(state => {
          state.loadingAction = 'create';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1500);
          
          // Créer le nouvel élève
          const newStudent = convertFormDataToStudent(data);
          
          // Ajouter à la liste des élèves mock
          mockStudents.push(newStudent);
          
          // Mettre à jour l'état
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchStudents();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la création de l\'élève',
              code: 'CREATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      updateStudent: async (data: UpdateStudentFormData & { id: string }) => {
        set(state => {
          state.loadingAction = 'update';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1500);
          
          // Trouver l'élève à mettre à jour
          const existingStudentIndex = mockStudents.findIndex(s => s.id === data.id);
          if (existingStudentIndex === -1) {
            throw new Error('Élève non trouvé');
          }
          
          const existingStudent = mockStudents[existingStudentIndex];
          
          // Préparer les champs de mise à jour
          const updateFields: Partial<Student> = {};
          
          if (data.firstName !== undefined) updateFields.firstName = data.firstName;
          if (data.lastName !== undefined) updateFields.lastName = data.lastName;
          if (data.email !== undefined) updateFields.email = data.email;
          if (data.phone !== undefined) updateFields.phone = data.phone;
          if (data.dateOfBirth !== undefined) updateFields.dateOfBirth = new Date(data.dateOfBirth).toISOString();
          if (data.address !== undefined) updateFields.address = data.address;
          if (data.grade !== undefined) updateFields.grade = data.grade;
          if (data.enrollmentDate !== undefined) updateFields.enrollmentDate = new Date(data.enrollmentDate).toISOString();
          if (data.studentId !== undefined) updateFields.studentId = data.studentId;
          if (data.status !== undefined) updateFields.status = data.status;
          if (data.avatar !== undefined) updateFields.avatar = data.avatar;
          
          // Mettre à jour les informations du parent si fournies
          if (data.parentContact !== undefined) {
            updateFields.parentContact = {
              name: data.parentContact.name,
              phone: data.parentContact.phone,
              email: data.parentContact.email,
              relationship: data.parentContact.relationship
            };
          }
          
          // Créer l'élève mis à jour
          const updatedStudent: Student = {
            ...existingStudent,
            ...updateFields,
            updatedAt: new Date().toISOString()
          };
          
          // Mettre à jour dans la liste mock
          mockStudents[existingStudentIndex] = updatedStudent;
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchStudents();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la mise à jour de l\'élève',
              code: 'UPDATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      deleteStudent: async (id: string) => {
        set(state => {
          state.loadingAction = 'delete';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1000);
          
          // Trouver l'index de l'élève à supprimer
          const studentIndex = mockStudents.findIndex(s => s.id === id);
          if (studentIndex === -1) {
            throw new Error('Élève non trouvé');
          }
          
          // Supprimer l'élève de la liste mock
          mockStudents.splice(studentIndex, 1);
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchStudents();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la suppression de l\'élève',
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
      
      setFilters: (newFilters: Partial<StudentFilters>) => {
        set(state => {
          state.filters = { ...state.filters, ...newFilters };
          state.pagination.page = 1; // Reset à la première page
        });
        
        // Recharger les données avec les nouveaux filtres
        get().fetchStudents();
      },
      
      setSortOptions: (sort: StudentSortOptions) => {
        set(state => {
          state.sortOptions = sort;
        });
        
        // Recharger les données avec le nouveau tri
        get().fetchStudents();
      },
      
      changePage: (page: number) => {
        set(state => {
          state.pagination.page = page;
        });
        
        // Recharger les données pour la nouvelle page
        get().fetchStudents();
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
            grade: '',
            status: undefined,
            enrollmentYear: undefined
          };
          state.pagination.page = 1;
        });
        
        // Recharger les données
        get().fetchStudents();
      },
      
      fetchStats: async () => {
        try {
          // Simuler un délai d'API
          await delay(500);
          
          // Calculer les statistiques basées sur les données mockées
          const gradeCount = mockStudents.reduce((acc, student) => {
            acc[student.grade] = (acc[student.grade] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const stats = {
            total: mockStudents.length,
            active: mockStudents.filter(s => s.status === 'active').length,
            inactive: mockStudents.filter(s => s.status === 'inactive').length,
            suspended: mockStudents.filter(s => s.status === 'suspended').length,
            totalClasses: Object.keys(gradeCount).length,
            byGender: {
              male: mockStudents.filter(s => s.gender === 'male').length,
              female: mockStudents.filter(s => s.gender === 'female').length
            },
            byGrade: gradeCount
          };
          
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
// HOOKS PERSONNALISÉS POUR FACILITER L'UTILISATION
// =====================================================

// Hook pour récupérer seulement les élèves
export const useStudents = () => {
  return useStudentStore(state => state.students);
};

// Hook pour récupérer l'état de chargement
export const useStudentLoading = () => {
  return useStudentStore(state => state.loading);
};

// Hook pour récupérer les erreurs
export const useStudentError = () => {
  return useStudentStore(state => state.error);
};

// Hook pour récupérer les statistiques
export const useStudentStats = () => {
  return useStudentStore(state => state.stats);
};

// Hook pour récupérer les filtres
export const useStudentFilters = () => {
  return useStudentStore(state => state.filters);
};

// Hook pour récupérer la pagination
export const useStudentPagination = () => {
  return useStudentStore(state => state.pagination);
}; 