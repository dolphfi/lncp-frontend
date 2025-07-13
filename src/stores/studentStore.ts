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
import { getRoomNameById } from '../data/mockRooms';

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
    gender: data.gender,
    dateOfBirth: new Date(data.dateOfBirth).toISOString(),
    placeOfBirth: data.placeOfBirth,
    email: data.email,
    ninthGradeOrderNumber: data.ninthGradeOrderNumber,
    level: data.level,
    grade: data.grade,
    roomId: data.roomId === 'none' ? undefined : data.roomId,
    roomName: data.roomId && data.roomId !== 'none' ? getRoomNameById(data.roomId) : undefined,
    ninthGradeSchool: data.ninthGradeSchool,
    ninthGradeGraduationYear: data.ninthGradeGraduationYear,
    lastSchool: data.lastSchool,
    enrollmentDate: new Date(data.enrollmentDate).toISOString(),
    studentId: data.studentId,
    parentContact: {
      fatherName: data.parentContact.fatherName,
      motherName: data.parentContact.motherName,
      responsiblePerson: data.parentContact.responsiblePerson,
      phone: data.parentContact.phone,
      email: data.parentContact.email,
      address: data.parentContact.address,
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
        roomId: undefined,
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
            status: filters.status || undefined,
            gender: filters.gender || undefined,
            roomId: filters.roomId || undefined
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
      
      updateStudent: async (data: any) => {
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
          
          // Créer l'élève mis à jour avec les nouvelles données
          const updatedStudent: Student = {
            ...existingStudent,
            firstName: data.firstName !== undefined ? data.firstName : existingStudent.firstName,
            lastName: data.lastName !== undefined ? data.lastName : existingStudent.lastName,
            gender: data.gender !== undefined ? data.gender : existingStudent.gender,
            dateOfBirth: data.dateOfBirth !== undefined ? new Date(data.dateOfBirth).toISOString() : existingStudent.dateOfBirth,
            placeOfBirth: data.placeOfBirth !== undefined ? data.placeOfBirth : existingStudent.placeOfBirth,
            email: data.email !== undefined ? data.email : existingStudent.email,
            ninthGradeOrderNumber: data.ninthGradeOrderNumber !== undefined ? data.ninthGradeOrderNumber : existingStudent.ninthGradeOrderNumber,
            level: data.level !== undefined ? data.level : existingStudent.level,
            grade: data.grade !== undefined ? data.grade : existingStudent.grade,
            roomId: data.roomId !== undefined ? (data.roomId === 'none' ? undefined : data.roomId) : existingStudent.roomId,
            roomName: data.roomId !== undefined ? (data.roomId && data.roomId !== 'none' ? getRoomNameById(data.roomId) : undefined) : existingStudent.roomName,
            ninthGradeSchool: data.ninthGradeSchool !== undefined ? data.ninthGradeSchool : existingStudent.ninthGradeSchool,
            ninthGradeGraduationYear: data.ninthGradeGraduationYear !== undefined ? data.ninthGradeGraduationYear : existingStudent.ninthGradeGraduationYear,
            lastSchool: data.lastSchool !== undefined ? data.lastSchool : existingStudent.lastSchool,
            enrollmentDate: data.enrollmentDate !== undefined ? new Date(data.enrollmentDate).toISOString() : existingStudent.enrollmentDate,
            studentId: data.studentId !== undefined ? data.studentId : existingStudent.studentId,
            status: data.status !== undefined ? data.status : existingStudent.status,
            avatar: data.avatar !== undefined ? data.avatar : existingStudent.avatar,
            parentContact: data.parentContact !== undefined ? {
              fatherName: data.parentContact.fatherName !== undefined ? data.parentContact.fatherName : existingStudent.parentContact.fatherName,
              motherName: data.parentContact.motherName !== undefined ? data.parentContact.motherName : existingStudent.parentContact.motherName,
              responsiblePerson: data.parentContact.responsiblePerson !== undefined ? data.parentContact.responsiblePerson : existingStudent.parentContact.responsiblePerson,
              phone: data.parentContact.phone !== undefined ? data.parentContact.phone : existingStudent.parentContact.phone,
              email: data.parentContact.email !== undefined ? data.parentContact.email : existingStudent.parentContact.email,
              address: data.parentContact.address !== undefined ? data.parentContact.address : existingStudent.parentContact.address,
              relationship: data.parentContact.relationship !== undefined ? data.parentContact.relationship : existingStudent.parentContact.relationship
            } : existingStudent.parentContact,
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
        
        // ✨ Appliquer les filtres IMMÉDIATEMENT sans loading ni delay
        const { filters, sortOptions, pagination } = get();
        
        let filteredStudents = searchStudents(mockStudents, filters.search || '', {
          grade: filters.grade || undefined,
          status: filters.status || undefined,
          gender: filters.gender || undefined,
          roomId: filters.roomId || undefined
        });
        
        // Appliquer le tri
        filteredStudents = sortStudents(filteredStudents, sortOptions.field, sortOptions.order);
        
        // Appliquer la pagination
        const paginatedResult = paginateStudents(filteredStudents, pagination.page, pagination.limit);
        
        set(state => {
          state.students = paginatedResult.data;
          state.pagination = paginatedResult.pagination;
        });
      },
      
      setSortOptions: (sort: StudentSortOptions) => {
        set(state => {
          state.sortOptions = sort;
        });
        
        // ✨ Appliquer le tri IMMÉDIATEMENT sans loading ni delay
        const { filters, sortOptions, pagination } = get();
        
        let filteredStudents = searchStudents(mockStudents, filters.search || '', {
          grade: filters.grade || undefined,
          status: filters.status || undefined,
          gender: filters.gender || undefined,
          roomId: filters.roomId || undefined
        });
        
        filteredStudents = sortStudents(filteredStudents, sortOptions.field, sortOptions.order);
        const paginatedResult = paginateStudents(filteredStudents, pagination.page, pagination.limit);
        
        set(state => {
          state.students = paginatedResult.data;
          state.pagination = paginatedResult.pagination;
        });
      },
      
      changePage: (page: number) => {
        set(state => {
          state.pagination.page = page;
        });
        
        // ✨ Appliquer la pagination IMMÉDIATEMENT sans loading ni delay
        const { filters, sortOptions, pagination } = get();
        
        let filteredStudents = searchStudents(mockStudents, filters.search || '', {
          grade: filters.grade || undefined,
          status: filters.status || undefined,
          gender: filters.gender || undefined,
          roomId: filters.roomId || undefined
        });
        
        filteredStudents = sortStudents(filteredStudents, sortOptions.field, sortOptions.order);
        const paginatedResult = paginateStudents(filteredStudents, pagination.page, pagination.limit);
        
        set(state => {
          state.students = paginatedResult.data;
          state.pagination = paginatedResult.pagination;
        });
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
            roomId: undefined,
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