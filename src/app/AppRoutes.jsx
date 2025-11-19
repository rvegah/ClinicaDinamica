// src/app/AppRoutes.jsx - MODIFICADO con AuthProvider y protección de rutas

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginPage from "../shared/components/LoginPage";
import DashboardLayout from "../shared/components/DashboardLayout";
import Dashboard from "../shared/components/Dashboard";
import SalesPage from "../modules/sales/pages/SalesPage";



// Módulo de gestión de usuarios (administrativo)
import UserManagementPage from "../modules/user-management/pages/UserManagementPage";

/**
 * Componente de rutas protegidas
 * Solo se renderiza si el usuario está autenticado
 */
function ProtectedRoutes() {
  const { isAuthenticated, isLoading, logout, user, permissions } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#05305A",
        }}
      >
        Cargando...
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Si está autenticado, mostrar dashboard con rutas
  return (
    <DashboardLayout
      onLogout={logout}
      currentUser={user}
      userPermissions={permissions}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* SEPARACIÓN CLARA DE FUNCIONALIDADES */}

        {/* Editar Perfil Personal - acceso desde menú de usuario */}
        {/*/<Route path="/profile" element={<EditProfilePage />} />*/}

        {/* Gestión Administrativa de Usuarios - acceso desde sidebar "Usuarios" */}
        <Route path="/users" element={<UserManagementPage key="usersList" />} />
        <Route
          path="/users/list"
          element={<UserManagementPage key="usersList" />}
        />
        <Route
          path="/users/new"
          element={<UserManagementPage key="usersNew" />}
        />
        <Route
          path="/users/*"
          element={<UserManagementPage key="usersAny" />}
        />

        {/* Rutas futuras de otros módulos */}
        <Route
          path="/productos/*"
          element={<div>Módulo de Productos (próximamente)</div>}
        />
        <Route
          path="/compras/*"
          element={<div>Módulo de Compras (próximamente)</div>}
        />
        <Route
          path="/proveedor/*"
          element={<div>Módulo de Proveedores (próximamente)</div>}
        />
        <Route path="/ventas/*" element={<SalesPage />} />
        <Route
          path="/traspasos/*"
          element={<div>Módulo de Traspasos (próximamente)</div>}
        />
        <Route
          path="/reportes/*"
          element={<div>Módulo de Reportes (próximamente)</div>}
        />
        <Route
          path="/configuracion/*"
          element={<div>Módulo de Configuración (próximamente)</div>}
        />

        <Route
          path="/access-security/*"
          element={<div>Módulo de Seguridad (próximamente)</div>}
        />
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </DashboardLayout>
  );
}

/**
 * Componente principal de rutas
 * Envuelve todo en el AuthProvider
 */
function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </AuthProvider>
  );
}

export default AppRoutes;
