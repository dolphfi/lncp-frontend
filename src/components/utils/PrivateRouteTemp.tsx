import React from 'react';

interface Props {
  children: React.ReactNode;
}

// Temporaire: passe directement les enfants sans vérification
const PrivateRouteTemp: React.FC<Props> = ({ children }) => {
  return <>{children}</>;
};

export default PrivateRouteTemp;
