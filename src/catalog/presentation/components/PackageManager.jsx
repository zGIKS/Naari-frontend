import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';

/**
 * PackageManager - Gestor de paquetes
 */
export const PackageManager = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    packageId: null,
    packageName: '',
    action: null
  });

  const packageService = catalogFactory.getPackageService();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await packageService.getAllPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPackages = () => {
    let filtered = packages;

    // Filtrar por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === filters.type);
    }

    // Filtrar por estado
    if (filters.status === 'active') {
      filtered = filtered.filter(pkg => pkg.isActive);
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(pkg => !pkg.isActive);
    } else if (filters.status === 'available') {
      filtered = filtered.filter(pkg => pkg.isAvailable && pkg.stockQuantity > 0);
    } else if (filters.status === 'outOfStock') {
      filtered = filtered.filter(pkg => pkg.stockQuantity === 0);
    }

    // Filtrar por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm) ||
        pkg.description.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  const handleActivatePackage = async (packageId) => {
    try {
      await packageService.activatePackage(packageId);
      await loadPackages();
    } catch (error) {
      console.error('Error activating package:', error);
    }
  };

  const handleDeactivatePackage = async (packageId) => {
    try {
      await packageService.deactivatePackage(packageId);
      await loadPackages();
    } catch (error) {
      console.error('Error deactivating package:', error);
    }
  };

  const handleDeletePackage = async (packageId) => {
    try {
      await packageService.deletePackage(packageId);
      await loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const handleStockUpdate = async (packageId, newStock) => {
    try {
      await packageService.updatePackageStock(packageId, newStock);
      await loadPackages();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const openConfirmModal = (type, packageId, packageName, action) => {
    setConfirmModal({
      isOpen: true,
      type,
      packageId,
      packageName,
      action
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      packageId: null,
      packageName: '',
      action: null
    });
  };

  const handleConfirmAction = async () => {
    const { action, packageId } = confirmModal;
    
    try {
      await action(packageId);
      closeConfirmModal();
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  const getConfirmMessage = () => {
    const { type, packageName } = confirmModal;
    
    switch (type) {
      case 'activate':
        return t('packages.confirmActivate', { name: packageName });
      case 'deactivate':
        return t('packages.confirmDeactivate', { name: packageName });
      case 'delete':
        return t('packages.confirmDelete', { name: packageName });
      default:
        return '';
    }
  };

  const filteredPackages = getFilteredPackages();

  return (
    <div className="package-manager">
      <div className="package-manager-header">
        <h2>{t('packages.title')}</h2>
        <button className="btn btn-primary">
          {t('packages.createNew')}
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-row">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="filter-select"
          >
            <option value="all">{t('packages.allTypes')}</option>
            <option value="product">{t('packages.types.product')}</option>
            <option value="service">{t('packages.types.service')}</option>
            <option value="mixed">{t('packages.types.mixed')}</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">{t('packages.allStatuses')}</option>
            <option value="active">{t('packages.statuses.active')}</option>
            <option value="inactive">{t('packages.statuses.inactive')}</option>
            <option value="available">{t('packages.statuses.available')}</option>
            <option value="outOfStock">{t('packages.statuses.outOfStock')}</option>
          </select>

          <input
            type="text"
            placeholder={t('packages.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
        </div>
      </div>

      {/* Lista de paquetes */}
      <div className="packages-section">
        {loading ? (
          <div className="loading-message">{t('common.loading')}</div>
        ) : filteredPackages.length === 0 ? (
          <div className="empty-message">
            {filters.search || filters.type !== 'all' || filters.status !== 'all'
              ? t('packages.noPackagesFound')
              : t('packages.noPackages')}
          </div>
        ) : (
          <div className="packages-grid">
            {filteredPackages.map(pkg => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onActivate={() => openConfirmModal('activate', pkg.id, pkg.name, handleActivatePackage)}
                onDeactivate={() => openConfirmModal('deactivate', pkg.id, pkg.name, handleDeactivatePackage)}
                onDelete={() => openConfirmModal('delete', pkg.id, pkg.name, handleDeletePackage)}
                onStockUpdate={handleStockUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={t('packages.confirmAction')}
        message={getConfirmMessage()}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

/**
 * Tarjeta individual de paquete
 */
const PackageCard = ({ package: pkg, onActivate, onDeactivate, onDelete, onStockUpdate }) => {
  const { t } = useTranslation();
  const [editingStock, setEditingStock] = useState(false);
  const [newStock, setNewStock] = useState(pkg.stockQuantity);

  const handleStockSave = () => {
    onStockUpdate(pkg.id, newStock);
    setEditingStock(false);
  };

  const handleStockCancel = () => {
    setNewStock(pkg.stockQuantity);
    setEditingStock(false);
  };

  const getStatusBadge = () => {
    if (!pkg.isActive) {
      return <span className="status-badge inactive">{t('packages.statuses.inactive')}</span>;
    }
    if (pkg.stockQuantity === 0) {
      return <span className="status-badge out-of-stock">{t('packages.statuses.outOfStock')}</span>;
    }
    if (pkg.isAvailable) {
      return <span className="status-badge available">{t('packages.statuses.available')}</span>;
    }
    return <span className="status-badge active">{t('packages.statuses.active')}</span>;
  };

  const calculateTotals = () => {
    const originalTotal = pkg.products.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0
    ) + pkg.services.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0
    );
    
    const savings = originalTotal - pkg.totalPrice;
    const savingsPercent = originalTotal > 0 ? (savings / originalTotal) * 100 : 0;
    
    return { originalTotal, savings, savingsPercent };
  };

  const totals = calculateTotals();

  return (
    <div className="package-card">
      <div className="package-card-header">
        <div className="package-title">
          <h3>{pkg.name}</h3>
          <div className="package-badges">
            {getStatusBadge()}
            <span className="type-badge">{t(`packages.types.${pkg.type}`)}</span>
          </div>
        </div>
      </div>

      <div className="package-card-body">
        <p className="package-description">{pkg.description}</p>

        <div className="package-content">
          <div className="content-summary">
            {pkg.products.length > 0 && (
              <span className="content-item">
                {pkg.products.length} {t('packages.products')}
              </span>
            )}
            {pkg.services.length > 0 && (
              <span className="content-item">
                {pkg.services.length} {t('packages.services')}
              </span>
            )}
          </div>
        </div>

        <div className="package-pricing">
          <div className="price-row">
            <span className="label">{t('packages.packagePrice')}:</span>
            <span className="price main-price">${pkg.totalPrice.toFixed(2)}</span>
          </div>
          
          {totals.savings > 0 && (
            <>
              <div className="price-row">
                <span className="label">{t('packages.originalPrice')}:</span>
                <span className="price original-price">${totals.originalTotal.toFixed(2)}</span>
              </div>
              <div className="price-row savings">
                <span className="label">{t('packages.savings')}:</span>
                <span className="savings-amount">
                  ${totals.savings.toFixed(2)} ({totals.savingsPercent.toFixed(1)}%)
                </span>
              </div>
            </>
          )}
        </div>

        <div className="package-stock">
          {editingStock ? (
            <div className="stock-editor">
              <input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                className="stock-input"
              />
              <button onClick={handleStockSave} className="btn btn-sm btn-primary">
                ✓
              </button>
              <button onClick={handleStockCancel} className="btn btn-sm btn-secondary">
                ✕
              </button>
            </div>
          ) : (
            <div className="stock-display" onClick={() => setEditingStock(true)}>
              <span className="label">{t('packages.stock')}:</span>
              <span className={`stock-value ${pkg.stockQuantity === 0 ? 'out-of-stock' : ''}`}>
                {pkg.stockQuantity}
              </span>
              <button className="edit-stock-btn">✏️</button>
            </div>
          )}
        </div>
      </div>

      <div className="package-card-actions">
        <button className="btn btn-sm btn-secondary">
          {t('common.edit')}
        </button>
        
        {pkg.isActive ? (
          <button 
            onClick={onDeactivate} 
            className="btn btn-sm btn-warning"
          >
            {t('packages.deactivate')}
          </button>
        ) : (
          <button 
            onClick={onActivate} 
            className="btn btn-sm btn-success"
          >
            {t('packages.activate')}
          </button>
        )}
        
        <button 
          onClick={onDelete} 
          className="btn btn-sm btn-danger"
        >
          {t('common.delete')}
        </button>
      </div>

      <div className="package-card-footer">
        <small className="created-date">
          {t('packages.createdAt')}: {new Date(pkg.createdAt).toLocaleDateString()}
        </small>
        {pkg.createdBy && (
          <small className="created-by">
            {t('packages.createdBy')}: {pkg.createdBy}
          </small>
        )}
      </div>
    </div>
  );
};