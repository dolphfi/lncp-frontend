/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES HORAIRES
 * =====================================================
 * Centralisation de la logique de gestion d'état des emplois du temps
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'react-toastify';

import {
  Schedule,
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleFilters,
  SchedulePaginationOptions,
  ScheduleStats,
  ScheduleApiError,
  DayOfWeek,
  VacationType,
  convertScheduleFromApi
} from '../types/schedule';

import { scheduleService } from '../services/schedules/scheduleService';

// =====================================================
// INTERFACE DU STORE
// =====================================================

interface ScheduleStore {
  // État
  schedules: Schedule[];
  allSchedules: Schedule[];
  mySchedule: Schedule[];
  loading: boolean;
  error: ScheduleApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | null;
  
  // Filtres et pagination
  filters: ScheduleFilters;
  pagination: SchedulePaginationOptions;
  
  // Statistiques
  stats: ScheduleStats | null;
  
  // Actions principales
  fetchSchedules: () => Promise<void>;
  fetchMySchedule: (filters?: { day?: DayOfWeek; vacation?: VacationType }) => Promise<void>;
  fetchSchedulesByClassroom: (classroomId: string, filters?: any) => Promise<void>;
  fetchSchedulesByRoom: (roomId: string, filters?: any) => Promise<void>;
  createSchedule: (data: CreateScheduleDto) => Promise<void>;
  updateSchedule: (id: string, data: UpdateScheduleDto) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  
  // Actions de filtrage
  setFilters: (filters: Partial<ScheduleFilters>) => void;
  clearFilters: () => void;
  changePage: (page: number) => void;
  
  // Actions utilitaires
  clearError: () => void;
  calculateStats: (schedules: Schedule[]) => void;
}

// =====================================================
// CRÉATION DU STORE
// =====================================================

