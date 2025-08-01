export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  API_VERSION: 'v1',
  
  get API_BASE() {
    return `${this.BASE_URL}/api/${this.API_VERSION}`;
  }
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout'
  },
  
  USERS: {
    ME: '/users/me',
    BASE: '/users',
    SIGNUP: '/users/signup'
  },
  
  PRODUCTS: {
    BASE: '/products',
    CATEGORIES: '/products/categories'
  },
  
  SERVICES: {
    BASE: '/services',
    BOOKINGS: '/services/bookings'
  }
};