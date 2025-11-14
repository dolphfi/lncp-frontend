/**
 * Service API pour le dashboard
 * GET /dashboard - Retourne des données spécifiques au rôle de l'utilisateur
 */

import axios from 'axios';
import { API_CONFIG } from '../../config/api';
import authService from '../authService';
import type { DashboardData } from '../../types/dashboard';

const API_URL = API_CONFIG.BASE_URL;

/**
 * Configuration axios avec authentification
 */
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getAccessToken()}`,
  },
});

/**
 * GET /dashboard
 * Récupère les données du dashboard selon le rôle de l'utilisateur
 * - PARENT: Données des enfants avec notes, paiements, présences, emploi du temps
 * - STUDENT: Notes (si frais payés), paiements, présences, emploi du temps
 * - TEACHER: Cours assignés et emploi du temps
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get(
    `${API_URL}/dashboard`,
    getAuthHeaders()
  );
  return response.data;
};

// Export de tous les services
export const dashboardService = {
  getDashboardData,
};

export default dashboardService;
