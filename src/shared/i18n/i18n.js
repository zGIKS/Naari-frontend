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
        anotherSessionActive: 'Hay otra sesión activa en otro dispositivo.'
      },
      welcome: {
        title: 'Bienvenido a Naari',
        message: 'Bienvenido, {{name}}'
      },
      theme: {
        toggle: 'Cambiar tema'
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
        anotherSessionActive: 'There is another active session on another device.'
      },
      welcome: {
        title: 'Welcome to Naari',
        message: 'Welcome, {{name}}'
      },
      theme: {
        toggle: 'Toggle theme'
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