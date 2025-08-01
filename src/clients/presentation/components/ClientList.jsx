import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ClientList - Lista de clientes con búsqueda y acciones
 */
export const ClientList = ({ 
  clients = [], 
  isLoading = false, 
  onClientSelect = null,
  onRefresh = null 
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filtrar clientes por término de búsqueda
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      client.fullName.toLowerCase().includes(term) ||
      client.dni.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      (client.phone && client.phone.toLowerCase().includes(term))
    );
  });

  // Ordenar clientes
  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'fullName') {
      aValue = a.fullName;
      bValue = b.fullName;
    }

    if (sortBy === 'createdAt') {
      aValue = new Date(a.createdAt);
      bValue = new Date(b.createdAt);
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 10l5-5 5 5M7 14l5 5 5-5"/>
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 14l5-5 5 5"/>
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 10l5 5 5-5"/>
      </svg>
    );
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
    <div className="client-list">
      <div className="client-list-header">
        <div className="search-container">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder={t('clients.list.search_placeholder', 'Buscar por nombre, DNI o email...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
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

      {sortedClients.length === 0 ? (
        <div className="client-list-empty">
          {searchTerm ? (
            <>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <h3>{t('clients.list.no_results', 'No se encontraron clientes')}</h3>
              <p>{t('clients.list.no_results_message', 'Intenta con otros términos de búsqueda')}</p>
            </>
          ) : (
            <>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <h3>{t('clients.list.no_clients', 'No hay clientes registrados')}</h3>
              <p>{t('clients.list.no_clients_message', 'Comienza registrando tu primer cliente')}</p>
            </>
          )}
        </div>
      ) : (
        <div className="client-table-container">
          <table className="client-table">
            <thead>
              <tr>
                <th 
                  className="sortable"
                  onClick={() => handleSort('fullName')}
                >
                  {t('clients.list.name', 'Nombre')}
                  {getSortIcon('fullName')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('dni')}
                >
                  {t('clients.list.dni', 'DNI')}
                  {getSortIcon('dni')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('email')}
                >
                  {t('clients.list.email', 'Email')}
                  {getSortIcon('email')}
                </th>
                <th>{t('clients.list.phone', 'Teléfono')}</th>
                <th>{t('clients.list.age', 'Edad')}</th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('createdAt')}
                >
                  {t('clients.list.registered', 'Registrado')}
                  {getSortIcon('createdAt')}
                </th>
                {onClientSelect && <th>{t('clients.list.actions', 'Acciones')}</th>}
              </tr>
            </thead>
            <tbody>
              {sortedClients.map((client) => (
                <tr key={client.id} className="client-row">
                  <td className="client-name">
                    <div className="client-info">
                      <span className="name">{client.fullName}</span>
                      {client.knownFrom && (
                        <span className="known-from">
                          {t(`clients.form.${client.knownFrom.toLowerCase().replace(' ', '_')}`, client.knownFrom)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{client.dni}</td>
                  <td className="email">{client.email}</td>
                  <td>{client.phone || '-'}</td>
                  <td>{client.age ? `${client.age} años` : '-'}</td>
                  <td>
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}
                  </td>
                  {onClientSelect && (
                    <td>
                      <button
                        onClick={() => onClientSelect(client)}
                        className="btn btn-sm btn-primary"
                      >
                        {t('clients.list.select', 'Seleccionar')}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="client-list-footer">
        <div className="results-count">
          {t('clients.list.showing_results', 'Mostrando {{count}} de {{total}} clientes', {
            count: sortedClients.length,
            total: clients.length
          })}
        </div>
      </div>
    </div>
  );
};