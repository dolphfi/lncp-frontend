/**
 * =====================================================
 * SERVICE API POUR LE MODULE ARCHIVES
 * =====================================================
 * Gère toutes les requêtes HTTP vers l'API backend
 * pour la gestion des archives des années académiques
 */

import axios, { AxiosResponse } from 'axios';
import type {
  ArchivedYear,
  ArchivedData,
  ArchiveStats,
  CreateArchiveDto,
  RestoreArchiveDto,
  ArchiveDataType,
} from '../../types/archive';

// Configuration de base pour Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const ARCHIVE_ENDPOINT = `${API_BASE_URL}/archives`;

/**
 * Mode de développement : utilise des données mockées si l'API n'est pas disponible
 */
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_ARCHIVES !== 'false';

/**
 * Configuration Axios avec authentification JWT
 */
const axiosInstance = axios.create({
  baseURL: ARCHIVE_ENDPOINT,
  timeout: 30000, // 30 secondes pour les archives (fichiers volumineux)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs globalement
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne pas rediriger pour les erreurs d'archives (endpoint pas encore implémenté)
    if (error.config?.baseURL?.includes('/archives')) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * =====================================================
 * DONNÉES MOCKÉES POUR LE DÉVELOPPEMENT
 * =====================================================
 */
const mockArchivedYears: ArchivedYear[] = [
  {
    id: 'ay-2022-2023',
    name: '2022-2023',
    startDate: '2022-09-01',
    endDate: '2023-06-30',
    archivedAt: '2023-07-15T10:30:00Z',
    archivedBy: 'admin@lncp.edu.ht',
    status: 'archived',
    size: '2.5 GB',
    recordsCount: {
      students: 450,
      employees: 85,
      courses: 120,
      payments: 1250,
      grades: 8900,
      attendance: 15000,
      bulletins: 1800,
    },
    description: 'Archive de l\'année scolaire 2022-2023',
  },
  {
    id: 'ay-2021-2022',
    name: '2021-2022',
    startDate: '2021-09-01',
    endDate: '2022-06-30',
    archivedAt: '2022-07-10T14:20:00Z',
    archivedBy: 'admin@lncp.edu.ht',
    status: 'archived',
    size: '2.3 GB',
    recordsCount: {
      students: 420,
      employees: 82,
      courses: 115,
      payments: 1180,
      grades: 8400,
      attendance: 14500,
      bulletins: 1680,
    },
    description: 'Archive de l\'année scolaire 2021-2022',
  },
  {
    id: 'ay-2020-2021',
    name: '2020-2021',
    startDate: '2020-09-01',
    endDate: '2021-06-30',
    archivedAt: '2021-07-12T09:45:00Z',
    archivedBy: 'admin@lncp.edu.ht',
    status: 'archived',
    size: '2.1 GB',
    recordsCount: {
      students: 400,
      employees: 80,
      courses: 110,
      payments: 1100,
      grades: 8000,
      attendance: 14000,
      bulletins: 1600,
    },
    description: 'Archive de l\'année scolaire 2020-2021',
  },
];

const mockStats: ArchiveStats = {
  totalYears: 3,
  totalSize: '6.9 GB',
  latestArchive: mockArchivedYears[0],
  oldestArchive: mockArchivedYears[2],
};

const mockArchivedData: Record<ArchiveDataType, any[]> = {
  students: [
    { id: '1', name: 'Jean Dupont', matricule: 'LNCP-JD-2022-001', grade: 'NS I' },
    { id: '2', name: 'Marie Martin', matricule: 'LNCP-MM-2022-002', grade: 'NS II' },
  ],
  employees: [
    { id: '1', name: 'Pierre Leclerc', role: 'TEACHER', department: 'Mathématiques' },
    { id: '2', name: 'Sophie Bernard', role: 'TEACHER', department: 'Français' },
  ],
  courses: [
    { id: '1', name: 'Mathématiques', level: 'NS I', hours: 4 },
    { id: '2', name: 'Français', level: 'NS I', hours: 5 },
  ],
  payments: [
    { id: '1', amount: 5000, type: 'CASH', status: 'COMPLETED' },
    { id: '2', amount: 7500, type: 'CHECK', status: 'COMPLETED' },
  ],
  grades: [
    { id: '1', student: 'Jean Dupont', course: 'Mathématiques', grade: 85 },
    { id: '2', student: 'Marie Martin', course: 'Français', grade: 90 },
  ],
  attendance: [
    { id: '1', student: 'Jean Dupont', date: '2023-01-15', status: 'present' },
    { id: '2', student: 'Marie Martin', date: '2023-01-15', status: 'present' },
  ],
  bulletins: [
    { id: '1', student: 'Jean Dupont', period: 'Trimestre 1', average: 87 },
    { id: '2', student: 'Marie Martin', period: 'Trimestre 1', average: 92 },
  ],
};

/**
 * =====================================================
 * FONCTIONS DU SERVICE ARCHIVES
 * =====================================================
 */

/**
 * Récupère toutes les années académiques archivées
 * @returns Promise<ArchivedYear[]> - Liste des années archivées
 */
export const getAllArchivedYears = async (): Promise<ArchivedYear[]> => {
  if (USE_MOCK_DATA) {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('📦 [Archives] Utilisation des données mockées');
    return mockArchivedYears;
  }
  
  try {
    const response: AxiosResponse<ArchivedYear[]> = await axiosInstance.get('/years');
    return response.data;
  } catch (error: any) {
    console.warn('⚠️ API Archives non disponible, utilisation des données mockées');
    return mockArchivedYears;
  }
};

/**
 * Récupère une année archivée par son ID
 * @param yearId - ID de l'année archivée
 * @returns Promise<ArchivedYear> - Détails de l'année archivée
 */
export const getArchivedYearById = async (yearId: string): Promise<ArchivedYear> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const year = mockArchivedYears.find(y => y.id === yearId);
    if (!year) throw new Error('Archive introuvable');
    return year;
  }
  
  try {
    const response: AxiosResponse<ArchivedYear> = await axiosInstance.get(`/years/${yearId}`);
    return response.data;
  } catch (error: any) {
    console.warn('⚠️ API Archives non disponible, utilisation des données mockées');
    const year = mockArchivedYears.find(y => y.id === yearId);
    if (!year) throw new Error('Archive introuvable');
    return year;
  }
};

