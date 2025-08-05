import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';
import QRCode from 'qrcode';

/**
 * ProductManager - Gestor de productos
 */
export const ProductManager = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, productId: null, productName: '' });
  const [qrModal, setQrModal] = useState({ isOpen: false, qrCodeUrl: '', productName: '', productId: '' });

  const productService = catalogFactory.getProductService();
  const branchService = catalogFactory.getBranchService();


  useEffect(() => {
    loadBranches();
    loadProducts();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data.filter(branch => branch.isActive));
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAllProducts();
      console.log('Productos cargados:', data); // Debug para ver los datos
      if (data.length > 0) {
        console.log('Primer producto completo:', data[0]);
        console.log('Propiedades del primer producto:', Object.keys(data[0]));
        console.log('qr_uuid del primer producto:', data[0].qr_uuid);
        console.log('Stock del primer producto:', data[0].stock);
      }
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateProduct = () => {
    navigate('/catalog/products/new');
  };

  const handleEditProduct = (product) => {
    navigate('/catalog/products/edit', {
      state: { product }
    });
  };

  const handleDeleteProduct = (productId, productName) => {
    setConfirmDelete({
      isOpen: true,
      productId: productId,
      productName: productName
    });
  };

  const handleGenerateQR = async (product) => {
    try {
      // Verificar que el producto tenga QR disponible
      if (!hasQRAvailable(product)) {
        console.warn('Producto sin QR disponible:', product);
        return;
      }

      // Usar el qr_uuid del producto como el contenido del QR
      const qrCodeUrl = await QRCode.toDataURL(product.qr_uuid, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrModal({
        isOpen: true,
        qrCodeUrl,
        productName: product.name,
        productId: product.qr_uuid // Mostrar el QR UUID en lugar del ID del producto
      });
    } catch (error) {
      console.error('Error generando código QR:', error);
    }
  };

  // Función para verificar si el producto tiene QR disponible
  const hasQRAvailable = (product) => {
    return (product.stock > 0 && product.stock !== '0') && 
           product.qr_uuid !== null && 
           product.qr_uuid !== undefined && 
           product.qr_uuid !== '';
  };

  // Función para obtener el estado del producto
  const getProductStatus = (product) => {
    if (product.stock === 0 || product.stock === '0') {
      return { status: 'out_of_stock', message: t('admin.out_of_stock', 'Sin stock'), showQR: false };
    } else if (product.qr_uuid && product.qr_uuid !== null && product.qr_uuid !== '') {
      return { status: 'available', message: t('admin.available', 'Disponible'), showQR: true };
    } else {
      return { status: 'updating', message: t('admin.updating', 'Actualizando...'), showQR: false };
    }
  };

  const handleCloseQRModal = () => {
    setQrModal({ isOpen: false, qrCodeUrl: '', productName: '', productId: '' });
  };

  const handleConfirmDelete = async () => {
    const { productId } = confirmDelete;
    setConfirmDelete({ isOpen: false, productId: null, productName: '' });

    try {
      await productService.deleteProduct(productId);
      // Recargar la lista completa para asegurar consistencia
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(getErrorMessage(error));
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ isOpen: false, productId: null, productName: '' });
  };


  return (
    <div className="product-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>{t('admin.products_title', 'Gestión de Productos')}</h2>
          <p>{t('admin.products_subtitle', 'Administra el inventario de productos')}</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateProduct}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {t('admin.new_product', 'Nuevo Producto')}
          </button>
        </div>
      </div>

      <div className="manager-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('common.loading', 'Cargando productos...')}</p>
          </div>
        ) : (
          <div className="product-list">
            {products.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <h3>{t('admin.no_products', 'No hay productos')}</h3>
                <p>{t('admin.no_products_message', 'Comienza registrando productos en tu inventario')}</p>
              </div>
            ) : (
              <>
                <div className="list-header">
                  <h3>{t('admin.products_list', 'Lista de Productos')} ({products.length})</h3>
                </div>
                <div className="list-grid">
                  {products.map(product => (
                    <div key={product.id} className={`branch-card ${product.isLowStock() || product.isNearExpiration() ? 'warning' : 'active'}`}>
                      <div className="card-header">
                        <div className="branch-info">
                          <h4>{product.name}</h4>
                          <span className="status-badge brand">{product.brand}</span>
                        </div>
                        <div className="card-actions">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="btn-icon edit-btn"
                            title={t('common.edit', 'Editar')}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          {hasQRAvailable(product) && (
                            <button
                              onClick={() => handleGenerateQR(product)}
                              className="btn-icon qr-btn"
                              title={t('admin.generate_qr', 'Generar código QR')}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="3" width="5" height="5"/>
                                <rect x="3" y="16" width="5" height="5"/>
                                <rect x="16" y="3" width="5" height="5"/>
                                <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                                <path d="M21 21v.01"/>
                                <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                                <path d="M3 12h.01"/>
                                <path d="M12 3h.01"/>
                                <path d="M12 16v.01"/>
                                <path d="M16 12h1"/>
                                <path d="M21 12v.01"/>
                                <path d="M12 21v-1"/>
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="btn-icon btn-danger"
                            title={t('admin.delete', 'Eliminar')}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="3,6 5,6 21,6"/>
                              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="card-content">
                        <div className="info-row">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                          </svg>
                          <span>{product.description}</span>
                        </div>
                        
                        <div className="info-row">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          </svg>
                          <span className={product.isLowStock() ? 'warning' : ''}>
                            {t('admin.stock', 'Stock')}: {product.stock} {t('admin.units', 'unidades')}
                            {product.isLowStock() && <span className="alert-text"> (Stock bajo)</span>}
                          </span>
                        </div>

                        <div className="info-row">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                          <span>${product.salePrice}</span>
                        </div>

                        <div className="info-row">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span className={product.isNearExpiration() ? 'warning' : ''}>
                            {product.expirationDate.toLocaleDateString()}
                            {product.isNearExpiration() && <span className="alert-text"> (Por vencer)</span>}
                          </span>
                        </div>

                        <div className="info-row">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9,22 9,12 15,12 15,22"/>
                          </svg>
                          <span>{branches.find(b => b.id === product.branchId)?.name}</span>
                        </div>
                      </div>

                      <div className="card-footer">
                        <small className="text-muted">
                          {t('admin.created_at', 'Creado')}: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {false && (
        <div className="form-modal">
          <div className="form-overlay" onClick={() => setShowForm(false)}></div>
          <div className="form-container">
            <div className="product-form">
              <h3>{editingProduct ? t('admin.edit_product', 'Editar Producto') : t('admin.new_product', 'Nuevo Producto')}</h3>
              {error && (
                <div className="error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </div>
              )}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSubmit({
                  name: formData.get('name'),
                  description: formData.get('description'),
                  brand: formData.get('brand'),
                  stock: parseInt(formData.get('stock')),
                  purchasePrice: parseFloat(formData.get('purchasePrice')),
                  salePrice: parseFloat(formData.get('salePrice')),
                  lowStockAlert: parseInt(formData.get('lowStockAlert')),
                  expirationDate: formData.get('expirationDate'),
                  branchId: formData.get('branchId')
                });
              }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.product_name', 'Nombre del Producto')}</label>
                    <input 
                      name="name" 
                      type="text" 
                      className="form-input" 
                      defaultValue={editingProduct?.name || ''}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.product_brand', 'Marca')}</label>
                    <input 
                      name="brand" 
                      type="text" 
                      className="form-input" 
                      defaultValue={editingProduct?.brand || ''}
                      required 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('admin.product_description', 'Descripción')}</label>
                  <textarea 
                    name="description" 
                    className="form-input"
                    defaultValue={editingProduct?.description || ''}
                  ></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.stock', editingProduct ? 'Stock' : 'Stock Inicial')}</label>
                    <input 
                      name="stock" 
                      type="number" 
                      min="0" 
                      className="form-input" 
                      defaultValue={editingProduct?.stock || ''}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.low_stock_alert', 'Alerta Stock Bajo')}</label>
                    <input 
                      name="lowStockAlert" 
                      type="number" 
                      min="0" 
                      className="form-input" 
                      defaultValue={editingProduct?.lowStockAlert || ''}
                      required 
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.purchase_price', 'Precio Compra')}</label>
                    <input 
                      name="purchasePrice" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      className="form-input" 
                      defaultValue={editingProduct?.purchasePrice || ''}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.sale_price', 'Precio Venta')}</label>
                    <input 
                      name="salePrice" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      className="form-input" 
                      defaultValue={editingProduct?.salePrice || ''}
                      required 
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.expiration_date', 'Fecha de Vencimiento')}</label>
                    <input 
                      name="expirationDate" 
                      type="date" 
                      className="form-input" 
                      defaultValue={editingProduct?.expirationDate ? 
                        editingProduct.expirationDate.toISOString().split('T')[0] : ''
                      }
                      required 
                    />
                  </div>
                  {!editingProduct && (
                    <div className="form-group">
                      <label>{t('admin.select_branch', 'Sucursal')}</label>
                      <select name="branchId" className="form-input" required>
                        <option value="">{t('admin.select_branch_option', 'Selecciona una sucursal')}</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary" disabled={submitLoading}>
                    {t('common.cancel', 'Cancelar')}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                    {submitLoading ? (
                      <>
                        <div className="spinner-sm"></div>
                        {editingProduct ? t('common.saving', 'Guardando...') : t('common.creating', 'Creando...')}
                      </>
                    ) : (
                      editingProduct ? t('common.save', 'Guardar') : t('common.create', 'Crear')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t('admin.delete_product', 'Eliminar Producto')}
        message={t('admin.confirm_delete_product', '¿Estás seguro de que quieres eliminar el producto "{{name}}"?', { name: confirmDelete.productName })}
        confirmText={t('admin.delete', 'Eliminar')}
        cancelText={t('common.cancel', 'Cancelar')}
        type="danger"
      />

      {/* Modal de código QR */}
      {qrModal.isOpen && (
        <div className="modal-overlay" onClick={handleCloseQRModal}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('admin.qr_code_title', 'Código QR')}</h3>
              <button onClick={handleCloseQRModal} className="modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="qr-content">
                <h4>{qrModal.productName}</h4>
                <p className="qr-id">QR UUID: {qrModal.productId}</p>
                <div className="qr-code-container">
                  <img src={qrModal.qrCodeUrl} alt="Código QR del producto" />
                </div>
                <p className="qr-description">
                  {t('admin.qr_description', 'Escanea este código QR para acceder rápidamente a la información del producto')}
                </p>
                <div className="qr-actions">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `qr-${qrModal.productName}.png`;
                      link.href = qrModal.qrCodeUrl;
                      link.click();
                    }}
                    className="btn btn-primary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    {t('admin.download_qr', 'Descargar QR')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};