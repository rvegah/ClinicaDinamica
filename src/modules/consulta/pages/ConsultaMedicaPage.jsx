// src/modules/consulta/pages/ConsultaMedicaPage.jsx
// Módulo de consulta médica completo
// Flujo: Buscar citas "Listo para Consulta" → Iniciar → Registrar → Finalizar → Imprimir

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Portal,
  Paper,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Search,
  MedicalServices,
  CheckCircle,
  Add,
  Delete,
  Print,
  Done,
  FilterList,
  LocalHospital,
  Science,
  Medication,
  Assignment,
  PlayArrow,
  MonitorHeart,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import atencionMedicaService from "../../../services/api/atencionMedicaService";
import { fechaHoy } from "../../../utils/fecha";

// ─── HELPER: usuario logueado ─────────────────────────────────────────────────
const getUsuario = () => {
  try {
    const u = JSON.parse(sessionStorage.getItem("user") || "{}");
    return {
      id: u.usuario_ID || 1,
      personalMedicoId: u.personalMedico_ID || null,
      nombre: u.nombreCompleto || "MÉDICO",
    };
  } catch {
    return { id: 1, personalMedicoId: null, nombre: "MÉDICO" };
  }
};

const hoy = () => fechaHoy();
const horaActual = () => new Date().toTimeString().slice(0, 5);

// ─── CHIP ESTADO ──────────────────────────────────────────────────────────────
function ChipEstado({ estado }) {
  const col =
    estado === "Listo para Consulta"
      ? { bg: "#ecfdf5", color: "#047857" }
      : estado === "EN_PROCESO"
        ? { bg: "#ede9fe", color: "#6d28d9" }
        : { bg: "#f3f4f6", color: "#374151" };
  return (
    <Chip
      label={estado}
      size="small"
      sx={{
        bgcolor: col.bg,
        color: col.color,
        fontWeight: 700,
        fontSize: 11,
        height: 20,
      }}
    />
  );
}

// ─── TAB PANEL ────────────────────────────────────────────────────────────────
function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

