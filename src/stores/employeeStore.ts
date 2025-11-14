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
import { createApiError, type ApiError } from '../utils/errorHandler';

import type {
  Employee,
  EmployeeApiResponse,
  EmployeeFilters,
  EmployeeStats,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  AssignCoursesDto,
  EmployeeType,
  EmployeeStatus
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

// Import des services API
import { employeeService } from '../services/employees/employeeService';
import { 
  convertEmployeeFromApi, 
  convertEmployeeToApi,
  CreateEmployeeApiPayload
} from '../types/employee';

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface EmployeeStore {
  // État
  employees: Employee[];
  allEmployees: Employee[]; // Toutes les données pour le filtrage local
  loading: boolean;
  error: ApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | 'assign' | null;
  
  // Filtres et pagination
  filters: EmployeeFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  sortOptions: {
    field: keyof Employee;
    order: 'asc' | 'desc';
  };
  
  // Statistiques
  stats: EmployeeStats | null;
  
  // Actions principales
  fetchEmployees: (page?: number, limit?: number) => Promise<void>;
  createEmployee: (data: CreateEmployeeDto) => Promise<void>;
  updateEmployee: (data: UpdateEmployeeDto & { id: string }) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  assignCourses: (data: AssignCoursesDto) => Promise<void>;
  
  // Actions de gestion des cours (API backend)
  addCoursesToEmployee: (employeeId: string, courseIds: string[]) => Promise<void>;
  removeCoursesFromEmployee: (employeeId: string, courseIds: string[]) => Promise<void>;
  
  // Actions de filtrage et tri
  setFilters: (filters: Partial<EmployeeFilters>) => void;
  setSortOptions: (sort: { field: keyof Employee; order: 'asc' | 'desc' }) => void;
  changePage: (page: number) => void;
  
  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
  fetchStats: () => Promise<void>;
  applyFiltersLocally: () => void;
  
  // Méthodes utilitaires de filtrage
  filterEmployees: (employees: Employee[], filters: EmployeeFilters) => Employee[];
  sortEmployees: (employees: Employee[], sortOptions: { field: keyof Employee; order: 'asc' | 'desc' }) => Employee[];
  paginateEmployees: (employees: Employee[], page: number, limit: number) => Employee[];
  calculateStats: (employees: Employee[]) => void;
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
      allEmployees: [], // Toutes les données pour le filtrage local
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
      
      fetchEmployees: async (page?: number, limit?: number) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          // Récupérer une seule page du backend (page=1, limit=100 par défaut)
          const fetchPage = page || 1;
          const fetchLimit = limit || 100;
          
          console.log(`📦 Chargement page ${fetchPage} avec limite ${fetchLimit}...`);
          const response = await employeeService.getAllEmployees(fetchPage, fetchLimit);
          
          console.log('📊 Réponse API reçue:', response);
          
          // L'API retourne directement un tableau, pas un objet avec data
          const employeesData: EmployeeApiResponse[] = Array.isArray(response) ? response : (response.data || []);
          
          if (!employeesData || employeesData.length === 0) {
            console.log('🚫 Aucune donnée reçue');
            set(state => {
              state.allEmployees = [];
              state.employees = [];
              state.pagination = {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0
              };
              state.loading = false;
              state.error = null;
            });
            return;
          }
          
          console.log(`👥 Reçu ${employeesData.length} employés`);
          
          // Convertir les données API vers le format frontend
          console.log('🔄 Conversion des employés');
          const convertedEmployees = employeesData.map((emp: EmployeeApiResponse, index: number) => {
            try {
              return convertEmployeeFromApi(emp);
            } catch (error) {
              console.error(`❌ Erreur conversion employé ${index}:`, error, emp);
              throw error;
            }
          });
          
          console.log('✅ Employés convertis avec succès:', convertedEmployees.length);
          console.log('📊 Premier employé converti:', convertedEmployees[0]);
          
          set(state => {
            state.allEmployees = convertedEmployees; // Stocker toutes les données de la page

            // Pagination côté frontend : afficher seulement les employés de la page courante
            const limit = 10;
            const startIndex = 0; // Page 1 = index 0
            const endIndex = limit;
            const paginatedEmployees = convertedEmployees.slice(startIndex, endIndex);

            state.employees = paginatedEmployees; // Afficher seulement les employés de la page courante

            // Simuler les informations de pagination basées sur le nombre d'éléments
            const totalEmployees = convertedEmployees.length;
            const totalPages = Math.ceil(totalEmployees / limit);

            state.pagination = {
              page: 1,
              limit: limit,
              total: totalEmployees,
              totalPages: totalPages
            };

            state.loading = false;
            state.error = null;
          });
          
        } catch (error) {
          console.error('❌ Erreur détaillée lors du chargement des employés:', {
            error,
            message: error instanceof Error ? error.message : 'Erreur inconnue',
            stack: error instanceof Error ? error.stack : null
          });
          
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
          console.log('📝 Données reçues pour création:', data);
          
          // Utiliser directement les données du formulaire (déjà au bon format)
          const apiPayload = data as any;
          
          console.log('🚀 Payload API à envoyer:', apiPayload);
          
          // Appel API pour créer l'employé
          const createdEmployee = await employeeService.createEmployee(apiPayload);
          
          console.log('✅ Employé créé avec succès:', createdEmployee);
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchEmployees();
          
        } catch (error) {
          console.error('❌ Erreur lors de la création de l\'employé:', error);
          console.error('🔍 Détails de l\'erreur:', {
            message: error instanceof Error ? error.message : 'Erreur inconnue',
            stack: error instanceof Error ? error.stack : null,
            response: (error as any)?.response?.data || null,
            status: (error as any)?.response?.status || null
          });
          
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
          console.log('📝 Données reçues pour mise à jour:', data);
          
          const { id, ...updateData } = data;
          
          // Utiliser directement les données du formulaire (déjà au bon format)
          const apiPayload = updateData as any;
          
          console.log('🚀 Payload API à envoyer pour mise à jour:', apiPayload);
          console.log('🆔 ID de l\'employé:', id);
          
          // Appel API pour mettre à jour l'employé
          const updatedEmployee = await employeeService.updateEmployee(id, apiPayload);
          
          console.log('✅ Employé mis à jour avec succès:', updatedEmployee);
          
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchEmployees();
          
        } catch (error) {
          console.error('❌ Erreur lors de la mise à jour de l\'employé:', error);
          console.error('🔍 Détails de l\'erreur:', {
            message: error instanceof Error ? error.message : 'Erreur inconnue',
            stack: error instanceof Error ? error.stack : null,
            response: (error as any)?.response?.data || null,
            status: (error as any)?.response?.status || null
          });
          
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
      
      /**
       * Ajouter un ou plusieurs cours à un employé (TEACHER)
       * Utilise l'endpoint backend POST /employees/{id}/add-courses
       */
      addCoursesToEmployee: async (employeeId: string, courseIds: string[]) => {
        console.log('📚 Store - Ajout de cours à l\'employé', employeeId);
        console.log('📋 Cours à ajouter:', courseIds);
        
        set(state => {
          state.loadingAction = 'assign';
          state.error = null;
        });
        
        try {
          // Appel API pour ajouter les cours
          const updatedEmployee = await employeeService.addCoursesToEmployee(employeeId, courseIds);
          
          console.log('✅ Cours ajoutés avec succès');
          console.log('👤 Employé mis à jour:', updatedEmployee);
          
          // Convertir la réponse API vers le format frontend
          const frontendEmployee = convertEmployeeFromApi(updatedEmployee);
          
          // Mettre à jour l'employé dans le state
          set(state => {
            // Mettre à jour dans allEmployees
            const index = state.allEmployees.findIndex(e => e.id === employeeId);
            if (index !== -1) {
              state.allEmployees[index] = frontendEmployee;
            }
            
            state.loadingAction = null;
          });
          
          // Réappliquer les filtres pour mettre à jour la vue
          get().applyFiltersLocally();
          
          console.log('✅ Store mis à jour avec les nouveaux cours');
          
        } catch (error) {
          console.error('❌ Erreur lors de l\'ajout des cours:', error);
          
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de l\'ajout des cours à l\'employé',
              code: 'ADD_COURSES_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          
          throw error;
        }
      },
      
      /**
       * Retirer un ou plusieurs cours d'un employé (TEACHER)
       * Utilise l'endpoint backend POST /employees/{id}/remove-courses
       */
      removeCoursesFromEmployee: async (employeeId: string, courseIds: string[]) => {
        console.log('📚 Store - Retrait de cours de l\'employé', employeeId);
        console.log('📋 Cours à retirer:', courseIds);
        
        set(state => {
          state.loadingAction = 'assign';
          state.error = null;
        });
        
        try {
          // Appel API pour retirer les cours
          const updatedEmployee = await employeeService.removeCoursesFromEmployee(employeeId, courseIds);
          
          console.log('✅ Cours retirés avec succès');
          console.log('👤 Employé mis à jour:', updatedEmployee);
          
          // Convertir la réponse API vers le format frontend
          const frontendEmployee = convertEmployeeFromApi(updatedEmployee);
          
          // Mettre à jour l'employé dans le state
          set(state => {
            // Mettre à jour dans allEmployees
            const index = state.allEmployees.findIndex(e => e.id === employeeId);
            if (index !== -1) {
              state.allEmployees[index] = frontendEmployee;
            }
            
            state.loadingAction = null;
          });
          
          // Réappliquer les filtres pour mettre à jour la vue
          get().applyFiltersLocally();
          
          console.log('✅ Store mis à jour après retrait des cours');
          
        } catch (error) {
          console.error('❌ Erreur lors du retrait des cours:', error);
          
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors du retrait des cours de l\'employé',
              code: 'REMOVE_COURSES_ERROR',
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
        
        // Appliquer les filtres localement
        get().applyFiltersLocally();
      },
      
      setSortOptions: (sort: { field: keyof Employee; order: 'asc' | 'desc' }) => {
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
        
        // Appliquer la pagination localement (pas de fetch backend)
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
            type: undefined,
            status: undefined,
            isActive: undefined,
            department: undefined,
            hireYear: undefined
          };
          state.pagination.page = 1;
        });
        
        // Appliquer les filtres réinitialisés localement
        get().applyFiltersLocally();
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
      },
      
      // =====================================================
      // MÉTHODES DE FILTRAGE LOCAL
      // =====================================================
      
      applyFiltersLocally: () => {
        console.log('🔍 Début applyFiltersLocally');
        const state = get();
        const { allEmployees, filters, sortOptions, pagination } = state;
        
        console.log('📊 Données disponibles:', {
          allEmployeesCount: allEmployees?.length || 0,
          filters,
          sortOptions,
          pagination
        });
        
        // Toujours appliquer les filtres sur les données disponibles
        try {
          console.log('🔍 Application des filtres...');
          // Appliquer les filtres sur les données déjà chargées
          const filteredEmployees = get().filterEmployees(allEmployees, filters);
          console.log('✅ Filtrage terminé:', filteredEmployees.length, 'employés');
          
          console.log('🔍 Application du tri...');
          const sortedEmployees = get().sortEmployees(filteredEmployees, sortOptions);
          console.log('✅ Tri terminé');
          
          console.log('🔍 Application de la pagination...');
          const paginatedEmployees = get().paginateEmployees(sortedEmployees, pagination.page, pagination.limit);
          console.log('✅ Pagination terminée:', paginatedEmployees.length, 'employés sur la page');
          
          set(state => {
            state.employees = paginatedEmployees;
            state.pagination.total = filteredEmployees.length;
            state.pagination.totalPages = Math.ceil(filteredEmployees.length / 10); // Utiliser la limite de 10
          });
          
          console.log('🔍 Calcul des statistiques...');
          // Calculer les statistiques sur TOUTES les données, pas seulement les filtrées
          get().calculateStats(allEmployees);
          console.log('✅ Statistiques calculées sur', allEmployees.length, 'employés au total');
          
          console.log('✅ applyFiltersLocally terminé avec succès');
        } catch (error) {
          console.error('❌ Erreur dans applyFiltersLocally:', error);
          throw error;
        }
      },
      
      filterEmployees: (employees: Employee[], filters: EmployeeFilters): Employee[] => {
        return employees.filter(employee => {
          // Recherche textuelle
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const searchableText = [
              employee.firstName,
              employee.lastName,
              employee.email,
              employee.employeeId,
              employee.phone
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) {
              return false;
            }
          }
          
          // Filtre par type
          if (filters.type && employee.type !== filters.type) {
            return false;
          }
          
          // Filtre par statut actif
          if (filters.isActive !== undefined && employee.isActive !== filters.isActive) {
            return false;
          }
          
          // Filtre par statut
          if (filters.status && employee.status !== filters.status) {
            return false;
          }
        });
      },
      
      sortEmployees: (employees: Employee[], sortOptions: { field: keyof Employee; order: 'asc' | 'desc' }): Employee[] => {
        return [...employees].sort((a, b) => {
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
      
      paginateEmployees: (employees: Employee[], page: number, limit: number): Employee[] => {
        const startIndex = (page - 1) * limit;
        return employees.slice(startIndex, startIndex + limit);
      },
      
      calculateStats: (employees: Employee[]) => {
        console.log('📊 Calcul des statistiques pour', employees.length, 'employés');
        console.log('📊 Employés reçus:', employees.map(e => ({ id: e.id, firstName: e.firstName, lastName: e.lastName, isActive: e.isActive, status: e.status })));
        
        const stats: EmployeeStats = {
          total: employees.length,
          active: employees.filter(e => e.isActive).length,
          inactive: employees.filter(e => !e.isActive).length,
          onLeave: employees.filter(e => e.status === 'en_congé').length,
          retired: employees.filter(e => e.status === 'retraité').length,
          byType: employees.reduce((acc, employee) => {
            acc[employee.type] = (acc[employee.type] || 0) + 1;
            return acc;
          }, {} as Record<EmployeeType, number>),
          byStatus: employees.reduce((acc, employee) => {
            acc[employee.status] = (acc[employee.status] || 0) + 1;
            return acc;
          }, {} as Record<EmployeeStatus, number>),
          byDepartment: employees.reduce((acc, employee) => {
            const dept = employee.administrativeInfo?.department || 'Non assigné';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          averageExperience: employees.length > 0 
            ? employees.reduce((sum, employee) => {
                const years = new Date().getFullYear() - new Date(employee.hireDate).getFullYear();
                return sum + years;
              }, 0) / employees.length 
            : 0,
          topProfessors: employees
            .filter(e => e.type === 'professeur' && e.professorInfo)
            .sort((a, b) => (b.professorInfo?.assignedCourses.length || 0) - (a.professorInfo?.assignedCourses.length || 0))
            .slice(0, 5)
            .map(employee => ({
              employeeId: employee.employeeId,
              employeeName: `${employee.firstName} ${employee.lastName}`,
              courseCount: employee.professorInfo?.assignedCourses.length || 0
            }))
        };
        
        console.log('✅ Statistiques finales calculées:', stats);
        
        set(state => {
          state.stats = stats;
        });
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