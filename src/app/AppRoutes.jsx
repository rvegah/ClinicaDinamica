import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../shared/components/LoginPage';
import DashboardLayout from '../shared/components/DashboardLayout';
import Dashboard from '../shared/components/Dashboard';
import UserManagementPage from '../modules/user-management/pages/UserManagementPage';
import UsersPage from '../modules/access-security/pages/UsersPage';

// Hook para verificar autenticación
const useAuth = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return { isAuthenticated };
};

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Componente para rutas públicas (solo login)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />

      {/* Rutas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserManagementPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Rutas futuras - Pacientes, Citas, etc. */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <div>Módulo de Pacientes - Por implementar</div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <div>Módulo de Citas - Por implementar</div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;