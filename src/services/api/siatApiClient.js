// src/services/api/siatApiClient.js
// Cliente HTTP exclusivo para el API de Facturación SIAT
// DISTINTO de apiClient.js (que apunta al core: dinamax-core.farmadinamica.com.bo)

import axios from 'axios';

const SIAT_API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://siat-dinamax-facturacion.farmadinamica.com.bo/api';

const siatApiClient = axios.create({
  baseURL: SIAT_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

siatApiClient.interceptors.request.use(
  (config) => {
    console.log('📤 SIAT REQUEST:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

siatApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ SIAT ERROR:', error.response?.status, error.config?.url);
    if (error.response) {
      const { status, data } = error.response;
      // Buscar mensaje en todos los campos posibles
      const message = data?.message || data?.error || data?.mensaje || `Error ${status}`;
      return Promise.reject({
        message,
        code: status,
        response: error.response,
      });
    }
    return Promise.reject({
      message: 'Sin conexión con el servidor de facturación',
      code: 0,
    });
  }
);

export default siatApiClient;