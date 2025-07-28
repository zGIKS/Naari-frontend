import { API_CONFIG, API_ENDPOINTS } from '../config/ApiConfig.js';

export class ApiRouter {
  static buildUrl(endpoint) {
    return `${API_CONFIG.API_BASE}${endpoint}`;
  }
  
  static get AUTH() {
    return {
      LOGIN: this.buildUrl(API_ENDPOINTS.AUTH.LOGIN)
    };
  }
  
  static get USERS() {
    return {
      ME: this.buildUrl(API_ENDPOINTS.USERS.ME)
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