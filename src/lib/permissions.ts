/**
 * =====================================================
 * SYSTÈME DE PERMISSIONS ET RÔLES
 * =====================================================
 * Gestion centralisée des permissions basée sur les rôles utilisateur
 */

// Types pour les rôles utilisateur (doivent correspondre au backend)
export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DIRECTOR'
  | 'CENSORED'
  | 'COMPTABLE'
  | 'SUPPLEANT'
  | 'TEACHER'
  | 'SECRETARY'
  | 'STUDENT'
  | 'PARENT'
  | 'USER';

// Types pour les permissions
export type Permission =
  | 'users.read'
  | 'users.write'
  | 'users.delete'
  | 'students.read'
  | 'students.write'
  | 'students.delete'
  | 'courses.read'
  | 'courses.write'
  | 'courses.delete'
  | 'employees.read'
  | 'employees.write'
  | 'employees.delete'
  | 'academic.read'
  | 'academic.write'
  | 'academic.delete'
  | 'notes.read'
  | 'notes.write'
  | 'notes.delete'
  | 'payments.read'
  | 'payments.write'
  | 'payments.delete'
  | 'admin.read'
  | 'admin.write'
  | 'system.read'
  | 'system.write';

// Configuration des permissions par rôle
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    // Accès complet à tout
    'users.read', 'users.write', 'users.delete',
    'students.read', 'students.write', 'students.delete',
    'courses.read', 'courses.write', 'courses.delete',
    'employees.read', 'employees.write', 'employees.delete',
    'academic.read', 'academic.write', 'academic.delete',
    'notes.read', 'notes.write', 'notes.delete',
    'payments.read', 'payments.write', 'payments.delete',
    'admin.read', 'admin.write',
    'system.read', 'system.write'
  ],

  ADMIN: [
    // Gestion complète sauf administration système
    'users.read', 'users.write', 'users.delete',
    'students.read', 'students.write', 'students.delete',
    'courses.read', 'courses.write', 'courses.delete',
    'employees.read', 'employees.write', 'employees.delete',
    'academic.read', 'academic.write', 'academic.delete',
    'notes.read', 'notes.write', 'notes.delete',
    'payments.read', 'payments.write', 'payments.delete',
    'admin.read', 'admin.write'
  ],

  DIRECTOR: [
    // Gestion pédagogique et administrative
    'users.read',
    'students.read', 'students.write',
    'courses.read', 'courses.write',
    'employees.read', 'employees.write',
    'academic.read', 'academic.write',
    'notes.read', 'notes.write',
    'admin.read'
  ],

  CENSORED: [
    // Gestion pédagogique (équivalent à DIRECTOR)
    'users.read',
    'students.read', 'students.write',
    'courses.read', 'courses.write',
    'employees.read', 'employees.write',
    'academic.read', 'academic.write',
    'notes.read', 'notes.write',
    'admin.read'
  ],

  COMPTABLE: [
    // Gestion financière et administrative
    'users.read',
    'students.read',
    'courses.read',
    'employees.read',
    'academic.read',
    'notes.read',
    'payments.read', 'payments.write', 'payments.delete',
    'admin.read'
  ],

  SUPPLEANT: [
    // Gestion pédagogique (équivalent à TEACHER) - Notes et horaires académiques
    'users.read',
    'students.read', 'students.write',
    'courses.read', 'courses.write',
    'employees.read',
    'academic.read', 'academic.write',
    'notes.read', 'notes.write'
  ],

  TEACHER: [
    // Gestion pédagogique limitée - Notes et horaires académiques
    'notes.read', 'notes.write',
    'academic.read'  // ✅ Ajout de l'accès en lecture aux horaires académiques
  ],

  SECRETARY: [
    // Gestion administrative de base + employés, mais pas ressources matérielles/financières
    'users.read',
    'students.read', 'students.write',
    'courses.read',
    'employees.read', 'employees.write', // ✅ Accès aux employés
    'academic.read',
    'notes.read'
  ],

  STUDENT: [
    // Accès limité aux informations personnelles et académiques
    'academic.read',
    'notes.read'
  ],

  PARENT: [
    // Accès aux informations de leur enfant
    'academic.read',
    'notes.read'
  ],

  USER: [
    // Rôle générique avec permissions minimales
    'users.read'
  ]
};

