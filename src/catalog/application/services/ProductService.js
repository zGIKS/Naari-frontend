import { Product } from '../../domain/entities/Product.js';

/**
 * Product Application Service
 * Patrón: Command + Observer + Strategy (para validaciones)
 */

// Strategy pattern para validaciones
class ProductValidationStrategy {
  validate(product) {
    throw new Error('Method must be implemented by subclass');
  }
}

class StandardProductValidation extends ProductValidationStrategy {
  validate(product) {
    const errors = [];
    
    if (!product.isValid()) {
      errors.push('Datos básicos del producto inválidos');
    }
    
    if (product.isExpired()) {
      errors.push('La fecha de expiración debe ser futura');
    }
    
    if (product.salePrice < product.purchasePrice) {
      errors.push('El precio de venta no puede ser menor al precio de compra');
    }
    
    return errors;
  }
}

class ProductObserver {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(event, data) {
    this.observers.forEach(observer => {
      if (observer[event]) {
        observer[event](data);
      }
    });
  }
}

class CreateProductCommand {
  constructor(productData, apiService, observer, validationStrategy) {
    this.productData = productData;
    this.apiService = apiService;
    this.observer = observer;
    this.validationStrategy = validationStrategy;
  }

  async execute() {
    try {
      const product = new Product(
        null,
        this.productData.name,
        this.productData.description,
        this.productData.brand,
        this.productData.stock,
        this.productData.purchasePrice,
        this.productData.salePrice,
        this.productData.lowStockAlert,
        this.productData.expirationDate,
        this.productData.branchId
      );

      const validationErrors = this.validationStrategy.validate(product);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const result = await this.apiService.create(product.toApiPayload());
      this.observer.notify('productCreated', result);
      
      // Notificar si está en stock bajo
      if (product.isLowStock()) {
        this.observer.notify('lowStockAlert', product);
      }
      
      return result;
    } catch (error) {
      this.observer.notify('productCreateFailed', error);
      throw error;
    }
  }
}

export class ProductService {
  constructor(apiService) {
    this.apiService = apiService;
    this.observer = new ProductObserver();
    this.validationStrategy = new StandardProductValidation();
  }

  subscribe(observer) {
    this.observer.subscribe(observer);
  }

  unsubscribe(observer) {
    this.observer.unsubscribe(observer);
  }

  setValidationStrategy(strategy) {
    this.validationStrategy = strategy;
  }

  async getAllProducts() {
    try {
      const response = await this.apiService.getAll();
      // Handle different response formats
      const data = Array.isArray(response) ? response : response.data || [];
      const products = data.map(item => Product.fromApiResponse(item));
      
      // Notificar productos con problemas
      products.forEach(product => {
        if (product.isLowStock()) {
          this.observer.notify('lowStockAlert', product);
        }
        if (product.isNearExpiration()) {
          this.observer.notify('nearExpirationAlert', product);
        }
      });
      
      return products;
    } catch (error) {
      this.observer.notify('productLoadFailed', error);
      // Return empty array instead of throwing to prevent app crash
      console.warn('Products endpoint not available, returning empty array');
      return [];
    }
  }

  async createProduct(productData) {
    try {
      // Validate if strategy is set
      if (this.validationStrategy && !this.validationStrategy.validate(productData)) {
        throw new Error('Product validation failed');
      }
      
      const response = await this.apiService.create(productData);
      const product = Product.fromApiResponse(response.data || response);
      this.observer.notify('productCreated', product);
      return product;
    } catch (error) {
      this.observer.notify('productCreateFailed', error);
      throw error;
    }
  }

  // Métodos de utilidad
  getProductsNearExpiration(products, days = 30) {
    return products.filter(product => product.isNearExpiration(days));
  }

  getLowStockProducts(products) {
    return products.filter(product => product.isLowStock());
  }
}