/**
 * Package Entity - Representa un paquete de productos y servicios
 * Patrón: Entity (DDD)
 */
export class Package {
  constructor(
    id,
    name,
    description,
    type,
    products = [],
    services = [],
    totalPrice,
    stockQuantity,
    isActive = true,
    isAvailable = true,
    createdBy = null
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type; // 'product', 'service', 'mixed'
    this.products = products;
    this.services = services;
    this.totalPrice = totalPrice;
    this.stockQuantity = stockQuantity;
    this.isActive = isActive;
    this.isAvailable = isAvailable;
    this.createdBy = createdBy;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Métodos para calcular descuentos y totales
  calculateTotalDiscount() {
    const originalTotal = this.calculateOriginalTotal();
    return originalTotal - this.totalPrice;
  }

  calculateDiscountPercent() {
    const originalTotal = this.calculateOriginalTotal();
    if (originalTotal === 0) return 0;
    return ((originalTotal - this.totalPrice) / originalTotal) * 100;
  }

  calculateOriginalTotal() {
    const productTotal = this.products.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0
    );
    const serviceTotal = this.services.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0
    );
    return productTotal + serviceTotal;
  }

  // Métodos para gestión de productos y servicios
  addProduct(product) {
    const existingIndex = this.products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      this.products[existingIndex].quantity += product.quantity;
    } else {
      this.products.push(product);
    }
    this.updatedAt = new Date();
  }

  addService(service) {
    const existingIndex = this.services.findIndex(s => s.id === service.id);
    if (existingIndex >= 0) {
      this.services[existingIndex].quantity += service.quantity;
    } else {
      this.services.push(service);
    }
    this.updatedAt = new Date();
  }

  removeProduct(productId) {
    this.products = this.products.filter(p => p.id !== productId);
    this.updatedAt = new Date();
  }

  removeService(serviceId) {
    this.services = this.services.filter(s => s.id !== serviceId);
    this.updatedAt = new Date();
  }

  updateProductQuantity(productId, quantity) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.quantity = quantity;
      this.updatedAt = new Date();
    }
  }

  updateServiceQuantity(serviceId, quantity) {
    const service = this.services.find(s => s.id === serviceId);
    if (service) {
      service.quantity = quantity;
      this.updatedAt = new Date();
    }
  }

  // Métodos de estado
  activate() {
    if (this.stockQuantity > 0) {
      this.isActive = true;
      this.isAvailable = true;
    }
    this.updatedAt = new Date();
  }

  deactivate() {
    this.isActive = false;
    this.isAvailable = false;
    this.updatedAt = new Date();
  }

  updateStock(newStock) {
    this.stockQuantity = newStock;
    if (newStock === 0) {
      this.isAvailable = false;
    } else if (this.isActive) {
      this.isAvailable = true;
    }
    this.updatedAt = new Date();
  }

  // Validación
  isValid() {
    return this.name && 
           this.description && 
           this.type && 
           ['product', 'service', 'mixed'].includes(this.type) &&
           (this.products.length > 0 || this.services.length > 0) &&
           this.totalPrice >= 0 && 
           this.stockQuantity >= 0;
  }

  // Conversión desde respuesta API
  static fromApiResponse(data) {
    return new Package(
      data.id,
      data.name,
      data.description,
      data.type,
      data.products || [],
      data.services || [],
      data.total_price,
      data.stock_quantity,
      data.is_active,
      data.is_available,
      data.created_by
    );
  }

  // Conversión para payload API
  toApiPayload() {
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      products: this.products.map(p => ({
        id: p.id,
        quantity: p.quantity,
        package_price: p.packagePrice
      })),
      services: this.services.map(s => ({
        id: s.id,
        quantity: s.quantity,
        package_price: s.packagePrice
      })),
      total_price: this.totalPrice,
      stock_quantity: this.stockQuantity
    };
  }
}

/**
 * PackageItem - Representa un item dentro de un paquete
 */
export class PackageItem {
  constructor(id, name, originalPrice, packagePrice, quantity = 1) {
    this.id = id;
    this.name = name;
    this.originalPrice = originalPrice;
    this.packagePrice = packagePrice;
    this.quantity = quantity;
  }

  get itemDiscount() {
    return this.originalPrice - this.packagePrice;
  }

  get totalOriginal() {
    return this.originalPrice * this.quantity;
  }

  get totalPackage() {
    return this.packagePrice * this.quantity;
  }

  static fromProduct(product, packagePrice, quantity = 1) {
    return new PackageItem(
      product.id,
      product.name,
      product.salePrice,
      packagePrice,
      quantity
    );
  }

  static fromService(service, packagePrice, quantity = 1) {
    return new PackageItem(
      service.id,
      service.name,
      service.getFinalPrice(),
      packagePrice,
      quantity
    );
  }
}