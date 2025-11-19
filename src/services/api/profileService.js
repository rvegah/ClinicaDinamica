// src/services/api/profileService.js
// Servicios para gestión de perfil del usuario logueado

import apiClient from "./apiClient";

const profileService = {
  /**
   * Obtener perfil del usuario actual desde sessionStorage
   * @returns {Object|null} Datos del usuario o null
   */
  getCurrentUserProfile() {
    try {
      const userJson = sessionStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        console.log("✅ Perfil cargado desde sessionStorage:", user);
        return user;
      }
      console.warn("⚠️ No hay usuario en sessionStorage");
      return null;
    } catch (error) {
      console.error("❌ Error al obtener perfil:", error);
      return null;
    }
  },

  /**
   * Actualizar perfil del usuario actual
   * PUT /api/farmalink-core/InicioSesion/ActualizarPerfilUsuario
   *
   * @param {Object} profileData - Datos del perfil a actualizar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async updateProfile(profileData) {
    try {
      console.log("📤 Actualizando perfil del usuario:", profileData.usuario);

      const includePassword =
        typeof profileData.password === "string" &&
        profileData.password.trim().length > 0;

      const payload = {
        usuario: profileData.usuario,
        nombreCompleto: profileData.nombreCompleto || "",
        apellidos: profileData.apellidos || "",
        celular: profileData.telefono || "",
        correo: profileData.email || "",
        fotoPerfil: profileData.fotoPerfil || "",
        puntoVenta: profileData.sucursal || "",
        codigoEmpleadoAlta: profileData.usuario,
        password: profileData.password?.trim() || "", // ← SIEMPRE incluir
        passwordConfirmado:
          profileData.confirmarPassword?.trim() ||
          profileData.password?.trim() ||
          "", // ← SIEMPRE incluir
      };

      console.log(
        "🧾 Payload de actualización de perfil:",
        JSON.stringify(payload, null, 2)
      );

      const response = await apiClient.put(
        "/InicioSesion/ActualizarPerfilUsuario",
        payload
      );

      if (response.data?.exitoso) {
        console.log("✅ Perfil actualizado exitosamente:", response.data);

        // Actualizar sessionStorage con los nuevos datos
        const currentUser = this.getCurrentUserProfile();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            nombres: profileData.nombreCompleto, // ← Guardar como "nombres"
            apellidos: profileData.apellidos,
            nombreCompleto: `${profileData.nombreCompleto} ${profileData.apellidos}`, // ← Mantener compatibilidad
            celular: profileData.telefono,
            correo: profileData.email,
          };
          sessionStorage.setItem("user", JSON.stringify(updatedUser));
          console.log("✅ SessionStorage actualizado con nuevo perfil");
        }

        return {
          success: true,
          data: response.data,
          message: response.data?.mensaje || "Perfil actualizado correctamente",
        };
      } else {
        console.warn("⚠️ Respuesta no exitosa:", response.data);
        return {
          success: false,
          message:
            response.data?.mensaje || "Error en la actualización del perfil",
        };
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        console.group("🧩 Errores de validación del backend");
        console.table(error.response.data.errors);
        console.groupEnd();
      }
      console.error("❌ Error actualizando perfil:", error);

      return {
        success: false,
        message: error.message || "Error en la solicitud de actualización",
        error,
      };
    }
  },
};

export default profileService;
