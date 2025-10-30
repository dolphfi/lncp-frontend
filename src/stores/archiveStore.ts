/**
 * =====================================================
 * STORE ZUSTAND POUR LE MODULE ARCHIVES
 * =====================================================
 * Gère l'état global des archives des années académiques
 * avec les middleware immer et subscribeWithSelector
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  ArchivedYear,
  ArchivedData,
  ArchiveStats,
  ArchiveDataType,
  CreateArchiveDto,
  RestoreArchiveDto,
  ArchiveYearResponse,
  ArchiveProcessStatus,
  StudentArchiveHistory,
} from '../types/archive';
import * as archiveService from '../services/archives/archiveService';

/**
 * Interface de l'état du store archives
 */
interface ArchiveState {
  // Données
  archivedYears: ArchivedYear[];           // Liste de toutes les années archivées
  selectedYear: ArchivedYear | null;       // Année sélectionnée
  archivedData: Record<ArchiveDataType, any[]>; // Données archivées par type
  stats: ArchiveStats | null;              // Statistiques globales
  
  // États de chargement
  loading: boolean;                        // Chargement global
  loadingData: boolean;                    // Chargement des données
  loadingStats: boolean;                   // Chargement des statistiques
  
  // Gestion des erreurs
  error: string | null;                    // Message d'erreur
  
  // Actions - Récupération des données
  fetchArchivedYears: () => Promise<void>;
  fetchArchivedYearById: (yearId: string) => Promise<void>;
  fetchArchiveStats: () => Promise<void>;
  fetchArchivedData: (yearId: string, dataType: ArchiveDataType) => Promise<void>;
  
  // Actions - Gestion des archives
  createArchive: (data: CreateArchiveDto) => Promise<void>;
  archiveAcademicYear: (yearId: string) => Promise<ArchiveYearResponse>;
  restoreArchive: (data: RestoreArchiveDto) => Promise<void>;
  deleteArchive: (yearId: string) => Promise<void>;
  downloadArchive: (yearId: string) => Promise<void>;
  exportData: (yearId: string, dataType: ArchiveDataType, format: 'pdf' | 'excel' | 'csv') => Promise<void>;
  
  // Actions - Nouveaux endpoints
  getArchiveStatus: () => Promise<ArchiveProcessStatus>;
  getStudentHistory: (matricule: string) => Promise<StudentArchiveHistory>;
  
  // Actions - État local
  setSelectedYear: (year: ArchivedYear | null) => void;
  clearArchivedData: () => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * État initial du store
 */
const initialState = {
  archivedYears: [],
  selectedYear: null,
  archivedData: {
    students: [],
    employees: [],
    courses: [],
    payments: [],
    grades: [],
    attendance: [],
    bulletins: [],
  } as Record<ArchiveDataType, any[]>,
  stats: null,
  loading: false,
  loadingData: false,
  loadingStats: false,
  error: null,
};

/**
 * =====================================================
 * STORE ARCHIVES
 * =====================================================
 */
export const useArchiveStore = create<ArchiveState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      /**
       * Récupère toutes les années archivées
       */
      fetchArchivedYears: async () => {
        set({ loading: true, error: null });
        try {
          const years = await archiveService.getAllArchivedYears();
          set({ archivedYears: years, loading: false });
          
          // Log pour le debug
          console.log(`✅ [Store Archives] ${years.length} archive(s) chargée(s)`);
        } catch (error: any) {
          // Améliorer le message d'erreur pour les erreurs d'authentification
          let errorMessage = error.message;
          if (error.response?.status === 401) {
            errorMessage = 'Unauthorized - Accès refusé. Vérifiez vos permissions.';
          }
          
          console.error('❌ [Store Archives] Erreur:', errorMessage);
          set({ error: errorMessage, loading: false });
          
          // Ne pas lancer l'erreur si c'est juste qu'il n'y a pas d'archives
          if (!errorMessage.includes('Impossible de charger')) {
            throw error;
          }
        }
      },

