/**
 * Employee Entity - Representa un empleado del sistema
 */
export class Employee {
  constructor({
    id,
    email,
    firstName,
    lastName,
    role,
    branchId,
    createdAt,
    updatedAt,
    isActive = true
  }) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.branchId = branchId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive;
  }

  /**
   * Obtiene el nombre completo del empleado
   */
  get fullName() {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`.trim();
    }
    return this.firstName || this.lastName || this.email || 'Sin nombre';
  }

  /**
   * Obtiene el rol traducido
   */
  getRoleDisplay(t) {
    const roleMap = {
      'administrator': t('roles.administrator', 'Administrador'),
      'receptionist': t('roles.receptionist', 'Recepcionista'),
      'esthetician': t('roles.esthetician', 'Especialista'),
      'user': t('roles.user', 'Usuario')
    };
    return roleMap[this.role] || this.role || 'Usuario';
  }

  /**
   * Verifica si el empleado tiene información completa
   */
  isComplete() {
    return !!(this.email && this.firstName && this.lastName && this.role);
  }

  /**
   * Verifica si es administrador
   */
  isAdministrator() {
    return this.role === 'administrator';
  }

  /**
   * Verifica si es recepcionista
   */
  isReceptionist() {
    return this.role === 'receptionist';
  }

  /**
   * Verifica si es especialista
   */
  isEsthetician() {
    return this.role === 'esthetician';
  }

  /**
   * Convierte la entidad a un objeto plano para envío a API
   */
  toApiFormat() {
    return {
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
      role: this.role,
      branch_id: this.branchId,
      password: this.password // Solo para creación
    };
  }

  /**
   * Crea una instancia de Employee desde datos de API
   */
  static fromApiResponse(data) {
    return new Employee({
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role || 'user',
      branchId: data.branch_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isActive: data.active !== false
    });
  }

  /**
   * Crea una instancia vacía para formularios
   */
  static empty() {
    return new Employee({
      email: '',
      firstName: '',
      lastName: '',
      role: 'receptionist',
      branchId: '',
      password: ''
    });
  }

  /**
   * Obtiene los roles disponibles
   */
  static getAvailableRoles() {
    return [
      { value: 'receptionist', label: 'Recepcionista' },
      { value: 'esthetician', label: 'Especialista' }
    ];
  }
}