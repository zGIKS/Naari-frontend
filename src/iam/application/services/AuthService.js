import { LoginCommand } from '../use-cases/LoginCommand.js';
import { SessionManager } from '../../domain/services/SessionManager.js';
import { clearUserCache } from '../../../shared/hooks/useUserRole.js';

export class AuthService {
  constructor(apiClient) {
    this.sessionManager = new SessionManager(apiClient);
    this.loginCommand = new LoginCommand(this.sessionManager);
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  notifyObservers(event, data) {
    this.observers.forEach(observer => observer.update(event, data));
  }

  async login(email, password) {
    const result = await this.loginCommand.execute(email, password);
    
    if (result.success) {
      this.notifyObservers('LOGIN_SUCCESS', result.user);
      return { success: true, user: result.user, error: null };
    }
    
    this.notifyObservers('LOGIN_FAILED', result.error);
    return result;
  }

  async validateSession() {
    return await this.sessionManager.validateSession();
  }

  getCurrentUser() {
    return this.sessionManager.getCurrentUser();
  }

  async logout() {
    await this.sessionManager.logout();
    clearUserCache(); // Limpiar cache del hook useUserRole
    this.notifyObservers('LOGOUT_SUCCESS', null);
  }

  isAuthenticated() {
    return this.sessionManager.isAuthenticated();
  }
}