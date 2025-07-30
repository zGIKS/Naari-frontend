import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../shared/components/DashboardLayout';
import { BranchManager } from '../components/BranchManager';
import { CategoryManager } from '../components/CategoryManager';
import { ProductManager } from '../components/ProductManager';
import { ServiceManager } from '../components/ServiceManager';
import { CatalogFactory } from '../../infrastructure/factories/CatalogFactory';
import { API_CONFIG } from '../../../shared/config/ApiConfig';

// Icons
const BranchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const CategoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ProductIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="7.5,4.21 12,6.81 16.5,4.21"/>
    <polyline points="7.5,19.79 7.5,14.6 3,12"/>
    <polyline points="21,12 16.5,14.6 16.5,19.79"/>
  </svg>
);

const ServiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

/**
 * AdminDashboard - Panel principal de administración
 * Implementa el patrón State para manejar las pestañas
 */
export const AdminDashboard = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('branches');
  const [catalogFactory, setCatalogFactory] = useState(null);

  // Manejar navegación por hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['branches', 'categories', 'products', 'services'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  useEffect(() => {
    // Inicializar el factory con el token actual
    const token = sessionStorage.getItem('naari_token');
    if (token) {
      const factory = CatalogFactory.getInstance();
      factory.initialize(API_CONFIG.API_BASE, token);
      setCatalogFactory(factory);
    }
  }, []);

  const tabs = [
    {
      id: 'branches',
      name: t('admin.branches', 'Sucursales'),
      icon: <BranchIcon />,
      component: BranchManager
    },
    {
      id: 'categories',
      name: t('admin.categories', 'Categorías'),
      icon: <CategoryIcon />,
      component: CategoryManager
    },
    {
      id: 'products',
      name: t('admin.products', 'Productos'),
      icon: <ProductIcon />,
      component: ProductManager
    },
    {
      id: 'services',
      name: t('admin.services', 'Servicios'),
      icon: <ServiceIcon />,
      component: ServiceManager
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin#${tabId}`);
  };

  const renderActiveComponent = () => {
    const activeTabInfo = tabs.find(tab => tab.id === activeTab);
    if (!activeTabInfo || !catalogFactory) {
      return <div className="loading">Cargando...</div>;
    }

    const Component = activeTabInfo.component;
    return <Component catalogFactory={catalogFactory} />;
  };

  if (!catalogFactory) {
    return (
      <DashboardLayout>
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>{t('common.loading', 'Cargando...')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>{t('admin.dashboard_title', 'Panel de Administración')}</h1>
          <p>{t('admin.dashboard_subtitle', 'Gestiona sucursales, categorías, productos y servicios')}</p>
        </div>

        <nav className="admin-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="admin-content">
          {renderActiveComponent()}
        </div>
      </div>
    </DashboardLayout>
  );
};