// src/services/api/userService.js
// Servicios para gestión de usuarios - CON ACTUALIZACIÓN

import apiClient from "./apiClient";

const userService = {
  /**
   * ✅ Obtener tipos de usuario (INT, EXT, API, SVC, TMP)
   * GET /api/farmalink-core/InicioSesion/TipoUsuarios
   */
  getTipoUsuarios: async () => {
    try {
      console.log("📡 Obteniendo tipos de usuario...");
      const response = await apiClient.get("/InicioSesion/TipoUsuarios");

      if (response.data.exitoso && response.data.datos) {
        console.log(
          "✅ Tipos de usuario obtenidos:",
          response.data.datos.length
        );
        return response.data.datos;
      }

      console.warn("⚠️ No se obtuvieron tipos de usuario");
      return [];
    } catch (error) {
      console.error("❌ Error obteniendo tipos de usuario:", error);
      throw error;
    }
  },

  /**
   * ✅ Obtener lista de roles (Administrador, Farmacéutico, etc)
   * GET /api/farmalink-core/MenuOpciones/ListaRoles1
   */
  getRoles: async (organizacionId = 1) => {
    try {
      console.log(`📡 Obteniendo roles de organización ${organizacionId}...`);
      const response = await apiClient.get(
        `/MenuOpciones/ListaRoles/${organizacionId}`
      );

      if (response.data && Array.isArray(response.data)) {
        console.log("✅ Roles obtenidos:", response.data.length);
        return response.data;
      }

      console.warn("⚠️ Respuesta de roles no es un array:", response.data);
      return [];
    } catch (error) {
      console.error("❌ Error obteniendo roles:", error);
      throw error;
    }
  },

  /**
   * ✅ Obtener sucursales de la organización
   * GET /api/farmalink-core/Organizacion/SucursalesOrganizacion/{organizacionId}
   */
  getSucursales: async (organizacionId = 1) => {
    try {
      console.log(
        `📡 Obteniendo sucursales de organización ${organizacionId}...`
      );
      const response = await apiClient.get(
        `/Organizacion/SucursalesOrganizacion/${organizacionId}`
      );

      if (response.data.exitoso && response.data.datos) {
        console.log("✅ Sucursales obtenidas:", response.data.datos.length);
        return response.data.datos;
      }

      console.warn("⚠️ No se obtuvieron sucursales");
      return [];
    } catch (error) {
      console.error("❌ Error obteniendo sucursales:", error);
      throw error;
    }
  },

  /**
   * ✅ Obtener equipos de cómputo de una sucursal
   * GET /api/farmalink-core/Organizacion/EquipoComputoSucursal/{sucursalId}
   */
  getEquiposBySucursal: async (sucursalId) => {
    try {
      console.log(`📡 Obteniendo equipos de sucursal ${sucursalId}...`);
      const response = await apiClient.get(
        `/Organizacion/EquipoComputoSucursal/${sucursalId}`
      );

      if (response.data.exitoso && response.data.datos) {
        console.log("✅ Equipos obtenidos:", response.data.datos.length);
        return response.data.datos;
      }

      console.warn("⚠️ No se obtuvieron equipos");
      return [];
    } catch (error) {
      console.error("❌ Error obteniendo equipos:", error);
      throw error;
    }
  },

  /**
   * ✅ Crear nuevo usuario
   * POST /api/farmalink-core/InicioSesion/AdicionarNuevoUsuario
   */
  createUser: async (userData) => {
    try {
      console.log(
        "📤 Enviando solicitud de creación de usuario:",
        userData.usuario
      );

      const response = await apiClient.post(
        "/InicioSesion/AdicionarNuevoUsuario",
        userData
      );

      console.log("✅ Usuario creado exitosamente:", response.data);

      return {
        success: true,
        data: response.data,
        message: "Usuario registrado correctamente",
      };
    } catch (error) {
      console.error("❌ Error creando usuario:", error);

      const errorMessage =
        error.response?.data?.mensaje ||
        error.response?.data?.message ||
        error.message ||
        "Error al registrar usuario";

      return {
        success: false,
        message: errorMessage,
        error: error,
      };
    }
  },

  /**
   * ✅ Buscar perfiles de usuarios
   * GET /api/farmalink-core/InicioSesion/BuscarPerfilUsuarios?Sucursal={sucursal}
   *
   * @param {string} sucursal - Nombre de la sucursal ("SAN MARTIN", "BRASIL", etc) o "*" para todas
   * @returns {Promise<Array>} Lista de usuarios
   */
  buscarUsuarios: async (sucursal = "*") => {
    try {
      console.log(`📡 Buscando usuarios de sucursal: ${sucursal}...`);

      const response = await apiClient.get(
        "/InicioSesion/BuscarPerfilUsuarios",
        {
          params: { Sucursal: sucursal },
        }
      );

      if (response.data.exitoso && response.data.datos) {
        console.log("✅ Usuarios obtenidos:", response.data.datos.length);

        // Transformar datos del API al formato del frontend
        const usuariosTransformados = response.data.datos.map((user) => ({
          id: user.usuario_ID,
          usuario: user.usuario,
          nombreCompleto: user.nombreCompleto,
          nombreEquipo: user.equipo,
          email: user.correoElectronico,
          rol: user.rol,
          sucursal: user.sucursal,
          estado: user.estado,
          ultimoAcceso: user.ultimoAcceso
            ? new Date(user.ultimoAcceso).toLocaleDateString("es-BO")
            : "Nunca",
          avatar: user.avatar,
          rol_ID: user.rol_ID,
          sucursal_ID: user.sucursal_ID,
          // Campos adicionales que podrían necesitarse
          cedula: user.cedula || "",
          telefono: user.celular || "",
          genero: user.genero || "",
          direccion: user.direccion || "",
        }));

        return usuariosTransformados;
      }

      console.warn("⚠️ No se obtuvieron usuarios");
      return [];
    } catch (error) {
      console.error("❌ Error buscando usuarios:", error);
      throw error;
    }
  },

  /**
   * 🆕 Obtener detalle completo de un usuario por ID
   * GET /api/farmalink-core/InicioSesion/UsuarioInformacionDetalle?Usuario_ID={id}
   */
  getUserDetail: async (usuarioId) => {
    try {
      console.log(`📡 Solicitando detalle de usuario ID ${usuarioId}...`);
      const response = await apiClient.get(
        `/InicioSesion/UsuarioInformacionDetalle`,
        { params: { Usuario_ID: usuarioId } }
      );

      if (response.data?.exitoso && response.data?.datos) {
        const u = response.data.datos;

        // Mapeo completo al formato del formulario
        const userDetail = {
          usuario: u.usuario || "",
          sucursal: u.sucursal || "",
          sucursal_ID: u.sucursal_ID || "", // <- asegúrate que backend lo devuelva
          rol: u.rol || "",
          rol_ID: u.rol_ID || "",
          tipoUsuarioInterno: u.tipoUsuario || "",
          tipoUsuarioDescripcion:
            u.tipoUsuario === "INT"
              ? "Interno"
              : u.tipoUsuario === "EXT"
              ? "Externo"
              : u.tipoUsuario === "API"
              ? "API"
              : u.tipoUsuario || "",
          nombreCompleto: u.nombreCompleto || "",
          apellidos: u.apellidos || "",
          cedula: u.cedula || "",
          titulo: u.titulo || "",
          profesion: u.profesion || "",
          telefono: u.celular || "",
          genero: u.genero || "M",
          direccion: u.direccion || "",
          email: u.correo || "",
          estado: u.estado || "Habilitado",
        };

        console.log("✅ Usuario detalle procesado:", userDetail);
        return userDetail;
      }

      console.warn("⚠️ No se encontraron datos del usuario.");
      return null;
    } catch (error) {
      console.error("❌ Error al obtener detalle del usuario:", error);
      throw error;
    }
  },

  /**
   * 🆕 Actualizar usuario existente
   * PUT /api/farmalink-core/InicioSesion/ActualizarEditarUsuario
   *
   * @param {object} userData - Datos del usuario a actualizar
   * @returns {Promise<object>} Resultado de la operación
   */
  updateUser: async (userData) => {
    try {
      console.log(`📤 Actualizando usuario:`, userData.usuario);

      const includePassword =
        typeof userData.password === "string" &&
        userData.password.trim().length > 0;

      const payload = {
        Sucursal_ID: parseInt(userData.sucursal_ID),
        Rol_ID: parseInt(userData.rol_ID),
        Usuario: userData.usuario,
        TipoUsuario: userData.tipoUsuarioInterno || "INT", // requerido por backend
        // Password solo si el usuario ingresó una nueva SIN espacios
        ...(includePassword && { Password: userData.password.trim() }),
        Titulo: userData.titulo || "Sr.",
        Nombres: userData.nombreCompleto || "",
        Apellidos: userData.apellidos || "",
        Cedula: userData.cedula || "",
        Celular: userData.telefono || "",
        Correo: userData.email || "",
        Direccion: userData.direccion || "",
        Genero: userData.genero || "M",
        CodigoEmpleadoAlta: "admin", // TODO: reemplazar por usuario logueado
      };

      console.log(
        "🧾 Payload final enviado al API:",
        JSON.stringify(payload, null, 2)
      );

      const response = await apiClient.put(
        "/InicioSesion/ActualizarEditarUsuario",
        payload
      );

      if (response.data?.exitoso) {
        console.log("✅ Usuario actualizado exitosamente:", response.data);
        return {
          success: true,
          data: response.data,
          message:
            response.data?.mensaje || "Usuario actualizado correctamente",
        };
      } else {
        console.warn("⚠️ Respuesta no exitosa:", response.data);
        return {
          success: false,
          message: response.data?.mensaje || "Error en la actualización",
        };
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        console.group("🧩 Errores de validación del backend");
        console.table(error.response.data.errors);
        console.groupEnd();
      }
      console.error("❌ Error actualizando usuario:", error);

      // Mostrar detalle si hay errores de validación
      if (error?.data?.errors) {
        console.table(error.data.errors);
      }

      return {
        success: false,
        message: error.message || "Error en la solicitud",
        error,
      };
    }
  },
};

export default userService;
