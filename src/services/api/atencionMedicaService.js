import clinicaApiClient from "./clinicaApiClient";

const atencionMedicaService = {
  guardarTriaje: async (payload) => {
    const res = await clinicaApiClient.post(
      "/AtencionMedica/GuardarTriaje",
      payload,
    );
    return res.data;
  },

  // ─── CONSULTA TRIAJE ──────────────────────────────────────────────────────
  buscarCitasParaTriaje: async (params = {}) => {
    const res = await clinicaApiClient.get(
      "/AtencionMedica/BuscarCitaPacienteTriaje",
      {
        params: {
          CodigoMedico: params.codigoMedico || undefined,
          CodigoEspecialidad: params.codigoEspecialidad || undefined,
          CodigoPaciente: params.codigoPaciente || undefined,
          FechaCitaInicio: params.fechaInicio || undefined,
          FechaCitaFin: params.fechaFin || undefined,
        },
      },
    );
    return res.data;
  },

  // ─── CONSULTA MÉDICA ──────────────────────────────────────────────────────

  buscarCitasParaConsulta: async (params = {}) => {
    const res = await clinicaApiClient.get(
      "/AtencionMedica/BuscarCitaPaciente",
      {
        params: {
          CodigoMedico: params.codigoMedico || undefined,
          CodigoEspecialidad: params.codigoEspecialidad || undefined,
          CodigoPaciente: params.codigoPaciente || undefined,
          FechaCitaInicio: params.fechaInicio || undefined,
          FechaCitaFin: params.fechaFin || undefined,
        },
      },
    );
    return res.data;
  },

  iniciarConsulta: async (payload) => {
    const res = await clinicaApiClient.post(
      "/AtencionMedica/IniciarConsultaMedica",
      payload,
    );
    return res.data;
  },

  getDiagnosticosCIE10: async () => {
    const res = await clinicaApiClient.get("/AtencionMedica/DiagnosticosCIE10");
    return res.data;
  },

  getProcedimientos: async () => {
    const res = await clinicaApiClient.get(
      "/AtencionMedica/ProcedimientosMedicos",
    );
    return res.data;
  },

  getTiposOrden: async () => {
    const res = await clinicaApiClient.get(
      "/AtencionMedica/TipoOrdenesMedicas",
    );
    return res.data;
  },

  buscarMedicamentos: async (nombre) => {
    const res = await clinicaApiClient.get(
      "/AtencionMedica/BuscarMedicamentos",
      {
        params: { NombreMedicamento: nombre },
      },
    );
    return res.data;
  },

  agregarDiagnostico: async (payload) => {
    const res = await clinicaApiClient.put(
      "/AtencionMedica/AgregarDiagnostico",
      payload,
    );
    return res.data;
  },

  agregarProcedimiento: async (payload) => {
    const res = await clinicaApiClient.put(
      "/AtencionMedica/AgregarProcedimiento",
      payload,
    );
    return res.data;
  },

  agregarOrden: async (payload) => {
    const res = await clinicaApiClient.put(
      "/AtencionMedica/AgregarOrdenes",
      payload,
    );
    return res.data;
  },

  agregarPrescripcion: async (payload) => {
    const res = await clinicaApiClient.put(
      "/AtencionMedica/AgregarPrescripciones",
      payload,
    );
    return res.data;
  },

  getPersonalMedico: async (codigoEmpleado) => {
    const res = await clinicaApiClient.get("/AtencionMedica/PersonalMedico", {
      params: { CodigoEmpleado: codigoEmpleado },
    });
    return res.data;
  },

  finalizarConsulta: async (payload) => {
    const res = await clinicaApiClient.post(
      "/AtencionMedica/FinalizarConsultaMedica",
      payload,
    );
    return res.data;
  },

  obtenerTriaje: async ({ citaId, pacienteId }) => {
    const res = await clinicaApiClient.get("/AtencionMedica/ObtenerTriaje", {
      params: { Cita_ID: citaId, Paciente_ID: pacienteId },
    });
    return res.data;
  },

  notificacionesEnfermeria: async () => {
    try {
      const res = await clinicaApiClient.get(
        "/AtencionEnfermeria/NotificacionesEnfermeria",
      );
      return res.data;
    } catch (err) {
      // 400 = sin servicios registrados, no es error real
      if (err.response?.status === 400) return { exitoso: false, datos: [] };
      throw err;
    }
  },

  atencionMedico: async ({ medicoId, fecha }) => {
    const res = await clinicaApiClient.get("/AtencionMedica/AtencionMedico", {
      params: { Medico_ID: medicoId, FechaAtencion: fecha },
    });
    return res.data;
  },

  atencionEnfermera: async ({ enfermeraId, fecha }) => {
    const res = await clinicaApiClient.get(
      "/AtencionMedica/AtencionEnfermera",
      {
        params: { Enfermera_ID: enfermeraId, FechaServicio: fecha },
      },
    );
    return res.data;
  },
};

export default atencionMedicaService;
