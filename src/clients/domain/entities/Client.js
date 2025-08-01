/**
 * Client Entity - Representa un cliente del sistema
 */
export class Client {
  constructor({
    id,
    dni,
    email,
    firstName,
    lastName,
    phone,
    birthDate,
    address,
    district,
    province,
    urbanization,
    ruc,
    knownFrom,
    createdAt,
    updatedAt,
    createdBy
  }) {
    this.id = id;
    this.dni = dni;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.birthDate = birthDate;
    this.address = address;
    this.district = district;
    this.province = province;
    this.urbanization = urbanization;
    this.ruc = ruc;
    this.knownFrom = knownFrom;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
  }

  /**
   * Obtiene el nombre completo del cliente
   */
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Obtiene la dirección completa del cliente
   */
  get fullAddress() {
    const parts = [this.address, this.district, this.province, this.urbanization]
      .filter(part => part && part.trim().length > 0);
    return parts.join(', ');
  }

  /**
   * Verifica si el cliente tiene información completa
   */
  isComplete() {
    return !!(this.dni && this.firstName && this.lastName && this.email);
  }

  /**
   * Calcula la edad del cliente basada en su fecha de nacimiento
   */
  get age() {
    if (!this.birthDate) return null;
    
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Convierte la entidad a un objeto plano para envío a API
   */
  toApiFormat() {
    return {
      dni: this.dni,
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
      phone: this.phone,
      birth_date: this.birthDate,
      address: this.address,
      district: this.district,
      province: this.province,
      urbanization: this.urbanization,
      ruc: this.ruc,
      known_from: this.knownFrom
    };
  }

  /**
   * Crea una instancia de Client desde datos de API
   */
  static fromApiResponse(data) {
    return new Client({
      id: data.id,
      dni: data.dni,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      birthDate: data.birth_date,
      address: data.address,
      district: data.district,
      province: data.province,
      urbanization: data.urbanization,
      ruc: data.ruc,
      knownFrom: data.known_from,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    });
  }

  /**
   * Crea una instancia vacía para formularios
   */
  static empty() {
    return new Client({
      dni: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      birthDate: '',
      address: '',
      district: '',
      province: '',
      urbanization: '',
      ruc: '',
      knownFrom: ''
    });
  }
}