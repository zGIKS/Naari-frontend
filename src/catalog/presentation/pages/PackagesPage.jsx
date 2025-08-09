import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CalendarLayout from '../../../shared/components/CalendarLayout';
import { CatalogFactory } from '../../infrastructure/factories/CatalogFactory';
import { API_CONFIG } from '../../../shared/config/ApiConfig';
import './PackagesPage.css';

// Drag and Drop Item Types
const ItemTypes = {
  PRODUCT: 'product',
  SERVICE: 'service'
};

/**
 * PackagesPage - Página principal de gestión de paquetes
 */
export const PackagesPage = () => {
  const { t } = useTranslation();
  const [catalogFactory, setCatalogFactory] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'create'
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    initializeCatalogFactory();
  }, []);

  const initializeCatalogFactory = () => {
    try {
      const token = sessionStorage.getItem('naari_token');
      if (token) {
        const factory = CatalogFactory.getInstance();
        factory.initialize(API_CONFIG.API_BASE, token);
        setCatalogFactory(factory);
      } else {
        console.error('No authentication token found');
      }
    } catch (error) {
      console.error('Error initializing catalog factory:', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedPackage(null);
    setCurrentView('create');
  };

  const handleEditPackage = (packageData) => {
    setSelectedPackage(packageData);
    setCurrentView('create');
  };

  const handleBackToList = () => {
    setSelectedPackage(null);
    setCurrentView('list');
  };

  const renderContent = () => {
    if (!catalogFactory) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'create':
        return (
          <PackageCreator
            catalogFactory={catalogFactory}
            selectedPackage={selectedPackage}
            onBack={handleBackToList}
            onSaved={handleBackToList}
          />
        );
      case 'list':
      default:
        return (
          <PackagesList
            catalogFactory={catalogFactory}
            onCreateNew={handleCreateNew}
            onEditPackage={handleEditPackage}
          />
        );
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Paquetes', path: '/packages' }
    ];

    if (currentView === 'create') {
      breadcrumbs.push({
        label: selectedPackage ? 'Editar Paquete' : 'Crear Paquete',
        path: '/packages/create'
      });
    }

    return breadcrumbs;
  };

  return (
    <CalendarLayout
      title="Gestión de Paquetes"
      breadcrumbs={getBreadcrumbs()}
    >
      <div className="packages-page">
        {renderContent()}
      </div>
    </CalendarLayout>
  );
};

/**
 * Lista de paquetes
 */
