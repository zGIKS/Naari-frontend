import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClientList } from './ClientList';
import Toast from '../../../shared/components/Toast';
import './ClientManager.css';

/**
 * ClientManager - Componente principal para gestión de clientes
 */
export const ClientManager = ({ clientFactory }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, [clientFactory]);

  // Detectar cuando se regresa de crear un cliente y recargar la lista
  useEffect(() => {
    if (location.state?.refreshClients) {
      loadClients();
      // Limpiar el estado para evitar recargas innecesarias
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const loadClients = async () => {
    if (!clientFactory) return;

    setIsLoading(true);
    try {
      const clientService = clientFactory.createClientService(t);
      const response = await clientService.getClients();

      if (response.success) {
        setClients(response.data);
      } else {
        showToast('error', response.error || t('clients.error.load_failed', 'Error al cargar clientes'));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      showToast('error', t('clients.error.network', 'Error de conexión'));
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleCreateNewClient = () => {
    navigate('/clients/create');
  };

  if (!clientFactory) {
    return (
      <div className="client-manager-loading">
        <div className="spinner"></div>
        <p>{t('common.loading', 'Cargando...')}</p>
      </div>
    );
  }

  return (
    <div className="client-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>{t('clients.title', 'Gestión de Clientes')}</h2>
          <p>{t('clients.subtitle', 'Administra la información de tus clientes')}</p>
        </div>
        
        <div className="header-actions">
          <button
            onClick={handleCreateNewClient}
            className="btn btn-primary"
            disabled={isLoading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            {t('clients.actions.new_client', 'Nuevo Cliente')}
          </button>
        </div>
      </div>

      <div className="manager-content">
        <ClientList
          clients={clients}
          isLoading={isLoading}
          onRefresh={loadClients}
        />
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={closeToast}
        />
      )}
    </div>
  );
};