import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthServiceFactory } from '../../iam/infrastructure/factories/AuthServiceFactory';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const authService = AuthServiceFactory.getInstance();
        
        // Validar sesión contra la API
        const isValid = await authService.validateSession();
        
        if (isValid) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;