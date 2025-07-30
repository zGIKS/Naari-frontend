import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BranchForm } from './BranchForm';
import { BranchList } from './BranchList';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';

/**
 * BranchManager - Gestor de sucursales
 * Implementa el patrón Observer para reaccionar a cambios
 */
export const BranchManager = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [error, setError] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    branchId: null,
    branchName: '',
    action: null, // 'activate' or 'deactivate'
    activate: false
  });

  const branchService = catalogFactory.getBranchService();

  // Observer para reaccionar a eventos del servicio
  useEffect(() => {
    const observer = {
      branchCreated: () => {
        loadBranches();
        setShowForm(false);
        setEditingBranch(null);
      },
      branchUpdated: () => {
        loadBranches();
        setShowForm(false);
        setEditingBranch(null);
      },
      branchStatusChanged: () => {
        loadBranches();
      },
      branchCreateFailed: (error) => {
        setError(error.message);
      },
      branchUpdateFailed: (error) => {
        setError(error.message);
      },
      branchLoadFailed: (error) => {
        setError(error.message);
        setLoading(false);
      }
    };

    branchService.subscribe(observer);

    return () => {
      branchService.unsubscribe(observer);
    };
  }, [branchService]);

  // Cargar sucursales al montar el componente
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await branchService.getAllBranches();
      setBranches(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingBranch(null);
    setShowForm(true);
    setError(null);
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch.id, formData);
      } else {
        await branchService.createBranch(formData);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBranch(null);
    setError(null);
  };

  const handleToggleStatus = (id, activate) => {
    const branch = branches.find(b => b.id === id);
    if (!branch) return;

    setConfirmationModal({
      isOpen: true,
      branchId: id,
      branchName: branch.name,
      action: activate ? 'activate' : 'deactivate',
      activate: activate
    });
  };

  const handleConfirmToggleStatus = async () => {
    const { branchId, activate } = confirmationModal;
    const branch = branches.find(b => b.id === branchId);
    
    setConfirmationModal({ ...confirmationModal, isOpen: false });

    try {
      await branchService.toggleBranchStatus(branchId, activate, branch);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancelToggleStatus = () => {
    setConfirmationModal({
      isOpen: false,
      branchId: null,
      branchName: '',
      action: null,
      activate: false
    });
  };

  return (
    <div className="branch-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>{t('admin.branches_title', 'Gestión de Sucursales')}</h2>
          <p>{t('admin.branches_subtitle', 'Administra las sucursales del sistema')}</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateNew}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {t('admin.new_branch', 'Nueva Sucursal')}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {showForm && (
        <div className="form-modal">
          <div className="form-overlay" onClick={handleCancel}></div>
          <div className="form-container">
            <BranchForm
              branch={editingBranch}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      <div className="manager-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('common.loading', 'Cargando sucursales...')}</p>
          </div>
        ) : (
          <BranchList
            branches={branches}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCancelToggleStatus}
        onConfirm={handleConfirmToggleStatus}
        title={confirmationModal.action === 'activate' 
          ? t('admin.activate_branch', 'Activar Sucursal')
          : t('admin.deactivate_branch', 'Desactivar Sucursal')
        }
        message={confirmationModal.action === 'activate'
          ? t('admin.activate_branch_message', `¿Estás seguro que quieres activar la sucursal "${confirmationModal.branchName}"?`)
          : t('admin.deactivate_branch_message', `¿Estás seguro que quieres desactivar la sucursal "${confirmationModal.branchName}"?`)
        }
        confirmText={confirmationModal.action === 'activate' 
          ? t('admin.activate', 'Activar')
          : t('admin.deactivate', 'Desactivar')
        }
        cancelText={t('common.cancel', 'Cancelar')}
        type={confirmationModal.action === 'deactivate' ? 'warning' : 'info'}
      />
    </div>
  );
};