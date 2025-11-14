/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES RÉINSCRIPTIONS
 * =====================================================
 * Ce store centralise toute la logique de gestion d'état
 * pour les réinscriptions avec Zustand
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import {
  ReRegistration,
  ReRegistrationFilters,
  ReRegistrationPaginationOptions,
  ReRegistrationStats,
  ReRegistrationApiError,
  CreateReRegistrationDto,
  UpdateReRegistrationDto,
  AcademicYear,
  GradeFees
} from '../types/re_registration';

// =====================================================
// DONNÉES MOCK POUR LE DÉVELOPPEMENT
// =====================================================

// Mock des années scolaires
const mockAcademicYears: AcademicYear[] = [
  {
    id: '1',
    year: '2024-2025',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    isActive: true,
    registrationStartDate: '2024-06-01',
    registrationEndDate: '2024-08-31'
  },
  {
    id: '2',
    year: '2025-2026',
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    isActive: false,
    registrationStartDate: '2025-06-01',
    registrationEndDate: '2025-08-31'
  }
];

// Mock des frais par classe
const mockGradeFees: GradeFees[] = [
  { grade: 'NSI', amount: 15000, currency: 'HTG' },
  { grade: 'NSII', amount: 16000, currency: 'HTG' },
  { grade: 'NSIII', amount: 17000, currency: 'HTG' },
  { grade: 'NSIV', amount: 18000, currency: 'HTG' },
  { grade: 'Philo', amount: 19000, currency: 'HTG' },
  { grade: 'Rhéto', amount: 20000, currency: 'HTG' }
];

