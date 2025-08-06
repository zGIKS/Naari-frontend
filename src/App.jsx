import Error404 from './shared/pages/Error404';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import PublicRoute from './shared/components/PublicRoute';
import LoginPage from './iam/presentation/pages/LoginPage';
import CalendarPage from './iam/presentation/pages/CalendarPage';
import SettingsPage from './shared/pages/SettingsPage';
import ProfilePage from './shared/pages/ProfilePage';
import { AdminCalendar } from './catalog/presentation/pages/CalendarDashboard';
import { CatalogPage } from './catalog/presentation/pages/CatalogPage';
import { ClientPage } from './clients/presentation/pages/ClientPage';
import { CreateClientPage } from './clients/presentation/pages/CreateClientPage';
import { EditClientPage } from './clients/presentation/pages/EditClientPage';
import { PackagesPage } from './catalog/presentation/pages/PackagesPage';
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
            path="/Calendar" 
            element={
              <ProtectedRoute>
                <CalendarPage />
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

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminCalendar />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/catalog/*" 
            element={
              <ProtectedRoute>
                <CatalogPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/clients" 
            element={
              <ProtectedRoute>
                <ClientPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/clients/create" 
            element={
              <ProtectedRoute>
                <CreateClientPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/clients/edit" 
            element={
              <ProtectedRoute>
                <EditClientPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/packages" 
            element={
              <ProtectedRoute>
                <PackagesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/packages/new" 
            element={
              <ProtectedRoute>
                <PackagesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/packages/edit/:id" 
            element={
              <ProtectedRoute>
                <PackagesPage />
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
          <Route path="/" element={<Navigate to="/Calendar" replace />} />
          
          {/* Ruta 404 - también protegida */}
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <Error404 />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;