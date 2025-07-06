import React from 'react';
// import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    // const { user } = useContext(Auth);

    // Si l'utilisateur n'est pas authentifié, redirige vers la page de connexion
    // if (!user) {
    //     return <Navigate to="/" replace />;
    // }
    // TODO: Add authentication logic here
    // For now, just rendering children
    return children;
};
export default PrivateRoute;