import React, { useState, useEffect } from 'react';
import CalendarLayout from '../../../shared/components/CalendarLayout';
import { ClientManager } from '../components/ClientManager';
import { ClientFactory } from '../../infrastructure/factories/ClientFactory';
import { API_CONFIG } from '../../../shared/config/ApiConfig';
import Spinner from '../../../shared/components/Spinner';

/**
 * ClientPage - Página principal de gestión de clientes
 */
export const ClientPage = () => {
  const [clientFactory, setClientFactory] = useState(null);

  useEffect(() => {
    // Inicializar el factory con el token actual
    const token = localStorage.getItem('naari_auth_token');
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
          <Spinner  />
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