import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * NewServicePage - Página para crear/editar servicios
 */
export const NewServicePage = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // Para edición
  const isEditing = Boolean(id);
  
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const serviceService = catalogFactory.getServiceService();
  const categoryService = catalogFactory.getCategoryService();
  const branchService = catalogFactory.getBranchService();

  useEffect(() => {
    loadBranches();
    if (isEditing) {
      loadService();
    }
  }, [id]);

  useEffect(() => {
    if (branches.length > 0) {
      loadCategories();
    }
  }, [branches]);

  const loadBranches = async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data.filter(branch => branch.isActive));
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategoriesFromAllBranches(branches);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadService = async () => {
    try {
      const service = await serviceService.getServiceById(id);
      setEditingService(service);
    } catch (error) {
      console.error('Error loading service:', error);
      setError('Error al cargar el servicio');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitLoading(true);

    try {
      const formData = new FormData(e.target);
      const isDiscountActive = formData.get('isDiscountActive') === 'on';
      const discountPercent = parseInt(formData.get('discountPercent')) || 0;
      const price = parseFloat(formData.get('price'));
      
      const serviceData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: price,
        duration_minutes: parseInt(formData.get('durationMinutes')),
        duration_unit: 'minutes',
        category_id: formData.get('categoryId'),
        benefits: formData.get('benefits'),
        contraindications: formData.get('contraindications'),
        treatment_frequency_value: parseInt(formData.get('treatmentFrequencyValue')) || null,
        treatment_frequency_unit: formData.get('treatmentFrequencyUnit') || 'days',
        treatment_includes: formData.get('treatmentIncludes'),
        is_discount_active: isDiscountActive,
        discount_percent: discountPercent,
        discounted_price: isDiscountActive ? price * (1 - discountPercent / 100) : 0
      };

      if (isEditing) {
        await serviceService.updateService(id, serviceData);
      } else {
        await serviceService.createService(serviceData);
      }
      
      // Navegar de vuelta al listado
      navigate('/catalog/services');
    } catch (error) {
      console.error('Error saving service:', error);
      setError(getErrorMessage(error));
    } finally {
      setSubmitLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error.status === 400) {
      return t('admin.service_error_invalid_data', 'Datos inválidos. Verifica que todos los campos estén correctos.');
    } else if (error.status === 401) {
      return t('admin.service_error_unauthorized', 'No tienes autorización. Inicia sesión nuevamente.');
    } else if (error.status === 403) {
      return t('admin.service_error_forbidden', 'No tienes permisos para realizar esta acción.');
    } else if (error.status === 404) {
      return t('admin.service_error_not_found', 'Servicio no encontrado.');
    } else if (error.status === 409) {
      return t('admin.service_error_conflict', 'Ya existe un servicio con ese nombre.');
    } else if (error.status === 500) {
      return t('admin.service_error_server', 'Error del servidor. Intenta nuevamente más tarde.');
    } else if (error.status === 0) {
      return t('admin.service_error_network', 'Error de conexión. Verifica tu conexión a internet.');
    }
    
    if (error.message) {
      return error.message;
    }
    
    return t('admin.service_error_unknown', 'Ha ocurrido un error inesperado. Intenta nuevamente.');
  };

  const handleCancel = () => {
    navigate('/catalog/services');
  };

  const handleBack = () => {
    navigate('/catalog/services');
  };

  return (
    <div className="create-client-page">
      <div className="page-header" style={{
        marginBottom: '2rem',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '1.5rem'
      }}>
        <div className="header-content">
          <button 
            onClick={handleBack}
            className="btn btn-ghost"
            style={{ 
              marginBottom: '1rem', 
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              color: '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              width: 'fit-content'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#e5e7eb';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            Volver al catálogo
          </button>
          
          <div style={{ marginBottom: '0.5rem' }}>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              color: '#111827',
              margin: '0 0 0.5rem 0',
              lineHeight: '1.2'
            }}>
              {isEditing ? t('admin.edit_service', 'Editar Servicio') : t('admin.new_service', 'Nuevo Servicio')}
            </h1>
            <p style={{ 
              fontSize: '1rem', 
              color: '#6b7280',
              margin: '0',
              lineHeight: '1.5'
            }}>
              {isEditing ? 'Modifica los datos del servicio' : 'Completa la información del nuevo servicio'}
            </p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="form-container" style={{ 
          width: '100%',
          maxWidth: 'none',
          margin: '0',
          padding: '0',
          background: 'transparent',
          borderRadius: '0',
          boxShadow: 'none'
        }}>
          <form onSubmit={handleSubmit} className="client-form">
            {error && (
              <div className="error-message" style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}
            
            {/* Información Básica del Servicio */}
            <div className="form-section">
              <h3>{t('admin.service_basic_info', 'Información Básica')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label required">
                    {t('admin.service_name', 'Nombre del Servicio')}
                  </label>
                  <input 
                    id="name"
                    name="name" 
                    type="text" 
                    className="form-input" 
                    defaultValue={editingService?.name || ''}
                    placeholder="Ej: Limpieza facial profunda"
                    required 
                    disabled={submitLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categoryId" className="form-label required">
                    {t('admin.service_category', 'Categoría')}
                  </label>
                  <select 
                    id="categoryId"
                    name="categoryId" 
                    className="form-input" 
                    defaultValue={editingService?.categoryId || ''}
                    required
                    disabled={submitLoading}
                  >
                    <option value="">{t('admin.select_category', 'Selecciona una categoría')}</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="price" className="form-label required">
                    {t('admin.service_price', 'Precio')}
                  </label>
                  <input 
                    id="price"
                    name="price" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    className="form-input" 
                    defaultValue={editingService?.price || ''}
                    placeholder="0.00"
                    required 
                    disabled={submitLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="durationMinutes" className="form-label required">
                    {t('admin.service_duration', 'Duración (minutos)')}
                  </label>
                  <input 
                    id="durationMinutes"
                    name="durationMinutes" 
                    type="number" 
                    min="15" 
                    max="480" 
                    step="15" 
                    className="form-input" 
                    placeholder="60" 
                    defaultValue={editingService?.duration_minutes || ''}
                    required 
                    disabled={submitLoading}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="description" className="form-label required">
                    {t('admin.service_description', 'Descripción')}
                  </label>
                  <textarea 
                    id="description"
                    name="description" 
                    className="form-input" 
                    rows="3" 
                    required 
                    minLength="10" 
                    placeholder="Describe detalladamente el servicio..."
                    defaultValue={editingService?.description || ''}
                    disabled={submitLoading}
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Información Detallada */}
            <div className="form-section">
              <h3>{t('admin.service_detailed_info', 'Información Detallada')}</h3>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                  <label htmlFor="benefits" className="form-label required">
                    {t('admin.service_benefits', 'Beneficios')}
                  </label>
                  <textarea 
                    id="benefits"
                    name="benefits" 
                    className="form-input" 
                    rows="3" 
                    required 
                    minLength="10" 
                    placeholder="Lista los principales beneficios del servicio..."
                    defaultValue={editingService?.benefits || ''}
                    disabled={submitLoading}
                  ></textarea>
                </div>
                <div className="form-group" style={{ gridColumn: '3 / -1' }}>
                  <label htmlFor="treatmentIncludes" className="form-label required">
                    {t('admin.service_includes', 'El tratamiento incluye')}
                  </label>
                  <textarea 
                    id="treatmentIncludes"
                    name="treatmentIncludes" 
                    className="form-input" 
                    rows="3" 
                    required 
                    minLength="10" 
                    placeholder="Detalla qué incluye exactamente el tratamiento..."
                    defaultValue={editingService?.treatment_includes || ''}
                    disabled={submitLoading}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="treatmentFrequencyValue" className="form-label">
                    {t('admin.treatment_frequency', 'Frecuencia recomendada')}
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      id="treatmentFrequencyValue"
                      name="treatmentFrequencyValue" 
                      type="number" 
                      min="1" 
                      max="365" 
                      className="form-input" 
                      placeholder="15" 
                      defaultValue={editingService?.treatment_frequency_value || ''}
                      disabled={submitLoading}
                      style={{ flex: '1' }}
                    />
                    <select 
                      name="treatmentFrequencyUnit" 
                      className="form-input"
                      defaultValue={editingService?.treatment_frequency_unit || 'days'}
                      disabled={submitLoading}
                      style={{ flex: '1' }}
                    >
                      <option value="days">Días</option>
                      <option value="weeks">Semanas</option>
                      <option value="months">Meses</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contraindications" className="form-label">
                    {t('admin.contraindications', 'Contraindicaciones')}
                  </label>
                  <input 
                    id="contraindications"
                    name="contraindications" 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej: Embarazo, lactancia, alergias..." 
                    defaultValue={editingService?.contraindications || ''}
                    disabled={submitLoading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.discount_info', 'Información de Descuento')}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <input 
                      name="isDiscountActive" 
                      type="checkbox" 
                      id="discount" 
                      defaultChecked={editingService?.is_discount_active || false}
                      disabled={submitLoading}
                    />
                    <label htmlFor="discount" style={{ margin: 0 }}>{t('admin.has_discount', 'Tiene descuento activo')}</label>
                  </div>
                  <input 
                    name="discountPercent" 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="form-input" 
                    placeholder="0" 
                    defaultValue={editingService?.discount_percent || ''}
                    disabled={submitLoading}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn btn-secondary" disabled={submitLoading}>
                {t('common.cancel', 'Cancelar')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                {submitLoading ? (
                  <>
                    <div className="spinner-small"></div>
                    {t('common.saving', 'Guardando...')}
                  </>
                ) : (
                  isEditing ? t('common.update', 'Actualizar') : t('common.create', 'Crear')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};