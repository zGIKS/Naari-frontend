import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthServiceFactory } from '../../iam/infrastructure/factories/AuthServiceFactory';

const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;