/**
 * =====================================================
 * TYPES TYPESCRIPT POUR LA GESTION DES PARAMÈTRES
 * =====================================================
 * Ce fichier contient tous les types nécessaires pour
 * la gestion des paramètres système de l'institution
 */

// =====================================================
// ENUMS POUR LES CLÉS ET GROUPES DE PARAMÈTRES
// =====================================================

export enum SettingKey {
    // GENERAL
    SCHOOL_NAME = 'SCHOOL_NAME',
    SCHOOL_ACRONYM = 'SCHOOL_ACRONYM',
    SCHOOL_ADDRESS = 'SCHOOL_ADDRESS',
    SCHOOL_PHONE = 'SCHOOL_PHONE',
    SCHOOL_EMAIL = 'SCHOOL_EMAIL',
    SCHOOL_LOGO_URL = 'SCHOOL_LOGO_URL',
    SCHOOL_ENTETE_URL = 'SCHOOL_ENTETE_URL',
    BACKUP_FREQUENCY = 'BACKUP_FREQUENCY',

    // ACADEMIQUE
    CURRENT_ACADEMIC_YEAR = 'CURRENT_ACADEMIC_YEAR',
    MOYENNE_PASSAGE = 'MOYENNE_PASSAGE',
    MOYENNE_REPECHAGE = 'MOYENNE_REPECHAGE',
    MOYENNE_PASSAGE_CONCOURS = 'MOYENNE_PASSAGE_CONCOURS',
    MOYENNE_REPECHAGE_CONCOURS = 'MOYENNE_REPECHAGE_CONCOURS',

    // FINANCIER
    INSTITUTION_FEE = 'INSTITUTION_FEE',
    PAYPAL_HTG_TO_USD_RATE = 'PAYPAL_HTG_TO_USD_RATE',

    // COMMUNICATION
    DEFAULT_EMAIL_SENDER = 'DEFAULT_EMAIL_SENDER',
    SMS_GATEWAY_API_KEY = 'SMS_GATEWAY_API_KEY',
}

export enum SettingsGroup {
    GENERAL = 'GENERAL',
    ACADEMIQUE = 'ACADEMIQUE',
    FINANCIER = 'FINANCIER',
    COMMUNICATION = 'COMMUNICATION',
}

// Type pour rétrocompatibilité
export type SettingGroup = SettingsGroup;

// =====================================================
// TYPE PRINCIPAL POUR UN PARAMÈTRE
// =====================================================

export interface Setting {
  id: string;                    // Identifiant unique
  key: string;                   // Clé unique du paramètre (ex: "SCHOOL_NAME")
  value: string;                 // Valeur du paramètre
  label: string;                 // Libellé affiché (ex: "Nom de l'école")
  description?: string;          // Description optionnelle
  group: SettingGroup;           // Groupe du paramètre
  createdAt: string;             // Date de création
  updatedAt: string;             // Date de dernière modification
}

// =====================================================
// DTOS POUR LES OPÉRATIONS CRUD
// =====================================================

// DTO pour créer un nouveau paramètre
export interface CreateSettingDto {
  key: string;
  value: string;
  label: string;
  description?: string;
  group: SettingGroup;
}

// DTO pour mettre à jour un paramètre
export interface UpdateSettingDto {
  value?: string;
  label?: string;
  description?: string;
  group?: SettingGroup;
}

// DTO pour l'upload de fichiers (logo, header)
export interface UploadSettingDto {
  key: string;
  value: File;                  // Le fichier à uploader
  label: string;
  description?: string;
  group: SettingGroup;
}

// =====================================================
// RÉPONSES API
// =====================================================

