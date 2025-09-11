import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStoreSimple';
import { Loader2 } from 'lucide-react';
import authService from '../../services/authService';

interface PrivateRouteProps {
    children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps): React.ReactElement {
    const navigate = useNavigate();
    const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        // Vérifier l'authentification au montage du composant
        checkAuth();
        // Reprogrammer l'auto-refresh si un token existe (cas de reload)
        authService.ensureAutoRefresh();
        // Sur retour d'arrière-plan, vérifier l'expiration et reprogrammer
        const onResume = () => authService.handleResumeFromBackground();
        const onCleared = () => navigate('/login', { replace: true });
        document.addEventListener('visibilitychange', onResume);
        window.addEventListener('focus', onResume);
        document.addEventListener('auth:cleared', onCleared as EventListener);
        return () => {
            document.removeEventListener('visibilitychange', onResume);
            window.removeEventListener('focus', onResume);
            document.removeEventListener('auth:cleared', onCleared as EventListener);
        }
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            // Dès que l'utilisateur est authentifié, s'assurer que le refresh est programmé
            authService.ensureAutoRefresh();
        }
    }, [isAuthenticated]);

    // Afficher un loader pendant la vérification
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
        // Si l'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion.
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default PrivateRoute;
