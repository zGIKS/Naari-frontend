import { UserService } from '../../application/services/UserService.js';
import { ApiClient } from '../../../iam/infrastructure/api/ApiClient.js';

/**
 * UserFactory - Factory para crear instancias de servicios de usuario
 */
export class UserFactory {
  static _instance = null;
  static _userService = null;

  /**
   * Obtiene la instancia singleton del factory
   */
  static getInstance() {
    if (!UserFactory._instance) {
      UserFactory._instance = new UserFactory();
    }
    return UserFactory._instance;
  }

  /**
   * Inicializa el factory con la configuración necesaria
   */
  initialize(apiBaseUrl, authToken) {
    this.apiBaseUrl = apiBaseUrl;
    this.authToken = authToken;
    
    // Resetear servicios para que se recreen con nuevo token
    UserFactory._userService = null;
  }

  /**
   * Crea o retorna el servicio de usuarios
   */
  createUserService(t = null) {
    if (!UserFactory._userService) {
      if (!this.apiBaseUrl || !this.authToken) {
        throw new Error('UserFactory must be initialized before creating services');
      }

      const apiClient = ApiClient.getInstance();
      apiClient.initialize(this.apiBaseUrl, this.authToken);
      
      UserFactory._userService = new UserService(apiClient, t);
    }
    
    return UserFactory._userService;
  }

  /**
   * Obtiene el cliente API configurado
   */
  getApiClient() {
    const apiClient = ApiClient.getInstance();
    apiClient.initialize(this.apiBaseUrl, this.authToken);
    return apiClient;
  }

  /**
   * Resetea el factory (útil para testing o cambios de usuario)
   */
  reset() {
    UserFactory._userService = null;
    this.apiBaseUrl = null;
    this.authToken = null;
  }
}