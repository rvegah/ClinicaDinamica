// src/App.jsx - CORREGIDO (sin BrowserRouter interno)

import React from "react";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./app/theme";
import { UserProvider } from "./modules/user-management/context/UserContext";

import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./shared/components/LoginPage";
import DashboardLayout from "./shared/components/DashboardLayout";
import Dashboard from "./shared/components/Dashboard";
import UserManagementPage from "./modules/user-management/pages/UserManagementPage";
import EditProfilePage from "./modules/user-management/components/EditProfilePage";
import FacturacionPage from "./modules/facturacion/pages/FacturacionPage";

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import PacientesPage from "./modules/patients/pages/PacientesPage";
import RegistrarPacientePage from "./modules/patients/pages/RegistrarPacientePage";
import EditarPacientePage from "./modules/patients/pages/EditarPacientePage";

import AgendarCitaPage from "./modules/agendamiento/pages/AgendarCitaPage";
import BuscarCitasPage from "./modules/agendamiento/pages/BuscarCitasPage";

import SignosVitalesPage from "./modules/consulta/pages/SignosVitalesPage";
import ConsultaMedicaPage from "./modules/consulta/pages/ConsultaMedicaPage";
import ServicioEnfermeriaPage from "./modules/enfermeria/pages/ServicioEnfermeriaPage";

import ReporteIngresosPage from "./modules/reportes/pages/ReporteIngresosPage";

// Redirección post-login
function DashboardRedirect({ children }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    const wasAuthenticated = sessionStorage.getItem("wasAlreadyAuthenticated");
    if (!wasAuthenticated) {
      navigate("/dashboard", { replace: true });
      sessionStorage.setItem("wasAlreadyAuthenticated", "true");
    }
  }, [navigate]);

  return children;
}

function ProtectedRoutes() {
  const { isAuthenticated, logout, user, apiPermissions } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <UserProvider>
      <DashboardRedirect>
        <DashboardLayout
          onLogout={logout}
          currentUser={{
            ...user,
            apiPermissions: apiPermissions,
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users/*" element={<UserManagementPage />} />
            <Route path="/profile" element={<EditProfilePage />} />

            {/* Facturación */}
            <Route path="/facturacion/nueva" element={<FacturacionPage />} />

            {/* Pacientes */}
            <Route
              path="/pacientes/registrar"
              element={<RegistrarPacientePage />}
            />
            <Route path="/pacientes/buscar" element={<PacientesPage />} />
            <Route
              path="/pacientes/editar/:id"
              element={<EditarPacientePage />}
            />

            {/* Agendamiento */}
            <Route
              path="/agendamiento/reservar"
              element={<AgendarCitaPage />}
            />
            <Route
              path="/agendamiento/disponibilidad"
              element={<BuscarCitasPage />}
            />
            <Route
              path="/agendamiento/confirmar"
              element={<BuscarCitasPage />}
            />
            <Route
              path="/agendamiento/citas-dia"
              element={<BuscarCitasPage />}
            />
            <Route
              path="/agendamiento/sala-espera"
              element={<BuscarCitasPage />}
            />
            <Route
              path="/agendamiento/lista-espera"
              element={<BuscarCitasPage />}
            />
            <Route
              path="/agendamiento/reprogramar"
              element={<BuscarCitasPage />}
            />
            <Route
              path="/agendamiento/cancelar"
              element={<BuscarCitasPage />}
            />

            <Route path="/consulta/signos-vitales" element={<SignosVitalesPage />} />
            <Route path="/consulta/registrar" element={<ConsultaMedicaPage />} />            
            <Route path="/emergencias/atencion" element={<ServicioEnfermeriaPage />} />

            <Route path="/reportes/ingresos" element={<ReporteIngresosPage />} />

            {/* Wildcard SIEMPRE AL FINAL */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DashboardLayout>
      </DashboardRedirect>
    </UserProvider>
  );
}

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
