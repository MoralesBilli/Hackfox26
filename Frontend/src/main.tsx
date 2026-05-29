import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Importante: mantenemos tu CSS global
import App from './App';
import { AccessibilityProvider } from './AccesibilidadContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </StrictMode>
);