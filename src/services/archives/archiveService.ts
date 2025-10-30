/**
 * =====================================================
 * SERVICE API POUR LA GESTION DES ARCHIVES - VERSION 2.0
 * =====================================================
 * Service complet pour gérer les archives des années académiques
 * Compatible avec les nouveaux endpoints backend refactorés
 */

import axios, { AxiosResponse } from 'axios';
import { API_CONFIG } from '../../config/api';
import { authService } from '../authService';
import type {
  Archive,
  AllArchivesResponse,
  ArchiveYearResponse,
  CanArchiveResponse,
  PaginatedResponse,
  ArchiveStatistics,
  SearchStudentDto,
  SearchStudentResponse,
  ReleveNotesResponse,
  AdvancedSearchDto,
  CheckArchivableYearsResponse,
  CurrentYearStatusResponse,
  ClearTablesResponse,
  EntityType,
} from '../../types/archive';

// Configuration axios pour les archives
const axiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/archives`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ [Archives] Token expiré');
      // authService.logout(); // Optionnel
    }
    return Promise.reject(error);
  }
);

/**
 * =====================================================
 * 1. ARCHIVAGE D'ANNÉES ACADÉMIQUES
 * =====================================================
 */

/**
 * Archive une année académique complète
 * POST /archives/academic-year/{academicYear}
 * @param academicYear - Année académique (format: 2023-2024)
 * @param description - Description optionnelle
 */
export const archiveAcademicYear = async (
  academicYear: string,
  description?: string
): Promise<ArchiveYearResponse> => {
  try {
    console.log(`📦 [Archives] Archivage de l'année ${academicYear}...`);
    
    const response: AxiosResponse<ArchiveYearResponse> = await axiosInstance.post(
      `/academic-year/${academicYear}`,
      description ? { description } : {}
    );
    
    console.log('✅ [Archives] Archivage réussi:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [Archives] Erreur lors de l\'archivage:', error);
    throw new Error(
      error.response?.data?.message || 
      `Impossible d'archiver l'année ${academicYear}`
    );
  }
};

/**
 * Vérifie si une année académique peut être archivée
 * GET /archives/can-archive/{year}
 * @param year - Année académique (format: 2023-2024)
 */
export const canArchiveYear = async (year: string): Promise<CanArchiveResponse> => {
  try {
    const response: AxiosResponse<CanArchiveResponse> = await axiosInstance.get(
      `/can-archive/${year}`
    );
    return response.data;
  } catch (error: any) {
    console.error(`❌ [Archives] Erreur lors de la vérification de ${year}:`, error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de vérifier l\'éligibilité à l\'archivage'
    );
  }
};

/**
 * =====================================================
 * 2. RÉCUPÉRATION DES DONNÉES ARCHIVÉES
 * =====================================================
 */

/**
 * Récupère les étudiants archivés d'une année
 * GET /archives/students/{year}
 * @param year - Année académique
 * @param page - Numéro de page
 * @param limit - Nombre d'éléments par page
 */
