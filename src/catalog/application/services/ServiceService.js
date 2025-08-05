import { Service } from '../../domain/entities/Service.js';

/**
 * Service Application Service
 * Patrón: Command + Observer + Decorator (para precios)
 */

// Decorator pattern para cálculos de precios
class ServiceDecorator {
  constructor(service) {
    this.service = service;
  }

  getFinalPrice() {
    return this.service.getFinalPrice();
  }

  getName() {
    return this.service.name;
  }
}

class DiscountDecorator extends ServiceDecorator {
  constructor(service, additionalDiscount = 0) {
    super(service);
    this.additionalDiscount = additionalDiscount;
  }

  getFinalPrice() {
    const basePrice = super.getFinalPrice();
    return basePrice * (1 - this.additionalDiscount / 100);
  }

  getName() {
    return `${super.getName()} (Descuento especial)`;
  }
}

class SeasonalDecorator extends ServiceDecorator {
  constructor(service, seasonalMultiplier = 1.0) {
    super(service);
    this.seasonalMultiplier = seasonalMultiplier;
  }

  getFinalPrice() {
    return super.getFinalPrice() * this.seasonalMultiplier;
  }

  getName() {
    return `${super.getName()} (Temporada)`;
  }
}

class ServiceObserver {
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

class CreateServiceCommand {
  constructor(serviceData, apiService, observer) {
    this.serviceData = serviceData;
    this.apiService = apiService;
    this.observer = observer;
  }

  async execute() {
    try {
      const service = new Service(
        null,
        this.serviceData.name,
        this.serviceData.description,
        this.serviceData.price,
        this.serviceData.duration,
        this.serviceData.categoryId,
        this.serviceData.benefits,
        this.serviceData.contraindications,
        this.serviceData.treatmentFrequency,
        this.serviceData.treatmentIncludes,
        this.serviceData.isDiscountActive,
        this.serviceData.discountPercent,
        this.serviceData.discountedPrice || service.calculateDiscountedPrice()
      );

      if (!service.isValid()) {
        throw new Error('Datos del servicio inválidos');
      }

      const result = await this.apiService.create(service.toApiPayload());
      this.observer.notify('serviceCreated', result);
      return result;
    } catch (error) {
      this.observer.notify('serviceCreateFailed', error);
      throw error;
    }
  }
}

export class ServiceService {
  constructor(apiService) {
    this.apiService = apiService;
    this.observer = new ServiceObserver();
  }

  subscribe(observer) {
    this.observer.subscribe(observer);
  }

  unsubscribe(observer) {
    this.observer.unsubscribe(observer);
  }

  async getAllServices() {
    try {
      const response = await this.apiService.getAll();
      // Handle different response formats
      const data = Array.isArray(response) ? response : response.data || [];
      return data.map(item => Service.fromApiResponse(item));
    } catch (error) {
      this.observer.notify('serviceLoadFailed', error);
      // Return empty array instead of throwing to prevent app crash
      console.warn('Services endpoint not available, returning empty array');
      return [];
    }
  }

  async getServiceById(id) {
    try {
      const response = await this.apiService.getById(id);
      // Handle single item response
      const data = response.data || response;
      return Service.fromApiResponse(data);
    } catch (error) {
      this.observer.notify('serviceLoadFailed', error);
      throw error;
    }
  }

  async getServiceRawDataById(id) {
    try {
      const response = await this.apiService.getById(id);
      // Handle single item response and return raw data for editing
      const data = response.data || response;
      return data; // Return raw data without transformation
    } catch (error) {
      this.observer.notify('serviceLoadFailed', error);
      throw error;
    }
  }

  async createService(serviceData) {
    try {
      const response = await this.apiService.create(serviceData);
      const service = Service.fromApiResponse(response.data || response);
      this.observer.notify('serviceCreated', service);
      return service;
    } catch (error) {
      this.observer.notify('serviceCreateFailed', error);
      throw error;
    }
  }

  async updateService(serviceId, serviceData) {
    try {
      const response = await this.apiService.update(serviceId, serviceData);
      const service = Service.fromApiResponse(response.data || response);
      this.observer.notify('serviceUpdated', service);
      return service;
    } catch (error) {
      this.observer.notify('serviceUpdateFailed', error);
      throw error;
    }
  }

  async deleteService(serviceId) {
    try {
      await this.apiService.delete(serviceId);
      this.observer.notify('serviceDeleted', serviceId);
      return { success: true };
    } catch (error) {
      this.observer.notify('serviceDeleteFailed', error);
      throw error;
    }
  }

  // Decorator methods
  applyDiscount(service, discount) {
    return new DiscountDecorator(service, discount);
  }

  applySeasonalPricing(service, multiplier) {
    return new SeasonalDecorator(service, multiplier);
  }

  // Utility methods
  getServicesWithDiscount(services) {
    return services.filter(service => service.isDiscountActive);
  }

  getServicesByCategory(services, categoryId) {
    return services.filter(service => service.categoryId === categoryId);
  }
}