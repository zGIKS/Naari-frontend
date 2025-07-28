import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../../shared/components/Header';
import { AuthServiceFactory } from '../../infrastructure/factories/AuthServiceFactory';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const authService = AuthServiceFactory.getInstance();
    const currentUser = authService.getCurrentUser();
    
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  if (!user) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header />
      
      <main className="dashboard-content">
        <h1>{t('welcome.title')}</h1>
        <h2>{t('welcome.message', { name: user.full_name || user.firstName || user.email })}</h2>
      </main>
    </div>
  );
};

export default DashboardPage;