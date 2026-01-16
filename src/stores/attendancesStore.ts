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
import attendanceService, { ManualAttendanceDto, JustificationDto } from '../services/attendanceService';

// =====================================================
// TYPES POUR LES PRÉSENCES
// =====================================================
export interface Attendance {
  id: string;
  studentId?: string;
  employeeId?: string;
  studentName?: string; // À enrichir si le backend ne renvoie pas le nom directement
  studentMatricule?: string;
  date: string; // timestamp ou date string
  status: 'present' | 'absent' | 'late' | 'excused';
  classroomId?: string;
  classroomName?: string;
  roomId?: string;
  roomName?: string;
  reason?: string; // Pour les justifications ou manuel
  timestamp: string;
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
  userId?: string; // Pour le rapport par utilisateur
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
  allAttendances: Attendance[]; // Cache local pour filtrage client si nécessaire
  userSummary: any | null; // Pour le résumé utilisateur
  loading: boolean;
  error: ApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | 'justify' | 'maintenance' | null;

  // Filtres et pagination
  filters: AttendanceFilters;
  pagination: PaginationOptions;
  sortOptions: { field: string; order: 'asc' | 'desc' };

  // Statistiques
  stats: AttendanceStats | null;

  // Actions principales
  fetchUserReport: (userId: string) => Promise<void>;
  fetchLatenessReport: (date?: string) => Promise<void>;

  recordManualAttendance: (data: ManualAttendanceDto) => Promise<void>;
  justifyAttendance: (id: string, data: JustificationDto) => Promise<void>;

  // Maintenance Admin
  cleanupInvalidAbsences: () => Promise<void>;
  reprocessAbsences: (date: string) => Promise<void>;
  forceAbsenceDetection: () => Promise<void>;

  // Actions de filtrage et tri
  setFilters: (filters: Partial<AttendanceFilters>) => void;
  setSortOptions: (sort: { field: string; order: 'asc' | 'desc' }) => void;
  changePage: (page: number) => void;
  applyFiltersLocally: () => void;

  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
}

// =====================================================
// UTILITAIRES
// =====================================================

// Mapping des statuts backend (français) vers frontend (anglais lowercase)
const statusMapping: Record<string, Attendance['status']> = {
  'Présent': 'present',
  'En retard': 'late',
  'Absent': 'absent',
  'Justifié': 'excused',
  'Incomplet': 'absent', // Fallback
  'Sortie anticipée': 'present', // Fallback
};

