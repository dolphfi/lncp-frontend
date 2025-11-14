/**
 * =====================================================
 * SERVICE API POUR LA GESTION DES UTILISATEURS
 * =====================================================
 * Ce service gère toutes les interactions avec l'API
 * backend pour les utilisateurs système
 */

import axios from 'axios';
import { API_CONFIG } from '../../config/api';
import authService from '../authService';
import {
  User,
  UsersResponse,
  CreateUserDto,
  UpdateUserDto,
  UnlockUserResponse,
} from '../../types/user';

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
 * POST /users
 * Créer un nouvel utilisateur (Admin seulement)
 */
export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await axios.post(
    `${API_URL}/users`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * GET /users
 * Obtenir la liste de tous les utilisateurs avec pagination (Admin seulement)
 */
export const getAllUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<UsersResponse> => {
  const response = await axios.get(
    `${API_URL}/users`,
    {
      ...getAuthHeaders(),
      params: { page, limit },
    }
  );
  return response.data;
};

/**
 * GET /users/{id}
 * Obtenir un utilisateur par son ID (Admin seulement)
 */
export const getUserById = async (id: string): Promise<User> => {
  const response = await axios.get(
    `${API_URL}/users/${id}`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * PATCH /users/{id}
 * Modifier les informations d'un utilisateur (Admin seulement)
 */
export const updateUser = async (
  id: string,
  data: UpdateUserDto
): Promise<User> => {
  const response = await axios.patch(
    `${API_URL}/users/${id}`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * DELETE /users/{id}
 * Supprimer un utilisateur (Admin seulement)
 */
export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(
    `${API_URL}/users/${id}`,
    getAuthHeaders()
  );
};

/**
 * POST /users/{id}/unlock
 * Débloquer un compte utilisateur (Admin seulement)
 */
export const unlockUser = async (id: string): Promise<UnlockUserResponse> => {
  const response = await axios.post(
    `${API_URL}/users/${id}/unlock`,
    {},
    getAuthHeaders()
  );
  return response.data;
};

/**
 * Export de tous les services
 */
export const userService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  unlockUser,
};
