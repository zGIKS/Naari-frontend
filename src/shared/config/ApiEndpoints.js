/**
 * ApiEndpoints - Configuración centralizada de endpoints de la API
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    VERIFY: '/api/v1/auth/verify'
  },

  // User Management
  USER: {
    PROFILE: '/api/v1/user/profile',
    PREFERENCES: '/api/v1/user/preferences',
    UPDATE_PROFILE: '/api/v1/user/profile',
    CHANGE_PASSWORD: '/api/v1/user/change-password'
  },

  // Clients
  CLIENTS: {
    LIST: '/api/v1/clients',
    CREATE: '/api/v1/clients',
    GET: (id) => `/api/v1/clients/${id}`,
    UPDATE: (id) => `/api/v1/clients/${id}`,
    DELETE: (id) => `/api/v1/clients/${id}`
  },

  // Catalog
  CATALOG: {
    CATEGORIES: {
      LIST: '/api/v1/catalog/categories',
      CREATE: '/api/v1/catalog/categories',
      GET: (id) => `/api/v1/catalog/categories/${id}`,
      UPDATE: (id) => `/api/v1/catalog/categories/${id}`,
      DELETE: (id) => `/api/v1/catalog/categories/${id}`,
      BY_BRANCH: (branchId) => `/api/v1/catalog/categories/branch/${branchId}`
    },
    SERVICES: {
      LIST: '/api/v1/catalog/services',
      CREATE: '/api/v1/catalog/services',
      GET: (id) => `/api/v1/catalog/services/${id}`,
      UPDATE: (id) => `/api/v1/catalog/services/${id}`,
      DELETE: (id) => `/api/v1/catalog/services/${id}`
    },
    PRODUCTS: {
      LIST: '/api/v1/catalog/products',
      CREATE: '/api/v1/catalog/products',
      GET: (id) => `/api/v1/catalog/products/${id}`,
      UPDATE: (id) => `/api/v1/catalog/products/${id}`,
      DELETE: (id) => `/api/v1/catalog/products/${id}`
    },
    BRANCHES: {
      LIST: '/api/v1/catalog/branches',
      CREATE: '/api/v1/catalog/branches',
      GET: (id) => `/api/v1/catalog/branches/${id}`,
      UPDATE: (id) => `/api/v1/catalog/branches/${id}`,
      DELETE: (id) => `/api/v1/catalog/branches/${id}`,
      ACTIVATE: (id) => `/api/v1/catalog/branches/${id}/activate`,
      DEACTIVATE: (id) => `/api/v1/catalog/branches/${id}/deactivate`
    }
  },

  // Appointments
  APPOINTMENTS: {
    LIST: '/api/v1/appointments',
    CREATE: '/api/v1/appointments',
    GET: (id) => `/api/v1/appointments/${id}`,
    UPDATE: (id) => `/api/v1/appointments/${id}`,
    DELETE: (id) => `/api/v1/appointments/${id}`
  }
};