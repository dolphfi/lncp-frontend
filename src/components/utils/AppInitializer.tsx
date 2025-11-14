import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStoreSimple';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => {
    // Vérifier l'authentification seulement pour les routes protégées
    const protectedRoutes = ['/dashboard', '/students', '/employees', '/courses', '/admin', '/monitoring'];
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
    
    if (isProtectedRoute) {
      checkAuth();
    }
  }, [location.pathname, checkAuth]);

  useEffect(() => {
    // Rediriger seulement si l'utilisateur est authentifié ET qu'il essaie d'accéder à /login
    if (isAuthenticated && location.pathname === '/login') {
      if (user?.role === 'PARENT' || user?.role === 'STUDENT') {
        navigate('/dashboard-overview', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return <>{children}</>;
};

export default AppInitializer;