// Transforme les données du backend vers le format frontend
const transformBackendAttendance = (backendData: any): Attendance => {
  // Extraire les informations de l'étudiant ou de l'employé
  const student = backendData.student;
  const employee = backendData.employee;

  // Déterminer le nom et autres infos
  let studentName = '';
  let studentMatricule = '';
  let studentId = '';
  let classroomName = '';
  let classroomId = '';

  if (student) {
    studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
      `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim();
    studentMatricule = student.matricule || student.studentId || '';
    studentId = student.id || '';
    classroomName = student.classroom?.name || '';
    classroomId = student.classroom?.id || '';
  } else if (employee) {
    studentName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() ||
      `${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`.trim();
    studentMatricule = employee.employeeId || employee.code || '';
    studentId = employee.id || '';
  }

  // Mapper le statut
  const backendStatus = backendData.status || '';
  const mappedStatus = statusMapping[backendStatus] || 'absent';

  return {
    id: backendData.id,
    studentId: studentId || backendData.studentId,
    employeeId: backendData.employee?.id || backendData.employeeId,
    studentName,
    studentMatricule,
    date: backendData.timestamp || backendData.date,
    status: mappedStatus,
    classroomId,
    classroomName,
    roomId: backendData.roomId,
    roomName: backendData.roomName,
    reason: backendData.reason || backendData.justification,
    timestamp: backendData.timestamp,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
  };
};

// Transforme un tableau de données backend
const transformBackendAttendances = (backendData: any[]): Attendance[] => {
  return backendData.map(transformBackendAttendance);
};

const filterAttendances = (attendances: Attendance[], filters: AttendanceFilters): Attendance[] => {
  return attendances.filter(attendance => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        (attendance.studentName?.toLowerCase().includes(searchTerm) ?? false) ||
        (attendance.studentMatricule?.toLowerCase().includes(searchTerm) ?? false) ||
        (attendance.classroomName?.toLowerCase().includes(searchTerm) ?? false);
      if (!matchesSearch) return false;
    }

    if (filters.status && attendance.status !== filters.status) return false;
    if (filters.classroomId && attendance.classroomId !== filters.classroomId) return false;

    if (filters.dateFrom) {
      const attendanceDate = new Date(attendance.timestamp || attendance.date);
      const fromDate = new Date(filters.dateFrom);
      if (attendanceDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const attendanceDate = new Date(attendance.timestamp || attendance.date);
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

// =====================================================
// CRÉATION DU STORE
// =====================================================
export const useAttendanceStore = create<AttendanceStore>()((
  subscribeWithSelector(
    immer((set, get) => ({
      // État initial
      attendances: [],
      allAttendances: [],
      userSummary: null,
      loading: false,
      error: null,
      loadingAction: null,

      filters: {
        search: '',
        status: undefined,
        classroomId: undefined,
        roomId: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        userId: undefined
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      sortOptions: {
        field: 'timestamp',
        order: 'desc'
      },

      stats: null,

      // Actions principales

      fetchUserReport: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          const data = await attendanceService.getUserReport(userId);
          // Transformer les données backend vers le format frontend
          const rawAttendances = Array.isArray(data) ? data : [];
          const attendances = transformBackendAttendances(rawAttendances);

          set({
            allAttendances: attendances,
            loading: false
          });

          // Récupérer aussi le résumé
          try {
            const summary = await attendanceService.getUserSummary(userId);
            set({ userSummary: summary });
          } catch (e) {
            console.warn('Impossible de récupérer le résumé utilisateur', e);
          }

          get().applyFiltersLocally();
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors du chargement du rapport utilisateur',
              code: error.code || 'FETCH_ERROR'
            },
            loading: false
          });
        }
      },

      fetchLatenessReport: async (date?: string) => {
        set({ loading: true, error: null });
        try {
          // Si pas de date, utiliser aujourd'hui. 
          // Le backend semble strict sur le format ISO 8601.
          // Si date est "YYYY-MM-DD", on ajoute une heure pour faire un ISO valide
          let dateParam = date;
          if (!dateParam) {
            dateParam = new Date().toISOString();
          } else if (dateParam.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Si format YYYY-MM-DD, convertir en ISO complet (début de journée)
            dateParam = new Date(dateParam).toISOString();
          }

          const data = await attendanceService.getLatenessReport(dateParam);
          // Transformer les données backend vers le format frontend
          const rawAttendances = Array.isArray(data) ? data : [];
          const attendances = transformBackendAttendances(rawAttendances);

          set({
            allAttendances: attendances,
            loading: false
          });

          get().applyFiltersLocally();
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors du chargement des retards',
              code: error.code || 'FETCH_ERROR'
            },
            loading: false
          });
        }
      },

      recordManualAttendance: async (data: ManualAttendanceDto) => {
        set({ loadingAction: 'create', error: null });
        try {
          await attendanceService.recordManual(data);
          // Rafraîchir la liste si un filtre utilisateur est actif
          const { filters } = get();
          if (filters.userId) {
            await get().fetchUserReport(filters.userId);
          } else {
            // Sinon on ne peut pas facilement rafraîchir "tout", on laisse tel quel ou on vide
            // Optionnel: toast success géré par le composant
          }
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors du pointage manuel',
              code: error.code || 'CREATE_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      justifyAttendance: async (id: string, data: JustificationDto) => {
        set({ loadingAction: 'justify', error: null });
        try {
          await attendanceService.justify(id, data);

          // Mettre à jour localement pour éviter un rechargement complet
          set((state) => {
            const index = state.allAttendances.findIndex(a => a.id === id);
            if (index !== -1) {
              state.allAttendances[index].reason = data.justification;
              // On pourrait aussi changer le statut si l'API le renvoie, mais ici on suppose
            }
          });

          get().applyFiltersLocally();
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors de la justification',
              code: error.code || 'JUSTIFY_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      // Maintenance Admin
      cleanupInvalidAbsences: async () => {
        set({ loadingAction: 'maintenance', error: null });
        try {
          await attendanceService.cleanupInvalidAbsences();
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors du nettoyage',
              code: 'MAINTENANCE_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      reprocessAbsences: async (date: string) => {
        set({ loadingAction: 'maintenance', error: null });
        try {
          await attendanceService.reprocessAbsences(date);
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors du re-traitement',
              code: 'MAINTENANCE_ERROR'
            },
            loadingAction: null
          });
          throw error;
        }
      },

      forceAbsenceDetection: async () => {
        set({ loadingAction: 'maintenance', error: null });
        try {
          await attendanceService.forceAbsenceDetection();
          set({ loadingAction: null });
        } catch (error: any) {
          set({
            error: {
              message: error.message || 'Erreur lors de la détection forcée',
              code: 'MAINTENANCE_ERROR'
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
            dateTo: undefined,
            userId: undefined
          },
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        });
        get().applyFiltersLocally();
      }
    }))
  )
));