export const getArchivedStudents = async (
  year: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<any>> => {
  try {
    const response: AxiosResponse<PaginatedResponse<any>> = await axiosInstance.get(
      `/students/${year}`,
      { params: { page, limit } }
    );
    return response.data;
  } catch (error: any) {
    console.error(`❌ [Archives] Erreur récupération étudiants ${year}:`, error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de récupérer les étudiants archivés'
    );
  }
};

/**
 * Récupère les paiements archivés d'une année
 * GET /archives/payments/{year}
 */
export const getArchivedPayments = async (
  year: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<any>> => {
  try {
    const response: AxiosResponse<PaginatedResponse<any>> = await axiosInstance.get(
      `/payments/${year}`,
      { params: { page, limit } }
    );
    return response.data;
  } catch (error: any) {
    console.error(`❌ [Archives] Erreur récupération paiements ${year}:`, error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de récupérer les paiements archivés'
    );
  }
};

/**
 * Récupère les notes archivées d'une année
 * GET /archives/notes/{year}
 */
export const getArchivedNotes = async (
  year: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<any>> => {
  try {
    const response: AxiosResponse<PaginatedResponse<any>> = await axiosInstance.get(
      `/notes/${year}`,
      { params: { page, limit } }
    );
    return response.data;
  } catch (error: any) {
    console.error(`❌ [Archives] Erreur récupération notes ${year}:`, error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de récupérer les notes archivées'
    );
  }
};

/**
 * =====================================================
 * 3. RECHERCHE D'ÉTUDIANTS ARCHIVÉS
 * =====================================================
 */

/**
 * Recherche un étudiant spécifique dans les archives
 * POST /archives/student/search
 * @param searchCriteria - Critères de recherche
 */
export const searchArchivedStudent = async (
  searchCriteria: SearchStudentDto
): Promise<SearchStudentResponse> => {
  try {
    console.log('🔍 [Archives] Recherche étudiant:', searchCriteria);
    
    const response: AxiosResponse<SearchStudentResponse> = await axiosInstance.post(
      '/student/search',
      searchCriteria
    );
    
    console.log('✅ [Archives] Étudiant trouvé:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [Archives] Erreur recherche étudiant:', error);
    throw new Error(
      error.response?.data?.message || 
      'Étudiant non trouvé dans les archives'
    );
  }
};

/**
 * Récupère le relevé de notes d'un étudiant archivé
 * POST /archives/releves-notes
 * @param searchCriteria - Critères de recherche
 */
export const getArchivedReleveNotes = async (
  searchCriteria: SearchStudentDto
): Promise<ReleveNotesResponse> => {
  try {
    console.log('📄 [Archives] Récupération relevé de notes:', searchCriteria);
    
    const response: AxiosResponse<ReleveNotesResponse> = await axiosInstance.post(
      '/releves-notes',
      searchCriteria
    );
    
    return response.data;
  } catch (error: any) {
    console.error('❌ [Archives] Erreur relevé de notes:', error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de récupérer le relevé de notes'
    );
  }
};

/**
 * =====================================================
 * 4. STATISTIQUES ET INFORMATIONS GLOBALES
 * =====================================================
 */

/**
 * Obtient les statistiques complètes d'archivage
 * GET /archives/stats
 */
export const getArchiveStatistics = async (): Promise<ArchiveStatistics> => {
  try {
    const response: AxiosResponse<ArchiveStatistics> = await axiosInstance.get('/stats');
    console.log('📊 [Archives] Statistiques récupérées:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [Archives] Erreur statistiques:', error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de récupérer les statistiques'
    );
  }
};

/**
 * Récupère toutes les archives avec pagination
 * GET /archives/all-archives
 */
export const getAllArchives = async (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'archivedAt',
  sortOrder: 'ASC' | 'DESC' = 'DESC'
): Promise<AllArchivesResponse> => {
  try {
    const response: AxiosResponse<AllArchivesResponse> = await axiosInstance.get(
      '/all-archives',
      { params: { page, limit, sortBy, sortOrder } }
    );
    
    console.log('📦 [Archives] Archives récupérées:', response.data.pagination);
    return response.data;
  } catch (error: any) {
    console.error('❌ [Archives] Erreur récupération archives:', error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de récupérer les archives'
    );
  }
};

/**
 * =====================================================
 * 5. RECHERCHE AVANCÉE
 * =====================================================
 */

/**
 * Effectue une recherche avancée dans toutes les archives
 * POST /archives/search
 * @param searchCriteria - Critères de recherche avancés
 */
export const advancedSearch = async (
  searchCriteria: AdvancedSearchDto
): Promise<PaginatedResponse<Archive>> => {
  try {
    console.log('🔍 [Archives] Recherche avancée:', searchCriteria);
    
    const response: AxiosResponse<PaginatedResponse<Archive>> = await axiosInstance.post(
      '/search',
      searchCriteria
    );
    
    return response.data;
  } catch (error: any) {
    console.error('❌ [Archives] Erreur recherche avancée:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la recherche avancée'
    );
  }
};

/**
 * =====================================================
 * 6. VÉRIFICATION ET GESTION DES ANNÉES
 * =====================================================
 */

/**
 * Vérifie quelles années académiques peuvent être archivées
 * GET /archives/check-archivable-years
 */
export const checkArchivableYears = async (): Promise<CheckArchivableYearsResponse> => {
  try {
    const response: AxiosResponse<CheckArchivableYearsResponse> = await axiosInstance.get(
      '/check-archivable-years'
    );
    
    console.log('✅ [Archives] Années archivables:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [Archives] Erreur vérification années:', error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de vérifier les années archivables'
    );
  }
};

/**
 * Vérifie le statut de l'année académique en cours
 * GET /archives/current-year-status
 */
export const getCurrentYearStatus = async (): Promise<CurrentYearStatusResponse> => {
  try {
    const response: AxiosResponse<CurrentYearStatusResponse> = await axiosInstance.get(
      '/current-year-status'
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ [Archives] Erreur statut année en cours:', error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de récupérer le statut de l\'année en cours'
    );
  }
};

/**
 * =====================================================
 * 7. ARCHIVAGE AUTOMATIQUE
 * =====================================================
 */

/**
 * Déclenche manuellement l'archivage automatique
 * POST /archives/trigger-auto-archive
 */
export const triggerAutoArchive = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response: AxiosResponse<{ success: boolean; message: string }> = 
      await axiosInstance.post('/trigger-auto-archive');
    
    console.log('✅ [Archives] Archivage auto déclenché:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [Archives] Erreur déclenchement auto:', error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de déclencher l\'archivage automatique'
    );
  }
};

/**
 * =====================================================
 * 8. NETTOYAGE DES TABLES TEMPORAIRES
 * =====================================================
 */

/**
 * Vide les tables temporaires sans archivage
 * POST /archives/clear-tables
 */
export const clearTemporaryTables = async (): Promise<ClearTablesResponse> => {
  try {
    console.log('🧹 [Archives] Nettoyage des tables temporaires...');
    
    const response: AxiosResponse<ClearTablesResponse> = await axiosInstance.post(
      '/clear-tables'
    );
    
    console.log('✅ [Archives] Tables nettoyées:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [Archives] Erreur nettoyage tables:', error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de nettoyer les tables temporaires'
    );
  }
};

/**
 * =====================================================
 * 9. FONCTIONS UTILITAIRES
 * =====================================================
 */

/**
 * Groupe les archives par année académique
 * @param archives - Liste des archives
 */
export const groupArchivesByYear = (archives: Archive[]): Map<string, Archive[]> => {
  const grouped = new Map<string, Archive[]>();
  
  archives.forEach(archive => {
    const year = archive.academicYear;
    if (!grouped.has(year)) {
      grouped.set(year, []);
    }
    grouped.get(year)!.push(archive);
  });
  
  return grouped;
};

/**
 * Groupe les archives par type d'entité
 * @param archives - Liste des archives
 */
export const groupArchivesByType = (archives: Archive[]): Map<EntityType, Archive[]> => {
  const grouped = new Map<EntityType, Archive[]>();
  
  archives.forEach(archive => {
    const type = archive.entityType;
    if (!grouped.has(type)) {
      grouped.set(type, []);
    }
    grouped.get(type)!.push(archive);
  });
  
  return grouped;
};

/**
 * Formate une taille en octets vers un format lisible
 * @param bytes - Taille en octets
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Formate une durée en millisecondes vers un format lisible
 * @param ms - Durée en millisecondes
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}min`;
  } else if (minutes > 0) {
    return `${minutes}min ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Valide le format d'une année académique
 * @param year - Année à valider (format: 2023-2024)
 */
export const isValidAcademicYear = (year: string): boolean => {
  const regex = /^\d{4}-\d{4}$/;
  if (!regex.test(year)) return false;
  
  const [start, end] = year.split('-').map(Number);
  return end === start + 1;
};

/**
 * Génère une année académique depuis deux dates
 * @param startDate - Date de début
 * @param endDate - Date de fin
 */
export const generateAcademicYearLabel = (startDate: Date, endDate: Date): string => {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  return `${startYear}-${endYear}`;
};

/**
 * =====================================================
 * FONCTIONS DE COMPATIBILITÉ (ancien store)
 * =====================================================
 */

/**
 * Récupère toutes les années archivées (compatibilité store)
 */
export const getAllArchivedYears = async (): Promise<any[]> => {
  const response = await getAllArchives(1, 100);
  const yearMap = new Map<string, any>();
  
  response.data.forEach(archive => {
    const year = archive.academicYear;
    if (!yearMap.has(year)) {
      // Extraire les dates de l'année académique (ex: "2023-2024")
      const [startYear, endYear] = year.split('-');
      
      yearMap.set(year, {
        id: year,
        name: year,
        startDate: `${startYear}-09-01`, // Approximation début d'année scolaire
        endDate: `${endYear}-06-30`,     // Approximation fin d'année scolaire
        archivedAt: archive.archivedAt,
        archivedBy: archive.user?.firstName + ' ' + archive.user?.lastName || 'Système',
        status: 'archived' as const,
        size: '0 MB', // À calculer si disponible
        description: archive.description,
        recordsCount: { students: 0, payments: 0, notes: 0 },
      });
    }
    const yearData = yearMap.get(year)!;
    if (archive.entityType === 'STUDENT') yearData.recordsCount.students++;
    if (archive.entityType === 'PAYMENT') yearData.recordsCount.payments++;
    if (archive.entityType === 'NOTE') yearData.recordsCount.notes++;
  });
  
  return Array.from(yearMap.values());
};

/**
 * Récupère une année archivée par ID
 */
export const getArchivedYearById = async (yearId: string): Promise<any> => {
  const response = await getAllArchives(1, 100);
  const yearArchives = response.data.filter(a => a.academicYear === yearId);
  if (yearArchives.length === 0) throw new Error('Année archivée non trouvée');
  
  // Extraire les dates de l'année académique (ex: "2023-2024")
  const [startYear, endYear] = yearId.split('-');
  
  return {
    id: yearId,
    name: yearId,
    startDate: `${startYear}-09-01`,
    endDate: `${endYear}-06-30`,
    archivedAt: yearArchives[0].archivedAt,
    archivedBy: yearArchives[0].user?.firstName + ' ' + yearArchives[0].user?.lastName || 'Système',
    status: 'archived' as const,
    size: '0 MB',
    description: yearArchives[0].description,
    recordsCount: {
      students: yearArchives.filter(a => a.entityType === 'STUDENT').length,
      payments: yearArchives.filter(a => a.entityType === 'PAYMENT').length,
      notes: yearArchives.filter(a => a.entityType === 'NOTE').length,
    },
  };
};

/**
 * Alias pour getArchiveStatistics (avec conversion)
 */
export const getArchiveStats = async (): Promise<any> => {
  const stats = await getArchiveStatistics();
  const archives = await getAllArchives(1, 100);
  
  // Grouper par année pour calculer totalYears et totalSize
  const yearMap = new Map<string, any>();
  archives.data.forEach(archive => {
    const year = archive.academicYear;
    if (!yearMap.has(year)) {
      const [startYear, endYear] = year.split('-');
      
      yearMap.set(year, {
        id: year,
        name: year,
        startDate: `${startYear}-09-01`,
        endDate: `${endYear}-06-30`,
        archivedAt: archive.archivedAt,
        archivedBy: archive.user?.firstName + ' ' + archive.user?.lastName || 'Système',
        status: 'archived' as const,
        size: '0 MB',
        description: archive.description,
        recordsCount: { students: 0, payments: 0, notes: 0 },
      });
    }
  });
  
  const years = Array.from(yearMap.values());
  years.sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());
  
  return {
    totalYears: years.length,
    totalSize: '0 GB', // À calculer si disponible
    latestArchive: years[0],
    oldestArchive: years[years.length - 1],
  };
};

