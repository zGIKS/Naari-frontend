import React, { useState } from 'react';
import { searchByDni, searchByRuc } from '../../../shared/services/DniRucService';
import { useTranslation } from 'react-i18next';
import { Client } from '../../domain/entities/Client.js';
import Spinner from '../../../shared/components/Spinner';

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
      setDniSearchError(t('clients.error.dni_search_failed', 'Error al consultar RENIEC. Intente nuevamente.'));
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
      setRucSearchError(t('clients.error.ruc_search_failed', 'Error al consultar SUNAT. Intente nuevamente.'));
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
    if (formData.phone && !/^\d{9,}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
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
      {/* Sección unificada de búsqueda de datos */}
      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h3>{t('clients.form.autocomplete_section', 'Autocompletado Opcional de Datos')}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Búsqueda por DNI */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              {t('clients.form.dni_optional_label', 'DNI (Opcional: buscar en RENIEC)')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="dni"
                value={formData.dni || ''}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (formData.dni && formData.dni.length === 8 && !dniSearchLoading) {
                      handleDniSearch();
                    }
                  }
                }}
                className={`form-input ${errors.dni ? 'error' : ''}`}
                placeholder={t('clients.form.dni_autocomplete_placeholder', 'DNI (8 dígitos) - Enter para autocompletar')}
                maxLength="8"
                disabled={isLoading || dniSearchLoading}
                style={{ 
                  paddingRight: '45px',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={handleDniSearch}
                disabled={dniSearchLoading || !(formData.dni && formData.dni.length === 8)}
                title={t('clients.form.search_dni', 'Buscar información por DNI')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: dniSearchLoading || !(formData.dni && formData.dni.length === 8) ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: dniSearchLoading || !(formData.dni && formData.dni.length === 8) ? '#ccc' : '#666',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!dniSearchLoading && formData.dni && formData.dni.length === 8) {
                    e.target.style.color = '#333';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!dniSearchLoading && formData.dni && formData.dni.length === 8) {
                    e.target.style.color = '#666';
                  }
                }}
              >
                {dniSearchLoading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity=".3"/>
                    <path d="M12 2v4"/>
                    <path d="M12 18v4"/>
                    <path d="M4.93 4.93l2.83 2.83"/>
                    <path d="M16.24 16.24l2.83 2.83"/>
                    <path d="M2 12h4"/>
                    <path d="M18 12h4"/>
                    <path d="M4.93 19.07l2.83-2.83"/>
                    <path d="M16.24 7.76l2.83-2.83"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.dni && <span className="form-error">{errors.dni}</span>}
            {dniSearchError && <span className="form-error">{dniSearchError}</span>}
          </div>

          {/* Búsqueda por RUC */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              {t('clients.form.ruc_optional_label', 'RUC (Opcional: buscar en SUNAT)')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="ruc"
                value={formData.ruc || ''}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (formData.ruc && formData.ruc.length === 11 && !rucSearchLoading) {
                      handleRucSearch();
                    }
                  }
                }}
                className={`form-input ${errors.ruc ? 'error' : ''}`}
                placeholder={t('clients.form.ruc_autocomplete_placeholder', 'RUC (11 dígitos) - Enter para autocompletar')}
                maxLength="11"
                disabled={isLoading || rucSearchLoading}
                style={{ 
                  paddingRight: '45px',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={handleRucSearch}
                disabled={rucSearchLoading || !(formData.ruc && formData.ruc.length === 11)}
                title={t('clients.form.search_ruc', 'Buscar información por RUC')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: rucSearchLoading || !(formData.ruc && formData.ruc.length === 11) ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: rucSearchLoading || !(formData.ruc && formData.ruc.length === 11) ? '#ccc' : '#666',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!rucSearchLoading && formData.ruc && formData.ruc.length === 11) {
                    e.target.style.color = '#333';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!rucSearchLoading && formData.ruc && formData.ruc.length === 11) {
                    e.target.style.color = '#666';
                  }
                }}
              >
                {rucSearchLoading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity=".3"/>
                    <path d="M12 2v4"/>
                    <path d="M12 18v4"/>
                    <path d="M4.93 4.93l2.83 2.83"/>
                    <path d="M16.24 16.24l2.83 2.83"/>
                    <path d="M2 12h4"/>
                    <path d="M18 12h4"/>
                    <path d="M4.93 19.07l2.83-2.83"/>
                    <path d="M16.24 7.76l2.83-2.83"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.ruc && <span className="form-error">{errors.ruc}</span>}
            {rucSearchError && <span className="form-error">{rucSearchError}</span>}
          </div>
        </div>
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          backgroundColor: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid var(--accent-color)', 
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: 'var(--accent-color)'
        }}>
          <strong>Nota:</strong> {t('clients.form.autocomplete_note', 'Los campos DNI y RUC se guardarán con el cliente independientemente de si utiliza el autocompletado o los escribe manualmente.')}
        </div>
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
              placeholder={t('clients.form.birth_date_placeholder', 'dd/mm/aaaa')}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>



      {/* Información de Dirección */}
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
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">{t('clients.form.known_from', 'Cómo nos conoció')}</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              marginTop: '0.5rem'
            }}>
              {[
                { 
                  value: 'Referral', 
                  label: t('clients.form.referral', 'Referido'), 
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )
                },
                { 
                  value: 'Social Media', 
                  label: t('clients.form.social_media', 'Redes Sociales'), 
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  )
                },
                { 
                  value: 'Internet', 
                  label: t('clients.form.internet', 'Internet'), 
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  )
                },
                { 
                  value: 'Walk-in', 
                  label: t('clients.form.walk_in', 'Visita directa'), 
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                  )
                },
                { 
                  value: 'Advertisement', 
                  label: t('clients.form.advertisement', 'Publicidad'), 
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  )
                },
                { 
                  value: 'Other', 
                  label: t('clients.form.other', 'Otro'), 
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  )
                }
              ].map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    border: formData.knownFrom === option.value ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: formData.knownFrom === option.value ? '#eff6ff' : '#ffffff',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.knownFrom !== option.value) {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.knownFrom !== option.value) {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#ffffff';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="knownFrom"
                    value={option.value}
                    checked={formData.knownFrom === option.value}
                    onChange={handleChange}
                    disabled={isLoading}
                    style={{ display: 'none' }}
                  />
                  <span style={{ 
                    color: formData.knownFrom === option.value ? '#3b82f6' : '#6b7280',
                    transition: 'color 0.2s ease'
                  }}>
                    {option.icon}
                  </span>
                  <span style={{ fontWeight: '500' }}>{option.label}</span>
                </label>
              ))}
            </div>
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
              <Spinner size="sm" message="" />
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