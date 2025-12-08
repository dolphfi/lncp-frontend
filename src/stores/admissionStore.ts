import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { Admission, CreateOnSiteAdmissionDTO, AdmissionDraft } from '../types/admission';
import { admissionService } from '../services/admissions/admissionService';

interface AdmissionState {
  admissions: Admission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  } | null;
  
  // State pour les brouillons
  drafts: AdmissionDraft[];
  draftsMeta: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  } | null;

  loading: boolean;
  error: string | null;
  loadingAction: 'create' | 'update' | 'delete' | 'finalize' | null;
  
  // Actions Admissions
  fetchAdmissions: () => Promise<void>;
  createOnSiteAdmission: (data: CreateOnSiteAdmissionDTO) => Promise<void>;
  
  // Actions Brouillons
  fetchDrafts: () => Promise<void>;
  createDraft: (data: any) => Promise<void>;
  updateDraft: (draftId: string, data: any) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  finalizeDraft: (draftId: string) => Promise<void>;
  
  clearError: () => void;
}

export const useAdmissionStore = create<AdmissionState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      admissions: [],
      meta: null,
      drafts: [],
      draftsMeta: null,
      loading: false,
      error: null,
      loadingAction: null,

      fetchAdmissions: async () => {
        set({ loading: true, error: null });
        try {
          const response = await admissionService.getAllAdmissions();
          // Gestion de la réponse paginée { data: [], meta: {} } ou tableau direct []
          const data = (response as any).data ? (response as any).data : response;
          const meta = (response as any).meta ? (response as any).meta : null;
          
          set({ 
            admissions: Array.isArray(data) ? data : [], 
            meta: meta,
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Erreur lors du chargement des admissions',
            loading: false 
          });
        }
      },

      createOnSiteAdmission: async (data: CreateOnSiteAdmissionDTO) => {
        set({ loadingAction: 'create', error: null });
        try {
          await admissionService.createOnSiteAdmission(data);
          await get().fetchAdmissions(); // Rafraîchir la liste
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: error.message || 'Erreur lors de la création de l\'admission',
            loadingAction: null 
          });
          throw error;
        }
      },

      // --- ACTIONS BROUILLONS ---

      fetchDrafts: async () => {
        set({ loading: true, error: null });
        try {
          const response = await admissionService.getAllDrafts();
          // Gestion potentielle de la pagination comme pour admissions
          const data = (response as any).data ? (response as any).data : response;
          const meta = (response as any).meta ? (response as any).meta : null;

          set({ 
            drafts: Array.isArray(data) ? data : [],
            draftsMeta: meta,
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Erreur lors du chargement des brouillons',
            loading: false 
          });
        }
      },

      createDraft: async (data: any) => {
        set({ loadingAction: 'create', error: null });
        try {
          await admissionService.createDraft(data);
          await get().fetchDrafts(); // Rafraîchir la liste des brouillons
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: error.message || 'Erreur lors de la sauvegarde du brouillon',
            loadingAction: null 
          });
          throw error;
        }
      },

      updateDraft: async (draftId: string, data: any) => {
        set({ loadingAction: 'update', error: null });
        try {
          await admissionService.updateDraft(draftId, data);
          await get().fetchDrafts(); // Rafraîchir la liste des brouillons
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: error.message || 'Erreur lors de la modification du brouillon',
            loadingAction: null 
          });
          throw error;
        }
      },

      deleteDraft: async (draftId: string) => {
        set({ loadingAction: 'delete', error: null });
        try {
          await admissionService.deleteDraft(draftId);
          // Rafraîchir la liste locale
          set((state) => {
            state.drafts = state.drafts.filter(d => d.id !== draftId);
            state.loadingAction = null;
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Erreur lors de la suppression du brouillon',
            loadingAction: null 
          });
          throw error;
        }
      },

      finalizeDraft: async (draftId: string) => {
        set({ loadingAction: 'finalize', error: null });
        try {
          await admissionService.finalizeDraft(draftId);
          // Après finalisation, le brouillon disparaît et une admission est créée
          // On rafraîchit les deux listes
          await Promise.all([
            get().fetchDrafts(),
            get().fetchAdmissions()
          ]);
          set({ loadingAction: null });
        } catch (error: any) {
           set({ 
            error: error.message || 'Erreur lors de la finalisation du brouillon',
            loadingAction: null 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }))
  )
);
