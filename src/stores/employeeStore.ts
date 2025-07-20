/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES EMPLOYÉS
 * =====================================================
 * Ce store centralise toute la logique de gestion d'état
 * pour les employés avec Zustand
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import { 
  Employee, 
  CreateEmployeeDto, 
  UpdateEmployeeDto, 
  EmployeeFilters, 
  EmployeePaginationOptions,
  EmployeeStats,
  EmployeeApiError,
  AssignCoursesDto
} from '../types/employee';

import { 
  mockEmployees, 
  delay, 
  generateEmployeeId, 
  searchEmployees, 
  sortEmployees, 
  paginateEmployees,
  calculateEmployeeStats
} from '../data/mockEmployees';

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface EmployeeStore {
  // État
  employees: Employee[];
  loading: boolean;
  error: EmployeeApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | 'assign' | null;
  
  // Filtres et pagination
  filters: EmployeeFilters;
  pagination: EmployeePaginationOptions;
  sortOptions: {
    field: keyof Employee;
    order: 'asc' | 'desc';
  };
  
  // Statistiques
  stats: EmployeeStats | null;
  
  // Actions principales
  fetchEmployees: () => Promise<void>;
  createEmployee: (data: CreateEmployeeDto) => Promise<void>;
  updateEmployee: (data: UpdateEmployeeDto & { id: string }) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  assignCourses: (data: AssignCoursesDto) => Promise<void>;
  
  // Actions de filtrage et tri
  setFilters: (filters: Partial<EmployeeFilters>) => void;
  setSortOptions: (sort: { field: keyof Employee; order: 'asc' | 'desc' }) => void;
  changePage: (page: number) => void;
  
  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
  fetchStats: () => Promise<void>;
}

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

// Convertir les données du formulaire en objet Employee
const convertFormDataToEmployee = (data: CreateEmployeeDto): Employee => {
  return {
    id: generateEmployeeId(),
    employeeId: data.employeeId,
    type: data.type,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    address: data.address,
    hireDate: data.hireDate,
    status: data.status,
    isActive: true, // Par défaut, un nouvel employé est actif
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    // Informations spécifiques selon le type
    professorInfo: data.type === 'professeur' ? {
      specialty: data.specialty!,
      secondarySpecialties: data.secondarySpecialties || [],
      degree: data.degree!,
      institution: data.institution!,
      graduationYear: data.graduationYear!,
      assignedCourses: data.assignedCourses || [],
      maxCourses: data.maxCourses || 3,
      availability: data.availability || []
    } : undefined,
    
    administrativeInfo: data.type === 'administratif' ? {
      department: data.department!,
      position: data.position!,
      supervisor: data.supervisor
    } : undefined,
    
    technicalInfo: data.type === 'technique' ? {
      skills: data.skills || [],
      certifications: data.certifications || [],
      equipment: data.equipment || []
    } : undefined
  };
};

