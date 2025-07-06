import React from 'react';
import { Navigate } from 'react-router-dom';

type PrivateRouteProps = {
    children: React.ReactElement;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
        // Si l'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion.
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