export const useScheduleStore = create<ScheduleStore>()(
  immer((set, get) => ({
    // État initial
    schedules: [],
    allSchedules: [],
    mySchedule: [],
    loading: false,
    error: null,
    loadingAction: null,
    
    filters: {
      search: '',
      day: undefined,
      vacation: undefined,
      classroomId: undefined,
      roomId: undefined,
      teacherId: undefined
    },
    
    pagination: {
      page: 1,
      limit: 100,
      total: 0,
      totalPages: 0
    },
    
    stats: null,
    
    // =====================================================
    // ACTIONS PRINCIPALES
    // =====================================================
    
    /**
     * Récupérer tous les horaires (ADMIN/DIRECTOR)
     */
    fetchSchedules: async () => {
      console.log('📚 Store - Récupération de tous les horaires');
      
      set(state => {
        state.loading = true;
        state.error = null;
      });
      
      try {
        const { filters } = get();
        
        // Appel API
        const response = await scheduleService.getAllSchedules({
          page: 1,
          limit: 100,
          day: filters.day,
          vacation: filters.vacation
        });
        
        console.log('✅ Horaires récupérés:', response);
        
        // Convertir les données API
        const schedules = response.data.map(convertScheduleFromApi);
        
        set(state => {
          state.schedules = schedules;
          state.allSchedules = schedules;
          state.pagination = response.pagination;
          state.loading = false;
        });
        
        // Calculer les statistiques
        get().calculateStats(schedules);
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des horaires:', error);
        
        set(state => {
          state.loading = false;
          state.error = {
            message: 'Erreur lors du chargement des horaires',
            code: 'FETCH_ERROR',
            details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
          };
        });
        
        toast.error('Erreur lors du chargement des horaires');
      }
    },
    
    /**
     * Récupérer mon horaire (STUDENT/TEACHER)
     */
    fetchMySchedule: async (filters) => {
      console.log('📚 Store - Récupération de mon horaire');
      
      set(state => {
        state.loading = true;
        state.error = null;
      });
      
      try {
        // Appel API
        const response = await scheduleService.getMySchedule({
          page: 1,
          limit: 100,
          day: filters?.day,
          vacation: filters?.vacation
        });
        
        console.log('✅ Mon horaire récupéré:', response);
        
        // Convertir les données API
        const schedules = response.data.map(convertScheduleFromApi);
        
        set(state => {
          state.mySchedule = schedules;
          state.schedules = schedules;
          state.loading = false;
        });
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération de mon horaire:', error);
        
        set(state => {
          state.loading = false;
          state.error = {
            message: 'Erreur lors du chargement de votre horaire',
            code: 'FETCH_MY_SCHEDULE_ERROR',
            details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
          };
        });
        
        toast.error('Erreur lors du chargement de votre horaire');
      }
    },
    
    /**
     * Récupérer les horaires d'une classe
     */
    fetchSchedulesByClassroom: async (classroomId, filters) => {
      console.log('📚 Store - Récupération des horaires de la classe', classroomId);
      
      set(state => {
        state.loading = true;
        state.error = null;
      });
      
      try {
        const response = await scheduleService.getSchedulesByClassroom(classroomId, filters);
        
        const schedules = response.data.map(convertScheduleFromApi);
        
        set(state => {
          state.schedules = schedules;
          state.pagination = response.pagination;
          state.loading = false;
        });
        
      } catch (error) {
        console.error('❌ Erreur:', error);
        
        set(state => {
          state.loading = false;
          state.error = {
            message: 'Erreur lors du chargement des horaires de la classe',
            code: 'FETCH_CLASSROOM_ERROR',
            details: []
          };
        });
        
        toast.error('Erreur lors du chargement des horaires');
      }
    },
    
    /**
     * Récupérer les horaires d'une salle
     */
    fetchSchedulesByRoom: async (roomId, filters) => {
      console.log('📚 Store - Récupération des horaires de la salle', roomId);
      
      set(state => {
        state.loading = true;
        state.error = null;
      });
      
      try {
        const response = await scheduleService.getSchedulesByRoom(roomId, filters);
        
        const schedules = response.data.map(convertScheduleFromApi);
        
        set(state => {
          state.schedules = schedules;
          state.pagination = response.pagination;
          state.loading = false;
        });
        
      } catch (error) {
        console.error('❌ Erreur:', error);
        
        set(state => {
          state.loading = false;
          state.error = {
            message: 'Erreur lors du chargement des horaires de la salle',
            code: 'FETCH_ROOM_ERROR',
            details: []
          };
        });
        
        toast.error('Erreur lors du chargement des horaires');
      }
    },
    
    /**
     * Créer un nouvel horaire
     */
    createSchedule: async (data) => {
      console.log('➕ Store - Création d\'horaire');
      
      set(state => {
        state.loadingAction = 'create';
        state.error = null;
      });
      
      try {
        const newSchedule = await scheduleService.createSchedule(data);
        
        set(state => {
          state.allSchedules.push(newSchedule);
          state.loadingAction = null;
        });
        
        toast.success('Horaire créé avec succès !');
        
        // Recharger les données
        await get().fetchSchedules();
        
      } catch (error) {
        console.error('❌ Erreur:', error);
        
        set(state => {
          state.loadingAction = null;
          state.error = {
            message: 'Erreur lors de la création de l\'horaire',
            code: 'CREATE_ERROR',
            details: []
          };
        });
        
        toast.error('Erreur lors de la création de l\'horaire');
        throw error;
      }
    },
    
    /**
     * Mettre à jour un horaire
     */
    updateSchedule: async (id, data) => {
      console.log('✏️ Store - Mise à jour d\'horaire', id);
      
      set(state => {
        state.loadingAction = 'update';
        state.error = null;
      });
      
      try {
        const updatedSchedule = await scheduleService.updateSchedule(id, data);
        
        set(state => {
          const index = state.allSchedules.findIndex(s => s.id === id);
          if (index !== -1) {
            state.allSchedules[index] = updatedSchedule;
          }
          state.loadingAction = null;
        });
        
        toast.success('Horaire mis à jour avec succès !');
        
        // Recharger les données
        await get().fetchSchedules();
        
      } catch (error) {
        console.error('❌ Erreur:', error);
        
        set(state => {
          state.loadingAction = null;
          state.error = {
            message: 'Erreur lors de la mise à jour de l\'horaire',
            code: 'UPDATE_ERROR',
            details: []
          };
        });
        
        toast.error('Erreur lors de la mise à jour de l\'horaire');
        throw error;
      }
    },
    
    /**
     * Supprimer un horaire
     */
    deleteSchedule: async (id) => {
      console.log('🗑️ Store - Suppression d\'horaire', id);
      
      set(state => {
        state.loadingAction = 'delete';
        state.error = null;
      });
      
      try {
        await scheduleService.deleteSchedule(id);
        
        set(state => {
          state.allSchedules = state.allSchedules.filter(s => s.id !== id);
          state.loadingAction = null;
        });
        
        toast.success('Horaire supprimé avec succès !');
        
        // Recharger les données
        await get().fetchSchedules();
        
      } catch (error) {
        console.error('❌ Erreur:', error);
        
        set(state => {
          state.loadingAction = null;
          state.error = {
            message: 'Erreur lors de la suppression de l\'horaire',
            code: 'DELETE_ERROR',
            details: []
          };
        });
        
        toast.error('Erreur lors de la suppression de l\'horaire');
        throw error;
      }
    },
    
    // =====================================================
    // ACTIONS DE FILTRAGE
    // =====================================================
    
    setFilters: (filters) => {
      set(state => {
        state.filters = { ...state.filters, ...filters };
        state.pagination.page = 1;
      });
    },
    
    clearFilters: () => {
      set(state => {
        state.filters = {
          search: '',
          day: undefined,
          vacation: undefined,
          classroomId: undefined,
          roomId: undefined,
          teacherId: undefined
        };
        state.pagination.page = 1;
      });
    },
    
    changePage: (page) => {
      set(state => {
        state.pagination.page = page;
      });
    },
    
    // =====================================================
    // ACTIONS UTILITAIRES
    // =====================================================
    
    clearError: () => {
      set(state => {
        state.error = null;
      });
    },
    
    calculateStats: (schedules) => {
      const stats: ScheduleStats = {
        total: schedules.length,
        byDay: {
          LUNDI: 0,
          MARDI: 0,
          MERCREDI: 0,
          JEUDI: 0,
          VENDREDI: 0,
          SAMEDI: 0,
          DIMANCHE: 0
        },
        byVacation: {
          'Matin (AM)': 0,
          'Après-midi (PM)': 0
        },
        byClassroom: {},
        averageTimeSlotsPerSchedule: 0
      };
      
      let totalTimeSlots = 0;
      
      schedules.forEach(schedule => {
        stats.byDay[schedule.dayOfWeek]++;
        stats.byVacation[schedule.vacation]++;
        
        const classroomName = schedule.classroom?.name || schedule.classroomId;
        stats.byClassroom[classroomName] = (stats.byClassroom[classroomName] || 0) + 1;
        
        totalTimeSlots += schedule.timeSlots.length;
      });
      
      stats.averageTimeSlotsPerSchedule = schedules.length > 0 
        ? totalTimeSlots / schedules.length 
        : 0;
      
      set(state => {
        state.stats = stats;
      });
    }
  }))
);

// =====================================================
// HOOKS UTILITAIRES
// =====================================================

export const useSchedules = () => {
  return useScheduleStore(state => state.schedules);
};

export const useMySchedule = () => {
  return useScheduleStore(state => state.mySchedule);
};

export const useScheduleLoading = () => {
  return useScheduleStore(state => state.loading);
};

export const useScheduleError = () => {
  return useScheduleStore(state => state.error);
};

export const useScheduleStats = () => {
  return useScheduleStore(state => state.stats);
};
