// src/services/api/pacienteService.js
// Servicios para el módulo de Pacientes — farmalink-clinica API

import clinicaApiClient from './clinicaApiClient';

// ─── CATÁLOGO PROPIO DE TIPOS DE DOCUMENTO ────────────────────────────────────
// No usar catálogo SIAT — este es independiente
export const TIPOS_DOCUMENTO = [
  { id: 1, descripcion: 'CI - Cédula de Identidad' },
  { id: 2, descripcion: 'CEX - Cédula de Extranjería' },
  { id: 3, descripcion: 'PAS - Pasaporte' },
  { id: 4, descripcion: 'OD - Otro Documento de Identidad' },
  { id: 5, descripcion: 'NIT - Número de Identificación Tributaria' },
];

// ─── CATÁLOGO DE GÉNEROS ──────────────────────────────────────────────────────
export const GENEROS = [
  { id: 'M', descripcion: 'Masculino' },
  { id: 'F', descripcion: 'Femenino' },
];

// ─── TIPOS DE PACIENTE SIN DATOS ─────────────────────────────────────────────
// SN = adulto sin datos iniciales
// NN = bebé sin datos iniciales
export const TIPOS_PACIENTE_RAPIDO = [
  { id: 'normal', label: 'Paciente Normal' },
  { id: 'SN', label: 'SN — Adulto sin datos' },
  { id: 'NN', label: 'NN — Bebé sin datos' },
];

const pacienteService = {
  /**
   * Guardar nuevo paciente
   * POST /Pacientes/GuardarPaciente
   */
  guardarPaciente: async (datos) => {
    const res = await clinicaApiClient.post('/Pacientes/GuardarPaciente', datos);
    return res.data;
  },

  /**
   * Actualizar paciente existente
   * PUT /Pacientes/ActualizarPaciente
   */
  actualizarPaciente: async (datos) => {
    const res = await clinicaApiClient.put('/Pacientes/ActualizarPaciente', datos);
    return res.data;
  },

  /**
   * Buscar pacientes por documento o nombre
   * GET /Pacientes/BuscarPacientes
   */
  buscarPacientes: async ({ numeroDocumento = '', nombreCompletoPaciente = '' } = {}) => {
    const res = await clinicaApiClient.get('/Pacientes/BuscarPacientes', {
      params: {
        NumeroDocumento: numeroDocumento || undefined,
        NombreCompletoPaciente: nombreCompletoPaciente || undefined,
      },
    });
    return res.data;
  },
};

export default pacienteService;