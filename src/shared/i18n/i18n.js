import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      login: {
        title: 'Iniciar Sesión',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        submit: 'Ingresar',
        error: 'Error de autenticación',
        emailRequired: 'El correo es requerido',
        passwordRequired: 'La contraseña es requerida',
        invalidCredentials: 'Credenciales inválidas',
        activeSessionExists: 'Ya tienes una sesión activa. Cierra sesión primero.',
        anotherSessionActive: 'Hay otra sesión activa en otro dispositivo.',
        showPassword: 'Mostrar contraseña',
        hidePassword: 'Ocultar contraseña'
      },
      welcome: {
        title: 'Bienvenido a Naari',
        message: 'Bienvenido, {{name}}'
      },
      dashboard: {
        title: 'Panel de Control',
        welcome: 'Bienvenido a tu panel de control'
      },
      theme: {
        toggle: 'Cambiar tema',
        light: 'Claro',
        dark: 'Oscuro'
      },
      language: {
        toggle: 'Idioma'
      },
      profile: {
        toggle: 'Perfil',
        view: 'Ver perfil',
        settings: 'Configuración',
        logout: 'Cerrar sesión',
        title: 'Mi Perfil',
        edit: 'Editar Perfil',
        personal_info: 'Información Personal',
        first_name: 'Nombre',
        last_name: 'Apellido',
        email: 'Correo electrónico',
        password: 'Nueva contraseña',
        role: 'Rol',
        first_name_placeholder: 'Ingresa tu nombre',
        last_name_placeholder: 'Ingresa tu apellido',
        email_placeholder: 'correo@ejemplo.com',
        password_placeholder: 'Nueva contraseña',
        password_not_set: 'Clic para cambiar contraseña',
        double_click_to_edit: 'Doble clic para editar',
        edit_field: 'Editar campo',
        admin_only: 'Solo Admin',
        admin_only_field: 'Solo los administradores pueden editar este campo'
      },
      sidebar: {
        toggle: 'Menú',
        more_options: 'Más opciones'
      },
      roles: {
        administrator: 'Administrador',
        receptionist: 'Recepcionista',
        esthetician: 'Especialista',
        loading: 'Cargando...'
      },
      navigation: {
        dashboard: 'Panel de Control',
        admin: 'Panel de Administración',
        clients: 'Clientes',
        users: 'Usuarios',
        services: 'Servicios',
        products: 'Productos',
        branches: 'Sucursales',
        appointments: 'Citas',
        analytics: 'Analytics',
        settings: 'Configuraciones',
        catalog: 'Servicios y productos',
        'my-appointments': 'Mi Agenda',
        'my-clients': 'Mis clientes'
      },
      settings: {
        title: 'Configuraciones',
        subtitle: 'Personaliza tu experiencia en la aplicación',
        appearance: 'Apariencia',
        'appearance.description': 'Personaliza el tema y la apariencia de la aplicación',
        theme: 'Tema',
        'theme.description': 'Elige entre tema claro u oscuro',
        language: 'Idioma',
        'language.description': 'Selecciona el idioma de la interfaz',
        'language.interface': 'Idioma de la interfaz',
        'language.interface.description': 'Cambia el idioma de todos los textos de la aplicación'
      },
      admin: {
        dashboard_title: 'Panel de Administración',
        dashboard_subtitle: 'Gestiona sucursales, categorías, productos y servicios',
        branches: 'Sucursales',
        categories: 'Categorías',
        products: 'Productos',
        services: 'Servicios',
        branches_title: 'Gestión de Sucursales',
        branches_subtitle: 'Administra las sucursales del sistema',
        products_title: 'Gestión de Productos',
        products_subtitle: 'Administra el catálogo de productos disponibles',
        services_title: 'Gestión de Servicios',
        services_subtitle: 'Administra los servicios ofrecidos por cada sucursal',
        categories_title: 'Gestión de Categorías',
        categories_subtitle: 'Administra las categorías de servicios por sucursal',
        all_branches: 'Todas las sucursales',
        new_category: 'Nueva Categoría',
        edit_category: 'Editar Categoría',
        no_categories: 'No hay categorías',
        no_categories_message: 'Comienza creando categorías para tus servicios',
        activate_category: 'Activar categoría',
        deactivate_category: 'Desactivar categoría',
        confirm_activate_category: '¿Estás seguro de que quieres activar la categoría "{{name}}"?',
        confirm_deactivate_category: '¿Estás seguro de que quieres desactivar la categoría "{{name}}"?',
        category_status_active: 'Activa',
        category_status_inactive: 'Inactiva',
        category_name: 'Nombre de la Categoría',
        category_description: 'Descripción',
        select_branch: 'Sucursal',
        select_branch_option: 'Selecciona una sucursal',
        category_error_invalid_data: 'Datos inválidos. Verifica que todos los campos estén correctos.',
        category_error_unauthorized: 'No tienes autorización. Inicia sesión nuevamente.',
        category_error_forbidden: 'No tienes permisos para crear categorías.',
        category_error_conflict: 'Ya existe una categoría con ese nombre en esta sucursal.',
        category_error_server: 'Error del servidor. Intenta nuevamente más tarde.',
        category_error_network: 'Error de conexión. Verifica tu conexión a internet.',
        category_error_general: 'Error al crear la categoría. Intenta nuevamente.',
        categories_list: 'Lista de Categorías',
        active_categories: 'Activas',
        inactive_categories: 'Inactivas',
        all_categories: 'Todas'
      },
      common: {
        loading: 'Cargando...',
        save: 'Guardar',
        cancel: 'Cancelar',
        saving: 'Guardando...',
        create: 'Crear',
        creating: 'Creando...'
      },
      validation: {
        email_invalid: 'Email inválido',
        password_min_length: 'Mínimo 8 caracteres',
        password_requirements: 'Debe contener mayúscula, minúscula, número y símbolo',
        first_name_required: 'Nombre requerido',
        last_name_required: 'Apellido requerido',
        email_admin_only: 'Solo los administradores pueden modificar el email'
      }
    }
  },
  en: {
    translation: {
      login: {
        title: 'Login',
        email: 'Email',
        password: 'Password',
        submit: 'Sign In',
        error: 'Authentication error',
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        invalidCredentials: 'Invalid credentials',
        activeSessionExists: 'You already have an active session. Please logout first.',
        anotherSessionActive: 'There is another active session on another device.',
        showPassword: 'Show password',
        hidePassword: 'Hide password'
      },
      welcome: {
        title: 'Welcome to Naari',
        message: 'Welcome, {{name}}'
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome to your dashboard'
      },
      theme: {
        toggle: 'Toggle theme',
        light: 'Light',
        dark: 'Dark'
      },
      language: {
        toggle: 'Language'
      },
      profile: {
        toggle: 'Profile',
        view: 'View profile',
        settings: 'Settings',
        logout: 'Logout',
        title: 'My Profile',
        edit: 'Edit Profile',
        personal_info: 'Personal Information',
        first_name: 'First Name',
        last_name: 'Last Name',
        email: 'Email',
        password: 'New password',
        role: 'Role',
        first_name_placeholder: 'Enter your first name',
        last_name_placeholder: 'Enter your last name',
        email_placeholder: 'email@example.com',
        password_placeholder: 'New password',
        password_not_set: 'Click to change password',
        double_click_to_edit: 'Double click to edit',
        edit_field: 'Edit field',
        admin_only: 'Admin Only',
        admin_only_field: 'Only administrators can edit this field'
      },
      sidebar: {
        toggle: 'Menu',
        more_options: 'More options'
      },
      roles: {
        administrator: 'Administrator',
        receptionist: 'Receptionist',
        esthetician: 'Specialist',
        loading: 'Loading...'
      },
      navigation: {
        dashboard: 'Dashboard',
        admin: 'Admin Panel',
        clients: 'Clients',
        users: 'Users',
        services: 'Services',
        products: 'Products',
        branches: 'Branches',
        appointments: 'Appointments',
        analytics: 'Analytics',
        settings: 'Settings',
        catalog: 'Services & Products',
        'my-appointments': 'My Schedule',
        'my-clients': 'My Clients'
      },
      settings: {
        title: 'Settings',
        subtitle: 'Customize your app experience',
        appearance: 'Appearance',
        'appearance.description': 'Customize the theme and appearance of the app',
        theme: 'Theme',
        'theme.description': 'Choose between light or dark theme',
        language: 'Language',
        'language.description': 'Select the interface language',
        'language.interface': 'Interface language',
        'language.interface.description': 'Change the language of all app texts'
      },
      admin: {
        dashboard_title: 'Administration Panel',
        dashboard_subtitle: 'Manage branches, categories, products and services',
        branches: 'Branches',
        categories: 'Categories',
        products: 'Products',
        services: 'Services',
        branches_title: 'Branch Management',
        branches_subtitle: 'Manage system branches',
        products_title: 'Product Management',
        products_subtitle: 'Manage available product catalog',
        services_title: 'Service Management',
        services_subtitle: 'Manage services offered by each branch',
        categories_title: 'Category Management',
        categories_subtitle: 'Manage service categories by branch',
        all_branches: 'All branches',
        new_category: 'New Category',
        edit_category: 'Edit Category',
        no_categories: 'No categories',
        no_categories_message: 'Start by creating categories for your services',
        activate_category: 'Activate category',
        deactivate_category: 'Deactivate category',
        confirm_activate_category: 'Are you sure you want to activate the category "{{name}}"?',
        confirm_deactivate_category: 'Are you sure you want to deactivate the category "{{name}}"?',
        category_status_active: 'Active',
        category_status_inactive: 'Inactive',
        category_name: 'Category Name',
        category_description: 'Description',
        select_branch: 'Branch',
        select_branch_option: 'Select a branch',
        category_error_invalid_data: 'Invalid data. Please check that all fields are correct.',
        category_error_unauthorized: 'Unauthorized. Please login again.',
        category_error_forbidden: 'You do not have permission to create categories.',
        category_error_conflict: 'A category with that name already exists in this branch.',
        category_error_server: 'Server error. Please try again later.',
        category_error_network: 'Connection error. Please check your internet connection.',
        category_error_general: 'Error creating category. Please try again.',
        categories_list: 'Category List',
        active_categories: 'Active',
        inactive_categories: 'Inactive',
        all_categories: 'All'
      },
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        saving: 'Saving...',
        create: 'Create',
        creating: 'Creating...'
      },
      validation: {
        email_invalid: 'Invalid email',
        password_min_length: 'Minimum 8 characters',
        password_requirements: 'Must contain uppercase, lowercase, number and symbol',
        first_name_required: 'First name required',
        last_name_required: 'Last name required',
        email_admin_only: 'Only administrators can modify email'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('naari_language') || 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;