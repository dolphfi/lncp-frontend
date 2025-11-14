/**
 * =====================================================
 * SERVICE API POUR LA GESTION DES PARAMÈTRES
 * =====================================================
 * Ce service gère toutes les interactions avec l'API
 * backend pour les paramètres système
 */

import axios from 'axios';
import { API_CONFIG } from '../../config/api';
import authService from '../authService';
import {
  Setting,
  SettingsResponse,
  CreateSettingDto,
  UpdateSettingDto,
  MaintenanceResponse,
  MaintenanceStatusResponse,
  MaintenancePublicStatusResponse,
} from '../../types/setting';

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
 * GET /settings/all-settings
 * Récupérer tous les paramètres (avec pagination)
 */
export const getAllSettings = async (
  page: number = 1,
  limit: number = 100
): Promise<SettingsResponse> => {
  const response = await axios.get(
    `${API_URL}/settings/all-settings`,
    {
      ...getAuthHeaders(),
      params: { page, limit },
    }
  );
  return response.data;
};

/**
 * GET /settings/group/{group}
 * Récupérer tous les paramètres d'un groupe spécifique
 */
export const getSettingsByGroup = async (group: string): Promise<Setting[]> => {
  const response = await axios.get(
    `${API_URL}/settings/group/${group}`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * GET /settings/{id}
 * Récupérer un paramètre par son ID
 */
export const getSettingById = async (id: string): Promise<Setting> => {
  const response = await axios.get(
    `${API_URL}/settings/${id}`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * GET /settings/key/{key}
 * Récupérer un paramètre par sa clé
 */
export const getSettingByKey = async (key: string): Promise<Setting> => {
  const response = await axios.get(
    `${API_URL}/settings/key/${key}`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * POST /settings/add-setting
 * Créer un nouveau paramètre
 */
export const createSetting = async (data: CreateSettingDto): Promise<Setting> => {
  const response = await axios.post(
    `${API_URL}/settings/add-setting`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * PATCH /settings/{id}
 * Mettre à jour un paramètre par son ID
 */
export const updateSettingById = async (
  id: string,
  data: UpdateSettingDto
): Promise<Setting> => {
  const response = await axios.patch(
    `${API_URL}/settings/${id}`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * PATCH /settings/key/{key}
 * Mettre à jour un paramètre par sa clé
 */
export const updateSettingByKey = async (
  key: string,
  data: UpdateSettingDto
): Promise<Setting> => {
  const response = await axios.patch(
    `${API_URL}/settings/key/${key}`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * DELETE /settings/id/{id}
 * Supprimer un paramètre
 */
export const deleteSetting = async (id: string): Promise<void> => {
  await axios.delete(
    `${API_URL}/settings/id/${id}`,
    getAuthHeaders()
  );
};

/**
 * POST /settings/upload-logo
 * Uploader le logo de l'école
 */
export const uploadLogo = async (
  file: File,
  label: string,
  description?: string
): Promise<Setting> => {
  const formData = new FormData();
  formData.append('key', 'SCHOOL_LOGO_URL');
  formData.append('value', file);
  formData.append('label', label);
  formData.append('group', 'GENERAL');
  if (description) {
    formData.append('description', description);
  }

  const response = await axios.post(
    `${API_URL}/settings/upload-logo`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${authService.getAccessToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * POST /settings/upload-header
 * Uploader l'en-tête de l'école
 */
export const uploadHeader = async (
  file: File,
  label: string,
  description?: string
): Promise<Setting> => {
  const formData = new FormData();
  formData.append('key', 'SCHOOL_ENTETE_URL');
  formData.append('value', file);
  formData.append('label', label);
  formData.append('group', 'GENERAL');
  if (description) {
    formData.append('description', description);
  }

  const response = await axios.post(
    `${API_URL}/settings/upload-header`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${authService.getAccessToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * POST /settings/maintenance/enable
 * Activer le mode maintenance (SUPER_ADMIN uniquement)
 */
export const enableMaintenance = async (): Promise<MaintenanceResponse> => {
  const response = await axios.post(
    `${API_URL}/settings/maintenance/enable`,
    {},
    getAuthHeaders()
  );
  return response.data;
};

/**
 * POST /settings/maintenance/disable
 * Désactiver le mode maintenance (SUPER_ADMIN uniquement)
 */
export const disableMaintenance = async (): Promise<MaintenanceResponse> => {
  const response = await axios.post(
    `${API_URL}/settings/maintenance/disable`,
    {},
    getAuthHeaders()
  );
  return response.data;
};

/**
 * GET /settings/maintenance/status
 * Vérifier le statut du mode maintenance (SUPER_ADMIN ou ADMIN)
 */
export const getMaintenanceStatus = async (): Promise<MaintenanceStatusResponse> => {
  const response = await axios.get(
    `${API_URL}/settings/maintenance/status`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * GET /settings/maintenance/public-status
 * Vérifier le statut public du mode maintenance (sans authentification)
 */
export const getMaintenancePublicStatus = async (): Promise<MaintenancePublicStatusResponse> => {
  const response = await axios.get(
    `${API_URL}/settings/maintenance/public-status`
  );
  return response.data;
};

/**
 * Export de tous les services
 */
export const settingService = {
  getAllSettings,
  getSettingsByGroup,
  getSettingById,
  getSettingByKey,
  createSetting,
  updateSettingById,
  updateSettingByKey,
  deleteSetting,
  uploadLogo,
  uploadHeader,
  enableMaintenance,
  disableMaintenance,
  getMaintenanceStatus,
  getMaintenancePublicStatus,
};