/**
 * Récupère les données archivées (compatibilité)
 */
export const getArchivedData = async (yearId: string, dataType: string): Promise<any> => {
  let data: any[] = [];
  let total = 0;
  
  try {
    if (dataType === 'students') {
      const response = await getArchivedStudents(yearId, 1, 100);
      data = response.data;
      total = response.total;
    } else if (dataType === 'payments') {
      const response = await getArchivedPayments(yearId, 1, 100);
      data = response.data;
      total = response.total;
    } else if (dataType === 'notes' || dataType === 'grades') {
      const response = await getArchivedNotes(yearId, 1, 100);
      data = response.data;
      total = response.total;
    }
  } catch (error) {
    console.warn(`⚠️ Type ${dataType} non disponible`);
  }
  
  return {
    yearId,
    yearName: yearId,
    dataType,
    data,
    metadata: { totalRecords: total, fetchedAt: new Date().toISOString(), dataSize: '0 MB' },
  };
};

/**
 * Crée une archive (alias)
 */
export const createArchive = async (data: any): Promise<any> => {
  return await archiveAcademicYear(data.academicYearId, data.description);
};

/**
 * Restaure une archive (non disponible)
 */
export const restoreArchive = async (data: any): Promise<void> => {
  throw new Error('Restauration non disponible');
};

