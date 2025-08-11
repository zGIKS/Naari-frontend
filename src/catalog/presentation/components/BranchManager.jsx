import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BranchForm } from './BranchForm';
import { BranchList } from './BranchList';
import { BranchStatusConfirmationModal } from '../../../shared/components/BranchStatusConfirmationModal';
import { useToast } from '../../../shared/components/ToastProvider';
import Spinner from '../../../shared/components/Spinner';

/**
 * BranchManager - Gestor de sucursales
 * Implementa el patrón Observer para reaccionar a cambios
 */
export const BranchManager = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [error, setError] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    branch: null,
    action: null // 'activate' or 'deactivate'
  });

  const branchService = catalogFactory.getBranchService();

  const loadBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await branchService.getAllBranches();
      setBranches(data);
    } catch (error) {
      console.error('Error loading branches:', error);
      setError('Error al cargar las sucursales');
    } finally {
      setLoading(false);
    }
  }, [branchService]);

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
  }, [branchService, loadBranches]);

  // Cargar sucursales al montar el componente
  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

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
      branch: branch,
      action: activate ? 'activate' : 'deactivate'
    });
  };

  const handleConfirmToggleStatus = async () => {
    const { branch, action } = confirmationModal;
    const activate = action === 'activate';
    
    setConfirmationModal({ ...confirmationModal, isOpen: false });

    try {
      await branchService.toggleBranchStatus(branch.id, activate, branch);
      
      // Mostrar mensaje de éxito
      const successMessage = activate 
        ? t('admin.activate_branch_success', 'Sucursal activada. Los usuarios de esta sucursal han sido reactivados automáticamente')
        : t('admin.deactivate_branch_success', 'Sucursal desactivada. Los usuarios de esta sucursal han sido desactivados automáticamente');
      
      showSuccess( successMessage);
      
      // Refrescar lista de branches
      await loadBranches();
      
    } catch (error) {
      showError( error.message);
    }
  };

  const handleCancelToggleStatus = () => {
    setConfirmationModal({
      isOpen: false,
      branch: null,
      action: null
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

      <div className="manager-content">
        {showForm ? (
          <div className="form-section">
            <BranchForm
              branch={editingBranch}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        ) : loading ? (
          <div className="loading-state">
            <Spinner message={t('branches.loading', 'Cargando sucursales...')} />
          </div>
        ) : (
          <BranchList
            branches={branches}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>

      <BranchStatusConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCancelToggleStatus}
        onConfirm={handleConfirmToggleStatus}
        branch={confirmationModal.branch}
        action={confirmationModal.action}
      />

    </div>
  );
};