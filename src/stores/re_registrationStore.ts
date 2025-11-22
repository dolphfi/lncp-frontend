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

import {
  getArchivedData,
  reRegisterOne,
  reRegisterClassroom,
  ArchivedStudentData,
  BulkReRegistrationResponse
} from '../services/reRegistration/reRegistrationService';

// =====================================================
// TYPES POUR LES DONNÉES ARCHIVÉES
// =====================================================

export interface ArchivedStudent {
  archiveId: string;
  archivedAt: string;
  id: string;
  matricule: string;
  userId: string;
  sexe: string;
  dateOfBirth: string;
  lieuDeNaissance: string;
  communeDeNaissance: string;
  handicap: string;
  handicapDetails: string;
  vacation: string;
  niveauEnseignement: string;
  niveauEtude: string;
  nomMere: string;
  prenomMere: string;
  statutMere: string;
  occupationMere: string;
  nomPere: string;
  prenomPere: string;
  statutPere: string;
  occupationPere: string;
  classroomId: string;
  roomId: string;
  personneResponsableId: string;
  adresseAdresseligne1: string | null;
  adresseDepartement: string | null;
  adresseCommune: string | null;
  adresseSectioncommunale: string | null;
  notes: any[];
  moyenneGenerale: number;
  moyenneT1: number;
  moyenneT2: number;
  decision: string;
  ponderationT1: number;
  ponderationT2: number;
  ponderationT3: number;
  ponderationTotale: number;
  status: 'pending' | 'completed' | 'failed';
  
  // Champs calculés ou mappés pour l'UI (optionnels si non présents dans l'API directe mais utiles)
  firstName?: string; 
  lastName?: string;
  classroomName?: string;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================
// (Les fonctions helper peuvent être ajoutées ici si nécessaire)

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface ReRegistrationStore {
  // État
  reRegistrations: ReRegistration[];
  allReRegistrations: ReRegistration[];
  archivedStudents: ArchivedStudent[];
  loading: boolean;
  error: ReRegistrationApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | 'confirm' | 'reject' | 'reregister' | 'bulk-reregister' | null;

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
  fetchArchivedStudents: () => Promise<void>;
  reRegisterStudent: (archivedStudentId: string, newClassroomId?: string, newRoomId?: string) => Promise<void>;
  reRegisterClassroom: (classroomId: string) => Promise<BulkReRegistrationResponse>;
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
      archivedStudents: [],
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
          // TODO: Implémenter un vrai endpoint backend pour lister les réinscriptions
          // Pour l'instant, on retourne une liste vide
          set((state) => {
            state.allReRegistrations = [];
            state.reRegistrations = [];
            state.pagination.total = 0;
            state.pagination.totalPages = 0;
            state.loading = false;
          });

          // Calculer les statistiques
          get().calculateStats();

        } catch (error: any) {
          set((state) => {
            state.error = {
              message: error.message || 'Erreur lors du chargement des réinscriptions',
              code: 'FETCH_ERROR'
            };
            state.loading = false;
          });
        }
      },

      fetchArchivedStudents: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const data = await getArchivedData();
          
          set((state) => {
            // On caste les données car l'API renvoie beaucoup de champs, 
            // et on s'assure que ça correspond à notre interface interne
            state.archivedStudents = data as unknown as ArchivedStudent[];
            state.loading = false;
          });

        } catch (error: any) {
          set((state) => {
            state.error = {
              message: error.message || 'Erreur lors du chargement des données archivées',
              code: 'FETCH_ARCHIVED_ERROR'
            };
            state.loading = false;
          });
          throw error;
        }
      },

      reRegisterStudent: async (archivedStudentId: string, newClassroomId?: string, newRoomId?: string) => {
        set((state) => {
          state.loadingAction = 'reregister';
          state.error = null;
        });

        try {
          const data = newClassroomId && newRoomId ? { newClassroomId, newRoomId } : {};
          await reRegisterOne(archivedStudentId, data);
          
          // Mettre à jour le statut de l'étudiant archivé
          set((state) => {
            const studentIndex = state.archivedStudents.findIndex(s => s.archiveId === archivedStudentId);
            if (studentIndex !== -1) {
              state.archivedStudents[studentIndex].status = 'completed';
            }
            state.loadingAction = null;
          });

        } catch (error: any) {
          set((state) => {
            state.error = {
              message: error.message || 'Erreur lors de la réinscription',
              code: 'REREGISTER_ERROR'
            };
            state.loadingAction = null;
          });
          throw error;
        }
      },

      reRegisterClassroom: async (classroomId: string): Promise<BulkReRegistrationResponse> => {
        set((state) => {
          state.loadingAction = 'bulk-reregister';
          state.error = null;
        });

        try {
          const result = await reRegisterClassroom(classroomId);
          
          // Mettre à jour les statuts des étudiants archivés
          set((state) => {
            result.results.forEach(r => {
              // On cherche par id (qui correspond au studentId dans le résultat bulk)
              const studentIndex = state.archivedStudents.findIndex(s => s.id === r.studentId);
              if (studentIndex !== -1) {
                state.archivedStudents[studentIndex].status = r.status === 'success' ? 'completed' : 'failed';
              }
            });
            state.loadingAction = null;
          });

          return result;

        } catch (error: any) {
          set((state) => {
            state.error = {
              message: error.message || 'Erreur lors de la réinscription en masse',
              code: 'BULK_REREGISTER_ERROR'
            };
            state.loadingAction = null;
          });
          throw error;
        }
      },

      createReRegistration: async (data: CreateReRegistrationDto) => {
        set((state) => {
          state.loadingAction = 'create';
          state.error = null;
        });

        try {
          // TODO: Implémenter un vrai endpoint backend pour créer une réinscription
          throw new Error('Endpoint de création non implémenté. Utilisez la réinscription depuis les archives.');

        } catch (error: any) {
          set((state) => {
            state.error = {
              message: error.message || 'Erreur lors de la création de la réinscription',
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
          // TODO: Implémenter un vrai endpoint backend pour récupérer les années académiques
          // Utiliser l'endpoint du module academicYearService à la place
          set((state) => {
            state.academicYears = [];
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
          // TODO: Implémenter un vrai endpoint backend pour récupérer les frais par classe
          set((state) => {
            state.gradeFees = [];
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