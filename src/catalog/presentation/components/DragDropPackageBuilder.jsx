import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Spinner from '../../../shared/components/Spinner';

/**
 * DragDropPackageBuilder - Constructor de paquetes con drag and drop
 */
export const DragDropPackageBuilder = ({ 
  catalogFactory, 
  onPackageChange,
  initialPackage = null 
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [packageItems, setPackageItems] = useState({
    products: initialPackage?.products || [],
    services: initialPackage?.services || []
  });
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'product', 'service'
    search: ''
  });
  const [loading, setLoading] = useState(false);

  const productService = catalogFactory.getProductService();
  const serviceService = catalogFactory.getServiceService();

  useEffect(() => {
    loadAvailableItems();
  }, [loadAvailableItems]);

  useEffect(() => {
    // Notificar cambios en el paquete
    if (onPackageChange) {
      onPackageChange(packageItems);
    }
  }, [packageItems, onPackageChange]);

  const loadAvailableItems = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, servicesData] = await Promise.all([
        productService.getAllProducts(),
        serviceService.getAllServices()
      ]);
      
      setProducts(productsData.filter(p => p.stock > 0));
      setServices(servicesData.filter(s => s.isActive));
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  }, [productService, serviceService]);

  const handleAddToPackage = (item, type) => {
    setPackageItems(prev => {
      const existingIndex = prev[type].findIndex(pkg => pkg.id === item.id);
      
      if (existingIndex >= 0) {
        // Incrementar cantidad si ya existe
        const updated = [...prev[type]];
        updated[existingIndex].quantity += 1;
        return { ...prev, [type]: updated };
      } else {
        // Agregar nuevo item
        const packagePrice = type === 'products' ? item.salePrice : item.getFinalPrice();
        const newItem = {
          id: item.id,
          name: item.name,
          originalPrice: packagePrice,
          packagePrice: packagePrice,
          quantity: 1
        };
        return { ...prev, [type]: [...prev[type], newItem] };
      }
    });
  };

  const handleRemoveFromPackage = (itemId, type) => {
    setPackageItems(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== itemId)
    }));
  };

  const handleQuantityChange = (itemId, type, newQuantity) => {
    if (newQuantity < 1) return;
    
    setPackageItems(prev => {
      const updated = [...prev[type]];
      const itemIndex = updated.findIndex(item => item.id === itemId);
      if (itemIndex >= 0) {
        updated[itemIndex].quantity = newQuantity;
      }
      return { ...prev, [type]: updated };
    });
  };

  const handlePriceChange = (itemId, type, newPrice) => {
    if (newPrice < 0) return;
    
    setPackageItems(prev => {
      const updated = [...prev[type]];
      const itemIndex = updated.findIndex(item => item.id === itemId);
      if (itemIndex >= 0) {
        updated[itemIndex].packagePrice = newPrice;
      }
      return { ...prev, [type]: updated };
    });
  };

  const getFilteredItems = () => {
    let allItems = [];
    
    if (filters.type === 'all' || filters.type === 'product') {
      allItems.push(...products.map(p => ({ ...p, type: 'products' })));
    }
    
    if (filters.type === 'all' || filters.type === 'service') {
      allItems.push(...services.map(s => ({ ...s, type: 'services' })));
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      allItems = allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
      );
    }

    return allItems;
  };

  const calculateTotals = () => {
    const productTotal = packageItems.products.reduce((sum, item) => 
      sum + (item.packagePrice * item.quantity), 0
    );
    const serviceTotal = packageItems.services.reduce((sum, item) => 
      sum + (item.packagePrice * item.quantity), 0
    );
    const originalTotal = packageItems.products.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0
    ) + packageItems.services.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0
    );
    
    const packageTotal = productTotal + serviceTotal;
    const savings = originalTotal - packageTotal;
    const savingsPercent = originalTotal > 0 ? (savings / originalTotal) * 100 : 0;

    return { originalTotal, packageTotal, savings, savingsPercent };
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="package-builder">
        <div className="package-builder-layout">
          {/* Panel izquierdo - Items disponibles */}
          <div className="available-items-panel">
            <div className="panel-header">
              <h3>{t('packages.availableItems')}</h3>
              
              {/* Filtros */}
              <div className="filters">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="filter-select"
                >
                  <option value="all">{t('packages.allItems')}</option>
                  <option value="product">{t('packages.products')}</option>
                  <option value="service">{t('packages.services')}</option>
                </select>
                
                <input
                  type="text"
                  placeholder={t('packages.searchItems')}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="search-input"
                />
              </div>
            </div>

            <div className="items-list">
              {loading ? (
                <Spinner size="sm" />
              ) : (
                getFilteredItems().map(item => (
                  <DraggableItem
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onAddToPackage={handleAddToPackage}
                  />
                ))
              )}
            </div>
          </div>

          {/* Panel derecho - Contenido del paquete */}
          <div className="package-content-panel">
            <div className="panel-header">
              <h3>{t('packages.packageContent')}</h3>
            </div>

            <PackageDropZone
              packageItems={packageItems}
              onRemoveItem={handleRemoveFromPackage}
              onQuantityChange={handleQuantityChange}
              onPriceChange={handlePriceChange}
              totals={calculateTotals()}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

