// src/services/api/authService.js - Servicios de autenticación

import apiClient from './apiClient';

const authService = {
  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales del usuario
   * @param {string} credentials.nombreUsuario - Nombre de usuario
   * @param {string} credentials.password - Contraseña
   * @param {string} credentials.direccion_IP - IP local del cliente
   * @returns {Promise<Object>} Datos del usuario autenticado
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/InicioSesion/InicioSesion', {
        nombreUsuario: credentials.nombreUsuario,
        password: credentials.password,
        direccion_IP: credentials.direccion_IP,
      });

      // Verificar respuesta exitosa
      if (response.data && response.data.exitoso) {
        const userData = response.data.datos;
        
        console.log('✅ Login exitoso:', {
          usuario: userData.usuario,
          rol: userData.rol,
          sucursal: userData.sucursal,
        });

        return {
          success: true,
          user: userData,
          message: response.data.mensaje,
        };
      } else {
        throw new Error(response.data?.mensaje || 'Error en el inicio de sesión');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Re-lanzar el error con formato consistente
      throw {
        success: false,
        message: error.message || 'Error al iniciar sesión',
        code: error.code || 500,
      };
    }
  },

  /**
   * Cerrar sesión (solo frontend, no hay endpoint)
   * Limpia el estado local y las cookies de sesión
   */
  logout() {
    try {
      // Limpiar sessionStorage
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userPermissions');
      
      console.log('✅ Sesión cerrada localmente');
      
      return {
        success: true,
        message: 'Sesión cerrada exitosamente',
      };
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      return {
        success: false,
        message: 'Error al cerrar sesión',
      };
    }
  },

  /**
   * Obtener usuario actual desde sessionStorage
   * @returns {Object|null} Datos del usuario o null si no hay sesión
   */
  getCurrentUser() {
    try {
      const userJson = sessionStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ Error al obtener usuario actual:', error);
      return null;
    }
  },

  /**
   * Guardar usuario en sessionStorage
   * @param {Object} user - Datos del usuario
   */
  saveUser(user) {
    try {
      sessionStorage.setItem('user', JSON.stringify(user));
      console.log('✅ Usuario guardado en sessionStorage');
    } catch (error) {
      console.error('❌ Error al guardar usuario:', error);
    }
  },

  /**
   * Verificar si hay una sesión activa
   * @returns {boolean} true si hay sesión activa
   */
  isAuthenticated() {
    const user = this.getCurrentUser();
    return user !== null;
  },
};

export default authService;