/**
 * Récupère les statistiques globales des archives
 * @returns Promise<ArchiveStats> - Statistiques des archives
 */
export const getArchiveStats = async (): Promise<ArchiveStats> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStats;
  }
  
  try {
    const response: AxiosResponse<ArchiveStats> = await axiosInstance.get('/stats');
    return response.data;
  } catch (error: any) {
    console.warn('⚠️ API Archives non disponible, utilisation des données mockées');
    return mockStats;
  }
};

/**
 * Récupère les données archivées pour une année spécifique
 * @param yearId - ID de l'année archivée
 * @param dataType - Type de données à récupérer
 * @returns Promise<ArchivedData> - Données archivées
 */
export const getArchivedData = async (
  yearId: string,
  dataType: ArchiveDataType
): Promise<ArchivedData> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const year = mockArchivedYears.find(y => y.id === yearId);
    if (!year) throw new Error('Archive introuvable');
    
    return {
      yearId,
      yearName: year.name,
      dataType,
      data: mockArchivedData[dataType] || [],
      metadata: {
        totalRecords: mockArchivedData[dataType]?.length || 0,
        fetchedAt: new Date().toISOString(),
        dataSize: '2.5 MB',
      },
    };
  }
  
  try {
    const response: AxiosResponse<ArchivedData> = await axiosInstance.get(
      `/years/${yearId}/data/${dataType}`
    );
    return response.data;
  } catch (error: any) {
    console.warn('⚠️ API Archives non disponible, utilisation des données mockées');
    const year = mockArchivedYears.find(y => y.id === yearId);
    if (!year) throw new Error('Archive introuvable');
    
    return {
      yearId,
      yearName: year.name,
      dataType,
      data: mockArchivedData[dataType] || [],
      metadata: {
        totalRecords: mockArchivedData[dataType]?.length || 0,
        fetchedAt: new Date().toISOString(),
        dataSize: '2.5 MB',
      },
    };
  }
};

