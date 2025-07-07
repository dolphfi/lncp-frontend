import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// ✨ Suppression des erreurs ResizeObserver non-critiques
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
const resizeObserverLoopErr = 'ResizeObserver loop completed with undelivered notifications.';

const consoleError = console.error;
console.error = (...args) => {
  const errorMessage = args[0];
  if (typeof errorMessage === 'string') {
    if (errorMessage.includes(resizeObserverLoopErr)) {
      return; // Ignore cette erreur non-critique
    }
  }
  consoleError(...args);
};

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
