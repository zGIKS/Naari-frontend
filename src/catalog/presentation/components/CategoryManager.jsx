import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';

/**
 * CategoryManager - Gestor de categorías unificado
 */
export const CategoryManager = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: '',
    action: null,
    activate: false
  });

  const categoryService = catalogFactory.getCategoryService();
  const branchService = catalogFactory.getBranchService();

  // Observer simplificado para manejar solo errores ya que usamos actualización optimista
  useEffect(() => {
    const observer = {
      categoryCreateFailed: (error) => {
        setError(getErrorMessage(error));
      },
      categoryUpdateFailed: (error) => {
        setError(getErrorMessage(error));
      },
      categoryStatusChangeFailed: (error) => {
        setError(getErrorMessage(error));
      }
    };

    categoryService.subscribe(observer);

    return () => {
      categoryService.unsubscribe(observer);
    };
  }, [categoryService]);

  useEffect(() => {
    loadBranches();
    loadCategories(); // Load categories initially
  }, []);

  useEffect(() => {
    loadCategories(); // Reload categories when branch selection changes
  }, [selectedBranch]);

  const loadBranches = async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data.filter(branch => branch.isActive));
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      let data = [];
      
      if (selectedBranch) {
        // Load categories for specific branch
        data = await categoryService.getAllCategories(selectedBranch);
      } else {
        // Load all categories using the general endpoint
        data = await categoryService.getAllCategories();
      }
      
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    navigate('/catalog/categories/new');
  };

  const handleEditCategory = (category) => {
    navigate('/catalog/categories/edit', {
      state: { category }
    });
  };

  const handleToggleStatus = (categoryId, categoryName, activate) => {
    setConfirmationModal({
      isOpen: true,
      categoryId: categoryId,
      categoryName: categoryName,
      action: activate ? 'activate' : 'deactivate',
      activate: activate
    });
  };

  const handleConfirmToggleStatus = async () => {
    const { categoryId, activate } = confirmationModal;
    const category = categories.find(c => c.id === categoryId);
    
    setConfirmationModal({ ...confirmationModal, isOpen: false });

    // Actualización optimista del estado local
    setCategories(prevCategories => 
      prevCategories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, isActive: activate }
          : cat
      )
    );

    try {
      await categoryService.toggleCategoryStatus(categoryId, activate, category);
      // Recargar datos desde el servidor para asegurar consistencia
      await loadCategories();
    } catch (error) {
      // Revertir el cambio optimista en caso de error
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === categoryId 
            ? { ...cat, isActive: !activate }
            : cat
        )
      );
      setError(getErrorMessage(error));
    }
  };

  const handleCancelToggleStatus = () => {
    setConfirmationModal({
      isOpen: false,
      categoryId: null,
      categoryName: '',
      action: null,
      activate: false
    });
  };

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    setError(null);
    
    try {
      if (editingCategory) {
        // Actualización optimista para edición
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === editingCategory.id 
              ? { ...cat, name: formData.name, description: formData.description }
              : cat
          )
        );
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      
      // Recargar datos para asegurar consistencia
      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      setError(getErrorMessage(error));
      // Si falla, recargar datos para revertir cambios optimistas
      if (editingCategory) {
        await loadCategories();
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error.status === 400) {
      return t('admin.category_error_invalid_data', 'Datos inválidos. Verifica que todos los campos estén correctos.');
    } else if (error.status === 401) {
      return t('admin.category_error_unauthorized', 'No tienes autorización. Inicia sesión nuevamente.');
    } else if (error.status === 403) {
      return t('admin.category_error_forbidden', 'No tienes permisos para crear categorías.');
    } else if (error.status === 409) {
      return t('admin.category_error_conflict', 'Ya existe una categoría con ese nombre en esta sucursal.');
    } else if (error.status === 500) {
      return t('admin.category_error_server', 'Error del servidor. Intenta nuevamente más tarde.');
    } else if (error.status === 0) {
      return t('admin.category_error_network', 'Error de conexión. Verifica tu conexión a internet.');
    }
    return t('admin.category_error_general', 'Error al crear la categoría. Intenta nuevamente.');
  };

  const getFilteredCategories = () => {
    if (statusFilter === 'all') {
      return categories;
    }
    return categories.filter(category => {
      if (statusFilter === 'active') {
        return category.isActive;
      } else if (statusFilter === 'inactive') {
        return !category.isActive;
      }
      return true;
    });
  };

  return (
    <div className="category-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>{t('admin.categories_title', 'Gestión de Categorías')}</h2>
          <p>{t('admin.categories_subtitle', 'Administra todas las categorías de servicios y productos')}</p>
        </div>
        <div className="header-actions">
          <select 
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="branch-selector"
          >
            <option value="">{t('admin.all_branches', 'Todas las sucursales')}</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="active">{t('admin.active_categories', 'Activas')}</option>
            <option value="inactive">{t('admin.inactive_categories', 'Inactivas')}</option>
            <option value="all">{t('admin.all_categories', 'Todas')}</option>
          </select>
          <button 
            className="btn btn-primary"
            onClick={handleCreateCategory}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {t('admin.new_category', 'Nueva Categoría')}
          </button>
        </div>
      </div>

      <div className="manager-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('common.loading', 'Cargando categorías...')}</p>
          </div>
        ) : (
          <div className="category-list">
            {getFilteredCategories().length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                <h3>{t('admin.no_categories', 'No hay categorías')}</h3>
                <p>{t('admin.no_categories_message', 'Comienza creando categorías para tus servicios')}</p>
              </div>
            ) : (
              <>
                <div className="list-header">
                  <h3>{t('admin.categories_list', 'Lista de Categorías')} ({getFilteredCategories().length})</h3>
                </div>
                <div className="list-grid">
                  {getFilteredCategories().map(category => (
                    <div key={category.id} className={`branch-card ${category.isActive ? 'active' : 'inactive'}`}>
                      <div className="card-header">
                        <div className="branch-info">
                          <h4>{category.name}</h4>
                          <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                            {category.isActive ? 
                              t('admin.active', 'Activa') : 
                              t('admin.inactive', 'Inactiva')
                            }
                          </span>
                        </div>
                        <div className="card-actions">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="btn-icon edit-btn"
                            title={t('common.edit', 'Editar')}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(category.id, category.name, !category.isActive)}
                            className={`btn-icon status-btn ${category.isActive ? 'deactivate' : 'activate'}`}
                            title={category.isActive 
                              ? t('admin.deactivate', 'Desactivar')
                              : t('admin.activate', 'Activar')
                            }
                          >
                            {category.isActive ? (
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
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                          </svg>
                          <span>{category.description}</span>
                        </div>
                        
                        <div className="info-row">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9,22 9,12 15,12 15,22"/>
                          </svg>
                          <span>{branches.find(b => b.id === category.branchId)?.name}</span>
                        </div>
                      </div>

                      <div className="card-footer">
                        <small className="text-muted">
                          {t('admin.created_at', 'Creada')}: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : ''}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>


      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCancelToggleStatus}
        onConfirm={handleConfirmToggleStatus}
        title={confirmationModal.action === 'activate' ? 
          t('admin.activate_category', 'Activar categoría') : 
          t('admin.deactivate_category', 'Desactivar categoría')
        }
        message={confirmationModal.action === 'activate' ?
          t('admin.confirm_activate_category', '¿Estás seguro de que quieres activar la categoría "{{name}}"?', { name: confirmationModal.categoryName }) :
          t('admin.confirm_deactivate_category', '¿Estás seguro de que quieres desactivar la categoría "{{name}}"?', { name: confirmationModal.categoryName })
        }
        confirmText={confirmationModal.action === 'activate' ? 
          t('admin.activate_category', 'Activar') : 
          t('admin.deactivate_category', 'Desactivar')
        }
        cancelText={t('common.cancel', 'Cancelar')}
        type={confirmationModal.action === 'activate' ? 'info' : 'warning'}
      />
    </div>
  );
};