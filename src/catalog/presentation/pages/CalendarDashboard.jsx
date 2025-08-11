import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import CalendarLayout from '../../../shared/components/CalendarLayout';
import Spinner from '../../../shared/components/Spinner';
import { BranchManager } from '../components/BranchManager';
import { UserManager } from '../../../clients/presentation/components/UserManager';
import { CatalogFactory } from '../../infrastructure/factories/CatalogFactory';
import { UserFactory } from '../../../clients/infrastructure/factories/UserFactory';
import { API_CONFIG } from '../../../shared/config/ApiConfig';


/**
 * AdminCalendar - Panel principal de administración
 * Implementa el patrón State para manejar las pestañas
 */
export const AdminCalendar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('branches');
  const [catalogFactory, setCatalogFactory] = useState(null);
  const [userFactory, setUserFactory] = useState(null);

  // Manejar navegación por hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['branches', 'users'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  useEffect(() => {
    // Inicializar factories con el token actual
    const token = localStorage.getItem('naari_auth_token');
    if (token) {
      const catalogFactory = CatalogFactory.getInstance();
      catalogFactory.initialize(API_CONFIG.API_BASE, token);
      setCatalogFactory(catalogFactory);

      const userFactory = UserFactory.getInstance();
      userFactory.initialize(API_CONFIG.API_BASE, token);
      setUserFactory(userFactory);
    }
  }, []);

  const tabs = [
    {
      id: 'branches',
      name: t('admin.branches', 'Sucursales'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      )
    },
    {
      id: 'users',
      name: t('admin.users', 'Empleados'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin#${tabId}`);
  };

  const renderActiveComponent = () => {
    if (!catalogFactory || !userFactory) {
      return (
        <div className="dashboard-loading">
          <Spinner message="Inicializando panel..." />
        </div>
      );
    }

    switch (activeTab) {
      case 'branches':
        return <BranchManager catalogFactory={catalogFactory} userFactory={userFactory} />;
      case 'users':
        return <UserManager userFactory={userFactory} catalogFactory={catalogFactory} />;
      default:
        return <BranchManager catalogFactory={catalogFactory} userFactory={userFactory} />;
    }
  };

  if (!catalogFactory || !userFactory) {
    return (
      <CalendarLayout>
        <Spinner message={t('common.loading', 'Cargando...')} />
      </CalendarLayout>
    );
  }

  return (
    <CalendarLayout>
      <div className="admin-Calendar">
        <div className="admin-header">
          <h1>{t('admin.Calendar_title', 'Panel de Administración')}</h1>
          <p>{t('admin.Calendar_subtitle', 'Gestiona sucursales y empleados del sistema')}</p>
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
    </CalendarLayout>
  );
};