import { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferencesService } from '../services/UserPreferencesService';
import { API_CONFIG } from '../config/ApiConfig';

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [preferencesService, setPreferencesService] = useState(null);

  // Inicializar servicio de preferencias
  useEffect(() => {
    const token = localStorage.getItem('naari_auth_token');
    if (token) {
      const service = new UserPreferencesService(API_CONFIG.API_BASE, token);
      setPreferencesService(service);
      loadUserPreferences(service);
    } else {
      // Si no hay token, usar localStorage como fallback
      const savedTheme = localStorage.getItem('naari_theme') || 'light';
      setTheme(savedTheme);
      setLoading(false);
    }
  }, []);

  // Cargar preferencias del servidor
  const loadUserPreferences = async (service) => {
    try {
      setLoading(true);
      const preferences = await service.getUserPreferences();
      setTheme(preferences.theme || 'light');
      
      // Sincronizar con localStorage para fallback
      localStorage.setItem('naari_theme', preferences.theme || 'light');
    } catch (error) {
      console.error('Error loading user preferences:', error);
      // Fallback a localStorage
      const savedTheme = localStorage.getItem('naari_theme') || 'light';
      setTheme(savedTheme);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar tema al DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('naari_theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Actualizar inmediatamente el estado local
    setTheme(newTheme);
    
    // Sincronizar con el servidor
    if (preferencesService) {
      try {
        await preferencesService.updateTheme(newTheme);
      } catch (error) {
        console.error('Error updating theme preference:', error);
        // El tema ya se cambió localmente, no revertir para mejor UX
      }
    }
  };

  const updateTheme = async (newTheme) => {
    setTheme(newTheme);
    
    if (preferencesService) {
      try {
        await preferencesService.updateTheme(newTheme);
      } catch (error) {
        console.error('Error updating theme preference:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      updateTheme,
      loading 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};