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

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

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
