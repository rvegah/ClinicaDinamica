// src/services/api/enfermeriaService.js
// Servicios para el módulo de Atención de Enfermería (independiente del triaje)

import clinicaApiClient from "./clinicaApiClient";

const enfermeriaService = {
  // GET — Procedimientos filtrados solo para enfermería
  getProcedimientos: async () => {
    const res = await clinicaApiClient.get(
      "/AtencionEnfermeria/ProcedimientosEnfermeria",
    );
    return res.data;
  },

  // GET — Insumos disponibles para enfermería (~15 items)
  getInsumos: async () => {
    const res = await clinicaApiClient.get(
      "/AtencionEnfermeria/InsumosEnfermeria",
    );
    return res.data;
  },

  // POST — Guardar servicio de enfermería
  // Devuelve servicioEnfermeria_ID necesario para guardar insumos
  // Payload: { paciente_ID, enfermera_ID, procedimiento_ID, origenServicio,
  //   ordenMedica_ID, consultaMedica_ID, fechaServicio, motivoAtencion,
  //   observaciones, materialesUtilizados, presionArterial, frecuenciaCardiaca,
  //   temperatura, saturacionOxigeno, precioServicio, costoMateriales,
  //   costoTotal, codigoEmpleadoAlta }
  guardarServicio: async (payload) => {
    const res = await clinicaApiClient.post(
      "/AtencionEnfermeria/GuardarServicioEnfermeria",
      payload,
    );
    return res.data;
  },

  // PUT — Guardar insumo utilizado en el servicio
  // Payload: { servicioEnfermeria_ID, producto_ID, cantidad, precioUnitario,
  //   fecha, costoTotal, observaciones }
  guardarInsumo: async (payload) => {
    const res = await clinicaApiClient.put(
      "/AtencionEnfermeria/GuardarInsumoUtilizado",
      payload,
    );
    return res.data;
  },
  
  listarEnfermeras: async () => {
    const res = await clinicaApiClient.get(
      "/AtencionEnfermeria/ListaEnfermeras",
    );
    return res.data;
  },
};

export default enfermeriaService;
