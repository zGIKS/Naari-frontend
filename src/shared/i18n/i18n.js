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
      common: {
        loading: 'Cargando...',
        save: 'Guardar',
        cancel: 'Cancelar',
        saving: 'Guardando...'
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
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        saving: 'Saving...'
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