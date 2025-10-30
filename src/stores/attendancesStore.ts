/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES PRÉSENCES
 * =====================================================
 * Ce store centralise toute la logique de gestion d'état
 * pour les présences avec Zustand
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import { ApiError } from '../types/student';

// =====================================================
// TYPES POUR LES PRÉSENCES
// =====================================================
export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  studentMatricule: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  classroomId: string;
  classroomName: string;
  roomId?: string;
  roomName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceFilters {
  search?: string;
  status?: 'present' | 'absent' | 'late' | 'excused';
  classroomId?: string;
  roomId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
  byClassroom: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface AttendanceStore {
  // État
  attendances: Attendance[];
  allAttendances: Attendance[];
  loading: boolean;
  error: ApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | null;
  
  // Filtres et pagination
  filters: AttendanceFilters;
  pagination: PaginationOptions;
  sortOptions: { field: string; order: 'asc' | 'desc' };
  
  // Statistiques
  stats: AttendanceStats | null;
  
  // Actions principales
  fetchAttendances: () => Promise<void>;
  createAttendance: (data: Partial<Attendance>) => Promise<void>;
  updateAttendance: (data: Partial<Attendance> & { id: string }) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  markAttendance: (studentId: string, status: Attendance['status'], date: string) => Promise<void>;
  
  // Actions de filtrage et tri
  setFilters: (filters: Partial<AttendanceFilters>) => void;
  setSortOptions: (sort: { field: string; order: 'asc' | 'desc' }) => void;
  changePage: (page: number) => void;
  applyFiltersLocally: () => void;
  
  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
  fetchStats: () => Promise<void>;
  
  // Actions spécifiques
  getAttendancesByDate: (date: string) => Promise<Attendance[]>;
  getAttendancesByStudent: (studentId: string) => Promise<Attendance[]>;
  getAttendancesByClassroom: (classroomId: string) => Promise<Attendance[]>;
}

// =====================================================
// UTILITAIRES
// =====================================================

const filterAttendances = (attendances: Attendance[], filters: AttendanceFilters): Attendance[] => {
  return attendances.filter(attendance => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        attendance.studentName.toLowerCase().includes(searchTerm) ||
        attendance.studentMatricule.toLowerCase().includes(searchTerm) ||
        attendance.classroomName.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }
    
    if (filters.status && attendance.status !== filters.status) return false;
    if (filters.classroomId && attendance.classroomId !== filters.classroomId) return false;
    if (filters.roomId && attendance.roomId !== filters.roomId) return false;
    
    if (filters.dateFrom) {
      const attendanceDate = new Date(attendance.date);
      const fromDate = new Date(filters.dateFrom);
      if (attendanceDate < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const attendanceDate = new Date(attendance.date);
      const toDate = new Date(filters.dateTo);
      if (attendanceDate > toDate) return false;
    }
    
    return true;
  });
};

const sortAttendances = (attendances: Attendance[], sortOptions: { field: string; order: 'asc' | 'desc' }): Attendance[] => {
  return [...attendances].sort((a, b) => {
    const aValue = (a as any)[sortOptions.field];
    const bValue = (b as any)[sortOptions.field];
    
    if (aValue < bValue) return sortOptions.order === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOptions.order === 'asc' ? 1 : -1;
    return 0;
  });
};

