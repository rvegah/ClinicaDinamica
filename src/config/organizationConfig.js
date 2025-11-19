// src/config/organizationConfig.js
// 🔧 CONFIGURACIÓN TEMPORAL - Migración fácil a endpoints cuando estén listos

/**
 * ⚠️ CONFIGURACIÓN ESTÁTICA DE LA ORGANIZACIÓN
 * Esta es la única organización del sistema, no requiere endpoint
 */
export const ORGANIZATION_CONFIG = {
  organizacion_ID: 1,
  nombre: "FARMA DINAMICA",
  nit: "125469874",
  direccion: "Cochabamba",
  ciudad: "Cochabamba",
  region: "Cercado",
  pais: "Bolivia",
  telefono: "4264535",
  actividadPrincipal: "Farmacia",
  estado: "HAB"
};

/**
 * 🚨 DATOS TEMPORALES HARDCODED
 * Cuando los endpoints funcionen, estos datos se obtendrán dinámicamente
 * 
 * Endpoint futuro: GET /api/farmalink-core/Organizacion/SucursalesSistema/SAN%20MARTIN
 */
const SUCURSALES_HARDCODED = [
  {
    sucursal_ID: 1,
    nombreSucursal: "SAN MARTIN",
    direccion: "San Martin",
    ciudad: "Cochabamba",
    region: "Cercado",
    pais: "Bolivia",
    telefono: "4265378",
    estado: "HAB"
  },
  {
    sucursal_ID: 2,
    nombreSucursal: "BRASIL",
    direccion: "Brasil",
    ciudad: "Cochabamba",
    region: "Cercado",
    pais: "Bolivia",
    telefono: "4365892",
    estado: "HAB"
  },
  {
    sucursal_ID: 3,
    nombreSucursal: "URUGUAY",
    direccion: "Uruguay",
    ciudad: "Cochabamba",
    region: "Cercado",
    pais: "Bolivia",
    telefono: "4693582",
    estado: "HAB"
  },
  {
    sucursal_ID: 5,
    nombreSucursal: "TIQUIPAYA",
    direccion: "Reducto",
    ciudad: "Cochabamba",
    region: "Tiquipaya",
    pais: "Bolivia",
    telefono: "4265371",
    estado: "HAB"
  },
  {
    sucursal_ID: 6,
    nombreSucursal: "PACATA",
    direccion: "Pacata",
    ciudad: "Cochabamba",
    region: "Sacaba",
    pais: "Bolivia",
    telefono: "4257896",
    estado: "HAB"
  }
];

/**
 * 🚨 DATOS TEMPORALES HARDCODED
 * Cuando los endpoints funcionen, estos datos se obtendrán dinámicamente
 * 
 * Endpoint futuro: GET /api/farmalink-core/Organizacion/EquipoComputoSucursal/{sucursalId}
 */
