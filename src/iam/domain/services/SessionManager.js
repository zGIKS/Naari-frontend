import { ApiRouter } from '../../../shared/services/ApiRouter.js';
import { JWTUtils } from '../../../shared/utils/jwtUtils.js';

export class SessionManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.currentUser = null;
    this.token = null;
    this.observers = [];
    this.isValidatingSession = false;
    this.lastUserFetch = null;
    this.userCacheExpiry = 5 * 60 * 1000; // 5 minutos
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  notifyObservers(event, data) {
    this.observers.forEach(observer => observer.update(event, data));
  }

  async validateSession() {
    // Evitar múltiples validaciones simultáneas
    if (this.isValidatingSession) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.isValidatingSession) {
            clearInterval(checkInterval);
            resolve(!!this.currentUser);
          }
        }, 50);
      });
    }

    const token = this.getStoredToken();
    if (!token) {
      return false;
    }

    // Verificar si el token ha expirado
    if (JWTUtils.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }

    // Si ya tenemos un usuario válido y el cache no ha expirado, usar cache
    if (this.currentUser && this.lastUserFetch && 
        (Date.now() - this.lastUserFetch < this.userCacheExpiry)) {
      console.log('SessionManager - Using cached user data');
      return true;
    }

    this.isValidatingSession = true;

    try {
      this.apiClient.setAuthToken(token);
      
      // Extraer roles del JWT
      const tokenInfo = JWTUtils.getTokenInfo(token);
      console.log('SessionManager - Token info during validation:', tokenInfo);
      
      const userResponse = await this.apiClient.get(ApiRouter.USERS.ME);
      console.log('SessionManager - User response from /users/me:', userResponse);
      
      if (userResponse.active !== false) {
        // Combinar datos del usuario con roles del JWT
        const userWithRoles = {
          ...userResponse,
          authenticated: true,
          roles: tokenInfo?.roles || [],
          userId: tokenInfo?.userId,
          sessionId: tokenInfo?.sessionId
        };
        
        console.log('SessionManager - Final user with roles:', userWithRoles);
        
        this.currentUser = userWithRoles;
        this.token = token;
        this.lastUserFetch = Date.now();
        
        this.isValidatingSession = false;
        return true;
      } else {
        this.clearSession();
        this.isValidatingSession = false;
        return false;
      }
    } catch {
      this.clearSession();
      this.isValidatingSession = false;
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
        
        if (userResponse.active !== false) {
          // Combinar datos del usuario con roles del JWT
          const userWithRoles = {
            ...userResponse,
            authenticated: true, // Agregamos esta propiedad ya que el API no la incluye
            roles: tokenInfo?.roles || [],
            userId: tokenInfo?.userId,
            sessionId: tokenInfo?.sessionId
          };
          
          console.log('SessionManager - Final user with roles during login:', userWithRoles); // Debug log
          
          this.currentUser = userWithRoles;
          this.lastUserFetch = Date.now();
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
    this.lastUserFetch = null;
    this.isValidatingSession = false;
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
    return localStorage.getItem('naari_auth_token');
  }

  storeToken(token) {
    localStorage.setItem('naari_auth_token', token);
  }

  removeStoredToken() {
    localStorage.removeItem('naari_auth_token');
  }
}