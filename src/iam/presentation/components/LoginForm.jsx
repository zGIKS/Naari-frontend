import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthServiceFactory } from '../../infrastructure/factories/AuthServiceFactory';
import Toast from '../../../shared/components/Toast';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        window.location.href = '/dashboard';
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder={t('login.password')}
            />
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