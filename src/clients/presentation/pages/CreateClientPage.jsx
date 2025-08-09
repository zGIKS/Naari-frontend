import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../shared/components/ToastProvider';
import { ClientForm } from '../components/ClientForm';
import CalendarLayout from '../../../shared/components/CalendarLayout';
import { ClientFactory } from '../../infrastructure/factories/ClientFactory';
import { API_CONFIG } from '../../../shared/config/ApiConfig';

/**
 * CreateClientPage - Página dedicada para crear un nuevo cliente
 */
export const CreateClientPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [clientFactory, setClientFactory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Inicializar el factory con el token actual
    const token = sessionStorage.getItem('naari_token');
    if (token) {
      const factory = ClientFactory.getInstance();
      factory.initialize(API_CONFIG.API_BASE, token);
      setClientFactory(factory);
    }
  }, []);


  const handleCreateClient = async (clientData) => {
    if (!clientFactory) return;

    setIsSubmitting(true);
    try {
      const clientService = clientFactory.createClientService(t);
      const response = await clientService.createClient(clientData);

      if (response.success) {
        showSuccess(t('clients.success.created', 'Cliente creado exitosamente'));
        
        // Redirigir a la lista de clientes después de un breve delay
        setTimeout(() => {
          navigate('/clients', { state: { refreshClients: true } });
        }, 1500);
      } else {
        showError( response.error || t('clients.error.create_failed', 'Error al crear cliente'));
      }
    } catch (error) {
      console.error('Error creating client:', error);
      showError( t('clients.error.network', 'Error de conexión'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/clients', { state: {} });
  };

  if (!clientFactory) {
    return (
      <CalendarLayout>
        <div className="create-client-page-loading">
          <div className="spinner"></div>
          <p>{t('common.loading', 'Cargando...')}</p>
        </div>
      </CalendarLayout>
    );
  }

  return (
    <CalendarLayout>
      <div className="create-client-page">
        <div className="page-header" style={{
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.5rem',
          padding: '0 2rem 1.5rem 2rem'
        }}>
          <div className="header-content">
            <button 
              onClick={handleCancel}
              className="btn btn-secondary"
              style={{ 
                marginBottom: '1rem', 
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                width: 'fit-content'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--bg-tertiary)';
                e.target.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
              Volver a clientes
            </button>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <h1 style={{ 
                fontSize: '1.875rem', 
                fontWeight: '700', 
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0',
                lineHeight: '1.2'
              }}>
                {t('clients.form.title', 'Registrar Nuevo Cliente')}
              </h1>
              <p style={{ 
                fontSize: '1rem', 
                color: 'var(--text-secondary)',
                margin: '0',
                lineHeight: '1.5'
              }}>
                {t('clients.form.subtitle', 'Completa la información del cliente')}
              </p>
            </div>
          </div>
        </div>

        <div className="page-content">
          <div className="form-container" style={{ 
            width: '100%',
            maxWidth: 'none',
            margin: '0',
            padding: '2rem',
            background: 'transparent',
            borderRadius: '0',
            boxShadow: 'none'
          }}>
            <ClientForm
              onSubmit={handleCreateClient}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </div>
        </div>

      </div>
    </CalendarLayout>
  );
};
