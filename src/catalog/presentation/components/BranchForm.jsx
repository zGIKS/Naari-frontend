import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BranchForm - Formulario para crear/editar sucursales
 * Implementa validación del lado del cliente
 */
export const BranchForm = ({ branch, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || ''
      });
    }
  }, [branch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.name_required', 'El nombre es requerido');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('validation.address_required', 'La dirección es requerida');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('validation.phone_required', 'El teléfono es requerido');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('validation.email_required', 'El email es requerido');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.email_invalid', 'El email no es válido');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // El error será manejado por el componente padre
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  return (
    <div className="branch-form">
      <div className="form-header">
        <h3>
          {branch 
            ? t('admin.edit_branch', 'Editar Sucursal')
            : t('admin.new_branch', 'Nueva Sucursal')
          }
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-grid">
          {/* Fila 1: Nombre y Teléfono (campos más cortos) */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              {t('admin.branch_name', 'Nombre de la Sucursal')} *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder={t('admin.branch_name_placeholder', 'Ej: Sucursal Centro')}
              disabled={submitting}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              {t('admin.branch_phone', 'Teléfono')} *
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder={t('admin.branch_phone_placeholder', 'Ej: +1234567890')}
              disabled={submitting}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {/* Fila 2: Dirección (ancho completo por ser campo largo) */}
          <div className="form-group full-width">
            <label htmlFor="address" className="form-label">
              {t('admin.branch_address', 'Dirección')} *
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className={`form-input ${errors.address ? 'error' : ''}`}
              placeholder={t('admin.branch_address_placeholder', 'Ej: Av. Principal 123, Edificio Torres del Sol, Piso 2')}
              disabled={submitting}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {/* Fila 3: Email (ancho completo por ser campo medio-largo) */}
          <div className="form-group full-width">
            <label htmlFor="email" className="form-label">
              {t('admin.branch_email', 'Email')} *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder={t('admin.branch_email_placeholder', 'Ej: sucursal.centro@empresa.com')}
              disabled={submitting}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={submitting}
          >
            {t('common.cancel', 'Cancelar')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="btn-spinner"></div>
                {t('common.saving', 'Guardando...')}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                {branch 
                  ? t('common.update', 'Actualizar')
                  : t('common.create', 'Crear')
                }
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};