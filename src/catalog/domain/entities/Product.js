/**
 * Product Entity - Representa un producto
 * Patrón: Entity (DDD)
 */
export class Product {
  constructor(id, name, description, brand, stock, purchasePrice, salePrice, lowStockAlert, expirationDate, branchId, qrUuid = null) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.brand = brand;
    this.stock = stock;
    this.purchasePrice = purchasePrice;
    this.salePrice = salePrice;
    this.lowStockAlert = lowStockAlert;
    this.expirationDate = new Date(expirationDate);
    this.branchId = branchId;
    this.qr_uuid = qrUuid; // Campo QR UUID manejado por el backend
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateStock(newStock) {
    this.stock = newStock;
    this.updatedAt = new Date();
  }

  updatePrices(purchasePrice, salePrice) {
    this.purchasePrice = purchasePrice;
    this.salePrice = salePrice;
    this.updatedAt = new Date();
  }

  isLowStock() {
    return this.stock <= this.lowStockAlert;
  }

  isExpired() {
    return this.expirationDate < new Date();
  }

  isNearExpiration(daysThreshold = 30) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);
    return this.expirationDate <= threshold;
  }

  isValid() {
    return this.name && 
           this.brand && 
           this.stock >= 0 && 
           this.purchasePrice >= 0 && 
           this.salePrice >= 0 && 
           this.lowStockAlert >= 0 && 
           this.expirationDate >= new Date() && 
           this.branchId;
  }

  static fromApiResponse(data) {
    return new Product(
      data.id,
      data.name,
      data.description,
      data.brand,
      data.stock,
      data.purchase_price,
      data.sale_price,
      data.low_stock_alert,
      data.expiration_date,
      data.branch_id,
      data.qr_uuid // Mapear el QR UUID desde la respuesta del API
    );
  }

  toApiPayload() {
    return {
      name: this.name,
      description: this.description,
      brand: this.brand,
      stock: this.stock,
      purchase_price: this.purchasePrice,
      sale_price: this.salePrice,
      low_stock_alert: this.lowStockAlert,
      expiration_date: this.expirationDate.toISOString().split('T')[0],
      branch_id: this.branchId
    };
  }
}