      /**
       * Récupère une année archivée par ID
       */
      fetchArchivedYearById: async (yearId: string) => {
        set({ loading: true, error: null });
        try {
          const year = await archiveService.getArchivedYearById(yearId);
          set({ selectedYear: year, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      /**
       * Récupère les statistiques globales
       */
      fetchArchiveStats: async () => {
        set({ loadingStats: true, error: null });
        try {
          const stats = await archiveService.getArchiveStats();
          set({ stats, loadingStats: false });
        } catch (error: any) {
          set({ error: error.message, loadingStats: false });
          throw error;
        }
      },

      /**
       * Récupère les données archivées pour un type spécifique
       */
      fetchArchivedData: async (yearId: string, dataType: ArchiveDataType) => {
        set({ loadingData: true, error: null });
        try {
          const result = await archiveService.getArchivedData(yearId, dataType);
          set((state) => {
            state.archivedData[dataType] = result.data;
            state.loadingData = false;
          });
        } catch (error: any) {
          set({ error: error.message, loadingData: false });
          throw error;
        }
      },

      /**
       * Crée une nouvelle archive
       */
      createArchive: async (data: CreateArchiveDto) => {
        set({ loading: true, error: null });
        try {
          const newArchive = await archiveService.createArchive(data);
          set((state) => {
            state.archivedYears.unshift(newArchive);
            state.loading = false;
          });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      /**
       * Archive une année académique spécifique
       */
      archiveAcademicYear: async (yearId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await archiveService.archiveAcademicYear(yearId);
          set({ loading: false });
          // Rafraîchir la liste des archives après l'archivage
          await get().fetchArchivedYears();
          return response;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      /**
       * Restaure une archive
       */
      restoreArchive: async (data: RestoreArchiveDto) => {
        set({ loading: true, error: null });
        try {
          await archiveService.restoreArchive(data);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      /**
       * Supprime une archive
       */
      deleteArchive: async (yearId: string) => {
        set({ loading: true, error: null });
        try {
          await archiveService.deleteArchive(yearId);
          set((state) => {
            state.archivedYears = state.archivedYears.filter(y => y.id !== yearId);
            if (state.selectedYear?.id === yearId) {
              state.selectedYear = null;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      /**
       * Télécharge une archive complète
       */
      downloadArchive: async (yearId: string) => {
        set({ loading: true, error: null });
        try {
          const blob = await archiveService.downloadArchive(yearId);
          
          // Créer un lien de téléchargement
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `archive_${yearId}_${new Date().getTime()}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      /**
       * Exporte des données archivées
       */
      exportData: async (
        yearId: string,
        dataType: ArchiveDataType,
        format: 'pdf' | 'excel' | 'csv'
      ) => {
        set({ loading: true, error: null });
        try {
          const blob = await archiveService.exportArchivedData(yearId, dataType, format);
          
          // Extensions de fichiers selon le format
          const extensions: Record<string, string> = {
            pdf: 'pdf',
            excel: 'xlsx',
            csv: 'csv',
          };
          
          // Créer un lien de téléchargement
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${dataType}_${yearId}.${extensions[format]}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      /**
       * Obtient le statut du processus d'archivage
       */
      getArchiveStatus: async () => {
        try {
          const status = await archiveService.getArchiveStatus();
          return status;
        } catch (error: any) {
          console.error('Erreur lors de la récupération du statut:', error);
          throw error;
        }
      },

      /**
       * Obtient l'historique complet d'un étudiant
       */
      getStudentHistory: async (matricule: string) => {
        set({ loading: true, error: null });
        try {
          const history = await archiveService.getStudentArchiveHistory(matricule);
          set({ loading: false });
          return history;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      /**
       * Sélectionne une année archivée
       */
      setSelectedYear: (year: ArchivedYear | null) => {
        set({ selectedYear: year });
        // Réinitialiser les données si on change d'année
        if (year) {
          set({ archivedData: initialState.archivedData });
        }
      },

      /**
       * Efface les données archivées en cache
       */
      clearArchivedData: () => {
        set({ archivedData: initialState.archivedData });
      },

      /**
       * Efface les erreurs
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Réinitialise le store
       */
      reset: () => {
        set(initialState);
      },
    }))
  )
);

/**
 * Sélecteurs personnalisés pour faciliter l'accès aux données
 */
export const useArchivedYears = () => useArchiveStore((state) => state.archivedYears);
export const useSelectedYear = () => useArchiveStore((state) => state.selectedYear);
export const useArchiveStats = () => useArchiveStore((state) => state.stats);
export const useArchiveLoading = () => useArchiveStore((state) => state.loading);
export const useArchiveError = () => useArchiveStore((state) => state.error);
