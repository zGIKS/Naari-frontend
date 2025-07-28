import { ApiRouter } from '../../../shared/services/ApiRouter.js';

export class SessionManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.currentUser = null;
    this.token = null;
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  notifyObservers(event, data) {
    this.observers.forEach(observer => observer.update(event, data));
  }

  async validateSession() {
    const token = this.getStoredToken();
    if (!token) {
      return false;
    }

    try {
      this.apiClient.setAuthToken(token);
      const userResponse = await this.apiClient.get(ApiRouter.USERS.ME);
      
      if (userResponse.authenticated && userResponse.active) {
        this.currentUser = userResponse;
        this.token = token;
        return true;
      } else {
        this.clearSession();
        return false;
      }
    } catch (error) {
      this.clearSession();
      return false;
    }
  }

  async createSession(credentials) {
    try {
      const loginResponse = await this.apiClient.post(ApiRouter.AUTH.LOGIN, credentials);
      
      if (loginResponse.accessToken) {
        this.token = loginResponse.accessToken;
        this.storeToken(loginResponse.accessToken);
        this.apiClient.setAuthToken(loginResponse.accessToken);
        
        // Obtener datos del usuario
        const userResponse = await this.apiClient.get(ApiRouter.USERS.ME);
        
        if (userResponse.authenticated && userResponse.active) {
          this.currentUser = userResponse;
          this.notifyObservers('SESSION_CREATED', userResponse);
          return { success: true, user: userResponse };
        } else {
          this.clearSession();
          return { success: false, error: 'USER_NOT_ACTIVE' };
        }
      } else {
        return { success: false, error: 'NO_TOKEN_RECEIVED' };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Authentication failed' };
    }
  }

  clearSession() {
    this.currentUser = null;
    this.token = null;
    this.removeStoredToken();
    this.apiClient.clearAuthToken();
    this.notifyObservers('SESSION_CLEARED', null);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser && !!this.token;
  }

  getStoredToken() {
    return sessionStorage.getItem('naari_token');
  }

  storeToken(token) {
    sessionStorage.setItem('naari_token', token);
  }

  removeStoredToken() {
    sessionStorage.removeItem('naari_token');
  }
}