/**
 * Supprime une archive (non disponible)
 */
export const deleteArchive = async (yearId: string): Promise<void> => {
  throw new Error('Suppression non disponible');
};

/**
 * Télécharge une archive (non disponible)
 */
export const downloadArchive = async (yearId: string): Promise<Blob> => {
  console.warn('⚠️ Téléchargement non disponible');
  return new Blob([JSON.stringify({ message: 'Non disponible', yearId })], { type: 'application/json' });
};

/**
 * Exporte des données (non disponible)
 */
export const exportArchivedData = async (yearId: string, dataType: string, format: string): Promise<Blob> => {
  console.warn('⚠️ Export non disponible');
  return new Blob([JSON.stringify({ message: 'Non disponible' })], { type: 'application/json' });
};

/**
 * Récupère le statut d'archivage
 */
export const getArchiveStatus = async (): Promise<any> => {
  const status = await getCurrentYearStatus();
  return {
    isRunning: false,
    currentYear: status.currentYear.label,
    shouldArchive: status.shouldArchive,
    daysRemaining: status.daysRemaining,
  };
};

/**
 * Récupère l'historique d'un étudiant
 */
export const getStudentArchiveHistory = async (matricule: string): Promise<any> => {
  const archives = await getAllArchives(1, 100);
  const years = new Set(archives.data.map(a => a.academicYear));
  
  const history: any = { matricule, studentName: '', years: [] };
  
  for (const year of years) {
    try {
      const student = await searchArchivedStudent({ academicYear: year, matricule });
      if (student.success) {
        const releve = await getArchivedReleveNotes({ academicYear: year, matricule });
        if (!history.studentName) {
          history.studentName = `${student.student.firstName} ${student.student.lastName}`;
        }
        history.years.push({
          year,
          grades: releve.student.notes || [],
          payments: [],
          attendance: [],
          reportCards: [],
        });
      }
    } catch (error) {
      continue;
    }
  }
  
  return history;
};
