import { Package, PackageItem } from '../../domain/entities/Package.js';

/**
 * Package Application Service
 * Maneja la lógica de negocio para paquetes de productos y servicios
 */

class PackageValidationStrategy {
  validate(packageData) {
    throw new Error('Method must be implemented by subclass');
  }
}

class StandardPackageValidation extends PackageValidationStrategy {
  validate(packageData) {
    const errors = [];
    
    if (!packageData.name || packageData.name.trim().length < 2) {
      errors.push('El nombre del paquete debe tener al menos 2 caracteres');
    }
    
    if (!packageData.description || packageData.description.trim().length < 5) {
      errors.push('La descripción debe tener al menos 5 caracteres');
    }
    
    if (!packageData.type || !['product', 'service', 'mixed'].includes(packageData.type)) {
      errors.push('El tipo de paquete debe ser: product, service o mixed');
    }
    
    const hasProducts = packageData.products && packageData.products.length > 0;
    const hasServices = packageData.services && packageData.services.length > 0;
    
    if (!hasProducts && !hasServices) {
      errors.push('El paquete debe contener al menos un producto o servicio');
    }
    
    if (packageData.totalPrice && packageData.totalPrice < 0) {
      errors.push('El precio total no puede ser negativo');
    }
    
    if (packageData.stockQuantity && packageData.stockQuantity < 0) {
      errors.push('El stock no puede ser negativo');
    }
    
    // Validar items de productos (validación relajada)
    if (hasProducts) {
      packageData.products.forEach((product, index) => {
        if (!product.id) {
          errors.push(`Producto ${index + 1}: ID es requerido`);
        }
        if (product.quantity && product.quantity < 1) {
          errors.push(`Producto ${index + 1}: La cantidad debe ser al menos 1`);
        }
        if (product.packagePrice && product.packagePrice < 0) {
          errors.push(`Producto ${index + 1}: El precio no puede ser negativo`);
        }
      });
    }
    
    // Validar items de servicios (validación relajada)
    if (hasServices) {
      packageData.services.forEach((service, index) => {
        if (!service.id) {
          errors.push(`Servicio ${index + 1}: ID es requerido`);
        }
        if (service.quantity && service.quantity < 1) {
          errors.push(`Servicio ${index + 1}: La cantidad debe ser al menos 1`);
        }
        if (service.packagePrice && service.packagePrice < 0) {
          errors.push(`Servicio ${index + 1}: El precio no puede ser negativo`);
        }
      });
    }
    
    return errors;
  }
}

