import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Employee } from '../../domain/entities/Employee.js';
import { useUserRole } from '../../../shared/hooks/useUserRole.js';

/**
 * EmployeeForm - Formulario para crear empleados
 */
export const EmployeeForm = ({ 
  employee = null,
  onSubmit, 
  onCancel, 
  isLoading = false,
  branches = []
}) => {
  const { t } = useTranslation();
  const { isAdmin } = useUserRole();
  const [formData, setFormData] = useState(employee || Employee.empty());
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Verificar si es el usuario actual editando su propio perfil
  const isEditingOwnProfile = () => {
    if (!employee) return false;
    const token = sessionStorage.getItem('naari_token');
    if (!token) return false;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData.userId === employee.id || String(tokenData.userId) === String(employee.id);
    } catch (error) {
      return false;
    }
  };

  // Verificar si se puede modificar el rol del empleado
  const canEditRole = () => {
    // Si no es admin, no puede editar roles de nadie
    if (!isAdmin) return false;
    
    // Si es creación de nuevo empleado, admin puede asignar rol (excepto admin)
    if (!employee) return true;
    
    // Admin no puede cambiar su propio rol
    if (isEditingOwnProfile()) return false;
    
    // Admin no puede cambiar rol de otros admins
    if (employee.role === 'administrator') return false;
    
    return true;
  };

  // Obtener roles disponibles según el contexto
  const getAvailableRoles = () => {
    // Solo permitir receptionist y esthetician (nunca administrator)
    return [
      { value: 'receptionist', label: t('roles.receptionist', 'Recepcionista') },
      { value: 'esthetician', label: t('roles.esthetician', 'Especialista') }
    ];
  };

  // Update form data when employee prop changes
  useEffect(() => {
    if (employee) {
      setFormData({
        id: employee.id,
        email: employee.email || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        role: employee.role || '',
        branchId: employee.branchId || '',
        password: '' // Don't pre-fill password for editing
      });
    } else {
      setFormData(Employee.empty());
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.email?.trim()) {
      newErrors.email = t('users.validation.email_required', 'Email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('users.validation.email_invalid', 'Email no es válido');
    }

    if (!formData.firstName?.trim()) {
      newErrors.firstName = t('users.validation.first_name_required', 'Nombre es requerido');
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = t('users.validation.last_name_required', 'Apellido es requerido');
    }

    // Solo validar rol si se puede editar
    if (canEditRole() && !formData.role?.trim()) {
      newErrors.role = t('users.validation.role_required', 'Rol es requerido');
    }

    // Password validation - required for new employees, optional for editing
    if (!employee && !formData.password?.trim()) {
      newErrors.password = t('users.validation.password_required', 'Contraseña es requerida');
    } else if (formData.password && formData.password.length > 0) {
      if (formData.password.length < 8) {
        newErrors.password = t('users.validation.password_min_length', 'Contraseña debe tener al menos 8 caracteres');
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
        newErrors.password = t('users.validation.password_requirements', 'Debe contener mayúscula, minúscula, número y símbolo');
      }
    }

    if (formData.role && formData.role !== 'administrator' && !formData.branchId) {
      newErrors.branchId = t('users.validation.branch_required', 'Sucursal es requerida para este rol');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Asegurar que el rol se mantenga si no se puede editar
    const finalFormData = { ...formData };
    if (!canEditRole() && employee) {
      finalFormData.role = employee.role;
    }
    
    console.log('EmployeeForm.handleSubmit:', {
      isEditing: !!employee,
      employeeId: employee?.id,
      finalFormData
    });
    
    if (validateForm()) {
      onSubmit(finalFormData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <div className="form-section">
        <h3>{t('users.form.basic_info', 'Información Básica')}</h3>
        
        <div className="employee-form-grid">
          {/* Fila 1: Nombres y Apellidos */}
          <div className="form-group">
            <label htmlFor="firstName" className="form-label required">
              {t('users.form.first_name', 'Nombres')}
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              placeholder="Ej: Nombre"
              disabled={isLoading}
            />
            {errors.firstName && <span className="form-error">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label required">
              {t('users.form.last_name', 'Apellidos')}
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              placeholder="Ej: Apellido"
              disabled={isLoading}
            />
            {errors.lastName && <span className="form-error">{errors.lastName}</span>}
          </div>

          {/* Fila 2: Email y Rol */}
          <div className="form-group">
            <label htmlFor="email" className="form-label required">
              {t('users.form.email', 'Email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Ej: correo@dominio.com"
              disabled={isLoading}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Mostrar campo de rol editable según las nuevas reglas */}
          {canEditRole() && (
            <div className="form-group">
              <label htmlFor="role" className="form-label required">
                {t('users.form.role', 'Rol')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role || ''}
                onChange={handleChange}
                className={`form-input ${errors.role ? 'error' : ''}`}
                disabled={isLoading}
              >
                {!employee && (
                  <option value="">{t('users.form.select_role', 'Seleccionar rol')}</option>
                )}
                {getAvailableRoles().map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && <span className="form-error">{errors.role}</span>}
            </div>
          )}

          {/* Mostrar rol actual como texto readonly cuando no se puede editar */}
          {!canEditRole() && employee && (
            <div className="form-group">
              <label className="form-label">
                {t('users.form.role', 'Rol')}
              </label>
              <div className="form-input-readonly">
                {t(`roles.${formData.role}`, 
                  formData.role === 'receptionist' ? 'Recepcionista' : 
                  formData.role === 'esthetician' ? 'Especialista' : 
                  'Administrador'
                )}
                <small className="form-help">
                  {isEditingOwnProfile() 
                    ? t('users.form.role_readonly_self', 'No puedes cambiar tu propio rol')
                    : t('users.form.role_readonly_admin', 'No puedes cambiar el rol de administradores')
                  }
                </small>
              </div>
            </div>
          )}

          {/* Fila 3: Sucursal y Contraseña */}
          {formData.role && formData.role !== 'administrator' && (
            <div className="form-group">
              <label htmlFor="branchId" className="form-label required">
                {t('users.form.branch', 'Sucursal')}
              </label>
              <select
                id="branchId"
                name="branchId"
                value={formData.branchId || ''}
                onChange={handleChange}
                className={`form-input ${errors.branchId ? 'error' : ''}`}
                disabled={isLoading}
              >
                <option value="">{t('users.form.select_branch', 'Seleccionar sucursal')}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              {errors.branchId && <span className="form-error">{errors.branchId}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className={`form-label ${!employee ? 'required' : ''}`}>
              {employee 
                ? t('users.form.password_optional', 'Contraseña ')
                : t('users.form.password', 'Contraseña')
              }
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder={employee 
                  ? t('users.form.password_placeholder_edit', 'Opcional')
                  : t('users.form.password_placeholder', 'Mínimo 8 caracteres')
                }
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
            {!employee && (
              <small className="form-help">
                {t('users.form.password_help', 'Debe contener mayúscula, minúscula, número y símbolo especial')}
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          {t('common.cancel', 'Cancelar')}
        </button>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner-small"></div>
              {t('common.creating', 'Creando...')}
            </>
          ) : (
            employee 
              ? t('users.form.update_employee', 'Actualizar Empleado')
              : t('users.form.create_employee', 'Crear Empleado')
          )}
        </button>
      </div>
    </form>
  );
};