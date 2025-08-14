import { useTranslation } from 'react-i18next';

const Spinner = ({ 
  size = 'md', 
  message, 
  fullScreen = false,
  className = '' 
}) => {
  const { t } = useTranslation();
  const loadingMessage = message || t('common.loading', 'Cargando...');
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner',
    lg: 'spinner-lg'
  };

  const spinnerClass = sizeClasses[size] || 'spinner';

  if (fullScreen) {
    return (
      <div className="loading-screen">
          <div className={spinnerClass}></div>
          <p>{loadingMessage}</p>
      </div>
    );
  }

  return (
    <div className={`loading-inline ${className}`}>
      <div className={spinnerClass}></div>
      {loadingMessage && <span className="loading-message">{loadingMessage}</span>}
    </div>
  );
};

export default Spinner;