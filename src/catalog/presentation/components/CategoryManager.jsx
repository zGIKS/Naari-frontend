import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';

/**
 * CategoryManager - Gestor de categorías de servicios
 * Similar estructura al BranchManager
 */
export const CategoryManager = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: '',
    action: null,
    activate: false
  });

  const categoryService = catalogFactory.getCategoryService();
  const branchService = catalogFactory.getBranchService();

  // Observer para reaccionar a eventos del servicio
  useEffect(() => {
    const observer = {
      categoryCreated: () => {
        loadCategories();
        setShowForm(false);
        setEditingCategory(null);
      },
      categoryUpdated: () => {
        loadCategories();
        setShowForm(false);
        setEditingCategory(null);
      },
      categoryStatusChanged: () => {
        loadCategories();
      },
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
  }, []);

  useEffect(() => {
    if (branches.length > 0) {
      loadCategories();
    }
  }, [selectedBranch, branches]);

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
        // Load categories from all branches
        data = await categoryService.getAllCategoriesFromAllBranches(branches);
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
    setEditingCategory(null);
    setShowForm(true);
    setError(null);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowForm(true);
    setError(null);
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

    try {
      await categoryService.toggleCategoryStatus(categoryId, activate, category);
    } catch (error) {
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
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      setError(getErrorMessage(error));
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
          <p>{t('admin.categories_subtitle', 'Administra las categorías de servicios por sucursal')}</p>
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
                <div className="category-grid">
                  {getFilteredCategories().map(category => (
                  <div key={category.id} className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
                    <div className="category-header">
                      <h4>{category.name}</h4>
                      <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                        {category.isActive ? 
                          t('admin.category_status_active', 'Activa') : 
                          t('admin.category_status_inactive', 'Inactiva')
                        }
                      </span>
                    </div>
                    <p>{category.description}</p>
                    <div className="category-meta">
                      <span className="branch-name">
                        {branches.find(b => b.id === category.branchId)?.name}
                      </span>
                    </div>
                    <div className="category-actions">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="btn-icon edit-btn"
                        title={t('admin.edit_category', 'Editar Categoría')}
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
                          ? t('admin.deactivate_category', 'Desactivar categoría')
                          : t('admin.activate_category', 'Activar categoría')
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
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-overlay" onClick={() => setShowForm(false)}></div>
          <div className="form-container">
            <div className="category-form">
              <h3>{editingCategory ? t('admin.edit_category', 'Editar Categoría') : t('admin.new_category', 'Nueva Categoría')}</h3>
              {error && (
                <div className="error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </div>
              )}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSubmit({
                  name: formData.get('name'),
                  description: formData.get('description'),
                  branchId: formData.get('branchId')
                });
              }}>
                <div className="form-group">
                  <label>{t('admin.category_name', 'Nombre de la Categoría')}</label>
                  <input 
                    name="name" 
                    type="text" 
                    className="form-input" 
                    defaultValue={editingCategory?.name || ''}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t('admin.category_description', 'Descripción')}</label>
                  <textarea 
                    name="description" 
                    className="form-input" 
                    defaultValue={editingCategory?.description || ''}
                    required
                  ></textarea>
                </div>
                {!editingCategory && (
                  <div className="form-group">
                    <label>{t('admin.select_branch', 'Sucursal')}</label>
                    <select name="branchId" className="form-input" required>
                      <option value="">{t('admin.select_branch_option', 'Selecciona una sucursal')}</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary" disabled={submitLoading}>
                    {t('common.cancel', 'Cancelar')}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                    {submitLoading ? (
                      <>
                        <div className="spinner-sm"></div>
                        {t('common.creating', 'Creando...')}
                      </>
                    ) : (
                      t('common.create', 'Crear')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.action === 'activate' ? 
          t('admin.activate_category', 'Activar categoría') : 
          t('admin.deactivate_category', 'Desactivar categoría')
        }
        message={confirmationModal.action === 'activate' ?
          t('admin.confirm_activate_category', '¿Estás seguro de que quieres activar la categoría "{{name}}"?', { name: confirmationModal.categoryName }) :
          t('admin.confirm_deactivate_category', '¿Estás seguro de que quieres desactivar la categoría "{{name}}"?', { name: confirmationModal.categoryName })
        }
        onConfirm={handleConfirmToggleStatus}
        onCancel={handleCancelToggleStatus}
        confirmText={confirmationModal.action === 'activate' ? 
          t('admin.activate_category', 'Activar') : 
          t('admin.deactivate_category', 'Desactivar')
        }
        confirmButtonClass={confirmationModal.action === 'activate' ? 'btn-success' : 'btn-danger'}
      />
    </div>
  );
};