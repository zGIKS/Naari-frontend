import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ServiceManager - Gestor de servicios estéticos
 */
export const ServiceManager = ({ catalogFactory }) => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const serviceService = catalogFactory.getServiceService();
  const categoryService = catalogFactory.getCategoryService();

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
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

  const handleSubmit = async (formData) => {
    try {
      await serviceService.createService(formData);
      await loadServices();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating service:', error);
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
            onClick={() => setShowForm(true)}
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
                  <div className="service-info">
                    <p className="description">{service.description}</p>
                    <div className="service-meta">
                      <div className="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span>{service.duration}</span>
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

      {showForm && (
        <div className="form-modal">
          <div className="form-overlay" onClick={() => setShowForm(false)}></div>
          <div className="form-container large">
            <div className="service-form">
              <h3>{t('admin.new_service', 'Nuevo Servicio')}</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const isDiscountActive = formData.get('isDiscountActive') === 'on';
                const discountPercent = parseInt(formData.get('discountPercent')) || 0;
                const price = parseFloat(formData.get('price'));
                
                handleSubmit({
                  name: formData.get('name'),
                  description: formData.get('description'),
                  price: price,
                  duration: formData.get('duration'),
                  categoryId: formData.get('categoryId'),
                  benefits: formData.get('benefits'),
                  contraindications: formData.get('contraindications'),
                  treatmentFrequency: formData.get('treatmentFrequency'),
                  treatmentIncludes: formData.get('treatmentIncludes'),
                  isDiscountActive: isDiscountActive,
                  discountPercent: discountPercent,
                  discountedPrice: isDiscountActive ? price * (1 - discountPercent / 100) : 0
                });
              }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.service_name', 'Nombre del Servicio')}</label>
                    <input name="name" type="text" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.service_category', 'Categoría')}</label>
                    <select name="categoryId" className="form-input" required>
                      <option value="">{t('admin.select_category', 'Selecciona una categoría')}</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>{t('admin.service_description', 'Descripción')}</label>
                  <textarea name="description" className="form-input" rows="3" required minLength="10"></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.service_price', 'Precio')}</label>
                    <input name="price" type="number" step="0.01" min="0" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.service_duration', 'Duración')}</label>
                    <input name="duration" type="text" className="form-input" placeholder="Ej: 60 minutos" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('admin.service_benefits', 'Beneficios')}</label>
                  <textarea name="benefits" className="form-input" rows="3" required minLength="10"></textarea>
                </div>

                <div className="form-group">
                  <label>{t('admin.service_includes', 'El tratamiento incluye')}</label>
                  <textarea name="treatmentIncludes" className="form-input" rows="3" required minLength="10"></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.treatment_frequency', 'Frecuencia recomendada')}</label>
                    <input name="treatmentFrequency" type="text" className="form-input" placeholder="Ej: Cada 15 días" />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.contraindications', 'Contraindicaciones')}</label>
                    <input name="contraindications" type="text" className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <input name="isDiscountActive" type="checkbox" id="discount" />
                    <label htmlFor="discount">{t('admin.has_discount', 'Tiene descuento activo')}</label>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.discount_percent', 'Porcentaje de descuento')}</label>
                    <input name="discountPercent" type="number" min="0" max="100" className="form-input" />
                  </div>
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