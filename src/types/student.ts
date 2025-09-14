/**
 * =====================================================
 * TYPES TYPESCRIPT POUR LA GESTION DES ÉLÈVES
 * =====================================================
 * Ce fichier contient tous les types nécessaires pour
 * la gestion des élèves dans le système scolaire
 */

// =====================================================
// TYPES POUR LES CLASSES ET SALLES
// =====================================================

// Type pour les classes (niveaux)
export type ClassLevel = 'NSI' | 'NSII' | 'NSIII' | 'NSIV';

// Type pour une salle
export interface Room {
  id: string;                    // Identifiant unique de la salle
  name: string;                  // Nom de la salle (ex: "Salle A", "Salle B")
  classLevel: ClassLevel;        // Niveau de la classe (NSI, NSII, etc.)
  capacity: number;              // Capacité maximale de la salle
  description?: string;          // Description optionnelle de la salle
  isActive: boolean;             // Si la salle est active
  createdAt: string;             // Date de création
  updatedAt: string;             // Date de dernière mise à jour
}

// Type pour créer une nouvelle salle
export interface CreateRoomDto {
  name: string;
  classLevel: ClassLevel;
  capacity: number;
  description?: string;
  isActive?: boolean;
}

// Type pour mettre à jour une salle
export interface UpdateRoomDto {
  id: string;
  name?: string;
  classLevel?: ClassLevel;
  capacity?: number;
  description?: string;
  isActive?: boolean;
}

// Type pour les filtres de salles
export interface RoomFilters {
  search?: string;               // Recherche par nom de salle
  classLevel?: ClassLevel;       // Filtrer par niveau de classe
  isActive?: boolean;            // Filtrer par statut actif/inactif
}

// Type pour les statistiques des salles
export interface RoomStats {
  total: number;                 // Nombre total de salles
  active: number;                // Nombre de salles actives
  inactive: number;              // Nombre de salles inactives
  byClassLevel: Record<ClassLevel, number>; // Répartition par niveau
  totalCapacity: number;         // Capacité totale
  averageCapacity: number;       // Capacité moyenne
}

// =====================================================
// TYPES POUR LES ÉLÈVES (MODIFIÉS POUR INCLURE LA SALLE)
// =====================================================

// Type principal pour un élève
export interface Student {
  id: string;                    // Identifiant unique de l'élève
  firstName: string;             // Prénom de l'élève
  lastName: string;              // Nom de famille de l'élève
  gender: 'male' | 'female';     // Sexe de l'élève
  dateOfBirth: string;           // Date de naissance (format ISO)
  placeOfBirth: string;          // Lieu de naissance
  email?: string;                // Email de l'élève (optionnel)
  ninthGradeOrderNumber: string; // N° d'ordre 9ème AF
  level: 'secondaire' | 'nouveauSecondaire'; // Niveau scolaire
  grade: string;                 // Classe (ex: "NSI", "NSII", etc.)
  roomId?: string;               // ID de la salle assignée (optionnel)
  roomName?: string;             // Nom de la salle (pour affichage)
  ninthGradeSchool?: string;     // École où l'élève a fait la 9e (optionnel)
  ninthGradeGraduationYear?: string; // Année de réussite 9e (optionnel)
  lastSchool?: string;           // Dernier établissement (optionnel)
  enrollmentDate: string;        // Date d'inscription (format ISO)
  studentId: string;             // Matricule unique de l'élève
  parentContact: {               // Informations des parents/tuteurs
    fatherName?: string;         // Nom du père (optionnel)
    motherName?: string;         // Nom de la mère (optionnel)
    responsiblePerson: string;   // Personne responsable
    phone: string;               // Téléphone de contact
    email?: string;              // Email des parents (optionnel)
    address?: string;            // Adresse des parents (optionnel)
    relationship: string;        // Relation (père, mère, tuteur)
  };
  status: 'active' | 'inactive' | 'suspended'; // Statut de l'élève
  avatar?: string;               // URL de la photo de profil (optionnel)
  createdAt: string;             // Date de création du dossier
  updatedAt: string;             // Date de dernière mise à jour
}

// Type pour créer un nouvel élève (sans les champs auto-générés)
export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  placeOfBirth: string;
  email?: string;
  ninthGradeOrderNumber: string;
  level: 'secondaire' | 'nouveauSecondaire';
  grade: string;
  roomId?: string;               // ID de la salle assignée
  ninthGradeSchool?: string;
  ninthGradeGraduationYear?: string;
  lastSchool?: string;
  enrollmentDate: string;
  studentId: string;
  parentContact: {
    fatherName?: string;
    motherName?: string;
    responsiblePerson: string;
    phone: string;
    email?: string;
    address?: string;
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
  gender?: 'male' | 'female';
  dateOfBirth?: string;
  placeOfBirth?: string;
  email?: string;
  ninthGradeOrderNumber?: string;
  level?: 'secondaire' | 'nouveauSecondaire';
  grade?: string;
  roomId?: string;               // ID de la salle assignée
  ninthGradeSchool?: string;
  ninthGradeGraduationYear?: string;
  lastSchool?: string;
  enrollmentDate?: string;
  studentId?: string;
  parentContact?: {
    fatherName?: string;
    motherName?: string;
    responsiblePerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    relationship?: string;
  };
  status?: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

// Type pour les filtres de recherche (modifié pour inclure la salle)
export interface StudentFilters {
  search?: string;               // Recherche par nom, prénom, email
  grade?: string;                // Filtrer par classe
  roomId?: string;               // Filtrer par salle
  status?: 'active' | 'inactive' | 'suspended';
  gender?: 'male' | 'female' | 'Homme' | 'Femme';    // Filtrer par sexe (support backend et frontend)
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