const EQUIPOS_HARDCODED = [
  // SAN MARTIN (sucursal_ID: 1)
  { 
    equipoComputo_ID: 1, 
    sucursal_ID: 1, 
    nombreHost: "PC-SAN MARTIN-01", 
    descripcionEquipo: "Equipo sucursal caja 1",
    direccionFisica: "00-D8-61-98-57...",
    direccionIPFisica: "192.168.0.11",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  { 
    equipoComputo_ID: 2, 
    sucursal_ID: 1, 
    nombreHost: "PC-SAN MARTIN-02", 
    descripcionEquipo: "Equipo sucursal caja 2",
    direccionFisica: "01-E8-51-98-57...",
    direccionIPFisica: "192.168.0.12",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  { 
    equipoComputo_ID: 3, 
    sucursal_ID: 1, 
    nombreHost: "PC-SAN MARTIN-03", 
    descripcionEquipo: "Equipo sucursal caja 3",
    direccionFisica: "00-E8-61-A3-57...",
    direccionIPFisica: "192.168.0.12",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  
  // BRASIL (sucursal_ID: 2)
  { 
    equipoComputo_ID: 4, 
    sucursal_ID: 2, 
    nombreHost: "PC-BRASIL-01", 
    descripcionEquipo: "Equipo sucursal caja 1",
    direccionFisica: "01-D8-61-98-57...",
    direccionIPFisica: "192.168.0.21",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  { 
    equipoComputo_ID: 5, 
    sucursal_ID: 2, 
    nombreHost: "PC-BRASIL-02", 
    descripcionEquipo: "Equipo sucursal caja 2",
    direccionFisica: "02-E8-51-98-57...",
    direccionIPFisica: "192.168.0.22",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  { 
    equipoComputo_ID: 6, 
    sucursal_ID: 2, 
    nombreHost: "PC-BRASIL-03", 
    descripcionEquipo: "Equipo sucursal caja 3",
    direccionFisica: "03-D8-61-98-57...",
    direccionIPFisica: "192.168.0.23",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  
  // URUGUAY (sucursal_ID: 3)
  { 
    equipoComputo_ID: 7, 
    sucursal_ID: 3, 
    nombreHost: "PC-URUGUAY-01", 
    descripcionEquipo: "Equipo sucursal caja 1",
    direccionFisica: "04-D8-61-98-57...",
    direccionIPFisica: "192.168.0.31",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  { 
    equipoComputo_ID: 8, 
    sucursal_ID: 3, 
    nombreHost: "PC-URUGUAY-02", 
    descripcionEquipo: "Equipo sucursal caja 2",
    direccionFisica: "05-D8-61-98-57...",
    direccionIPFisica: "192.168.0.32",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  { 
    equipoComputo_ID: 9, 
    sucursal_ID: 3, 
    nombreHost: "PC-URUGUAY-03", 
    descripcionEquipo: "Equipo sucursal caja 3",
    direccionFisica: "00-D8-71-98-57...",
    direccionIPFisica: "192.168.0.33",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  
  // TIQUIPAYA (sucursal_ID: 5)
  { 
    equipoComputo_ID: 10, 
    sucursal_ID: 5, 
    nombreHost: "PC-TIQUIPAYA-01", 
    descripcionEquipo: "Equipo sucursal caja 1",
    direccionFisica: "23-03-61-98-57...",
    direccionIPFisica: "192.168.0.41",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  { 
    equipoComputo_ID: 11, 
    sucursal_ID: 5, 
    nombreHost: "PC-TIQUIPAYA-02", 
    descripcionEquipo: "Equipo sucursal caja 2",
    direccionFisica: "00-D9-61-78-85...",
    direccionIPFisica: "192.168.0.42",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  { 
    equipoComputo_ID: 12, 
    sucursal_ID: 5, 
    nombreHost: "PC-TIQUIPAYA-03", 
    descripcionEquipo: "Equipo sucursal caja 3",
    direccionFisica: "21-D8-31-98-57...",
    direccionIPFisica: "192.168.0.43",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta baja, lad...",
    estado: "HAB"
  },
  
  // PACATA (sucursal_ID: 6)
  { 
    equipoComputo_ID: 13, 
    sucursal_ID: 6, 
    nombreHost: "PC-PACATA-01", 
    descripcionEquipo: "Equipo sucursal caja 1",
    direccionFisica: "82-V8-61-25-57...",
    direccionIPFisica: "192.168.0.51",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta jaba, lad...",
    estado: "HAB"
  },
  { 
    equipoComputo_ID: 14, 
    sucursal_ID: 6, 
    nombreHost: "PC-PACATA-02", 
    descripcionEquipo: "Equipo sucursal caja 2",
    direccionFisica: "92-C8-61-45-D...",
    direccionIPFisica: "192.168.0.52",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta jaba, lad...",
    estado: "HAB"
  },
  { 
    equipoComputo_ID: 15, 
    sucursal_ID: 6, 
    nombreHost: "PC-PACATA-03", 
    descripcionEquipo: "Equipo sucursal caja 3",
    direccionFisica: "63-R8-81-04-29...",
    direccionIPFisica: "192.168.0.53",
    direccionIPPublica: "181.188.147.132",
    localidad: "Planta jaba, lad...",
    estado: "HAB"
  }
];

/**
 * 🔄 FUNCIÓN DE TRANSICIÓN - Obtener sucursales
 * 
 * TEMPORAL: Retorna datos hardcoded
 * FUTURO: Llamará al endpoint cuando esté listo
 * 
 * ✅ Migración fácil: Solo cambiar el contenido de esta función
 */
export const getSucursales = async () => {
  try {
    // 🚨 TEMPORAL: Retornar datos hardcoded
    console.log('📦 Obteniendo sucursales (hardcoded)');
    return Promise.resolve(SUCURSALES_HARDCODED);
    
    // 🔜 FUTURO: Descomentar cuando el endpoint funcione
    /*
    console.log('📡 Llamando endpoint: /Organizacion/SucursalesSistema');
    const response = await apiClient.get('/Organizacion/SucursalesSistema/SAN%20MARTIN');
    console.log('✅ Sucursales obtenidas del API:', response.data);
    return response.data;
    */
  } catch (error) {
    console.error('❌ Error obteniendo sucursales:', error);
    // Fallback a datos hardcoded en caso de error
    return SUCURSALES_HARDCODED;
  }
};

/**
 * 🔄 FUNCIÓN DE TRANSICIÓN - Obtener equipos por sucursal
 * 
 * TEMPORAL: Filtra datos hardcoded
 * FUTURO: Llamará al endpoint cuando esté listo
 * 
 * ✅ Migración fácil: Solo cambiar el contenido de esta función
 * 
 * @param {number} sucursalId - ID de la sucursal
 */
export const getEquiposBySucursal = async (sucursalId) => {
  try {
    // 🚨 TEMPORAL: Filtrar datos hardcoded
    console.log(`📦 Obteniendo equipos para sucursal ${sucursalId} (hardcoded)`);
    const equiposFiltrados = EQUIPOS_HARDCODED.filter(
      equipo => equipo.sucursal_ID === parseInt(sucursalId)
    );
    return Promise.resolve(equiposFiltrados);
    
    // 🔜 FUTURO: Descomentar cuando el endpoint funcione
    /*
    console.log(`📡 Llamando endpoint: /Organizacion/EquipoComputoSucursal/${sucursalId}`);
    const response = await apiClient.get(`/Organizacion/EquipoComputoSucursal/${sucursalId}`);
    console.log('✅ Equipos obtenidos del API:', response.data);
    return response.data;
    */
  } catch (error) {
    console.error('❌ Error obteniendo equipos:', error);
    // Fallback a datos hardcoded filtrados
    return EQUIPOS_HARDCODED.filter(
      equipo => equipo.sucursal_ID === parseInt(sucursalId)
    );
  }
};

/**
 * 🔧 HELPER: Obtener sucursal por ID
 */
export const getSucursalById = (sucursalId) => {
  return SUCURSALES_HARDCODED.find(s => s.sucursal_ID === parseInt(sucursalId));
};

/**
 * 🔧 HELPER: Obtener equipo por ID
 */
export const getEquipoById = (equipoId) => {
  return EQUIPOS_HARDCODED.find(e => e.equipoComputo_ID === parseInt(equipoId));
};

export default {
  ORGANIZATION_CONFIG,
  getSucursales,
  getEquiposBySucursal,
  getSucursalById,
  getEquipoById
};