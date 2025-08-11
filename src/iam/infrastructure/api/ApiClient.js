import axios from 'axios';
import { API_CONFIG } from '../../../shared/config/ApiConfig.js';

export class ApiClient {
  static _instance = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('naari_auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtiene la instancia singleton del ApiClient
   */
  static getInstance() {
    if (!ApiClient._instance) {
      ApiClient._instance = new ApiClient();
    }
    return ApiClient._instance;
  }

  /**
   * Inicializa el cliente con nueva configuración
   */
  initialize(baseURL, authToken) {
    // Recrear el cliente con nueva baseURL si es diferente
    if (baseURL && baseURL !== this.client.defaults.baseURL) {
      this.client = axios.create({
        baseURL: baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.client.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem('naari_auth_token');
          }
          return Promise.reject(error);
        }
      );
    }

    // Configurar token de autenticación
    if (authToken) {
      this.setAuthToken(authToken);
    }
  }

  async post(url, data) {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async get(url) {
    const response = await this.client.get(url);
    return response.data;
  }

  async put(url, data) {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async patch(url, data) {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete(url) {
    const response = await this.client.delete(url);
    return response.data;
  }

  // Métodos con manejo de errores para los nuevos servicios
  async postWithErrorHandling(url, data) {
    try {
      const response = await this.client.post(url, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        response: error.response
      };
    }
  }

  async getWithErrorHandling(url) {
    try {
      const response = await this.client.get(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // Don't log expected 404s for development endpoints that may not exist
      const isExpected404 = error.response?.status === 404 && (
        url.includes('/users') || 
        url.includes('/employees')
      );
      
      if (!isExpected404) {
        console.error(`API Error [${error.response?.status}] ${url}:`, error.response?.data || error.message);
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        response: error.response
      };
    }
  }

  async putWithErrorHandling(url, data) {
    try {
      const response = await this.client.put(url, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // Don't log expected 404s for development endpoints that may not exist
      const isExpected404 = error.response?.status === 404 && (
        url.includes('/users') || 
        url.includes('/employees') ||
        url.includes('/activate') ||
        url.includes('/deactivate')
      );
      
      if (!isExpected404) {
        console.error(`API Error [${error.response?.status}] ${url}:`, error.response?.data || error.message);
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        response: error.response
      };
    }
  }

  async patchWithErrorHandling(url, data) {
    try {
      const response = await this.client.patch(url, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`API Error [${error.response?.status}] ${url}:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        response: error.response
      };
    }
  }

  async deleteWithErrorHandling(url) {
    try {
      const response = await this.client.delete(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        response: error.response
      };
    }
  }

  setAuthToken(token) {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.Authorization;
  }
}