import { ApiRouter } from './ApiRouter.js';

/**
 * UserPreferencesService - Servicio para manejar preferencias de usuario
 */
export class UserPreferencesService {
  constructor(apiBase, token) {
    this.apiBase = apiBase;
    this.token = token;
  }

  /**
   * Obtener preferencias del usuario actual
   */
  async getUserPreferences() {
    try {
      const response = await fetch(ApiRouter.USER_PREFERENCES.BASE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data; // Support both { data: {...} } and direct response formats
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
      const response = await fetch(ApiRouter.USER_PREFERENCES.BASE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data; // Support both { data: {...} } and direct response formats
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