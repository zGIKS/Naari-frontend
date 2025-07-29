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
        icon: 'DashboardIcon',
        label: 'Dashboard',
        path: '/dashboard',
        id: 'dashboard'
      },
      {
        icon: 'ClientsIcon',
        label: 'Clientes',
        path: '/clients',
        id: 'clients',
        permission: 'clients:read',
        subItems: [
          {
            label: 'Registrar cliente',
            path: '/clients/register',
            permission: 'clients:create'
          },
          {
            label: 'Lista de clientes',
            path: '/clients/list',
            permission: 'clients:read'
          }
        ]
      },
      {
        icon: 'UsersIcon',
        label: 'Usuarios',
        path: '/users',
        id: 'users',
        permission: 'users:read',
        subItems: [
          {
            label: 'Registrar usuario',
            path: '/users/register',
            permission: 'users:create'
          },
          {
            label: 'Lista de usuarios',
            path: '/users/list',
            permission: 'users:read'
          }
        ]
      },
      {
        icon: 'ServicesIcon',
        label: 'Servicios',
        path: '/services',
        id: 'services',
        permission: 'services:read',
        subItems: [
          {
            label: 'Registrar servicio',
            path: '/services/register',
            permission: 'services:create'
          },
          {
            label: 'Paquetes',
            path: '/services/packages',
            permission: 'services:read'
          },
          {
            label: 'Precios por sucursal',
            path: '/services/pricing',
            permission: 'services:update'
          }
        ]
      },
      {
        icon: 'ProductsIcon',
        label: 'Productos',
        path: '/products',
        id: 'products',
        permission: 'products:read',
        subItems: [
          {
            label: 'Registrar producto',
            path: '/products/register',
            permission: 'products:create'
          }
        ]
      },
      {
        icon: 'BranchesIcon',
        label: 'Sucursales',
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
        label: 'Citas',
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
        label: 'Analytics',
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
        icon: 'DashboardIcon',
        label: 'Dashboard',
        path: '/dashboard',
        id: 'dashboard'
      },
      {
        icon: 'ClientsIcon',
        label: 'Clientes',
        path: '/clients',
        id: 'clients',
        permission: 'clients:read',
        subItems: [
          {
            label: 'Registrar cliente',
            path: '/clients/register',
            permission: 'clients:create'
          },
          {
            label: 'Lista de clientes',
            path: '/clients/list',
            permission: 'clients:read'
          }
        ]
      },
      {
        icon: 'AppointmentsIcon',
        label: 'Citas',
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
        label: 'Servicios y productos',
        path: '/catalog',
        id: 'catalog',
        subItems: [
          {
            label: 'Ver servicios',
            path: '/services/view',
            permission: 'services:read'
          },
          {
            label: 'Ver productos',
            path: '/products/view',
            permission: 'products:read'
          }
        ]
      }
    ];
  }

  static createEstheticianNavigation(permissions) {
    return [
      {
        icon: 'DashboardIcon',
        label: 'Mi Panel',
        path: '/dashboard',
        id: 'dashboard'
      },
      {
        icon: 'AgendaIcon',
        label: 'Mi Agenda',
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
        label: 'Mis clientes',
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