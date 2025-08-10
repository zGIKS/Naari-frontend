import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthServiceFactory } from '../../iam/infrastructure/factories/AuthServiceFactory';

// Cache global para compartir datos entre instancias del hook
let globalUserCache = null;
let globalCacheTimestamp = null;
let globalObservers = [];
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para limpiar cache (usar en logout)
export const clearUserCache = () => {
  globalUserCache = null;
  globalCacheTimestamp = null;
  globalObservers.forEach(observer => observer(null));
};

export const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { i18n } = useTranslation();

  const updateState = useCallback((userData) => {
    setUser(userData);
    
    if (userData && userData.roles) {
      const roles = userData.roles;
      setUserRoles(roles);
      setUserRole(roles[0]);
    } else {
      setUserRoles([]);
      setUserRole(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Agregar este hook como observer
    globalObservers.push(updateState);
    
    const loadUserRole = async () => {
      try {
        // Verificar si tenemos datos en cache válidos
        const now = Date.now();
        if (globalUserCache && globalCacheTimestamp && 
            (now - globalCacheTimestamp < CACHE_DURATION)) {
          console.log('useUserRole - Using cached user data');
          updateState(globalUserCache);
          return;
        }

        const authService = AuthServiceFactory.getInstance();
        
        // Primero intentar obtener de la sesión actual sin hacer llamadas adicionales
        let currentUser = authService.getCurrentUser();
        
        // Si no tenemos usuario, validar sesión (esto podría hacer una llamada al API)
        if (!currentUser) {
          const isValid = await authService.validateSession();
          if (isValid) {
            currentUser = authService.getCurrentUser();
          }
        }
        
        console.log('useUserRole - Loading user role:', currentUser);
        
        // Actualizar cache global
        globalUserCache = currentUser;
        globalCacheTimestamp = now;
        
        // Notificar a todos los observers
        globalObservers.forEach(observer => {
          if (observer !== updateState) { // No notificar a sí mismo
            observer(currentUser);
          }
        });
        
        updateState(currentUser);
        
      } catch (error) {
        console.error('Error loading user role:', error);
        updateState(null);
      }
    };

    loadUserRole();

    // Cleanup: remover observer cuando el componente se desmonte
    return () => {
      globalObservers = globalObservers.filter(obs => obs !== updateState);
    };
  }, [updateState, i18n.language]);

  const hasRole = (role) => {
    return userRoles.includes(role);
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  return {
    user,
    userRole,
    userRoles,
    permissions,
    loading,
    isAdmin: hasRole('administrator'),
    isReceptionist: hasRole('receptionist'),
    isSpecialist: hasRole('esthetician'),
    hasRole,
    hasPermission
  };
};