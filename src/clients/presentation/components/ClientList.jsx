import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchBar } from '../../../shared/components/SearchBar';
import './ClientList.css';

/**
 * ClientList - Lista de clientes estilo Excel con tabla de ancho completo
 */
export const ClientList = ({ 
  clients = [], 
  isLoading = false, 
  onSearch = null,
  onRefresh = null,
  onEdit = null
}) => {
  const { t } = useTranslation();
  const [filteredClients, setFilteredClients] = useState(clients);

  // Actualizar filteredClients cuando cambie clients
  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  const handleSearch = async (searchTerm) => {
    // Búsqueda local siempre (no depende del padre)
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(client => {
      return (
        (client.fullName && client.fullName.toLowerCase().includes(term)) ||
        (client.dni && client.dni.toLowerCase().includes(term)) ||
        (client.email && client.email.toLowerCase().includes(term)) ||
        (client.phone && client.phone.toLowerCase().includes(term))
      );
    });
    setFilteredClients(filtered);
    
    console.log('Búsqueda:', searchTerm, 'Resultados:', filtered.length);
  };

  const handleEdit = (client) => {
    if (onEdit) {
      onEdit(client);
    }
  };

  if (isLoading) {
    return (
      <div className="client-list-loading">
        <div className="spinner"></div>
        <p>{t('common.loading', 'Cargando...')}</p>
      </div>
    );
  }

  return (
    <div className="client-list-excel">
      <SearchBar 
        placeholder={t('clients.search.placeholder', 'Buscar por nombre, DNI, email o teléfono...')}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {/* Results Summary */}
      <div className="results-summary">
        <div className="results-count">
          <h3>{t('clients.list.clients_list', 'Lista de Clientes')}</h3>
          <span className="count-badge">
            {filteredClients.length} {t('clients.list.clients_count', 'clientes')}
          </span>
        </div>
        
        <div className="list-actions">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn btn-secondary"
              title={t('common.refresh', 'Actualizar')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,4 23,10 17,10"/>
                <polyline points="1,20 1,14 7,14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64l1.27 1.27m4.18 14.18A9 9 0 0 0 18.36 18.36l-1.27-1.27"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>{t('clients.list.no_clients', 'No hay clientes')}</h3>
          <p>{clients.length === 0 ? 
            t('clients.list.no_clients_message', 'Comienza registrando tu primer cliente') :
            t('clients.list.no_results', 'No se encontraron clientes con la búsqueda actual')
          }</p>
        </div>
      ) : (
        <div className="excel-table-container">
          <table className="excel-table">
            <thead>
              <tr>
                <th>{t('clients.list.full_name', 'Nombre Completo')}</th>
                <th>{t('clients.list.dni', 'DNI')}</th>
                <th>{t('clients.list.phone', 'Teléfono')}</th>
                <th>{t('clients.list.email', 'Email')}</th>
                <th>{t('clients.list.registration_date', 'Fecha de Registro')}</th>
                <th>{t('clients.list.actions', 'Acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="excel-row">
                  <td className="name-cell">{client.fullName || '-'}</td>
                  <td className="dni-cell">{client.dni || '-'}</td>
                  <td className="phone-cell">{client.phone || '-'}</td>
                  <td className="email-cell">{client.email || '-'}</td>
                  <td className="date-cell">
                    {client.createdAt ? 
                      new Date(client.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      }) : '-'
                    }
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEdit(client)}
                      className="edit-btn"
                      title={t('clients.actions.edit_client', 'Editar cliente')}
                      type="button"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};