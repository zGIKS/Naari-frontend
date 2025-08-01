import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientForm } from './ClientForm';
import { ClientList } from './ClientList';
import Toast from '../../../shared/components/Toast';

/**
 * ClientManager - Componente principal para gestión de clientes
 */
export const ClientManager = ({ clientFactory }) => {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, [clientFactory]);

  const loadClients = async () => {
    if (!clientFactory) return;

    setIsLoading(true);
    try {
      const clientService = clientFactory.createClientService();
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

  const handleCreateClient = async (clientData) => {
    if (!clientFactory) return;

    setIsSubmitting(true);
    try {
      const clientService = clientFactory.createClientService();
      const response = await clientService.createClient(clientData);

      if (response.success) {
        setClients(prev => [response.data, ...prev]);
        setShowForm(false);
        showToast('success', t('clients.success.created', 'Cliente registrado exitosamente'));
      } else {
        showToast('error', response.error || t('clients.error.create_failed', 'Error al crear cliente'));
      }
    } catch (error) {
      console.error('Error creating client:', error);
      showToast('error', t('clients.error.network', 'Error de conexión'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const closeToast = () => {
    setToast(null);
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
      {!showForm ? (
        <>
          <div className="manager-header">
            <div className="header-content">
              <h2>{t('clients.title', 'Gestión de Clientes')}</h2>
              <p>{t('clients.subtitle', 'Administra la información de tus clientes')}</p>
            </div>
            
            <div className="header-actions">
              <button
                onClick={() => setShowForm(true)}
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
        </>
      ) : (
        <>
          <div className="manager-header">
            <div className="header-content">
              <h2>{t('clients.form.title', 'Registrar Nuevo Cliente')}</h2>
              <p>{t('clients.form.subtitle', 'Completa la información del cliente')}</p>
            </div>
          </div>

          <div className="manager-content">
            <div className="form-container">
              <ClientForm
                onSubmit={handleCreateClient}
                onCancel={() => setShowForm(false)}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </>
      )}

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