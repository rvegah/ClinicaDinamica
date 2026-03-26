// src/services/api/apiClient.js - Cliente HTTP base configurado

import axios from "axios";

// URL base del API
const API_BASE_URL =
  import.meta.env.VITE_CORE_API_URL ||
  "https://dinamax-core.farmadinamica.com.bo/api/dinamax-core";

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 15 segundos
  headers: {
    "Content-Type": "application/json",
  },
  // CRÍTICO: Habilitar cookies de sesión
  withCredentials: true,
});

// Interceptor de REQUEST - para debugging y agregar headers si es necesario
apiClient.interceptors.request.use(
  (config) => {
    console.log("📤 REQUEST:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("❌ REQUEST ERROR:", error);
    return Promise.reject(error);
  },
);

// Interceptor de RESPONSE - manejo de errores unificado
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ RESPONSE:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ RESPONSE ERROR:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    // Manejo de errores específicos
    if (error.response) {
      // El servidor respondió con un código de error
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.warn("⚠️ Sesión expirada");

          // 🔥 limpiar sesión local
          sessionStorage.clear();
          localStorage.clear();

          // 🔥 redirigir sin mostrar error feo
          window.location.href = "/clinica-farma/";

          return Promise.reject({
            message: "La sesión expiró",
            code: 401,
          });

        case 403:
          // Prohibido - sin permisos
          return Promise.reject({
            message: data?.mensaje || "No tienes permisos para esta acción",
            code: 403,
          });

        case 404:
          // No encontrado
          return Promise.reject({
            message: data?.mensaje || "Recurso no encontrado",
            code: 404,
          });

        case 500:
          return Promise.reject({
            message: "Ocurrió un problema temporal. Intente nuevamente.",
            code: 500,
            esErrorUsuario: false,
          });

        default:
          return Promise.reject({
            message: data?.mensaje || "Error en la solicitud",
            code: status,
          });
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      return Promise.reject({
        message: "No se pudo conectar con el servidor",
        code: 0,
      });
    } else {
      // Algo pasó al configurar la petición
      return Promise.reject({
        message: error.message || "Error desconocido",
        code: -1,
      });
    }
  },
);

export default apiClient;
