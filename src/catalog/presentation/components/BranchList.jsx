import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BranchList - Lista de sucursales con acciones
 */
export const BranchList = ({ branches, onEdit, onToggleStatus }) => {
  const { t } = useTranslation();

  if (branches.length === 0) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        <h3>{t('admin.no_branches', 'No hay sucursales')}</h3>
        <p>{t('admin.no_branches_message', 'Comienza creando tu primera sucursal')}</p>
      </div>
    );
  }

  return (
    <div className="branch-list">
      <div className="list-header">
        <h3>{t('admin.branches_list', 'Lista de Sucursales')} ({branches.length})</h3>
      </div>

      <div className="list-grid">
        {branches.map(branch => (
          <div key={branch.id} className={`branch-card ${branch.isActive ? 'active' : 'inactive'}`}>
            <div className="card-header">
              <div className="branch-info">
                <h4>{branch.name}</h4>
                <span className={`status-badge ${branch.isActive ? 'active' : 'inactive'}`}>
                  {branch.isActive 
                    ? t('admin.active', 'Activa')
                    : t('admin.inactive', 'Inactiva')
                  }
                </span>
              </div>
              <div className="card-actions">
                <button
                  onClick={() => onEdit(branch)}
                  className="btn-icon edit-btn"
                  title={t('common.edit', 'Editar')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={() => onToggleStatus(branch.id, !branch.isActive)}
                  className={`btn-icon status-btn ${branch.isActive ? 'deactivate' : 'activate'}`}
                  title={branch.isActive 
                    ? t('admin.deactivate', 'Desactivar')
                    : t('admin.activate', 'Activar')
                  }
                >
                  {branch.isActive ? (
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

            <div className="card-content">
              <div className="info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{branch.address}</span>
              </div>
              
              <div className="info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>{branch.phone}</span>
              </div>
              
              <div className="info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{branch.email}</span>
              </div>
            </div>

            <div className="card-footer">
              <small className="text-muted">
                {t('admin.created_at', 'Creada')}: {new Date(branch.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};