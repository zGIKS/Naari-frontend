import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropPackageBuilder } from './DragDropPackageBuilder';

/**
 * PackageForm - Formulario para crear/editar paquetes
 */
export const PackageForm = ({ 
  catalogFactory, 
  initialPackage = null,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stockQuantity: '',
    ...initialPackage
  });
  const [packageContent, setPackageContent] = useState({
    products: initialPackage?.products || [],
    services: initialPackage?.services || []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialPackage) {
      setFormData({
        name: initialPackage.name || '',
        description: initialPackage.description || '',
        stockQuantity: initialPackage.stockQuantity || ''
      });
      setPackageContent({
        products: initialPackage.products || [],
        services: initialPackage.services || []
      });
    }
  }, [initialPackage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Para el campo de stock, validar que sea un número positivo
    if (name === 'stockQuantity') {
      const numValue = parseInt(value);
      if (value === '' || (numValue > 0 && numValue <= 9999)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePackageContentChange = (newContent) => {
    setPackageContent(newContent);
    
    // Limpiar error de contenido si se agregaron items
    if ((newContent.products.length > 0 || newContent.services.length > 0) && errors.content) {
      setErrors(prev => ({ ...prev, content: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('packages.errors.nameRequired');
    } else if (formData.name.trim().length < 3) {
      newErrors.name = t('packages.errors.nameMinLength');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('packages.errors.descriptionRequired');
    } else if (formData.description.trim().length < 10) {
      newErrors.description = t('packages.errors.descriptionMinLength');
    }

    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 1) {
      newErrors.stockQuantity = t('packages.errors.stockRequired');
    }

    if (packageContent.products.length === 0 && packageContent.services.length === 0) {
      newErrors.content = t('packages.errors.contentRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotals = () => {
    const productTotal = packageContent.products.reduce((sum, item) => 
      sum + (item.packagePrice * item.quantity), 0
    );
    const serviceTotal = packageContent.services.reduce((sum, item) => 
      sum + (item.packagePrice * item.quantity), 0
    );
    return productTotal + serviceTotal;
  };

  const determinePackageType = () => {
    const hasProducts = packageContent.products.length > 0;
    const hasServices = packageContent.services.length > 0;
    
    if (hasProducts && hasServices) return 'mixed';
    if (hasProducts) return 'product';
    if (hasServices) return 'service';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const packageData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: determinePackageType(),
        products: packageContent.products,
        services: packageContent.services,
        totalPrice: calculateTotals(),
        stockQuantity: parseInt(formData.stockQuantity)
      };

      await onSave(packageData);
    } catch (error) {
      console.error('Error saving package:', error);
      setErrors({ submit: error.message || t('packages.errors.saveFailed') });
    } finally {
      setLoading(false);
    }
  };

  const totals = {
    originalTotal: packageContent.products.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0
    ) + packageContent.services.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0
    ),
    packageTotal: calculateTotals()
  };

  const savings = totals.originalTotal - totals.packageTotal;
  const savingsPercent = totals.originalTotal > 0 ? (savings / totals.originalTotal) * 100 : 0;

  return (
    <div className="package-form">
      <div className="package-form-header">
        <h2>{isEditing ? t('packages.editPackage') : t('packages.createPackage')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="package-form-content">
        {/* Información básica del paquete */}
        <div className="form-section">
          <h3>{t('packages.basicInfo')}</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">{t('packages.name')} *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder={t('packages.namePlaceholder')}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="stockQuantity">{t('packages.stock')} *</label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                min="1"
                max="9999"
                className={errors.stockQuantity ? 'error' : ''}
                placeholder={t('packages.stockPlaceholder')}
                onFocus={(e) => e.target.select()}
              />
              {errors.stockQuantity && <span className="error-message">{errors.stockQuantity}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('packages.description')} *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className={errors.description ? 'error' : ''}
              placeholder={t('packages.descriptionPlaceholder')}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
        </div>

        {/* Constructor de paquetes con drag and drop */}
        <div className="form-section">
          <h3>{t('packages.packageContent')} *</h3>
          {errors.content && <div className="error-message">{errors.content}</div>}
          
          <DragDropPackageBuilder
            catalogFactory={catalogFactory}
            onPackageChange={handlePackageContentChange}
            initialPackage={packageContent}
          />
        </div>

        {/* Resumen del paquete */}
        {(packageContent.products.length > 0 || packageContent.services.length > 0) && (
          <div className="form-section">
            <h3>{t('packages.packageSummary')}</h3>
            
            <div className="package-summary">
              <div className="summary-grid">
                <div className="summary-item">
                  <label>{t('packages.type')}:</label>
                  <span className="package-type">
                    {t(`packages.types.${determinePackageType()}`)}
                  </span>
                </div>
                
                <div className="summary-item">
                  <label>{t('packages.itemCount')}:</label>
                  <span>
                    {packageContent.products.length + packageContent.services.length} {t('packages.items')}
                  </span>
                </div>
                
                <div className="summary-item">
                  <label>{t('packages.originalPrice')}:</label>
                  <span>${totals.originalTotal.toFixed(2)}</span>
                </div>
                
                <div className="summary-item">
                  <label>{t('packages.packagePrice')}:</label>
                  <span className="package-price">${totals.packageTotal.toFixed(2)}</span>
                </div>
                
                {savings > 0 && (
                  <div className="summary-item savings">
                    <label>{t('packages.totalSavings')}:</label>
                    <span>${savings.toFixed(2)} ({savingsPercent.toFixed(1)}%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="form-actions">
          {errors.submit && <div className="error-message">{errors.submit}</div>}
          
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            {t('common.cancel')}
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? t('common.saving') : (isEditing ? t('common.update') : t('common.create'))}
          </button>
        </div>
      </form>
    </div>
  );
};