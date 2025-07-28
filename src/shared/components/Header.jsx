import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const Header = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
    localStorage.setItem('naari_language', newLang);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <h2>Naari</h2>
        </div>
        
        <div className="header-controls">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={t('theme.toggle')}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          
          <button
            type="button"
            onClick={toggleLanguage}
            className="language-toggle"
            aria-label="Toggle language"
          >
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;