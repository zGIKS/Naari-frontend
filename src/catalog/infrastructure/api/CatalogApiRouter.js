// Catalog API Router - Implementa el patrón Factory Method para crear servicios
import { API_CONFIG } from '../../../shared/config/ApiConfig.js';

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
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Métodos abstractos para ser implementados por subclases
  async getAll() {
    throw new Error('Method must be implemented by subclass');
  }

  async create(data) {
    throw new Error('Method must be implemented by subclass');
  }
}

/**
 * Servicio para Branches
 */
class BranchApiService extends BaseApiService {
  async getAll() {
    return this.makeRequest('/branches');
  }

  async create(branchData) {
    return this.makeRequest('/branches', {
      method: 'POST',
      body: JSON.stringify(branchData)
    });
  }

  async update(id, branchData) {
    return this.makeRequest(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData)
    });
  }

  async activate(id) {
    return this.makeRequest(`/branches/${id}/activate`, {
      method: 'PATCH'
    });
  }

  async deactivate(id) {
    return this.makeRequest(`/branches/${id}/deactivate`, {
      method: 'PATCH'
    });
  }
}

/**
 * Servicio para Categories
 */
class CategoryApiService extends BaseApiService {
  async getAll() {
    return this.makeRequest('/categories');
  }

  async getByBranch(branchId) {
    return this.makeRequest(`/categories/branch/${branchId}`);
  }

  async create(categoryData) {
    return this.makeRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }
}

/**
 * Servicio para Products
 */
class ProductApiService extends BaseApiService {
  async getAll() {
    return this.makeRequest('/products');
  }

  async create(productData) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }
}

/**
 * Servicio para Services
 */
class ServiceApiService extends BaseApiService {
  async getAll() {
    return this.makeRequest('/services');
  }

  async getById(id) {
    return this.makeRequest(`/services/${id}`);
  }

  async create(serviceData) {
    return this.makeRequest('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }
}

export { CatalogApiFactory };