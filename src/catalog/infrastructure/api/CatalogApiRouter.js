// Catalog API Router - Implementa el patrón Factory Method para crear servicios
import { API_ENDPOINTS } from '../../../shared/config/ApiEndpoints.js';

/**
 * Abstract Factory para servicios de Catalog
 * Patrón: Abstract Factory + Factory Method
 */
class CatalogApiFactory {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  // Factory Methods
  createBranchService() {
    return new BranchApiService(this.baseUrl, this.token);
  }

  createCategoryService() {
    return new CategoryApiService(this.baseUrl, this.token);
  }

  createProductService() {
    return new ProductApiService(this.baseUrl, this.token);
  }

  createServiceService() {
    return new ServiceApiService(this.baseUrl, this.token);
  }

  createPackageService() {
    return new PackageApiService(this.baseUrl, this.token);
  }
}

/**
 * Clase base para servicios API
 * Patrón: Template Method
 */
class BaseApiService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  // Template Method
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('CatalogApiRouter - Making request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!this.token,
      tokenPrefix: this.token ? this.token.substring(0, 20) + '...' : 'NO_TOKEN'
    }); // Debug log
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorBody = await response.json();
          if (errorBody.message) {
            errorMessage = errorBody.message;
          } else if (errorBody.error) {
            errorMessage = errorBody.error;
          }
        } catch {
          // If we can't parse the error response, use the default message
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.endpoint = endpoint;
        throw error;
      }

      // Manejar respuestas vacías (como 204 No Content para DELETE)
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      if (contentLength === '0' || response.status === 204 || 
          (!contentType || !contentType.includes('application/json'))) {
        return {}; // Retornar objeto vacío para respuestas sin contenido
      }
      
      try {
        return await response.json();
      } catch {
        // Si no se puede parsear como JSON, retornar objeto vacío
        return {};
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Network error
        const networkError = new Error('Network error: Unable to connect to server');
        networkError.status = 0;
        networkError.endpoint = endpoint;
        throw networkError;
      }
      throw error;
    }
  }

  // Métodos abstractos para ser implementados por subclases
  async getAll() {
    throw new Error('Method must be implemented by subclass');
  }

  async create() {
    throw new Error('Method must be implemented by subclass');
  }
}

/**
 * Servicio para Branches
 */
class BranchApiService extends BaseApiService {
  async getAll() {
    return this.makeRequest(API_ENDPOINTS.BRANCHES.LIST);
  }

  async create(branchData) {
    return this.makeRequest(API_ENDPOINTS.BRANCHES.CREATE, {
      method: 'POST',
      body: JSON.stringify(branchData)
    });
  }

  async update(id, branchData) {
    return this.makeRequest(API_ENDPOINTS.BRANCHES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(branchData)
    });
  }

  async activate(id) {
    return this.makeRequest(API_ENDPOINTS.BRANCHES.ACTIVATE(id), {
      method: 'PATCH'
    });
  }

  async deactivate(id) {
    return this.makeRequest(API_ENDPOINTS.BRANCHES.DEACTIVATE(id), {
      method: 'PATCH'
    });
  }
}

/**
 * Servicio para Categories
 */
class CategoryApiService extends BaseApiService {
  async getAll(branchId) {
    // Si se proporciona branchId, usar el endpoint específico por sucursal
    if (branchId) {
      return this.makeRequest(API_ENDPOINTS.CATEGORIES.BY_BRANCH(branchId));
    }
    // Si no se proporciona branchId, usar el endpoint general que lista todas las categorías
    return this.makeRequest(API_ENDPOINTS.CATEGORIES.LIST);
  }

  async getByBranch(branchId) {
    return this.makeRequest(API_ENDPOINTS.CATEGORIES.BY_BRANCH(branchId));
  }

  async create(categoryData) {
    return this.makeRequest(API_ENDPOINTS.CATEGORIES.CREATE, {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async update(id, categoryData) {
    return this.makeRequest(API_ENDPOINTS.CATEGORIES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async activate(id) {
    return this.makeRequest(API_ENDPOINTS.CATEGORIES.ACTIVATE(id), {
      method: 'PATCH'
    });
  }

  async deactivate(id) {
    return this.makeRequest(API_ENDPOINTS.CATEGORIES.DEACTIVATE(id), {
      method: 'PATCH'
    });
  }
}

/**
 * Servicio para Products
 */
class ProductApiService extends BaseApiService {
  async getAll() {
    return this.makeRequest(API_ENDPOINTS.PRODUCTS.LIST);
  }

  async create(productData) {
    return this.makeRequest(API_ENDPOINTS.PRODUCTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async update(id, productData) {
    return this.makeRequest(API_ENDPOINTS.PRODUCTS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async delete(id) {
    return this.makeRequest(API_ENDPOINTS.PRODUCTS.DELETE(id), {
      method: 'DELETE'
    });
  }
}

/**
 * Servicio para Services
 */
class ServiceApiService extends BaseApiService {
  async getAll() {
    return this.makeRequest(API_ENDPOINTS.SERVICES.LIST);
  }

  async getById(id) {
    return this.makeRequest(API_ENDPOINTS.SERVICES.GET(id));
  }

  async create(serviceData) {
    return this.makeRequest(API_ENDPOINTS.SERVICES.CREATE, {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }

  async update(id, serviceData) {
    return this.makeRequest(API_ENDPOINTS.SERVICES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(serviceData)
    });
  }

  async delete(id) {
    return this.makeRequest(API_ENDPOINTS.SERVICES.DELETE(id), {
      method: 'DELETE'
    });
  }
}

/**
 * Servicio para Packages
 */
class PackageApiService extends BaseApiService {
  async getAll() {
    return this.makeRequest(API_ENDPOINTS.PACKAGES.BASE);
  }

  async getById(id) {
    return this.makeRequest(`${API_ENDPOINTS.PACKAGES.BASE}?id=${encodeURIComponent(id)}`);
  }

  async create(packageData) {
    return this.makeRequest(API_ENDPOINTS.PACKAGES.BASE, {
      method: 'POST',
      body: JSON.stringify(packageData)
    });
  }

  async update(id, packageData) {
    return this.makeRequest(API_ENDPOINTS.PACKAGES.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(packageData)
    });
  }

  async delete(id) {
    return this.makeRequest(API_ENDPOINTS.PACKAGES.BY_ID(id), {
      method: 'DELETE'
    });
  }

  async activate(id) {
    return this.makeRequest(API_ENDPOINTS.PACKAGES.ACTIVATE(id), {
      method: 'PUT'
    });
  }

  async deactivate(id) {
    return this.makeRequest(API_ENDPOINTS.PACKAGES.DEACTIVATE(id), {
      method: 'PATCH'
    });
  }

  async updateStock(id, stockData) {
    return this.makeRequest(API_ENDPOINTS.PACKAGES.STOCK(id), {
      method: 'PATCH',
      body: JSON.stringify(stockData)
    });
  }
}

export { CatalogApiFactory };