/**
 * =====================================================
 * SERVICE API POUR LA GESTION DES RÉINSCRIPTIONS
 * =====================================================
 * Ce service gère tous les appels API liés aux réinscriptions
 */

import axios from 'axios';
import { getApiUrl } from '../../config/api';
import authService from '../authService';

// Créer une instance axios avec l'URL de base
const api = axios.create({
  baseURL: getApiUrl(''),
  withCredentials: true
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Structure des données archivées depuis le backend
 */
export interface ArchivedStudentData {
  archiveId: string;
  archivedAt: string;
  id: string;
  matricule: string;
  userId: string;
  sexe: string;
  dateOfBirth: string;
  lieuDeNaissance: string;
  communeDeNaissance: string;
  handicap: string;
  handicapDetails: string;
  vacation: string;
  niveauEnseignement: string;
  niveauEtude: string;
  nomMere: string;
  prenomMere: string;
  statutMere: string;
  occupationMere: string;
  nomPere: string;
  prenomPere: string;
  statutPere: string;
  occupationPere: string;
  classroomId: string;
  roomId: string;
  personneResponsableId: string;
  adresseAdresseligne1: string | null;
  adresseDepartement: string | null;
  adresseCommune: string | null;
  adresseSectioncommunale: string | null;
  notes: any[];
  moyenneGenerale: number;
  moyenneT1: number;
  moyenneT2: number;
  decision: string;
  ponderationT1: number;
  ponderationT2: number;
  ponderationT3: number;
  ponderationTotale: number;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Structure pour la réinscription individuelle
 */
export interface ReRegisterOneDto {
  newClassroomId?: string;
  newRoomId?: string;
}

/**
 * Structure de réponse pour la réinscription individuelle
 */
export interface ReRegisterOneResponse {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  niveauEtude: string;
  classroom: {
    id: string;
    name: string;
  };
  room: {
    id: string;
    name: string;
  };
}

/**
 * Structure de résultat pour la réinscription en masse
 */
export interface BulkReRegistrationResult {
  studentId: string;
  matricule: string;
  status: 'success' | 'failed';
  decision?: string;
  message: string;
  error?: string;
}

/**
 * Structure de réponse pour la réinscription en masse
 */
export interface BulkReRegistrationResponse {
  success: number;
  failed: number;
  results: BulkReRegistrationResult[];
}

/**
 * =====================================================
 * FONCTIONS DU SERVICE
 * =====================================================
 */

/**
 * Récupère les données archivées de l'année précédant l'année académique planifiée
 */
export const getArchivedData = async (): Promise<ArchivedStudentData[]> => {
  try {
    const response = await api.get<ArchivedStudentData[]>('/re-registration/archived-data');
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des données archivées:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des données archivées');
  }
};

/**
 * Réinscrit un étudiant individuellement
 * @param archivedStudentId - ID de l'étudiant archivé
 * @param data - Données optionnelles pour l'assignation manuelle
 */
export const reRegisterOne = async (
  archivedStudentId: string,
  data?: ReRegisterOneDto
): Promise<ReRegisterOneResponse> => {
  try {
    const response = await api.post<ReRegisterOneResponse>(
      `/re-registration/re-registerOne/${archivedStudentId}`,
      data || {}
    );
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la réinscription individuelle:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la réinscription');
  }
};

/**
 * Réinscrit tous les étudiants d'une classe en masse
 * @param classroomId - ID de la classe archivée
 */
export const reRegisterClassroom = async (
  classroomId: string
): Promise<BulkReRegistrationResponse> => {
  try {
    const response = await api.post<BulkReRegistrationResponse>(
      `/re-registration/re-register-classroom/${classroomId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la réinscription en masse:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la réinscription en masse');
  }
};
