import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPreferencesService } from '../services/UserPreferencesService';
import { API_CONFIG } from '../config/ApiConfig';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [preferencesService, setPreferencesService] = useState(null);

  // Inicializar servicio de preferencias
  useEffect(() => {
    const token = sessionStorage.getItem('naari_token');
    if (token) {
      const service = new UserPreferencesService(API_CONFIG.API_BASE, token);
      setPreferencesService(service);
      loadUserLanguagePreference(service);
    } else {
      // Si no hay token, usar localStorage como fallback
      const savedLanguage = localStorage.getItem('naari_language') || 'es';
      i18n.changeLanguage(savedLanguage);
      setLoading(false);
    }
  }, [i18n]);

  // Cargar preferencia de idioma del servidor
  const loadUserLanguagePreference = async (service) => {
    try {
      setLoading(true);
      const preferences = await service.getUserPreferences();
      const language = preferences.language || 'es';
      
      // Cambiar idioma en i18n
      await i18n.changeLanguage(language);
      
      // Sincronizar con localStorage para fallback
      localStorage.setItem('naari_language', language);
    } catch (error) {
      console.error('Error loading user language preference:', error);
      // Fallback a localStorage
      const savedLanguage = localStorage.getItem('naari_language') || 'es';
      await i18n.changeLanguage(savedLanguage);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar idioma
  const changeLanguage = async (newLanguage) => {
    try {
      // Cambiar inmediatamente en i18n
      await i18n.changeLanguage(newLanguage);
      
      // Guardar en localStorage para fallback
      localStorage.setItem('naari_language', newLanguage);
      
      // Sincronizar con el servidor
      if (preferencesService) {
        try {
          await preferencesService.updateLanguage(newLanguage);
        } catch (error) {
          console.error('Error updating language preference:', error);
          // El idioma ya se cambió localmente, no revertir para mejor UX
        }
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    loading,
    availableLanguages: [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' }
    ]
  };
};