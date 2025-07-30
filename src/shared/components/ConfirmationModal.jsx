import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ConfirmationModal - Modal de confirmación personalizado
 * Sigue el diseño de la aplicación
 */
export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText,
  type = 'warning' // 'warning', 'danger', 'info'
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        );
      default: // warning
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
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
      <div className="confirmation-modal">
        <div className="modal-header">
          <div className={`modal-icon ${type}`}>
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
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-actions">
          <button 
            onClick={onClose}
            className="btn btn-secondary"
          >
            {cancelText || t('common.cancel', 'Cancelar')}
          </button>
          <button 
            onClick={onConfirm}
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmText || t('common.confirm', 'Confirmar')}
          </button>
        </div>
      </div>
    </div>
  );
};