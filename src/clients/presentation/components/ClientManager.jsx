import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Toast from '../../../shared/components/Toast';
import './ClientManager.css';

/**
 * ClientManager - Componente principal para gestión de clientes
 */
export const ClientManager = ({ clientFactory }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

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
        {/* Lista de clientes eliminada */}
        <div className="empty-content">
          <h3>{t('clients.list.removed', 'Lista de clientes no disponible')}</h3>
          <p>{t('clients.list.removed_message', 'La funcionalidad de lista ha sido deshabilitada')}</p>
        </div>
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