// Mock des réinscriptions
const mockReRegistrations: ReRegistration[] = [
  {
    id: '1',
    studentId: 'student-1',
    student: {
      id: 'student-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      gender: 'male',
      dateOfBirth: '2008-05-15',
      placeOfBirth: 'Port-au-Prince',
      email: 'jean.dupont@email.com',
      ninthGradeOrderNumber: '2023001',
      level: 'secondaire',
      grade: 'NSI',
      roomId: 'room-1',
      roomName: 'Salle A',
      enrollmentDate: '2023-09-01',
      studentId: 'STU2023001',
      parentContact: {
        responsiblePerson: 'Marie Dupont',
        phone: '+509 3456-7890',
        relationship: 'Mère'
      },
      status: 'active',
      createdAt: '2023-09-01T08:00:00Z',
      updatedAt: '2023-09-01T08:00:00Z'
    },
    academicYear: '2024-2025',
    currentGrade: 'NSI',
    newGrade: 'NSII',
    currentRoomId: 'room-1',
    newRoomId: 'room-2',
    newRoomName: 'Salle B',
    registrationDecision: 'grade_promotion',
    status: 'confirmed',
    registrationDate: '2024-06-15T10:00:00Z',
    confirmationDate: '2024-06-20T14:30:00Z',
    fees: {
      amount: 16000,
      currency: 'HTG',
      isPaid: true,
      paymentDate: '2024-06-22T09:00:00Z',
      paymentMethod: 'Virement bancaire'
    },
    documents: {
      reportCard: true,
      parentAuthorization: true,
      medicalCertificate: true,
      photos: true
    },
    createdBy: 'admin-1',
    createdAt: '2024-06-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z'
  },
  {
    id: '2',
    studentId: 'student-2',
    student: {
      id: 'student-2',
      firstName: 'Marie',
      lastName: 'Martin',
      gender: 'female',
      dateOfBirth: '2007-08-22',
      placeOfBirth: 'Cap-Haïtien',
      email: 'marie.martin@email.com',
      ninthGradeOrderNumber: '2022045',
      level: 'secondaire',
      grade: 'NSII',
      roomId: 'room-2',
      roomName: 'Salle B',
      enrollmentDate: '2022-09-01',
      studentId: 'STU2022045',
      parentContact: {
        responsiblePerson: 'Pierre Martin',
        phone: '+509 2345-6789',
        relationship: 'Père'
      },
      status: 'active',
      createdAt: '2022-09-01T08:00:00Z',
      updatedAt: '2022-09-01T08:00:00Z'
    },
    academicYear: '2024-2025',
    currentGrade: 'NSII',
    newGrade: 'NSIII',
    currentRoomId: 'room-2',
    newRoomId: 'room-3',
    newRoomName: 'Salle C',
    registrationDecision: 'grade_promotion',
    status: 'pending',
    registrationDate: '2024-07-01T11:30:00Z',
    fees: {
      amount: 17000,
      currency: 'HTG',
      isPaid: false
    },
    documents: {
      reportCard: true,
      parentAuthorization: true,
      medicalCertificate: false,
      photos: true
    },
    createdBy: 'admin-2',
    createdAt: '2024-07-01T11:30:00Z',
    updatedAt: '2024-07-01T11:30:00Z'
  },
  {
    id: '3',
    studentId: 'student-3',
    student: {
      id: 'student-3',
      firstName: 'Paul',
      lastName: 'Pierre',
      gender: 'male',
      dateOfBirth: '2006-12-10',
      placeOfBirth: 'Gonaïves',
      email: 'paul.pierre@email.com',
      ninthGradeOrderNumber: '2021078',
      level: 'secondaire',
      grade: 'NSIII',
      roomId: 'room-3',
      roomName: 'Salle C',
      enrollmentDate: '2021-09-01',
      studentId: 'STU2021078',
      parentContact: {
        responsiblePerson: 'Anne Pierre',
        phone: '+509 4567-8901',
        relationship: 'Mère'
      },
      status: 'active',
      createdAt: '2021-09-01T08:00:00Z',
      updatedAt: '2021-09-01T08:00:00Z'
    },
    academicYear: '2024-2025',
    currentGrade: 'NSIII',
    newGrade: 'NSIII',
    currentRoomId: 'room-3',
    newRoomId: 'room-3',
    newRoomName: 'Salle C',
    registrationDecision: 'grade_repeat',
    status: 'rejected',
    registrationDate: '2024-06-30T16:00:00Z',
    rejectionReason: 'Résultats insuffisants pour passer en classe supérieure',
    fees: {
      amount: 17000,
      currency: 'HTG',
      isPaid: false
    },
    documents: {
      reportCard: true,
      parentAuthorization: false,
      medicalCertificate: true,
      photos: false
    },
    createdBy: 'admin-1',
    updatedBy: 'admin-2',
    createdAt: '2024-06-30T16:00:00Z',
    updatedAt: '2024-07-05T10:15:00Z'
  }
];

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface ReRegistrationStore {
  // État
  reRegistrations: ReRegistration[];
  allReRegistrations: ReRegistration[];
  loading: boolean;
  error: ReRegistrationApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | 'confirm' | 'reject' | null;

  // Données de référence
  academicYears: AcademicYear[];
  gradeFees: GradeFees[];

  // Filtres et pagination
  filters: ReRegistrationFilters;
  pagination: ReRegistrationPaginationOptions;
  sortOptions: { field: string; order: 'asc' | 'desc' };

  // Statistiques
  stats: ReRegistrationStats | null;

  // Actions principales
  fetchReRegistrations: () => Promise<void>;
  createReRegistration: (data: CreateReRegistrationDto) => Promise<void>;
  updateReRegistration: (data: UpdateReRegistrationDto) => Promise<void>;
  deleteReRegistration: (id: string) => Promise<void>;
  confirmReRegistration: (id: string, notes?: string) => Promise<void>;
  rejectReRegistration: (id: string, reason: string) => Promise<void>;

  // Actions de données de référence
  fetchAcademicYears: () => Promise<void>;
  fetchGradeFees: () => Promise<void>;

  // Actions de filtrage et tri
  setFilters: (filters: Partial<ReRegistrationFilters>) => void;
  clearFilters: () => void;
  setSort: (field: string, order: 'asc' | 'desc') => void;
  changePage: (page: number) => void;

  // Actions utilitaires
  clearError: () => void;
  calculateStats: () => void;
  getReRegistrationById: (id: string) => ReRegistration | undefined;
  getReRegistrationsByStudent: (studentId: string) => ReRegistration[];
}

