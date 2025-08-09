import { API_CONFIG } from '../config/ApiConfig.js';
import { API_ENDPOINTS } from '../config/ApiEndpoints.js';

export class ApiRouter {
  static buildUrl(endpoint) {
    return `${API_CONFIG.API_BASE}${endpoint}`;
  }
  
  static get AUTH() {
    return {
      LOGIN: this.buildUrl(API_ENDPOINTS.AUTH.LOGIN),
      LOGOUT: this.buildUrl(API_ENDPOINTS.AUTH.LOGOUT)
    };
  }
  
  static get USERS() {
    return {
      ME: this.buildUrl(API_ENDPOINTS.USERS.ME)
    };
  }
  
  static get USER_PREFERENCES() {
    return {
      BASE: this.buildUrl(API_ENDPOINTS.USER_PREFERENCES.BASE)
    };
  }
  
  static get PRODUCTS() {
    return {
      BASE: this.buildUrl(API_ENDPOINTS.PRODUCTS.BASE),
      CATEGORIES: this.buildUrl(API_ENDPOINTS.PRODUCTS.CATEGORIES)
    };
  }
  
  static get SERVICES() {
    return {
      BASE: this.buildUrl(API_ENDPOINTS.SERVICES.BASE),
      BOOKINGS: this.buildUrl(API_ENDPOINTS.SERVICES.BOOKINGS)
    };
  }
}