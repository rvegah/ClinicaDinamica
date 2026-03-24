// src/modules/agendamiento/pages/AgendarCitaPage.jsx
// Flujo: Buscar paciente → Especialidad → Médico → Turno → Tipo consulta → Guardar

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  InputAdornment,
  Paper,
  FormControlLabel,
  Checkbox,
  Portal,
} from "@mui/material";
import {
  Search,
  ArrowBack,
  CalendarMonth,
  Person,
  MedicalServices,
  AccessTime,
  CheckCircle,
  EventAvailable,
  Print,
  Add,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import agendamientoService from "../../../services/api/agendamientoService";
import pacienteService from "../../../services/api/pacienteService";
import { fechaHoy } from "../../../utils/fecha";

// ─── HELPER: obtener empleado logueado ───────────────────────────────────────
const getCodigoEmpleado = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    return user.codigoEmpleado || user.usuario || "SYSTEMAS";
  } catch {
    return "SYSTEMAS";
  }
};

const getUserId = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    return user.usuario_ID || user.id || 1;
  } catch {
    return 1;
  }
};

// ─── DÍAS DE LA SEMANA ────────────────────────────────────────────────────────
const DIAS = [
  "",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────
const card = {
  borderRadius: 2,
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
  bgcolor: "white",
};
const cardPadding = { p: 2.5 };
const sectionLabel = {
  fontWeight: 700,
  fontSize: "0.95rem",
  color: "#111827",
  display: "flex",
  alignItems: "center",
  gap: 1,
  mb: 2,
};

export default function AgendarCitaPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Catálogos
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [tiposConsulta, setTiposConsulta] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [catalogosLoading, setCatalogosLoading] = useState(true);

  // Búsqueda de paciente
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [pacientesBuscados, setPacientesBuscados] = useState([]);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  // Formulario
  const [especialidadId, setEspecialidadId] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [fechaCita, setFechaCita] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [consultorioId, setConsultorioId] = useState("");
  const [tipoConsultaId, setTipoConsultaId] = useState("");
  const [esCitaConfirmada, setEsCitaConfirmada] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [citaGuardada, setCitaGuardada] = useState(null);

  const busquedaRef = React.useRef(null);

  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [tipoBusquedaPaciente, setTipoBusquedaPaciente] = useState("documento");

  // ─── CARGA CATÁLOGOS ────────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      setCatalogosLoading(true);
      try {
        const [meds, esps, cons, tipos] = await Promise.all([
          agendamientoService.listarMedicos().catch(() => ({ datos: [] })),
          agendamientoService
            .listarEspecialidades()
            .catch(() => ({ datos: [] })),
          agendamientoService.listarConsultorios().catch(() => ({ datos: [] })),
          agendamientoService
            .listarTiposConsulta()
            .catch(() => ({ datos: [] })),
        ]);
        setMedicos(meds.datos || []);
        setEspecialidades(esps.datos || []);
        setConsultorios(cons.datos || []);
        setTiposConsulta((tipos.datos || []).sort((a, b) => a.orden - b.orden));
      } catch {
        enqueueSnackbar("Error cargando catálogos", { variant: "warning" });
      } finally {
        setCatalogosLoading(false);
      }
    };
    cargar();
  }, []);

  // ─── FILTRAR MÉDICOS POR ESPECIALIDAD ────────────────────────────────────────
  const medicosFiltrados = especialidadId
    ? medicos // Sin filtro real porque ListaMedicos no trae especialidad_ID
    : medicos;

  // ─── CARGAR TURNOS AL SELECCIONAR MÉDICO ────────────────────────────────────
  useEffect(() => {
    if (!medicoId) {
      setTurnos([]);
      setTurnoSeleccionado(null);
      return;
    }
    agendamientoService
      .listarTurnosMedico(medicoId)
      .then((res) => {
        const lista = res.datos || [];
        // Filtrar por especialidad si está seleccionada
        const filtrados = especialidadId
          ? lista.filter((t) => t.especialidad_ID === Number(especialidadId))
          : lista;
        setTurnos(filtrados);
        setTurnoSeleccionado(null);
        setConsultorioId("");
      })
      .catch(() => setTurnos([]));
  }, [medicoId, especialidadId]);

  // ─── BUSCAR PACIENTE ─────────────────────────────────────────────────────────
  const buscarPaciente = useCallback(
    async (keyword) => {
      if (!keyword || keyword.length < 2) {
        setPacientesBuscados([]);
        return;
      }
      setBuscandoPaciente(true);
      try {
        // Detectar si es número (documento) o texto (nombre)
        const params =
          tipoBusquedaPaciente === "documento"
            ? { numeroDocumento: keyword }
            : { nombreCompletoPaciente: keyword };
        const res = await pacienteService.buscarPacientes(params);
        setPacientesBuscados(res.exitoso ? res.datos || [] : []);
      } catch {
        setPacientesBuscados([]);
      } finally {
        setBuscandoPaciente(false);
      }
    },
    [tipoBusquedaPaciente],
  );

  useEffect(() => {
    const t = setTimeout(() => buscarPaciente(busquedaPaciente), 400);
    return () => clearTimeout(t);
  }, [busquedaPaciente, buscarPaciente]);

  // ─── SELECCIONAR TURNO ────────────────────────────────────────────────────────
  const handleSeleccionarTurno = (turno) => {
    setTurnoSeleccionado(turno);
    setConsultorioId(turno.consultorio_ID);
    setHoraInicio(turno.horaInicio);
    // Auto-seleccionar especialidad del turno
    if (!especialidadId) setEspecialidadId(turno.especialidad_ID);
  };

  const limpiarFormulario = () => {
    setPacienteSeleccionado(null);
    setBusquedaPaciente("");
    setEspecialidadId("");
    setMedicoId("");
    setTurnos([]);
    setTurnoSeleccionado(null);
    setFechaCita("");
    setHoraInicio("");
    setConsultorioId("");
    setTipoConsultaId("");
    setEsCitaConfirmada(false);
    setMotivoConsulta("");
    setObservaciones("");
    setTipoBusquedaPaciente("documento");
  };

  // ─── GUARDAR CITA ─────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!pacienteSeleccionado) {
      enqueueSnackbar("Seleccione un paciente", { variant: "error" });
      return;
    }
    if (!medicoId) {
      enqueueSnackbar("Seleccione un médico", { variant: "error" });
      return;
    }
    if (!fechaCita) {
      enqueueSnackbar("Seleccione la fecha de la cita", { variant: "error" });
      return;
    }
    if (!horaInicio) {
      enqueueSnackbar("Seleccione la hora de inicio", { variant: "error" });
      return;
    }
    if (!tipoConsultaId) {
      enqueueSnackbar("Seleccione el tipo de consulta", { variant: "error" });
      return;
    }

    setGuardando(true);
    try {
      console.log('👤 USER sessionStorage:', JSON.parse(sessionStorage.getItem("user") || "{}"));
      const payload = {
        paciente_ID: pacienteSeleccionado.paciente_ID,
        medico_ID: Number(medicoId),
        especialidad_ID: especialidadId
          ? Number(especialidadId)
          : turnoSeleccionado?.especialidad_ID || null,
        consultorio_ID: consultorioId ? Number(consultorioId) : null,
        tipoConsulta_ID: Number(tipoConsultaId),
        fechaCita: `${fechaCita}T${horaInicio}:00`,
        horaInicio,
        esCitaConfirmada,
        codigoEmpleadoAlta: getCodigoEmpleado(),
        usuarioRegistroAlta: getUserId(),
        motivoConsulta,
        observaciones,
      };

      const res = await agendamientoService.agendarCita(payload);

      if (res.exitoso) {
        // Guardar datos de la cita para impresión
        setCitaGuardada({
          ...res.datos,
          // Enriquecer con datos del formulario si el backend no los devuelve
          nombrePaciente:
            res.datos?.nombrePaciente ||
            (pacienteSeleccionado.nombreCompletoPaciente || "").trim(),
          nombreMedico:
            res.datos?.nombreMedico ||
            medicos.find((m) => m.medico_ID === Number(medicoId))
              ?.nombreMedico ||
            "",
          especialidad:
            res.datos?.especialidad ||
            especialidades.find(
              (e) => e.especialidad_ID === Number(especialidadId),
            )?.nombre ||
            "",
          consultorio:
            res.datos?.consultorio ||
            consultorios.find((c) => c.consultorio_ID === Number(consultorioId))
              ?.nombre ||
            "",
          tipoConsulta:
            res.datos?.tipoConsulta ||
            tiposConsulta.find(
              (t) => t.tipoConsulta_ID === Number(tipoConsultaId),
            )?.nombre ||
            "",
          fechaCita,
          horaInicio,
        });
        enqueueSnackbar(res.mensaje || "✅ Cita agendada correctamente", {
          variant: "success",
          autoHideDuration: 5000,
        });
      } else {
        enqueueSnackbar(res.mensaje || "Error al agendar", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error al agendar cita", {
        variant: "error",
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleImprimir = () => {
    const ventana = window.open("", "_blank", "width=380,height=580");
    ventana.document.write(`
    <html>
    <head>
      <title>Cita Médica</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
        .header { text-align: center; margin-bottom: 16px; }
        .header h2 { font-size: 15px; font-weight: bold; text-transform: uppercase; }
        .header .subtitulo { font-size: 13px; font-weight: bold; text-transform: uppercase; margin-top: 4px; }
        .especialidad { font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 6px; }
        .medico { font-size: 13px; font-weight: bold; text-transform: uppercase; margin-top: 4px; }
        .numero { text-align: center; font-size: 36px; font-weight: 900; margin: 16px 0; letter-spacing: 2px; }
        .hora-label { text-align: center; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
        .hora-valor { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 12px; }
        .paciente { font-size: 12px; margin-bottom: 4px; }
        .paciente strong { font-weight: bold; }
        .nota { font-size: 11px; text-align: center; margin: 12px 0; font-style: italic; }
        .estado { text-align: center; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 8px; color: ${esCitaConfirmada ? "#15803d" : "#92400e"}; }
        .footer { margin-top: 14px; font-size: 10px; display: flex; justify-content: space-between; }
        .divider { border-top: 1px solid #000; margin: 10px 0; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>CENTRO MÉDICO DINAMAX</h2>
        <div class="subtitulo">(${esCitaConfirmada ? "CONFIRMADA" : "RESERVA"})</div>
        <div class="especialidad">${citaGuardada.especialidad || "—"}</div>
        <div class="medico">${citaGuardada.nombreMedico || "—"}</div>
      </div>

      <div class="divider"></div>

      <div class="hora-label">HORA DE ATENCIÓN</div>
      <div class="hora-valor">${citaGuardada.fechaCita} ${citaGuardada.horaInicio}</div>

      <div class="divider"></div>

      <div class="paciente">
        <strong>Paciente:</strong> ${citaGuardada.nombrePaciente || "—"}
      </div>
      <div class="paciente">
        <strong>Tipo:</strong> ${citaGuardada.tipoConsulta || "—"}
      </div>
      <div class="paciente">
        <strong>Consultorio:</strong> ${citaGuardada.consultorio || "—"}
      </div>

      <div class="nota">
        ${
          esCitaConfirmada
            ? "Preséntese 15 minutos antes de su consulta"
            : "Confirmar la reserva 30 min antes de su consulta"
        }
      </div>

      <div class="estado">
        ${esCitaConfirmada ? "✓ CITA CONFIRMADA" : "SIN CONFIRMAR"}
      </div>

      <div class="divider"></div>

      <div class="footer">
        <span>(${getCodigoEmpleado()})</span>
        <span>${new Date().toLocaleDateString("es-BO")} ${new Date().toLocaleTimeString("es-BO")}</span>
      </div>

      <br/>
      <button onclick="window.print()" style="width:100%;padding:8px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;">
        🖨️ Imprimir
      </button>
    </body>
    </html>
  `);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => ventana.print(), 300);
  };

  // Pantalla de éxito con impresión — agregar ANTES del return principal
  if (citaGuardada) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
          }}
        >
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#f0fdf4",
                border: "2px solid #86efac",
                mx: "auto",
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle sx={{ fontSize: 36, color: "#16a34a" }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#111827">
              ¡Cita Agendada!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {esCitaConfirmada
                ? "Cita confirmada correctamente"
                : "Pre-reserva registrada — confirmar al llegar"}
            </Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.5,
                mb: 3,
              }}
            >
              {[
                { label: "Paciente", value: citaGuardada.nombrePaciente },
                { label: "Médico", value: citaGuardada.nombreMedico },
                { label: "Especialidad", value: citaGuardada.especialidad },
                { label: "Consultorio", value: citaGuardada.consultorio },
                { label: "Tipo de consulta", value: citaGuardada.tipoConsulta },
                {
                  label: "Fecha y Hora",
                  value: `${citaGuardada.fechaCita} ${citaGuardada.horaInicio}`,
                },
              ].map(({ label, value }) => (
                <Box
                  key={label}
                  sx={{
                    p: 1.5,
                    bgcolor: "#f9fafb",
                    borderRadius: 1.5,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {value || "—"}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Print />}
                onClick={handleImprimir}
                sx={{
                  py: 1.2,
                  borderRadius: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: "#d1d5db",
                  color: "#374151",
                  "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
                }}
              >
                Imprimir Comprobante
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setCitaGuardada(null);
                  limpiarFormulario();
                }}
                sx={{
                  py: 1.2,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                  boxShadow: "none",
                }}
              >
                Nueva Cita
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      {/* HEADER */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/agendamiento/disponibilidad")}
          sx={{
            color: "#6b7280",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          Volver
        </Button>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#111827">
            Agendar Cita Médica
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro de nueva cita para paciente
          </Typography>
        </Box>
      </Box>

      {catalogosLoading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            color: "#6b7280",
          }}
        >
          <CircularProgress size={14} />
          <Typography variant="caption">Cargando catálogos...</Typography>
        </Box>
      )}

      {/* 1. BUSCAR PACIENTE */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={cardPadding}>
          <Typography sx={sectionLabel}>
            <Person sx={{ fontSize: 16, color: "#6b7280" }} />
            1. Paciente
          </Typography>

          {pacienteSeleccionado ? (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f0fdf4",
                borderRadius: 1.5,
                border: "1px solid #86efac",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CheckCircle sx={{ color: "#16a34a", fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#15803d">
                    {(pacienteSeleccionado.nombreCompletoPaciente || "").trim()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Doc: {pacienteSeleccionado.numeroDocumento}
                    {pacienteSeleccionado.numeroHistoriaClinica &&
                      ` — HC: ${pacienteSeleccionado.numeroHistoriaClinica}`}
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                onClick={() => {
                  setPacienteSeleccionado(null);
                  setBusquedaPaciente("");
                  setPacientesBuscados([]);
                }}
                sx={{ color: "#6b7280", textTransform: "none", fontSize: 12 }}
              >
                Cambiar
              </Button>
            </Box>
          ) : (
            <Box ref={busquedaRef}>
              {/* Botones tipo búsqueda */}
              <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                {[
                  { id: "documento", label: "Por Nro. Documento" },
                  { id: "nombre", label: "Por Nombre" },
                ].map((opt) => (
                  <Button
                    key={opt.id}
                    size="small"
                    variant={
                      tipoBusquedaPaciente === opt.id ? "contained" : "outlined"
                    }
                    onClick={() => {
                      setTipoBusquedaPaciente(opt.id);
                      setBusquedaPaciente("");
                      setPacientesBuscados([]);
                    }}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: 12,
                      ...(tipoBusquedaPaciente === opt.id
                        ? {
                            bgcolor: "#2563eb",
                            "&:hover": { bgcolor: "#1d4ed8" },
                            boxShadow: "none",
                          }
                        : {
                            borderColor: "#d1d5db",
                            color: "#374151",
                            "&:hover": { borderColor: "#9ca3af" },
                          }),
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </Box>

              {/* Campo de búsqueda */}
              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={
                    tipoBusquedaPaciente === "documento"
                      ? "Ej: 12345678"
                      : "Ej: JOSE NOGALES"
                  }
                  value={busquedaPaciente}
                  onChange={(e) => setBusquedaPaciente(e.target.value)}
                  onBlur={() => setTimeout(() => setPacientesBuscados([]), 200)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {buscandoPaciente ? (
                          <CircularProgress size={15} />
                        ) : (
                          <Search sx={{ fontSize: 17, color: "#9ca3af" }} />
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
                {/* Portal del dropdown — sin cambios */}
                {pacientesBuscados.length > 0 && (
                  <Portal>
                    <Paper
                      sx={{
                        position: "fixed",
                        zIndex: 9999,
                        width: busquedaRef.current
                          ? busquedaRef.current.getBoundingClientRect().width
                          : 600,
                        top: busquedaRef.current
                          ? busquedaRef.current.getBoundingClientRect().bottom +
                            4
                          : 200,
                        left: busquedaRef.current
                          ? busquedaRef.current.getBoundingClientRect().left
                          : 200,
                        maxHeight: 260,
                        overflow: "auto",
                        borderRadius: 1.5,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                        border: "1px solid #e5e7eb",
                        bgcolor: "white",
                      }}
                    >
                      {pacientesBuscados.map((p) => (
                        <Box
                          key={p.paciente_ID}
                          onMouseDown={() => {
                            setPacienteSeleccionado(p);
                            setBusquedaPaciente("");
                            setPacientesBuscados([]);
                          }}
                          sx={{
                            px: 2,
                            py: 1.25,
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#f9fafb" },
                            borderBottom: "1px solid #f3f4f6",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {(p.nombreCompletoPaciente || "").trim()}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Doc: {p.numeroDocumento}
                            </Typography>
                          </Box>
                          {p.numeroHistoriaClinica && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              HC: {p.numeroHistoriaClinica}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Paper>
                  </Portal>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 2. ESPECIALIDAD Y MÉDICO */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={cardPadding}>
          <Typography sx={sectionLabel}>
            <MedicalServices sx={{ fontSize: 16, color: "#6b7280" }} />
            2. Especialidad y Médico
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Especialidad"
                value={especialidadId}
                onChange={(e) => {
                  setEspecialidadId(e.target.value);
                  setMedicoId("");
                  setTurnos([]);
                  setTurnoSeleccionado(null);
                }}
                disabled={catalogosLoading}
              >
                <MenuItem value="">— Todas las especialidades —</MenuItem>
                {especialidades.map((e) => (
                  <MenuItem key={e.especialidad_ID} value={e.especialidad_ID}>
                    {e.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Médico *"
                value={medicoId}
                onChange={(e) => {
                  setMedicoId(e.target.value);
                  setTurnoSeleccionado(null);
                  setHoraInicio("");
                  setConsultorioId("");
                }}
                disabled={catalogosLoading}
              >
                <MenuItem value="">— Seleccione un médico —</MenuItem>
                {medicosFiltrados.map((m) => (
                  <MenuItem key={m.medico_ID} value={m.medico_ID}>
                    {m.nombreMedico || m.codigo}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 3. TURNOS DISPONIBLES */}
      {medicoId && (
        <Card sx={{ ...card, mb: 2 }}>
          <CardContent sx={cardPadding}>
            <Typography sx={sectionLabel}>
              <AccessTime sx={{ fontSize: 16, color: "#6b7280" }} />
              3. Turno de Atención
            </Typography>

            {turnos.length === 0 ? (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 1,
                  border: "1px solid #bfdbfe",
                  bgcolor: "#eff6ff",
                }}
              >
                No hay turnos disponibles para este médico
                {especialidadId ? " en esta especialidad" : ""}.
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {turnos.map((t, idx) => {
                  const seleccionado =
                    turnoSeleccionado &&
                    turnoSeleccionado.diaSemana === t.diaSemana &&
                    turnoSeleccionado.especialidad_ID === t.especialidad_ID;

                  return (
                    <Box
                      key={idx}
                      onClick={() => handleSeleccionarTurno(t)}
                      sx={{
                        px: 2,
                        py: 1.25,
                        borderRadius: 1.5,
                        border: `1.5px solid ${seleccionado ? "#2563eb" : "#e5e7eb"}`,
                        bgcolor: seleccionado ? "#eff6ff" : "white",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        "&:hover": {
                          borderColor: "#93c5fd",
                          bgcolor: "#f8faff",
                        },
                        minWidth: 160,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={seleccionado ? "#2563eb" : "#374151"}
                      >
                        {DIAS[t.diaSemana]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.horaInicio} — {t.horaFin}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "#6b7280",
                          fontSize: 10,
                          mt: 0.25,
                        }}
                      >
                        {t.nombreEspecialidad} · {t.numeroConsultorio}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* 4. FECHA, HORA Y TIPO */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={cardPadding}>
          <Typography sx={sectionLabel}>
            <CalendarMonth sx={{ fontSize: 16, color: "#6b7280" }} />
            4. Fecha, Hora y Tipo de Consulta
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Fecha de Cita *"
                type="date"
                value={fechaCita}
                onChange={(e) => setFechaCita(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: fechaHoy() }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Hora de Inicio *"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText={
                  turnoSeleccionado
                    ? `Turno: ${turnoSeleccionado.horaInicio} — ${turnoSeleccionado.horaFin}`
                    : ""
                }
              />
            </Box>
            <Box sx={{ flex: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Consultorio"
                value={consultorioId}
                onChange={(e) => setConsultorioId(e.target.value)}
                disabled={catalogosLoading}
              >
                <MenuItem value="">— Sin especificar —</MenuItem>
                {consultorios.map((c) => (
                  <MenuItem key={c.consultorio_ID} value={c.consultorio_ID}>
                    {c.nombre} ({c.numero})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <TextField
            select
            fullWidth
            size="small"
            label="Tipo de Consulta *"
            value={tipoConsultaId}
            onChange={(e) => setTipoConsultaId(e.target.value)}
            disabled={catalogosLoading}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">— Seleccione tipo de consulta —</MenuItem>
            {tiposConsulta.map((t) => (
              <MenuItem key={t.tipoConsulta_ID} value={t.tipoConsulta_ID}>
                {t.nombre}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 1, color: "#6b7280" }}
                >
                  ({t.duracionMinutos} min · Bs. {t.precioConsulta})
                </Typography>
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Motivo de Consulta"
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              placeholder="Ej: Control rutinario, dolor abdominal..."
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              size="small"
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones adicionales..."
              multiline
              rows={2}
            />
          </Box>

          <Divider sx={{ mb: 1.5 }} />
          <FormControlLabel
            control={
              <Checkbox
                checked={esCitaConfirmada}
                onChange={(e) => setEsCitaConfirmada(e.target.checked)}
                size="small"
                sx={{ color: "#2563eb", "&.Mui-checked": { color: "#2563eb" } }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600} color="#374151">
                  Confirmar cita inmediatamente
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Si el paciente está presente y confirma la cita ahora. De lo
                  contrario quedará como Pre-Reserva.
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>

      {/* RESUMEN */}
      {pacienteSeleccionado &&
        medicoId &&
        fechaCita &&
        horaInicio &&
        tipoConsultaId && (
          <Card
            sx={{
              ...card,
              mb: 2,
              border: "1.5px solid #bfdbfe",
              bgcolor: "#eff6ff",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="body2"
                fontWeight={700}
                color="#1e40af"
                sx={{ mb: 1 }}
              >
                Resumen de la cita
              </Typography>
              <Grid container spacing={1}>
                {[
                  {
                    label: "Paciente",
                    value: (
                      pacienteSeleccionado.nombreCompletoPaciente || ""
                    ).trim(),
                  },
                  {
                    label: "Médico",
                    value:
                      medicos.find((m) => m.medico_ID === Number(medicoId))
                        ?.nombreMedico ||
                      medicos.find((m) => m.medico_ID === Number(medicoId))
                        ?.codigo ||
                      "—",
                  },
                  { label: "Fecha", value: fechaCita },
                  { label: "Hora", value: horaInicio },
                  {
                    label: "Tipo",
                    value:
                      tiposConsulta.find(
                        (t) => t.tipoConsulta_ID === Number(tipoConsultaId),
                      )?.nombre || "—",
                  },
                  {
                    label: "Estado",
                    value: esCitaConfirmada ? "Confirmada" : "Pre-Reserva",
                  },
                ].map(({ label, value }) => (
                  <Grid item xs={6} sm={4} key={label}>
                    <Typography variant="caption" color="#6b7280">
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#1e40af"
                    >
                      {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

      {/* BOTONES */}
      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/agendamiento/disponibilidad")}
          disabled={guardando}
          sx={{
            borderRadius: 1.5,
            fontWeight: 600,
            textTransform: "none",
            borderColor: "#d1d5db",
            color: "#374151",
            "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={
            guardando ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <EventAvailable />
            )
          }
          onClick={handleGuardar}
          disabled={guardando || catalogosLoading}
          sx={{
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
            borderRadius: 1.5,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "none",
            px: 3,
          }}
        >
          {guardando
            ? "Guardando..."
            : esCitaConfirmada
              ? "Agendar y Confirmar"
              : "Agendar Cita"}
        </Button>
      </Box>
    </Box>
  );
}
