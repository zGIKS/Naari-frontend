import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import LoginHeader from '../../../shared/components/LoginHeader';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    // La sesión ya fue creada por el SessionManager, solo navegamos
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <LoginHeader />
      <div className="login-container">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;