// ═════════════════════════════════════════════════════════════════════════════
// SECCIÓN 1 — BUSCADOR DE CITAS
// ═════════════════════════════════════════════════════════════════════════════
function BuscadorCitas({ onSeleccionar }) {
  const { enqueueSnackbar } = useSnackbar();
  const [fechaInicio, setFechaInicio] = useState(hoy());
  const [fechaFin, setFechaFin] = useState(hoy());
  const [citas, setCitas] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [iniciando, setIniciando] = useState(null);

  const handleBuscar = async () => {
    setBuscando(true);
    setBuscado(false);
    try {
      const res = await atencionMedicaService.buscarCitasParaConsulta({
        fechaInicio,
        fechaFin,
      });
      const lista = res.exitoso ? res.datos || [] : [];
      // Solo mostrar "Listo para Consulta"
      const filtradas = lista.filter((c) =>
        ["Listo para Consulta", "En Atención"].includes(c.estadoCita),
      );
      setCitas(filtradas);
      setBuscado(true);
      if (filtradas.length === 0)
        enqueueSnackbar("No hay pacientes listos para consulta", {
          variant: "info",
        });
    } catch {
      setCitas([]);
      setBuscado(true);
    } finally {
      setBuscando(false);
    }
  };

  const handleIniciar = async (cita) => {
    setIniciando(cita.cita_ID);
    const usuario = getUsuario();
    try {
      const payload = {
        cita_ID: cita.cita_ID,
        paciente_ID: cita.paciente_ID,
        medico_ID: cita.medico_ID,
        espeacialidad_ID: cita.especialidad_ID,
        tipoConsulta_ID: cita.tipoConsulta_ID,
        fechaConsulta: cita.fechaCita,
        horaInicio: cita.horaInicio,
        motivoConsulta: cita.motivoConsulta || "",
        usuarioRegistro: usuario.id,
      };
      const res = await atencionMedicaService.iniciarConsulta(payload);
      if (res.exitoso) {
        enqueueSnackbar("✅ Consulta iniciada", { variant: "success" });
        onSeleccionar({ cita, consultaMedica: res.datos });
      } else {
        enqueueSnackbar(res.mensaje || "Error al iniciar consulta", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error al iniciar consulta", {
        variant: "error",
      });
    } finally {
      setIniciando(null);
    }
  };

  const card = {
    borderRadius: 2,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    bgcolor: "white",
  };

  return (
    <Box>
      {/* Filtros */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            color="#111827"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <FilterList sx={{ fontSize: 16, color: "#6b7280" }} />
            Buscar Pacientes Listos para Consulta
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr auto" },
              gap: 1.5,
              alignItems: "flex-end",
            }}
          >
            <TextField
              size="small"
              label="Fecha Inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Fecha Fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              startIcon={
                buscando ? (
                  <CircularProgress size={15} color="inherit" />
                ) : (
                  <Search />
                )
              }
              onClick={handleBuscar}
              disabled={buscando}
              sx={{
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
                borderRadius: 1.5,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              {buscando ? "Buscando..." : "Buscar"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Lista */}
      {buscado && citas.length > 0 && (
        <Card sx={card}>
          <CardContent sx={{ p: 0 }}>
            {/* Cabecera */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "2.5fr 1.5fr 1.5fr 1fr 1fr 100px",
                bgcolor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                px: 2,
                py: 1.25,
              }}
            >
              {[
                "Paciente",
                "Especialidad",
                "Tipo Consulta",
                "Fecha",
                "Hora",
                "",
              ].map((h) => (
                <Typography
                  key={h}
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    fontSize: 11,
                  }}
                >
                  {h}
                </Typography>
              ))}
            </Box>
            {citas.map((cita, idx) => {
              const enProceso = iniciando === cita.cita_ID;
              return (
                <Box
                  key={cita.cita_ID}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2.5fr 1.5fr 1.5fr 1fr 1fr 100px",
                    px: 2,
                    py: 1.5,
                    alignItems: "center",
                    borderBottom:
                      idx < citas.length - 1 ? "1px solid #f3f4f6" : "none",
                    "&:hover": { bgcolor: "#fafafa" },
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#111827"
                    >
                      {cita.nombrePaciente}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {cita.numeroCita}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="#374151" fontSize={13}>
                    {cita.nombreEspecialidad}
                  </Typography>
                  <Typography variant="body2" color="#374151" fontSize={13}>
                    {cita.nombreTipoConsulta}
                  </Typography>
                  <Typography variant="body2" color="#374151" fontSize={13}>
                    {cita.fechaCita}
                  </Typography>
                  <Typography variant="body2" color="#374151" fontSize={13}>
                    {(cita.horaInicio || "").slice(0, 5)}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={
                      enProceso ? (
                        <CircularProgress size={12} color="inherit" />
                      ) : (
                        <PlayArrow />
                      )
                    }
                    onClick={() => handleIniciar(cita)}
                    disabled={enProceso}
                    sx={{
                      bgcolor: "#16a34a",
                      "&:hover": { bgcolor: "#15803d" },
                      borderRadius: 1.5,
                      fontWeight: 700,
                      textTransform: "none",
                      boxShadow: "none",
                      fontSize: 11,
                      py: 0.5,
                    }}
                  >
                    Iniciar
                  </Button>
                </Box>
              );
            })}
          </CardContent>
        </Card>
      )}

      {buscado && citas.length === 0 && (
        <Alert
          severity="info"
          sx={{
            borderRadius: 1.5,
            border: "1px solid #bfdbfe",
            bgcolor: "#eff6ff",
          }}
        >
          No hay pacientes en estado "Listo para Consulta" en el rango de fechas
          seleccionado.
        </Alert>
      )}

      {!buscado && (
        <Box sx={{ textAlign: "center", py: 8, color: "#9ca3af" }}>
          <LocalHospital sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
          <Typography variant="body1" fontWeight={500}>
            Busque los pacientes listos para consulta médica
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Solo aparecen pacientes que pasaron por triaje de enfermería
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SECCIÓN 2 — FORMULARIO DE CONSULTA
// ═════════════════════════════════════════════════════════════════════════════
function FormularioConsulta({ cita, consultaMedica, onFinalizar }) {
  const { enqueueSnackbar } = useSnackbar();
  const usuario = getUsuario();

  const [tab, setTab] = useState(0);

  // ─── Datos clínicos (solo se envían al Finalizar) ─────────────────────────
  const [clinica, setClinica] = useState({
    enfermedadActual: "",
    diagnosticoClinico: "",
    revisionSistemas: "",
    examenFisico: "",
    planTratamiento: "",
    observaciones: "",
    proximaCita: "",
  });

  // ─── Diagnósticos CIE-10 ──────────────────────────────────────────────────
  const [cie10Lista, setCie10Lista] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [diagForm, setDiagForm] = useState({
    diagnostico_ID: "",
    codigoCIE10: "",
    nombre: "",
    descripcion: "",
    tipoDiagnostico: "definitivo",
    esPrincipal: false,
    observaciones: "",
  });
  const [guardandoDiag, setGuardandoDiag] = useState(false);

  // ─── Procedimientos ───────────────────────────────────────────────────────
  const [procLista, setProcLista] = useState([]);
  const [procedimientos, setProcedimientos] = useState([]);
  const [procForm, setProcForm] = useState({
    procedimiento_ID: "",
    descripcion: "",
  });
  const [guardandoProc, setGuardandoProc] = useState(false);

  // ─── Órdenes médicas ─────────────────────────────────────────────────────
  const [tiposOrden, setTiposOrden] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenForm, setOrdenForm] = useState({
    tipoOrdenMedica: "",
    descripcion: "",
    indicaciones: "",
    observaciones: "",
  });
  const [guardandoOrden, setGuardandoOrden] = useState(false);

  // ─── Prescripciones ──────────────────────────────────────────────────────
  const [prescripciones, setPrescripciones] = useState([]);
  /*const [rxForm, setRxForm] = useState({
    medicamento_ID: '', nombreMedicamento: '', concentracion: '',
    formaFarmaceutica: '', dosis: '', frecuencia: '',
    viaAdministracion: 'oral', duracion: '', cantidad: '',
    indicaciones: '', vigencia: '', observaciones: '',
  });*/
  const [rxForm, setRxForm] = useState({
    medicamento_ID: "",
    nombreMedicamento: "",
    codigoProducto: "",
    concentracion: "",
    formaFarmaceutica: "",
    dosis: "",
    frecuencia: "",
    viaAdministracion: "oral",
    duracion: "",
    cantidad: "",
    indicaciones: "",
    vigencia: "",
    observaciones: "",
  });
  const [busqMed, setBusqMed] = useState("");
  const [medicamentos, setMedicamentos] = useState([]);
  const [buscandoMed, setBuscandoMed] = useState(false);
  const [guardandoRx, setGuardandoRx] = useState(false);
  const medRef = useRef(null);

  // ─── Finalizar ───────────────────────────────────────────────────────────
  const [finalizando, setFinalizando] = useState(false);

  // ─── Cargar catálogos ─────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      atencionMedicaService.getDiagnosticosCIE10().catch(() => ({ datos: [] })),
      atencionMedicaService.getProcedimientos().catch(() => ({ datos: [] })),
      atencionMedicaService.getTiposOrden().catch(() => ({ datos: [] })),
    ]).then(([cie, proc, ord]) => {
      setCie10Lista(cie.datos || []);
      setProcLista(proc.datos || []);
      setTiposOrden(ord.datos || []);
    });
  }, []);

  const [triaje, setTriaje] = useState(null);
  const [triajeCargando, setTriajeCargando] = useState(false);

  const cargarTriaje = async () => {
    setTriajeCargando(true);
    try {
      const res = await atencionMedicaService.obtenerTriaje({
        citaId: cita.cita_ID,
        pacienteId: cita.paciente_ID,
      });
      if (res.exitoso) setTriaje(res.datos);
    } catch {
    } finally {
      setTriajeCargando(false);
    }
  };

  useEffect(() => {
    cargarTriaje();
  }, []);

  // ─── Buscar medicamentos (debounce 400ms) ────────────────────────────────
  useEffect(() => {
    if (!busqMed || busqMed.length < 3) {
      setMedicamentos([]);
      return;
    }
    const t = setTimeout(async () => {
      setBuscandoMed(true);
      try {
        const res = await atencionMedicaService.buscarMedicamentos(busqMed);
        setMedicamentos(res.datos || []);
      } catch {
        setMedicamentos([]);
      } finally {
        setBuscandoMed(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [busqMed]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const cambiarClinica = (k, v) => setClinica((p) => ({ ...p, [k]: v }));

  // ─── GUARDAR DIAGNÓSTICO ─────────────────────────────────────────────────
  const handleAgregarDiag = async () => {
    if (!diagForm.diagnostico_ID) {
      enqueueSnackbar("Seleccione un diagnóstico CIE-10", {
        variant: "warning",
      });
      return;
    }
    setGuardandoDiag(true);
    try {
      const payload = {
        cita_ID: cita.cita_ID,
        diagnostico_ID: diagForm.diagnostico_ID,
        codigoCIE10: diagForm.codigoCIE10,
        descripcion: diagForm.descripcion || diagForm.nombre,
        tipoDiagnostico: diagForm.tipoDiagnostico,
        esPrincipal: diagForm.esPrincipal,
        observaciones: diagForm.observaciones || "",
        usuarioRegistro: usuario.id,
      };
      const res = await atencionMedicaService.agregarDiagnostico(payload);
      if (res.exitoso) {
        setDiagnosticos((p) => [...p, { ...diagForm }]);
        setDiagForm({
          diagnostico_ID: "",
          codigoCIE10: "",
          nombre: "",
          descripcion: "",
          tipoDiagnostico: "definitivo",
          esPrincipal: false,
          observaciones: "",
        });
        enqueueSnackbar("✅ Diagnóstico agregado", { variant: "success" });
      } else {
        enqueueSnackbar(res.mensaje || "Error al agregar diagnóstico", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error", { variant: "error" });
    } finally {
      setGuardandoDiag(false);
    }
  };

  // ─── GUARDAR PROCEDIMIENTO ───────────────────────────────────────────────
  const handleAgregarProc = async () => {
    if (!procForm.procedimiento_ID) {
      enqueueSnackbar("Seleccione un procedimiento", { variant: "warning" });
      return;
    }
    setGuardandoProc(true);
    try {
      const proc = procLista.find(
        (p) => p.procedimiento_ID === Number(procForm.procedimiento_ID),
      );
      const payload = {
        cita_ID: cita.cita_ID,
        procedimiento_ID: Number(procForm.procedimiento_ID),
        descripcion: procForm.descripcion || proc?.nombre || "",
        fechaProcedimiento: new Date().toISOString(),
        medico_ID: cita.medico_ID,
        usuarioRegistro: usuario.id,
      };
      const res = await atencionMedicaService.agregarProcedimiento(payload);
      if (res.exitoso) {
        setProcedimientos((p) => [...p, { ...procForm, nombre: proc?.nombre }]);
        setProcForm({ procedimiento_ID: "", descripcion: "" });
        enqueueSnackbar("✅ Procedimiento agregado", { variant: "success" });
      } else {
        enqueueSnackbar(res.mensaje || "Error", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error", { variant: "error" });
    } finally {
      setGuardandoProc(false);
    }
  };

  // ─── GUARDAR ORDEN ───────────────────────────────────────────────────────
  const handleAgregarOrden = async () => {
    if (!ordenForm.tipoOrdenMedica || !ordenForm.descripcion.trim()) {
      enqueueSnackbar("Tipo y descripción son obligatorios", {
        variant: "warning",
      });
      return;
    }
    setGuardandoOrden(true);
    try {
      const tipo = tiposOrden.find(
        (t) => t.tipoOrdenMedica_ID === Number(ordenForm.tipoOrdenMedica),
      );
      const payload = {
        cita_ID: cita.cita_ID,
        tipoOrdenMedica: Number(ordenForm.tipoOrdenMedica),
        descripcion: ordenForm.descripcion,
        indicaciones: ordenForm.indicaciones || "",
        observaciones: ordenForm.observaciones || "",
        fechaOrden: hoy(),
        usuarioRegistro: usuario.id,
      };
      const res = await atencionMedicaService.agregarOrden(payload);
      if (res.exitoso) {
        setOrdenes((p) => [...p, { ...ordenForm, nombreTipo: tipo?.nombre }]);
        setOrdenForm({
          tipoOrdenMedica: "",
          descripcion: "",
          indicaciones: "",
          observaciones: "",
        });
        enqueueSnackbar("✅ Orden médica agregada", { variant: "success" });
      } else {
        enqueueSnackbar(res.mensaje || "Error", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error", { variant: "error" });
    } finally {
      setGuardandoOrden(false);
    }
  };

  // ─── GUARDAR PRESCRIPCIÓN ────────────────────────────────────────────────
  const handleAgregarRx = async () => {
    if (!rxForm.medicamento_ID || !rxForm.dosis.trim()) {
      enqueueSnackbar("Seleccione un medicamento e ingrese la dosis", {
        variant: "warning",
      });
      return;
    }
    setGuardandoRx(true);
    try {
      const fechaRx = hoy();
      const payload = {
        cita_ID: cita.cita_ID,
        fechaPrescripcion: fechaRx,
        vigencia: rxForm.vigencia || fechaRx,
        observaciones: rxForm.observaciones || "*",
        medicamento_ID: rxForm.medicamento_ID,
        nombreMedicamento: rxForm.nombreMedicamento,
        concentracion: rxForm.concentracion,
        formaFarmaceutica: rxForm.formaFarmaceutica,
        dosis: rxForm.dosis,
        frecuencia: rxForm.frecuencia,
        viaAdministracion: rxForm.viaAdministracion,
        duracion: rxForm.duracion,
        cantidad: Number(rxForm.cantidad) || 0,
        indicaciones: rxForm.indicaciones || "",
        usuarioRegistro: usuario.id,
      };
      const res = await atencionMedicaService.agregarPrescripcion(payload);
      if (res.exitoso) {
        setPrescripciones((p) => [...p, { ...rxForm }]);
        setRxForm({
          medicamento_ID: "",
          nombreMedicamento: "",
          concentracion: "",
          formaFarmaceutica: "",
          dosis: "",
          frecuencia: "",
          viaAdministracion: "oral",
          duracion: "",
          cantidad: "",
          indicaciones: "",
          vigencia: "",
          observaciones: "",
        });
        setBusqMed("");
        setMedicamentos([]);
        enqueueSnackbar("✅ Prescripción agregada", { variant: "success" });
      } else {
        enqueueSnackbar(res.mensaje || "Error", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error", { variant: "error" });
    } finally {
      setGuardandoRx(false);
    }
  };

  // ─── FINALIZAR CONSULTA ──────────────────────────────────────────────────
  const handleFinalizar = async () => {
    if (diagnosticos.length === 0) {
      enqueueSnackbar(
        "Debe agregar al menos un diagnóstico CIE-10 antes de finalizar",
        { variant: "error" },
      );
      setTab(1);
      return;
    }
    setFinalizando(true);
    try {
      const payload = {
        cita_ID: cita.cita_ID,
        enfermedadActual: clinica.enfermedadActual,
        diagnosticoClinico: clinica.diagnosticoClinico,
        revisionSistemas: clinica.revisionSistemas,
        examenFisico: clinica.examenFisico,
        planTratamiento: clinica.planTratamiento,
        observaciones: clinica.observaciones,
        proximaCita: clinica.proximaCita || null,
        usuarioModificacion: usuario.id,
      };
      const res = await atencionMedicaService.finalizarConsulta(payload);
      if (res.exitoso) {
        enqueueSnackbar("✅ Consulta finalizada", { variant: "success" });
        onFinalizar({
          cita,
          consultaMedica: res.datos || consultaMedica,
          clinica,
          diagnosticos,
          procedimientos,
          ordenes,
          prescripciones,
          medico: usuario.nombre,
          triaje,
        });
      } else {
        enqueueSnackbar(res.mensaje || "Error al finalizar", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error al finalizar", {
        variant: "error",
      });
    } finally {
      setFinalizando(false);
    }
  };

  // ─── ESTILOS ──────────────────────────────────────────────────────────────
  const card = {
    borderRadius: 2,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    bgcolor: "white",
  };
  const addBtn = {
    bgcolor: "#2563eb",
    "&:hover": { bgcolor: "#1d4ed8" },
    borderRadius: 1.5,
    fontWeight: 700,
    textTransform: "none",
    boxShadow: "none",
  };
  const listaItem = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 2,
    py: 1,
    bgcolor: "#f9fafb",
    borderRadius: 1.5,
    border: "1px solid #e5e7eb",
    mb: 1,
  };

  return (
    <Box>
      {/* Banner info cita */}
      <Card
        sx={{
          ...card,
          mb: 2,
          border: "1.5px solid #bfdbfe",
          bgcolor: "#eff6ff",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={700} color="#1e40af">
                <MedicalServices
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                />
                Consulta en proceso
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#111827">
                {cita.nombrePaciente}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {cita.nombreEspecialidad} · {cita.nombreTipoConsulta} ·{" "}
                {cita.fechaCita} {(cita.horaInicio || "").slice(0, 5)} ·{" "}
                {cita.numeroCita}
              </Typography>
            </Box>
            <Chip
              label={
                diagnosticos.length === 0
                  ? "⚠ Sin diagnóstico"
                  : `${diagnosticos.length} diagnóstico(s)`
              }
              size="small"
              sx={{
                bgcolor: diagnosticos.length === 0 ? "#fef3c7" : "#dcfce7",
                color: diagnosticos.length === 0 ? "#92400e" : "#15803d",
                fontWeight: 700,
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* PANEL TRIAJE */}
      <Card
        sx={{
          ...card,
          mb: 2,
          border: "1.5px solid #d1fae5",
          bgcolor: "#f0fdf4",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: triaje ? 1.5 : 0,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              color="#065f46"
              sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
            >
              <MonitorHeart sx={{ fontSize: 16 }} />
              Signos Vitales — Triaje de Enfermería
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={cargarTriaje}
              disabled={triajeCargando}
              startIcon={
                triajeCargando ? (
                  <CircularProgress size={12} color="inherit" />
                ) : null
              }
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontSize: 11,
                borderColor: "#6ee7b7",
                color: "#065f46",
                fontWeight: 600,
                "&:hover": { bgcolor: "#d1fae5", borderColor: "#34d399" },
              }}
            >
              {triajeCargando ? "Cargando..." : "↻ Actualizar"}
            </Button>
          </Box>

          {triaje ? (
            <>
              <Typography
                variant="caption"
                color="#6b7280"
                sx={{ display: "block", mb: 1 }}
              >
                Enfermera: <strong>{triaje.enfermera}</strong> · {triaje.fecha}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: 1,
                }}
              >
                {[
                  {
                    label: "Presión Sistólica",
                    value: triaje.presionArterialSistolica,
                    unit: "mmHg",
                  },
                  {
                    label: "Presión Diastólica",
                    value: triaje.presionArterialDiastolica,
                    unit: "mmHg",
                  },
                  {
                    label: "Frec. Cardíaca",
                    value: triaje.frecuenciaCardiaca,
                    unit: "lpm",
                  },
                  {
                    label: "Frec. Respiratoria",
                    value: triaje.frecuenciaRespiratoria,
                    unit: "rpm",
                  },
                  {
                    label: "Temperatura",
                    value: triaje.temperatura,
                    unit: "°C",
                  },
                  {
                    label: "Saturación O₂",
                    value: triaje.saturacionOxigeno,
                    unit: "%",
                  },
                  { label: "Peso", value: triaje.peso, unit: "kg" },
                  { label: "Talla", value: triaje.talla, unit: "cm" },
                  { label: "IMC", value: triaje.imc, unit: "" },
                  {
                    label: "Perm. Cefálico",
                    value: triaje.perimetroCefalico,
                    unit: "cm",
                  },
                  {
                    label: "Perm. Abdominal",
                    value: triaje.perimetroAbdominal,
                    unit: "cm",
                  },
                  { label: "Glicemia", value: triaje.glicemia, unit: "mg/dL" },
                ]
                  .filter(
                    (s) =>
                      s.value !== null &&
                      s.value !== undefined &&
                      s.value !== "" &&
                      Number(s.value) > 0,
                  )
                  .map(({ label, value, unit }) => (
                    <Box
                      key={label}
                      sx={{
                        p: 1,
                        bgcolor: "white",
                        borderRadius: 1.5,
                        border: "1px solid #a7f3d0",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="#6b7280"
                        sx={{ display: "block", fontSize: 10 }}
                      >
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color="#065f46"
                      >
                        {value}{" "}
                        <span style={{ fontSize: 10, fontWeight: 400 }}>
                          {unit}
                        </span>
                      </Typography>
                    </Box>
                  ))}
              </Box>
              {triaje.observaciones && (
                <Box
                  sx={{
                    mt: 1,
                    px: 1.5,
                    py: 1,
                    bgcolor: "white",
                    borderRadius: 1,
                    border: "1px solid #a7f3d0",
                  }}
                >
                  <Typography variant="caption" color="#6b7280">
                    Obs:{" "}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="#065f46"
                    fontWeight={600}
                  >
                    {triaje.observaciones}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Typography
              variant="caption"
              color="#6b7280"
              sx={{ fontStyle: "italic" }}
            >
              {triajeCargando
                ? "Cargando triaje..."
                : "Sin datos de triaje registrados"}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* TABS */}
      <Card sx={card}>
        <Box sx={{ borderBottom: "1px solid #e5e7eb" }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
              },
            }}
          >
            <Tab label="Datos Clínicos" />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  Diagnósticos CIE-10
                  {diagnosticos.length > 0 && (
                    <Chip
                      label={diagnosticos.length}
                      size="small"
                      sx={{
                        bgcolor: "#dcfce7",
                        color: "#15803d",
                        fontWeight: 700,
                        height: 18,
                        fontSize: 10,
                      }}
                    />
                  )}
                </Box>
              }
            />
            <Tab label="Procedimientos" />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  Órdenes Médicas
                  {ordenes.length > 0 && (
                    <Chip
                      label={ordenes.length}
                      size="small"
                      sx={{
                        bgcolor: "#dbeafe",
                        color: "#1d4ed8",
                        fontWeight: 700,
                        height: 18,
                        fontSize: 10,
                      }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  Prescripciones
                  {prescripciones.length > 0 && (
                    <Chip
                      label={prescripciones.length}
                      size="small"
                      sx={{
                        bgcolor: "#ede9fe",
                        color: "#6d28d9",
                        fontWeight: 700,
                        height: 18,
                        fontSize: 10,
                      }}
                    />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          {/* TAB 0 — DATOS CLÍNICOS */}
          <TabPanel value={tab} index={0}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                {
                  k: "enfermedadActual",
                  label: "Enfermedad Actual",
                  placeholder: "Describa la enfermedad actual del paciente...",
                },
                {
                  k: "diagnosticoClinico",
                  label: "Diagnóstico Clínico",
                  placeholder: "Diagnóstico clínico preliminar...",
                },
                {
                  k: "revisionSistemas",
                  label: "Revisión de Sistemas",
                  placeholder: "Cardiovascular, respiratorio, digestivo...",
                },
                {
                  k: "examenFisico",
                  label: "Examen Físico",
                  placeholder: "PA, FC, FR, temperatura, hallazgos...",
                },
                {
                  k: "planTratamiento",
                  label: "Plan de Tratamiento",
                  placeholder:
                    "Medicamentos indicados, procedimientos, derivaciones...",
                },
                {
                  k: "observaciones",
                  label: "Observaciones",
                  placeholder: "Observaciones adicionales...",
                },
              ].map(({ k, label, placeholder }) => (
                <TextField
                  key={k}
                  fullWidth
                  size="small"
                  label={label}
                  value={clinica[k]}
                  onChange={(e) => cambiarClinica(k, e.target.value)}
                  multiline
                  rows={2}
                  placeholder={placeholder}
                />
              ))}

              <TextField
                fullWidth
                size="small"
                label="Próxima Cita (obligatorio)"
                type="date"
                value={clinica.proximaCita}
                onChange={(e) => cambiarClinica("proximaCita", e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Fecha de control sugerida"
                sx={{ maxWidth: 220 }}
              />
            </Box>
          </TabPanel>

          {/* TAB 1 — DIAGNÓSTICOS CIE-10 */}
          <TabPanel value={tab} index={1}>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 1, py: 0.5 }}>
              <Typography variant="caption">
                <strong>Obligatorio:</strong> Debe agregar al menos un
                diagnóstico CIE-10 para finalizar la consulta.
              </Typography>
            </Alert>

            {/* Formulario agregar diagnóstico */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" },
                gap: 1.5,
                mb: 2,
              }}
            >
              <TextField
                select
                size="small"
                label="Diagnóstico CIE-10 *"
                value={diagForm.diagnostico_ID}
                onChange={(e) => {
                  const d = cie10Lista.find(
                    (x) => x.diagnosticoCIE10_ID === Number(e.target.value),
                  );
                  setDiagForm((p) => ({
                    ...p,
                    diagnostico_ID: Number(e.target.value),
                    codigoCIE10: d?.codigo || "",
                    nombre: d?.nombre || "",
                  }));
                }}
              >
                <MenuItem value="">— Seleccione —</MenuItem>
                {cie10Lista.map((d) => (
                  <MenuItem
                    key={d.diagnosticoCIE10_ID}
                    value={d.diagnosticoCIE10_ID}
                  >
                    {d.codigo} — {d.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Tipo Diagnóstico"
                value={diagForm.tipoDiagnostico}
                onChange={(e) =>
                  setDiagForm((p) => ({
                    ...p,
                    tipoDiagnostico: e.target.value,
                  }))
                }
              >
                {["definitivo", "presuntivo", "preventivo", "diferencial"].map(
                  (t) => (
                    <MenuItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </MenuItem>
                  ),
                )}
              </TextField>
              <TextField
                size="small"
                label="Descripción"
                value={diagForm.descripcion}
                onChange={(e) =>
                  setDiagForm((p) => ({ ...p, descripcion: e.target.value }))
                }
                placeholder="Descripción del cuadro clínico..."
              />
              <TextField
                size="small"
                label="Observaciones"
                value={diagForm.observaciones}
                onChange={(e) =>
                  setDiagForm((p) => ({ ...p, observaciones: e.target.value }))
                }
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={diagForm.esPrincipal}
                    size="small"
                    onChange={(e) =>
                      setDiagForm((p) => ({
                        ...p,
                        esPrincipal: e.target.checked,
                      }))
                    }
                    sx={{
                      color: "#2563eb",
                      "&.Mui-checked": { color: "#2563eb" },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={600}>
                    Es diagnóstico principal
                  </Typography>
                }
              />
              <Button
                variant="contained"
                startIcon={
                  guardandoDiag ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Add />
                  )
                }
                onClick={handleAgregarDiag}
                disabled={guardandoDiag}
                sx={addBtn}
              >
                Agregar
              </Button>
            </Box>

            {/* Lista diagnósticos agregados */}
            {diagnosticos.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="#6b7280"
                  sx={{ mb: 1, display: "block" }}
                >
                  DIAGNÓSTICOS AGREGADOS
                </Typography>
                {diagnosticos.map((d, i) => (
                  <Box key={i} sx={listaItem}>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="#111827"
                      >
                        {d.codigoCIE10} — {d.nombre}
                        {d.esPrincipal && (
                          <Chip
                            label="Principal"
                            size="small"
                            sx={{
                              ml: 1,
                              bgcolor: "#dcfce7",
                              color: "#15803d",
                              fontWeight: 700,
                              height: 16,
                              fontSize: 9,
                            }}
                          />
                        )}
                      </Typography>
                      {d.descripcion && (
                        <Typography variant="caption" color="text.secondary">
                          {d.descripcion}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={d.tipoDiagnostico}
                        size="small"
                        sx={{
                          bgcolor: "#eff6ff",
                          color: "#2563eb",
                          fontWeight: 600,
                          fontSize: 10,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setDiagnosticos((p) =>
                            p.filter((_, idx) => idx !== i),
                          )
                        }
                        sx={{ color: "#ef4444" }}
                      >
                        <Delete sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </TabPanel>

          {/* TAB 2 — PROCEDIMIENTOS */}
          <TabPanel value={tab} index={2}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "2fr 2fr auto" },
                gap: 1.5,
                mb: 2,
                alignItems: "flex-end",
              }}
            >
              <TextField
                select
                size="small"
                label="Procedimiento"
                value={procForm.procedimiento_ID}
                onChange={(e) =>
                  setProcForm((p) => ({
                    ...p,
                    procedimiento_ID: e.target.value,
                  }))
                }
              >
                <MenuItem value="">— Seleccione —</MenuItem>
                {procLista.map((p) => (
                  <MenuItem key={p.procedimiento_ID} value={p.procedimiento_ID}>
                    {p.nombre} ({p.codigo})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Descripción"
                value={procForm.descripcion}
                onChange={(e) =>
                  setProcForm((p) => ({ ...p, descripcion: e.target.value }))
                }
                placeholder="Detalles del procedimiento..."
              />
              <Button
                variant="contained"
                startIcon={
                  guardandoProc ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Add />
                  )
                }
                onClick={handleAgregarProc}
                disabled={guardandoProc}
                sx={addBtn}
              >
                Agregar
              </Button>
            </Box>
            {procedimientos.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="#6b7280"
                  sx={{ mb: 1, display: "block" }}
                >
                  PROCEDIMIENTOS AGREGADOS
                </Typography>
                {procedimientos.map((p, i) => (
                  <Box key={i} sx={listaItem}>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="#111827"
                      >
                        {p.nombre || p.procedimiento_ID}
                      </Typography>
                      {p.descripcion && (
                        <Typography variant="caption" color="text.secondary">
                          {p.descripcion}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setProcedimientos((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      sx={{ color: "#ef4444" }}
                    >
                      <Delete sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
            {procedimientos.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Sin procedimientos registrados (opcional)
              </Typography>
            )}
          </TabPanel>

          {/* TAB 3 — ÓRDENES MÉDICAS */}
          <TabPanel value={tab} index={3}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 2fr" },
                gap: 1.5,
                mb: 2,
              }}
            >
              <TextField
                select
                size="small"
                label="Tipo de Orden *"
                value={ordenForm.tipoOrdenMedica}
                onChange={(e) =>
                  setOrdenForm((p) => ({
                    ...p,
                    tipoOrdenMedica: e.target.value,
                  }))
                }
              >
                <MenuItem value="">— Seleccione —</MenuItem>
                {tiposOrden.map((t) => (
                  <MenuItem
                    key={t.tipoOrdenMedica_ID}
                    value={t.tipoOrdenMedica_ID}
                  >
                    {t.nombre}{" "}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ ml: 0.5, color: "#9ca3af" }}
                    >
                      ({t.categoria})
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Descripción *"
                value={ordenForm.descripcion}
                onChange={(e) =>
                  setOrdenForm((p) => ({ ...p, descripcion: e.target.value }))
                }
                placeholder="Ej: Hemograma completo de sangre..."
              />
              <TextField
                size="small"
                label="Indicaciones"
                value={ordenForm.indicaciones}
                onChange={(e) =>
                  setOrdenForm((p) => ({ ...p, indicaciones: e.target.value }))
                }
                placeholder="Ej: En ayunas, 8 horas antes..."
              />
              <TextField
                size="small"
                label="Observaciones"
                value={ordenForm.observaciones}
                onChange={(e) =>
                  setOrdenForm((p) => ({ ...p, observaciones: e.target.value }))
                }
              />
            </Box>
            <Button
              variant="contained"
              startIcon={
                guardandoOrden ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <Add />
                )
              }
              onClick={handleAgregarOrden}
              disabled={guardandoOrden}
              sx={{ ...addBtn, mb: 2 }}
            >
              Agregar Orden
            </Button>

            {ordenes.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="#6b7280"
                  sx={{ mb: 1, display: "block" }}
                >
                  ÓRDENES AGREGADAS
                </Typography>
                {ordenes.map((o, i) => (
                  <Box key={i} sx={listaItem}>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="#111827"
                      >
                        {o.nombreTipo} — {o.descripcion}
                      </Typography>
                      {o.indicaciones && (
                        <Typography variant="caption" color="text.secondary">
                          {o.indicaciones}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={o.nombreTipo}
                        size="small"
                        sx={{
                          bgcolor: "#dbeafe",
                          color: "#1d4ed8",
                          fontWeight: 600,
                          fontSize: 10,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setOrdenes((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        sx={{ color: "#ef4444" }}
                      >
                        <Delete sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            {ordenes.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Sin órdenes médicas (opcional)
              </Typography>
            )}
          </TabPanel>

          {/* TAB 4 — PRESCRIPCIONES */}
          <TabPanel value={tab} index={4}>
            {/* Buscador medicamento */}
            <Box sx={{ mb: 2 }} ref={medRef}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="#374151"
                sx={{ mb: 0.75, display: "block" }}
              >
                Buscar Medicamento (mínimo 3 letras)
              </Typography>
              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ej: ibuprofeno, amoxicilina..."
                  value={busqMed}
                  onChange={(e) => setBusqMed(e.target.value)}
                  onBlur={() => setTimeout(() => setMedicamentos([]), 200)}
                  InputProps={{
                    startAdornment: buscandoMed ? (
                      <CircularProgress size={14} sx={{ mr: 1 }} />
                    ) : (
                      <Search sx={{ fontSize: 16, color: "#9ca3af", mr: 1 }} />
                    ),
                  }}
                />
                {medicamentos.length > 0 && (
                  <Portal>
                    <Paper
                      sx={{
                        position: "fixed",
                        zIndex: 9999,
                        width: medRef.current
                          ? medRef.current.getBoundingClientRect().width
                          : 500,
                        top: medRef.current
                          ? medRef.current.getBoundingClientRect().bottom + 4
                          : 200,
                        left: medRef.current
                          ? medRef.current.getBoundingClientRect().left
                          : 100,
                        maxHeight: 240,
                        overflow: "auto",
                        borderRadius: 1.5,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                        border: "1px solid #e5e7eb",
                        bgcolor: "white",
                      }}
                    >
                      {medicamentos.map((m) => (
                        <Box
                          key={m.medicamento_ID}
                          /*onMouseDown={() => {
                            setRxForm((p) => ({
                              ...p,
                              medicamento_ID: m.medicamento_ID,
                              nombreMedicamento: m.medicamento,
                              concentracion: m.formaFarmaceutica || '',
                              formaFarmaceutica: m.formaFarmaceutica || '',
                            }));
                            setBusqMed(m.medicamento);
                            setMedicamentos([]);
                          }}*/
                          onMouseDown={() => {
                            setRxForm((p) => ({
                              ...p,
                              medicamento_ID: m.medicamento_ID,
                              nombreMedicamento: m.medicamento,
                              codigoProducto: m.codigoProducto || "",
                              concentracion: m.formaFarmaceutica || "",
                              formaFarmaceutica: m.formaFarmaceutica || "",
                            }));
                            setBusqMed(m.medicamento);
                            setMedicamentos([]);
                          }}
                          sx={{
                            px: 2,
                            py: 1.25,
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#f9fafb" },
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {m.medicamento}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {/*{m.formaFarmaceutica} · {m.presentacion} · Stock: {m.cantidad}*/}
                            {m.prescripcion}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Portal>
                )}
              </Box>
            </Box>

            {/* Formulario prescripción */}
            {rxForm.medicamento_ID ? (
              <Box
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  p: 2,
                  border: "1px solid #e5e7eb",
                  mb: 2,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="#374151"
                  sx={{ mb: 1.5, display: "block" }}
                >
                  Medicamento: <strong>{rxForm.nombreMedicamento}</strong>
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  <TextField
                    size="small"
                    label="Dosis *"
                    value={rxForm.dosis}
                    onChange={(e) =>
                      setRxForm((p) => ({ ...p, dosis: e.target.value }))
                    }
                    placeholder="Ej: 1 tableta cada 8h"
                  />
                  <TextField
                    size="small"
                    label="Frecuencia"
                    value={rxForm.frecuencia}
                    onChange={(e) =>
                      setRxForm((p) => ({ ...p, frecuencia: e.target.value }))
                    }
                    placeholder="Ej: 3 veces al día"
                  />
                  <TextField
                    size="small"
                    label="Vía de Administración"
                    value={rxForm.viaAdministracion}
                    onChange={(e) =>
                      setRxForm((p) => ({
                        ...p,
                        viaAdministracion: e.target.value,
                      }))
                    }
                    placeholder="Ej: oral, intramuscular"
                  />
                  <TextField
                    size="small"
                    label="Duración"
                    value={rxForm.duracion}
                    onChange={(e) =>
                      setRxForm((p) => ({ ...p, duracion: e.target.value }))
                    }
                    placeholder="Ej: 7 días, 30 días"
                  />
                  <TextField
                    size="small"
                    label="Cantidad"
                    type="number"
                    value={rxForm.cantidad}
                    onChange={(e) =>
                      setRxForm((p) => ({ ...p, cantidad: e.target.value }))
                    }
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Vigencia"
                    type="date"
                    value={rxForm.vigencia}
                    onChange={(e) =>
                      setRxForm((p) => ({ ...p, vigencia: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    size="small"
                    label="Indicaciones"
                    value={rxForm.indicaciones}
                    onChange={(e) =>
                      setRxForm((p) => ({ ...p, indicaciones: e.target.value }))
                    }
                    placeholder="Ej: Tomar con alimentos"
                    sx={{ gridColumn: { sm: "span 3" } }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                  <Button
                    variant="contained"
                    startIcon={
                      guardandoRx ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <Add />
                      )
                    }
                    onClick={handleAgregarRx}
                    disabled={guardandoRx}
                    sx={addBtn}
                  >
                    Agregar Prescripción
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setRxForm({
                        medicamento_ID: "",
                        nombreMedicamento: "",
                        concentracion: "",
                        formaFarmaceutica: "",
                        dosis: "",
                        frecuencia: "",
                        viaAdministracion: "oral",
                        duracion: "",
                        cantidad: "",
                        indicaciones: "",
                        vigencia: "",
                        observaciones: "",
                      });
                      setBusqMed("");
                    }}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                      borderColor: "#d1d5db",
                      color: "#374151",
                    }}
                  >
                    Limpiar
                  </Button>
                </Box>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 1, py: 0.5 }}>
                <Typography variant="caption">
                  Busque y seleccione un medicamento para agregar una
                  prescripción.
                </Typography>
              </Alert>
            )}

            {/* Lista prescripciones */}
            {prescripciones.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="#6b7280"
                  sx={{ mb: 1, display: "block" }}
                >
                  PRESCRIPCIONES AGREGADAS
                </Typography>
                {prescripciones.map((rx, i) => (
                  <Box key={i} sx={listaItem}>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="#111827"
                      >
                        {rx.nombreMedicamento}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rx.dosis} · {rx.frecuencia} · {rx.duracion} · Cant:{" "}
                        {rx.cantidad}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={rx.viaAdministracion}
                        size="small"
                        sx={{
                          bgcolor: "#ede9fe",
                          color: "#6d28d9",
                          fontWeight: 600,
                          fontSize: 10,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setPrescripciones((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        sx={{ color: "#ef4444" }}
                      >
                        <Delete sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            {prescripciones.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Sin prescripciones registradas (opcional)
              </Typography>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* BOTÓN FINALIZAR */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={
            finalizando ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Done />
            )
          }
          onClick={handleFinalizar}
          disabled={finalizando}
          sx={{
            bgcolor: "#16a34a",
            "&:hover": { bgcolor: "#15803d" },
            borderRadius: 1.5,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "none",
            px: 4,
            py: 1.5,
          }}
        >
          {finalizando ? "Finalizando..." : "Finalizar Consulta Médica"}
        </Button>
      </Box>
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SECCIÓN 3 — PANTALLA DE ÉXITO + IMPRESIÓN
// ═════════════════════════════════════════════════════════════════════════════
function PantallaExito({ datos, onNueva }) {
  const {
    cita,
    clinica,
    diagnosticos,
    procedimientos,
    ordenes,
    prescripciones,
    medico,
    triaje,
  } = datos;

  const imprimirConsulta = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    const diagsHtml = diagnosticos
      .map(
        (d) =>
          `<tr><td>${d.codigoCIE10}</td><td>${d.nombre}</td><td>${d.descripcion || "—"}</td><td>${d.tipoDiagnostico}</td><td>${d.esPrincipal ? "Sí" : "No"}</td></tr>`,
      )
      .join("");
    const procHtml = procedimientos.length
      ? procedimientos
          .map((p) => `<li>${p.nombre || "—"}: ${p.descripcion || "—"}</li>`)
          .join("")
      : "<li>No se realizaron procedimientos</li>";

    w.document.write(`
  <html>
  <head>
    <title>Hoja de Consulta Médica</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; max-width: 720px; }
      .header-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; border-bottom:3px solid #e65c00; padding-bottom:10px; }
      .logo-area { display:flex; align-items:center; gap:10px; }
      .logo-circle { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#e65c00,#003366); display:flex; align-items:center; justify-content:center; }
      .logo-text { font-size:22px; font-weight:900; color:#e65c00; letter-spacing:1px; }
      .srl { font-size:10px; color:#e65c00; font-weight:700; }
      .doc-title { font-size:16px; font-weight:900; color:#333; text-transform:uppercase; }
      .doc-sub { font-size:11px; color:#555; margin-top:2px; }
      .info-block { margin:10px 0 6px; font-size:11px; line-height:1.8; }
      .info-block span { font-weight:700; }
      .section-title { font-size:11px; font-weight:700; text-transform:uppercase;
        background:#f0f0f0; padding:4px 8px; border-left:3px solid #e65c00; margin:12px 0 6px; }
      .field-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 20px; margin-bottom:4px; }
      .field { font-size:11px; }
      .field label { font-weight:700; color:#555; display:block; font-size:10px; margin-bottom:1px; }
      .field p { border-bottom:1px solid #ddd; padding-bottom:3px; min-height:18px; }
      .field.full { grid-column: span 2; }
      table { width:100%; border-collapse:collapse; font-size:11px; margin-top:4px; }
      th { background:#003366; color:white; padding:5px 8px; text-align:left; font-size:10px; text-transform:uppercase; }
      td { padding:5px 8px; border-bottom:1px solid #eee; }
      tr:nth-child(even) td { background:#f9f9f9; }
      .firma-section { display:flex; justify-content:space-between; align-items:flex-end; margin-top:50px; }
      .firma-box { text-align:center; }
      .firma-line { border-top:1px solid #333; width:160px; margin:0 auto 4px; }
      .divider { border-top:2px solid #333; margin:16px 0; }
      @media print { button { display:none!important; } }
    </style>
  </head>
  <body>

    <div class="header-top">
      <div class="logo-area">
        <div class="logo-area">
          <img src="/clinica-farma/CLINICA300.png" style="height:60px;" />
        </div>
      </div>
      <div style="text-align:right;">
        <div class="doc-title">Historia Clínica</div>
        <div class="doc-sub">Hoja de Consulta Médica</div>
        <div style="font-size:10px;color:#555;margin-top:2px;">N° Cita: <strong>${cita.numeroCita}</strong></div>
      </div>
    </div>

    <div class="info-block">
      <div><span>Fecha:</span> ${cita.fechaCita} &nbsp;&nbsp; <span>Hora:</span> ${(cita.horaInicio || "").slice(0, 5)} &nbsp;&nbsp; <span>Médico:</span> ${medico}</div>
      <div><span>Paciente:</span> ${cita.nombrePaciente} &nbsp;&nbsp; <span>Especialidad:</span> ${cita.nombreEspecialidad} &nbsp;&nbsp; <span>Tipo:</span> ${cita.nombreTipoConsulta}</div>
      ${cita.motivoConsulta ? `<div><span>Motivo:</span> ${cita.motivoConsulta}</div>` : ""}
    </div>

    <div class="divider"></div>

    ${
      triaje
        ? `
        <div class="section-title">Signos Vitales</div>
        <table>
          <thead>
            <tr>
              <th>Signo</th>
              <th>Valor</th>
              <th>Unidad</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Presión Sistólica</td><td>${triaje.presionArterialSistolica || "—"}</td><td>mmHg</td></tr>
            <tr><td>Presión Diastólica</td><td>${triaje.presionArterialDiastolica || "—"}</td><td>mmHg</td></tr>
            <tr><td>Frec. Cardíaca</td><td>${triaje.frecuenciaCardiaca || "—"}</td><td>lpm</td></tr>
            <tr><td>Frec. Respiratoria</td><td>${triaje.frecuenciaRespiratoria || "—"}</td><td>rpm</td></tr>
            <tr><td>Temperatura</td><td>${triaje.temperatura || "—"}</td><td>°C</td></tr>
            <tr><td>Saturación O₂</td><td>${triaje.saturacionOxigeno || "—"}</td><td>%</td></tr>
            <tr><td>Peso</td><td>${triaje.peso || "—"}</td><td>kg</td></tr>
            <tr><td>Talla</td><td>${triaje.talla || "—"}</td><td>cm</td></tr>
            <tr><td>Perímetro Cefálico</td><td>${triaje.perimetroCefalico || "—"}</td><td>cm</td></tr>
            <tr><td>Perímetro Abdominal</td><td>${triaje.perimetroAbdominal || "—"}</td><td>cm</td></tr>
            <tr><td>Glicemia</td><td>${triaje.glicemia || "—"}</td><td>mg/dL</td></tr>
          </tbody>
        </table>
        `
        : ""
    }

    <div class="section-title">Datos Clínicos</div>
    <div class="field-grid">
      <div class="field"><label>Enfermedad Actual</label><p>${clinica.enfermedadActual || "—"}</p></div>
      <div class="field"><label>Diagnóstico Clínico</label><p>${clinica.diagnosticoClinico || "—"}</p></div>
      <div class="field"><label>Revisión de Sistemas</label><p>${clinica.revisionSistemas || "—"}</p></div>
      <div class="field"><label>Examen Físico</label><p>${clinica.examenFisico || "—"}</p></div>
      <div class="field full"><label>Plan de Tratamiento</label><p>${clinica.planTratamiento || "—"}</p></div>
      <div class="field full"><label>Observaciones</label><p>${clinica.observaciones || "—"}</p></div>
      ${clinica.proximaCita ? `<div class="field"><label>Próxima Cita</label><p>${clinica.proximaCita}</p></div>` : ""}
    </div>

    <div class="section-title">Diagnósticos CIE-10</div>
    <table>
      <thead>
        <tr><th>Código</th><th>Diagnóstico</th><th>Descripción</th><th>Tipo</th><th>Principal</th></tr>
      </thead>
      <tbody>${diagsHtml}</tbody>
    </table>

    ${
      procedimientos.length
        ? `
    <div class="section-title">Procedimientos</div>
    <ul style="padding-left:16px;font-size:11px;line-height:1.8;">${procHtml}</ul>`
        : ""
    }

    <div class="divider"></div>

    <div class="firma-section">
      <div class="firma-box">
        <div class="firma-line"></div>
        <p style="font-size:11px;font-weight:700;">${medico}</p>
        <p style="font-size:10px;color:#666;">Médico Responsable — Firma y Sello</p>
      </div>
      <div class="firma-box">
        <div class="firma-line"></div>
        <p style="font-size:11px;">Firma del Paciente</p>
      </div>
    </div>

    <br/>
    <button onclick="window.print()" style="width:100%;padding:10px;background:#003366;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;font-weight:bold;margin-top:8px;">
      🖨️ Imprimir Hoja de Consulta
    </button>
  </body>
  </html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const imprimirOrdenes = () => {
    const w = window.open("", "_blank", "width=500,height=700");
    const ordenesHtml = ordenes
      .map(
        (o, i) => `
      <div style="margin-bottom:16px;padding:10px;border:1px solid #ddd;border-radius:4px;">
        <p style="font-weight:bold;font-size:13px;">${i + 1}. ${o.nombreTipo}</p>
        <p style="margin-top:4px;">${o.descripcion}</p>
        ${o.indicaciones ? `<p style="color:#555;margin-top:4px;font-size:11px;">Indicaciones: ${o.indicaciones}</p>` : ""}
        ${o.observaciones ? `<p style="color:#555;font-size:11px;">Obs: ${o.observaciones}</p>` : ""}
      </div>`,
      )
      .join("");
    w.document.write(`
  <html>
  <head>
    <title>Órdenes Médicas</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; max-width: 620px; }
      .header-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; border-bottom:3px solid #e65c00; padding-bottom:10px; }
      .logo-area { display:flex; align-items:center; gap:10px; }
      .logo-circle { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#e65c00,#003366); display:flex; align-items:center; justify-content:center; }
      .logo-text { font-size:22px; font-weight:900; color:#e65c00; letter-spacing:1px; }
      .srl { font-size:10px; color:#e65c00; font-weight:700; }
      .doc-title { font-size:16px; font-weight:900; color:#333; text-transform:uppercase; }
      .doc-sub { font-size:11px; color:#555; margin-top:2px; }
      .info-block { margin:10px 0; font-size:11px; line-height:1.8; }
      .info-block span { font-weight:700; }
      .orden-box { margin-bottom:14px; padding:10px 12px; border:1px solid #ddd; border-radius:4px; border-left:3px solid #003366; }
      .orden-num { font-size:10px; font-weight:700; color:#003366; text-transform:uppercase; margin-bottom:4px; }
      .orden-tipo { font-size:13px; font-weight:700; color:#111; margin-bottom:4px; }
      .orden-desc { font-size:12px; color:#333; margin-bottom:4px; }
      .orden-meta { font-size:11px; color:#555; }
      .divider { border-top:2px solid #333; margin:16px 0; }
      .firma-section { display:flex; justify-content:space-between; align-items:flex-end; margin-top:50px; }
      .firma-box { text-align:center; }
      .firma-line { border-top:1px solid #333; width:150px; margin:0 auto 4px; }
      @media print { button { display:none!important; } }
    </style>
  </head>
  <body>

    <!-- CABECERA DINAMAX -->
    <div class="header-top">
      <div class="logo-area">        
        <img src="/clinica-farma/CLINICA300.png" style="height:40px;" />   
      </div>
      <div style="text-align:right;">
        <div class="doc-title">Órdenes Médicas</div>
        <div class="doc-sub">${ordenes.length} orden(es) emitida(s)</div>
      </div>
    </div>

    <!-- DATOS GENERALES -->
    <div class="info-block">
      <div><span>Paciente:</span> ${cita.nombrePaciente}</div>
      <div><span>Fecha:</span> ${cita.fechaCita} &nbsp;&nbsp; <span>Médico:</span> ${medico}</div>
      <div><span>Especialidad:</span> ${cita.nombreEspecialidad || "—"}</div>
    </div>

    <div class="divider"></div>

    <!-- LISTA DE ÓRDENES -->
    ${ordenes
      .map(
        (o, i) => `
      <div class="orden-box">
        <div class="orden-num">Orden ${i + 1}</div>
        <div class="orden-tipo">${o.nombreTipo || "—"}</div>
        <div class="orden-desc">${o.descripcion}</div>
        ${o.indicaciones ? `<div class="orden-meta">📋 Indicaciones: ${o.indicaciones}</div>` : ""}
        ${o.observaciones ? `<div class="orden-meta">📝 Obs: ${o.observaciones}</div>` : ""}
      </div>`,
      )
      .join("")}

    <div class="divider"></div>

    <!-- FIRMA -->
    <div class="firma-section">
      <div class="firma-box">
        <div class="firma-line"></div>
        <p style="font-size:11px;font-weight:700;">${medico}</p>
        <p style="font-size:10px;color:#666;">Firma y Sello del Médico</p>
      </div>
      <div class="firma-box">
        <div class="firma-line"></div>
        <p style="font-size:11px;">Firma del Paciente</p>
      </div>
    </div>

    <br/>
    <button onclick="window.print()" style="width:100%;padding:10px;background:#003366;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;font-weight:bold;margin-top:8px;">
      🖨️ Imprimir Órdenes Médicas
    </button>
  </body>
  </html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  /*const imprimirReceta = () => {
    const w = window.open('', '_blank', 'width=420,height=700');
    const rxHtml = prescripciones.map((rx, i) => `
      <div style="margin-bottom:14px;padding-bottom:10px;border-bottom:1px dashed #ccc;">
        <p style="font-weight:bold;font-size:13px;">${i + 1}. ${rx.nombreMedicamento}</p>
        <p style="margin-top:4px;">Dosis: ${rx.dosis}</p>
        <p>Frecuencia: ${rx.frecuencia}</p>
        <p>Vía: ${rx.viaAdministracion}</p>
        <p>Duración: ${rx.duracion}</p>
        <p>Cantidad: ${rx.cantidad}</p>
        ${rx.indicaciones ? `<p style="color:#555;margin-top:4px;font-size:11px;">Indicaciones: ${rx.indicaciones}</p>` : ''}
      </div>`).join('');
    w.document.write(`
      <html><head><title>Receta Médica</title><style>
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; max-width: 380px; }
        .header { text-align: center; border-bottom: 2px solid #000; margin-bottom: 14px; padding-bottom: 8px; }
        .firma { margin-top: 60px; text-align: center; }
        .firma-line { border-top: 1px solid #000; width: 180px; margin: 0 auto 4px; }
        @media print { button { display: none; } }
      </style></head><body>
      <div class="header">
        <h2 style="font-size:14px;text-transform:uppercase;">CENTRO MÉDICO DINAMAX</h2>
        <p style="font-size:12px;font-weight:bold;margin-top:3px;">RECETA MÉDICA</p>
        <p style="font-size:11px;">Paciente: ${cita.nombrePaciente}</p>
        <p style="font-size:11px;">Fecha: ${cita.fechaCita} | Médico: ${medico}</p>
      </div>
      <p style="font-weight:bold;margin-bottom:10px;">Rp/</p>
      ${rxHtml}
      <div class="firma">
        <div class="firma-line"></div>
        <p style="font-weight:bold;font-size:11px;">${medico}</p>
        <p style="font-size:10px;color:#666;">Firma y Sello del Médico</p>
      </div>
      <br/><button onclick="window.print()" style="width:100%;padding:8px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:bold;">
        🖨️ Imprimir Receta
      </button></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };*/

  // CON:
  const imprimirReceta = () => {
    const w = window.open("", "_blank", "width=680,height=900");

    // Construir payload QR — formato que SIFARMA leerá con la pistola
    const qrPayload = JSON.stringify({
      tipo: "RECETA_DINAMAX",
      version: "1.0",
      fecha: cita.fechaCita,
      paciente: cita.nombrePaciente,
      medico: medico,
      medicamentos: prescripciones.map((rx) => ({
        codigo: rx.codigoProducto || "",
        nombre: rx.nombreMedicamento,
        cantidad: rx.cantidad,
        dosis: rx.dosis,
        frecuencia: rx.frecuencia,
        duracion: rx.duracion,
        via: rx.viaAdministracion,
      })),
    });

    // Tabla de medicamentos
    const filasTabla = prescripciones
      .map(
        (rx) => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #ccc;font-size:11px;">${rx.codigoProducto || "—"}</td>
        <td style="padding:6px 8px;border:1px solid #ccc;font-size:11px;font-weight:600;">${rx.nombreMedicamento}</td>
        <td style="padding:6px 8px;border:1px solid #ccc;font-size:11px;text-align:center;">${rx.cantidad}</td>
      </tr>`,
      )
      .join("");

    // Sección Rp. por medicamento
    const rpHtml = prescripciones
      .map(
        (rx) => `
      <p style="margin:4px 0;font-size:11px;">
        <strong>Rp. ${rx.codigoProducto || ""}</strong> ${rx.nombreMedicamento}
      </p>`,
      )
      .join("");

    // Modo de uso por medicamento
    const modoUsoHtml = prescripciones
      .map(
        (rx) => `
      <p style="margin:3px 0;font-size:11px;">
        ${rx.codigoProducto || "—"} - ${rx.nombreMedicamento} - ${rx.dosis}${rx.frecuencia ? " - " + rx.frecuencia : ""}${rx.duracion ? " POR " + rx.duracion.toUpperCase() : ""}
      </p>`,
      )
      .join("");

    w.document.write(`
      <html>
      <head>
        <title>Receta Médica</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; max-width: 620px; }
          .header-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; border-bottom:3px solid #e65c00; padding-bottom:10px; }
          .logo-area { display:flex; align-items:center; gap:10px; }
          .logo-circle { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#e65c00,#003366); display:flex; align-items:center; justify-content:center; }
          .logo-text { font-size:22px; font-weight:900; color:#e65c00; letter-spacing:1px; }
          .logo-sub { font-size:9px; color:#003366; font-weight:700; text-transform:uppercase; }
          .srl { font-size:10px; color:#e65c00; font-weight:700; }
          .receta-title { font-size:18px; font-weight:900; color:#333; }
          .receta-num { color:#e65c00; font-size:22px; font-weight:900; }
          .folio { font-size:11px; color:#555; }
          .folio-line { display:inline-block; width:100px; border-bottom:1px solid #333; margin-left:6px; }
          .info-block { margin:10px 0; font-size:11px; line-height:1.8; }
          .info-block span { font-weight:700; }
          table { width:100%; border-collapse:collapse; margin:12px 0; }
          th { background:#333; color:white; padding:6px 8px; font-size:11px; text-align:left; text-transform:uppercase; }
          .rp-section { margin:10px 0; }
          .firma-section { display:flex; justify-content:space-between; align-items:flex-end; margin-top:30px; }
          .qr-box { text-align:center; }
          .firma-box { text-align:center; }
          .firma-line { border-top:1px solid #333; width:140px; margin:0 auto 4px; }
          .sello-line { border-top:1px solid #333; width:140px; margin:0 auto 4px; }
          .divider { border-top:2px solid #333; margin:14px 0; }
          .footer-section { margin-top:10px; font-size:11px; line-height:1.8; }
          .modo-uso-title { font-weight:900; color:#e65c00; font-size:12px; text-decoration:underline; margin:8px 0 4px; }
          @media print { button { display:none!important; } }
        </style>
      </head>
      <body>

        <!-- HEADER -->
        <div class="header-top">
          <div class="logo-area">
            <div class="logo-area">
              <img src="/clinica-farma/CLINICA300.png" style="height:60px;" />
            </div>
          </div>
          <div style="text-align:right;">
            <div class="receta-title">RECETA MÉDICA <span class="receta-num">N° ${cita.cita_ID || "—"}</span></div>
            <div class="folio">Folio N° <span class="folio-line"></span></div>
          </div>
        </div>

        <!-- DATOS CABECERA -->
        <div class="info-block">
          <div><span>Fecha:</span> ${cita.fechaCita}</div>
          <div><span>Paciente:</span> ${cita.nombrePaciente}</div>
          <div><span>Establecimiento:</span> CENTRO MÉDICO DINAMAX</div>
          <div><span>Especialidad:</span> ${cita.nombreEspecialidad || "—"}</div>
          <div><span>Médico:</span> ${medico}</div>
        </div>

        <!-- TABLA MEDICAMENTOS -->
        <table>
          <thead>
            <tr>
              <th style="width:25%;">CÓDIGO VADEMECUM</th>
              <th style="width:55%;">MEDICAMENTO</th>
              <th style="width:20%;text-align:center;">CANTIDAD</th>
            </tr>
          </thead>
          <tbody>
            ${filasTabla}
          </tbody>
        </table>

        <!-- Rp. -->
        <div class="rp-section">
          ${rpHtml}
        </div>

        <!-- FIRMA + QR + SELLO -->
        <div class="firma-section">
          <div class="qr-box">
            <div id="qrcode"></div>
            <p style="font-size:9px;color:#666;margin-top:4px;">Escanear en farmacia</p>
          </div>
          <div class="firma-box">
            <div class="firma-line"></div>
            <p style="font-size:11px;font-weight:700;">Firma Médico</p>
          </div>
          <div class="firma-box">
            <div class="sello-line"></div>
            <p style="font-size:11px;">Sello</p>
          </div>
        </div>

        <div class="divider"></div>

        <!-- FOOTER PACIENTE -->
        <div class="footer-section">
          <div><span style="font-weight:700;text-decoration:underline;">PACIENTE:</span> ${cita.nombrePaciente}</div>
          <div style="display:flex;gap:30px;">
            <div><span style="font-weight:700;">FECHA:</span> ${cita.fechaCita}</div>
          </div>
          <div class="modo-uso-title">MODO DE USO</div>
          ${modoUsoHtml}
        </div>

        <br/>
        <button onclick="window.print()" style="width:100%;padding:10px;background:#003366;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;font-weight:bold;margin-top:8px;">
          🖨️ Imprimir Receta
        </button>

        <script>
          // Generar QR con los datos estructurados para SIFARMA
          var qrData = ${JSON.stringify(qrPayload)};
          new QRCode(document.getElementById('qrcode'), {
            text: qrData,
            width: 100,
            height: 100,
            correctLevel: QRCode.CorrectLevel.M
          });
        </script>
      </body>
      </html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 2 }}>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
        }}
      >
        <Box
          sx={{ p: 4, textAlign: "center", borderBottom: "1px solid #e5e7eb" }}
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
            Consulta Finalizada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {cita.nombrePaciente} · {cita.numeroCita}
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Resumen */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              mb: 3,
            }}
          >
            {[
              { label: "Diagnósticos", value: `${diagnosticos.length}` },
              { label: "Procedimientos", value: `${procedimientos.length}` },
              { label: "Órdenes médicas", value: `${ordenes.length}` },
              { label: "Prescripciones", value: `${prescripciones.length}` },
            ].map(({ label, value }) => (
              <Box
                key={label}
                sx={{
                  p: 1.5,
                  bgcolor: "#f9fafb",
                  borderRadius: 1.5,
                  border: "1px solid #e5e7eb",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" fontWeight={800} color="#111827">
                  {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Botones impresión */}
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 2 }}
          >
            <Button
              fullWidth
              variant="contained"
              startIcon={<Print />}
              onClick={imprimirConsulta}
              sx={{
                bgcolor: "#374151",
                "&:hover": { bgcolor: "#1f2937" },
                borderRadius: 1.5,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              Imprimir Hoja de Consulta (Historia Clínica)
            </Button>
            {ordenes.length > 0 && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Assignment />}
                onClick={imprimirOrdenes}
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  borderColor: "#2563eb",
                  color: "#2563eb",
                }}
              >
                Imprimir Órdenes Médicas ({ordenes.length})
              </Button>
            )}
            {prescripciones.length > 0 && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Medication />}
                onClick={imprimirReceta}
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  borderColor: "#7c3aed",
                  color: "#7c3aed",
                }}
              >
                Imprimir Receta Médica ({prescripciones.length} medicamento(s))
              </Button>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<Add />}
            onClick={onNueva}
            sx={{
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8" },
              borderRadius: 1.5,
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            Nueva Consulta
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
export default function ConsultaMedicaPage() {
  // fase: 'buscar' | 'consulta' | 'exito'
  const [fase, setFase] = useState("buscar");
  const [citaActual, setCitaActual] = useState(null);
  const [consultaMedica, setConsultaMedica] = useState(null);
  const [datosFinales, setDatosFinales] = useState(null);

  const handleSeleccionar = ({ cita, consultaMedica: cm }) => {
    setCitaActual(cita);
    setConsultaMedica(cm);
    setFase("consulta");
  };

  const handleFinalizar = (datos) => {
    setDatosFinales(datos);
    setFase("exito");
  };

  const handleNueva = () => {
    setCitaActual(null);
    setConsultaMedica(null);
    setDatosFinales(null);
    setFase("buscar");
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#111827">
          Consulta Médica
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {fase === "buscar" && "Seleccione un paciente listo para consulta"}
          {fase === "consulta" && `Atendiendo: ${citaActual?.nombrePaciente}`}
          {fase === "exito" && "Consulta finalizada correctamente"}
        </Typography>
      </Box>

      {fase === "buscar" && <BuscadorCitas onSeleccionar={handleSeleccionar} />}
      {fase === "consulta" && citaActual && (
        <FormularioConsulta
          cita={citaActual}
          consultaMedica={consultaMedica}
          onFinalizar={handleFinalizar}
        />
      )}
      {fase === "exito" && datosFinales && (
        <PantallaExito datos={datosFinales} onNueva={handleNueva} />
      )}
    </Box>
  );
}
