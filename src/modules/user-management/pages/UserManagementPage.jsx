// UserManagementPage.jsx - Página principal refactorizada manteniendo toda la funcionalidad

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Componentes modularizados
import UserList from "../components/UserList";
import CreateUserForm from "../components/CreateUserForm";
import EditUserForm from "../components/EditUserForm";
import { UserProvider } from "../context/UserContext";
import AssignPermissions from "../components/AssignPermissions";
import AssignSchedule from "../components/AssignSchedule";

const UserManagementPageContent = () => {
  const [activeView, setActiveView] = useState("list");
  const location = useLocation();

  useEffect(() => {
    console.log("📍 Detectando cambio de ruta:", location.pathname);
    if (location.pathname.includes("/list") || location.pathname === "/users") {
      setActiveView("list");
    }
    // ...
  }, [location.key]);

  useEffect(() => {
    console.log("📍 Detectando cambio de ruta:", location.pathname);

    if (location.pathname.includes("/new")) {
      setActiveView("create");
    } else if (location.pathname.includes("/edit")) {
      setActiveView("edit");
    } else if (location.pathname.includes("/permissions")) {
      setActiveView("permissions");
    } else if (location.pathname.includes("/schedule")) {
      setActiveView("schedule");
    } else if (
      location.pathname.includes("/list") ||
      location.pathname === "/users"
    ) {
      setActiveView("list");
    } else {
      // fallback para cualquier ruta desconocida
      setActiveView("list");
    }
  }, [location.pathname]);

  // Función para crear nuevo usuario
  const handleCreateUser = () => {
    setActiveView("create");
  };

  // Función para editar usuario - asegurar cambio de vista
  const handleEditUser = (user) => {
    console.log("Cambiando a vista de edición para usuario:", user);
    setActiveView("edit");
  };

  // Función para volver a la lista
  const handleBackToList = () => {
    setActiveView("list");
  };

  // Handlers para funcionalidades futuras
  const handleAssignPermissions = (user) => {
    console.log("Cambiando a vista de permisos para usuario:", user);
    setActiveView("permissions");
  };

  const handleAssignSchedule = (user) => {
    console.log("Cambiando a vista de horarios para usuario:", user);
    setActiveView("schedule");
  };

  // Debug: Mostrar qué vista está activa
  console.log("Vista activa:", activeView);

  // Renderizado principal - manteniendo la lógica exacta del monolítico
  if (activeView === "create") {
    return <CreateUserForm onCancel={handleBackToList} />;
  }

  if (activeView === "edit") {
    return <EditUserForm onCancel={handleBackToList} />;
  }

  if (activeView === "permissions") {
  return (<AssignPermissions onCancel={handleBackToList} />
  );
}

  if (activeView === "schedule") {
    return <AssignSchedule onCancel={handleBackToList} />;
  }

  // Vista por defecto: lista de usuarios
  return (
    <UserList
      onCreateUser={handleCreateUser}
      onEditUser={handleEditUser}
      onAssignPermissions={handleAssignPermissions}
      onAssignSchedule={handleAssignSchedule}
    />
  );
};

// Componente envuelto con el Provider
const UserManagementPage = ({ key }) => {
  return (
    <UserProvider key={key}>
      <UserManagementPageContent key={key} />
    </UserProvider>
  );
};

export default UserManagementPage;
