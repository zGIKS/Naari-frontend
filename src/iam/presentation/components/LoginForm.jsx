import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthServiceFactory } from '../../infrastructure/factories/AuthServiceFactory';
import Toast from '../../../shared/components/Toast';

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authService = AuthServiceFactory.getInstance();
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        window.location.href = '/Calendar';
      } else {
        // Mapear errores específicos de sesión
        const errorKey = {
          'USER_NOT_ACTIVE': 'login.invalidCredentials',
          'NO_TOKEN_RECEIVED': 'login.error',
          'Authentication failed': 'login.invalidCredentials'
        }[result.error] || 'login.error';
        setError(t(errorKey));
      }
    } catch (err) {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-card">
        <h1 className="login-title">{t('login.title')}</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">{t('login.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder={t('login.email')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('login.password')}</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input password-input"
                placeholder={t('login.password')}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? '...' : t('login.submit')}
          </button>
        </form>
      </div>

      {error && (
        <Toast 
          message={error} 
          type="error" 
          onClose={() => setError('')} 
        />
      )}
    </>
  );
};

export default LoginForm;