const paginateAttendances = (attendances: Attendance[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return attendances.slice(startIndex, endIndex);
};

const calculateStats = (attendances: Attendance[]): AttendanceStats => {
  const total = attendances.length;
  const present = attendances.filter(a => a.status === 'present').length;
  const absent = attendances.filter(a => a.status === 'absent').length;
  const late = attendances.filter(a => a.status === 'late').length;
  const excused = attendances.filter(a => a.status === 'excused').length;
  
  const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;
  
  const byClassroom: Record<string, number> = {};
  attendances.forEach(a => {
    byClassroom[a.classroomName] = (byClassroom[a.classroomName] || 0) + 1;
  });
  
  const byStatus: Record<string, number> = {
    present,
    absent,
    late,
    excused
  };
  
  return {
    total,
    present,
    absent,
    late,
    excused,
    attendanceRate,
    byClassroom,
    byStatus
  };
};

// =====================================================
// CRÉATION DU STORE
// =====================================================
export const useAttendanceStore = create<AttendanceStore>()((
  subscribeWithSelector(
    immer((set, get) => ({
      // État initial
      attendances: [],
      allAttendances: [],
      loading: false,
      error: null,
      loadingAction: null,
      
      filters: {
        search: '',
        status: undefined,
        classroomId: undefined,
        roomId: undefined,
        dateFrom: undefined,
        dateTo: undefined
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      sortOptions: {
        field: 'date',
        order: 'desc'
      },
      
      stats: null,
      
      // Actions principales
      fetchAttendances: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Remplacer par un appel API réel
          const mockAttendances: Attendance[] = [];
          
          set({ 
            allAttendances: mockAttendances,
            loading: false 
          });
          
          get().applyFiltersLocally();
          await get().fetchStats();
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors du chargement des présences',
              code: error.code || 'FETCH_ERROR'
            },
            loading: false 
          });
        }
      },
      
      createAttendance: async (data: Partial<Attendance>) => {
        set({ loadingAction: 'create', error: null });
        try {
          // TODO: Remplacer par un appel API réel
          console.log('Création de présence:', data);
          await get().fetchAttendances();
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors de la création',
              code: error.code || 'CREATE_ERROR'
            },
            loadingAction: null 
          });
          throw error;
        }
      },
      
      updateAttendance: async (data: Partial<Attendance> & { id: string }) => {
        set({ loadingAction: 'update', error: null });
        try {
          // TODO: Remplacer par un appel API réel
          console.log('Mise à jour de présence:', data);
          await get().fetchAttendances();
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors de la mise à jour',
              code: error.code || 'UPDATE_ERROR'
            },
            loadingAction: null 
          });
          throw error;
        }
      },
      
      deleteAttendance: async (id: string) => {
        set({ loadingAction: 'delete', error: null });
        try {
          // TODO: Remplacer par un appel API réel
          console.log('Suppression de présence:', id);
          await get().fetchAttendances();
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors de la suppression',
              code: error.code || 'DELETE_ERROR'
            },
            loadingAction: null 
          });
          throw error;
        }
      },
      
      markAttendance: async (studentId: string, status: Attendance['status'], date: string) => {
        set({ loadingAction: 'create', error: null });
        try {
          // TODO: Remplacer par un appel API réel
          console.log('Marquage présence:', { studentId, status, date });
          await get().fetchAttendances();
          set({ loadingAction: null });
        } catch (error: any) {
          set({ 
            error: { 
              message: error.message || 'Erreur lors du marquage',
              code: error.code || 'MARK_ERROR'
            },
            loadingAction: null 
          });
          throw error;
        }
      },
      
      // Actions de filtrage et tri
      setFilters: (newFilters: Partial<AttendanceFilters>) => {
        set((state) => {
          state.filters = { ...state.filters, ...newFilters };
        });
        get().applyFiltersLocally();
      },
      
      setSortOptions: (sort: { field: string; order: 'asc' | 'desc' }) => {
        set({ sortOptions: sort });
        get().applyFiltersLocally();
      },
      
      changePage: (page: number) => {
        set((state) => {
          state.pagination.page = page;
        });
        get().applyFiltersLocally();
      },
      
      applyFiltersLocally: () => {
        const { allAttendances, filters, sortOptions, pagination } = get();
        
        let filtered = filterAttendances(allAttendances, filters);
        filtered = sortAttendances(filtered, sortOptions);
        
        const total = filtered.length;
        const totalPages = Math.ceil(total / pagination.limit);
        const paginated = paginateAttendances(filtered, pagination.page, pagination.limit);
        
        set({
          attendances: paginated,
          pagination: {
            ...pagination,
            total,
            totalPages
          }
        });
      },
      
      // Actions utilitaires
      clearError: () => {
        set({ error: null });
      },
      
      resetFilters: () => {
        set({
          filters: {
            search: '',
            status: undefined,
            classroomId: undefined,
            roomId: undefined,
            dateFrom: undefined,
            dateTo: undefined
          },
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        });
        get().applyFiltersLocally();
      },
      
      fetchStats: async () => {
        try {
          const { allAttendances } = get();
          const stats = calculateStats(allAttendances);
          set({ stats });
        } catch (error: any) {
          console.error('Erreur lors du calcul des statistiques:', error);
        }
      },
      
      // Actions spécifiques
      getAttendancesByDate: async (date: string) => {
        try {
          const { allAttendances } = get();
          return allAttendances.filter(a => a.date === date);
        } catch (error: any) {
          console.error('Erreur:', error);
          return [];
        }
      },
      
      getAttendancesByStudent: async (studentId: string) => {
        try {
          const { allAttendances } = get();
          return allAttendances.filter(a => a.studentId === studentId);
        } catch (error: any) {
          console.error('Erreur:', error);
          return [];
        }
      },
      
      getAttendancesByClassroom: async (classroomId: string) => {
        try {
          const { allAttendances } = get();
          return allAttendances.filter(a => a.classroomId === classroomId);
        } catch (error: any) {
          console.error('Erreur:', error);
          return [];
        }
      }
    }))
  )
));
