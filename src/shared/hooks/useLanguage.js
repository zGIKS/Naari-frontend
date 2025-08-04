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
      console.log('Loading user language preference...');
      
      const preferences = await service.getUserPreferences();
      const language = preferences.language || 'es';
      
      console.log('User language preference loaded:', language);
      console.log('Current i18n language:', i18n.language);
      
      // Cambiar idioma en i18n solo si es diferente
      if (i18n.language !== language) {
        console.log(`Changing language from ${i18n.language} to ${language}`);
        await i18n.changeLanguage(language);
      }
      
      // Sincronizar con localStorage para fallback
      localStorage.setItem('naari_language', language);
    } catch (error) {
      console.error('Error loading user language preference:', error);
      // Fallback a localStorage
      const savedLanguage = localStorage.getItem('naari_language') || 'es';
      console.log('Using fallback language:', savedLanguage);
      await i18n.changeLanguage(savedLanguage);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar idioma
  const changeLanguage = async (newLanguage) => {
    if (newLanguage === i18n.language) {
      // Si ya es el idioma actual, no hacer nada
      return;
    }

    try {
      setLoading(true);
      
      // Cambiar inmediatamente en i18n
      await i18n.changeLanguage(newLanguage);
      
      // Guardar en localStorage para fallback
      localStorage.setItem('naari_language', newLanguage);
      
      // Sincronizar con el servidor
      if (preferencesService) {
        try {
          await preferencesService.updateLanguage(newLanguage);
          console.log(`Language updated to ${newLanguage} on server`);
        } catch (error) {
          console.error('Error updating language preference on server:', error);
          // El idioma ya se cambió localmente, no revertir para mejor UX
        }
      }
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setLoading(false);
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