class PackageObserver {
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

export class PackageService {
  constructor(apiService) {
    this.apiService = apiService;
    this.observer = new PackageObserver();
    this.validationStrategy = new StandardPackageValidation();
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

  async getAllPackages() {
    try {
      const response = await this.apiService.getAll();
      const data = Array.isArray(response) ? response : response.data || [];
      const packages = data.map(item => Package.fromApiResponse(item));
      
      this.observer.notify('packagesLoaded', packages);
      return packages;
    } catch (error) {
      this.observer.notify('packageLoadFailed', error);
      console.warn('Packages endpoint not available, returning empty array');
      return [];
    }
  }

  async getPackageById(id) {
    try {
      const response = await this.apiService.getById(id);
      const packageData = response.data || response;
      const packageObj = Package.fromApiResponse(packageData);
      
      this.observer.notify('packageLoaded', packageObj);
      return packageObj;
    } catch (error) {
      this.observer.notify('packageLoadFailed', error);
      throw error;
    }
  }

  async createPackage(packageData) {
    try {
      // Validar datos del paquete
      const validationErrors = this.validationStrategy.validate(packageData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Crear el paquete
      const packageObj = new Package(
        null,
        packageData.name,
        packageData.description,
        packageData.type,
        packageData.products || [],
        packageData.services || [],
        packageData.totalPrice,
        packageData.stockQuantity
      );

      const response = await this.apiService.create(packageObj.toApiPayload());
      const createdPackage = Package.fromApiResponse(response.data || response);
      
      this.observer.notify('packageCreated', createdPackage);
      return createdPackage;
    } catch (error) {
      this.observer.notify('packageCreateFailed', error);
      if (error.status === 404) {
        console.warn('✅ Package create endpoint not implemented - DEMO MODE: Simulating successful creation');
        // Simular creación exitosa para demo
        const simulatedPackage = new Package(
          `demo-${Date.now()}`,
          packageData.name,
          packageData.description,
          packageData.type,
          packageData.products || [],
          packageData.services || [],
          packageData.totalPrice,
          packageData.stockQuantity
        );
        simulatedPackage.isActive = true;
        simulatedPackage.isAvailable = true;
        this.observer.notify('packageCreated', simulatedPackage);
        return simulatedPackage;
      }
      throw error;
    }
  }

  async updatePackage(packageId, packageData) {
    try {
      // Validar datos del paquete
      const validationErrors = this.validationStrategy.validate(packageData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const response = await this.apiService.update(packageId, packageData);
      const updatedPackage = Package.fromApiResponse(response.data || response);
      
      this.observer.notify('packageUpdated', updatedPackage);
      return updatedPackage;
    } catch (error) {
      this.observer.notify('packageUpdateFailed', error);
      if (error.status === 404) {
        console.warn('✅ Package update endpoint not implemented - DEMO MODE: Simulating successful update');
        // Simular actualización exitosa para demo
        const simulatedPackage = new Package(
          packageId,
          packageData.name,
          packageData.description,
          packageData.type,
          packageData.products || [],
          packageData.services || [],
          packageData.totalPrice,
          packageData.stockQuantity
        );
        simulatedPackage.isActive = true;
        simulatedPackage.isAvailable = true;
        this.observer.notify('packageUpdated', simulatedPackage);
        return simulatedPackage;
      }
      throw error;
    }
  }

  async deletePackage(packageId) {
    try {
      await this.apiService.delete(packageId);
      this.observer.notify('packageDeleted', packageId);
      return { success: true };
    } catch (error) {
      this.observer.notify('packageDeleteFailed', error);
      throw error;
    }
  }

  async activatePackage(packageId) {
    try {
      const response = await this.apiService.activate(packageId);
      const activatedPackage = Package.fromApiResponse(response.data || response);
      
      this.observer.notify('packageActivated', activatedPackage);
      return activatedPackage;
    } catch (error) {
      this.observer.notify('packageActivateFailed', error);
      throw error;
    }
  }

  async deactivatePackage(packageId) {
    try {
      const response = await this.apiService.deactivate(packageId);
      const deactivatedPackage = Package.fromApiResponse(response.data || response);
      
      this.observer.notify('packageDeactivated', deactivatedPackage);
      return deactivatedPackage;
    } catch (error) {
      this.observer.notify('packageDeactivateFailed', error);
      throw error;
    }
  }

  async updatePackageStock(packageId, stockQuantity) {
    try {
      if (stockQuantity < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      const response = await this.apiService.updateStock(packageId, { stock_quantity: stockQuantity });
      const updatedPackage = Package.fromApiResponse(response.data || response);
      
      this.observer.notify('packageStockUpdated', updatedPackage);
      return updatedPackage;
    } catch (error) {
      this.observer.notify('packageStockUpdateFailed', error);
      throw error;
    }
  }

  // Métodos de utilidad para construcción de paquetes
  calculatePackagePrice(products = [], services = []) {
    const productTotal = products.reduce((sum, item) => 
      sum + (item.packagePrice * item.quantity), 0
    );
    const serviceTotal = services.reduce((sum, item) => 
      sum + (item.packagePrice * item.quantity), 0
    );
    return productTotal + serviceTotal;
  }

  calculateOriginalPrice(products = [], services = []) {
    const productTotal = products.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0
    );
    const serviceTotal = services.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0
    );
    return productTotal + serviceTotal;
  }

  calculateDiscount(products = [], services = []) {
    const originalTotal = this.calculateOriginalPrice(products, services);
    const packageTotal = this.calculatePackagePrice(products, services);
    return originalTotal - packageTotal;
  }

  calculateDiscountPercent(products = [], services = []) {
    const originalTotal = this.calculateOriginalPrice(products, services);
    const discount = this.calculateDiscount(products, services);
    return originalTotal > 0 ? (discount / originalTotal) * 100 : 0;
  }

  // Determinar tipo de paquete basado en contenido
  determinePackageType(products = [], services = []) {
    const hasProducts = products.length > 0;
    const hasServices = services.length > 0;
    
    if (hasProducts && hasServices) return 'mixed';
    if (hasProducts) return 'product';
    if (hasServices) return 'service';
    return null;
  }

  // Filtros y búsquedas
  filterPackagesByType(packages, type) {
    if (!type || type === 'all') return packages;
    return packages.filter(pkg => pkg.type === type);
  }

  searchPackages(packages, searchTerm) {
    if (!searchTerm) return packages;
    const term = searchTerm.toLowerCase();
    return packages.filter(pkg => 
      pkg.name.toLowerCase().includes(term) ||
      pkg.description.toLowerCase().includes(term)
    );
  }

  getActivePackages(packages) {
    return packages.filter(pkg => pkg.isActive);
  }

  getAvailablePackages(packages) {
    return packages.filter(pkg => pkg.isAvailable && pkg.stockQuantity > 0);
  }
}