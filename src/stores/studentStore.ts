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
  StudentFilters, 
  PaginationOptions,
  StudentStats,
  ApiError 
} from '../types/student';

// Suppression des imports de données mock - utilisation des données réelles uniquement

import { CreateStudentFormData, UpdateStudentFormData } from '../schemas/studentSchema';
import { studentsService } from '../services/students/studentsService';
import type { Responsable, ResponsableDTO, AddStudentApiPayload } from '../services/students/studentsService';

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface StudentStore {
  // État
  students: Student[];
  allStudents: Student[]; // Tous les étudiants pour recherche et stats
  loading: boolean;
  error: ApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | null;
  responsables: Responsable[];
  
  // Filtres et pagination
  filters: StudentFilters;
  pagination: PaginationOptions;
  sortOptions: { field: string; order: 'asc' | 'desc' };
  
  // Statistiques
  stats: StudentStats | null;
  
  // Actions principales
  fetchStudents: () => Promise<void>;
  createStudent: (data: CreateStudentFormData) => Promise<void>;
  createStudentApi: (payload: AddStudentApiPayload) => Promise<void>;
  updateStudent: (data: UpdateStudentFormData & { id: string }) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Actions de filtrage et tri
  setFilters: (filters: Partial<StudentFilters>) => void;
  setSortOptions: (sort: { field: string; order: 'asc' | 'desc' }) => void;
  changePage: (page: number) => void;
  applyFiltersLocally: () => void;
  
  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
  fetchStats: () => Promise<void>;
  
  // Actions pour les responsables
  fetchResponsables: () => Promise<void>;
  createResponsable: (dto: ResponsableDTO) => Promise<Responsable>;
  
  // Nouvelles actions pour les endpoints spécifiques
  getStudentByMatricule: (matricule: string) => Promise<Student | null>;
  getStudentsByClassroom: (classroomId: string) => Promise<Student[]>;
  getStudentsByRoom: (roomId: string) => Promise<Student[]>;
  getStudentById: (id: string) => Promise<Student | null>;
  updateStudentApi: (id: string, updateData: Partial<AddStudentApiPayload>) => Promise<void>;
}

// =====================================================
// UTILITAIRES POUR LA RECHERCHE ET FILTRAGE
// =====================================================

// Fonction pour convertir les données API en Student
const convertApiStudentToStudent = (student: any): Student => {
  console.log('Conversion API Student:', student);
  
  const converted = {
    id: student.id,
    firstName: student.user?.firstName || '',
    lastName: student.user?.lastName || '',
    gender: (student.sexe === 'Homme' ? 'male' : 'female') as 'male' | 'female',
    dateOfBirth: student.dateOfBirth,
    placeOfBirth: student.lieuDeNaissance || '',
    email: student.user?.email || '',
    level: student.niveauEnseignement || '',
    grade: student.niveauEtude || '',
    roomId: student.room?.id || '',
    roomName: student.room?.name || '',
    studentId: student.matricule || '',
    enrollmentDate: student.user?.createdAt || new Date().toISOString(),
    status: (student.user?.isActive ? 'active' : 'inactive') as 'active' | 'inactive' | 'suspended',
    avatar: student.user?.avatarUrl || '',
    ninthGradeOrderNumber: '',
    ninthGradeSchool: '',
    ninthGradeGraduationYear: '',
    lastSchool: '',
    parentContact: {
      fatherName: student.nomPere || '',
      motherName: student.nomMere || '',
      responsiblePerson: student.personneResponsable?.user?.firstName + ' ' + student.personneResponsable?.user?.lastName || 'Non défini',
      phone: student.personneResponsable?.user?.phone || '',
      email: student.personneResponsable?.user?.email || '',
      address: student.adresse?.adresseLigne1 || '',
      relationship: student.personneResponsable?.lienParente || 'Tuteur'
    },
    createdAt: student.user?.createdAt || new Date().toISOString(),
    updatedAt: student.user?.updatedAt || new Date().toISOString()
  };
  
  console.log('Student converti:', converted);
  return converted;
};

