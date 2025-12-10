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
  ONLINE: '/admissions/online-admission',
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

  // Créer une admission en ligne (publique)
  createOnlineAdmission: async (data: CreateOnSiteAdmissionDTO): Promise<Admission> => {
    // L'endpoint attend du JSON avec un mapping spécifique pour l'adresse
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      sexe: data.sexe,
      lieuDeNaissance: data.lieuDeNaissance,
      communeDeNaissance: data.communeDeNaissance,
      
      // Mapping adresses selon spec backend
      adresseAdresseligne1: data.adresseLigne1,
      adresseDepartement: data.departement,
      adresseCommune: data.commune,
      adresseSectioncommunale: data.sectionCommunale,
      
      nomMere: data.nomMere,
      prenomMere: data.prenomMere,
      nomPere: data.nomPere,
      prenomPere: data.prenomPere,
      statutMere: data.statutMere,
      statutPere: data.statutPere,
      occupationMere: data.occupationMere,
      occupationPere: data.occupationPere,
      
      handicap: data.handicap,
      handicapDetails: data.handicapDetails,
      
      responsableFirstName: data.responsableFirstName,
      responsableLastName: data.responsableLastName,
      responsableEmail: data.responsableEmail,
      responsablePhone: data.responsablePhone,
      lienParente: data.lienParente,
      responsableNif: data.responsableNif,
      responsableNinu: data.responsableNinu,
      
      vacation: data.vacation,
      classe: data.classe
    };

    console.log('🚀 [admissionService] Envoi payload admission en ligne:', JSON.stringify(payload, null, 2));

    const response = await http.post(ADMISSION_API.ONLINE, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Récupérer toutes les admissions
  getAllAdmissions: async (): Promise<Admission[]> => {
    const response = await http.get(ADMISSION_API.ALL_ADMISSIONS);
    return response.data;
  },

  // Créer un brouillon
  createDraft: async (data: any): Promise<AdmissionDraft> => {
    const formData = new FormData();
    
    // Champs principaux requis pour le listage
    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName) formData.append('lastName', data.lastName);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.notes) formData.append('notes', data.notes);

    // Le reste des données va dans formData (JSON stringifié)
    // On exclut les fichiers du JSON pour ne pas le surcharger
    const { photoInscription, acteNaissance, bulletinPrecedent, certificatMedical, justificatifDomicile, carteIdentiteParent, ...rest } = data;
    formData.append('formData', JSON.stringify(rest));

    // Fichiers
    if (data.photoInscription instanceof File) formData.append('photoInscription', data.photoInscription);
    if (data.acteNaissance instanceof File) formData.append('acteNaissance', data.acteNaissance);
    if (data.bulletinPrecedent instanceof File) formData.append('bulletinPrecedent', data.bulletinPrecedent);
    if (data.certificatMedical instanceof File) formData.append('certificatMedical', data.certificatMedical);
    if (data.justificatifDomicile instanceof File) formData.append('justificatifDomicile', data.justificatifDomicile);
    if (data.carteIdentiteParent instanceof File) formData.append('carteIdentiteParent', data.carteIdentiteParent);

    const response = await http.post(ADMISSION_API.DRAFTS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  updateDraft: async (draftId: string, data: any): Promise<AdmissionDraft> => {
    const formData = new FormData();
    
    // Champs racines autorisés par le DTO backend
    const rootFields = [
      'firstName', 'lastName', 'email', 'phone', 
      'dateOfBirth', 'lieuDeNaissance', 'communeDeNaissance', 'sexe', 
      'notes', 'status', 'completionPercentage'
    ];
    
    rootFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        formData.append(field, String(data[field]));
      }
    });

    // Le reste des données va dans formData (JSON stringifié), sauf les fichiers
    const fileFields = [
      'photoInscription', 'acteNaissance', 'bulletinPrecedent', 
      'certificatMedical', 'justificatifDomicile', 'carteIdentiteParent'
    ];
    
    // Créer une copie pour le JSON
    const jsonPayload: any = {};
    Object.keys(data).forEach(key => {
       // On exclut les fichiers pour ne pas polluer le JSON
       if (!fileFields.includes(key)) {
         jsonPayload[key] = data[key];
       }
    });
    
    formData.append('formData', JSON.stringify(jsonPayload));

    // Fichiers
    fileFields.forEach(field => {
      if (data[field] instanceof File) {
        formData.append(field, data[field]);
      }
    });

    const response = await http.patch(ADMISSION_API.DRAFT_BY_ID(draftId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
