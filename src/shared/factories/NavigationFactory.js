export class NavigationFactory {
  static createSidebarItems(userRoles, permissions = []) {
    const hasRole = (role) => userRoles?.includes(role);
    const hasPermission = (permission) => permissions?.includes(permission);

    if (hasRole('administrator')) {
      return this.createAdministratorNavigation(permissions);
    }
    
    if (hasRole('receptionist')) {
      return this.createReceptionistNavigation(permissions);
    }
    
    if (hasRole('esthetician')) {
      return this.createEstheticianNavigation(permissions);
    }

    return [];
  }

  static createAdministratorNavigation(permissions) {
    return [
      {
        icon: 'CalendarIcon',
        label: 'navigation.Calendar',
        path: '/Calendar',
        id: 'Calendar'
      },
      {
        icon: 'AdminIcon',
        label: 'navigation.admin',
        path: '/admin',
        id: 'admin'
      },
      {
        icon: 'ClientsIcon',
        label: 'navigation.clients',
        path: '/clients',
        id: 'clients'
      },
      {
        icon: 'CatalogIcon',
        label: 'navigation.catalog',
        path: '/catalog',
        id: 'catalog'
      },
      {
        icon: 'BranchesIcon',
        label: 'navigation.branches',
        path: '/branches',
        id: 'branches',
        permission: 'branches:read',
        subItems: [
          {
            label: 'Crear sucursal',
            path: '/branches/create',
            permission: 'branches:create'
          }
        ]
      },
      {
        icon: 'AppointmentsIcon',
        label: 'navigation.appointments',
        path: '/appointments',
        id: 'appointments',
        permission: 'appointments:read',
        subItems: [
          {
            label: 'Agendar cita',
            path: '/appointments/create',
            permission: 'appointments:create'
          },
          {
            label: 'Ver todas las citas',
            path: '/appointments/list',
            permission: 'appointments:read'
          }
        ]
      },
      {
        icon: 'AnalyticsIcon',
        label: 'navigation.analytics',
        path: '/analytics',
        id: 'analytics',
        permission: 'analytics:read',
        subItems: [
          {
            label: 'Reportes generales',
            path: '/analytics/reports',
            permission: 'analytics:read'
          },
          {
            label: 'Desempeño por usuario',
            path: '/analytics/performance',
            permission: 'analytics:read'
          }
        ]
      }
    ];
  }

  static createReceptionistNavigation(permissions) {
    return [
      {
        icon: 'CalendarIcon',
        label: 'navigation.Calendar',
        path: '/Calendar',
        id: 'Calendar'
      },
      {
        icon: 'ClientsIcon',
        label: 'navigation.clients',
        path: '/clients',
        id: 'clients'
      },
      {
        icon: 'AppointmentsIcon',
        label: 'navigation.appointments',
        path: '/appointments',
        id: 'appointments',
        permission: 'appointments:read',
        subItems: [
          {
            label: 'Agendar cita',
            path: '/appointments/create',
            permission: 'appointments:create'
          },
          {
            label: 'Ver citas',
            path: '/appointments/list',
            permission: 'appointments:read'
          }
        ]
      },
      {
        icon: 'CatalogIcon',
        label: 'navigation.catalog',
        path: '/catalog',
        id: 'catalog'
      }
    ];
  }

  static createEstheticianNavigation(permissions) {
    return [
      {
        icon: 'CalendarIcon',
        label: 'navigation.Calendar',
        path: '/Calendar',
        id: 'Calendar'
      },
      {
        icon: 'AgendaIcon',
        label: 'navigation.my-appointments',
        path: '/my-appointments',
        id: 'my-appointments',
        subItems: [
          {
            label: 'Ver citas asignadas',
            path: '/my-appointments/assigned',
            permission: 'appointments:read:own'
          }
        ]
      },
      {
        icon: 'ClientsIcon',
        label: 'navigation.my-clients',
        path: '/my-clients',
        id: 'my-clients',
        subItems: [
          {
            label: 'Ver historial por cliente',
            path: '/my-clients/history',
            permission: 'clients:read:own'
          }
        ]
      }
    ];
  }

  static filterByPermissions(navigationItems, permissions) {
    return navigationItems
      .filter(item => !item.permission || permissions.includes(item.permission))
      .map(item => ({
        ...item,
        subItems: item.subItems 
          ? item.subItems.filter(subItem => !subItem.permission || permissions.includes(subItem.permission))
          : undefined
      }))
      .filter(item => !item.subItems || item.subItems.length > 0);
  }
}