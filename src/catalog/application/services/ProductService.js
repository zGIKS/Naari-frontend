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
      // Crear instancia de Product para validación
      const product = new Product(
        null,
        productData.name,
        productData.description,
        productData.brand,
        productData.stock,
        productData.purchasePrice,
        productData.salePrice,
        productData.lowStockAlert,
        productData.expirationDate,
        productData.branchId
      );

      // Validar usando la estrategia
      const validationErrors = this.validationStrategy.validate(product);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }
      
      const response = await this.apiService.create(product.toApiPayload());
      const createdProduct = Product.fromApiResponse(response.data || response);
      this.observer.notify('productCreated', createdProduct);
      
      // Notificar si está en stock bajo
      if (product.isLowStock()) {
        this.observer.notify('lowStockAlert', product);
      }
      
      return createdProduct;
    } catch (error) {
      this.observer.notify('productCreateFailed', error);
      throw error;
    }
  }

  async updateProduct(productId, productData) {
    try {
      // Crear instancia de Product para validación (sin branchId para update)
      const product = new Product(
        productId,
        productData.name,
        productData.description,
        productData.brand,
        productData.stock,
        productData.purchasePrice,
        productData.salePrice,
        productData.lowStockAlert,
        productData.expirationDate,
        null // branchId no se puede cambiar en update
      );

      // Validar usando la estrategia (pero sin validar branchId)
      if (!product.name || !product.brand || product.stock < 0 || product.purchasePrice < 0 || product.salePrice < 0) {
        throw new Error('Datos de producto inválidos');
      }

      // Crear payload para update (sin branch_id)
      const updatePayload = {
        name: product.name,
        description: product.description,
        brand: product.brand,
        stock: product.stock,
        purchase_price: product.purchasePrice,
        sale_price: product.salePrice,
        low_stock_alert: product.lowStockAlert,
        expiration_date: product.expirationDate.toISOString().split('T')[0]
      };
      
      const response = await this.apiService.update(productId, updatePayload);
      const updatedProduct = Product.fromApiResponse(response.data || response);
      this.observer.notify('productUpdated', updatedProduct);
      
      // Notificar si está en stock bajo
      if (updatedProduct.isLowStock()) {
        this.observer.notify('lowStockAlert', updatedProduct);
      }
      
      return updatedProduct;
    } catch (error) {
      this.observer.notify('productUpdateFailed', error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      await this.apiService.delete(productId);
      this.observer.notify('productDeleted', productId);
      return { success: true };
    } catch (error) {
      this.observer.notify('productDeleteFailed', error);
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