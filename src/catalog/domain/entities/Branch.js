/**
 * Branch Entity - Representa una sucursal en el dominio
 * Patrón: Entity (DDD)
 */
export class Branch {
  constructor(id, name, address, phone, email, isActive = true) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.phone = phone;
    this.email = email;
    this.isActive = isActive;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Value Objects methods
  updateInfo(name, address, phone, email) {
    this.name = name;
    this.address = address;
    this.phone = phone;
    this.email = email;
    this.updatedAt = new Date();
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Validation methods
  isValid() {
    return this.name && 
           this.address && 
           this.phone && 
           this.email && 
           this.isValidEmail(this.email);
  }

  isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  // Factory method for creating from API data
  static fromApiResponse(data) {
    return new Branch(
      data.id,
      data.name,
      data.address,
      data.phone,
      data.email,
      data.is_active !== undefined ? data.is_active : true
    );
  }

  // Method for API serialization
  toApiPayload() {
    return {
      name: this.name,
      address: this.address,
      phone: this.phone,
      email: this.email
    };
  }
}