/**
 * Item que puede ser arrastrado
 */
const DraggableItem = ({ item, onAddToPackage }) => {
  const { t } = useTranslation();
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CATALOG_ITEM',
    item: { ...item },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onAddToPackage(item, item.type);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const price = item.type === 'products' ? item.salePrice : item.getFinalPrice();
  
  return (
    <div
      ref={drag}
      className={`draggable-item ${isDragging ? 'dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="item-info">
        <div className="item-name">{item.name}</div>
        <div className="item-type">
          {item.type === 'products' ? t('packages.product') : t('packages.service')}
        </div>
        <div className="item-price">${price}</div>
        {item.type === 'products' && (
          <div className="item-stock">{t('packages.stock')}: {item.stock}</div>
        )}
      </div>
      
      <button
        className="add-button"
        onClick={() => onAddToPackage(item, item.type)}
      >
        +
      </button>
    </div>
  );
};

/**
 * Zona donde se sueltan los items del paquete
 */
const PackageDropZone = ({ 
  packageItems, 
  onRemoveItem, 
  onQuantityChange, 
  onPriceChange, 
  totals 
}) => {
  const { t } = useTranslation();
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CATALOG_ITEM',
    drop: () => ({ name: 'package' }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const hasItems = packageItems.products.length > 0 || packageItems.services.length > 0;

  return (
    <div
      ref={drop}
      className={`package-drop-zone ${isOver ? 'drag-over' : ''}`}
    >
      {!hasItems ? (
        <div className="empty-package">
          <p>{t('packages.dragItemsHere')}</p>
          <p className="hint">{t('packages.dragHint')}</p>
        </div>
      ) : (
        <div className="package-items">
          {/* Productos en el paquete */}
          {packageItems.products.length > 0 && (
            <div className="package-section">
              <h4>{t('packages.products')}</h4>
              {packageItems.products.map(item => (
                <PackageItem
                  key={`product-${item.id}`}
                  item={item}
                  type="products"
                  onRemove={onRemoveItem}
                  onQuantityChange={onQuantityChange}
                  onPriceChange={onPriceChange}
                />
              ))}
            </div>
          )}

          {/* Servicios en el paquete */}
          {packageItems.services.length > 0 && (
            <div className="package-section">
              <h4>{t('packages.services')}</h4>
              {packageItems.services.map(item => (
                <PackageItem
                  key={`service-${item.id}`}
                  item={item}
                  type="services"
                  onRemove={onRemoveItem}
                  onQuantityChange={onQuantityChange}
                  onPriceChange={onPriceChange}
                />
              ))}
            </div>
          )}

          {/* Resumen de totales */}
          <div className="package-totals">
            <div className="totals-row">
              <span>{t('packages.originalTotal')}: ${totals.originalTotal.toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>{t('packages.packageTotal')}: ${totals.packageTotal.toFixed(2)}</span>
            </div>
            {totals.savings > 0 && (
              <div className="totals-row savings">
                <span>{t('packages.savings')}: ${totals.savings.toFixed(2)} ({totals.savingsPercent.toFixed(1)}%)</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Item individual dentro del paquete
 */
const PackageItem = ({ item, type, onRemove, onQuantityChange, onPriceChange }) => {
  const { t } = useTranslation();

  return (
    <div className="package-item">
      <div className="item-info">
        <div className="item-name">{item.name}</div>
        <div className="item-controls">
          <label>
            {t('packages.quantity')}:
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => onQuantityChange(item.id, type, parseInt(e.target.value) || 1)}
              className="quantity-input"
            />
          </label>
          
          <label>
            {t('packages.price')}:
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.packagePrice}
              onChange={(e) => onPriceChange(item.id, type, parseFloat(e.target.value) || 0)}
              className="price-input"
            />
          </label>
        </div>
        
        <div className="item-totals">
          <span className="original-total">
            {t('packages.originalTotal')}: ${(item.originalPrice * item.quantity).toFixed(2)}
          </span>
          <span className="package-total">
            {t('packages.packageTotal')}: ${(item.packagePrice * item.quantity).toFixed(2)}
          </span>
          {item.originalPrice > item.packagePrice && (
            <span className="savings">
              {t('packages.savings')}: ${((item.originalPrice - item.packagePrice) * item.quantity).toFixed(2)}
            </span>
          )}
        </div>
      </div>
      
      <button
        className="remove-button"
        onClick={() => onRemove(item.id, type)}
      >
        ✕
      </button>
    </div>
  );
};