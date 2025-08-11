import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';
import Spinner from '../../../shared/components/Spinner';

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
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, serviceId: null, serviceName: '' });

  const serviceService = catalogFactory.getServiceService();
  const categoryService = catalogFactory.getCategoryService();
  const branchService = catalogFactory.getBranchService();

  // Helper function to translate frequency units
  const getTranslatedFrequency = (service) => {
    if (service.treatment_frequency_value && service.treatment_frequency_unit) {
      const unitTranslations = {
        days: t('admin.days'),
        weeks: t('admin.weeks'), 
        months: t('admin.months')
      };
      const translatedUnit = unitTranslations[service.treatment_frequency_unit] || service.treatment_frequency_unit;
      return `${service.treatment_frequency_value} ${translatedUnit}`;
    }
    return service.treatmentFrequency; // Fallback para datos antiguos
  };

  const loadBranches = useCallback(async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data.filter(branch => branch.isActive));
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  }, [branchService]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryService.getAllCategoriesFromAllBranches(branches);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [categoryService, branches]);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await serviceService.getAllServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  }, [serviceService]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    if (branches.length > 0) {
      loadCategories();
      loadServices();
    }
  }, [branches, loadCategories, loadServices]);

  const handleEditService = async (service) => {
    try {
      // Obtener datos RAW del servicio específico desde la API para edición
      const rawServiceData = await serviceService.getServiceRawDataById(service.id);
      navigate('/catalog/services/edit', {
        state: { service: rawServiceData }
      });
    } catch (error) {
      console.error('Error loading service for edit:', error);
      // Fallback: usar los datos existentes si falla la petición
      navigate('/catalog/services/edit', {
        state: { service }
      });
    }
  };

  const handleDeleteService = (serviceId, serviceName) => {
    setConfirmDelete({
      isOpen: true,
      serviceId: serviceId,
      serviceName: serviceName
    });
  };

  const handleConfirmDelete = async () => {
    const { serviceId } = confirmDelete;
    setConfirmDelete({ isOpen: false, serviceId: null, serviceName: '' });

    try {
      await serviceService.deleteService(serviceId);
      setServices(services.filter(service => service.id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      alert(t('admin.service_error_delete', 'Error al eliminar el servicio'));
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ isOpen: false, serviceId: null, serviceName: '' });
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
            <Spinner message={t('services.loading', 'Cargando servicios...')} />
          </div>
        ) : (
          <div className="service-list">
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
              <>
                <div className="list-header">
                  <h3>{t('admin.services_list', 'Lista de Servicios')} ({services.length})</h3>
                </div>
                <div className="list-grid">
                  {services.map(service => (
                    <div key={service.id} className="service-card">
                      <div className="card-header">
                        <div className="service-info">
                          <h4>{service.name}</h4>
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
                        </div>
                        <div className="card-actions">
                          <button
                            onClick={() => handleEditService(service)}
                            className="btn-icon edit-btn"
                            title={t('common.edit', 'Editar')}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button 
                            className="btn-icon btn-danger" 
                            onClick={() => handleDeleteService(service.id, service.name)}
                            title={t('common.delete', 'Eliminar')}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="3,6 5,6 21,6"/>
                              <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="card-content">
                        <div className="service-description">
                          <p>{service.description}</p>
                        </div>

                        <div className="service-meta">
                          <div className="info-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            <span>{service.duration_minutes ? `${service.duration_minutes} min` : service.duration}</span>
                          </div>
                          
                          <div className="info-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7"/>
                              <rect x="14" y="3" width="7" height="7"/>
                              <rect x="14" y="14" width="7" height="7"/>
                              <rect x="3" y="14" width="7" height="7"/>
                            </svg>
                            <span>{categories.find(c => c.id === service.categoryId)?.name || t('admin.no_category', 'Sin categoría')}</span>
                          </div>
                        </div>

                        {service.benefits && (
                          <div className="service-section">
                            <h5>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,11 12,14 22,4"/>
                                <path d="M21,12v7a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V5a2,2,0,0,1,2-2h11"/>
                              </svg>
                              {t('admin.benefits', 'Beneficios')}
                            </h5>
                            <p>{service.benefits}</p>
                          </div>
                        )}

                        {service.treatmentIncludes && (
                          <div className="service-section">
                            <h5>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                              </svg>
                              {t('admin.service_includes', 'Incluye')}
                            </h5>
                            <p>{service.treatmentIncludes}</p>
                          </div>
                        )}

                        {service.treatmentFrequency && (
                          <div className="service-section">
                            <h5>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5L17 8m-5 5l-3.5 3.5M6.5 6.5L10 10"/>
                              </svg>
                              {t('admin.treatment_frequency', 'Frecuencia')}
                            </h5>
                            <p>{getTranslatedFrequency(service)}</p>
                          </div>
                        )}

                        {service.contraindications && (
                          <div className="service-section warning">
                            <h5>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                              </svg>
                              {t('admin.contraindications', 'Contraindicaciones')}
                            </h5>
                            <p>{service.contraindications}</p>
                          </div>
                        )}
                      </div>

                      <div className="card-footer">
                        <small className="text-muted">
                          {t('admin.created_at', 'Creado')}: {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : ''}
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
        isOpen={confirmDelete.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t('admin.delete_service', 'Eliminar Servicio')}
        message={t('admin.confirm_delete_service', '¿Estás seguro de que quieres eliminar el servicio "{{name}}"?', { name: confirmDelete.serviceName })}
        confirmText={t('admin.delete', 'Eliminar')}
        cancelText={t('common.cancel', 'Cancelar')}
        type="danger"
      />
    </div>
  );
};