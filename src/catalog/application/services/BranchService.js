import { Branch } from '../../domain/entities/Branch.js';

/**
 * Branch Application Service
 * Patrón: Command + Observer + Facade
 */

// Patrón Observer para notificaciones
class BranchObserver {
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

// Patrón Command para operaciones
class CreateBranchCommand {
  constructor(branchData, apiService, observer) {
    this.branchData = branchData;
    this.apiService = apiService;
    this.observer = observer;
  }

  async execute() {
    try {
      // Crear entity para validación
      const branch = new Branch(
        null,
        this.branchData.name,
        this.branchData.address,
        this.branchData.phone,
        this.branchData.email
      );

      if (!branch.isValid()) {
        throw new Error('Datos de sucursal inválidos');
      }

      const result = await this.apiService.create(branch.toApiPayload());
      this.observer.notify('branchCreated', result);
      return result;
    } catch (error) {
      this.observer.notify('branchCreateFailed', error);
      throw error;
    }
  }
}

class UpdateBranchCommand {
  constructor(id, branchData, apiService, observer) {
    this.id = id;
    this.branchData = branchData;
    this.apiService = apiService;
    this.observer = observer;
  }

  async execute() {
    try {
      const branch = new Branch(
        this.id,
        this.branchData.name,
        this.branchData.address,
        this.branchData.phone,
        this.branchData.email
      );

      if (!branch.isValid()) {
        throw new Error('Datos de sucursal inválidos');
      }

      const result = await this.apiService.update(this.id, branch.toApiPayload());
      this.observer.notify('branchUpdated', result);
      return result;
    } catch (error) {
      this.observer.notify('branchUpdateFailed', error);
      throw error;
    }
  }
}

class ToggleBranchStatusCommand {
  constructor(id, activate, apiService, observer) {
    this.id = id;
    this.activate = activate;
    this.apiService = apiService;
    this.observer = observer;
  }

  async execute() {
    try {
      const result = this.activate 
        ? await this.apiService.activate(this.id)
        : await this.apiService.deactivate(this.id);
      
      this.observer.notify('branchStatusChanged', { id: this.id, active: this.activate });
      return result;
    } catch (error) {
      this.observer.notify('branchStatusChangeFailed', error);
      throw error;
    }
  }
}

// Facade principal
export class BranchService {
  constructor(apiService) {
    this.apiService = apiService;
    this.observer = new BranchObserver();
  }

  // Métodos de suscripción para Observer
  subscribe(observer) {
    this.observer.subscribe(observer);
  }

  unsubscribe(observer) {
    this.observer.unsubscribe(observer);
  }

  // Query methods
  async getAllBranches() {
    try {
      const response = await this.apiService.getAll();
      
      // Handle different response formats - API returns {branches: [...]}
      const data = Array.isArray(response) ? response : 
                   response.branches || response.data || [];
      
      const branches = data.map(item => Branch.fromApiResponse(item));
      
      return branches;
    } catch (error) {
      this.observer.notify('branchLoadFailed', error);
      throw error;
    }
  }

  // Command methods
  async createBranch(branchCreateData) {
    try {
      const response = await this.apiService.create(branchCreateData);
      
      // Handle different response formats for single branch
      const branchData = response.branch || response.data || response;
      const branch = Branch.fromApiResponse(branchData);
      this.observer.notify('branchCreated', branch);
      return branch;
    } catch (error) {
      this.observer.notify('branchCreateFailed', error);
      throw error;
    }
  }

  async updateBranch(id, branchUpdateData) {
    try {
      console.log('Updating branch:', id, 'with data:', branchUpdateData); // Debug log
      const response = await this.apiService.update(id, branchUpdateData);
      console.log('Update response:', response); // Debug log
      
      // Handle different response formats for single branch
      const updatedBranchData = response.branch || response.data || response;
      const branch = Branch.fromApiResponse(updatedBranchData);
      this.observer.notify('branchUpdated', branch);
      return branch;
    } catch (error) {
      console.error('Update error:', error); // Debug log
      this.observer.notify('branchUpdateFailed', error);
      throw error;
    }
  }

  async toggleBranchStatus(id, activate, currentBranch) {
    try {
      console.log(`${activate ? 'Activating' : 'Deactivating'} branch:`, id); // Debug log
      const response = activate 
        ? await this.apiService.activate(id)
        : await this.apiService.deactivate(id);
      console.log('Toggle status response:', response); // Debug log
      
      // Handle different response formats - API might return {branch: {...}} or direct object
      let branchData;
      if (response && typeof response === 'object' && Object.keys(response).length > 0) {
        branchData = response.branch || response.data || response;
      } else {
        // If no response body or empty, use current branch data and update status
        branchData = {
          id: currentBranch.id,
          name: currentBranch.name,
          address: currentBranch.address,
          phone: currentBranch.phone,
          email: currentBranch.email,
          is_active: activate
        };
      }
      
      console.log('Parsed branch data:', branchData); // Debug log
      
      const branch = Branch.fromApiResponse(branchData);
      this.observer.notify('branchStatusChanged', branch);
      return branch;
    } catch (error) {
      console.error('Toggle status error:', error); // Debug log
      this.observer.notify('branchStatusChangeFailed', error);
      throw error;
    }
  }
}