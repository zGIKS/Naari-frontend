import { useTranslation } from 'react-i18next';
import CalendarLayout from '../components/CalendarLayout';

const PackagesPage = () => {
  const { t } = useTranslation();

  return (
    <CalendarLayout>
      <div className="packages-page">
        <div className="packages-header">
          <h1>{t('navigation.packages')}</h1>
          <p>{t('packages.subtitle', 'Gestiona paquetes y ofertas especiales')}</p>
        </div>
        
        <div className="packages-content">
          <div className="packages-placeholder">
            <h2>{t('packages.coming_soon', 'Próximamente')}</h2>
            <p>{t('packages.placeholder_message', 'La funcionalidad de paquetes estará disponible pronto.')}</p>
          </div>
        </div>
      </div>
    </CalendarLayout>
  );
};

export default PackagesPage;