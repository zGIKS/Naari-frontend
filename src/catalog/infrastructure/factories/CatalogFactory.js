import { CatalogApiFactory } from '../api/CatalogApiRouter.js';
import { BranchService } from '../../application/services/BranchService.js';
import { CategoryService } from '../../application/services/CategoryService.js';
import { ProductService } from '../../application/services/ProductService.js';
import { ServiceService } from '../../application/services/ServiceService.js';

/**
 * Catalog Factory - Punto de entrada único para el bounded context
 * Patrón: Abstract Factory + Singleton
 */
class CatalogFactory {
  constructor() {
    if (CatalogFactory.instance) {
      return CatalogFactory.instance;
    }
    
    this.apiFactory = null;
    this.services = {};
    CatalogFactory.instance = this;
  }

  static getInstance() {
    if (!CatalogFactory.instance) {
      CatalogFactory.instance = new CatalogFactory();
    }
    return CatalogFactory.instance;
  }

  initialize(baseUrl, token) {
    this.apiFactory = new CatalogApiFactory(baseUrl, token);
    this.services = {}; // Reset services when token changes
  }

  getBranchService() {
    if (!this.services.branchService) {
      const apiService = this.apiFactory.createBranchService();
      this.services.branchService = new BranchService(apiService);
    }
    return this.services.branchService;
  }

  getCategoryService() {
    if (!this.services.categoryService) {
      const apiService = this.apiFactory.createCategoryService();
      this.services.categoryService = new CategoryService(apiService);
    }
    return this.services.categoryService;
  }

  getProductService() {
    if (!this.services.productService) {
      const apiService = this.apiFactory.createProductService();
      this.services.productService = new ProductService(apiService);
    }
    return this.services.productService;
  }

  getServiceService() {
    if (!this.services.serviceService) {
      const apiService = this.apiFactory.createServiceService();
      this.services.serviceService = new ServiceService(apiService);
    }
    return this.services.serviceService;
  }

  // Método para limpiar servicios (útil cuando cambia el token)
  clearServices() {
    this.services = {};
  }
}

export { CatalogFactory };