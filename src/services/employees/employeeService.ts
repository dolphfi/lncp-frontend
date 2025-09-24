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
  sectioncommunale: string;
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
      formData.append('adresse.sectioncommunale', payload.adresse.sectioncommunale);
      
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
      // N'envoyer handicap que s'il est explicitement true
      if (payload.handicap === true) {
        formData.append('handicap', 'true');
      }
      // Si false ou undefined, ne pas envoyer le champ (valeur par défaut backend)
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
      
      // L'API retourne directement un tableau
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAllEmployees:', error);
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
    const client = createApiClient();
    const url = getApiUrl(`/employees/update-employee/${id}`);
    const response = await client.patch<EmployeeApiResponse>(url, payload);
    return response.data;
  },

  // Ajouter des cours à un employé
  addCoursesToEmployee: async (id: string, courseIds: string[]): Promise<void> => {
    const client = createApiClient();
    const url = getApiUrl(`/employees/${id}/add-courses`);
    await client.post(url, { courseIds });
  },

  // Supprimer des cours d'un employé
  removeCoursesFromEmployee: async (id: string, courseIds: string[]): Promise<void> => {
    const client = createApiClient();
    const url = getApiUrl(`/employees/${id}/remove-courses`);
    await client.post(url, { courseIds });
  }
};
