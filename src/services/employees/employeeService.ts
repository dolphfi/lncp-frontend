/**
 * =====================================================
 * SERVICE API POUR LA GESTION DES EMPLOYÉS
 * =====================================================
 */

import axios from 'axios';
import { getApiUrl } from '../../config/api';
import authService from '../authService';

// Types pour l'API backend
export type BackendUserRole = 
  | 'SUPER_ADMIN' | 'ADMIN' | 'DIRECTOR' | 'CENSORED' 
  | 'COMPTABLE' | 'SUPPLEANT' | 'TEACHER' | 'SECRETARY' 
  | 'STUDENT' | 'PARENT' | 'USER';

export interface BackendAddress {
  adresseLigne1: string;
  departement: string;
  commune: string;
  sectionCommunale: string;
}

export interface CreateEmployeeApiPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sexe: string;
  avatar?: string;
  handicap?: boolean;
  hireDate: string;
  dateOfBirth: string;
  placeOfBirth: string;
  communeOfBirth: string;
  adresse: BackendAddress;
  role: BackendUserRole;
  courseIds?: string[];
}

export interface EmployeeApiResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sexe: string;
  avatar?: string;
  handicap?: boolean;
  hireDate: string;
  dateOfBirth: string;
  placeOfBirth: string;
  communeOfBirth: string;
  adresse: BackendAddress;
  role: BackendUserRole;
  courses?: Array<{
    id: string;
    titre: string;
    code: string;
    categorie: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListApiResponse {
  data: EmployeeApiResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Configuration client API
const createApiClient = () => {
  const client = axios.create({ timeout: 10000 });
  
  client.interceptors.request.use((config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

// Service API
export const employeeService = {
  // Créer un employé
  createEmployee: async (payload: CreateEmployeeApiPayload): Promise<EmployeeApiResponse> => {
    console.log('🌐 Service API - Création employé');
    console.log('📦 Payload reçu:', payload);
    
    const client = createApiClient();
    const url = getApiUrl('/employees/add-employee');
    
    console.log('🔗 URL API:', url);
    
    try {
      // Créer un FormData pour multipart/form-data
      const formData = new FormData();
      
      // Ajouter tous les champs au FormData
      formData.append('firstName', payload.firstName);
      formData.append('lastName', payload.lastName);
      formData.append('email', payload.email);
      formData.append('phone', payload.phone);
      formData.append('sexe', payload.sexe);
      formData.append('dateOfBirth', payload.dateOfBirth);
      formData.append('placeOfBirth', payload.placeOfBirth);
      formData.append('communeOfBirth', payload.communeOfBirth);
      formData.append('hireDate', payload.hireDate);
      formData.append('role', payload.role);
      
      // Ajouter les champs d'adresse individuellement
      formData.append('adresse.adresseLigne1', payload.adresse.adresseLigne1);
      formData.append('adresse.departement', payload.adresse.departement);
      formData.append('adresse.commune', payload.adresse.commune);
      formData.append('adresse.sectionCommunale', payload.adresse.sectionCommunale);
      
      // Ajouter les champs optionnels
      if (payload.avatar) {
        // Si c'est une image base64, la convertir en Blob
        if (payload.avatar.startsWith('data:image/')) {
          const response = await fetch(payload.avatar);
          const blob = await response.blob();
          formData.append('avatar', blob, 'avatar.jpg');
        } else {
          // Si c'est une URL, l'envoyer directement
          formData.append('avatar', payload.avatar);
        }
      }
      // Envoyer handicap comme 0 ou 1 (format MySQL BOOLEAN)
      if (payload.handicap !== undefined) {
        formData.append('handicap', payload.handicap ? '1' : '0');
      }
      if (payload.courseIds && payload.courseIds.length > 0) {
        // Ajouter chaque courseId individuellement
        payload.courseIds.forEach((courseId, index) => {
          formData.append(`courseIds[${index}]`, courseId);
        });
      }
      
      console.log('📋 FormData créé avec les champs:', Array.from(formData.keys()));
      console.log('🔍 Valeurs FormData:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      const response = await client.post<EmployeeApiResponse>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Réponse API reçue:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur API dans le service:', error);
      console.error('🔍 Détails erreur API:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  },

  // Récupérer tous les employés
  getAllEmployees: async (page: number = 1, limit: number = 10): Promise<any> => {
    const client = createApiClient();
    const url = getApiUrl('/employees/all-employees');
    
    console.log('🌐 Appel API getAllEmployees:', { url, page, limit });
    
    try {
      const response = await client.get(url, {
        params: { page, limit }
      });
      
      console.log('📊 Réponse brute getAllEmployees:', response.data);
      console.log('📊 Type de réponse:', typeof response.data);
      console.log('📊 Est-ce un tableau ?', Array.isArray(response.data));
      
      // L'API retourne directement un tableau
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAllEmployees:', error);
      console.error('❌ Détails erreur:', {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  },

  // Récupérer un employé par ID
  getEmployeeById: async (id: string): Promise<EmployeeApiResponse> => {
    const client = createApiClient();
    const url = getApiUrl(`/employees/${id}`);
    const response = await client.get<EmployeeApiResponse>(url);
    return response.data;
  },

  // Récupérer employé par code
  getEmployeeByCode: async (code: string): Promise<EmployeeApiResponse> => {
    const client = createApiClient();
    const url = getApiUrl(`/employees/by-code/${code}`);
    const response = await client.get<EmployeeApiResponse>(url);
    return response.data;
  },

  // Récupérer employés par rôle
  getEmployeesByRole: async (role: BackendUserRole): Promise<EmployeeApiResponse[]> => {
    const client = createApiClient();
    const url = getApiUrl(`/employees/by-role/${role}`);
    const response = await client.get<EmployeeApiResponse[]>(url);
    return response.data;
  },

  // Mettre à jour un employé
  updateEmployee: async (id: string, payload: Partial<CreateEmployeeApiPayload>): Promise<EmployeeApiResponse> => {
    console.log('🌐 Service API - Mise à jour employé');
    console.log('🆔 ID:', id);
    console.log('📦 Payload reçu:', payload);
    
    const client = createApiClient();
    const url = getApiUrl(`/employees/update-employee/${id}`);
    
    console.log('🔗 URL API:', url);
    
    try {
      // Créer un FormData pour multipart/form-data
      const formData = new FormData();
      
      // Ajouter seulement les champs fournis
      if (payload.firstName) formData.append('firstName', payload.firstName);
      if (payload.lastName) formData.append('lastName', payload.lastName);
      if (payload.email) formData.append('email', payload.email);
      if (payload.phone) formData.append('phone', payload.phone);
      if (payload.sexe) formData.append('sexe', payload.sexe);
      if (payload.dateOfBirth) formData.append('dateOfBirth', payload.dateOfBirth);
      if (payload.placeOfBirth) formData.append('placeOfBirth', payload.placeOfBirth);
      if (payload.communeOfBirth) formData.append('communeOfBirth', payload.communeOfBirth);
      if (payload.hireDate) formData.append('hireDate', payload.hireDate);
      if (payload.role) formData.append('role', payload.role);
      
      // Ajouter les champs d'adresse si fournis
      if (payload.adresse) {
        formData.append('adresse.adresseLigne1', payload.adresse.adresseLigne1);
        formData.append('adresse.departement', payload.adresse.departement);
        formData.append('adresse.commune', payload.adresse.commune);
        formData.append('adresse.sectionCommunale', payload.adresse.sectionCommunale);
      }
      
      // Ajouter les champs optionnels
      if (payload.avatar) {
        // Si c'est une image base64, la convertir en Blob
        if (payload.avatar.startsWith('data:image/')) {
          const response = await fetch(payload.avatar);
          const blob = await response.blob();
          formData.append('avatar', blob, 'avatar.jpg');
        } else {
          // Si c'est une URL, l'envoyer directement
          formData.append('avatar', payload.avatar);
        }
      }
      
      // N'envoyer handicap que s'il est explicitement défini (format MySQL BOOLEAN: 0 ou 1)
      if (payload.handicap !== undefined) {
        formData.append('handicap', payload.handicap ? '1' : '0');
      }
      
      if (payload.courseIds && payload.courseIds.length > 0) {
        // Ajouter chaque courseId individuellement
        payload.courseIds.forEach((courseId, index) => {
          formData.append(`courseIds[${index}]`, courseId);
        });
      }
      
      console.log('📋 FormData créé avec les champs:', Array.from(formData.keys()));
      console.log('🔍 Valeurs FormData:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      const response = await client.patch<EmployeeApiResponse>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Réponse API mise à jour reçue:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur API dans le service (update):', error);
      console.error('🔍 Détails erreur API:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  },

  /**
   * Ajouter un ou plusieurs cours à un employé (TEACHER uniquement)
   * @param id - ID de l'employé
   * @param courseIds - Liste des IDs des cours à ajouter
   * @returns Réponse de l'API (employé mis à jour)
   */
  addCoursesToEmployee: async (id: string, courseIds: string[]): Promise<EmployeeApiResponse> => {
    console.log('🌐 Service API - Ajout de cours à un employé');
    console.log('🆔 ID employé:', id);
    console.log('📚 IDs des cours à ajouter:', courseIds);
    
    const client = createApiClient();
    const url = getApiUrl(`/employees/${id}/add-courses`);
    
    try {
      const response = await client.post<EmployeeApiResponse>(url, { courseIds });
      console.log('✅ Cours ajoutés avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout des cours:', error);
      console.error('🔍 Détails erreur:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  },

  /**
   * Retirer un ou plusieurs cours d'un employé (TEACHER uniquement)
   * @param id - ID de l'employé
   * @param courseIds - Liste des IDs des cours à retirer
   * @returns Réponse de l'API (employé mis à jour)
   */
  removeCoursesFromEmployee: async (id: string, courseIds: string[]): Promise<EmployeeApiResponse> => {
    console.log('🌐 Service API - Retrait de cours d\'un employé');
    console.log('🆔 ID employé:', id);
    console.log('📚 IDs des cours à retirer:', courseIds);
    
    const client = createApiClient();
    const url = getApiUrl(`/employees/${id}/remove-courses`);
    
    try {
      const response = await client.post<EmployeeApiResponse>(url, { courseIds });
      console.log('✅ Cours retirés avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors du retrait des cours:', error);
      console.error('🔍 Détails erreur:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }
};
