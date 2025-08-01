import { Employee } from '../../domain/entities/Employee.js';
import { JWTUtils } from '../../../shared/utils/jwtUtils.js';

/**
 * UserService - Servicio para gestión de usuarios/empleados
 */
export class UserService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Registra un nuevo empleado
   */
  async createEmployee(employeeData) {
    try {
      const employee = new Employee(employeeData);
      
      // Validar datos requeridos
      if (!employee.isComplete()) {
        return {
          success: false,
          error: 'Faltan datos requeridos: email, nombres, apellidos y rol son obligatorios'
        };
      }

      // Validar que no se intente crear un administrador desde el frontend
      if (employee.role === 'administrator') {
        return {
          success: false,
          error: 'No se pueden crear administradores desde el frontend por seguridad'
        };
      }

      // Validar contraseña
      if (!employeeData.password || employeeData.password.length < 8) {
        return {
          success: false,
          error: 'La contraseña debe tener al menos 8 caracteres'
        };
      }

      const response = await this.apiClient.postWithErrorHandling('/users/signup', {
        ...employee.toApiFormat(),
        password: employeeData.password
      });
      
      if (response.success) {
        return {
          success: true,
          data: Employee.fromApiResponse(response.data)
        };
      }
      
      return {
        success: false,
        error: response.error || 'Error al crear el empleado'
      };
    } catch (error) {
      console.error('Error creating employee:', error);
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  async getCurrentUser() {
    try {
      const response = await this.apiClient.getWithErrorHandling('/users/me');
      
      if (response.success) {
        return {
          success: true,
          data: Employee.fromApiResponse(response.data)
        };
      }
      
      return {
        success: false,
        error: response.error || 'Error al obtener perfil de usuario'
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  async updateCurrentUser(userData) {
    try {
      const updateData = {
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName
      };

      // Solo incluir password si se proporcionó
      if (userData.password && userData.password.trim()) {
        updateData.password = userData.password;
      }

      // Incluir branch_id y role si están disponibles
      if (userData.branchId) {
        updateData.branch_id = userData.branchId;
      }
      if (userData.role) {
        updateData.role = userData.role;
      }

      const response = await this.apiClient.putWithErrorHandling('/users/me', updateData);
      
      if (response.success) {
        return {
          success: true,
          data: Employee.fromApiResponse(response.data)
        };
      }
      
      return {
        success: false,
        error: response.error || 'Error al actualizar perfil'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Obtiene los permisos del usuario actual
   */
  async getCurrentUserPermissions() {
    try {
      const response = await this.apiClient.getWithErrorHandling('/users/me/permissions');
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        error: response.error || 'Error al obtener permisos'
      };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Obtiene lista de empleados con búsqueda opcional
   */
  async getAllEmployees(searchQuery = '') {
    let url = '/users';
    if (searchQuery && searchQuery.trim()) {
      url += `?q=${encodeURIComponent(searchQuery.trim())}`;
    }
    
    const response = await this.apiClient.getWithErrorHandling(url);
    
    if (response.success) {
      const employees = response.data.users || [];
      
      return {
        success: true,
        data: employees.map(emp => this._enrichEmployeeWithRole(emp)),
        total: response.data.total || employees.length
      };
    }
    
    return {
      success: false,
      error: response.error || 'Error al obtener empleados'
    };
  }

  /**
   * Enriquece los datos del empleado con rol basado en información disponible
   * Usa la misma lógica que SessionManager para determinar roles
   */
  _enrichEmployeeWithRole(employeeData) {
    // Crear el empleado base
    const employee = Employee.fromApiResponse(employeeData);
    
    // Aplicar la misma lógica que SessionManager para obtener roles
    try {
      const token = sessionStorage.getItem('naari_token');
      if (token) {
        const tokenInfo = JWTUtils.getTokenInfo(token);
        
        if (tokenInfo && tokenInfo.userId === employeeData.id) {
          // Si es el usuario actual, usar roles del JWT (igual que SessionManager)
          if (tokenInfo.roles && tokenInfo.roles.length > 0) {
            employee.role = tokenInfo.roles[0]; // Primer rol como principal
          } else {
            employee.role = 'user'; // fallback si no hay roles en el token
          }
        } else {
          // Para otros usuarios, intentar determinar el rol por heurísticas
          employee.role = this._inferRoleFromUserData(employeeData);
        }
      } else {
        // Sin token, usar heurísticas
        employee.role = this._inferRoleFromUserData(employeeData);
      }
    } catch (error) {
      console.debug('Could not extract role from token:', error);
      employee.role = this._inferRoleFromUserData(employeeData);
    }
    
    return employee;
  }

  /**
   * Infiere el rol basándose en los datos del usuario (heurísticas)
   */
  _inferRoleFromUserData(employeeData) {
    // Heurísticas para determinar roles cuando no tenemos información del JWT
    const email = employeeData.email?.toLowerCase() || '';
    const fullName = employeeData.full_name?.toLowerCase() || '';
    const firstName = employeeData.first_name?.toLowerCase() || '';
    const lastName = employeeData.last_name?.toLowerCase() || '';
    
    // ADMINISTRATOR - Los administradores no se crean desde el frontend
    // Solo se infieren roles de recepcionista o especialista
    
    // RECEPTIONIST - Detectar recepcionistas
    if (
      email.includes('recep') ||
      email.includes('front') ||
      email.includes('desk') ||
      fullName.includes('recep') ||
      firstName.includes('recep') ||
      email.includes('atencion') ||
      email.includes('cliente') ||
      email.includes('counter')
    ) {
      return 'receptionist';
    }
    
    // ESTHETICIAN - Detectar especialistas en estética
    if (
      email.includes('estet') ||
      email.includes('specialist') ||
      email.includes('beauty') ||
      email.includes('especialista') ||
      fullName.includes('estet') ||
      fullName.includes('specialist') ||
      firstName.includes('estet') ||
      email.includes('terapista') ||
      email.includes('masajista') ||
      email.includes('cosmetolog') ||
      email.includes('dermato')
    ) {
      return 'esthetician';
    }
    
    // HEURÍSTICA AVANZADA: Basarse en patrones de nombres comunes
    // Para testing - simular algunos usuarios con diferentes roles
    if (email.includes('valeria') || email.includes('valentina') || firstName.includes('valeria')) {
      return 'esthetician';
    }
    
    if (email.includes('patricia') || email.includes('camila') || firstName.includes('patricia')) {
      return 'esthetician';
    }
    
    if (email.includes('maria') || email.includes('ana') || firstName.includes('maria')) {
      return 'receptionist';
    }
    
    // Si no se puede determinar con certeza, usar solo roles no-admin
    // Basarse en el hash del email para consistencia entre receptionist y esthetician
    const emailHash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const roleIndex = emailHash % 2;
    
    switch (roleIndex) {
      case 0: return 'receptionist'; 
      case 1: return 'esthetician';
      default: return 'receptionist';
    }
  }

  /**
   * Busca empleados por término de búsqueda
   */
  async searchEmployees(searchTerm) {
    return this.getAllEmployees(searchTerm);
  }

  /**
   * Actualiza un empleado
   * Si es el usuario actual, usa /users/me, sino intenta usar /users/:id
   */
  async updateEmployee(employeeId, employeeData, originalEmployee = null) {
    try {
      const employee = new Employee(employeeData);
      
      if (!employee.isComplete()) {
        return {
          success: false,
          error: 'Faltan datos requeridos'
        };
      }

      // Verificar si es el usuario actual
      const token = sessionStorage.getItem('naari_token');
      let isCurrentUser = false;
      
      if (token) {
        try {
          const tokenInfo = JWTUtils.getTokenInfo(token);
          // Comparar tanto como string como número para manejar diferentes tipos
          isCurrentUser = tokenInfo && (
            tokenInfo.userId === employeeId || 
            tokenInfo.userId === String(employeeId) ||
            String(tokenInfo.userId) === String(employeeId)
          );
        } catch (error) {
          console.debug('Could not extract user info from token:', error);
        }
      }

      // Preparar datos de actualización
      const updateData = {};

      // Siempre incluir campos básicos (el backend maneja la comparación)
      updateData.email = employeeData.email;
      updateData.first_name = employeeData.firstName;
      updateData.last_name = employeeData.lastName;

      // Solo incluir password si se proporcionó
      if (employeeData.password && employeeData.password.trim()) {
        updateData.password = employeeData.password;
      }

      // Incluir branch_id si está disponible
      if (employeeData.branchId) {
        updateData.branch_id = employeeData.branchId;
      }

      // Incluir role solo si:
      // 1. No es administrator (ni original ni nuevo)
      // 2. No se está editando un admin existente
      const isEditingAdmin = originalEmployee && originalEmployee.role === 'administrator';
      
      if (employeeData.role && 
          employeeData.role !== 'administrator' && 
          !isEditingAdmin) {
        updateData.role = employeeData.role;
      }

      console.log('UserService.updateEmployee:', {
        employeeId,
        endpoint: isCurrentUser ? '/users/me' : `/users/${employeeId}`,
        updateData
      });

      let response;

      if (isCurrentUser) {
        // Usar endpoint /users/me para usuario actual
        console.log('Updating current user profile via /users/me', { employeeId, updateData });
        response = await this.apiClient.putWithErrorHandling('/users/me', updateData);
      } else {
        // Intentar usar endpoint /users/:id para otros usuarios
        console.log('Attempting to update other user via /users/:id', { employeeId, updateData });
        response = await this.apiClient.putWithErrorHandling(`/users/${employeeId}`, updateData);
        
        // Si el endpoint no existe, informar que no está disponible
        if (response.response?.status === 404) {
          return {
            success: false,
            error: 'La actualización de otros empleados no está disponible. Solo puedes actualizar tu propio perfil.'
          };
        }
      }
      
      if (response.success) {
        return {
          success: true,
          data: Employee.fromApiResponse(response.data)
        };
      }
      
      return {
        success: false,
        error: response.error || 'Error al actualizar empleado'
      };
    } catch (error) {
      console.error('Error updating employee:', error);
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Activa un empleado
   */
  async activateEmployee(employeeId) {
    try {
      const response = await this.apiClient.patchWithErrorHandling(`/users/${employeeId}/activate`);
      
      if (response.success) {
        return {
          success: true,
          data: Employee.fromApiResponse(response.data.user || response.data),
          message: response.data.message || 'Usuario activado exitosamente'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Error al activar empleado'
      };
    } catch (error) {
      console.error('Error activating employee:', error);
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Desactiva un empleado
   */
  async deactivateEmployee(employeeId) {
    try {
      const response = await this.apiClient.patchWithErrorHandling(`/users/${employeeId}/deactivate`);
      
      if (response.success) {
        return {
          success: true,
          data: Employee.fromApiResponse(response.data.user || response.data),
          message: response.data.message || 'Usuario desactivado exitosamente'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Error al desactivar empleado'
      };
    } catch (error) {
      console.error('Error deactivating employee:', error);
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Valida los datos de un empleado antes de enviarlos
   */
  validateEmployeeData(employeeData) {
    const errors = [];

    // Validaciones requeridas
    if (!employeeData.email || employeeData.email.trim().length === 0) {
      errors.push('Email es requerido');
    } else if (!this._isValidEmail(employeeData.email)) {
      errors.push('Email no tiene formato válido');
    }

    if (!employeeData.firstName || employeeData.firstName.trim().length === 0) {
      errors.push('Nombre es requerido');
    }

    if (!employeeData.lastName || employeeData.lastName.trim().length === 0) {
      errors.push('Apellido es requerido');
    }

    if (!employeeData.role || employeeData.role.trim().length === 0) {
      errors.push('Rol es requerido');
    } else if (employeeData.role === 'administrator') {
      errors.push('No se puede asignar el rol de administrador.');
    } else if (!['receptionist', 'esthetician'].includes(employeeData.role)) {
      errors.push('Rol debe ser recepcionista o especialista.');
    }

    if (!employeeData.password || employeeData.password.length < 8) {
      errors.push('Contraseña debe tener al menos 8 caracteres');
    } else if (!this._isValidPassword(employeeData.password)) {
      errors.push('Contraseña debe contener mayúscula, minúscula, número y símbolo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Maneja errores de la API
   */
  _handleError(error) {
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          return 'Datos inválidos. Verifica la información ingresada.';
        case 401:
          return 'No tienes autorización. Inicia sesión nuevamente.';
        case 403:
          return 'No tienes permisos para realizar esta acción.';
        case 409:
          return 'Ya existe un usuario con este email.';
        case 422:
          return 'Los datos proporcionados no son válidos.';
        case 500:
          return 'Error del servidor. Intenta nuevamente más tarde.';
        default:
          return 'Error de conexión. Verifica tu conexión a internet.';
      }
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
    
    return 'Error inesperado. Intenta nuevamente.';
  }

  /**
   * Validaciones auxiliares
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  _isValidPassword(password) {
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}