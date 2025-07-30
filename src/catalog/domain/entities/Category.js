/**
 * Category Entity - Representa una categoría de servicios
 * Patrón: Entity (DDD)
 */
export class Category {
  constructor(id, name, description, branchId, isActive = true) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.branchId = branchId;
    this.isActive = isActive;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateInfo(name, description) {
    this.name = name;
    this.description = description;
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

  isValid() {
    return this.name && 
           this.description && 
           this.branchId;
  }

  static fromApiResponse(data) {
    return new Category(
      data.id,
      data.name,
      data.description,
      data.branch_id || data.BranchId,
      data.active
    );
  }

  toApiPayload() {
    return {
      name: this.name,
      description: this.description,
      branch_id: this.branchId
    };
  }

  toUpdatePayload() {
    return {
      name: this.name,
      description: this.description
    };
  }
}