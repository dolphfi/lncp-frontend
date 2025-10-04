/**
 * =====================================================
 * SERVICE API POUR LA GESTION DES HORAIRES
 * =====================================================
 * Gestion des appels API pour les emplois du temps
 * Compatible avec les endpoints /schedules/*
 */

import axios from 'axios';
import { getApiUrl } from '../../config/api';
import authService from '../authService';

import {
  Schedule,
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleApiResponse,
  ScheduleListApiResponse,
  ScheduleFilters,
  DayOfWeek,
  VacationType,
  convertScheduleFromApi
} from '../../types/schedule';

// =====================================================
// CONFIGURATION CLIENT API
// =====================================================

/**
 * Créer un client axios avec authentification JWT
 */
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

// =====================================================
// SERVICE API DES HORAIRES
// =====================================================

export const scheduleService = {
  
  /**
   * Créer un nouvel horaire
   * POST /schedules/new-schedule
   */
  createSchedule: async (data: CreateScheduleDto): Promise<Schedule> => {
    console.log('🌐 Service API - Création d\'horaire');
    console.log('📦 Payload:', data);
    
    const client = createApiClient();
    const url = getApiUrl('/schedules/new-schedule');
    
    try {
      const response = await client.post<ScheduleApiResponse>(url, data);
      console.log('✅ Horaire créé avec succès:', response.data);
      
      return convertScheduleFromApi(response.data);
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'horaire:', error);
      console.error('🔍 Détails erreur:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  },

  /**
   * Récupérer l'horaire de l'utilisateur connecté (étudiant ou professeur)
   * GET /schedules/my-schedule
   */
  getMySchedule: async (filters?: {
    page?: number;
    limit?: number;
    day?: DayOfWeek;
    vacation?: VacationType;
  }): Promise<ScheduleListApiResponse> => {
    console.log('🌐 Service API - Récupération de mon horaire');
    console.log('🔍 Filtres:', filters);
    
    const client = createApiClient();
    const url = getApiUrl('/schedules/my-schedule');
    
    try {
      const response = await client.get<ScheduleListApiResponse>(url, {
        params: {
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          day: filters?.day,
          vacation: filters?.vacation
        }
      });
      
      console.log('✅ Mon horaire récupéré:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'horaire:', error);
      throw error;
    }
  },

  /**
   * Récupérer tous les horaires
   * GET /schedules/all-schedules
   */
  getAllSchedules: async (filters?: {
    page?: number;
    limit?: number;
    day?: DayOfWeek;
    vacation?: VacationType;
  }): Promise<ScheduleListApiResponse> => {
    console.log('🌐 Service API - Récupération de tous les horaires');
    console.log('🔍 Filtres:', filters);

    const client = createApiClient();
    const url = getApiUrl('/schedules/all-schedules');

    // Filtrer les paramètres undefined
    const params: any = {};
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.limit !== undefined) params.limit = filters.limit;
    if (filters?.day !== undefined) params.day = filters.day;
    if (filters?.vacation !== undefined) params.vacation = filters.vacation;

    try {
      const response = await client.get<any>(url, {
        params
      });

      console.log('✅ Horaires récupérés (brut):', response.data);

      // Le backend renvoie directement un tableau, pas un objet avec data et pagination
      // On doit donc adapter la réponse
      let normalizedResponse: ScheduleListApiResponse;

      if (Array.isArray(response.data)) {
        // Si c'est un tableau direct, on le normalise
        console.log('📦 Normalisation : Tableau direct détecté');
        normalizedResponse = {
          data: response.data,
          pagination: {
            page: filters?.page || 1,
            limit: filters?.limit || 100,
            total: response.data.length,
            totalPages: 1
          }
        };
      } else {
        // Si c'est déjà au bon format
        console.log('📦 Format déjà correct');
        normalizedResponse = response.data;
      }

      console.log('✅ Réponse normalisée:', normalizedResponse);
      return normalizedResponse;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des horaires:', error);
      throw error;
    }
  },

  /**
   * Récupérer les horaires d'une salle spécifique
   * GET /schedules/by-room/{roomId}
   */
  getSchedulesByRoom: async (
    roomId: string,
    filters?: {
      page?: number;
      limit?: number;
      day?: DayOfWeek;
      vacation?: VacationType;
    }
  ): Promise<ScheduleListApiResponse> => {
    console.log('🌐 Service API - Récupération des horaires par salle');
    console.log('🏫 ID salle:', roomId);
    console.log('🔍 Filtres:', filters);
    
    const client = createApiClient();
    const url = getApiUrl(`/schedules/by-room/${roomId}`);
    
    try {
      const response = await client.get<ScheduleListApiResponse>(url, {
        params: {
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          day: filters?.day,
          vacation: filters?.vacation
        }
      });
      
      console.log('✅ Horaires de la salle récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des horaires de la salle:', error);
      throw error;
    }
  },

  /**
   * Récupérer les horaires d'une classe spécifique
   * GET /schedules/by-classroom/{classroomId}
   */
  getSchedulesByClassroom: async (
    classroomId: string,
    filters?: {
      page?: number;
      limit?: number;
      day?: DayOfWeek;
      vacation?: VacationType;
    }
  ): Promise<ScheduleListApiResponse> => {
    console.log('🌐 Service API - Récupération des horaires par classe');
    console.log('🎓 ID classe:', classroomId);
    console.log('🔍 Filtres:', filters);
    
    const client = createApiClient();
    const url = getApiUrl(`/schedules/by-classroom/${classroomId}`);
    
    try {
      const response = await client.get<ScheduleListApiResponse>(url, {
        params: {
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          day: filters?.day,
          vacation: filters?.vacation
        }
      });
      
      console.log('✅ Horaires de la classe récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des horaires de la classe:', error);
      throw error;
    }
  },

  /**
   * Récupérer un horaire par ID
   * GET /schedules/{id}
   */
  getScheduleById: async (id: string): Promise<Schedule> => {
    console.log('🌐 Service API - Récupération d\'horaire par ID');
    console.log('🆔 ID:', id);
    
    const client = createApiClient();
    const url = getApiUrl(`/schedules/${id}`);
    
    try {
      const response = await client.get<ScheduleApiResponse>(url);
      console.log('✅ Horaire récupéré:', response.data);
      
      return convertScheduleFromApi(response.data);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'horaire:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un horaire
   * PATCH /schedules/{id}
   */
  updateSchedule: async (id: string, data: UpdateScheduleDto): Promise<Schedule> => {
    console.log('🌐 Service API - Mise à jour d\'horaire');
    console.log('🆔 ID:', id);
    console.log('📦 Payload:', data);
    
    const client = createApiClient();
    const url = getApiUrl(`/schedules/${id}`);
    
    try {
      const response = await client.patch<ScheduleApiResponse>(url, data);
      console.log('✅ Horaire mis à jour avec succès:', response.data);
      
      return convertScheduleFromApi(response.data);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'horaire:', error);
      console.error('🔍 Détails erreur:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  },

  /**
   * Supprimer un horaire
   * DELETE /schedules/{id}
   */
  deleteSchedule: async (id: string): Promise<void> => {
    console.log('🌐 Service API - Suppression d\'horaire');
    console.log('🆔 ID:', id);
    
    const client = createApiClient();
    const url = getApiUrl(`/schedules/${id}`);
    
    try {
      await client.delete(url);
      console.log('✅ Horaire supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'horaire:', error);
      console.error('🔍 Détails erreur:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }
};

export default scheduleService;
