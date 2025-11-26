import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { Admission, CreateOnSiteAdmissionDTO } from '../types/admission';
import { admissionService } from '../services/admissions/admissionService';

interface AdmissionState {
  admissions: Admission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  } | null;
  loading: boolean;
  error: string | null;
  loadingAction: 'create' | 'update' | 'delete' | null;
  
  // Actions
  fetchAdmissions: () => Promise<void>;
  createOnSiteAdmission: (data: CreateOnSiteAdmissionDTO) => Promise<void>;
  // Autres actions à venir...
  
  clearError: () => void;
}

export const useAdmissionStore = create<AdmissionState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      admissions: [],
      meta: null,
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

      clearError: () => set({ error: null }),
    }))
  )
);
