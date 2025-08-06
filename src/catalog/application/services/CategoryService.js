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

  async getAllCategories(branchId = null) {
    try {
      const response = await this.apiService.getAll(branchId);
      // Handle different response formats
      const data = Array.isArray(response) ? response : response.data || [];
      return data.map(item => Category.fromApiResponse(item));
    } catch (error) {
      this.observer.notify('categoryLoadFailed', error);
      // Return empty array instead of throwing to prevent app crash
      console.warn('Categories endpoint failed, returning empty array:', error.message);
      return [];
    }
  }

  async getAllCategoriesFromAllBranches(branches) {
    try {
      const allCategories = [];
      
      for (const branch of branches) {
        try {
          const branchCategories = await this.getAllCategories(branch.id);
          allCategories.push(...branchCategories);
        } catch (error) {
          console.warn(`Failed to load categories for branch ${branch.id}:`, error);
        }
      }
      
      return allCategories;
    } catch (error) {
      this.observer.notify('categoryLoadFailed', error);
      console.warn('Failed to load categories from all branches:', error);
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
      const command = new CreateCategoryCommand(categoryData, this.apiService, this.observer);
      const result = await command.execute();
      return Category.fromApiResponse(result.data || result);
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(categoryId, categoryData) {
    try {
      const category = new Category(
        categoryId,
        categoryData.name,
        categoryData.description,
        null // branchId is not needed for update
      );

      if (!category.name || !category.description) {
        throw new Error('Datos de categoría inválidos');
      }

      const result = await this.apiService.update(categoryId, category.toUpdatePayload());
      const updatedCategory = Category.fromApiResponse(result.data || result);
      this.observer.notify('categoryUpdated', updatedCategory);
      return updatedCategory;
    } catch (error) {
      this.observer.notify('categoryUpdateFailed', error);
      throw error;
    }
  }

  async toggleCategoryStatus(categoryId, activate, category) {
    try {
      let result;
      if (activate) {
        result = await this.apiService.activate(categoryId);
      } else {
        result = await this.apiService.deactivate(categoryId);
      }
      const updatedCategory = Category.fromApiResponse(result.data || result);
      this.observer.notify('categoryStatusChanged', updatedCategory);
      return updatedCategory;
    } catch (error) {
      this.observer.notify('categoryStatusChangeFailed', error);
      throw error;
    }
  }
}