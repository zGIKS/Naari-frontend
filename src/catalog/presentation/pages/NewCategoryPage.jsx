import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

/**
 * NewCategoryPage - Página para crear/editar categorías
 */
export const NewCategoryPage = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Para edición
  const isEditing = Boolean(id);
  const categoryFromState = location.state?.category;
  
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    branchId: ''
  });

  const categoryService = catalogFactory.getCategoryService();
  const branchService = catalogFactory.getBranchService();

  useEffect(() => {
    loadBranches();
    if (isEditing && categoryFromState) {
      setEditingCategory(categoryFromState);
      setFormData({
        name: categoryFromState.name,
        description: categoryFromState.description,
        branchId: categoryFromState.branchId
      });
    }
  }, [id, categoryFromState, isEditing]);

  const loadBranches = async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data.filter(branch => branch.isActive));
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitLoading(true);

    try {
      if (isEditing) {
        await categoryService.updateCategory(id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      
      // Navegar de vuelta al listado
      navigate('/catalog/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      setError(getErrorMessage(error));
    } finally {
      setSubmitLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error.status === 400) {
      return t('admin.category_error_invalid_data', 'Datos inválidos. Verifica que todos los campos estén correctos.');
    } else if (error.status === 401) {
      return t('admin.category_error_unauthorized', 'No tienes autorización. Inicia sesión nuevamente.');
    } else if (error.status === 403) {
      return t('admin.category_error_forbidden', 'No tienes permisos para crear categorías.');
    } else if (error.status === 409) {
      return t('admin.category_error_conflict', 'Ya existe una categoría con ese nombre en esta sucursal.');
    } else if (error.status === 500) {
      return t('admin.category_error_server', 'Error del servidor. Intenta nuevamente más tarde.');
    } else if (error.status === 0) {
      return t('admin.category_error_network', 'Error de conexión. Verifica tu conexión a internet.');
    }
    
    if (error.message) {
      return error.message;
    }
    
    return t('admin.category_error_general', 'Error al crear la categoría. Intenta nuevamente.');
  };

  const handleCancel = () => {
    navigate('/catalog/categories');
  };

  const handleBack = () => {
    navigate('/catalog/categories');
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
              {isEditing ? t('admin.edit_category', 'Editar Categoría') : t('admin.new_category', 'Nueva Categoría')}
            </h1>
            <p style={{ 
              fontSize: '1rem', 
              color: '#6b7280',
              margin: '0',
              lineHeight: '1.5'
            }}>
              {isEditing ? 'Modifica los datos de la categoría' : 'Completa la información de la nueva categoría'}
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
            
            {/* Información de la Categoría */}
            <div className="form-section">
              <h3>{t('admin.category_info', 'Información de la Categoría')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label required">
                    {t('admin.category_name', 'Nombre de la Categoría')}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Tratamientos Faciales"
                    required
                    disabled={submitLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="branchId" className="form-label required">
                    {t('admin.select_branch', 'Sucursal')}
                  </label>
                  <select
                    id="branchId"
                    name="branchId"
                    className="form-input"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    required
                    disabled={submitLoading}
                  >
                    <option value="">{t('admin.select_branch_option', 'Selecciona una sucursal')}</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="description" className="form-label">
                    {t('admin.category_description', 'Descripción')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-input"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe brevemente esta categoría..."
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