import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../hooks/useLanguage';
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

// Icono para Español - Bandera simplificada
const EsIcon = () => (
  <svg width="16" height="12" viewBox="0 0 24 18" fill="currentColor">
    <rect x="0" y="0" width="24" height="18" fill="#AA151B"/>
    <rect x="0" y="4.5" width="24" height="9" fill="#F1BF00"/>
  </svg>
);

// Icono para English - Bandera simplificada
const EnIcon = () => (
  <svg width="16" height="12" viewBox="0 0 24 18" fill="currentColor">
    <rect x="0" y="0" width="24" height="18" fill="#012169"/>
    <g fill="white">
      <polygon points="0,0 8,0 0,6"/>
      <polygon points="0,18 0,12 8,18"/>
      <polygon points="24,0 16,0 24,6"/>
      <polygon points="24,18 24,12 16,18"/>
    </g>
    <rect x="10" y="0" width="4" height="18" fill="white"/>
    <rect x="0" y="7" width="24" height="4" fill="white"/>
    <rect x="11" y="0" width="2" height="18" fill="#C8102E"/>
    <rect x="0" y="8" width="24" height="2" fill="#C8102E"/>
  </svg>
);

const SettingsPage = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, loading: languageLoading } = useLanguage();

  const handleLanguageChange = (newLanguage) => {
    if (newLanguage !== currentLanguage) {
      changeLanguage(newLanguage);
    }
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
                <div className="theme-toggle-wrapper">
                  <button
                    onClick={toggleTheme}
                    className={`theme-toggle-button ${theme} active`}
                  >
                    <div className="theme-toggle-icon">
                      {theme === 'light' ? <SunIcon /> : <MoonIcon />}
                    </div>
                    <span className="theme-toggle-label">
                      {theme === 'light' ? t('theme.light', 'Claro') : t('theme.dark', 'Oscuro')}
                    </span>
                  </button>
                </div>
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
                <div className="language-selector-wrapper">
                  <div className="language-selector">
                    <button
                      onClick={() => handleLanguageChange('es')}
                      className={`language-option ${currentLanguage === 'es' ? 'active' : ''}`}
                      disabled={languageLoading}
                    >
                      <div className="language-icon">
                        <EsIcon />
                      </div>
                      <span>Español</span>
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`language-option ${currentLanguage === 'en' ? 'active' : ''}`}
                      disabled={languageLoading}
                    >
                      <div className="language-icon">
                        <EnIcon />
                      </div>
                      <span>English</span>
                    </button>
                  </div>
                  {languageLoading && (
                    <div className="settings-loading-overlay">
                      <div className="spinner"></div>
                    </div>
                  )}
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