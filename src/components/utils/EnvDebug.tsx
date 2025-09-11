import React from 'react';

const EnvDebug: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Debug Variables d'Environnement</h2>
      
      <div className="space-y-2 font-mono text-sm">
        <div>
          <strong>REACT_APP_API_URL:</strong> {process.env.REACT_APP_API_URL || 'NON DÉFINIE'}
        </div>
        <div>
          <strong>REACT_APP_ENV:</strong> {process.env.REACT_APP_ENV || 'NON DÉFINIE'}
        </div>
        <div>
          <strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'NON DÉFINIE'}
        </div>
        <div>
          <strong>Toutes les variables REACT_APP_*:</strong>
          <pre className="mt-2 p-2 bg-white rounded text-xs">
            {JSON.stringify(
              Object.keys(process.env)
                .filter(key => key.startsWith('REACT_APP_'))
                .reduce((obj, key) => {
                  obj[key] = process.env[key];
                  return obj;
                }, {} as Record<string, any>),
              null,
              2
            )}
          </pre>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-100 rounded">
        <p className="text-sm">
          <strong>Note:</strong> Si REACT_APP_API_URL est "NON DÉFINIE", 
          cela signifie que le serveur React n'a pas été redémarré après 
          la création du fichier .env
        </p>
      </div>
    </div>
  );
};

export default EnvDebug;
