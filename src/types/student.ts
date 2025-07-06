/**
 * =====================================================
 * TYPES TYPESCRIPT POUR LA GESTION DES ÉLÈVES
 * =====================================================
 * Ce fichier contient tous les types nécessaires pour
 * la gestion des élèves dans le système scolaire
 */

// Type principal pour un élève
export interface Student {
  id: string;                    // Identifiant unique de l'élève
  firstName: string;             // Prénom de l'élève
  lastName: string;              // Nom de famille de l'élève
  email: string;                 // Email de l'élève
  phone: string;                 // Numéro de téléphone
  dateOfBirth: string;           // Date de naissance (format ISO)
  gender: 'male' | 'female';     // Sexe de l'élève
  address: string;               // Adresse complète
  grade: string;                 // Classe (ex: "Terminale A", "Première S")
  enrollmentDate: string;        // Date d'inscription (format ISO)
  studentId: string;             // Matricule unique de l'élève
  parentContact: {               // Informations du parent/tuteur
    name: string;                // Nom du parent
    phone: string;               // Téléphone du parent
    email: string;               // Email du parent
    relationship: string;        // Relation (père, mère, tuteur)
  };
  status: 'active' | 'inactive' | 'suspended'; // Statut de l'élève (retiré graduated)
  avatar?: string;               // URL de la photo de profil (optionnel)
  createdAt: string;             // Date de création du dossier
  updatedAt: string;             // Date de dernière mise à jour
}

// Type pour créer un nouvel élève (sans les champs auto-générés)
export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  grade: string;
  enrollmentDate: string;
  studentId: string;
  parentContact: {
    name: string;
    phone: string;
    email: string;
    relationship: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

// Type pour mettre à jour un élève (tous les champs optionnels sauf l'ID)
export interface UpdateStudentDto {
  id: string;                    // L'ID est requis pour identifier l'élève à modifier
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  address?: string;
  grade?: string;
  enrollmentDate?: string;
  studentId?: string;
  parentContact?: {
    name?: string;
    phone?: string;
    email?: string;
    relationship?: string;
  };
  status?: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

// Type pour les filtres de recherche
export interface StudentFilters {
  search?: string;               // Recherche par nom, prénom, email
  grade?: string;                // Filtrer par classe
  status?: 'active' | 'inactive' | 'suspended';
  gender?: 'male' | 'female';    // Filtrer par sexe
  enrollmentYear?: number;       // Filtrer par année d'inscription
}

// Type pour les options de tri
export interface StudentSortOptions {
  field: keyof Student;          // Champ à utiliser pour le tri
  order: 'asc' | 'desc';         // Ordre croissant ou décroissant
}

// Type pour la pagination
export interface PaginationOptions {
  page: number;                  // Page actuelle (commence à 1)
  limit: number;                 // Nombre d'éléments par page
  total: number;                 // Nombre total d'éléments
  totalPages: number;            // Nombre total de pages
}

// Type pour la réponse de l'API avec pagination
export interface StudentsResponse {
  data: Student[];               // Liste des élèves
  pagination: PaginationOptions; // Informations de pagination
}

// Type pour les statistiques des élèves
export interface StudentStats {
  total: number;                 // Nombre total d'élèves
  active: number;                // Nombre d'élèves actifs
  inactive: number;              // Nombre d'élèves inactifs
  suspended: number;             // Nombre d'élèves suspendus
  totalClasses: number;          // Nombre total de classes
  byGender: {                    // Répartition par sexe
    male: number;                // Nombre d'hommes
    female: number;              // Nombre de femmes
  };
  byGrade: Record<string, number>; // Répartition par classe
}

// Type pour les erreurs de validation
export interface ValidationError {
  field: string;                 // Champ qui contient l'erreur
  message: string;               // Message d'erreur
}

// Type pour les erreurs de l'API
export interface ApiError {
  message: string;               // Message d'erreur principal
  code: string;                  // Code d'erreur
  details?: ValidationError[];   // Détails des erreurs de validation
} 