// Réponse de l'API pour la liste paginée
export interface SettingsResponse {
  data: Setting[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

// =====================================================
// FILTRES ET STATISTIQUES
// =====================================================

// Filtres pour la recherche de paramètres
export interface SettingFilters {
  search?: string;               // Recherche par clé, label ou description
  group?: SettingGroup;          // Filtrer par groupe
}

// Statistiques des paramètres
export interface SettingStats {
  total: number;
  byGroup: Record<SettingGroup, number>;
}

// =====================================================
// MAPPINGS POUR LES LABELS ET DESCRIPTIONS
// =====================================================

export const SETTING_KEY_LABELS: Record<SettingKey, string> = {
  [SettingKey.SCHOOL_NAME]: "Nom de l'école",
  [SettingKey.SCHOOL_ACRONYM]: "Acronyme de l'école",
  [SettingKey.SCHOOL_ADDRESS]: "Adresse de l'école",
  [SettingKey.SCHOOL_PHONE]: "Téléphone de l'école",
  [SettingKey.SCHOOL_EMAIL]: "Email de l'école",
  [SettingKey.SCHOOL_LOGO_URL]: "URL du logo",
  [SettingKey.SCHOOL_ENTETE_URL]: "URL de l'en-tête",
  [SettingKey.BACKUP_FREQUENCY]: "Fréquence de sauvegarde",
  [SettingKey.CURRENT_ACADEMIC_YEAR]: "Année académique courante",
  [SettingKey.MOYENNE_PASSAGE]: "Moyenne de passage",
  [SettingKey.MOYENNE_REPECHAGE]: "Moyenne de repêchage",
  [SettingKey.MOYENNE_PASSAGE_CONCOURS]: "Moyenne de passage (Concours)",
  [SettingKey.MOYENNE_REPECHAGE_CONCOURS]: "Moyenne de repêchage (Concours)",
  [SettingKey.INSTITUTION_FEE]: "Frais d'inscription",
  [SettingKey.PAYPAL_HTG_TO_USD_RATE]: "Taux HTG vers USD (PayPal)",
  [SettingKey.DEFAULT_EMAIL_SENDER]: "Expéditeur email par défaut",
  [SettingKey.SMS_GATEWAY_API_KEY]: "Clé API SMS Gateway",
};

export const SETTING_KEY_DESCRIPTIONS: Record<SettingKey, string> = {
  [SettingKey.SCHOOL_NAME]: "Nom complet de l'établissement",
  [SettingKey.SCHOOL_ACRONYM]: "Sigle ou abréviation de l'école",
  [SettingKey.SCHOOL_ADDRESS]: "Adresse physique complète",
  [SettingKey.SCHOOL_PHONE]: "Numéro de téléphone principal",
  [SettingKey.SCHOOL_EMAIL]: "Adresse email de contact",
  [SettingKey.SCHOOL_LOGO_URL]: "Lien vers le logo de l'école",
  [SettingKey.SCHOOL_ENTETE_URL]: "Lien vers l'en-tête des documents",
  [SettingKey.BACKUP_FREQUENCY]: "Fréquence des sauvegardes automatiques",
  [SettingKey.CURRENT_ACADEMIC_YEAR]: "Identifiant de l'année en cours",
  [SettingKey.MOYENNE_PASSAGE]: "Note minimale pour passer (ex: 50)",
  [SettingKey.MOYENNE_REPECHAGE]: "Note minimale pour le repêchage (ex: 40)",
  [SettingKey.MOYENNE_PASSAGE_CONCOURS]: "Moyenne minimale pour réussir le concours",
  [SettingKey.MOYENNE_REPECHAGE_CONCOURS]: "Moyenne minimale pour le repêchage du concours",
  [SettingKey.INSTITUTION_FEE]: "Montant des frais de scolarité",
  [SettingKey.PAYPAL_HTG_TO_USD_RATE]: "Taux de conversion HTG/USD",
  [SettingKey.DEFAULT_EMAIL_SENDER]: "Email expéditeur par défaut",
  [SettingKey.SMS_GATEWAY_API_KEY]: "Clé d'accès au service SMS",
};

export const SETTING_KEY_GROUPS: Record<SettingKey, SettingsGroup> = {
  [SettingKey.SCHOOL_NAME]: SettingsGroup.GENERAL,
  [SettingKey.SCHOOL_ACRONYM]: SettingsGroup.GENERAL,
  [SettingKey.SCHOOL_ADDRESS]: SettingsGroup.GENERAL,
  [SettingKey.SCHOOL_PHONE]: SettingsGroup.GENERAL,
  [SettingKey.SCHOOL_EMAIL]: SettingsGroup.GENERAL,
  [SettingKey.SCHOOL_LOGO_URL]: SettingsGroup.GENERAL,
  [SettingKey.SCHOOL_ENTETE_URL]: SettingsGroup.GENERAL,
  [SettingKey.BACKUP_FREQUENCY]: SettingsGroup.GENERAL,
  [SettingKey.CURRENT_ACADEMIC_YEAR]: SettingsGroup.ACADEMIQUE,
  [SettingKey.MOYENNE_PASSAGE]: SettingsGroup.ACADEMIQUE,
  [SettingKey.MOYENNE_REPECHAGE]: SettingsGroup.ACADEMIQUE,
  [SettingKey.MOYENNE_PASSAGE_CONCOURS]: SettingsGroup.ACADEMIQUE,
  [SettingKey.MOYENNE_REPECHAGE_CONCOURS]: SettingsGroup.ACADEMIQUE,
  [SettingKey.INSTITUTION_FEE]: SettingsGroup.FINANCIER,
  [SettingKey.PAYPAL_HTG_TO_USD_RATE]: SettingsGroup.FINANCIER,
  [SettingKey.DEFAULT_EMAIL_SENDER]: SettingsGroup.COMMUNICATION,
  [SettingKey.SMS_GATEWAY_API_KEY]: SettingsGroup.COMMUNICATION,
};

// =====================================================
// OPTIONS POUR LES SELECTS
// =====================================================

export const SETTING_GROUP_OPTIONS = [
  { label: 'Général', value: 'GENERAL' },
  { label: 'Financier', value: 'FINANCIER' },
  { label: 'Communication', value: 'COMMUNICATION' },
  { label: 'Académique', value: 'ACADEMIQUE' },
] as const;

// =====================================================
// TYPES POUR LE MODE MAINTENANCE
// =====================================================

// Réponse pour activer/désactiver le mode maintenance
export interface MaintenanceResponse {
  success: boolean;
  message: string;
  maintenanceMode: boolean;
}

// Réponse pour le statut du mode maintenance
export interface MaintenanceStatusResponse {
  maintenanceMode: boolean;
  lastUpdated?: string;
  message: string;
}

// Réponse pour le statut public du mode maintenance
export interface MaintenancePublicStatusResponse {
  maintenanceMode: boolean;
  message: string;
  allowedRoles: string[];
}