// Fonction pour filtrer les étudiants
const filterStudents = (students: Student[], filters: StudentFilters): Student[] => {
  console.log('Filtrage des étudiants:', { totalStudents: students.length, filters });
  
  return students.filter(student => {
    // Recherche par nom, prénom, email, matricule
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchTerm) ||
        student.lastName.toLowerCase().includes(searchTerm) ||
        (student.email?.toLowerCase().includes(searchTerm) || false) ||
        student.studentId.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }
    
    // Filtre par classe/grade
    if (filters.grade && student.grade !== filters.grade) {
      console.log(`Étudiant ${student.firstName} ${student.lastName} exclu par grade: ${student.grade} !== ${filters.grade}`);
      return false;
    }
    
    // Filtre par salle
    if (filters.roomId && student.roomId !== filters.roomId) {
      console.log(`Étudiant ${student.firstName} ${student.lastName} exclu par salle: ${student.roomId} !== ${filters.roomId}`);
      return false;
    }
    
    // Filtre par statut
    if (filters.status && student.status !== filters.status) {
      console.log(`Étudiant ${student.firstName} ${student.lastName} exclu par statut: ${student.status} !== ${filters.status}`);
      return false;
    }
    
    // Filtre par genre - conversion nécessaire car les filtres utilisent 'Homme'/'Femme' mais student.gender est 'male'/'female'
    if (filters.gender) {
      let expectedGender: string;
      if (filters.gender === 'Homme') {
        expectedGender = 'male';
      } else if (filters.gender === 'Femme') {
        expectedGender = 'female';
      } else {
        expectedGender = filters.gender;
      }
      
      if (student.gender !== expectedGender) {
        console.log(`Étudiant ${student.firstName} ${student.lastName} exclu par genre: ${student.gender} !== ${expectedGender} (filtre: ${filters.gender})`);
        return false;
      }
    }
    
    // Filtre par année d'inscription
    if (filters.enrollmentYear) {
      const enrollmentYear = new Date(student.enrollmentDate).getFullYear();
      if (enrollmentYear !== filters.enrollmentYear) return false;
    }
    
    return true;
  });
};

