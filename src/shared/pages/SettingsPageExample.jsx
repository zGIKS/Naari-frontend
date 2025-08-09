import React from 'react';
import { useTranslation } from 'react-i18next';
import CalendarLayout from '../components/CalendarLayout';
import { UserPreferences } from '../components/UserPreferences';

/**
 * SettingsPage - Ejemplo de cómo integrar el componente UserPreferences
 */
export const SettingsPageExample = () => {
  const { t } = useTranslation();

  return (
    <CalendarLayout>
      <div className="settings-page">
        <div className="page-header">
          <h1>{t('settings.title', 'Configuraciones')}</h1>
          <p>{t('settings.subtitle', 'Personaliza tu experiencia en la aplicación')}</p>
        </div>

        <div className="page-content">
          <div className="settings-container">
            <UserPreferences />
          </div>
        </div>
      </div>
    </CalendarLayout>
  );
};