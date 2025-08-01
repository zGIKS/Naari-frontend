import React, { useState } from 'react';
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
    if (!formData.dni?.trim()) {
      newErrors.dni = t('clients.validation.dni_required', 'DNI es requerido');
    } else if (!/^\d{8}$/.test(formData.dni.trim())) {
      newErrors.dni = t('clients.validation.dni_invalid', 'DNI debe tener 8 dígitos');
    }

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

    // Validaciones opcionales
    if (formData.ruc && !/^\d{11}$/.test(formData.ruc.trim())) {
      newErrors.ruc = t('clients.validation.ruc_invalid', 'RUC debe tener 11 dígitos');
    }

    if (formData.phone && !/^\d{9,}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = t('clients.validation.phone_invalid', 'Teléfono debe tener al menos 9 dígitos');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="client-form">
      <div className="form-section">
        <h3>{t('clients.form.personal_info', 'Información Personal')}</h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="dni" className="form-label required">
              {t('clients.form.dni', 'DNI')}
            </label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni || ''}
              onChange={handleChange}
              className={`form-input ${errors.dni ? 'error' : ''}`}
              placeholder="Ej: 12345678"
              maxLength="8"
              disabled={isLoading}
            />
            {errors.dni && <span className="form-error">{errors.dni}</span>}
          </div>

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
              placeholder="Ej: Nombre"
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
              placeholder="Ej: Apellido"
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
              placeholder="Ej: correo@dominio.com"
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
              placeholder="Ej: 987654321"
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
              placeholder="Ej: Av. Principal 123"
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
              placeholder="Ej: Distrito"
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
              placeholder="Ej: Provincia"
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
              placeholder="Ej: Urbanización"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>{t('clients.form.additional_info', 'Información Adicional')}</h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="ruc" className="form-label">
              {t('clients.form.ruc', 'RUC')}
            </label>
            <input
              type="text"
              id="ruc"
              name="ruc"
              value={formData.ruc || ''}
              onChange={handleChange}
              className={`form-input ${errors.ruc ? 'error' : ''}`}
              placeholder="Ej: 20123456789"
              maxLength="11"
              disabled={isLoading}
            />
            {errors.ruc && <span className="form-error">{errors.ruc}</span>}
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