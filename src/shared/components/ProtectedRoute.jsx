import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthServiceFactory } from '../../iam/infrastructure/factories/AuthServiceFactory';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const authService = AuthServiceFactory.getInstance();
        
        // Primero verificar cache local (rápido, sin spinner)
        const currentUser = authService.getCurrentUser();
        const token = localStorage.getItem('naari_auth_token');
        
        if (!token) {
          // Sin token = no autenticado (rápido)
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // Solo mostrar spinner si necesitamos validar contra API
        const isValid = await authService.validateSession();
        
        if (isValid && currentUser) {
          setIsAuthenticated(true);
          
          // Verificar si es administrador
          const userIsAdmin = currentUser?.role === 'administrator' || 
                             currentUser?.roles?.includes('administrator');
          setIsAdmin(userIsAdmin);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []); // Solo ejecutar una vez, no en cada cambio de ruta

  if (isLoading) {
    return <Spinner fullScreen={true} />;
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
          <Navigate to="/Calendar" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;