import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import PublicRoute from './shared/components/PublicRoute';
import LoginPage from './iam/presentation/pages/LoginPage';
import DashboardPage from './iam/presentation/pages/DashboardPage';
import SettingsPage from './shared/pages/SettingsPage';
import ProfilePage from './shared/pages/ProfilePage';
import './styles/themes.css';
import './shared/i18n/i18n';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Rutas públicas - solo accesibles sin autenticación */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          {/* Rutas protegidas - requieren autenticación */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Todas las demás rutas protegidas de bounded contexts */}
          <Route 
            path="/products/*" 
            element={
              <ProtectedRoute>
                {/* Aquí irán las rutas del bounded context de productos */}
                <div>Products Module - Protected</div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/services/*" 
            element={
              <ProtectedRoute>
                {/* Aquí irán las rutas del bounded context de servicios */}
                <div>Services Module - Protected</div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users/*" 
            element={
              <ProtectedRoute>
                {/* Aquí irán las rutas del bounded context de usuarios */}
                <div>Users Module - Protected</div>
              </ProtectedRoute>
            } 
          />
          
          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Ruta 404 - también protegida */}
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <div>404 - Page Not Found</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;