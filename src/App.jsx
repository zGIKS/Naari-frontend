import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import ToastProvider from './shared/components/ToastProvider';
import ProtectedRoute from './shared/components/ProtectedRoute';
import PublicRoute from './shared/components/PublicRoute';
import './styles/main.css';
import './shared/i18n/i18n';

// Lazy loading de componentes principales
const Error404 = lazy(() => import('./shared/pages/Error404'));
const LoginPage = lazy(() => import('./iam/presentation/pages/LoginPage'));
const CalendarPage = lazy(() => import('./iam/presentation/pages/CalendarPage'));
const SettingsPage = lazy(() => import('./shared/pages/SettingsPage'));
const ProfilePage = lazy(() => import('./shared/pages/ProfilePage'));
const AdminCalendar = lazy(() => import('./catalog/presentation/pages/CalendarDashboard').then(module => ({ default: module.AdminCalendar })));
const CatalogPage = lazy(() => import('./catalog/presentation/pages/CatalogPage').then(module => ({ default: module.CatalogPage })));
const ClientPage = lazy(() => import('./clients/presentation/pages/ClientPage').then(module => ({ default: module.ClientPage })));
const CreateClientPage = lazy(() => import('./clients/presentation/pages/CreateClientPage').then(module => ({ default: module.CreateClientPage })));
const EditClientPage = lazy(() => import('./clients/presentation/pages/EditClientPage').then(module => ({ default: module.EditClientPage })));
const PackagesPage = lazy(() => import('./catalog/presentation/pages/PackagesPage').then(module => ({ default: module.PackagesPage })));

// Componente de loading mejorado
const LoadingSpinner = () => (
  <div className="loading-container" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'var(--background-color)',
    color: 'var(--text-color)'
  }}>
    <div className="spinner"></div>
    <span style={{ marginLeft: '12px' }}>Cargando...</span>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
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
          </Suspense>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;