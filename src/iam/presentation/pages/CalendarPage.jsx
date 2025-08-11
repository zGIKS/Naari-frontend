import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CalendarLayout from '../../../shared/components/CalendarLayout';
import { AuthServiceFactory } from '../../infrastructure/factories/AuthServiceFactory';

const CalendarPage = () => {
  const [user, setUser] = useState({ email: 'Usuario', full_name: 'Usuario' });
  const { t } = useTranslation();

  useEffect(() => {
    const authService = AuthServiceFactory.getInstance();
    const currentUser = authService.getCurrentUser();
    
    // Establecer el usuario con valores por defecto seguros
    if (currentUser) {
      setUser({
        ...currentUser,
        full_name: currentUser.full_name || currentUser.firstName || currentUser.email || 'Usuario',
        email: currentUser.email || 'usuario@ejemplo.com'
      });
    }
  }, []);

  return (
    <CalendarLayout>
      <div className="Calendar-welcome">
        <h1>{t('Calendar.title')}</h1>
        <h2>{t('welcome.message', { name: user?.full_name || user?.firstName || user?.email || 'Usuario' })}</h2>
      </div>
    </CalendarLayout>
  );
};

export default CalendarPage;