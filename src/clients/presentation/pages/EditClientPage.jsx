import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClientForm } from '../components/ClientForm';
import CalendarLayout from '../../../shared/components/CalendarLayout';
import Toast from '../../../shared/components/Toast';
import { ClientFactory } from '../../infrastructure/factories/ClientFactory';
import { API_CONFIG } from '../../../shared/config/ApiConfig';

/**
 * EditClientPage - Página dedicada para editar un cliente existente
 */
export const EditClientPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientFactory, setClientFactory] = useState(null);
  const [client, setClient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Inicializar el factory con el token actual
    const token = sessionStorage.getItem('naari_token');
    if (token) {
      const factory = ClientFactory.getInstance();
      factory.initialize(API_CONFIG.API_BASE, token);
      setClientFactory(factory);
    }
  }, []);

  useEffect(() => {
    // El cliente debe venir siempre del state de navegación ya que GET /clients devuelve datos completos
    if (location.state?.client) {
      setClient(location.state.client);
      setIsLoading(false);
    } else {
      // Si no hay datos del cliente, redirigir a la lista
      showToast('error', t('clients.error.no_client_data', 'No se encontraron datos del cliente'));
      navigate('/clients');
    }
  }, [location.state, navigate, t]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleUpdateClient = async (clientData) => {
    if (!clientFactory || !client) return;

    setIsSubmitting(true);
    try {
      const clientService = clientFactory.createClientService(t);
      const response = await clientService.updateClient(client.id, clientData);

      if (response.success) {
        showToast('success', t('clients.success.updated', 'Cliente actualizado exitosamente'));
        
        // Redirigir a la lista de clientes después de un breve delay
        setTimeout(() => {
          navigate(location.state?.returnTo || '/clients', { state: { refreshClients: true } });
        }, 1500);
      } else {
        showToast('error', response.error || t('clients.error.update_failed', 'Error al actualizar cliente'));
      }
    } catch (error) {
      console.error('Error updating client:', error);
      showToast('error', t('clients.error.network', 'Error de conexión'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(location.state?.returnTo || '/clients', { state: {} });
  };

  if (!clientFactory || isLoading) {
    return (
      <CalendarLayout>
        <div className="edit-client-page-loading">
          <div className="spinner"></div>
          <p>{t('common.loading', 'Cargando...')}</p>
        </div>
      </CalendarLayout>
    );
  }

  if (!client) {
    return (
      <CalendarLayout>
        <div className="edit-client-page-error">
          <h3>{t('clients.error.not_found', 'Cliente no encontrado')}</h3>
          <button onClick={handleCancel} className="btn btn-primary">
            {t('common.back', 'Volver')}
          </button>
        </div>
      </CalendarLayout>
    );
  }

  return (
    <CalendarLayout>
      <div className="edit-client-page">
        <div className="page-header" style={{
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '1.5rem'
        }}>
          <div className="header-content">
            <button 
              onClick={handleCancel}
              className="btn btn-ghost"
              style={{ 
                marginBottom: '1rem', 
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                color: '#666',
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
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#e5e7eb';
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
                color: '#111827',
                margin: '0 0 0.5rem 0',
                lineHeight: '1.2'
              }}>
                {t('clients.form.edit_title', 'Editar Cliente')}
              </h1>
              <p style={{ 
                fontSize: '1rem', 
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.5'
              }}>
                {t('clients.form.edit_subtitle', 'Modifica la información del cliente')} - {client.fullName || client.firstName + ' ' + client.lastName}
              </p>
            </div>
          </div>
        </div>

        <div className="page-content">
          <div className="form-container" style={{ 
            width: '100%',
            maxWidth: 'none',
            margin: '0',
            padding: '0',
            background: 'transparent',
            borderRadius: '0',
            boxShadow: 'none'
          }}>
            <ClientForm
              initialData={client}
              onSubmit={handleUpdateClient}
              onCancel={handleCancel}
              isLoading={isSubmitting}
              isEdit={true}
            />
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
    </CalendarLayout>
  );
};