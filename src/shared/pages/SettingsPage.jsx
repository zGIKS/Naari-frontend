import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import CalendarLayout from '../components/CalendarLayout';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang).then(() => {
      localStorage.setItem('naari_language', newLang);
      // Forzar re-render completo
      window.location.reload();
    });
  };

  return (
    <CalendarLayout>
      <div className="settings-page">
        <div className="settings-header">
          <h1>{t('settings.title', 'Configuraciones')}</h1>
          <p>{t('settings.subtitle', 'Personaliza tu experiencia en la aplicación')}</p>
        </div>

        <div className="settings-sections">
          {/* Apariencia */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              {t('settings.appearance', 'Apariencia')}
            </h2>
            <p className="settings-section-description">
              {t('settings.appearance.description', 'Personaliza el tema y la apariencia de la aplicación')}
            </p>

            <div className="settings-option">
              <div className="settings-option-info">
                <label className="settings-option-label">
                  {t('settings.theme', 'Tema')}
                </label>
                <span className="settings-option-description">
                  {t('settings.theme.description', 'Elige entre tema claro u oscuro')}
                </span>
              </div>
              <div className="settings-option-control">
                <button
                  onClick={toggleTheme}
                  className={`theme-toggle-button ${theme}`}
                >
                  <div className="theme-toggle-slider">
                    <div className="theme-toggle-icon">
                      {theme === 'light' ? <SunIcon /> : <MoonIcon />}
                    </div>
                  </div>
                  <span className="theme-toggle-label">
                    {theme === 'light' ? t('theme.light', 'Claro') : t('theme.dark', 'Oscuro')}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Idioma */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              {t('settings.language', 'Idioma')}
            </h2>
            <p className="settings-section-description">
              {t('settings.language.description', 'Selecciona el idioma de la interfaz')}
            </p>

            <div className="settings-option">
              <div className="settings-option-info">
                <label className="settings-option-label">
                  {t('settings.language.interface', 'Idioma de la interfaz')}
                </label>
                <span className="settings-option-description">
                  {t('settings.language.interface.description', 'Cambia el idioma de todos los textos de la aplicación')}
                </span>
              </div>
              <div className="settings-option-control">
                <div className="language-selector">
                  <button
                    onClick={toggleLanguage}
                    className={`language-option ${i18n.language === 'es' ? 'active' : ''}`}
                  >
                    <GlobeIcon />
                    <span>Español</span>
                  </button>
                  <button
                    onClick={toggleLanguage}
                    className={`language-option ${i18n.language === 'en' ? 'active' : ''}`}
                  >
                    <GlobeIcon />
                    <span>English</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </CalendarLayout>
  );
};

export default SettingsPage;