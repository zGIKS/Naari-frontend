/**
 * ApiEndpoints - Configuración centralizada de endpoints de la API
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify'
  },

  // User Management
  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password'
  },

  // User Preferences (alias for compatibility)
  USER_PREFERENCES: {
    BASE: '/user/preferences'
  },

    // Clients
  CLIENTS: {
    LIST: '/clients',
    CREATE: '/clients',
    GET: (id) => `/clients/${id}`,
    UPDATE: (id) => `/clients/${id}`,
    DELETE: (id) => `/clients/${id}`,
    SEARCH_DNI: (dni) => `/clients/search/${dni}`
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    GET: (id) => `/categories/${id}`,
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
    BY_BRANCH: (branchId) => `/categories/branch/${branchId}`,
    ACTIVATE: (id) => `/categories/${id}/activate`,
    DEACTIVATE: (id) => `/categories/${id}/deactivate`
  },

  // Services
  SERVICES: {
    BASE: '/services',
    LIST: '/services',
    CREATE: '/services',
    GET: (id) => `/services/${id}`,
    UPDATE: (id) => `/services/${id}`,
    DELETE: (id) => `/services/${id}`,
    BOOKINGS: '/services/bookings'
  },

  // Products
  PRODUCTS: {
    BASE: '/products',
    LIST: '/products',
    CREATE: '/products',
    GET: (id) => `/products/${id}`,
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    CATEGORIES: '/products/categories'
  },

  // Branches
  BRANCHES: {
    LIST: '/branches',
    CREATE: '/branches',
    GET: (id) => `/branches/${id}`,
    UPDATE: (id) => `/branches/${id}`,
    DELETE: (id) => `/branches/${id}`,
    ACTIVATE: (id) => `/branches/${id}/activate`,
    DEACTIVATE: (id) => `/branches/${id}/deactivate`
  },

  // Users
  USERS: {
    BASE: '/users',
    ME: '/users/me',
    ME_PERMISSIONS: '/users/me/permissions',
    SIGNUP: '/users/signup',
    UPDATE: (id) => `/users/${id}`,
    ACTIVATE: (id) => `/users/${id}/activate`,
    DEACTIVATE: (id) => `/users/${id}/deactivate`
  },

  // Appointments
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    GET: (id) => `/appointments/${id}`,
    UPDATE: (id) => `/appointments/${id}`,
    DELETE: (id) => `/appointments/${id}`
  },

  // Packages
  PACKAGES: {
    BASE: '/packages',
    ACTIVATE: (id) => `/packages/${id}/activate`,
    DEACTIVATE: (id) => `/packages/${id}/deactivate`,
    STOCK: (id) => `/packages/${id}/stock`,
    BY_ID: (id) => `/packages/${id}`
  }
};