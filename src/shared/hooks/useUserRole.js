import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthServiceFactory } from '../../iam/infrastructure/factories/AuthServiceFactory';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation(); // Para forzar re-render en cambio de idioma

  useEffect(() => {
    const loadUserRole = () => {
      try {
        const authService = AuthServiceFactory.getInstance();
        const currentUser = authService.getCurrentUser();
        
        console.log('useUserRole - Loading user role:', currentUser); // Debug log
        
        if (currentUser && currentUser.roles) {
          const roles = currentUser.roles;
          console.log('useUserRole - User roles found:', roles); // Debug log
          setUserRoles(roles);
          setUserRole(roles[0]); // Primer rol como principal
        } else {
          console.log('useUserRole - No roles found for user'); // Debug log
          setUserRoles([]);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error loading user role:', error);
        setUserRoles([]);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserRole();
  }, [i18n.language]); // Re-cargar cuando cambie el idioma

  const hasRole = (role) => {
    return userRoles.includes(role);
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  return {
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