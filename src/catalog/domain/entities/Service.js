/**
 * Service Entity - Representa un servicio estético
 * Patrón: Entity (DDD)
 */
export class Service {
  constructor(
    id, 
    name, 
    description, 
    price, 
    duration, 
    categoryId, 
    benefits, 
    contraindications, 
    treatmentFrequency, 
    treatmentIncludes, 
    isDiscountActive = false, 
    discountPercent = 0, 
    discountedPrice = 0
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.duration = duration;
    this.categoryId = categoryId;
    this.benefits = benefits;
    this.contraindications = contraindications;
    this.treatmentFrequency = treatmentFrequency;
    this.treatmentIncludes = treatmentIncludes;
    this.isDiscountActive = isDiscountActive;
    this.discountPercent = discountPercent;
    this.discountedPrice = discountedPrice;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updatePricing(price, isDiscountActive, discountPercent, discountedPrice) {
    this.price = price;
    this.isDiscountActive = isDiscountActive;
    this.discountPercent = discountPercent;
    this.discountedPrice = discountedPrice;
    this.updatedAt = new Date();
  }

  getFinalPrice() {
    return this.isDiscountActive ? this.discountedPrice : this.price;
  }

  calculateDiscountedPrice() {
    if (this.isDiscountActive && this.discountPercent > 0) {
      return this.price * (1 - this.discountPercent / 100);
    }
    return this.price;
  }

  isValid() {
    return this.name && 
           this.description && this.description.length >= 10 &&
           this.price >= 0 && 
           this.duration && 
           this.categoryId && 
           this.benefits && this.benefits.length >= 10 &&
           this.treatmentIncludes && this.treatmentIncludes.length >= 10 &&
           this.discountPercent >= 0 && this.discountPercent <= 100;
  }

  static fromApiResponse(data) {
    return new Service(
      data.id,
      data.name,
      data.description,
      data.price,
      data.duration,
      data.category_id,
      data.benefits,
      data.contraindications,
      data.treatment_frequency,
      data.treatment_includes,
      data.is_discount_active,
      data.discount_percent,
      data.discounted_price
    );
  }

  toApiPayload() {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      duration: this.duration,
      category_id: this.categoryId,
      benefits: this.benefits,
      contraindications: this.contraindications,
      treatment_frequency: this.treatmentFrequency,
      treatment_includes: this.treatmentIncludes,
      is_discount_active: this.isDiscountActive,
      discount_percent: this.discountPercent,
      discounted_price: this.discountedPrice
    };
  }
}