// =====================================================
// CRÉATION DU STORE ZUSTAND
// =====================================================
export const useEmployeeStore = create<EmployeeStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // =====================================================
      // ÉTAT INITIAL
      // =====================================================
      employees: [],
      loading: false,
      error: null,
      loadingAction: null,
      
      // Filtres et pagination
      filters: {
        search: '',
        type: undefined,
        status: undefined,
        isActive: undefined,
        department: undefined,
        specialty: undefined,
        hireYear: undefined
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      sortOptions: {
        field: 'lastName',
        order: 'asc'
      },
      
      // Statistiques
      stats: null,
      
      // =====================================================
      // ACTIONS PRINCIPALES
      // =====================================================
      
      fetchEmployees: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1000);
          
          const { filters, sortOptions, pagination } = get();
          
          // Appliquer les filtres
          let filteredEmployees = searchEmployees(mockEmployees, filters.search || '', {
            type: filters.type || undefined,
            status: filters.status || undefined,
            isActive: filters.isActive,
            department: filters.department || undefined,
            specialty: filters.specialty || undefined
          });
          
          // Appliquer le tri
          filteredEmployees = sortEmployees(filteredEmployees, sortOptions.field, sortOptions.order);
          
          // Appliquer la pagination
          const paginatedResult = paginateEmployees(filteredEmployees, pagination.page, pagination.limit);
          
          set(state => {
            state.employees = paginatedResult.data;
            state.pagination = paginatedResult.pagination;
            state.loading = false;
          });
          
        } catch (error) {
          set(state => {
            state.loading = false;
            state.error = {
              message: 'Erreur lors du chargement des employés',
              code: 'FETCH_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
        }
      },
      
      createEmployee: async (data: CreateEmployeeDto) => {
        set(state => {
          state.loadingAction = 'create';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1500);
          
          // Créer le nouvel employé
          const newEmployee = convertFormDataToEmployee(data);
          
          // Ajouter à la liste des employés mock
          mockEmployees.push(newEmployee);
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchEmployees();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la création de l\'employé',
              code: 'CREATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      updateEmployee: async (data: UpdateEmployeeDto & { id: string }) => {
        set(state => {
          state.loadingAction = 'update';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1200);
          
          const { id, ...updateData } = data;
          const employeeIndex = mockEmployees.findIndex(e => e.id === id);
          
          if (employeeIndex === -1) {
            throw new Error('Employé non trouvé');
          }
          
          // Mettre à jour l'employé
          mockEmployees[employeeIndex] = {
            ...mockEmployees[employeeIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
          };
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchEmployees();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la mise à jour de l\'employé',
              code: 'UPDATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      deleteEmployee: async (id: string) => {
        set(state => {
          state.loadingAction = 'delete';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1000);
          
          const employeeIndex = mockEmployees.findIndex(e => e.id === id);
          
          if (employeeIndex === -1) {
            throw new Error('Employé non trouvé');
          }
          
          // Supprimer l'employé
          mockEmployees.splice(employeeIndex, 1);
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchEmployees();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la suppression de l\'employé',
              code: 'DELETE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      assignCourses: async (data: AssignCoursesDto) => {
        set(state => {
          state.loadingAction = 'assign';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(800);
          
          const { employeeId, courseIds, action } = data;
          const employeeIndex = mockEmployees.findIndex(e => e.id === employeeId);
          
          if (employeeIndex === -1) {
            throw new Error('Employé non trouvé');
          }
          
          const employee = mockEmployees[employeeIndex];
          
          if (employee.professorInfo) {
            if (action === 'assign') {
              // Ajouter les cours assignés (sans doublons)
              const existingCourses = employee.professorInfo.assignedCourses;
              
              // Créer les nouveaux CourseAssignment
              const newAssignments = courseIds
                .filter(id => !existingCourses.some(course => course.courseId === id))
                .map(id => ({
                  courseId: id,
                  courseName: `Cours ${id}`, // Nom par défaut
                  classes: [],
                  rooms: []
                }));
              
              const newAssignedCourses = [...existingCourses, ...newAssignments];
              
              if (newAssignedCourses.length > employee.professorInfo.maxCourses) {
                throw new Error(`L'employé ne peut pas avoir plus de ${employee.professorInfo.maxCourses} cours assignés`);
              }
              
              employee.professorInfo.assignedCourses = newAssignedCourses;
            } else {
              // Retirer les cours assignés
              employee.professorInfo.assignedCourses = employee.professorInfo.assignedCourses.filter(
                course => !courseIds.includes(course.courseId)
              );
            }
          }
          
          employee.updatedAt = new Date().toISOString();
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchEmployees();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de l\'assignation des cours',
              code: 'ASSIGN_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      // =====================================================
      // ACTIONS DE FILTRAGE ET TRI
      // =====================================================
      
      setFilters: (filters: Partial<EmployeeFilters>) => {
        set(state => {
          state.filters = { ...state.filters, ...filters };
          state.pagination.page = 1; // Retour à la première page
        });
        
        // Recharger les données avec les nouveaux filtres
        get().fetchEmployees();
      },
      
      setSortOptions: (sort: { field: keyof Employee; order: 'asc' | 'desc' }) => {
        set(state => {
          state.sortOptions = sort;
        });
        
        // Recharger les données avec le nouveau tri
        get().fetchEmployees();
      },
      
      changePage: (page: number) => {
        set(state => {
          state.pagination.page = page;
        });
        
        // Recharger les données pour la nouvelle page
        get().fetchEmployees();
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
            type: undefined,
            status: undefined,
            isActive: undefined,
            department: undefined,
            specialty: undefined,
            hireYear: undefined
          };
          state.pagination.page = 1;
        });
        
        // Recharger les données
        get().fetchEmployees();
      },
      
      fetchStats: async () => {
        try {
          // Simuler un délai d'API
          await delay(500);
          
          const stats = calculateEmployeeStats(mockEmployees);
          
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

export const useEmployees = () => {
  return useEmployeeStore(state => state.employees);
};

export const useEmployeeLoading = () => {
  return useEmployeeStore(state => state.loading);
};

export const useEmployeeError = () => {
  return useEmployeeStore(state => state.error);
};

export const useEmployeeStats = () => {
  return useEmployeeStore(state => state.stats);
};

export const useEmployeeFilters = () => {
  return useEmployeeStore(state => state.filters);
};

export const useEmployeePagination = () => {
  return useEmployeeStore(state => state.pagination);
}; 