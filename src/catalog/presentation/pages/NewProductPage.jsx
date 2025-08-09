import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * NewProductPage - Página para crear/editar productos
 */
export const NewProductPage = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const productFromState = location.state?.product;
  const isEditing = Boolean(productFromState);
  
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const productService = catalogFactory.getProductService();
  const branchService = catalogFactory.getBranchService();

  // Helper function to format date for input[type="date"]
  const formatDateForInput = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    if (typeof date === 'string') {
      return new Date(date).toISOString().split('T')[0];
    }
    return '';
  };

  useEffect(() => {
    loadBranches();
    if (isEditing && productFromState) {
      setEditingProduct(productFromState);
    }
  }, [productFromState, isEditing]);

  const loadBranches = async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data.filter(branch => branch.isActive));
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitLoading(true);

    try {
      const formData = new FormData(e.target);
      const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        brand: formData.get('brand'),
        stock: parseInt(formData.get('stock')),
        purchasePrice: parseFloat(formData.get('purchasePrice')),
        salePrice: parseFloat(formData.get('salePrice')),
        lowStockAlert: parseInt(formData.get('lowStockAlert')),
        expirationDate: formData.get('expirationDate'),
        branchId: formData.get('branchId')
      };

      // Validaciones frontend
      if (!productData.name.trim()) {
        throw new Error(t('validation.name_required', 'El nombre es requerido'));
      }
      if (!productData.description.trim()) {
        throw new Error(t('validation.description_required', 'La descripción es requerida'));
      }
      if (!isEditing && !productData.branchId) {
        throw new Error(t('validation.branch_required', 'La sucursal es requerida'));
      }
      if (productData.purchasePrice <= 0) {
        throw new Error(t('validation.purchase_price_positive', 'El precio de compra debe ser mayor a 0'));
      }
      if (productData.salePrice <= 0) {
        throw new Error(t('validation.sale_price_positive', 'El precio de venta debe ser mayor a 0'));
      }
      if (productData.salePrice < productData.purchasePrice) {
        throw new Error(t('validation.sale_price_must_be_higher', 'El precio de venta no puede ser menor al precio de compra'));
      }
      if (productData.stock < 0) {
        throw new Error(t('validation.stock_non_negative', 'El stock no puede ser negativo'));
      }

      if (isEditing && editingProduct) {
        // Para edición, excluir branchId del payload según especificación de API
        const { branchId, ...updatePayload } = productData;
        await productService.updateProduct(editingProduct.id, updatePayload);
      } else {
        await productService.createProduct(productData);
      }
      
      // Navegar de vuelta al listado
      navigate('/catalog/products');
    } catch (error) {
      console.error('Error saving product:', error);
      setError(getErrorMessage(error));
    } finally {
      setSubmitLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error.status === 400) {
      return t('admin.product_error_invalid_data', 'Datos inválidos. Verifica que todos los campos estén correctos.');
    } else if (error.status === 401) {
      return t('admin.product_error_unauthorized', 'No tienes autorización. Inicia sesión nuevamente.');
    } else if (error.status === 403) {
      return t('admin.product_error_forbidden', 'No tienes permisos para realizar esta acción.');
    } else if (error.status === 404) {
      return t('admin.product_error_not_found', 'Producto no encontrado.');
    } else if (error.status === 409) {
      return t('admin.product_error_conflict', 'Ya existe un producto con ese nombre.');
    } else if (error.status === 500) {
      return t('admin.product_error_server', 'Error del servidor. Intenta nuevamente más tarde.');
    } else if (error.status === 0) {
      return t('admin.product_error_network', 'Error de conexión. Verifica tu conexión a internet.');
    }
    
    if (error.message) {
      if (error.message.includes('precio de venta') && error.message.includes('precio de compra')) {
        return 'El precio de venta no puede ser menor al precio de compra';
      }
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return t('admin.product_error_unknown', 'Ha ocurrido un error inesperado. Intenta nuevamente.');
  };

  const handleCancel = () => {
    navigate('/catalog/products');
  };

  const handleBack = () => {
    navigate('/catalog/products');
  };

  return (
    <div className="create-client-page">
        <div className="page-header" style={{
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.5rem',
          padding: '0 2rem 1.5rem 2rem'
        }}>
          <div className="header-content">
            <button 
              onClick={handleBack}
              className="btn btn-secondary"
              style={{ 
                marginBottom: '1.5rem', 
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
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
                e.target.style.backgroundColor = 'var(--bg-tertiary)';
                e.target.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
              Volver al catálogo
            </button>
            
            <div style={{ 
              marginBottom: '1rem'
            }}>
              <h1 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                color: 'var(--text-primary)',
                margin: '0 0 0.75rem 0',
                lineHeight: '1.2'
              }}>
                {isEditing ? t('admin.edit_product', 'Editar Producto') : t('admin.new_product', 'Nuevo Producto')}
              </h1>
              <p style={{ 
                fontSize: '1.1rem', 
                color: 'var(--text-secondary)',
                margin: '0',
                lineHeight: '1.5'
              }}>
                {isEditing ? 'Modifica los datos del producto' : 'Completa la información del nuevo producto'}
              </p>
            </div>
          </div>
        </div>

        <div className="page-content">
          <div className="form-container" style={{ 
            width: '100%',
            margin: '0',
            padding: '2rem',
            background: 'var(--bg-primary)',
            borderRadius: '0',
            boxShadow: 'none'
          }}>
          <form onSubmit={handleSubmit} className="client-form" key={`${editingProduct?.id || 'new'}-${branches.length}`}>
            {error && (
              <div className="error-message" style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid var(--error-color)',
                borderRadius: '8px',
                color: 'var(--error-color)',
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
            
            {/* Información Básica del Producto */}
            <div className="form-section">
              <h3>{t('admin.product_basic_info', 'Información Básica')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label required">
                    {t('admin.product_name', 'Nombre del Producto')}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    defaultValue={editingProduct?.name || ''}
                    placeholder={t('admin.product_name_placeholder', 'Ej: Crema Hidratante Anti-edad')}
                    required
                    disabled={submitLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="brand" className="form-label required">
                    {t('admin.product_brand', 'Marca')}
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    className="form-input"
                    defaultValue={editingProduct?.brand || ''}
                    placeholder={t('admin.product_brand_placeholder', 'Ej: L\'Oreal')}
                    required
                    disabled={submitLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="branchId" className={`form-label ${!isEditing ? 'required' : ''}`}>
                    {t('admin.select_branch', 'Sucursal')} {isEditing && `(${t('admin.readonly', 'Solo lectura')})`}
                  </label>
                  <select
                    id="branchId"
                    name="branchId"
                    className="form-input"
                    defaultValue={editingProduct?.branchId || ''}
                    required={!isEditing}
                    disabled={submitLoading || isEditing}
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
                    {t('admin.product_description', 'Descripción')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-input"
                    rows="3"
                    defaultValue={editingProduct?.description || ''}
                    placeholder={t('admin.product_description_placeholder', 'Describe las características y beneficios del producto...')}
                    disabled={submitLoading}
                  />
                </div>
              </div>
            </div>
            
            {/* Información de Precios y Stock */}
            <div className="form-section">
              <h3>{t('admin.pricing_stock_info', 'Precios y Stock')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="purchasePrice" className="form-label required">
                    {t('admin.purchase_price', 'Precio de Compra')}
                  </label>
                  <input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    defaultValue={editingProduct?.purchasePrice || ''}
                    placeholder={t('admin.purchase_price_placeholder', 'Ej: 50.00')}
                    required
                    disabled={submitLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="salePrice" className="form-label required">
                    {t('admin.sale_price', 'Precio de Venta')}
                  </label>
                  <input
                    id="salePrice"
                    name="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    defaultValue={editingProduct?.salePrice || ''}
                    placeholder={t('admin.sale_price_placeholder', 'Ej: 75.00')}
                    required
                    disabled={submitLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="stock" className="form-label required">
                    {t('admin.stock', 'Stock')}
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    className="form-input"
                    defaultValue={editingProduct?.stock || ''}
                    placeholder={t('admin.stock_placeholder', 'Ej: 25')}
                    required
                    disabled={submitLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lowStockAlert" className="form-label required">
                    {t('admin.low_stock_alert', 'Alerta Stock Bajo')}
                  </label>
                  <input
                    id="lowStockAlert"
                    name="lowStockAlert"
                    type="number"
                    min="0"
                    className="form-input"
                    defaultValue={editingProduct?.lowStockAlert || ''}
                    placeholder={t('admin.low_stock_alert_placeholder', 'Ej: 5')}
                    required
                    disabled={submitLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="expirationDate" className="form-label required">
                    {t('admin.expiration_date', 'Fecha de Vencimiento')}
                  </label>
                                    <input
                    id="expirationDate"
                    name="expirationDate"
                    type="date"
                    className="form-input"
                    defaultValue={formatDateForInput(editingProduct?.expirationDate)}
                    placeholder={t('admin.expiration_date_placeholder', 'Ej: 2024-12-31')}
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