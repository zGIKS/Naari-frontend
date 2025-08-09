import { ApiRouter } from '../../../shared/services/ApiRouter.js';
import { JWTUtils } from '../../../shared/utils/jwtUtils.js';

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

    // Verificar si el token ha expirado
    if (JWTUtils.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }

    try {
      this.apiClient.setAuthToken(token);
      
      // Extraer roles del JWT
      const tokenInfo = JWTUtils.getTokenInfo(token);
      console.log('SessionManager - Token info during validation:', tokenInfo); // Debug log
      
      const userResponse = await this.apiClient.get(ApiRouter.USERS.ME);
      console.log('SessionManager - User response from /users/me:', userResponse); // Debug log
      
      if (userResponse.authenticated && userResponse.active) {
        // Combinar datos del usuario con roles del JWT
        const userWithRoles = {
          ...userResponse,
          roles: tokenInfo?.roles || [],
          userId: tokenInfo?.userId,
          sessionId: tokenInfo?.sessionId
        };
        
        console.log('SessionManager - Final user with roles:', userWithRoles); // Debug log
        
        this.currentUser = userWithRoles;
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
        
        // Extraer roles del JWT
        const tokenInfo = JWTUtils.getTokenInfo(loginResponse.accessToken);
        console.log('SessionManager - Token info during login:', tokenInfo); // Debug log
        
        // Obtener datos del usuario
        const userResponse = await this.apiClient.get(ApiRouter.USERS.ME);
        console.log('SessionManager - User response during login:', userResponse); // Debug log
        
        if (userResponse.authenticated && userResponse.active) {
          // Combinar datos del usuario con roles del JWT
          const userWithRoles = {
            ...userResponse,
            roles: tokenInfo?.roles || [],
            userId: tokenInfo?.userId,
            sessionId: tokenInfo?.sessionId
          };
          
          console.log('SessionManager - Final user with roles during login:', userWithRoles); // Debug log
          
          this.currentUser = userWithRoles;
          this.notifyObservers('SESSION_CREATED', userWithRoles);
          return { success: true, user: userWithRoles };
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

  async logout() {
    try {
      if (this.token) {
        await this.apiClient.post(ApiRouter.AUTH.LOGOUT, {});
      }
    } catch (error) {
      console.warn('Error during logout API call:', error);
    } finally {
      this.clearSession();
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