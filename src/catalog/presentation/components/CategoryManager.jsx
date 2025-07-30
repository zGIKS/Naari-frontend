import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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

  const categoryService = catalogFactory.getCategoryService();
  const branchService = catalogFactory.getBranchService();

  useEffect(() => {
    loadBranches();
    loadCategories();
  }, []);

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
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      await categoryService.createCategory(formData);
      await loadCategories();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
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
          <div className="category-grid">
            {categories.length === 0 ? (
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
              categories
                .filter(cat => !selectedBranch || cat.branchId === selectedBranch)
                .map(category => (
                  <div key={category.id} className="category-card">
                    <h4>{category.name}</h4>
                    <p>{category.description}</p>
                    <div className="category-meta">
                      <span className="branch-name">
                        {branches.find(b => b.id === category.branchId)?.name}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-overlay" onClick={() => setShowForm(false)}></div>
          <div className="form-container">
            <div className="category-form">
              <h3>{t('admin.new_category', 'Nueva Categoría')}</h3>
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
                  <input name="name" type="text" className="form-input" required />
                </div>
                <div className="form-group">
                  <label>{t('admin.category_description', 'Descripción')}</label>
                  <textarea name="description" className="form-input" required></textarea>
                </div>
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
                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                    {t('common.cancel', 'Cancelar')}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {t('common.create', 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};