// =====================================================
// CRÉATION DU STORE
// =====================================================
export const useReRegistrationStore = create<ReRegistrationStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // État initial
      reRegistrations: [],
      allReRegistrations: [],
      loading: false,
      error: null,
      loadingAction: null,

      // Données de référence
      academicYears: [],
      gradeFees: [],

      // Filtres et pagination
      filters: {},
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      sortOptions: { field: 'registrationDate', order: 'desc' },

      // Statistiques
      stats: null,

      // =====================================================
      // ACTIONS PRINCIPALES
      // =====================================================

      fetchReRegistrations: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 1000));

          set((state) => {
            state.allReRegistrations = mockReRegistrations;
            state.reRegistrations = mockReRegistrations;
            state.pagination.total = mockReRegistrations.length;
            state.pagination.totalPages = Math.ceil(mockReRegistrations.length / state.pagination.limit);
            state.loading = false;
          });

          // Calculer les statistiques
          get().calculateStats();

        } catch (error) {
          set((state) => {
            state.error = {
              message: 'Erreur lors du chargement des réinscriptions',
              code: 'FETCH_ERROR'
            };
            state.loading = false;
          });
        }
      },

      createReRegistration: async (data: CreateReRegistrationDto) => {
        set((state) => {
          state.loadingAction = 'create';
          state.error = null;
        });

        try {
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 1500));

          const newReRegistration: ReRegistration = {
            id: `re-reg-${Date.now()}`,
            ...data,
            student: mockReRegistrations[0].student, // Mock student data
            currentGrade: data.newGrade, // Simplified for mock
            status: 'pending',
            registrationDate: new Date().toISOString(),
            fees: {
              ...data.fees,
              isPaid: false
            },
            createdBy: 'current-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          set((state) => {
            state.allReRegistrations.push(newReRegistration);
            state.reRegistrations.push(newReRegistration);
            state.pagination.total += 1;
            state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
            state.loadingAction = null;
          });

          get().calculateStats();

        } catch (error) {
          set((state) => {
            state.error = {
              message: 'Erreur lors de la création de la réinscription',
              code: 'CREATE_ERROR'
            };
            state.loadingAction = null;
          });
        }
      },

      updateReRegistration: async (data: UpdateReRegistrationDto) => {
        set((state) => {
          state.loadingAction = 'update';
          state.error = null;
        });

        try {
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 1000));

          set((state) => {
            const index = state.allReRegistrations.findIndex(r => r.id === data.id);
            if (index !== -1) {
              // Mise à jour sélective des champs
              const existingReRegistration = state.allReRegistrations[index];
              if (data.newGrade) existingReRegistration.newGrade = data.newGrade;
              if (data.newRoomId) existingReRegistration.newRoomId = data.newRoomId;
              if (data.status) existingReRegistration.status = data.status;
              if (data.rejectionReason) existingReRegistration.rejectionReason = data.rejectionReason;
              if (data.notes) existingReRegistration.notes = data.notes;
              if (data.fees) {
                if (data.fees.amount !== undefined) existingReRegistration.fees.amount = data.fees.amount;
                if (data.fees.currency) existingReRegistration.fees.currency = data.fees.currency;
                if (data.fees.isPaid !== undefined) existingReRegistration.fees.isPaid = data.fees.isPaid;
                if (data.fees.paymentDate) existingReRegistration.fees.paymentDate = data.fees.paymentDate;
                if (data.fees.paymentMethod) existingReRegistration.fees.paymentMethod = data.fees.paymentMethod;
              }
              if (data.documents) {
                if (data.documents.reportCard !== undefined) existingReRegistration.documents.reportCard = data.documents.reportCard;
                if (data.documents.parentAuthorization !== undefined) existingReRegistration.documents.parentAuthorization = data.documents.parentAuthorization;
                if (data.documents.medicalCertificate !== undefined) existingReRegistration.documents.medicalCertificate = data.documents.medicalCertificate;
                if (data.documents.photos !== undefined) existingReRegistration.documents.photos = data.documents.photos;
              }
              existingReRegistration.updatedAt = new Date().toISOString();

              const currentIndex = state.reRegistrations.findIndex(r => r.id === data.id);
              if (currentIndex !== -1) {
                state.reRegistrations[currentIndex] = existingReRegistration;
              }
            }
            state.loadingAction = null;
          });

          get().calculateStats();

        } catch (error) {
          set((state) => {
            state.error = {
              message: 'Erreur lors de la mise à jour de la réinscription',
              code: 'UPDATE_ERROR'
            };
            state.loadingAction = null;
          });
        }
      },

      deleteReRegistration: async (id: string) => {
        set((state) => {
          state.loadingAction = 'delete';
          state.error = null;
        });

        try {
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 800));

          set((state) => {
            state.allReRegistrations = state.allReRegistrations.filter(r => r.id !== id);
            state.reRegistrations = state.reRegistrations.filter(r => r.id !== id);
            state.pagination.total -= 1;
            state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
            state.loadingAction = null;
          });

          get().calculateStats();

        } catch (error) {
          set((state) => {
            state.error = {
              message: 'Erreur lors de la suppression de la réinscription',
              code: 'DELETE_ERROR'
            };
            state.loadingAction = null;
          });
        }
      },

      confirmReRegistration: async (id: string, notes?: string) => {
        set((state) => {
          state.loadingAction = 'confirm';
          state.error = null;
        });

        try {
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 1000));

          set((state) => {
            const index = state.allReRegistrations.findIndex(r => r.id === id);
            if (index !== -1) {
              state.allReRegistrations[index].status = 'confirmed';
              state.allReRegistrations[index].confirmationDate = new Date().toISOString();
              if (notes) {
                state.allReRegistrations[index].notes = notes;
              }
              state.allReRegistrations[index].updatedAt = new Date().toISOString();

              const currentIndex = state.reRegistrations.findIndex(r => r.id === id);
              if (currentIndex !== -1) {
                state.reRegistrations[currentIndex] = state.allReRegistrations[index];
              }
            }
            state.loadingAction = null;
          });

          get().calculateStats();

        } catch (error) {
          set((state) => {
            state.error = {
              message: 'Erreur lors de la confirmation de la réinscription',
              code: 'CONFIRM_ERROR'
            };
            state.loadingAction = null;
          });
        }
      },

      rejectReRegistration: async (id: string, reason: string) => {
        set((state) => {
          state.loadingAction = 'reject';
          state.error = null;
        });

        try {
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 1000));

          set((state) => {
            const index = state.allReRegistrations.findIndex(r => r.id === id);
            if (index !== -1) {
              state.allReRegistrations[index].status = 'rejected';
              state.allReRegistrations[index].rejectionReason = reason;
              state.allReRegistrations[index].updatedAt = new Date().toISOString();

              const currentIndex = state.reRegistrations.findIndex(r => r.id === id);
              if (currentIndex !== -1) {
                state.reRegistrations[currentIndex] = state.allReRegistrations[index];
              }
            }
            state.loadingAction = null;
          });

          get().calculateStats();

        } catch (error) {
          set((state) => {
            state.error = {
              message: 'Erreur lors du rejet de la réinscription',
              code: 'REJECT_ERROR'
            };
            state.loadingAction = null;
          });
        }
      },

      // =====================================================
      // ACTIONS DE DONNÉES DE RÉFÉRENCE
      // =====================================================

      fetchAcademicYears: async () => {
        try {
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 500));

          set((state) => {
            state.academicYears = mockAcademicYears;
          });

        } catch (error) {
          set((state) => {
            state.error = {
              message: 'Erreur lors du chargement des années scolaires',
              code: 'FETCH_ACADEMIC_YEARS_ERROR'
            };
          });
        }
      },

      fetchGradeFees: async () => {
        try {
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 500));

          set((state) => {
            state.gradeFees = mockGradeFees;
          });

        } catch (error) {
          set((state) => {
            state.error = {
              message: 'Erreur lors du chargement des frais par classe',
              code: 'FETCH_GRADE_FEES_ERROR'
            };
          });
        }
      },

      // =====================================================
      // ACTIONS DE FILTRAGE ET TRI
      // =====================================================

      setFilters: (newFilters: Partial<ReRegistrationFilters>) => {
        set((state) => {
          state.filters = { ...state.filters, ...newFilters };
          state.pagination.page = 1; // Reset à la première page
        });

        // Appliquer les filtres
        // TODO: Implémenter la logique de filtrage
      },

      clearFilters: () => {
        set((state) => {
          state.filters = {};
          state.pagination.page = 1;
          state.reRegistrations = state.allReRegistrations;
        });
      },

      setSort: (field: string, order: 'asc' | 'desc') => {
        set((state) => {
          state.sortOptions = { field, order };
        });

        // Appliquer le tri
        // TODO: Implémenter la logique de tri
      },

      changePage: (page: number) => {
        set((state) => {
          state.pagination.page = page;
        });

        // Recharger les données pour la nouvelle page
        // TODO: Implémenter la pagination côté serveur
      },

      // =====================================================
      // ACTIONS UTILITAIRES
      // =====================================================

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      calculateStats: () => {
        const { allReRegistrations } = get();

        const stats: ReRegistrationStats = {
          total: allReRegistrations.length,
          pending: allReRegistrations.filter(r => r.status === 'pending').length,
          confirmed: allReRegistrations.filter(r => r.status === 'confirmed').length,
          rejected: allReRegistrations.filter(r => r.status === 'rejected').length,
          cancelled: allReRegistrations.filter(r => r.status === 'cancelled').length,
          totalFees: allReRegistrations.reduce((sum, r) => sum + r.fees.amount, 0),
          paidFees: allReRegistrations.filter(r => r.fees.isPaid).reduce((sum, r) => sum + r.fees.amount, 0),
          unpaidFees: allReRegistrations.filter(r => !r.fees.isPaid).reduce((sum, r) => sum + r.fees.amount, 0),
          byRegistrationType: {
            same_grade: allReRegistrations.filter(r => r.registrationDecision === 'same_grade').length,
            grade_promotion: allReRegistrations.filter(r => r.registrationDecision === 'grade_promotion').length,
            grade_repeat: allReRegistrations.filter(r => r.registrationDecision === 'grade_repeat').length
          },
          byGrade: allReRegistrations.reduce((acc, r) => {
            acc[r.newGrade] = (acc[r.newGrade] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          documentsCompletion: {
            reportCard: Math.round((allReRegistrations.filter(r => r.documents.reportCard).length / allReRegistrations.length) * 100),
            parentAuthorization: Math.round((allReRegistrations.filter(r => r.documents.parentAuthorization).length / allReRegistrations.length) * 100),
            medicalCertificate: Math.round((allReRegistrations.filter(r => r.documents.medicalCertificate).length / allReRegistrations.length) * 100),
            photos: Math.round((allReRegistrations.filter(r => r.documents.photos).length / allReRegistrations.length) * 100)
          }
        };

        set((state) => {
          state.stats = stats;
        });
      },

      getReRegistrationById: (id: string) => {
        return get().allReRegistrations.find(r => r.id === id);
      },

      getReRegistrationsByStudent: (studentId: string) => {
        return get().allReRegistrations.filter(r => r.studentId === studentId);
      }
    }))
  )
);

// =====================================================
// SÉLECTEURS UTILES
// =====================================================

// Sélecteur pour les réinscriptions en attente
export const selectPendingReRegistrations = (state: ReRegistrationStore) =>
  state.reRegistrations.filter(r => r.status === 'pending');

// Sélecteur pour les réinscriptions confirmées
export const selectConfirmedReRegistrations = (state: ReRegistrationStore) =>
  state.reRegistrations.filter(r => r.status === 'confirmed');

// Sélecteur pour les réinscriptions avec paiement en attente
export const selectUnpaidReRegistrations = (state: ReRegistrationStore) =>
  state.reRegistrations.filter(r => !r.fees.isPaid && r.status === 'confirmed');