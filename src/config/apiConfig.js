// src/config/apiConfig.js
// Configuración del endpoint API

/**
 * Endpoint base del API
 * 
 * PRODUCCIÓN: https://tu-servidor-clinica.com/api/clinica-core
 * DESARROLLO: http://localhost:5000/api/clinica-core
 */

// 🏥 CLINICA FARMA
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  'https://dinamax-core.farmadinamica.com.bo/api/dinamax-core';

// Timeout de peticiones (15 segundos)
export const API_TIMEOUT = 15000;

// Otros endpoints específicos (si los necesitas en el futuro)
export const API_ENDPOINTS = {
  auth: '/InicioSesion',
  users: '/InicioSesion',
  menu: '/MenuOpciones',
  organization: '/Organizacion',
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  API_ENDPOINTS,
};