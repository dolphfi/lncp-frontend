import axios from 'axios';
import { getApiUrl } from '../config/api';
import authService from './authService';

const api = axios.create({
  baseURL: getApiUrl(''),
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ManualAttendanceDto {
  studentId?: string;
  employeeId?: string;
  reason?: string;
  timestamp: string;
}

export interface JustificationDto {
  justification: string;
}

const attendanceService = {
  // Enregistrer un pointage manuellement
  recordManual: async (data: ManualAttendanceDto) => {
    const response = await api.post('/attendances/manual-record', data);
    return response.data;
  },

  // Justifier une absence ou un retard
  justify: async (id: string, data: JustificationDto) => {
    const response = await api.patch(`/attendances/${id}/justify`, data);
    return response.data;
  },

  // Obtenir la liste des retards pour un jour donné (ou aujourd'hui par défaut)
  getLatenessReport: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await api.get('/attendances/report/lateness', { params });
    return response.data;
  },

  // Obtenir le rapport de présence d'un utilisateur
  getUserReport: async (userId: string) => {
    const response = await api.get(`/attendances/report/user/${userId}`);
    return response.data;
  },

  // Obtenir le résumé du temps de présence d'un utilisateur
  getUserSummary: async (userId: string) => {
    const response = await api.get(`/attendances/summary/user/${userId}`);
    return response.data;
  },

  // Maintenance Admin
  cleanupInvalidAbsences: async () => {
    const response = await api.post('/attendances/admin/cleanup-invalid-absences');
    return response.data;
  },

  reprocessAbsences: async (date: string) => {
    const response = await api.post(`/attendances/admin/reprocess-absences/${date}`);
    return response.data;
  },

  forceAbsenceDetection: async () => {
    const response = await api.post('/attendances/admin/force-absence-detection');
    return response.data;
  }
};

export default attendanceService;
