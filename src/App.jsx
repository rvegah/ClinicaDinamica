// src/App.jsx - VERSIÓN ACTUALIZADA con apiPermissions

import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./app/theme";
import { UserProvider } from "./modules/user-management/context/UserContext";

// Importar AuthProvider y useAuth
import { AuthProvider, useAuth } from "./context/AuthContext";

// Componentes
import LoginPage from "./shared/components/LoginPage";
import DashboardLayout from "./shared/components/DashboardLayout";
import Dashboard from "./shared/components/Dashboard";
import UserManagementPage from "./modules/user-management/pages/UserManagementPage";
import EditProfilePage from "./modules/user-management/components/EditProfilePage";
//import SalesPage from "./modules/sales/pages/SalesPage";

// Componente para redireccionar al dashboard en sesiones restauradas
function DashboardRedirect({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const wasAuthenticated = sessionStorage.getItem("wasAlreadyAuthenticated");

    // Si es la primera vez después del login, redirigir al dashboard
    if (!wasAuthenticated) {
      console.log('🔄 Primera carga después del login, redirigiendo al dashboard');
      navigate("/dashboard", { replace: true });
      sessionStorage.setItem("wasAlreadyAuthenticated", "true");
    }
  }, [navigate]);

  return children;
}

// Componente de rutas protegidas que usa AuthContext
function ProtectedRoutes() {
  const { isAuthenticated, isLoading, logout, user, apiPermissions } = useAuth(); // 🆕 Agregado apiPermissions

  // Si no está autenticado, mostrar LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Si está autenticado, mostrar el layout con rutas
  return (
    <UserProvider>
      <BrowserRouter>
        <DashboardRedirect>
          <DashboardLayout 
            onLogout={logout} 
            currentUser={{
              ...user,
              apiPermissions: apiPermissions // 🆕 Pasar permisos del API
            }}
          >
            <Routes>
              {/* Ruta principal - siempre redirige al dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard principal */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Gestión de usuarios (CRUD de usuarios) */}
              <Route path="/users/*" element={<UserManagementPage />} />

              {/* Perfil personal del usuario actual */}
              <Route path="/profile" element={<EditProfilePage />} />

              {/* Ventas */}
              {/*<Route path="/ventas/*" element={<SalesPage />} />*/}

              {/* Cualquier ruta desconocida redirige al dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </DashboardRedirect>
      </BrowserRouter>
    </UserProvider>
  );
}

// Componente principal de la App
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <AuthProvider>
          <ProtectedRoutes />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;