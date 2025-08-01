import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Icons
const CatalogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const ServiceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const ProductIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="7.5,4.21 12,6.81 16.5,4.21"/>
    <polyline points="7.5,19.79 7.5,14.6 3,12"/>
    <polyline points="21,12 16.5,14.6 16.5,19.79"/>
  </svg>
);

const CategoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

/**
 * CatalogMenu - Componente de menú de catálogo con navegación anidada
 */
export const CatalogMenu = ({ activeSection, onSectionChange }) => {
  const { t } = useTranslation();
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);

  const handleServiceToggle = () => {
    setIsServicesExpanded(!isServicesExpanded);
    if (!isServicesExpanded) {
      setIsProductsExpanded(false);
    }
  };

  const handleProductToggle = () => {
    setIsProductsExpanded(!isProductsExpanded);
    if (!isProductsExpanded) {
      setIsServicesExpanded(false);
    }
  };

  const handleSectionClick = (section) => {
    onSectionChange(section);
  };

  return (
    <div className="catalog-menu">
      <div className="catalog-menu-header">
        <CatalogIcon />
        <h3>{t('admin.catalog', 'Catálogo')}</h3>
        <p className="catalog-subtitle">{t('admin.catalog_subtitle', 'Gestiona servicios, productos y sus categorías')}</p>
      </div>

      <nav className="catalog-nav">
        {/* Sección de Servicios */}
        <div className="catalog-nav-section">
          <button 
            className={`catalog-nav-main ${isServicesExpanded ? 'expanded' : ''}`}
            onClick={handleServiceToggle}
          >
            <div className="nav-main-content">
              <ServiceIcon />
              <span>{t('admin.services', 'Servicios')}</span>
            </div>
            {isServicesExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </button>
          
          {isServicesExpanded && (
            <div className="catalog-nav-submenu">
              <button 
                className={`catalog-nav-item ${activeSection === 'service-categories' ? 'active' : ''}`}
                onClick={() => handleSectionClick('service-categories')}
              >
                <CategoryIcon />
                <div className="nav-item-content">
                  <span>{t('admin.service_categories', 'Categorías de Servicios')}</span>
                  <small>{t('admin.create_category', 'Crear Categoría')} / {t('admin.view_categories', 'Ver Categorías')}</small>
                </div>
              </button>
              
              <button 
                className={`catalog-nav-item ${activeSection === 'services' ? 'active' : ''}`}
                onClick={() => handleSectionClick('services')}
              >
                <ServiceIcon />
                <div className="nav-item-content">
                  <span>{t('admin.services', 'Servicios')}</span>
                  <small>{t('admin.register_service', 'Registrar Servicio')} / {t('admin.list_services', 'Listar Servicios')}</small>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Sección de Productos */}
        <div className="catalog-nav-section">
          <button 
            className={`catalog-nav-main ${isProductsExpanded ? 'expanded' : ''}`}
            onClick={handleProductToggle}
          >
            <div className="nav-main-content">
              <ProductIcon />
              <span>{t('admin.products', 'Productos')}</span>
            </div>
            {isProductsExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </button>
          
          {isProductsExpanded && (
            <div className="catalog-nav-submenu">
              <button 
                className={`catalog-nav-item ${activeSection === 'product-categories' ? 'active' : ''}`}
                onClick={() => handleSectionClick('product-categories')}
              >
                <CategoryIcon />
                <div className="nav-item-content">
                  <span>{t('admin.product_categories', 'Categorías de Productos')}</span>
                  <small>{t('admin.create_category', 'Crear Categoría')} / {t('admin.view_categories', 'Ver Categorías')}</small>
                </div>
              </button>
              
              <button 
                className={`catalog-nav-item ${activeSection === 'products' ? 'active' : ''}`}
                onClick={() => handleSectionClick('products')}
              >
                <ProductIcon />
                <div className="nav-item-content">
                  <span>{t('admin.products', 'Productos')}</span>
                  <small>{t('admin.register_product', 'Registrar Producto')} / {t('admin.view_products', 'Ver Productos')}</small>
                </div>
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};