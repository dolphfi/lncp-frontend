import axios from 'axios';
import { getApiUrl } from '../config/api';
import authService from './authService';

// Enum pour les statuts des années académiques
export enum StatutAnneeAcademique {
  PLANIFIEE = 'Planifiée',
  EN_COURS = 'En cours',
  TERMINEE = 'Terminée',
}

// Types pour les années académiques
export interface AcademicYear {
  id: string;
  label: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutAnneeAcademique;
  isCurrent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicYearDTO {
  label: string;
  dateDebut: string;
  dateFin: string;
}

export interface UpdateAcademicYearDTO {
  label?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: StatutAnneeAcademique;
}

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
});

// Intercepteur réponse: propager proprement l'erreur
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const apiMsg = err?.response?.data?.message || err?.message || 'Erreur réseau';
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[academicYearService] Error:', apiMsg, err?.response?.data);
    }
    return Promise.reject(new Error(apiMsg));
  }
);

export const academicYearService = {
  // POST /academic-years/add-academic-year
  async createAcademicYear(data: CreateAcademicYearDTO): Promise<AcademicYear> {
    const url = getApiUrl('/academic-years/add-academic-year');
    const res = await http.post(url, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  },

  // GET /academic-years/all-academic-years
  async getAllAcademicYears(): Promise<AcademicYear[]> {
    const url = getApiUrl('/academic-years/all-academic-years');
    const res = await http.get(url);
    return res.data;
  },

  // GET /academic-years/current-academic-year
  async getCurrentAcademicYear(): Promise<AcademicYear> {
    const url = getApiUrl('/academic-years/current-academic-year');
    const res = await http.get(url);
    return res.data;
  },

  // GET /academic-years/{id}
  async getAcademicYearById(id: string): Promise<AcademicYear> {
    const url = getApiUrl(`/academic-years/${id}`);
    const res = await http.get(url);
    return res.data;
  },

  // PATCH /academic-years/{id}
  async updateAcademicYear(id: string, data: UpdateAcademicYearDTO): Promise<AcademicYear> {
    const url = getApiUrl(`/academic-years/${id}`);
    const res = await http.patch(url, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  }
};
