import { Client } from '../../domain/entities/Client.js';

/**
 * ClientService - Servicio para gestión de clientes
 */
export class ClientService {
  constructor(apiClient, t = null) {
    this.apiClient = apiClient;
    this.t = t || ((key, fallback) => fallback);
  }

  /**
   * Obtiene la lista de todos los clientes
   */
  async getClients() {
    try {
      const response = await this.apiClient.getWithErrorHandling('/clients');
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.map(clientData => Client.fromApiResponse(clientData))
        };
      }
      
      return {
        success: false,
        error: this.t('clients.error.get_clients_failed', 'Error al obtener la lista de clientes')
      };
    } catch (error) {
      console.error('Error getting clients:', error);
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Registra un nuevo cliente
   */
  async createClient(clientData) {
    try {
      const client = new Client(clientData);
      
      // Validar datos requeridos
      if (!client.isComplete()) {
        return {
          success: false,
          error: this.t('clients.error.missing_required_data', 'Faltan datos requeridos: DNI, nombres, apellidos y email son obligatorios')
        };
      }

      const response = await this.apiClient.postWithErrorHandling('/clients', client.toApiFormat());
      
      if (response.success) {
        return {
          success: true,
          data: Client.fromApiResponse(response.data)
        };
      }
      
      return {
        success: false,
        error: response.error || this.t('clients.error.create_failed', 'Error al crear el cliente')
      };
    } catch (error) {
      console.error('Error creating client:', error);
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Busca clientes por término de búsqueda
   */
  async searchClients(searchTerm) {
    try {
      // Por ahora obtenemos todos y filtramos localmente
      // En el futuro se puede implementar search en el backend
      const response = await this.getClients();
      
      if (!response.success) {
        return response;
      }

      const filteredClients = response.data.filter(client => {
        const term = searchTerm.toLowerCase();
        return (
          client.fullName.toLowerCase().includes(term) ||
          client.dni.toLowerCase().includes(term) ||
          client.email.toLowerCase().includes(term) ||
          (client.phone && client.phone.toLowerCase().includes(term))
        );
      });

      return {
        success: true,
        data: filteredClients
      };
    } catch (error) {
      console.error('Error searching clients:', error);
      return {
        success: false,
        error: this.t('clients.error.search_failed', 'Error al buscar clientes')
      };
    }
  }

  /**
   * Valida los datos de un cliente antes de enviarlos
   */
  validateClientData(clientData) {
    const errors = [];

    // Validaciones requeridas
    if (!clientData.dni || clientData.dni.trim().length === 0) {
      errors.push(this.t('clients.error.dni_required', 'DNI es requerido'));
    }

    if (!clientData.firstName || clientData.firstName.trim().length === 0) {
      errors.push(this.t('clients.error.name_required', 'Nombre es requerido'));
    }

    if (!clientData.lastName || clientData.lastName.trim().length === 0) {
      errors.push(this.t('clients.error.lastname_required', 'Apellido es requerido'));
    }

    if (!clientData.email || clientData.email.trim().length === 0) {
      errors.push(this.t('clients.error.email_required', 'Email es requerido'));
    } else if (!this._isValidEmail(clientData.email)) {
      errors.push(this.t('clients.error.email_format_invalid', 'Email no tiene formato válido'));
    }

    // Validaciones opcionales pero con formato
    if (clientData.dni && !this._isValidDNI(clientData.dni)) {
      errors.push(this.t('clients.error.dni_8_digits', 'DNI debe tener 8 dígitos'));
    }

    if (clientData.ruc && !this._isValidRUC(clientData.ruc)) {
      errors.push(this.t('clients.error.ruc_11_digits', 'RUC debe tener 11 dígitos'));
    }

    if (clientData.phone && !this._isValidPhone(clientData.phone)) {
      errors.push(this.t('clients.error.phone_9_digits', 'Teléfono debe tener al menos 9 dígitos'));
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
          return this.t('clients.error.invalid_data_check', 'Datos inválidos. Verifica la información ingresada.');
        case 401:
          return this.t('clients.error.unauthorized_login_again', 'No tienes autorización. Inicia sesión nuevamente.');
        case 403:
          return this.t('clients.error.no_permissions', 'No tienes permisos para realizar esta acción.');
        case 409:
          return this.t('clients.error.client_already_exists', 'Ya existe un cliente con este DNI o email.');
        case 500:
          return this.t('clients.error.server_error', 'Error del servidor. Intenta nuevamente más tarde.');
        default:
          return this.t('clients.error.connection_error', 'Error de conexión. Verifica tu conexión a internet.');
      }
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return this.t('clients.error.connection_error', 'Error de conexión. Verifica tu conexión a internet.');
    }
    
    return this.t('clients.error.unexpected_error', 'Error inesperado. Intenta nuevamente.');
  }

  /**
   * Validaciones auxiliares
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  _isValidDNI(dni) {
    return /^\d{8}$/.test(dni.replace(/\s/g, ''));
  }

  _isValidRUC(ruc) {
    return /^\d{11}$/.test(ruc.replace(/\s/g, ''));
  }

  _isValidPhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return /^\d{9,}$/.test(cleanPhone);
  }
}