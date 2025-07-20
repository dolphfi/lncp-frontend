import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Gestion des erreurs de ResizeObserver
window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop limit exceeded') {
    e.stopImmediatePropagation();
  }
});

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("L'élément racine avec l'ID 'root' n'a pas été trouvé.");
}
