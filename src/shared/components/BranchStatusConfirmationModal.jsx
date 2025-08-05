import { useTranslation } from 'react-i18next';
import './BranchStatusConfirmationModal.css';

/**
 * BranchStatusConfirmationModal - Modal de confirmación especializado para cambios de estado de branches
 * Muestra información sobre usuarios afectados
 */
export const BranchStatusConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  branch,
  action // 'activate' or 'deactivate'
}) => {
  const { t } = useTranslation();

  if (!isOpen || !branch) return null;

  const isDeactivating = action === 'deactivate';
  const title = isDeactivating 
    ? t('admin.deactivate_branch', 'Desactivar Sucursal')
    : t('admin.activate_branch', 'Activar Sucursal');

  const getIcon = () => {
    if (isDeactivating) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
      );
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="confirmation-modal branch-status-modal">
        <div className="modal-header">
          <div className={`modal-icon ${isDeactivating ? 'warning' : 'info'}`}>
            {getIcon()}
          </div>
          <h3 className="modal-title">{title}</h3>
          <button 
            onClick={onClose}
            className="modal-close"
            aria-label={t('common.close', 'Cerrar')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="branch-info">
            <h4>{branch.name}</h4>
            <p className="branch-details">{branch.address}</p>
          </div>

          <div className="confirmation-message">
            <p>
              {isDeactivating 
                ? t('admin.deactivate_branch_message', '¿Estás seguro que quieres desactivar esta sucursal?')
                : t('admin.activate_branch_message', '¿Estás seguro que quieres activar esta sucursal?')
              }
            </p>
          </div>

          {isDeactivating && (
            <div className="warning-section">
              <div className="warning-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p className="warning-text">
                {t('admin.deactivate_branch_warning', 'Al desactivar esta sucursal, todos los usuarios asignados a ella también se desactivarán')}
              </p>
            </div>
          )}

        </div>
        
        <div className="modal-actions">
          <button 
            onClick={onClose}
            className="btn btn-secondary"
          >
            {t('common.cancel', 'Cancelar')}
          </button>
          <button 
            onClick={onConfirm}
            className={`btn ${isDeactivating ? 'btn-danger' : 'btn-primary'}`}
          >
            {isDeactivating 
              ? t('admin.deactivate', 'Desactivar')
              : t('admin.activate', 'Activar')
            }
          </button>
        </div>
      </div>
    </div>
  );
};