import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../hooks/useLanguage';

/**
 * UserPreferences - Componente para configurar preferencias de usuario
 */
export const UserPreferences = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, loading: themeLoading } = useTheme();
  const { currentLanguage, changeLanguage, availableLanguages, loading: languageLoading } = useLanguage();

  const handleThemeChange = () => {
    toggleTheme();
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    changeLanguage(newLanguage);
  };

  if (themeLoading || languageLoading) {
    return (
      <div className="preferences-loading">
        <div className="spinner"></div>
        <p>{t('common.loading', 'Cargando preferencias...')}</p>
      </div>
    );
  }

  return (
    <div className="user-preferences">
      <div className="preferences-section">
        <h3>{t('settings.appearance', 'Apariencia')}</h3>
        
        {/* Selector de Tema */}
        <div className="preference-item">
          <div className="preference-info">
            <label>{t('settings.theme', 'Tema')}</label>
            <p>{t('settings.theme_description', 'Elige entre tema claro u oscuro')}</p>
          </div>
          <div className="preference-control">
            <button
              onClick={handleThemeChange}
              className={`theme-toggle ${theme}`}
              disabled={themeLoading}
            >
              <div className="theme-toggle-track">
                <div className="theme-toggle-thumb">
                  {theme === 'light' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </div>
              </div>
              <span>{theme === 'light' ? t('theme.light', 'Claro') : t('theme.dark', 'Oscuro')}</span>
            </button>
          </div>
        </div>

        {/* Selector de Idioma */}
        <div className="preference-item">
          <div className="preference-info">
            <label>{t('settings.language', 'Idioma')}</label>
            <p>{t('settings.language_description', 'Selecciona tu idioma preferido')}</p>
          </div>
          <div className="preference-control">
            <select
              value={currentLanguage}
              onChange={handleLanguageChange}
              className="language-select"
              disabled={languageLoading}
            >
              {availableLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};