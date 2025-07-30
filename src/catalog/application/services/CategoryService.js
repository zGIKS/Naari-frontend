import { Category } from '../../domain/entities/Category.js';

/**
 * Category Application Service
 * Patrón: Command + Observer + Facade
 */

class CategoryObserver {
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

class CreateCategoryCommand {
  constructor(categoryData, apiService, observer) {
    this.categoryData = categoryData;
    this.apiService = apiService;
    this.observer = observer;
  }

  async execute() {
    try {
      const category = new Category(
        null,
        this.categoryData.name,
        this.categoryData.description,
        this.categoryData.branchId
      );

      if (!category.isValid()) {
        throw new Error('Datos de categoría inválidos');
      }

      const result = await this.apiService.create(category.toApiPayload());
      this.observer.notify('categoryCreated', result);
      return result;
    } catch (error) {
      this.observer.notify('categoryCreateFailed', error);
      throw error;
    }
  }
}

export class CategoryService {
  constructor(apiService) {
    this.apiService = apiService;
    this.observer = new CategoryObserver();
  }

  subscribe(observer) {
    this.observer.subscribe(observer);
  }

  unsubscribe(observer) {
    this.observer.unsubscribe(observer);
  }

  async getAllCategories() {
    try {
      const response = await this.apiService.getAll();
      // Handle different response formats
      const data = Array.isArray(response) ? response : response.data || [];
      return data.map(item => Category.fromApiResponse(item));
    } catch (error) {
      this.observer.notify('categoryLoadFailed', error);
      // Return empty array instead of throwing to prevent app crash
      console.warn('Categories endpoint not available, returning empty array');
      return [];
    }
  }

  async getCategoriesByBranch(branchId) {
    try {
      const response = await this.apiService.getByBranch(branchId);
      // Handle different response formats
      const data = Array.isArray(response) ? response : response.data || [];
      return data.map(item => Category.fromApiResponse(item));
    } catch (error) {
      this.observer.notify('categoryLoadFailed', error);
      throw error;
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await this.apiService.create(categoryData);
      const category = Category.fromApiResponse(response.data || response);
      this.observer.notify('categoryCreated', category);
      return category;
    } catch (error) {
      this.observer.notify('categoryCreateFailed', error);
      throw error;
    }
  }
}