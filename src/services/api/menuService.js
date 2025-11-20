// src/services/api/menuService.js
// Servicios para gestión de menús y permisos - SI CLINICA FARMA

import apiClient from "./apiClient";

const menuService = {
  /**
   * Obtener permisos del usuario por nombre de usuario
   * GET /api/dinamax-core/MenuOpciones/OpcionesPermisos/{usuario}
   *
   * @param {string} usuario - Nombre de usuario
   * @returns {Promise<Array>} Lista de permisos del usuario
   */
  async getPermisosByUser(usuario) {
    try {
      // 🔥 Convertir usuario a minúsculas (el API lo requiere)
      const usuarioLowerCase = usuario.toLowerCase();

      console.log(
        `📡 Solicitando permisos para usuario: ${usuarioLowerCase}...`
      );

      const response = await apiClient.get(
        `/MenuOpciones/OpcionesPermisos/${usuarioLowerCase}`
      );

      // El API devuelve un array directamente
      if (Array.isArray(response.data)) {
        console.log(`✅ ${response.data.length} permisos obtenidos`);
        return response.data;
      }

      // Si viene envuelto en un objeto
      if (response.data?.exitoso && response.data?.datos) {
        console.log(`✅ ${response.data.datos.length} permisos obtenidos`);
        return response.data.datos;
      }

      console.warn("⚠️ No se obtuvieron permisos");
      return [];
    } catch (error) {
      console.error("❌ Error obteniendo permisos:", error);
      throw error;
    }
  },

  /**
   * Guardar permisos en sessionStorage
   * @param {Array} permissions - Array de permisos
   */
  savePermissions(permissions) {
    try {
      sessionStorage.setItem("userPermissions", JSON.stringify(permissions));
      console.log("✅ Permisos guardados en sessionStorage");
    } catch (error) {
      console.error("❌ Error guardando permisos:", error);
    }
  },

  /**
   * Obtener permisos desde sessionStorage
   * @returns {Array} Lista de permisos
   */
  getPermissions() {
    try {
      const permissionsJson = sessionStorage.getItem("userPermissions");
      if (permissionsJson) {
        const permissions = JSON.parse(permissionsJson);
        return permissions;
      }
      return [];
    } catch (error) {
      console.error("❌ Error obteniendo permisos:", error);
      return [];
    }
  },

  /**
   * Limpiar permisos de sessionStorage
   */
  clearPermissions() {
    try {
      sessionStorage.removeItem("userPermissions");
      console.log("✅ Permisos limpiados de sessionStorage");
    } catch (error) {
      console.error("❌ Error limpiando permisos:", error);
    }
  },

  /**
   * Verificar si el usuario tiene acceso a una opción específica
   * @param {Array} permissions - Array de permisos del usuario
   * @param {string} optionName - Nombre de la opción a verificar
   * @returns {boolean} true si tiene acceso
   */
  hasAccessToOption(permissions, optionName) {
    if (!permissions || permissions.length === 0) {
      return false;
    }

    // Buscar en opciones principales
    const hasMainOption = permissions.some(
      (option) => option.nombreOpcion === optionName
    );

    if (hasMainOption) {
      return true;
    }

    // Buscar en subopciones
    const hasSubOption = permissions.some((option) => {
      if (option.subOpcionesMenu && Array.isArray(option.subOpcionesMenu)) {
        return option.subOpcionesMenu.some(
          (subOption) => subOption.nombreOpcion === optionName
        );
      }
      return false;
    });

    return hasSubOption;
  },

  /**
   * Obtener permisos por rol (plantilla)
   * GET /api/MenuOpciones/OpcionesPermisosRol/{nombreRol}
   *
   * @param {string} nombreRol - Nombre del rol
   * @returns {Promise<Array>} Lista de IDs de permisos del rol
   */
  async getPermisosByRol(nombreRol) {
    try {
      console.log(`📡 Obteniendo permisos de rol: ${nombreRol}...`);

      const response = await apiClient.get(
        `/MenuOpciones/OpcionesPermisosRol/${nombreRol}`
      );

      if (Array.isArray(response.data)) {
        console.log(`✅ ${response.data.length} permisos del rol obtenidos`);
        return response.data;
      }

      if (response.data?.exitoso && response.data?.datos) {
        console.log(
          `✅ ${response.data.datos.length} permisos del rol obtenidos`
        );
        return response.data.datos;
      }

      console.warn("⚠️ No se obtuvieron permisos del rol");
      return [];
    } catch (error) {
      console.error("❌ Error obteniendo permisos del rol:", error);
      throw error;
    }
  },
};

export default menuService;
