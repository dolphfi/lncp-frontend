import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStoreSimple';
import { Loader2 } from 'lucide-react';
import authService from '../../services/authService';
import { hasPermission, canAccessFeature } from '../../lib/permissions';

// Liste des rôles disponibles côté front (alignée avec le backend)
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

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[]; // les rôles autorisés (ancien système)
  requiredPermission?: string; // nouvelle approche basée sur les permissions
  requiredFeature?: 'users' | 'students' | 'courses' | 'employees' | 'academic' | 'notes' | 'admin' | 'system'; // accès à une fonctionnalité
}

function RoleRoute({ children, allowedRoles, requiredPermission, requiredFeature }: RoleRouteProps): React.ReactElement {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
    authService.ensureAutoRefresh();
    const onCleared = () => navigate('/login', { replace: true });
    document.addEventListener('auth:cleared', onCleared as EventListener);
    return () => document.removeEventListener('auth:cleared', onCleared as EventListener);
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      authService.ensureAutoRefresh();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role as UserRole | undefined;

  // Vérification basée sur les rôles (ancien système - pour compatibilité)
  if (allowedRoles && allowedRoles.length > 0) {
    // SUPER_ADMIN a accès à tout
    if (role === 'SUPER_ADMIN') {
      return <>{children}</>;
    }

    // Sinon, vérifier si le rôle de l'utilisateur est autorisé
    if (role && allowedRoles.includes(role)) {
      return <>{children}</>;
    }
  }

  // Vérification basée sur les permissions (nouveau système)
  if (requiredPermission) {
    if (hasPermission(role, requiredPermission as any)) {
      return <>{children}</>;
    }
  }

  // Vérification basée sur les fonctionnalités (nouveau système)
  if (requiredFeature) {
    if (role === 'SUPER_ADMIN') {
      return <>{children}</>;
    }

    if (canAccessFeature(role, requiredFeature)) {
      return <>{children}</>;
    }
  }

  // Si aucune condition n'est remplie, accès refusé
  return <Navigate to="/dashboard" replace />;
}

export default RoleRoute;
