/**
 * =====================================================
 * TYPES POUR LE MODULE ARCHIVES
 * =====================================================
 * Définit les types TypeScript pour la gestion des archives
 */

/**
 * Type d'entité archivée (depuis l'enum backend)
 */
export type EntityType = 
  | 'STUDENT' 
  | 'PAYMENT' 
  | 'NOTE' 
  | 'SCHEDULE'
  | 'TIMESLOT'
  | 'PENDING_NOTE'
  | 'NOTE_HISTORY'
  | 'REPORT_CARD'
  | 'CLASSROOM';

/**
 * Type de données archivées disponibles (pour les vues)
 */
export type ArchiveDataType = 
  | 'students'
  | 'employees'
  | 'courses'
  | 'payments'
  | 'grades'
  | 'attendance'
  | 'bulletins';

/**
 * Statut d'une année académique archivée
 */
export type ArchiveStatus = 'archived' | 'restoring' | 'restored' | 'error';

/**
 * Interface pour une archive individuelle (depuis l'API)
 */
export interface Archive {
  id: string;
  entityType: EntityType;
  academicYear: string;
  originalId: string;
  data: any;
  archivedBy: string;
  description?: string;
  archivedAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Interface pour la liste complète des archives
 */
export interface AllArchivesResponse {
  data: Archive[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Interface pour une année archivée (compatibilité ancien code)
 */
export interface ArchivedYear {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  archivedAt: string;
  archivedBy: string;
  status?: ArchiveStatus;
  size?: string;
  description?: string;
  recordsCount: {
    students: number;
    payments: number;
    notes: number;
  };
}

/**
 * Interface pour les données archivées d'une année
 */
export interface ArchivedData {
  yearId: string;
  yearName: string;
  dataType: ArchiveDataType;
  data: any[];
  metadata: {
    totalRecords: number;
    fetchedAt: string;
    dataSize: string;
  };
}

/**
 * Interface pour les statistiques d'archives (compatibilité)
 */
export interface ArchiveStats {
  totalYears: number;
  totalSize: string;
  latestArchive?: ArchivedYear;
  oldestArchive?: ArchivedYear;
}

/**
 * Interface pour les filtres d'archives
 */
export interface ArchiveFilters {
  yearId?: string;
  dataType?: ArchiveDataType;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

/**
 * Interface pour la création d'archive (compatibilité)
 */
export interface CreateArchiveDto {
  academicYearId: string;
  description?: string;
}

/**
 * Interface pour la restauration d'archive (compatibilité)
 */
export interface RestoreArchiveDto {
  archiveId: string;
  restoreTypes?: ArchiveDataType[];
}

/**
 * Interface pour la réponse d'archivage d'une année
 */
export interface ArchiveYearResponse {
  success: boolean;
  studentsArchived: number;
  paymentsArchived: number;
  notesArchived: number;
  schedulesArchived: number;
  timeSlotsArchived: number;
  pendingNotesArchived: number;
  noteHistoriesArchived: number;
  reportCardsArchived: number;
  classroomsArchived: number;
  totalArchived: number;
  message: string;
  executionTime: number;
}

/**
 * Interface pour vérifier si une année peut être archivée
 */
export interface CanArchiveResponse {
  canArchive: boolean;
  academicYearExists: boolean;
  isCompleted: boolean;
  hasActiveStudents: boolean;
  hasPendingPayments: boolean;
  hasPendingNotes: boolean;
  alreadyArchived: boolean;
  message: string;
  details: {
    studentsCount: number;
    pendingPaymentsCount: number;
    pendingNotesCount: number;
    existingArchivesCount: number;
  };
}

/**
 * Interface pour les données paginées génériques
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Interface pour la recherche d'étudiant archivé
 */
export interface SearchStudentDto {
  academicYear: string;
  matricule?: string;
  firstName?: string;
  lastName?: string;
  originalId?: string;
}

/**
 * Interface pour la réponse de recherche d'étudiant
 */
export interface SearchStudentResponse {
  success: boolean;
  student: any;
  matricule: string;
  message: string;
}

/**
 * Interface pour le relevé de notes archivé
 */
export interface ReleveNotesResponse {
  success: boolean;
  student: {
    firstName: string;
    lastName: string;
    matricule: string;
    classroom: {
      id: string;
      name: string;
    };
    notes: Array<{
      id: string;
      courseId: string;
      courseName: string;
      courseCode: string;
      trimestre_1: string;
      trimestre_2: string;
      trimestre_3: string;
    }>;
  };
  matricule: string;
  message: string;
}

/**
 * Interface pour les statistiques d'archivage (GET /archives/stats)
 */
export interface ArchiveStatistics {
  totalArchives: number;
  studentsArchived: number;
  paymentsArchived: number;
  notesArchived: number;
  schedulesArchived: number;
  timeSlotsArchived: number;
  pendingNotesArchived: number;
  noteHistoriesArchived: number;
  reportCardsArchived: number;
  classroomsArchived: number;
  lastArchivage?: string;
  archivesByYear: Record<string, number>;
  archivesByType: Record<string, number>;
}

/**
 * Interface pour la recherche avancée
 */
export interface AdvancedSearchDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  academicYear?: string;
  entityType?: EntityType;
  originalId?: string;
  archivedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  requestedBy?: string;
}

/**
 * Interface pour les années archivables
 */
export interface CheckArchivableYearsResponse {
  success: boolean;
  message: string;
  yearsChecked: number;
  archivableYears: Array<{
    academicYear: string;
    canArchive: boolean;
    studentsCount: number;
    pendingPaymentsCount: number;
    pendingNotesCount: number;
    alreadyArchived: boolean;
  }>;
  nonArchivableYears: Array<{
    academicYear: string;
    canArchive: boolean;
    reason?: string;
    studentsCount: number;
    pendingPaymentsCount: number;
    pendingNotesCount: number;
  }>;
}

/**
 * Interface pour le statut de l'année en cours
 */
export interface CurrentYearStatusResponse {
  shouldArchive: boolean;
  currentYear: {
    id: string;
    label: string;
    dateDebut: string;
    dateFin: string;
    statut: string;
  };
  message: string;
  daysRemaining: number;
}

/**
 * Interface pour le nettoyage des tables
 */
export interface ClearTablesResponse {
  success: boolean;
  courseDisponibilitiesCleared: number;
  badgeAssignmentHistoriesCleared: number;
  noteHistoriesCleared: number;
  timeslotTeachersCleared: number;
  totalCleared: number;
  message: string;
  executionTime: number;
}

/**
 * Interface pour le statut d'archivage
 */
export interface ArchiveProcessStatus {
  isRunning: boolean;
  currentYear?: string;
  progress?: number;
  startedAt?: string;
  estimatedTimeRemaining?: number;
}

/**
 * Interface pour l'historique d'un étudiant
 */
export interface StudentArchiveHistory {
  matricule: string;
  studentName: string;
  years: {
    year: string;
    grades: any[];
    payments: any[];
    attendance: any[];
    reportCards: any[];
  }[];
}

/**
 * Interface pour le health check
 */
export interface ArchiveHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: boolean;
  storage: boolean;
  lastCheck: string;
  message?: string;
}
