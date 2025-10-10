/**
 * =====================================================
 * TYPES POUR LE MODULE ARCHIVES
 * =====================================================
 * Définit les types TypeScript pour la gestion des archives
 * des années académiques et des données associées
 */

/**
 * Statut d'une année académique archivée
 */
export type ArchiveStatus = 'archived' | 'restoring' | 'restored' | 'error';

/**
 * Type de données archivées disponibles
 */
export type ArchiveDataType = 
  | 'students'      // Étudiants
  | 'employees'     // Employés
  | 'courses'       // Cours
  | 'payments'      // Paiements
  | 'grades'        // Notes
  | 'attendance'    // Présences
  | 'bulletins';    // Bulletins

/**
 * Interface pour une année académique archivée
 */
export interface ArchivedYear {
  id: string;
  name: string;                    // Ex: "2023-2024"
  startDate: string;                // Date de début
  endDate: string;                  // Date de fin
  archivedAt: string;               // Date d'archivage
  archivedBy: string;               // Utilisateur ayant archivé
  status: ArchiveStatus;            // Statut de l'archive
  size: string;                     // Taille de l'archive (ex: "2.5 GB")
  recordsCount: {
    students: number;
    employees: number;
    courses: number;
    payments: number;
    grades: number;
    attendance: number;
    bulletins: number;
  };
  description?: string;             // Description optionnelle
  backupPath?: string;              // Chemin du fichier de sauvegarde
}

/**
 * Interface pour les statistiques d'une archive
 */
export interface ArchiveStats {
  totalYears: number;               // Nombre total d'années archivées
  totalSize: string;                // Taille totale des archives
  latestArchive?: ArchivedYear;     // Dernière archive créée
  oldestArchive?: ArchivedYear;     // Archive la plus ancienne
}

/**
 * Interface pour les données archivées d'une année
 */
export interface ArchivedData {
  yearId: string;
  yearName: string;
  dataType: ArchiveDataType;
  data: any[];                      // Données archivées (type générique)
  metadata: {
    totalRecords: number;
    fetchedAt: string;
    dataSize: string;
  };
}

/**
 * Interface pour les filtres de recherche dans les archives
 */
export interface ArchiveFilters {
  yearId?: string;
  dataType?: ArchiveDataType;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

/**
 * Interface pour la création d'une nouvelle archive
 */
export interface CreateArchiveDto {
  academicYearId: string;
  includeTypes: ArchiveDataType[];  // Types de données à archiver
  description?: string;
}

/**
 * Interface pour la restauration d'une archive
 */
export interface RestoreArchiveDto {
  archiveId: string;
  restoreTypes: ArchiveDataType[];  // Types de données à restaurer
  overwriteExisting?: boolean;      // Écraser les données existantes
}
