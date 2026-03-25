// src/services/api/agendamientoService.js
// Servicios para el módulo de Agendamiento — farmalink-clinica API

import clinicaApiClient from "./clinicaApiClient";

const agendamientoService = {
  // Catálogos
  listarMedicos: async () => {
    const res = await clinicaApiClient.get("/Agendamiento/ListaMedicos");
    return res.data;
  },

  listarEspecialidades: async () => {
    const res = await clinicaApiClient.get("/Agendamiento/Especialidades");
    return res.data;
  },

  listarTurnosMedico: async (medicoId) => {
    const res = await clinicaApiClient.get(
      "/Agendamiento/TurnoAtencionMedicos",
      {
        params: { Medico_ID: medicoId },
      },
    );
    return res.data;
  },

  listarConsultorios: async () => {
    const res = await clinicaApiClient.get("/Agendamiento/Consultorios");
    return res.data;
  },

  listarEstadosCita: async () => {
    const res = await clinicaApiClient.get("/Agendamiento/EstadosCita");
    return res.data;
  },

  listarTiposConsulta: async () => {
    const res = await clinicaApiClient.get("/Agendamiento/TipoConsulta");
    return res.data;
  },

  // Agendar
  agendarCita: async (payload) => {
    const userJson = sessionStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : {};
    const usuarioId = user.usuario_ID || user.id || user.userId || 1;

    const body = {
      codigoPaciente: payload.paciente_ID,
      codigoMedico: payload.medico_ID,
      codigoEspecialidad: payload.especialidad_ID,
      codigoTipoConsulta: payload.tipoConsulta_ID,
      codigoConsultorio: payload.consultorio_ID,
      fechaCita: payload.fechaCita.includes("T")
        ? payload.fechaCita.split("T")[0]
        : payload.fechaCita,
      horaInicio: payload.horaInicio,
      motivoConsulta: payload.motivoConsulta || "",
      observaciones: payload.observaciones || "",
      usuarioRegistroAlta: usuarioId,
      esCitaConfirmada: payload.esCitaConfirmada,
    };

    const res = await clinicaApiClient.post(
      "/Agendamiento/AgendarCitaPaciente",
      body,
    );
    return res.data;
  },

  // Buscar citas
  buscarCitas: async (params) => {
    const res = await clinicaApiClient.get("/Agendamiento/BuscarCitaPaciente", {
      params: {
        CodigoMedico: params.codigoMedico || undefined,
        CodigoEspecialidad: params.codigoEspecialidad || undefined,
        CodigoPaciente: params.codigoPaciente || undefined,
        FechaCitaInicio: params.fechaInicio || undefined,
        FechaCitaFin: params.fechaFin || undefined,
      },
    });
    return res.data;
  },

  // Confirmar cita
  confirmarCita: async (codigoCita, usuarioId) => {
    const res = await clinicaApiClient.put(
      `/Agendamiento/${codigoCita}/ConfirmarCita`,
      {
        codigoCita,
        medioConfirmacion: "PRESENCIAL",
        usuarioConfirmacionAlta: usuarioId,
      },
    );
    return res.data;
  },

  // Guardar llegada
  guardarLlegada: async (codigoCita) => {
    const res = await clinicaApiClient.put(
      `/Agendamiento/${codigoCita}/GuardarLlegada`,
    );
    return res.data;
  },

  // Citas disponibles por turno
  citasDisponibles: async ({ medicoId, fecha, diaSemana, horaInicio, horaFin }) => {
    const res = await clinicaApiClient.get("/Agendamiento/CitasDisponibles", {
      params: {
        Medico_ID: medicoId,
        FechaProgramacion: fecha,
        DiaSemana: diaSemana,
        HoraInicio: horaInicio,
        HoraFin: horaFin,
      },
    });
    return res.data;
  },
};

export default agendamientoService;
