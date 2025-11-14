/**
 * Store Zustand pour la gestion du dashboard
 * Gère les données spécifiques au rôle de l'utilisateur (Parent, Student, Teacher)
 */

import { create } from 'zustand';
import { getErrorMessage } from '../utils/errorHandler';
import { dashboardService } from '../services/dashboard/dashboardService';
import type {
  DashboardData,
  ParentDashboard,
  StudentDashboard,
  TeacherDashboard,
  isParentDashboard,
  isStudentDashboard,
  isTeacherDashboard
} from '../types/dashboard';

interface DashboardState {
  // Données
  dashboardData: DashboardData | null;
  
  // États UI
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchDashboard: () => Promise<void>;
  clearDashboard: () => void;
  clearError: () => void;
  
  // Getters typés
  getParentDashboard: () => ParentDashboard | null;
  getStudentDashboard: () => StudentDashboard | null;
  getTeacherDashboard: () => TeacherDashboard | null;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // État initial
  dashboardData: null,
  loading: false,
  error: null,

  // Récupérer les données du dashboard
  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const data = await dashboardService.getDashboardData();
      set({
        dashboardData: data,
        loading: false,
      });
    } catch (error: any) {
      const errorMsg = getErrorMessage(error, 'Erreur lors du chargement du dashboard');
      set({
        error: errorMsg,
        loading: false,
      });
    }
  },

  // Nettoyer les données du dashboard
  clearDashboard: () => {
    set({ dashboardData: null, error: null });
  },

  // Effacer l'erreur
  clearError: () => {
    set({ error: null });
  },

  // Getters typés pour faciliter l'accès aux données
  getParentDashboard: () => {
    const { dashboardData } = get();
    if (!dashboardData) return null;
    
    // Type guard pour vérifier si c'est un ParentDashboard
    if ('parentInfo' in dashboardData && 'children' in dashboardData) {
      return dashboardData as ParentDashboard;
    }
    return null;
  },

  getStudentDashboard: () => {
    const { dashboardData } = get();
    if (!dashboardData) return null;
    
    // Type guard pour vérifier si c'est un StudentDashboard
    if ('studentInfo' in dashboardData && !('parentInfo' in dashboardData)) {
      return dashboardData as StudentDashboard;
    }
    return null;
  },

  getTeacherDashboard: () => {
    const { dashboardData } = get();
    if (!dashboardData) return null;
    
    // Type guard pour vérifier si c'est un TeacherDashboard
    if ('teacherInfo' in dashboardData && 'courses' in dashboardData) {
      return dashboardData as TeacherDashboard;
    }
    return null;
  },
}));
