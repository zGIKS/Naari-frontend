import { AuthService } from '../../application/services/AuthService.js';
import { ApiClient } from '../api/ApiClient.js';

export class AuthServiceFactory {
  static instance = null;

  static getInstance() {
    if (!AuthServiceFactory.instance) {
      const apiClient = new ApiClient();
      AuthServiceFactory.instance = new AuthService(apiClient);
    }
    return AuthServiceFactory.instance;
  }
  
  static resetInstance() {
    AuthServiceFactory.instance = null;
  }
}