// Fonction pour trier les étudiants
const sortStudents = (students: Student[], sortOptions: { field: string; order: 'asc' | 'desc' }): Student[] => {
  return [...students].sort((a, b) => {
    const aValue = (a as any)[sortOptions.field];
    const bValue = (b as any)[sortOptions.field];
    
    if (aValue < bValue) return sortOptions.order === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOptions.order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Fonction pour paginer les étudiants
const paginateStudents = (students: Student[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return students.slice(startIndex, endIndex);
};

// Fonction pour calculer les statistiques
const calculateStudentStats = (students: Student[]): StudentStats => {
  const total = students.length;
  const active = students.filter(s => s.status === 'active').length;
  const inactive = students.filter(s => s.status === 'inactive').length;
  const suspended = students.filter(s => s.status === 'suspended').length;
  
  const byGender = {
    male: students.filter(s => s.gender === 'male').length,
    female: students.filter(s => s.gender === 'female').length
  };
  
  const byGrade: Record<string, number> = {};
  students.forEach(student => {
    byGrade[student.grade] = (byGrade[student.grade] || 0) + 1;
  });
  
  const uniqueGrades = new Set(students.map(s => s.grade));
  
  return {
    total,
    active,
    inactive,
    suspended,
    totalClasses: uniqueGrades.size,
    byGender,
    byGrade
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
      allStudents: [], // Tous les étudiants pour recherche et stats
      loading: false,
      error: null,
      loadingAction: null,
      responsables: [],
      
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
          const { pagination } = get();
          
          // Utiliser l'API réelle au lieu des données mockées
          const apiResponse = await studentsService.getAllStudents(pagination.page, pagination.limit);
          
          // Récupérer aussi tous les étudiants pour la recherche et les stats
          const allStudentsResponse = await studentsService.getAllStudentsComplete();
          const allConvertedStudents = allStudentsResponse.data.map(convertApiStudentToStudent);
          
          // Appliquer les filtres et le tri sur tous les étudiants
          const { filters, sortOptions } = get();
          const filteredStudents = filterStudents(allConvertedStudents, filters);
          const sortedStudents = sortStudents(filteredStudents, sortOptions);
          
          // Paginer les résultats filtrés
          const paginatedStudents = paginateStudents(sortedStudents, pagination.page, pagination.limit);
          
          set(state => {
            state.allStudents = allConvertedStudents;
            state.students = paginatedStudents;
            state.pagination = {
              page: pagination.page,
              limit: pagination.limit,
              total: filteredStudents.length,
              totalPages: Math.ceil(filteredStudents.length / pagination.limit)
            };
            state.loading = false;
          });
          
          // Calculer les statistiques automatiquement après le chargement des données
          await get().fetchStats();
          
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
        // Cette méthode est dépréciée - utiliser createStudentApi à la place
        throw new Error('Méthode dépréciée - utiliser createStudentApi');
      },

      // Méthodes pour les responsables
      fetchResponsables: async () => {
        try {
          set(state => { state.loading = true; });
          const responsables = await studentsService.getResponsables();
          set(state => { 
            state.responsables = responsables;
            state.loading = false;
          });
        } catch (error) {
          console.error('Erreur lors du chargement des responsables:', error);
          set(state => { state.loading = false; });
          throw error;
        }
      },
      createResponsable: async (dto: ResponsableDTO) => {
        try {
          const created = await studentsService.addResponsable(dto);
          set(state => {
            state.responsables = [created, ...state.responsables];
          });
          return created;
        } catch (error) {
          set(state => {
            state.error = {
              message: 'Erreur lors de la création du responsable',
              code: 'RESPONSABLE_CREATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },

      // -------- Création élève via API officielle (multipart) --------
      createStudentApi: async (payload: AddStudentApiPayload) => {
        set(state => {
          state.loadingAction = 'create';
          state.error = null;
        });
        try {
          await studentsService.addStudent(payload);
          set(state => {
            state.loadingAction = null;
          });
          // Après succès, recharger (pour l'instant on reste sur mock list)
          await get().fetchStudents();
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la création de l\'élève (API)',
              code: 'CREATE_API_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      updateStudent: async (data: UpdateStudentFormData & { id: string }) => {
        // Cette méthode sera implémentée avec l'API réelle plus tard
        throw new Error('Méthode non implémentée - API update à venir');
      },
      
      deleteStudent: async (id: string) => {
        // Cette méthode sera implémentée avec l'API réelle plus tard
        throw new Error('Méthode non implémentée - API delete à venir');
      },
      
      // =====================================================
      // ACTIONS DE FILTRAGE ET TRI
      // =====================================================
      
      setFilters: (newFilters: Partial<StudentFilters>) => {
        set(state => {
          state.filters = { ...state.filters, ...newFilters };
          state.pagination.page = 1; // Reset à la première page
        });
        
        // Appliquer les filtres localement sans recharger depuis l'API
        get().applyFiltersLocally();
      },
      
      // Nouvelle méthode pour appliquer les filtres localement
      applyFiltersLocally: () => {
        const { allStudents, filters, sortOptions, pagination } = get();
        
        if (!allStudents || allStudents.length === 0) {
          // Si pas de données, charger depuis l'API
          get().fetchStudents();
          return;
        }
        
        // Appliquer les filtres sur les données déjà chargées
        const filteredStudents = filterStudents(allStudents, filters);
        const sortedStudents = sortStudents(filteredStudents, sortOptions);
        const paginatedStudents = paginateStudents(sortedStudents, pagination.page, pagination.limit);
        
        set(state => {
          state.students = paginatedStudents;
          state.pagination = {
            page: pagination.page,
            limit: pagination.limit,
            total: filteredStudents.length,
            totalPages: Math.ceil(filteredStudents.length / pagination.limit)
          };
        });
        
        // Recalculer les statistiques avec les données filtrées
        get().fetchStats();
      },
      
      setSortOptions: (newSort: { field: string; order: 'asc' | 'desc' }) => {
        set(state => {
          state.sortOptions = newSort;
        });
        
        // Appliquer le tri localement
        get().applyFiltersLocally();
      },
      
      changePage: (newPage: number) => {
        set(state => {
          state.pagination.page = newPage;
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
            grade: undefined,
            roomId: undefined,
            status: undefined,
            gender: undefined,
            enrollmentYear: undefined
          };
          state.pagination.page = 1;
        });
        
        // Appliquer la remise à zéro localement
        get().applyFiltersLocally();
      },
      
      fetchStats: async () => {
        try {
          // Calculer les stats à partir de tous les étudiants réels
          const { allStudents } = get();
          
          // Vérifier que nous avons des données
          if (!allStudents || allStudents.length === 0) {
            console.log('Aucun étudiant trouvé pour calculer les statistiques');
            return;
          }
          
          console.log('Calcul des statistiques pour', allStudents.length, 'étudiants');
          const stats = calculateStudentStats(allStudents);
          console.log('Statistiques calculées:', stats);
          
          set(state => {
            state.stats = stats;
          });
        } catch (error) {
          console.error('Erreur lors du calcul des statistiques:', error);
        }
      },

      // =====================================================
      // NOUVELLES ACTIONS POUR LES ENDPOINTS SPÉCIFIQUES
      // =====================================================

      // GET /students/by-matricule/{matricule}
      getStudentByMatricule: async (matricule: string) => {
        try {
          set(state => { state.loading = true; });
          const apiStudent = await studentsService.getStudentByMatricule(matricule);
          const student = convertApiStudentToStudent(apiStudent);
          set(state => { state.loading = false; });
          return student;
        } catch (error) {
          console.error('Erreur lors de la recherche par matricule:', error);
          set(state => { 
            state.loading = false;
            state.error = {
              message: 'Erreur lors de la recherche par matricule',
              code: 'STUDENT_BY_MATRICULE_ERROR',
              details: error instanceof Error ? [{ field: 'matricule', message: error.message }] : []
            };
          });
          return null;
        }
      },

      // GET /students/by-classroom/{classroomId}
      getStudentsByClassroom: async (classroomId: string) => {
        try {
          set(state => { state.loading = true; });
          const apiStudents = await studentsService.getStudentsByClassroom(classroomId);
          const students = apiStudents.map(convertApiStudentToStudent);
          
          // Mettre à jour les étudiants affichés avec les résultats filtrés
          set(state => { 
            state.students = students;
            state.allStudents = students; // Aussi mettre à jour allStudents pour les stats
            state.loading = false; 
          });
          
          console.log('Store mis à jour avec étudiants filtrés par classe:', students.length);
          return students;
        } catch (error) {
          console.error('Erreur lors de la recherche par classe:', error);
          set(state => { 
            state.loading = false;
            state.error = {
              message: 'Erreur lors de la recherche par classe',
              code: 'STUDENTS_BY_CLASSROOM_ERROR',
              details: error instanceof Error ? [{ field: 'classroomId', message: error.message }] : []
            };
          });
          return [];
        }
      },

      // GET /students/by-room/{roomId}
      getStudentsByRoom: async (roomId: string) => {
        try {
          set(state => { state.loading = true; });
          const apiStudents = await studentsService.getStudentsByRoom(roomId);
          const students = apiStudents.map(convertApiStudentToStudent);
          
          // Mettre à jour les étudiants affichés avec les résultats filtrés
          set(state => { 
            state.students = students;
            state.allStudents = students; // Aussi mettre à jour allStudents pour les stats
            state.loading = false; 
          });
          
          console.log('Store mis à jour avec étudiants filtrés par salle:', students.length);
          return students;
        } catch (error) {
          console.error('Erreur lors de la recherche par salle:', error);
          set(state => { 
            state.loading = false;
            state.error = {
              message: 'Erreur lors de la recherche par salle',
              code: 'STUDENTS_BY_ROOM_ERROR',
              details: error instanceof Error ? [{ field: 'roomId', message: error.message }] : []
            };
          });
          return [];
        }
      },

      // GET /students/{id}
      getStudentById: async (id: string) => {
        try {
          set(state => { state.loading = true; });
          const apiStudent = await studentsService.getStudentById(id);
          const student = convertApiStudentToStudent(apiStudent);
          set(state => { state.loading = false; });
          return student;
        } catch (error) {
          console.error('Erreur lors de la recherche par ID:', error);
          set(state => { 
            state.loading = false;
            state.error = {
              message: 'Erreur lors de la recherche par ID',
              code: 'STUDENT_BY_ID_ERROR',
              details: error instanceof Error ? [{ field: 'id', message: error.message }] : []
            };
          });
          return null;
        }
      },

      // PATCH /students/{id}
      updateStudentApi: async (id: string, updateData: Partial<AddStudentApiPayload>) => {
        try {
          set(state => { 
            state.loading = true;
            state.loadingAction = 'update';
          });
          
          await studentsService.updateStudent(id, updateData);
          
          // Recharger la liste des étudiants après mise à jour
          await get().fetchStudents();
          
          set(state => { 
            state.loading = false;
            state.loadingAction = null;
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour:', error);
          set(state => { 
            state.loading = false;
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la mise à jour de l\'étudiant',
              code: 'STUDENT_UPDATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
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