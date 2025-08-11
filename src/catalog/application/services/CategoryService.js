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
      console.log('CategoryService - getAllCategories called with branchId:', branchId); // Debug log
      
      const response = await this.apiService.getAll(branchId);
      console.log('CategoryService - API response:', response); // Debug log
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response.categories) {
        // Handle response format: {branch: {...}, categories: [...], count: N}
        data = response.categories;
      } else if (response.data) {
        data = Array.isArray(response.data) ? response.data : response.data.categories || [];
      }
      
      console.log('CategoryService - Parsed data:', data); // Debug log
      
      const categories = data.map(item => Category.fromApiResponse(item));
      console.log('CategoryService - Mapped categories:', categories); // Debug log
      
      return categories;
    } catch (error) {
      console.error('CategoryService - Error in getAllCategories:', error); // Debug log
      this.observer.notify('categoryLoadFailed', error);
      // Return empty array instead of throwing to prevent app crash
      console.warn('Categories endpoint failed, returning empty array:', error.message);
      return [];
    }
  }

  async getAllCategoriesFromAllBranches(branches) {
    try {
      console.log('CategoryService - getAllCategoriesFromAllBranches called with branches:', branches); // Debug log
      
      const allCategories = [];
      
      for (const branch of branches) {
        try {
          console.log(`CategoryService - Loading categories for branch ${branch.id} (${branch.name})`); // Debug log
          const branchCategories = await this.getAllCategories(branch.id);
          console.log(`CategoryService - Loaded ${branchCategories.length} categories for branch ${branch.id}`); // Debug log
          allCategories.push(...branchCategories);
        } catch (error) {
          console.warn(`Failed to load categories for branch ${branch.id}:`, error);
        }
      }
      
      console.log(`CategoryService - Total categories loaded: ${allCategories.length}`); // Debug log
      console.log('CategoryService - All categories:', allCategories); // Debug log
      
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
    const command = new CreateCategoryCommand(categoryData, this.apiService, this.observer);
    const result = await command.execute();
    return Category.fromApiResponse(result.data || result);
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

  async toggleCategoryStatus(categoryId, activate) {
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