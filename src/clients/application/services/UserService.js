import { Employee } from '../../domain/entities/Employee.js';
import { JWTUtils } from '../../../shared/utils/jwtUtils.js';
import { ApiClient } from '../../../iam/infrastructure/api/ApiClient.js';
import { SessionManager } from '../../../iam/domain/services/SessionManager.js';
import { API_ENDPOINTS } from '../../../shared/config/ApiEndpoints.js';

/**
 * UserService - Servicio para gestión de usuarios/empleados
 */
export class UserService {
  constructor(apiClient, t = null) {
    this.apiClient = apiClient;
    this.t = t || ((key, fallback) => fallback);
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
          error: this.t('users.error.missing_required_data', 'Faltan datos requeridos: email, nombres, apellidos y rol son obligatorios')
        };
      }

      // Validar que no se intente crear un administrador desde el frontend
      if (employee.role === 'administrator') {
        return {
          success: false,
          error: this.t('users.error.cannot_create_admin', 'No se pueden crear administradores desde el frontend por seguridad')
        };
      }

      // Validar contraseña
      if (!employeeData.password || employeeData.password.length < 8) {
        return {
          success: false,
          error: this.t('users.error.password_min_8_chars', 'La contraseña debe tener al menos 8 caracteres')
        };
      }

      const response = await this.apiClient.postWithErrorHandling(API_ENDPOINTS.USERS.SIGNUP, {
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
        error: response.error || this.t('users.error.create_failed', 'Error al crear el empleado')
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
      const response = await this.apiClient.getWithErrorHandling(API_ENDPOINTS.USERS.ME);
      
      if (response.success) {
        // El API /users/me ahora incluye el campo 'role'
        return {
          success: true,
          data: Employee.fromApiResponse(response.data)
        };
      }
      
      return {
        success: false,
        error: response.error || this.t('users.error.profile_update_failed', 'Error al obtener perfil de usuario')
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

      const response = await this.apiClient.putWithErrorHandling(API_ENDPOINTS.USERS.ME, updateData);
      
      if (response.success) {
        return {
          success: true,
          data: Employee.fromApiResponse(response.data)
        };
      }
      
      return {
        success: false,
        error: response.error || this.t('users.error.profile_update_failed', 'Error al actualizar perfil')
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
      const response = await this.apiClient.getWithErrorHandling(`${API_ENDPOINTS.USERS.ME}/permissions`);
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        error: response.error || this.t('users.error.permissions_load_failed', 'Error al obtener permisos')
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
    let url = API_ENDPOINTS.USERS.BASE;
    if (searchQuery && searchQuery.trim()) {
      url += `?q=${encodeURIComponent(searchQuery.trim())}`;
    }
    
    console.log('UserService.getAllEmployees - Calling endpoint:', url);
    const response = await this.apiClient.getWithErrorHandling(url);
    
    if (response.success) {
      const employees = response.data.users || [];
      const enrichedEmployees = employees.map(emp => Employee.fromApiResponse(emp));
      
      console.log('UserService.getAllEmployees - Raw employees from backend:', employees);
      console.log('UserService.getAllEmployees - Processed employees:', enrichedEmployees);
      
      return {
        success: true,
        data: enrichedEmployees,
        total: response.data.total || employees.length,
        page: response.data.page || 0,
        limit: response.data.limit || employees.length
      };
    }
    
    return {
      success: false,
      error: response.error || this.t('users.error.employees_load_failed', 'Error al obtener empleados')
    };
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
          error: this.t('users.error.missing_required_data_simple', 'Faltan datos requeridos')
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

      // Lógica de roles mejorada:
      // - Para /users/me: No enviar role (el usuario no puede cambiar su propio rol)
      // - Para /users/{id}: Solo admin puede cambiar roles de otros usuarios
      
      if (!isCurrentUser && employeeData.role) {
        // Verificar si el usuario actual es administrador antes de permitir cambios de rol
        const token = sessionStorage.getItem('naari_token');
        let isAdmin = false;
        
        if (token) {
          try {
            const tokenInfo = JWTUtils.getTokenInfo(token);
            isAdmin = tokenInfo && tokenInfo.roles && tokenInfo.roles.includes('administrator');
          } catch (error) {
            console.debug('Could not extract admin info from token:', error);
          }
        }
        
        if (isAdmin) {
          updateData.role = employeeData.role;
          console.log('UserService.updateEmployee - Including role for admin update:', employeeData.role);
        } else {
          console.log('UserService.updateEmployee - User is not admin, cannot change roles of other users');
          return {
            success: false,
            error: this.t('users.error.no_admin_permissions', 'Solo los administradores pueden cambiar roles de otros usuarios.')
          };
        }
      } else if (isCurrentUser && employeeData.role) {
        console.log('UserService.updateEmployee - NOT including role for self-update (security)');
      }

      console.log('UserService.updateEmployee:', {
        employeeId,
        isCurrentUser,
        endpoint: isCurrentUser ? API_ENDPOINTS.USERS.ME : `${API_ENDPOINTS.USERS.BASE}/${employeeId}`,
        updateData,
        originalEmployee: originalEmployee ? { id: originalEmployee.id, role: originalEmployee.role } : null
      });

      let response;

      if (isCurrentUser) {
        // Usar endpoint /users/me para usuario actual
        console.log('Updating current user profile via /users/me', { employeeId, updateData });
        response = await this.apiClient.putWithErrorHandling(API_ENDPOINTS.USERS.ME, updateData);
      } else {
        // Usar endpoint /users/:id para otros usuarios (Admin only)
        console.log('Updating other user via /users/:id (Admin only)', { employeeId, updateData });
        response = await this.apiClient.putWithErrorHandling(`${API_ENDPOINTS.USERS.BASE}/${employeeId}`, updateData);
        
        // Si el endpoint devuelve 403, el usuario no tiene permisos de admin
        if (response.response?.status === 403) {
          return {
            success: false,
            error: this.t('users.error.no_admin_permissions_update', 'No tienes permisos de administrador para actualizar otros usuarios.')
          };
        }
        
        // Si el endpoint no existe, informar que no está disponible
        if (response.response?.status === 404) {
          return {
            success: false,
            error: this.t('users.error.endpoint_not_available', 'El endpoint de actualización de usuarios no está disponible.')
          };
        }
      }
      
      console.log('UserService.updateEmployee - Backend response:', response);
      console.log('UserService.updateEmployee - Response data:', response.data);
      
      if (response.success) {
        const updatedEmployee = Employee.fromApiResponse(response.data);
        console.log('UserService.updateEmployee - Created employee object:', updatedEmployee);
        
        // Si el backend no devolvió el rol, pero lo enviamos, preservarlo
        if (!response.data.role && updateData.role) {
          console.log('UserService.updateEmployee - Backend did not return role, preserving sent role:', updateData.role);
          updatedEmployee.role = updateData.role;
          
          // Guardar temporalmente en cache para usar en getAllEmployees
          const tempRoleKey = `temp_role_${employeeId}`;
          sessionStorage.setItem(tempRoleKey, updateData.role);
          
          // Limpiar después de 30 segundos
          setTimeout(() => {
            sessionStorage.removeItem(tempRoleKey);
          }, 30000);
        }
        
        return {
          success: true,
          data: updatedEmployee
        };
      }
      
      return {
        success: false,
        error: response.error || this.t('users.error.update_failed', 'Error al actualizar empleado')
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
      const response = await this.apiClient.patchWithErrorHandling(`${API_ENDPOINTS.USERS.BASE}/${employeeId}/activate`);
      
      if (response.success) {
        return {
          success: true,
          data: Employee.fromApiResponse(response.data.user || response.data),
          message: response.data.message || 'Usuario activado exitosamente'
        };
      }
      
      return {
        success: false,
        error: response.error || this.t('users.error.activate_failed', 'Error al activar empleado')
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
      const response = await this.apiClient.patchWithErrorHandling(`${API_ENDPOINTS.USERS.BASE}/${employeeId}/deactivate`);
      
      if (response.success) {
        return {
          success: true,
          data: Employee.fromApiResponse(response.data.user || response.data),
          message: response.data.message || 'Usuario desactivado exitosamente'
        };
      }
      
      return {
        success: false,
        error: response.error || this.t('users.error.deactivate_failed', 'Error al desactivar empleado')
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
      errors.push(this.t('users.error.email_required', 'Email es requerido'));
    } else if (!this._isValidEmail(employeeData.email)) {
      errors.push(this.t('users.error.email_format_invalid', 'Email no tiene formato válido'));
    }

    if (!employeeData.firstName || employeeData.firstName.trim().length === 0) {
      errors.push(this.t('users.error.name_required', 'Nombre es requerido'));
    }

    if (!employeeData.lastName || employeeData.lastName.trim().length === 0) {
      errors.push(this.t('users.error.lastname_required', 'Apellido es requerido'));
    }

    if (!employeeData.role || employeeData.role.trim().length === 0) {
      errors.push(this.t('users.error.role_required_validation', 'Rol es requerido'));
    } else if (employeeData.role === 'administrator') {
      errors.push(this.t('users.error.no_admin_role', 'No se puede asignar el rol de administrador.'));
    } else if (!['receptionist', 'esthetician'].includes(employeeData.role)) {
      errors.push(this.t('users.error.role_must_be_valid', 'Rol debe ser recepcionista o especialista.'));
    }

    if (!employeeData.password || employeeData.password.length < 8) {
      errors.push(this.t('users.error.password_8_chars', 'Contraseña debe tener al menos 8 caracteres'));
    } else if (!this._isValidPassword(employeeData.password)) {
      errors.push(this.t('users.error.password_complexity', 'Contraseña debe contener mayúscula, minúscula, número y símbolo'));
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
          return this.t('users.error.invalid_data_check', 'Datos inválidos. Verifica la información ingresada.');
        case 401:
          return this.t('users.error.unauthorized_login_again', 'No tienes autorización. Inicia sesión nuevamente.');
        case 403:
          return this.t('users.error.no_permissions', 'No tienes permisos para realizar esta acción.');
        case 409:
          return this.t('users.error.email_already_exists', 'Ya existe un usuario con este email.');
        case 422:
          return this.t('users.error.invalid_data_provided', 'Los datos proporcionados no son válidos.');
        case 500:
          return this.t('users.error.server_error', 'Error del servidor. Intenta nuevamente más tarde.');
        default:
          return this.t('users.error.connection_error', 'Error de conexión. Verifica tu conexión a internet.');
      }
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return this.t('users.error.connection_error', 'Error de conexión. Verifica tu conexión a internet.');
    }
    
    return this.t('users.error.unexpected_error', 'Error inesperado. Intenta nuevamente.');
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