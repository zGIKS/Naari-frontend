import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CalendarLayout from '../../../shared/components/CalendarLayout';
import { ClientManager } from '../components/ClientManager';
import { ClientFactory } from '../../infrastructure/factories/ClientFactory';
import { API_CONFIG } from '../../../shared/config/ApiConfig';

/**
 * ClientPage - Página principal de gestión de clientes
 */
export const ClientPage = () => {
  const { t } = useTranslation();
  const [clientFactory, setClientFactory] = useState(null);

  useEffect(() => {
    // Inicializar el factory con el token actual
    const token = sessionStorage.getItem('naari_token');
    if (token) {
      const factory = ClientFactory.getInstance();
      factory.initialize(API_CONFIG.API_BASE, token);
      setClientFactory(factory);
    }
  }, []);

  if (!clientFactory) {
    return (
      <CalendarLayout>
        <div className="client-page-loading">
          <div className="spinner"></div>
          <p>{t('common.loading', 'Cargando...')}</p>
        </div>
      </CalendarLayout>
    );
  }

  return (
    <CalendarLayout>
      <div className="client-page">
        <ClientManager clientFactory={clientFactory} />
      </div>
    </CalendarLayout>
  );
};