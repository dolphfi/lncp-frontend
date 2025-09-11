import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStoreSimple';
import { Loader2 } from 'lucide-react';
import authService from '../../services/authService';

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
  | 'RESPONSABLE'
  | 'PARENT'
  | 'USER';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[]; // les rôles autorisés
}

function RoleRoute({ children, allowedRoles }: RoleRouteProps): React.ReactElement {
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

  // SUPER_ADMIN a accès à tout
  if (role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  // Sinon, vérifier si le rôle de l'utilisateur est autorisé
  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // Accès refusé -> rediriger vers le tableau de bord
  return <Navigate to="/dashboard" replace />;
}

export default RoleRoute;
