/**
 * =====================================================
 * TYPES TYPESCRIPT POUR LA GESTION DES COURS
 * =====================================================
 * Ce fichier contient tous les types nécessaires pour
 * la gestion des cours dans le système scolaire classique
 */

// =====================================================
// TYPES POUR LES COURS
// =====================================================

// Type pour les catégories de cours (basé sur l'API backend)
export type CourseCategory = 'Mathematiques' | 'Sciences' | 'Langues' | 'Histoire' | 'Geographie' | 'Arts' | 'Sport' | 'Informatique' | 'Physique' | 'Chimie' | 'Biologie' | 'Francais' | 'Anglais' | 'Philosophie';

// Type pour les statuts de cours
export type CourseStatus = 'actif' | 'inactif' | 'en_attente';

// Type principal pour un cours (basé sur l'API backend)
export interface Course {
  id: string;                    // Identifiant unique du cours
  code: string;                  // Code du cours (ex: SPOR-101)
  titre: string;                 // Titre du cours (backend: "titre")
  description: string;           // Description détaillée du cours
  categorie: CourseCategory;     // Catégorie du cours (backend: "categorie")
  ponderation: number;           // Pondération/coefficient du cours (backend: "ponderation")
  statut?: string;               // Statut du cours
  classroomId: string;           // ID de la classe assignée
  classroom?: {                  // Informations de la classe (relation)
    id: string;
    name: string;
    description?: string;
  };
  isActive?: boolean;            // Si le cours est actif
  createdAt?: string;            // Date de création
  updatedAt?: string;            // Date de dernière mise à jour
}

// Type pour créer un nouveau cours (basé sur l'API backend)
export interface CreateCourseDto {
  titre: string;                 // Titre du cours
  description: string;           // Description du cours
  categorie: CourseCategory;     // Catégorie du cours
  ponderation: number;           // Pondération du cours
  classroomId: string;           // ID de la classe assignée
}

// Type pour l'API payload (exactement comme l'endpoint)
export interface AddCourseApiPayload {
  titre: string;
  description: string;
  categorie: string;             // String pour l'API
  ponderation: number;
  classroomId: string;
}

// Type pour mettre à jour un cours
export interface UpdateCourseDto {
  id: string;
  code?: string;
  title?: string;
  description?: string;
  category?: CourseCategory;
  weight?: number;
  grade?: string;
  schedule?: {
    day: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi';
    startTime: string;
    endTime: string;
  }[];
  prerequisites?: string[];
  objectives?: string[];
  materials?: string[];
  syllabus?: string;
  status?: CourseStatus;
  isActive?: boolean;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  startDate?: string;
  endDate?: string;
}

// Type pour les filtres de recherche
export interface CourseFilters {
  search?: string;               // Recherche par code, titre, description
  category?: CourseCategory;     // Filtrer par catégorie
  grade?: string;                // Filtrer par classe
  status?: CourseStatus;         // Filtrer par statut
  isActive?: boolean;            // Filtrer par statut actif
  enrollmentYear?: number;       // Filtrer par année d'inscription
}

// Type pour les options de tri
export interface CourseSortOptions {
  field: keyof Course;           // Champ à utiliser pour le tri
  order: 'asc' | 'desc';         // Ordre croissant ou décroissant
}

// Type pour la pagination
export interface CoursePaginationOptions {
  page: number;                  // Page actuelle (commence à 1)
  limit: number;                 // Nombre d'éléments par page
  total: number;                 // Nombre total d'éléments
  totalPages: number;            // Nombre total de pages
}

// Alias pour la compatibilité
export type PaginationOptions = CoursePaginationOptions;

// Type pour la réponse de l'API avec pagination
export interface CoursesResponse {
  data: Course[];                // Liste des cours
  pagination: CoursePaginationOptions; // Informations de pagination
}

// Type pour les statistiques des cours
export interface CourseStats {
  total: number;                 // Nombre total de cours
  active: number;                // Nombre de cours actifs
  inactive: number;              // Nombre de cours inactifs
  pending: number;               // Nombre de cours en attente
  byCategory: Record<CourseCategory, number>; // Répartition par catégorie
  byGrade: Record<string, number>;            // Répartition par classe
  averageWeight: number;         // Moyenne des pondérations
  totalWeight: number;           // Somme totale des pondérations
  topCourses: Array<{           // Cours les plus importants (par pondération)
    courseId: string;
    courseCode: string;
    courseTitle: string;
    weight: number;
  }>;
}

// Type pour les erreurs de validation
export interface CourseValidationError {
  field: string;                 // Champ qui contient l'erreur
  message: string;               // Message d'erreur
}

// Type pour les erreurs de l'API
export interface CourseApiError {
  message: string;               // Message d'erreur principal
  code: string;                  // Code d'erreur
  details?: CourseValidationError[]; // Détails des erreurs de validation
}

// Alias pour la compatibilité
export type ApiError = CourseApiError;

// =====================================================
// TYPES POUR LES INSCRIPTIONS AUX COURS
// =====================================================

// Type pour une inscription à un cours
export interface CourseEnrollment {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  enrollmentDate: string;
  status: 'enrolled' | 'completed' | 'dropped' | 'failed';
  grade?: string;                // Note obtenue
  attendance: number;            // Pourcentage de présence
  createdAt: string;
  updatedAt: string;
}

// Type pour créer une inscription
export interface CreateEnrollmentDto {
  courseId: string;
  studentId: string;
}

// Type pour les statistiques d'inscription
export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  averageGrade: number;
  averageAttendance: number;
}

// =====================================================
// TYPES POUR LA DISPONIBILITÉ DES COURS
// =====================================================

// Type pour les trimestres
export type Trimestre = 'T1' | 'T2' | 'T3';

// Type pour les statuts de disponibilité (selon l'API backend)
export type AvailabilityStatus = 'Actif' | 'Inactif';

// Type pour la disponibilité d'un cours
export interface CourseAvailability {
  id?: string;
  courseId: string;
  roomId: string;
  trimestre: Trimestre;
  statut: AvailabilityStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Type pour définir/mettre à jour la disponibilité
export interface SetAvailabilityDto {
  courseId: string;
  roomId: string;
  trimestre: Trimestre;
  statut: AvailabilityStatus;
}

// Type pour la réponse de l'API de disponibilité
export interface AvailabilityResponse {
  success: boolean;
  message: string;
  data?: CourseAvailability;
} 