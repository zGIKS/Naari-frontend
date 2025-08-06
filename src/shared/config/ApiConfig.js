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
  
  USER_PREFERENCES: {
    BASE: '/user/preferences'
  },
  
  CATALOG: {
    BRANCHES: {
      LIST: '/catalog/branches',
      CREATE: '/catalog/branches',
      UPDATE: (id) => `/catalog/branches/${id}`,
      ACTIVATE: (id) => `/catalog/branches/${id}/activate`,
      DEACTIVATE: (id) => `/catalog/branches/${id}/deactivate`
    },
    CATEGORIES: {
      LIST: '/catalog/categories',
      CREATE: '/catalog/categories',
      UPDATE: (id) => `/catalog/categories/${id}`,
      ACTIVATE: (id) => `/catalog/categories/${id}/activate`,
      DEACTIVATE: (id) => `/catalog/categories/${id}/deactivate`,
      BY_BRANCH: (branchId) => `/catalog/categories/branch/${branchId}`
    },
    PRODUCTS: {
      LIST: '/catalog/products',
      CREATE: '/catalog/products',
      UPDATE: (id) => `/catalog/products/${id}`,
      DELETE: (id) => `/catalog/products/${id}`
    },
    SERVICES: {
      LIST: '/catalog/services',
      CREATE: '/catalog/services',
      UPDATE: (id) => `/catalog/services/${id}`,
      DELETE: (id) => `/catalog/services/${id}`,
      GET: (id) => `/catalog/services/${id}`
    }
  },

  PRODUCTS: {
    BASE: '/products',
    CATEGORIES: '/products/categories'
  },
  
  SERVICES: {
    BASE: '/services',
    BOOKINGS: '/services/bookings'
  },
  
  PACKAGES: {
    BASE: '/packages',
    ACTIVATE: (id) => `/packages/${id}/activate`,
    DEACTIVATE: (id) => `/packages/${id}/deactivate`,
    STOCK: (id) => `/packages/${id}/stock`,
    BY_ID: (id) => `/packages/${id}`
  }
};