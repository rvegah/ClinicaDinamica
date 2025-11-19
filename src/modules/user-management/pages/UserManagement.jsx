// src/modules/user-management/pages/UserManagement.jsx
// Página contenedora principal que maneja las rutas de usuarios

import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useUsers } from "../context/UserContext";

import UserList from "../components/UserList";
import CreateUserForm from "../components/CreateUserForm";
import EditUserForm from "../components/EditUserForm";
import AssignPermissions from "../components/AssignPermissions";
import AssignSchedule from "../components/AssignSchedule";

const UserManagement = () => {
  const location = useLocation();
  const { clearForm, setSelectedUser } = useUsers();

  /**
   * 🧭 Efecto que detecta cambios de ruta dentro del módulo /users/*
   * y limpia el formulario cuando el usuario navega a /users/new
   */
  useEffect(() => {
    console.log("📍 Cambio de ruta detectado:", location.pathname);

    if (location.pathname.endsWith("/new")) {
      console.log("🧼 Entrando a 'Nuevo usuario' → limpiando estado global");
      clearForm();
      setSelectedUser(null);
    }

    if (location.pathname.endsWith("/list") || location.pathname === "/users") {
      console.log("📋 Entrando a 'Lista de usuarios' → reseteando estado");
      clearForm();
      setSelectedUser(null);
    }

    if (location.pathname.includes("/edit/")) {
      console.log("✏️ Entrando a 'Editar usuario'");
      // Aquí no se limpia, porque se necesitan los datos cargados
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/list" element={<UserList />} />
      <Route path="/new" element={<CreateUserForm />} />
      <Route path="/edit/:id" element={<EditUserForm />} />
      <Route path="/permissions" element={<AssignPermissions />} />
      <Route path="/schedule" element={<AssignSchedule />} />
    </Routes>
  );
};

export default UserManagement;
