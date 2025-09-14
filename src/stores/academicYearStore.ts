import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { academicYearService, AcademicYear, CreateAcademicYearDTO, UpdateAcademicYearDTO, StatutAnneeAcademique } from '../services/academicYearService';

interface AcademicYearState {
  // État
  academicYears: AcademicYear[];
  currentAcademicYear: AcademicYear | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchAllAcademicYears: () => Promise<void>;
  fetchCurrentAcademicYear: () => Promise<void>;
  createAcademicYear: (data: CreateAcademicYearDTO) => Promise<AcademicYear>;
  updateAcademicYear: (id: string, data: UpdateAcademicYearDTO) => Promise<AcademicYear>;
  setAcademicYearAsCurrent: (id: string) => Promise<void>;
  getAcademicYearById: (id: string) => Promise<AcademicYear>;
  setCurrentAcademicYear: (academicYear: AcademicYear) => void;
  clearError: () => void;
}

export const useAcademicYearStore = create<AcademicYearState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // État initial
      academicYears: [],
      currentAcademicYear: null,
      loading: false,
      error: null,

      // Récupérer toutes les années académiques
      fetchAllAcademicYears: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const academicYears = await academicYearService.getAllAcademicYears();
          set(state => {
            state.academicYears = academicYears;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Erreur lors du chargement des années académiques';
            state.loading = false;
          });
        }
      },

      // Récupérer l'année académique courante
      fetchCurrentAcademicYear: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const currentAcademicYear = await academicYearService.getCurrentAcademicYear();
          set(state => {
            state.currentAcademicYear = currentAcademicYear;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Erreur lors du chargement de l\'année académique courante';
            state.loading = false;
          });
        }
      },

      // Créer une nouvelle année académique
      createAcademicYear: async (data: CreateAcademicYearDTO) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const newAcademicYear = await academicYearService.createAcademicYear(data);
          set(state => {
            state.academicYears = [newAcademicYear, ...state.academicYears];
            state.loading = false;
          });
          return newAcademicYear;
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Erreur lors de la création de l\'année académique';
            state.loading = false;
          });
          throw error;
        }
      },

      // Récupérer une année académique par ID
      getAcademicYearById: async (id: string) => {
        try {
          const academicYear = await academicYearService.getAcademicYearById(id);
          return academicYear;
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Erreur lors du chargement de l\'année académique';
          });
          throw error;
        }
      },

      // Mettre à jour une année académique
      updateAcademicYear: async (id: string, data: UpdateAcademicYearDTO) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const updatedAcademicYear = await academicYearService.updateAcademicYear(id, data);
          set(state => {
            const index = state.academicYears.findIndex(year => year.id === id);
            if (index !== -1) {
              state.academicYears[index] = updatedAcademicYear;
            }
            state.loading = false;
          });
          return updatedAcademicYear;
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Erreur lors de la mise à jour de l\'année académique';
            state.loading = false;
          });
          throw error;
        }
      },

      // Définir une année académique comme courante
      setAcademicYearAsCurrent: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Mettre à jour le statut vers "En cours"
          const updatedYear = await academicYearService.updateAcademicYear(id, {
            statut: StatutAnneeAcademique.EN_COURS
          });

          set(state => {
            // Mettre à jour la liste des années
            const index = state.academicYears.findIndex(year => year.id === id);
            if (index !== -1) {
              state.academicYears[index] = { ...updatedYear, isCurrent: true };
            }

            // Marquer les autres années comme non courantes
            state.academicYears.forEach(year => {
              if (year.id !== id) {
                year.isCurrent = false;
              }
            });

            // Définir comme année courante
            state.currentAcademicYear = { ...updatedYear, isCurrent: true };
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Erreur lors de la définition de l\'année courante';
            state.loading = false;
          });
          throw error;
        }
      },

      // Définir l'année académique courante (local seulement)
      setCurrentAcademicYear: (academicYear: AcademicYear) => {
        set(state => {
          state.currentAcademicYear = academicYear;
        });
      },

      // Effacer l'erreur
      clearError: () => {
        set(state => {
          state.error = null;
        });
      }
    }))
  )
);
