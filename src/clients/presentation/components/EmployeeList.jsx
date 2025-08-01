import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const EmployeeList = ({ 
  employees = [], 
  branches = [], 
  onEdit, 
  onToggleStatus, 
  onSearch,
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300); // Reduced to 300ms for better responsiveness

    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Call onSearch when debounced search term changes
  const debouncedOnSearch = useCallback(async (term) => {
    if (onSearch) {
      await onSearch(term);
    }
  }, [onSearch]);

  useEffect(() => {
    debouncedOnSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, debouncedOnSearch]);

  // No frontend filtering needed - search is handled by backend
  const filteredEmployees = employees;


  const getRoleColor = (role) => {
    const colors = {
      'administrator': 'role-admin',
      'receptionist': 'role-receptionist',
      'esthetician': 'role-esthetician',
      'user': 'role-user'
    };
    return colors[role] || 'role-default';
  };

  if (isLoading) {
    return (
      <div className="employee-list-loading">
        <div className="spinner"></div>
        <p>{t('common.loading', 'Cargando...')}</p>
      </div>
    );
  }

  return (
    <div className="employee-list">
      {/* Search and Filters Bar */}
      <div className="search-filters-bar">
        {/* Search Input */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder={t('users.search.placeholder', 'Buscar por nombre, apellido o email...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {(isSearching || isLoading) && (
              <div className="search-loading">
                <div className="spinner-small"></div>
              </div>
            )}
            {searchTerm && !isSearching && !isLoading && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                title={t('common.clear', 'Limpiar')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <div className="results-count">
          <h3>{t('users.list.employees_list', 'Lista de Empleados')}</h3>
          <span className="count-badge">
            {employees.length} empleados
          </span>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>{t('users.list.no_employees', 'No hay empleados')}</h3>
          <p>{t('users.list.no_employees_desc', 'No se encontraron empleados con los filtros aplicados')}</p>
        </div>
      ) : (
        <div className="list-grid">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className={`branch-card ${employee.isActive ? 'active' : 'inactive'}`}>
              <div className="card-header">
                <div className="branch-info">
                  <div className="employee-avatar">
                    <span>{employee.firstName?.[0]}{employee.lastName?.[0]}</span>
                  </div>
                  <div className="employee-info">
                    <h4>{employee.fullName}</h4>
                    <p className="employee-email">{employee.email}</p>
                    <span className={`role-badge ${getRoleColor(employee.role)}`}>
                      {employee.getRoleDisplay(t)}
                    </span>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button
                    onClick={() => onEdit(employee)}
                    className="btn-icon edit-btn"
                    title={t('common.edit', 'Editar')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => onToggleStatus(employee)}
                    className={`btn-icon status-btn ${employee.isActive ? 'deactivate' : 'activate'}`}
                    title={employee.isActive ? t('common.deactivate', 'Desactivar') : t('common.activate', 'Activar')}
                  >
                    {employee.isActive ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="9"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="9"/>
                        <polyline points="9,11 12,14 22,4"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="card-body">
                <div className="card-footer">
                  <span className={`status-badge ${employee.isActive ? 'active' : 'inactive'}`}>
                    {employee.isActive ? t('common.active', 'Activo') : t('common.inactive', 'Inactivo')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};