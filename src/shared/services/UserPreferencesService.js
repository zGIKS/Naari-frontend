import { ApiRouter } from './ApiRouter.js';

/**
 * UserPreferencesService - Servicio para manejar preferencias de usuario
 */
export class UserPreferencesService {
  constructor(apiBase, token) {
    this.apiBase = apiBase;
    this.token = token;
    this.cache = null;
    this.cacheTimestamp = null;
    this.CACHE_DURATION = 5000; // 5 segundos
  }

  /**
   * Obtener preferencias del usuario actual
   */
  async getUserPreferences() {
    try {
      // Verificar cache
      if (this.cache && this.cacheTimestamp && 
          (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
        console.log('Returning cached user preferences');
        return this.cache;
      }

      console.log('Fetching user preferences from:', ApiRouter.USER_PREFERENCES.BASE);
      const response = await fetch(ApiRouter.USER_PREFERENCES.BASE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('User preferences response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('User preferences received:', data);
      
      const preferences = data.data || data;
      // Actualizar cache
      this.cache = preferences;
      this.cacheTimestamp = Date.now();
      
      return preferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      // Retornar valores por defecto si falla
      return {
        theme: 'light',
        language: 'es'
      };
    }
  }

  /**
   * Actualizar preferencias del usuario
   * @param {Object} preferences - { theme: 'dark', language: 'en' }
   */
  async updateUserPreferences(preferences) {
    try {
      console.log('Updating user preferences:', preferences);
      console.log('Update URL:', ApiRouter.USER_PREFERENCES.BASE);
      
      const response = await fetch(ApiRouter.USER_PREFERENCES.BASE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      console.log('Update preferences response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update preferences error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Preferences updated successfully:', data);
      
      const updatedPreferences = data.data || data;
      // Actualizar cache con los nuevos datos
      this.cache = updatedPreferences;
      this.cacheTimestamp = Date.now();
      
      return updatedPreferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Actualizar solo el tema
   * @param {string} theme - 'light' o 'dark'
   */
  async updateTheme(theme) {
    const currentPreferences = await this.getUserPreferences();
    return this.updateUserPreferences({
      ...currentPreferences,
      theme
    });
  }

  /**
   * Actualizar solo el idioma
   * @param {string} language - 'es', 'en', etc.
   */
  async updateLanguage(language) {
    const currentPreferences = await this.getUserPreferences();
    return this.updateUserPreferences({
      ...currentPreferences,
      language
    });
  }
}