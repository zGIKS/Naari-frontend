import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CalendarLayout from '../../../shared/components/CalendarLayout';
import { AuthServiceFactory } from '../../infrastructure/factories/AuthServiceFactory';

const CalendarPage = () => {
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
    <CalendarLayout>
      <div className="Calendar-welcome">
        <h1>{t('Calendar.title')}</h1>
        <h2>{t('welcome.message', { name: user.full_name || user.firstName || user.email })}</h2>
      </div>
    </CalendarLayout>
  );
};

export default CalendarPage;