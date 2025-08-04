import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * ServiceManager - Gestor de servicios estéticos
 */
export const ServiceManager = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const serviceService = catalogFactory.getServiceService();
  const categoryService = catalogFactory.getCategoryService();
  const branchService = catalogFactory.getBranchService();

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (branches.length > 0) {
      loadCategories();
      loadServices();
    }
  }, [branches]);

  const loadBranches = async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data.filter(branch => branch.isActive));
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategoriesFromAllBranches(branches);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await serviceService.getAllServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = (service) => {
    navigate('/catalog/services/edit', {
      state: { service }
    });
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm(t('admin.confirm_delete_service', '¿Estás seguro de que quieres eliminar este servicio?'))) {
      try {
        await serviceService.deleteService(serviceId);
        setServices(services.filter(service => service.id !== serviceId));
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Error al eliminar el servicio');
      }
    }
  };

  return (
    <div className="service-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>{t('admin.services_title', 'Gestión de Servicios')}</h2>
          <p>{t('admin.services_subtitle', 'Administra los servicios estéticos ofrecidos')}</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/catalog/services/new')}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {t('admin.new_service', 'Nuevo Servicio')}
          </button>
        </div>
      </div>

      <div className="manager-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('common.loading', 'Cargando servicios...')}</p>
          </div>
        ) : (
          <div className="service-grid">
            {services.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <h3>{t('admin.no_services', 'No hay servicios')}</h3>
                <p>{t('admin.no_services_message', 'Comienza creando servicios para tus clientes')}</p>
              </div>
            ) : (
              services.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <h4>{service.name}</h4>
                    <div className="service-actions">
                      <div className="service-price">
                        {service.isDiscountActive ? (
                          <>
                            <span className="original-price">${service.price}</span>
                            <span className="discounted-price">${service.getFinalPrice()}</span>
                            <span className="discount-badge">{service.discountPercent}% OFF</span>
                          </>
                        ) : (
                          <span className="price">${service.price}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditService(service)}
                        className="btn-icon edit-btn"
                        title={t('common.edit', 'Editar')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button 
                        className="btn-icon btn-danger" 
                        onClick={() => handleDelete(service.id)}
                        title={t('common.delete', 'Eliminar')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="service-info">
                    <p className="description">{service.description}</p>
                    <div className="service-meta">
                      <div className="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span>{service.duration_minutes ? `${service.duration_minutes} min` : service.duration}</span>
                      </div>
                      <div className="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"/>
                          <rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/>
                          <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        <span>{categories.find(c => c.id === service.categoryId)?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="service-benefits">
                    <h5>{t('admin.benefits', 'Beneficios')}</h5>
                    <p>{service.benefits}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
};