/**
 * Vérifier si un utilisateur a une permission spécifique
 */
export function hasPermission(userRole: UserRole | undefined, permission: Permission): boolean {
  if (!userRole) return false;

  // SUPER_ADMIN a toujours accès à tout
  if (userRole === 'SUPER_ADMIN') return true;

  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

/**
 * Vérifier si un utilisateur a plusieurs permissions
 */
export function hasPermissions(userRole: UserRole | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Vérifier si un utilisateur a au moins une des permissions spécifiées
 */
export function hasAnyPermission(userRole: UserRole | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Obtenir toutes les permissions d'un rôle
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Vérifier si un rôle peut accéder à une fonctionnalité donnée
 */
export function canAccessFeature(userRole: UserRole | undefined, feature: 'users' | 'students' | 'courses' | 'employees' | 'academic' | 'notes' | 'admin' | 'system' | 'payments'): boolean {
  if (!userRole) return false;

  switch (feature) {
    case 'users':
      return hasAnyPermission(userRole, ['users.read', 'users.write', 'users.delete']);
    case 'students':
      return hasAnyPermission(userRole, ['students.read', 'students.write', 'students.delete']);
    case 'courses':
      return hasAnyPermission(userRole, ['courses.read', 'courses.write', 'courses.delete']);
    case 'employees':
      return hasAnyPermission(userRole, ['employees.read', 'employees.write', 'employees.delete']);
    case 'academic':
      return hasAnyPermission(userRole, ['academic.read', 'academic.write', 'academic.delete']);
    case 'notes':
      return hasAnyPermission(userRole, ['notes.read', 'notes.write', 'notes.delete']);
    case 'payments':
      return hasAnyPermission(userRole, ['payments.read', 'payments.write', 'payments.delete']);
    case 'admin':
      return hasAnyPermission(userRole, ['admin.read', 'admin.write']);
    case 'system':
      return hasAnyPermission(userRole, ['system.read', 'system.write']);
    default:
      return false;
  }
}

/**
 * Vérifier si un rôle peut modifier une ressource donnée
 */
export function canModifyResource(userRole: UserRole | undefined, resource: 'users' | 'students' | 'courses' | 'employees' | 'academic' | 'admin' | 'system'): boolean {
  if (!userRole) return false;

  switch (resource) {
    case 'users':
      return hasPermission(userRole, 'users.write');
    case 'students':
      return hasPermission(userRole, 'students.write');
    case 'courses':
      return hasPermission(userRole, 'courses.write');
    case 'employees':
      return hasPermission(userRole, 'employees.write');
    case 'academic':
      return hasPermission(userRole, 'academic.write');
    case 'admin':
      return hasPermission(userRole, 'admin.write');
    case 'system':
      return hasPermission(userRole, 'system.write');
    default:
      return false;
  }
}

/**
 * Obtenir la hiérarchie des rôles (pour les comparaisons)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 90,
  DIRECTOR: 80,
  CENSORED: 80,
  COMPTABLE: 70,
  SUPPLEANT: 60,
  TEACHER: 60,
  SECRETARY: 50,
  STUDENT: 10,
  PARENT: 10,
  USER: 5
};

/**
 * Vérifier si un rôle est supérieur ou égal à un autre dans la hiérarchie
 */
export function isRoleAtLeast(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Obtenir le nom d'affichage d'un rôle
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrateur',
    ADMIN: 'Administrateur',
    DIRECTOR: 'Directeur',
    CENSORED: 'Censeur',
    COMPTABLE: 'Comptable',
    SUPPLEANT: 'Suppléant',
    TEACHER: 'Enseignant',
    SECRETARY: 'Secrétaire',
    STUDENT: 'Étudiant',
    PARENT: 'Parent',
    USER: 'Utilisateur'
  };

  return roleNames[role] || role;
}
