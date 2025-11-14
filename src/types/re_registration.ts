/**
 * =====================================================
 * TYPES TYPESCRIPT POUR LA GESTION DES RÉINSCRIPTIONS
 * =====================================================
 * Ce fichier contient tous les types nécessaires pour
 * la gestion des réinscriptions d'élèves
 */

import { Student } from './student';

// =====================================================
// TYPES POUR LES RÉINSCRIPTIONS
// =====================================================

// Statut de la réinscription
export type ReRegistrationStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

// Type de réinscription
export type ReRegistrationDecision = 'same_grade' | 'grade_promotion' | 'grade_repeat';

// Type principal pour une réinscription
export interface ReRegistration {
  id: string;                           // Identifiant unique de la réinscription
  studentId: string;                    // ID de l'élève
  student: Student;                     // Informations complètes de l'élève
  academicYear: string;                 // Année scolaire (ex: "2024-2025")
  currentGrade: string;                 // Classe actuelle de l'élève
  newGrade: string;                     // Nouvelle classe pour la réinscription
  currentRoomId?: string;               // ID de la salle actuelle
  newRoomId?: string;                   // ID de la nouvelle salle
  newRoomName?: string;                 // Nom de la nouvelle salle
  registrationDecision: ReRegistrationDecision; // Type de réinscription
  status: ReRegistrationStatus;         // Statut de la réinscription
  registrationDate: string;             // Date de demande de réinscription
  confirmationDate?: string;            // Date de confirmation (si confirmée)
  rejectionReason?: string;             // Raison du rejet (si rejetée)
  notes?: string;                       // Notes additionnelles
  fees: {                               // Frais de réinscription
    amount: number;                     // Montant des frais
    currency: string;                   // Devise (ex: "HTG")
    isPaid: boolean;                    // Si les frais sont payés
    paymentDate?: string;               // Date de paiement
    paymentMethod?: string;             // Méthode de paiement
  };
  documents: {                          // Documents requis
    reportCard: boolean;                // Bulletin de notes
    parentAuthorization: boolean;       // Autorisation parentale
    medicalCertificate: boolean;        // Certificat médical
    photos: boolean;                    // Photos d'identité
  };
  createdBy: string;                    // ID de l'utilisateur qui a créé la demande
  updatedBy?: string;                   // ID de l'utilisateur qui a modifié
  createdAt: string;                    // Date de création
  updatedAt: string;                    // Date de dernière mise à jour
}

// Type pour créer une nouvelle réinscription
export interface CreateReRegistrationDto {
  studentId: string;
  academicYear: string;
  newGrade: string;
  newRoomId?: string;
  registrationDecision: ReRegistrationDecision;
  notes?: string;
  fees: {
    amount: number;
    currency: string;
  };
  documents: {
    reportCard: boolean;
    parentAuthorization: boolean;
    medicalCertificate: boolean;
    photos: boolean;
  };
}

// Type pour mettre à jour une réinscription
export interface UpdateReRegistrationDto {
  id: string;
  newGrade?: string;
  newRoomId?: string;
  registrationDecision?: ReRegistrationDecision;
  status?: ReRegistrationStatus;
  rejectionReason?: string;
  notes?: string;
  fees?: {
    amount?: number;
    currency?: string;
    isPaid?: boolean;
    paymentDate?: string;
    paymentMethod?: string;
  };
  documents?: {
    reportCard?: boolean;
    parentAuthorization?: boolean;
    medicalCertificate?: boolean;
    photos?: boolean;
  };
}

// Type pour les filtres de recherche
export interface ReRegistrationFilters {
  search?: string;                      // Recherche par nom d'élève
  academicYear?: string;                // Filtrer par année scolaire
  status?: ReRegistrationStatus;        // Filtrer par statut
  registrationDecision?: ReRegistrationDecision; // Filtrer par type
  currentGrade?: string;                // Filtrer par classe actuelle
  newGrade?: string;                    // Filtrer par nouvelle classe
  isPaid?: boolean;                     // Filtrer par statut de paiement
  hasAllDocuments?: boolean;            // Filtrer par documents complets
}

// Type pour les options de tri
export interface ReRegistrationSortOptions {
  field: keyof ReRegistration;
  order: 'asc' | 'desc';
}

// Type pour la pagination
export interface ReRegistrationPaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Type pour la réponse de l'API avec pagination
export interface ReRegistrationsResponse {
  data: ReRegistration[];
  pagination: ReRegistrationPaginationOptions;
}

// Type pour les statistiques des réinscriptions
export interface ReRegistrationStats {
  total: number;                        // Nombre total de réinscriptions
  pending: number;                      // En attente
  confirmed: number;                    // Confirmées
  rejected: number;                     // Rejetées
  cancelled: number;                    // Annulées
  totalFees: number;                    // Montant total des frais
  paidFees: number;                     // Montant payé
  unpaidFees: number;                   // Montant impayé
  byRegistrationType: {                 // Répartition par type
    same_grade: number;                 // Même classe
    grade_promotion: number;            // Promotion
    grade_repeat: number;               // Redoublement
  };
  byGrade: Record<string, number>;      // Répartition par classe
  documentsCompletion: {                // Taux de completion des documents
    reportCard: number;                 // Pourcentage bulletins
    parentAuthorization: number;        // Pourcentage autorisations
    medicalCertificate: number;         // Pourcentage certificats
    photos: number;                     // Pourcentage photos
  };
}

// Type pour les erreurs de validation
export interface ReRegistrationValidationError {
  field: string;
  message: string;
}

// Type pour les erreurs de l'API
export interface ReRegistrationApiError {
  message: string;
  code: string;
  details?: ReRegistrationValidationError[];
}

// Type pour les années scolaires
export interface AcademicYear {
  id: string;
  year: string;                         // Ex: "2024-2025"
  startDate: string;                    // Date de début
  endDate: string;                      // Date de fin
  isActive: boolean;                    // Si c'est l'année active
  registrationStartDate: string;        // Début des réinscriptions
  registrationEndDate: string;          // Fin des réinscriptions
}

// Type pour les frais par classe
export interface GradeFees {
  grade: string;                        // Classe
  amount: number;                       // Montant des frais
  currency: string;                     // Devise
}
