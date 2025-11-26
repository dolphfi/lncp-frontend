import axios from 'axios';
import { getApiUrl } from '../../config/api';
import authService from '../authService';
import { 
  Admission, 
  AdmissionDraft, 
  CreateOnSiteAdmissionDTO, 
  CreateDraftDTO, 
  UpdateDraftDTO 
} from '../../types/admission';

// Service HTTP avec authentification
const http = axios.create({
  baseURL: getApiUrl(''),
  withCredentials: true
});

// Intercepteur: injecter le token d'auth automatiquement
http.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const ADMISSION_API = {
  ONSITE: '/admissions/onsite',
  ALL_ADMISSIONS: '/admissions/all-admissions',
  DRAFTS: '/admissions/drafts',
  DRAFT_CLEANUP: '/admissions/drafts/cleanup',
  ALL_DRAFTS: '/admissions/all-drafts',
  DRAFTS_USER: (userId: string) => `/admissions/drafts/user/${userId}`,
  DRAFT_BY_ID: (draftId: string) => `/admissions/drafts/draft/${draftId}`,
  DRAFT_FINALIZE: (draftId: string) => `/admissions/drafts/draft/finalize/${draftId}`,
};

export const admissionService = {
  // Créer une admission sur site
  createOnSiteAdmission: async (data: CreateOnSiteAdmissionDTO): Promise<Admission> => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null && !(value instanceof File)) {
        formData.append(key, String(value));
      }
    });

    // Append files
    if (data.photoInscription) formData.append('photoInscription', data.photoInscription);
    if (data.acteNaissance) formData.append('acteNaissance', data.acteNaissance);
    if (data.bulletinPrecedent) formData.append('bulletinPrecedent', data.bulletinPrecedent);
    if (data.certificatMedical) formData.append('certificatMedical', data.certificatMedical);
    if (data.justificatifDomicile) formData.append('justificatifDomicile', data.justificatifDomicile);
    if (data.carteIdentiteParent) formData.append('carteIdentiteParent', data.carteIdentiteParent);

    const response = await http.post(ADMISSION_API.ONSITE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Récupérer toutes les admissions
  getAllAdmissions: async (): Promise<Admission[]> => {
    const response = await http.get(ADMISSION_API.ALL_ADMISSIONS);
    return response.data;
  },

  // Créer un brouillon
  createDraft: async (data: CreateDraftDTO): Promise<AdmissionDraft> => {
    const response = await http.post(ADMISSION_API.DRAFTS, data);
    return response.data;
  },

  // Nettoyer les brouillons expirés
  cleanupDrafts: async (): Promise<{ message: string, deletedCount: number }> => {
    const response = await http.post(ADMISSION_API.DRAFT_CLEANUP);
    return response.data;
  },

  // Récupérer tous les brouillons (Admin)
  getAllDrafts: async (): Promise<AdmissionDraft[]> => {
    const response = await http.get(ADMISSION_API.ALL_DRAFTS);
    return response.data;
  },

  // Récupérer les brouillons d'un utilisateur
  getUserDrafts: async (userId: string): Promise<AdmissionDraft[]> => {
    const response = await http.get(ADMISSION_API.DRAFTS_USER(userId));
    return response.data;
  },

  // Récupérer un brouillon spécifique
  getDraftById: async (draftId: string): Promise<AdmissionDraft> => {
    const response = await http.get(ADMISSION_API.DRAFT_BY_ID(draftId));
    return response.data;
  },

  // Mettre à jour un brouillon
  updateDraft: async (draftId: string, data: UpdateDraftDTO): Promise<AdmissionDraft> => {
    // Si on a des fichiers (dans data.files qui devrait être géré avant appel si multipart, 
    // mais l'endpoint accepte aussi JSON avec base64. Ici on va supporter JSON pour simplifier 
    // si pas de fichier File natif, sinon multipart).
    // Pour simplifier, on envoie en JSON comme le backend le supporte (flexible).
    // Note: Si vous devez envoyer des fichiers binaires, il faudrait utiliser FormData ici aussi.
    
    const response = await http.patch(ADMISSION_API.DRAFT_BY_ID(draftId), data);
    return response.data;
  },

  // Supprimer un brouillon
  deleteDraft: async (draftId: string): Promise<void> => {
    await http.delete(ADMISSION_API.DRAFT_BY_ID(draftId));
  },

  // Finaliser un brouillon
  finalizeDraft: async (draftId: string): Promise<void> => {
    await http.post(ADMISSION_API.DRAFT_FINALIZE(draftId));
  }
};
