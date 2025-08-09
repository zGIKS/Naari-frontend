import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/critical.css' // Solo CSS crítico
import App from './App.jsx'

// Función para registrar el Service Worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('SW: Registered successfully', registration);
      
      // Escuchar actualizaciones del SW
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nuevo SW disponible, mostrar notificación de actualización
            console.log('SW: New version available');
          }
        });
      });
      
    } catch (error) {
      console.error('SW: Registration failed', error);
    }
  }
};

// Función para cargar CSS no crítico de manera asíncrona
const loadNonCriticalCSS = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/src/styles/main.css';
  link.media = 'print';
  link.onload = function() {
    this.media = 'all';
  };
  document.head.appendChild(link);
};

// Función optimizada para inicializar la app
const initializeApp = () => {
  const rootElement = document.getElementById('root');
  
  // Limpiar el loading inicial del HTML
  rootElement.innerHTML = '';
  
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  // Cargar CSS no crítico después del render inicial
  requestIdleCallback(() => {
    loadNonCriticalCSS();
  }, { timeout: 2000 });
  
  // Registrar Service Worker después de la inicialización
  requestIdleCallback(() => {
    registerServiceWorker();
  }, { timeout: 3000 });
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
