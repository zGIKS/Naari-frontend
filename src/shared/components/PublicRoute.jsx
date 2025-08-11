import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthServiceFactory } from '../../iam/infrastructure/factories/AuthServiceFactory';
import Spinner from './Spinner';

const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem('naari_auth_token');
        
        // Si no hay token, no está autenticado
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verificar si el token es válido usando el mismo servicio que ProtectedRoute
        const authService = AuthServiceFactory.getInstance();
        const isValid = await authService.validateSession();
        
        if (isValid) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setIsAuthenticated(true);
          } else {
            // Token válido pero sin usuario, limpiar y tratar como no autenticado
            localStorage.removeItem('naari_auth_token');
            setIsAuthenticated(false);
          }
        } else {
          // Token inválido o expirado, limpiar storage
          localStorage.removeItem('naari_auth_token');
          setIsAuthenticated(false);
        }
      } catch {
        // Error de validación = token inválido, limpiar storage
        localStorage.removeItem('naari_auth_token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isLoading) {
    return <Spinner fullScreen={true} message="Verificando sesión..." />;
  }

  // Si está autenticado, redirigir a la página principal
  if (isAuthenticated) {
    return <Navigate to="/Calendar" replace />;
  }

  // No está autenticado, mostrar componente público
  return children;
};

export default PublicRoute;