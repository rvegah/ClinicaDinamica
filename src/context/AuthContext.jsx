// src/context/AuthContext.jsx - Context global de autenticación
// SI CLINICA FARMA

import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/api/authService";
import menuService from "../services/api/menuService";
import atencionMedicaService from "../services/api/atencionMedicaService";

// Crear el contexto
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [apiPermissions, setApiPermissions] = useState([]); // ✅ CORRECTO
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = authService.getCurrentUser();
        const savedPermissions = menuService.getPermissions();

        if (savedUser) {
          setUser(savedUser);
          setIsAuthenticated(true);

          if (savedPermissions) {
            setApiPermissions(savedPermissions);
          }

          console.log("✅ Sesión restaurada:", savedUser.usuario);
        }
      } catch (error) {
        console.error("❌ Error al restaurar sesión:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales con usuario, password e IP
   * @returns {Promise<Object>} Resultado del login
   */
  const login = async (credentials) => {
    try {
      setIsLoading(true);

      // 1. Llamar al API de login
      const loginResult = await authService.login(credentials);

      if (!loginResult.success) {
        throw new Error(loginResult.message);
      }

      // 2. Obtener permisos del usuario por nombre de usuario
      let userPermissions = [];
      try {
        // 🔥 CAMBIO: Usar nombre de usuario directamente
        const nombreUsuario = loginResult.user.usuario;

        if (nombreUsuario) {
          console.log(
            `📡 Obteniendo permisos para usuario: ${nombreUsuario}...`,
          );
          userPermissions = await menuService.getPermisosByUser(nombreUsuario);
        } else {
          console.warn("⚠️ Usuario no tiene nombre de usuario");
        }
      } catch (permError) {
        console.warn("⚠️ No se pudieron cargar permisos:", permError);
      }

      // 3. Guardar en sessionStorage
      authService.saveUser(loginResult.user);
      menuService.savePermissions(userPermissions);

      // 3b. Obtener personalMedico_ID y enriquecer el user
      try {
        const empleadoId = loginResult.user.empleado_ID;
        const rol = loginResult.user.rol;

        // SOLO PERSONAL DE SALUD
        const rolesSalud = ["Medico", "Enfermera"];

        if (empleadoId && rolesSalud.includes(rol)) {
          const personalRes =
            await atencionMedicaService.getPersonalMedico(empleadoId);

          if (personalRes.exitoso && personalRes.datos) {
            loginResult.user.personalMedico_ID =
              personalRes.datos.personalMedico_ID;
          }
        }
      } catch (personalErr) {
        console.warn("⚠️ No se pudo obtener personalMedico_ID:", personalErr);
      }
      // Re-guardar user ya enriquecido con personalMedico_ID
      authService.saveUser(loginResult.user);

      // 4. Actualizar estado
      setUser(loginResult.user);
      setApiPermissions(userPermissions);
      setIsAuthenticated(true);

      console.log("✅ Login completo:", {
        usuario: loginResult.user.usuario,
        rol: loginResult.user.rol,
        permisos: userPermissions.length,
      });

      return {
        success: true,
        message: "Inicio de sesión exitoso",
      };
    } catch (error) {
      console.error("❌ Error en login:", error);
      return {
        success: false,
        message: error.message || "Error al iniciar sesión",
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = () => {
    authService.logout();
    menuService.clearPermissions();
    setUser(null);
    setApiPermissions([]);
    setIsAuthenticated(false);
    sessionStorage.removeItem("wasAlreadyAuthenticated");
    console.log("✅ Sesión cerrada");

    // 🔥 CRÍTICO: Redirigir al login después de cerrar sesión
    window.location.href = "/clinica-farma/";
  };

  /**
   * Verificar si el usuario tiene acceso a una opción
   * @param {string} optionName - Nombre de la opción
   * @returns {boolean} true si tiene acceso
   */
  const hasAccess = (optionName) => {
    return menuService.hasAccessToOption(apiPermissions, optionName);
  };

  /**
   * Recargar permisos del usuario
   */
  const refreshPermissions = async () => {
    if (!user) return;

    try {
      const updatedPermissions = await menuService.getPermisosByUser(
        user.usuario,
      );
      menuService.savePermissions(updatedPermissions);
      setApiPermissions(updatedPermissions);
      console.log("✅ Permisos actualizados");
    } catch (error) {
      console.error("❌ Error al actualizar permisos:", error);
    }
  };

  // Valor del contexto
  const value = {
    user,
    apiPermissions,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasAccess,
    refreshPermissions,
    codigoEmpleado: user?.codigoEmpleado || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};

export default AuthContext;
