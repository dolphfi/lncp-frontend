/**
 * =====================================================
 * HOOKS POUR LES PERMISSIONS
 * =====================================================
 * Hooks React pour vérifier facilement les permissions dans les composants
 */

import { useAuthStore } from '../stores/authStoreSimple';
import { UserRole, Permission, hasPermission, hasPermissions, hasAnyPermission, canAccessFeature, canModifyResource, getRolePermissions } from '../lib/permissions';

/**
 * Hook pour obtenir l'utilisateur actuel et son rôle
 */
export function useCurrentUser() {
  const { user } = useAuthStore();
  return {
    user,
    role: user?.role as UserRole | undefined,
    isAuthenticated: useAuthStore(state => state.isAuthenticated)
  };
}

/**
 * Hook pour vérifier si l'utilisateur a une permission spécifique
 */
export function usePermission(permission: Permission): boolean {
  const { role } = useCurrentUser();
  return hasPermission(role, permission);
}

/**
 * Hook pour vérifier si l'utilisateur a plusieurs permissions
 */
export function usePermissions(permissions: Permission[]): boolean {
  const { role } = useCurrentUser();
  return hasPermissions(role, permissions);
}

/**
 * Hook pour vérifier si l'utilisateur a au moins une des permissions spécifiées
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const { role } = useCurrentUser();
  return hasAnyPermission(role, permissions);
}

/**
 * Hook pour vérifier si l'utilisateur peut accéder à une fonctionnalité
 */
export function useFeatureAccess(feature: 'users' | 'students' | 'courses' | 'employees' | 'academic' | 'admin' | 'system'): boolean {
  const { role } = useCurrentUser();
  return canAccessFeature(role, feature);
}

/**
 * Hook pour vérifier si l'utilisateur peut modifier une ressource
 */
export function useResourceModification(resource: 'users' | 'students' | 'courses' | 'employees' | 'academic' | 'admin' | 'system'): boolean {
  const { role } = useCurrentUser();
  return canModifyResource(role, resource);
}

/**
 * Hook pour obtenir toutes les permissions du rôle actuel
 */
export function useRolePermissions(): Permission[] {
  const { role } = useCurrentUser();
  return role ? getRolePermissions(role) : [];
}

/**
 * Hook pour vérifier si l'utilisateur est un administrateur
 */
export function useIsAdmin(): boolean {
  const { role } = useCurrentUser();
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

/**
 * Hook pour vérifier si l'utilisateur est un enseignant ou équivalent
 */
export function useIsTeacher(): boolean {
  const { role } = useCurrentUser();
  return role === 'TEACHER' || role === 'SUPPLEANT' || role === 'DIRECTOR' || role === 'CENSORED';
}

/**
 * Hook pour vérifier si l'utilisateur peut gérer les employés
 */
export function useCanManageEmployees(): boolean {
  return usePermission('employees.write');
}

/**
 * Hook pour vérifier si l'utilisateur peut gérer les étudiants
 */
export function useCanManageStudents(): boolean {
  return usePermission('students.write');
}

/**
 * Hook pour vérifier si l'utilisateur peut gérer les cours
 */
export function useCanManageCourses(): boolean {
  return usePermission('courses.write');
}

/**
 * Hook pour vérifier si l'utilisateur peut gérer les notes
 */
export function useCanManageNotes(): boolean {
  return usePermission('notes.write');
}

/**
 * Hook pour vérifier si l'utilisateur peut accéder aux notes
 */
export function useCanAccessNotes(): boolean {
  return usePermission('notes.read');
}
