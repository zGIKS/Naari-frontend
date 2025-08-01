import { ClientService } from '../../application/services/ClientService.js';
import { ApiClient } from '../../../iam/infrastructure/api/ApiClient.js';

/**
 * ClientFactory - Factory para crear instancias de servicios de cliente
 */
export class ClientFactory {
  static _instance = null;
  static _clientService = null;

  /**
   * Obtiene la instancia singleton del factory
   */
  static getInstance() {
    if (!ClientFactory._instance) {
      ClientFactory._instance = new ClientFactory();
    }
    return ClientFactory._instance;
  }

  /**
   * Inicializa el factory con la configuración necesaria
   */
  initialize(apiBaseUrl, authToken) {
    this.apiBaseUrl = apiBaseUrl;
    this.authToken = authToken;
    
    // Resetear servicios para que se recreen con nuevo token
    ClientFactory._clientService = null;
  }

  /**
   * Crea o retorna el servicio de clientes
   */
  createClientService() {
    if (!ClientFactory._clientService) {
      if (!this.apiBaseUrl || !this.authToken) {
        throw new Error('ClientFactory must be initialized before creating services');
      }

      const apiClient = ApiClient.getInstance();
      apiClient.initialize(this.apiBaseUrl, this.authToken);
      
      ClientFactory._clientService = new ClientService(apiClient);
    }
    
    return ClientFactory._clientService;
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
    ClientFactory._clientService = null;
    this.apiBaseUrl = null;
    this.authToken = null;
  }
}