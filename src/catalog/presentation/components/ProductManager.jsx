import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ProductManager - Gestor de productos
 */
export const ProductManager = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await productService.createProduct(formData);
      await loadProducts();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating product:', error);
    }
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
            onClick={() => setShowForm(true)}
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
          <div className="product-grid">
            {products.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <h3>{t('admin.no_products', 'No hay productos')}</h3>
                <p>{t('admin.no_products_message', 'Comienza registrando productos en tu inventario')}</p>
              </div>
            ) : (
              products.map(product => (
                <div key={product.id} className={`product-card ${product.isLowStock() ? 'low-stock' : ''}`}>
                  <div className="product-header">
                    <h4>{product.name}</h4>
                    <span className="brand">{product.brand}</span>
                  </div>
                  <div className="product-info">
                    <p>{product.description}</p>
                    <div className="product-metrics">
                      <div className="metric">
                        <label>{t('admin.stock', 'Stock')}</label>
                        <span className={product.isLowStock() ? 'low' : 'normal'}>
                          {product.stock}
                        </span>
                      </div>
                      <div className="metric">
                        <label>{t('admin.sale_price', 'Precio Venta')}</label>
                        <span>${product.salePrice}</span>
                      </div>
                      <div className="metric">
                        <label>{t('admin.expiration', 'Vencimiento')}</label>
                        <span className={product.isNearExpiration() ? 'warning' : 'normal'}>
                          {product.expirationDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {product.isLowStock() && (
                    <div className="alert alert-warning">
                      {t('admin.low_stock_alert', 'Stock bajo')}
                    </div>
                  )}
                  {product.isNearExpiration() && (
                    <div className="alert alert-danger">
                      {t('admin.near_expiration_alert', 'Próximo a vencer')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-overlay" onClick={() => setShowForm(false)}></div>
          <div className="form-container">
            <div className="product-form">
              <h3>{t('admin.new_product', 'Nuevo Producto')}</h3>
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
                    <input name="name" type="text" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.product_brand', 'Marca')}</label>
                    <input name="brand" type="text" className="form-input" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('admin.product_description', 'Descripción')}</label>
                  <textarea name="description" className="form-input"></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.stock', 'Stock Inicial')}</label>
                    <input name="stock" type="number" min="0" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.low_stock_alert', 'Alerta Stock Bajo')}</label>
                    <input name="lowStockAlert" type="number" min="0" className="form-input" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.purchase_price', 'Precio Compra')}</label>
                    <input name="purchasePrice" type="number" step="0.01" min="0" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.sale_price', 'Precio Venta')}</label>
                    <input name="salePrice" type="number" step="0.01" min="0" className="form-input" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.expiration_date', 'Fecha de Vencimiento')}</label>
                    <input name="expirationDate" type="date" className="form-input" required />
                  </div>
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
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                    {t('common.cancel', 'Cancelar')}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {t('common.create', 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};