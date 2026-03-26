// src/services/api/clinicaApiClient.js
// Cliente HTTP exclusivo para el API de Clínica (farmalink-clinica)
// DISTINTO de apiClient.js (core) y siatApiClient.js (facturación)

import axios from 'axios';

const CLINICA_API_BASE_URL =
  import.meta.env.VITE_CLINICA_API_URL ||
  'https://dinamax-clinicas.farmadinamica.com.bo/api/farmalink-clinica';

const clinicaApiClient = axios.create({
  baseURL: CLINICA_API_BASE_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

clinicaApiClient.interceptors.request.use(
  (config) => {
    console.log('📤 CLINICA REQUEST:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

clinicaApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ CLINICA ERROR:', error.response?.status, error.config?.url);
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.mensaje || data?.message || data?.error || `Error ${status}`;
      return Promise.reject({
        message,
        code: status,
        response: error.response,
        esErrorUsuario: status >= 400 && status < 500, // solo 4xx son errores de usuario
      });
    }
    return Promise.reject({
      message: 'Sin conexión',
      code: 0,
      esErrorUsuario: false, // red caída = silencio
    });
  }
);

export default clinicaApiClient;