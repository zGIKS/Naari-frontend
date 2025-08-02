import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CalendarLayout from '../../../shared/components/CalendarLayout';
import { CategoryManager } from '../components/CategoryManager';
import { ProductManager } from '../components/ProductManager';
import { ServiceManager } from '../components/ServiceManager';
import { CatalogMenu } from '../components/CatalogMenu';
import { CatalogFactory } from '../../infrastructure/factories/CatalogFactory';
import { API_CONFIG } from '../../../shared/config/ApiConfig';

/**
 * CatalogPage - Página principal del catálogo con navegación por secciones
 */
export const CatalogPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { section } = useParams();
  const [activeSection, setActiveSection] = useState('services');
  const [catalogFactory, setCatalogFactory] = useState(null);

  // Manejar navegación por parámetros de ruta
  useEffect(() => {
    if (section && ['service-categories', 'services', 'product-categories', 'products'].includes(section)) {
      setActiveSection(section);
    } else {
      // Redireccionar a servicios por defecto si la sección no es válida
      navigate('/catalog/services', { replace: true });
    }
  }, [section, navigate]);

  useEffect(() => {
    // Inicializar el factory con el token actual
    const token = sessionStorage.getItem('naari_token');
    if (token) {
      const factory = CatalogFactory.getInstance();
      factory.initialize(API_CONFIG.API_BASE, token);
      setCatalogFactory(factory);
    }
  }, []);

  const handleSectionChange = (newSection) => {
    setActiveSection(newSection);
    navigate(`/catalog/${newSection}`);
  };

  const renderActiveComponent = () => {
    if (!catalogFactory) {
      return <div className="loading">{t('common.loading', 'Cargando...')}</div>;
    }

    switch (activeSection) {
      case 'service-categories':
        return <CategoryManager catalogFactory={catalogFactory} categoryType="service" />;
      case 'services':
        return <ServiceManager catalogFactory={catalogFactory} />;
      case 'product-categories':
        return <CategoryManager catalogFactory={catalogFactory} categoryType="product" />;
      case 'products':
        return <ProductManager catalogFactory={catalogFactory} />;
      default:
        return <ServiceManager catalogFactory={catalogFactory} />;
    }
  };

  if (!catalogFactory) {
    return (
      <CalendarLayout>
        <div className="catalog-loading">
          <div className="spinner"></div>
          <p>{t('common.loading', 'Cargando...')}</p>
        </div>
      </CalendarLayout>
    );
  }

  return (
    <CalendarLayout>
      <div className="catalog-page">
        <div className="catalog-header">
          <h1>{t('navigation.catalog', 'Catálogo')}</h1>
          <p>{t('admin.catalog_subtitle', 'Gestiona servicios, productos y sus categorías')}</p>
        </div>

        <CatalogMenu 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />

        <div className="catalog-content">
          {renderActiveComponent()}
        </div>
      </div>
    </CalendarLayout>
  );
};