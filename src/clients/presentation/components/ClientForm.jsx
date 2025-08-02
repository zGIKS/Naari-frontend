import React, { useState } from 'react';
import { searchByDni, searchByRuc } from '../../../shared/services/DniRucService';
import { useTranslation } from 'react-i18next';
import { Client } from '../../domain/entities/Client.js';

/**
 * ClientForm - Formulario para crear/editar clientes
 */
export const ClientForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null,
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialData || Client.empty());
  const [errors, setErrors] = useState({});
  const [dniSearchLoading, setDniSearchLoading] = useState(false);
  const [dniSearchError, setDniSearchError] = useState(null);
  const [rucSearchLoading, setRucSearchLoading] = useState(false);
  const [rucSearchError, setRucSearchError] = useState(null);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Autocompletar por DNI
  const handleDniSearch = async () => {
    setDniSearchLoading(true);
    setDniSearchError(null);
    const dni = formData.dni?.trim();
    if (!dni || dni.length !== 8) {
      setDniSearchError('DNI debe tener 8 dígitos');
      setDniSearchLoading(false);
      return;
    }
    
    try {
      const result = await searchByDni(dni);
      if (!result || !result.found) {
        setDniSearchError(result?.message || 'No se encontró información para ese DNI en RENIEC');
        setDniSearchLoading(false);
        return;
      }
      
      // Autocompletar solo los campos relevantes desde RENIEC
      setFormData(prev => ({
        ...prev,
        firstName: result.first_name || prev.firstName,
        lastName: result.last_name || prev.lastName,
        // Solo autocompleta dirección si el campo está vacío
        // La API de DNI no retorna dirección, se mantiene vacío para que el usuario complete
      }));
      
      setDniSearchError(null);
    } catch (error) {
      console.error('Error al buscar DNI:', error);
      setDniSearchError('Error al consultar RENIEC. Intente nuevamente.');
    }
    
    setDniSearchLoading(false);
  };

  // Autocompletar por RUC
  const handleRucSearch = async () => {
    setRucSearchLoading(true);
    setRucSearchError(null);
    const ruc = formData.ruc?.trim();
    if (!ruc || ruc.length !== 11) {
      setRucSearchError('RUC debe tener 11 dígitos');
      setRucSearchLoading(false);
      return;
    }
    
    try {
      const result = await searchByRuc(ruc);
      if (!result || !result.found) {
        setRucSearchError(result?.message || 'No se encontró información para ese RUC en SUNAT');
        setRucSearchLoading(false);
        return;
      }
      
      // Autocompletar datos de dirección desde SUNAT
      setFormData(prev => ({
        ...prev,
        // Solo autocompleta si los campos están vacíos
        address: prev.address || result.address || '',
        district: prev.district || result.district || '',
        province: prev.province || result.province || '',
        department: prev.department || result.department || '',
      }));
      
      setRucSearchError(null);
    } catch (error) {
      console.error('Error al buscar RUC:', error);
      setRucSearchError('Error al consultar SUNAT. Intente nuevamente.');
    }
    
    setRucSearchLoading(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Al menos uno de los dos: DNI o RUC es obligatorio
    if (!formData.dni?.trim() && !formData.ruc?.trim()) {
      newErrors.dni = 'DNI o RUC es obligatorio';
      newErrors.ruc = 'DNI o RUC es obligatorio';
    }
    
    // Validar formato de DNI si se proporciona
    if (formData.dni?.trim() && !/^\d{8}$/.test(formData.dni.trim())) {
      newErrors.dni = t('clients.validation.dni_invalid', 'DNI debe tener 8 dígitos');
    }
    
    // Validar formato de RUC si se proporciona
    if (formData.ruc?.trim() && !/^\d{11}$/.test(formData.ruc.trim())) {
      newErrors.ruc = t('clients.validation.ruc_invalid', 'RUC debe tener 11 dígitos');
    }
    
    // Campos obligatorios
    if (!formData.firstName?.trim()) {
      newErrors.firstName = t('clients.validation.first_name_required', 'Nombre es requerido');
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = t('clients.validation.last_name_required', 'Apellido es requerido');
    }
    if (!formData.email?.trim()) {
      newErrors.email = t('clients.validation.email_required', 'Email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('clients.validation.email_invalid', 'Email no es válido');
    }
    
    // Validar teléfono si se proporciona
    if (formData.phone && !/^\d{9,}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = t('clients.validation.phone_invalid', 'Teléfono debe tener al menos 9 dígitos');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="client-form">
      {/* Buscador de DNI arriba de Información Personal */}
      <div className="form-section" style={{ marginBottom: '1rem' }}>
        <h3>Búsqueda Automática de Datos</h3>
        <p>Busque por DNI en RENIEC para autocompletar los datos personales</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            name="dni"
            value={formData.dni || ''}
            onChange={handleChange}
            className={`form-input ${errors.dni ? 'error' : ''}`}
            placeholder="Ingrese DNI (8 dígitos)"
            maxLength="8"
            disabled={isLoading || dniSearchLoading}
            style={{ width: '180px' }}
          />
          <button
            type="button"
            onClick={handleDniSearch}
            disabled={dniSearchLoading || !(formData.dni && formData.dni.length === 8)}
            className="btn btn-secondary"
            style={{ minWidth: '100px' }}
          >
            {dniSearchLoading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            )}
            Buscar
          </button>
          {dniSearchError && <span className="form-error">{dniSearchError}</span>}
        </div>
        <small>El DNI autocompleta nombres, apellidos, fecha de nacimiento y dirección si están disponibles en RENIEC</small>
      </div>

      {/* Información Personal */}
      <div className="form-section">
        <h3>{t('clients.form.personal_info', 'Información Personal')}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label required">
              {t('clients.form.first_name', 'Nombres')}
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              placeholder={t('clients.form.first_name_placeholder', 'Ej: Nombre')}
              disabled={isLoading}
            />
            {errors.firstName && <span className="form-error">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label required">
              {t('clients.form.last_name', 'Apellidos')}
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              placeholder={t('clients.form.last_name_placeholder', 'Ej: Apellido')}
              disabled={isLoading}
            />
            {errors.lastName && <span className="form-error">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label required">
              {t('clients.form.email', 'Email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder={t('clients.form.email_placeholder', 'Ej: correo@dominio.com')}
              disabled={isLoading}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              {t('clients.form.phone', 'Teléfono')}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder={t('clients.form.phone_placeholder', 'Ej: 987654321')}
              disabled={isLoading}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="birthDate" className="form-label">
              {t('clients.form.birth_date', 'Fecha de Nacimiento')}
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate || ''}
              onChange={handleChange}
              className="form-input"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className="form-section">
        <h3>{t('clients.form.address_info', 'Información de Dirección')}</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="address" className="form-label">
              {t('clients.form.address', 'Dirección')}
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              className="form-input"
              placeholder={t('clients.form.address_placeholder', 'Ej: Av. Principal 123')}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="district" className="form-label">
              {t('clients.form.district', 'Distrito')}
            </label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district || ''}
              onChange={handleChange}
              className="form-input"
              placeholder={t('clients.form.district_placeholder', 'Ej: Distrito')}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="province" className="form-label">
              {t('clients.form.province', 'Provincia')}
            </label>
            <input
              type="text"
              id="province"
              name="province"
              value={formData.province || ''}
              onChange={handleChange}
              className="form-input"
              placeholder={t('clients.form.province_placeholder', 'Ej: Provincia')}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="urbanization" className="form-label">
              {t('clients.form.urbanization', 'Urbanización')}
            </label>
            <input
              type="text"
              id="urbanization"
              name="urbanization"
              value={formData.urbanization || ''}
              onChange={handleChange}
              className="form-input"
              placeholder={t('clients.form.urbanization_placeholder', 'Ej: Urbanización')}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="form-section">
        <h3>{t('clients.form.additional_info', 'Información Adicional')}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="ruc" className="form-label">
              {t('clients.form.ruc', 'RUC')}
            </label>
            <p className="form-helper-text">Buscar en SUNAT para autocompletar dirección</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <input
                type="text"
                id="ruc"
                name="ruc"
                value={formData.ruc || ''}
                onChange={handleChange}
                className={`form-input ${errors.ruc ? 'error' : ''}`}
                placeholder={t('clients.form.ruc_placeholder', 'Ingrese RUC de 11 dígitos')}
                maxLength="11"
                disabled={isLoading}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleRucSearch}
                disabled={rucSearchLoading || !(formData.ruc && formData.ruc.length === 11)}
                className="btn btn-secondary"
                title="Buscar información por RUC"
                style={{ minWidth: '40px', padding: '0.5rem' }}
              >
                {rucSearchLoading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                )}
              </button>
            </div>
            {errors.ruc && <span className="form-error">{errors.ruc}</span>}
            {rucSearchError && <span className="form-error">{rucSearchError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="knownFrom" className="form-label">
              {t('clients.form.known_from', 'Cómo nos conoció')}
            </label>
            <select
              id="knownFrom"
              name="knownFrom"
              value={formData.knownFrom || ''}
              onChange={handleChange}
              className="form-input"
              disabled={isLoading}
            >
              <option value="">{t('clients.form.select_option', 'Seleccionar opción')}</option>
              <option value="Referral">{t('clients.form.referral', 'Referido')}</option>
              <option value="Social Media">{t('clients.form.social_media', 'Redes Sociales')}</option>
              <option value="Internet">{t('clients.form.internet', 'Internet')}</option>
              <option value="Walk-in">{t('clients.form.walk_in', 'Visita directa')}</option>
              <option value="Advertisement">{t('clients.form.advertisement', 'Publicidad')}</option>
              <option value="Other">{t('clients.form.other', 'Otro')}</option>
            </select>
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
              {t('common.saving', 'Guardando...')}
            </>
          ) : (
            t('common.save', 'Guardar')
          )}
        </button>
      </div>
    </form>
  );
};