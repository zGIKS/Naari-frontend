import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CalendarLayout from '../../../shared/components/CalendarLayout';
import { CategoryManager } from '../components/CategoryManager';
import { ProductManager } from '../components/ProductManager';
import { ServiceManager } from '../components/ServiceManager';
import { CatalogMenu } from '../components/CatalogMenu';
import { NewCategoryPage } from './NewCategoryPage';
import { NewServicePage } from './NewServicePage';
import { NewProductPage } from './NewProductPage';
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
  const [activeSection, setActiveSection] = useState('categories');
  const [catalogFactory, setCatalogFactory] = useState(null);

  // Detectar si es una ruta de formulario específica
  const currentPath = location.pathname;
  const isNewCategoryPage = currentPath.includes('/catalog/categories/new') || currentPath.includes('/catalog/categories/edit');
  const isNewServicePage = currentPath.includes('/catalog/services/new') || currentPath.includes('/catalog/services/edit');
  const isNewProductPage = currentPath.includes('/catalog/products/new') || currentPath.includes('/catalog/products/edit');

  // Manejar navegación por parámetros de ruta
  useEffect(() => {
    if (section && ['categories', 'services', 'products'].includes(section)) {
      setActiveSection(section);
    } else if (!isNewCategoryPage && !isNewServicePage && !isNewProductPage) {
      // Redireccionar a categorías por defecto si la sección no es válida y no es una página de formulario
      navigate('/catalog/categories', { replace: true });
    }
  }, [section, navigate, isNewCategoryPage, isNewServicePage, isNewProductPage]);

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

    // Renderizar páginas de formularios específicas
    if (isNewCategoryPage) {
      return <NewCategoryPage catalogFactory={catalogFactory} />;
    }
    if (isNewServicePage) {
      return <NewServicePage catalogFactory={catalogFactory} />;
    }
    if (isNewProductPage) {
      return <NewProductPage catalogFactory={catalogFactory} />;
    }

    // Renderizar managers por defecto
    switch (activeSection) {
      case 'categories':
        return <CategoryManager catalogFactory={catalogFactory} />;
      case 'services':
        return <ServiceManager catalogFactory={catalogFactory} />;
      case 'products':
        return <ProductManager catalogFactory={catalogFactory} />;
      default:
        return <CategoryManager catalogFactory={catalogFactory} />;
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
        {!isNewCategoryPage && !isNewServicePage && !isNewProductPage && (
          <>
            <div className="catalog-header">
              <h1>{t('navigation.catalog', 'Catálogo')}</h1>
            </div>

            <CatalogMenu 
              activeSection={activeSection} 
              onSectionChange={handleSectionChange} 
            />
          </>
        )}

        <div className="catalog-content">
          {renderActiveComponent()}
        </div>
      </div>
    </CalendarLayout>
  );
};