/**
 * Crée une nouvelle archive pour une année académique
 * @param data - Données de création de l'archive
 * @returns Promise<ArchivedYear> - Archive créée
 */
export const createArchive = async (data: CreateArchiveDto): Promise<ArchivedYear> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('📦 [Archives] Simulation création archive (mode mock)');
    throw new Error('Fonctionnalité non disponible en mode développement');
  }
  
  try {
    const response: AxiosResponse<ArchivedYear> = await axiosInstance.post('/create', data);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'archive:', error);
    throw new Error(error.response?.data?.message || 'Impossible de créer l\'archive');
  }
};

/**
 * Restaure des données depuis une archive
 * @param data - Données de restauration
 * @returns Promise<void>
 */
export const restoreArchive = async (data: RestoreArchiveDto): Promise<void> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('📦 [Archives] Simulation restauration archive (mode mock)');
    throw new Error('Fonctionnalité non disponible en mode développement');
  }
  
  try {
    await axiosInstance.post('/restore', data);
  } catch (error: any) {
    console.error('Erreur lors de la restauration de l\'archive:', error);
    throw new Error(error.response?.data?.message || 'Impossible de restaurer l\'archive');
  }
};

/**
 * Supprime une archive
 * @param yearId - ID de l'année archivée à supprimer
 * @returns Promise<void>
 */
export const deleteArchive = async (yearId: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`📦 [Archives] Simulation suppression archive ${yearId} (mode mock)`);
    // En mode mock, on simule une suppression réussie
    return;
  }
  
  try {
    await axiosInstance.delete(`/years/${yearId}`);
  } catch (error: any) {
    console.error(`Erreur lors de la suppression de l'archive ${yearId}:`, error);
    throw new Error(error.response?.data?.message || 'Impossible de supprimer l\'archive');
  }
};

/**
 * Télécharge une archive complète
 * @param yearId - ID de l'année archivée
 * @returns Promise<Blob> - Fichier archive
 */
export const downloadArchive = async (yearId: string): Promise<Blob> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`📦 [Archives] Simulation téléchargement archive ${yearId} (mode mock)`);
    // Créer un blob fictif pour simuler le téléchargement
    const content = JSON.stringify({ message: 'Archive mockée', yearId }, null, 2);
    return new Blob([content], { type: 'application/zip' });
  }
  
  try {
    const response: AxiosResponse<Blob> = await axiosInstance.get(
      `/years/${yearId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error: any) {
    console.error(`Erreur lors du téléchargement de l'archive ${yearId}:`, error);
    throw new Error(error.response?.data?.message || 'Impossible de télécharger l\'archive');
  }
};

/**
 * Exporte les données archivées au format spécifié
 * @param yearId - ID de l'année archivée
 * @param dataType - Type de données à exporter
 * @param format - Format d'export (pdf, excel, csv)
 * @returns Promise<Blob> - Fichier exporté
 */
export const exportArchivedData = async (
  yearId: string,
  dataType: ArchiveDataType,
  format: 'pdf' | 'excel' | 'csv'
): Promise<Blob> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`📦 [Archives] Simulation export ${dataType} en ${format} (mode mock)`);
    
    // Créer un blob fictif pour simuler l'export
    const data = mockArchivedData[dataType] || [];
    const content = format === 'csv' 
      ? 'ID,Name,Value\n1,Test,123\n2,Test2,456'
      : JSON.stringify(data, null, 2);
    
    const mimeTypes = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
    };
    
    return new Blob([content], { type: mimeTypes[format] });
  }
  
  try {
    const response: AxiosResponse<Blob> = await axiosInstance.get(
      `/years/${yearId}/export/${dataType}`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`Erreur lors de l'export des données ${dataType}:`, error);
    throw new Error(error.response?.data?.message || 'Impossible d\'exporter les données');
  }
};

export default {
  getAllArchivedYears,
  getArchivedYearById,
  getArchiveStats,
  getArchivedData,
  createArchive,
  restoreArchive,
  deleteArchive,
  downloadArchive,
  exportArchivedData,
};
