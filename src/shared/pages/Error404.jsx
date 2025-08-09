import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import './Error404.css';

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const Error404 = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`error404-container ${theme}`}> 
      <div className={`error404-content ${theme}`}> 
        {/* Floating elements */}
        <div className="error404-floating-elements">
          <div className="floating-element floating-element-1">
            <SearchIcon />
          </div>
          <div className="floating-element floating-element-2">
            <div className="floating-dot"></div>
          </div>
          <div className="floating-element floating-element-3">
            <div className="floating-square"></div>
          </div>
        </div>

        <div className="error404-code-container">
          <div className={`error404-big-code ${theme}`}>
            <span className="error404-digit">4</span>
            <span className="error404-digit-zero">0</span>
            <span className="error404-digit">4</span>
          </div>
        </div>

        <div className="error404-text-content">
          <h1 className={`error404-title ${theme}`}>
            {t('error404.title', 'Página no encontrada')}
          </h1>
          <p className={`error404-message ${theme}`}>
            {t('error404.message', 'La página que buscas no existe o ha sido movida.')}
          </p>
          <p className={`error404-suggestion ${theme}`}>
            {t('error404.suggestion', 'Verifica la URL o regresa a la página principal para continuar navegando.')}
          </p>
        </div>

        <div className="error404-actions">
          <button className="error404-btn error404-btn-primary" onClick={() => navigate('/')}>
            <HomeIcon />
            {t('error404.home', 'Ir a la página principal')}
          </button>
          <button className="error404-btn error404-btn-secondary" onClick={() => window.history.back()}>
            {t('error404.back', 'Regresar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error404;
