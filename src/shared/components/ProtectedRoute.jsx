import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthServiceFactory } from '../../iam/infrastructure/factories/AuthServiceFactory';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
          
          // Verificar si es administrador
          const currentUser = authService.getCurrentUser();
          const userIsAdmin = currentUser?.role === 'administrator' || 
                             currentUser?.roles?.includes('administrator');
          setIsAdmin(userIsAdmin);
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

  if (requireAdmin && !isAdmin) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos de administrador para acceder a esta sección.</p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;