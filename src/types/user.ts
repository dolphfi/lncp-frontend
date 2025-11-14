/**
 * =====================================================
 * TYPES TYPESCRIPT POUR LA GESTION DES UTILISATEURS
 * =====================================================
 * Ce fichier contient tous les types nécessaires pour
 * la gestion des utilisateurs système
 */

// =====================================================
// ENUMS POUR LES RÔLES UTILISATEURS
// =====================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SECRETARY = 'SECRETARY',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  USER = 'USER',
  CENSORED = 'CENSORED',
  COMPTABLE = 'COMPTABLE',
  SUPPLEANT = 'SUPPLEANT',
  DIRECTOR = 'DIRECTOR',
}

// =====================================================
// TYPE PRINCIPAL POUR UN UTILISATEUR
// =====================================================

export interface User {
  id: string;                    // UUID
  firstName: string;             // Prénom
  lastName: string;              // Nom
  email: string;                 // Email unique
  phone?: string;                // Téléphone
  role: UserRole;                // Rôle système
  avatar?: string;               // URL avatar
  bio?: string;                  // Biographie
  isActive: boolean;             // Compte actif
  isLocked: boolean;             // Compte verrouillé
  failedLoginAttempts?: number;  // Tentatives échouées
  lastLogin?: string;            // Dernière connexion
  createdAt: string;             // Date création
  updatedAt: string;             // Dernière MAJ
}

// =====================================================
// DTOS POUR LES OPÉRATIONS CRUD
// =====================================================

// DTO pour créer un utilisateur
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
}

// DTO pour mettre à jour un utilisateur
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
}

// =====================================================
// RÉPONSES API
// =====================================================

// Réponse de l'API pour la liste paginée
export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  lastPage?: number;
}

// Réponse pour débloquer un compte
export interface UnlockUserResponse {
  success: boolean;
  message: string;
  user: User;
}

// =====================================================
// FILTRES ET STATISTIQUES
// =====================================================

// Filtres pour la recherche d'utilisateurs
export interface UserFilters {
  search?: string;               // Recherche par nom, email
  role?: UserRole;               // Filtrer par rôle
  isActive?: boolean;            // Filtrer par statut actif
  isLocked?: boolean;            // Filtrer par statut verrouillé
}

// Statistiques des utilisateurs
export interface UserStats {
  total: number;
  active: number;
  locked: number;
  byRole: Record<UserRole, number>;
}

// =====================================================
// OPTIONS POUR LES SELECTS
// =====================================================

export const USER_ROLE_OPTIONS = [
  { label: 'Super Administrateur', value: 'SUPER_ADMIN' },
  { label: 'Administrateur', value: 'ADMIN' },
  { label: 'Secrétaire', value: 'SECRETARY' },
  { label: 'Censeur', value: 'CENSORED' },
  { label: 'Directeur', value: 'DIRECTOR' },
  { label: 'Comptable', value: 'COMPTABLE' },
  { label: 'Suppléant', value: 'SUPPLEANT' },
  { label: 'Professeur', value: 'TEACHER' },
  { label: 'Étudiant', value: 'STUDENT' },
  { label: 'Parent', value: 'PARENT' },
  { label: 'Utilisateur', value: 'USER' },
] as const;

// Labels pour affichage
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Administrateur',
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.SECRETARY]: 'Secrétaire',
  [UserRole.CENSORED]: 'Censeur',
  [UserRole.DIRECTOR]: 'Directeur',
  [UserRole.COMPTABLE]: 'Comptable',
  [UserRole.SUPPLEANT]: 'Suppléant',
  [UserRole.TEACHER]: 'Professeur',
  [UserRole.STUDENT]: 'Étudiant',
  [UserRole.PARENT]: 'Parent',
  [UserRole.USER]: 'Utilisateur',
};
