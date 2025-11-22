import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import authService from '../../../services/authService';

// Création d'une instance Axios dédiée
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Service pour la gestion des badges
 */
export const badgeService = {
  
  /**
   * Récupérer tous les badges
   */
  getAllBadges: async () => {
    const response = await api.get('/badges/all-badges');
    return response.data;
  },

  /**
   * Récupérer un badge par ID utilisateur (étudiant ou employé)
   */
  getBadgeByUser: async (userId: string, userType: 'student' | 'employee') => {
    const params = userType === 'student' ? { studentId: userId } : { employeeId: userId };
    const response = await api.get('/badges/by-user', { params });
    return response.data;
  },

  /**
   * Récupérer l'historique d'un badge
   */
  getBadgeHistory: async (nfcId: string) => {
    const response = await api.get(`/badges/history/${nfcId}`);
    return response.data;
  },

  /**
   * Récupérer un badge par son ID
   */
  getBadgeById: async (id: string) => {
    const response = await api.get(`/badges/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau badge (sans assignation)
   */
  createBadge: async (nfcId: string) => {
    const response = await api.post('/badges/new-badge', { nfcId });
    return response.data;
  },

  /**
   * Assigner un badge
   */
  assignBadge: async (data: { nfcId: string; studentId?: string; employeeId?: string }) => {
    const response = await api.post('/badges/assign-badge', data);
    return response.data;
  },

  /**
   * Désassigner un badge
   */
  unassignBadge: async (nfcId: string) => {
    const response = await api.post('/badges/unassign-badge', { nfcId });
    return response.data;
  },

  /**
   * Mettre à jour un badge (ex: changer NFC ID)
   */
  updateBadge: async (id: string, data: { nfcId: string }) => {
    const response = await api.patch(`/badges/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer un badge
   */
  deleteBadge: async (id: string) => {
    await api.delete(`/badges/${id}`);
  },

  /**
   * Changer le statut d'un badge (ex: déclarer perdu)
   */
  updateStatus: async (id: string, status: 'active' | 'inactive' | 'lost' | 'damaged') => {
    // Note: L'endpoint PATCH générique /badges/{id} est utilisé.
    // On suppose que le backend accepte { status: '...' }
    const response = await api.patch(`/badges/${id}`, { status });
    return response.data;
  }
};