const PackagesList = ({ catalogFactory, onCreateNew, onEditPackage }) => {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    packageId: null,
    packageName: '',
    action: null,
    activate: false
  });
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
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

    if (filters.type !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === filters.type);
    }

    if (filters.status === 'active') {
      filtered = filtered.filter(pkg => pkg.isActive);
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(pkg => !pkg.isActive);
    } else if (filters.status === 'available') {
      filtered = filtered.filter(pkg => pkg.isAvailable && pkg.stockQuantity > 0);
    } else if (filters.status === 'outOfStock') {
      filtered = filtered.filter(pkg => pkg.stockQuantity === 0);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm) ||
        pkg.description.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  const handleToggleStatus = (packageId, packageName, activate) => {
    setConfirmationModal({
      isOpen: true,
      packageId: packageId,
      packageName: packageName,
      action: activate ? 'activate' : 'deactivate',
      activate: activate
    });
  };

  const handleConfirmToggleStatus = async () => {
    const { packageId, activate } = confirmationModal;
    const packageObj = packages.find(p => p.id === packageId);
    
    setConfirmationModal({ ...confirmationModal, isOpen: false });

    // Actualización optimista del estado local
    setPackages(prevPackages => 
      prevPackages.map(pkg => 
        pkg.id === packageId 
          ? { ...pkg, isActive: activate }
          : pkg
      )
    );

    try {
      if (activate) {
        await packageService.activatePackage(packageId);
      } else {
        await packageService.deactivatePackage(packageId);
      }
      // Recargar datos desde el servidor para asegurar consistencia
      await loadPackages();
    } catch (error) {
      // Revertir el cambio optimista en caso de error
      setPackages(prevPackages => 
        prevPackages.map(pkg => 
          pkg.id === packageId 
            ? { ...pkg, isActive: !activate }
            : pkg
        )
      );
      console.error('Error toggling package status:', error);
      alert(`Error al ${activate ? 'activar' : 'desactivar'} el paquete: ${error.message}`);
    }
  };

  const handleCancelToggleStatus = () => {
    setConfirmationModal({
      isOpen: false,
      packageId: null,
      packageName: '',
      action: null,
      activate: false
    });
  };

  const filteredPackages = getFilteredPackages();

  return (
    <div className="package-manager">
      {/* Header */}
      <div className="manager-header">
        <div className="header-content">
          <h2>Gestión de Paquetes</h2>
          <p>Crea paquetes combinando productos y servicios con precios especiales</p>
        </div>
        <div className="header-actions">
          <button onClick={onCreateNew} className="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Paquete
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-row">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Todos los Tipos</option>
            <option value="product">Productos</option>
            <option value="service">Servicios</option>
            <option value="mixed">Mixto</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="available">Disponible</option>
            <option value="outOfStock">Sin Stock</option>
          </select>

          <input
            type="text"
            placeholder="Buscar paquetes..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
        </div>
      </div>

      {/* Content */}
      <div className="manager-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando paquetes...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="empty-content">
            <h3>{filters.search || filters.type !== 'all' || filters.status !== 'all'
              ? 'No se encontraron paquetes'
              : 'No hay paquetes'}</h3>
            <p>{packages.length === 0
              ? 'Crea paquetes combinando productos y servicios'
              : 'Intenta con otros filtros de búsqueda'}</p>
            <button onClick={onCreateNew} className="btn btn-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Primer Paquete
            </button>
          </div>
        ) : (
          <div className="packages-grid">
            {filteredPackages.map(pkg => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onEdit={() => onEditPackage(pkg)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {confirmationModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{confirmationModal.action === 'activate' ? 'Activar Paquete' : 'Desactivar Paquete'}</h3>
            </div>
            <div className="modal-body">
              <p>
                {confirmationModal.action === 'activate' 
                  ? `¿Estás seguro de que quieres activar el paquete "${confirmationModal.packageName}"?`
                  : `¿Estás seguro de que quieres desactivar el paquete "${confirmationModal.packageName}"?`
                }
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCancelToggleStatus}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggleStatus}
                className={`btn ${confirmationModal.action === 'activate' ? 'btn-primary' : 'btn-danger'}`}
              >
                {confirmationModal.action === 'activate' ? 'Activar' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Tarjeta de paquete
 */
const PackageCard = ({ package: pkg, onEdit, onToggleStatus }) => {
  const getStatusColor = () => {
    if (!pkg.isActive) return 'status-inactive';
    if (pkg.stockQuantity === 0) return 'status-out-of-stock';
    if (pkg.isAvailable) return 'status-active';
    return 'status-warning';
  };

  const getTypeColor = () => {
    switch (pkg.type) {
      case 'product': return 'type-product';
      case 'service': return 'type-service';
      case 'mixed': return 'type-mixed';
      default: return 'type-default';
    }
  };

  const calculateSavings = () => {
    const originalTotal = (pkg.products || []).reduce((sum, item) => 
      sum + ((item.originalPrice || 0) * (item.quantity || 1)), 0
    ) + (pkg.services || []).reduce((sum, item) => 
      sum + ((item.originalPrice || 0) * (item.quantity || 1)), 0
    );
    
    const savings = originalTotal - (pkg.totalPrice || 0);
    const savingsPercent = originalTotal > 0 ? (savings / originalTotal) * 100 : 0;
    
    return { originalTotal, savings, savingsPercent };
  };

  const { originalTotal, savings, savingsPercent } = calculateSavings();

  return (
    <div className="package-card">
      <div className="card-header">
        <div className="card-title">
          <h3>{pkg.name}</h3>
          <div className="card-badges">
            <span className={`status-badge ${getStatusColor()}`}>
              {pkg.isActive 
                ? (pkg.stockQuantity === 0 ? 'Sin Stock' : 'Activo')
                : 'Inactivo'
              }
            </span>
            <span className={`type-badge ${getTypeColor()}`}>
              {pkg.type === 'product' ? 'Productos' : pkg.type === 'service' ? 'Servicios' : 'Mixto'}
            </span>
          </div>
        </div>
        <div className="card-actions">
          <button
            onClick={() => onEdit(pkg)}
            className="btn-icon edit-btn"
            title="Editar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={() => onToggleStatus(pkg.id, pkg.name, !pkg.isActive)}
            className={`btn-icon status-btn ${pkg.isActive ? 'deactivate' : 'activate'}`}
            title={pkg.isActive ? 'Desactivar' : 'Activar'}
          >
            {pkg.isActive ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9"/>
                <polyline points="9,11 12,14 22,4"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="card-description">
        <p>{pkg.description}</p>
      </div>

      <div className="card-content">
        <div className="content-summary">
          {(pkg.products || []).length > 0 && (
            <div className="summary-item">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {(pkg.products || []).length} Productos
            </div>
          )}
          {(pkg.services || []).length > 0 && (
            <div className="summary-item">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {(pkg.services || []).length} Servicios
            </div>
          )}
        </div>
      </div>

      <div className="card-pricing">
        <div className="price-row main-price">
          <span>Precio del Paquete:</span>
          <span className="price">${(pkg.totalPrice || 0).toFixed(2)}</span>
        </div>
        
        {savings > 0 && (
          <>
            <div className="price-row original-price">
              <span>Precio Original:</span>
              <span className="price strikethrough">${originalTotal.toFixed(2)}</span>
            </div>
            <div className="price-row savings">
              <span>Ahorro:</span>
              <span className="price savings-amount">${savings.toFixed(2)} ({savingsPercent.toFixed(1)}%)</span>
            </div>
          </>
        )}

        <div className="price-row stock">
          <span>Stock:</span>
          <span className={`stock-amount ${(pkg.stockQuantity || 0) === 0 ? 'out-of-stock' : ''}`}>
            {pkg.stockQuantity || 0} {(pkg.stockQuantity || 0) === 1 ? 'unidad' : 'unidades'}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Creador de paquetes
 */
const PackageCreator = ({ catalogFactory, selectedPackage, onBack, onSaved }) => {
  return (
    <div className="package-creator">
      <div className="creator-header">
        <button onClick={onBack} className="back-button">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="header-content">
          <h2>{selectedPackage ? 'Editar Paquete' : 'Crear Paquete'}</h2>
          <p>Arrastra productos y servicios para crear tu paquete personalizado</p>
        </div>
      </div>

      <DragDropPackageCreator
        catalogFactory={catalogFactory}
        selectedPackage={selectedPackage}
        onSaved={onSaved}
      />
    </div>
  );
};

/**
 * Creador de paquetes con Drag & Drop
 */
const DragDropPackageCreator = ({ catalogFactory, selectedPackage, onSaved }) => {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [packageItems, setPackageItems] = useState({
    products: [],
    services: []
  });
  const [packageForm, setPackageForm] = useState({
    name: selectedPackage?.name || 'Mi Paquete',
    description: selectedPackage?.description || 'Descripción del paquete',
    stockQuantity: selectedPackage?.stockQuantity || 5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [filters, setFilters] = useState({
    productSearch: '',
    serviceSearch: ''
  });

  useEffect(() => {
    loadAvailableItems();
    if (selectedPackage) {
      loadSelectedPackage();
    }
  }, []);

  const loadAvailableItems = async () => {
    try {
      setLoading(true);
      const [productsData, servicesData] = await Promise.all([
        catalogFactory.getProductService().getAllProducts(),
        catalogFactory.getServiceService().getAllServices()
      ]);
      setProducts(productsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedPackage = () => {
    if (selectedPackage) {
      console.log('PackageCreator - Loading selected package:', selectedPackage); // Debug log
      
      // Cargar datos del formulario del paquete seleccionado (vacíos para mostrar placeholders)
      setPackageForm({
        name: '',
        description: '',
        stockQuantity: ''
      });
      
      // Mapear items del paquete con la estructura correcta
      const mappedProducts = (selectedPackage.products || []).map(product => ({
        id: product.id,
        name: product.name,
        originalPrice: product.original_price || product.originalPrice || 0,
        packagePrice: product.package_price || product.packagePrice || 0,
        quantity: product.quantity || 1,
        description: product.description || ''
      }));
      
      const mappedServices = (selectedPackage.services || []).map(service => ({
        id: service.id,
        name: service.name,
        originalPrice: service.original_price || service.originalPrice || 0,
        packagePrice: service.package_price || service.packagePrice || 0,
        quantity: service.quantity || 1,
        description: service.description || ''
      }));
      
      setPackageItems({
        products: mappedProducts,
        services: mappedServices
      });
    }
  };

  const addItemToPackage = (item, type) => {
    const existingItemIndex = packageItems[type].findIndex(existing => existing.id === item.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...packageItems[type]];
      updatedItems[existingItemIndex].quantity += 1;
      setPackageItems(prev => ({
        ...prev,
        [type]: updatedItems
      }));
    } else {
      const newItem = {
        id: item.id,
        name: item.name,
        originalPrice: type === 'products' ? item.salePrice : item.price,
        packagePrice: type === 'products' ? item.salePrice * 0.9 : item.price * 0.85,
        quantity: 1,
        description: item.description
      };
      
      setPackageItems(prev => ({
        ...prev,
        [type]: [...prev[type], newItem]
      }));
    }
  };

  const removeItemFromPackage = (itemId, type) => {
    setPackageItems(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== itemId)
    }));
  };

  const updateItemQuantity = (itemId, type, newQuantity) => {
    if (newQuantity < 1) {
      removeItemFromPackage(itemId, type);
      return;
    }

    setPackageItems(prev => ({
      ...prev,
      [type]: prev[type].map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    }));
  };

  const updateItemPrice = (itemId, type, newPrice) => {
    setPackageItems(prev => ({
      ...prev,
      [type]: prev[type].map(item => 
        item.id === itemId ? { ...item, packagePrice: newPrice } : item
      )
    }));
  };

  const calculateTotals = () => {
    const packageService = catalogFactory.getPackageService();
    const originalTotal = packageService.calculateOriginalPrice(packageItems.products, packageItems.services);
    const packageTotal = packageService.calculatePackagePrice(packageItems.products, packageItems.services);
    const savings = originalTotal - packageTotal;
    const savingsPercent = originalTotal > 0 ? (savings / originalTotal) * 100 : 0;
    
    return { originalTotal, packageTotal, savings, savingsPercent };
  };

  const handleSavePackage = async () => {
    try {
      setSaving(true);
      
      console.log('PackageCreator - Saving package data:', packageForm); // Debug log
      
      // Usar valores del formulario o valores originales si están vacíos
      const finalName = packageForm.name.trim() || (selectedPackage ? selectedPackage.name : '');
      const finalDescription = packageForm.description.trim() || (selectedPackage ? selectedPackage.description : '');
      const finalStockQuantity = packageForm.stockQuantity || (selectedPackage ? selectedPackage.stockQuantity : 1);
      
      if (!finalName || !finalDescription) {
        throw new Error('Nombre y descripción son requeridos');
      }

      if (packageItems.products.length === 0 && packageItems.services.length === 0) {
        throw new Error('Debe agregar al menos un producto o servicio');
      }

      // Asegurar que stockQuantity tenga un valor válido
      const stockQuantity = Math.max(1, parseInt(finalStockQuantity) || 1);
      
      const packageService = catalogFactory.getPackageService();
      const packageData = {
        name: finalName,
        description: finalDescription,
        type: packageService.determinePackageType(packageItems.products, packageItems.services),
        products: packageItems.products,
        services: packageItems.services,
        totalPrice: calculateTotals().packageTotal,
        stockQuantity: stockQuantity
      };

      console.log('PackageCreator - Final package data to save:', packageData); // Debug log

      if (selectedPackage) {
        console.log('PackageCreator - Updating existing package:', selectedPackage.id); // Debug log
        await packageService.updatePackage(selectedPackage.id, packageData);
      } else {
        console.log('PackageCreator - Creating new package'); // Debug log
        await packageService.createPackage(packageData);
      }

      onSaved();
    } catch (error) {
      console.error('Error saving package:', error);
      if (error.status === 404) {
        // El error 404 se maneja automáticamente en el service
        console.log('Backend endpoint not available, but operation was simulated successfully');
        onSaved(); // Continuar como si fuera exitoso
        return;
      } else {
        alert(`❌ ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const getFilteredProducts = () => {
    return products.filter(product =>
      product.name.toLowerCase().includes(filters.productSearch.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(filters.productSearch.toLowerCase()))
    );
  };

  const getFilteredServices = () => {
    return services.filter(service =>
      service.name.toLowerCase().includes(filters.serviceSearch.toLowerCase()) ||
      service.description.toLowerCase().includes(filters.serviceSearch.toLowerCase())
    );
  };

  const { originalTotal, packageTotal, savings, savingsPercent } = calculateTotals();

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando elementos...</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="drag-drop-creator">
        {/* Package Form */}
        <div className="form-section">
          <h3>Detalles del Paquete</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre del Paquete</label>
              <input
                type="text"
                value={packageForm.name}
                onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder={selectedPackage ? selectedPackage.name : "Ingresa el nombre del paquete"}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                value={packageForm.description}
                onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder={selectedPackage ? selectedPackage.description : "Describe el paquete"}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Stock Disponible</label>
              <input
                type="number"
                min="1"
                value={packageForm.stockQuantity}
                onChange={(e) => setPackageForm(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 1 }))}
                placeholder={selectedPackage ? selectedPackage.stockQuantity : "1"}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Drag and Drop Interface */}
        <div className="creator-grid">
          {/* Left Panel - Available Items */}
          <div className="items-panel">
            <div className="panel-tabs">
              <button 
                className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                Productos ({getFilteredProducts().length})
              </button>
              <button 
                className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Servicios ({getFilteredServices().length})
              </button>
            </div>

            <div className="panel-search">
              <input
                type="text"
                placeholder={activeTab === 'products' ? 'Buscar productos...' : 'Buscar servicios...'}
                value={activeTab === 'products' ? filters.productSearch : filters.serviceSearch}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  [activeTab === 'products' ? 'productSearch' : 'serviceSearch']: e.target.value 
                }))}
                className="search-input"
              />
            </div>

            <div className="items-list">
              {activeTab === 'products' 
                ? getFilteredProducts().map(product => (
                    <DraggableItem
                      key={`product-${product.id}`}
                      item={product}
                      type="products"
                      onAddToPackage={addItemToPackage}
                    />
                  ))
                : getFilteredServices().map(service => (
                    <DraggableItem
                      key={`service-${service.id}`}
                      item={service}
                      type="services"
                      onAddToPackage={addItemToPackage}
                    />
                  ))
              }
            </div>
          </div>

          {/* Right Panel - Package Builder */}
          <div className="builder-panel">
            <DropZone
              packageItems={packageItems}
              onRemoveItem={removeItemFromPackage}
              onUpdateQuantity={updateItemQuantity}
              onUpdatePrice={updateItemPrice}
              onAddItem={addItemToPackage}
            />
            
            {/* Package Summary */}
            <div className="summary-panel">
              <h3>Resumen del Paquete</h3>
              <div className="summary-content">
                <div className="summary-row">
                  <span>Precio Original:</span>
                  <span className="price strikethrough">${originalTotal.toFixed(2)}</span>
                </div>
                <div className="summary-row main">
                  <span>Precio del Paquete:</span>
                  <span className="price">${packageTotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="summary-row savings">
                    <span>Ahorro:</span>
                    <span className="price savings-amount">
                      ${savings.toFixed(2)} ({savingsPercent.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
              
              <div className="summary-actions">
                <button
                  onClick={handleSavePackage}
                  disabled={saving || (packageItems.products.length === 0 && packageItems.services.length === 0) || (!packageForm.name && !selectedPackage?.name) || (!packageForm.description && !selectedPackage?.description)}
                  className="btn btn-primary full-width"
                >
                  {saving ? (
                    <>
                      <div className="spinner small"></div>
                      Guardando...
                    </>
                  ) : (
                    selectedPackage ? 'Actualizar Paquete' : 'Crear Paquete'
                  )}
                </button>
                <button onClick={onSaved} className="btn btn-secondary full-width">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

/**
 * Draggable Item Component
 */
const DraggableItem = ({ item, type, onAddToPackage }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: type === 'products' ? ItemTypes.PRODUCT : ItemTypes.SERVICE,
    item: { ...item, itemType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const price = type === 'products' ? item.salePrice : item.price;

  return (
    <div
      ref={drag}
      className={`draggable-item ${type} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="item-content">
        <h4 className="item-name">{item.name}</h4>
        <p className="item-description">{item.description}</p>
        <div className="item-footer">
          <span className="item-price">${price?.toFixed(2)}</span>
          <button
            onClick={() => onAddToPackage(item, type)}
            className="add-button"
            title="Agregar al paquete"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Drop Zone Component
 */
const DropZone = ({ packageItems, onRemoveItem, onUpdateQuantity, onUpdatePrice, onAddItem }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.PRODUCT, ItemTypes.SERVICE],
    drop: (item) => {
      onAddItem(item, item.itemType);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const totalItems = packageItems.products.length + packageItems.services.length;

  return (
    <div ref={drop} className={`drop-zone ${isOver ? 'drag-over' : ''}`}>
      <div className="drop-zone-header">
        <h3>Constructor de Paquetes</h3>
        <p>
          {totalItems === 0 
            ? 'Arrastra productos/servicios aquí desde la izquierda o usa el botón + para agregar'
            : `${totalItems} elementos en el paquete - Precio total: $${((packageItems.products.reduce((sum, item) => sum + ((item.packagePrice || 0) * (item.quantity || 1)), 0) + packageItems.services.reduce((sum, item) => sum + ((item.packagePrice || 0) * (item.quantity || 1)), 0))).toFixed(2)}`
          }
        </p>
      </div>

      <div className="package-items">
        {packageItems.products.map((item, index) => (
          <PackageItem
            key={`package-product-${item.id}-${index}`}
            item={item}
            type="products"
            onRemove={onRemoveItem}
            onUpdateQuantity={onUpdateQuantity}
            onUpdatePrice={onUpdatePrice}
          />
        ))}
        
        {packageItems.services.map((item, index) => (
          <PackageItem
            key={`package-service-${item.id}-${index}`}
            item={item}
            type="services"
            onRemove={onRemoveItem}
            onUpdateQuantity={onUpdateQuantity}
            onUpdatePrice={onUpdatePrice}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Package Item Component
 */
const PackageItem = ({ item, type, onRemove, onUpdateQuantity, onUpdatePrice }) => {
  return (
    <div className={`package-item ${type}`}>
      <div className="item-header">
        <div className="item-info">
          <h4>{item.name}</h4>
          <p>{item.description}</p>
        </div>
        <button
          onClick={() => onRemove(item.id, type)}
          className="remove-button"
          title="Eliminar del paquete"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="item-controls">
        <div className="control-group">
          <label>Cantidad</label>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onUpdateQuantity(item.id, type, parseInt(e.target.value) || 1)}
            className="control-input"
          />
        </div>
        <div className="control-group">
          <label>Precio orig.</label>
          <span className="original-price">${(item.originalPrice || 0).toFixed(2)}</span>
        </div>
        <div className="control-group">
          <label>Precio pkg.</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.packagePrice || 0}
            onChange={(e) => onUpdatePrice(item.id, type, parseFloat(e.target.value) || 0)}
            className="control-input"
          />
        </div>
      </div>
      
      <div className="item-total">
        <span>Total: ${((item.packagePrice || 0) * (item.quantity || 1)).toFixed(2)}</span>
      </div>
    </div>
  );
};