import React, { useState } from 'react';

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setResult('Test en cours...');

    try {
      // Test de base - ping de l'API
      const response = await fetch('http://10.150.50.37:3000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.text();
        setResult(`✅ API accessible ! Réponse: ${data}`);
      } else {
        setResult(`⚠️ API répond mais avec erreur: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setResult(`❌ Erreur de connexion: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testLoginEndpoint = async () => {
    setLoading(true);
    setResult('Test de l\'endpoint login...');

    try {
      const response = await fetch('http://10.150.50.37:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });

      const data = await response.text();
      
      if (response.ok) {
        setResult(`✅ Endpoint login accessible ! Réponse: ${data}`);
      } else {
        setResult(`⚠️ Endpoint login répond: ${response.status} ${response.statusText} - ${data}`);
      }
    } catch (error) {
      setResult(`❌ Erreur sur endpoint login: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Test de Connexion API</h2>
      
      <div className="space-y-4">
        <button
          onClick={testApiConnection}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Tester API Health'}
        </button>

        <button
          onClick={testLoginEndpoint}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Tester Endpoint Login'}
        </button>

        {result && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>URL API:</strong> http://10.150.50.37:3000/api</p>
        <p><strong>Variable d'env:</strong> {process.env.REACT_APP_API_URL || 'Non définie'}</p>
      </div>
    </div>
  );
};

export default ApiTest;
