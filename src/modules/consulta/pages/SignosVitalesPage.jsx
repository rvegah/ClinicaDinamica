import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Search, Save, MonitorHeart, FilterList } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import agendamientoService from "../../../services/api/agendamientoService";
import atencionMedicaService from "../../../services/api/atencionMedicaService";

const getUsuario = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    return {
      id: user.usuario_ID || 1,
      personalMedicoId: user.personalMedico_ID || null,
      codigo: user.codigoEmpleado || user.usuario || "SYSTEMAS",
    };
  } catch {
    return { id: 1, personalMedicoId: null, codigo: "SYSTEMAS" };
  }
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "—";
  try {
    return new Date(fechaStr).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return fechaStr;
  }
};

const ESTADO_COLORES = {
  Confirmada: { bg: "#dcfce7", color: "#15803d" },
  "Pre-Reserva": { bg: "#fef3c7", color: "#92400e" },
  Reservada: { bg: "#dbeafe", color: "#1d4ed8" },
  "En Sala de Espera": { bg: "#fce7f3", color: "#be185d" },
  "Listo para Consulta": { bg: "#ecfdf5", color: "#047857" }, // ← AGREGAR
};

const signoVacio = () => ({
  presionSistolica: "",
  presionDiastolica: "",
  frecuenciaCardiaca: "",
  frecuenciaRespiratoria: "",
  temperatura: "",
  saturacionOxigeno: "",
  peso: "",
  talla: "",
  perimetroCefalico: "",
  perimetroAbdominal: "",
  glicemia: "",
  observaciones: "",
});

export default function SignosVitalesPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [filtroMedico, setFiltroMedico] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [filtroFecha, setFiltroFecha] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [citas, setCitas] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [signos, setSignos] = useState(signoVacio());
  const [guardando, setGuardando] = useState(false);

  const [filtroFechaInicio, setFiltroFechaInicio] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [filtroFechaFin, setFiltroFechaFin] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    Promise.all([
      agendamientoService.listarMedicos().catch(() => ({ datos: [] })),
      agendamientoService.listarEspecialidades().catch(() => ({ datos: [] })),
    ]).then(([meds, esps]) => {
      setMedicos(meds.datos || []);
      setEspecialidades(esps.datos || []);
    });
  }, []);

  const handleBuscar = async () => {
    setBuscando(true);
    setBuscado(false);
    setCitaSeleccionada(null);
    try {
      const res = await atencionMedicaService.buscarCitasParaTriaje({
        codigoMedico: filtroMedico || undefined,
        codigoEspecialidad: filtroEspecialidad || undefined,
        fechaInicio: filtroFechaInicio
          ? `${filtroFechaInicio}T00:00:00`
          : undefined,
        fechaFin: filtroFechaFin ? `${filtroFechaFin}T23:59:59` : undefined,
      });
      const todas = res.exitoso ? res.datos || [] : [];
      setCitas(todas);
      setBuscado(true);
      if (todas.length === 0) {
        enqueueSnackbar("No hay citas disponibles para triaje", {
          variant: "info",
        });
      }
    } catch {
      setCitas([]);
      setBuscado(true);
    } finally {
      setBuscando(false);
    }
  };

  const handleSeleccionarCita = (cita) => {
    setCitaSeleccionada(cita);
    setSignos(signoVacio());
  };

  const handleChange = (campo, valor) => {
    setSignos((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleGuardar = async () => {
    if (!citaSeleccionada) return;
    const usuario = getUsuario();
    setGuardando(true);
    try {
      console.log('usuario triaje:', getUsuario());
      console.log('user sessionStorage:', JSON.parse(sessionStorage.getItem("user") || "{}"));
      const payload = {
        cita_ID: citaSeleccionada.cita_ID,
        paciente_ID:
          citaSeleccionada.paciente_ID || citaSeleccionada.codigoPaciente,
        enfermera_ID: usuario.personalMedicoId,
        presionSistolica: Number(signos.presionSistolica) || 0,
        presionDiastolica: Number(signos.presionDiastolica) || 0,
        frecuenciaCardiaca: Number(signos.frecuenciaCardiaca) || 0,
        frecuenciaRespiratoria: Number(signos.frecuenciaRespiratoria) || 0,
        temperatura: Number(signos.temperatura) || 0,
        saturacionOxigeno: Number(signos.saturacionOxigeno) || 0,
        peso: Number(signos.peso) || 0,
        talla: Number(signos.talla) || 0,
        perimetroCefalico: Number(signos.perimetroCefalico) || 0,
        perimetroAbdominal: Number(signos.perimetroAbdominal) || 0,
        glicemia: Number(signos.glicemia) || 0,
        observaciones: signos.observaciones || "",
        usuarioRegistroAlta: usuario.id,
      };

      const res = await atencionMedicaService.guardarTriaje(payload);
      if (res.exitoso) {
        enqueueSnackbar("✅ Triaje registrado correctamente", {
          variant: "success",
        });
        setCitaSeleccionada(null);
        setSignos(signoVacio());
        handleBuscar();
      } else {
        enqueueSnackbar(res.mensaje || "Error al guardar triaje", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error al guardar triaje", {
        variant: "error",
      });
    } finally {
      setGuardando(false);
    }
  };

  const card = {
    borderRadius: 2,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    bgcolor: "white",
  };

  const campoNumerico = (label, campo, unidad) => (
    <Box>
      <TextField
        fullWidth
        size="small"
        label={label}
        type="number"
        value={signos[campo]}
        onChange={(e) => handleChange(campo, e.target.value)}
        InputProps={{
          endAdornment: unidad ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                ml: 0.5,
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              {unidad}
            </Typography>
          ) : null,
        }}
        inputProps={{ min: 0, step: "any" }}
      />
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#111827">
          Signos Vitales — Triaje
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registro de signos vitales por enfermería antes de la consulta médica
        </Typography>
      </Box>

      {/* FILTROS */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            color="#111827"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <FilterList sx={{ fontSize: 16, color: "#6b7280" }} />
            Buscar Citas Confirmadas
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr 1fr" },
              gap: 1.5,
              mb: 2,
            }}
          >
            <TextField
              select
              size="small"
              label="Médico"
              value={filtroMedico}
              onChange={(e) => setFiltroMedico(e.target.value)}
            >
              <MenuItem value="">— Todos —</MenuItem>
              {medicos.map((m) => (
                <MenuItem key={m.medico_ID} value={m.medico_ID}>
                  {m.nombreMedico || m.codigo}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Especialidad"
              value={filtroEspecialidad}
              onChange={(e) => setFiltroEspecialidad(e.target.value)}
            >
              <MenuItem value="">— Todas —</MenuItem>
              {especialidades.map((e) => (
                <MenuItem key={e.especialidad_ID} value={e.especialidad_ID}>
                  {e.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Fecha Inicio"
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Fecha Fin"
              type="date"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
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
            {buscando ? "Buscando..." : "Buscar Citas"}
          </Button>
        </CardContent>
      </Card>

      {/* LISTA DE CITAS */}
      {buscado && citas.length > 0 && !citaSeleccionada && (
        <Card sx={{ ...card, mb: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 1fr",
                bgcolor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                px: 2,
                py: 1.25,
              }}
            >
              {["Paciente", "Médico", "Especialidad", "Hora", "Estado"].map(
                (h) => (
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
                ),
              )}
            </Box>
            {citas.map((cita, idx) => {
              const col = ESTADO_COLORES[cita.estadoCita] || {
                bg: "#f3f4f6",
                color: "#374151",
              };
              return (
                <Box
                  key={cita.cita_ID || idx}
                  onClick={() => handleSeleccionarCita(cita)}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 1fr",
                    px: 2,
                    py: 1.5,
                    alignItems: "center",
                    cursor: "pointer",
                    borderBottom:
                      idx < citas.length - 1 ? "1px solid #f3f4f6" : "none",
                    "&:hover": { bgcolor: "#eff6ff" },
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#111827"
                    >
                      {(cita.nombrePaciente || "").trim() || "—"}
                    </Typography>
                    {cita.numeroDocumento && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {cita.numeroDocumento}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" color="#374151" fontSize={13}>
                    {cita.nombreMedico || "—"}
                  </Typography>
                  <Typography variant="body2" color="#374151" fontSize={13}>
                    {cita.nombreEspecialidad || "—"}
                  </Typography>
                  <Typography variant="body2" color="#374151" fontSize={13}>
                    {cita.horaInicio || "—"}
                  </Typography>
                  <Chip
                    label={cita.estadoCita || "—"}
                    size="small"
                    sx={{
                      bgcolor: col.bg,
                      color: col.color,
                      fontWeight: 700,
                      fontSize: 11,
                      height: 20,
                    }}
                  />
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
            mb: 2,
          }}
        >
          No hay citas confirmadas disponibles para triaje en la fecha
          seleccionada.
        </Alert>
      )}

      {/* FORMULARIO TRIAJE */}
      {citaSeleccionada && (
        <>
          {/* Info paciente */}
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
                    <MonitorHeart
                      sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                    />
                    Registrando triaje para:
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#111827">
                    {(citaSeleccionada.nombrePaciente || "").trim()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {citaSeleccionada.nombreMedico} ·{" "}
                    {citaSeleccionada.nombreEspecialidad} ·{" "}
                    {formatearFecha(citaSeleccionada.fechaCita)}{" "}
                    {citaSeleccionada.horaInicio}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => setCitaSeleccionada(null)}
                  sx={{ color: "#6b7280", textTransform: "none", fontSize: 12 }}
                >
                  Cambiar cita
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Signos vitales */}
          <Card sx={{ ...card, mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="body2"
                fontWeight={700}
                color="#111827"
                sx={{ mb: 2 }}
              >
                Signos Vitales
              </Typography>
              {/* REEMPLAZAR el bloque Grid container completo: */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    sm: "1fr 1fr 1fr",
                    md: "1fr 1fr 1fr 1fr",
                  },
                  gap: 2,
                  mb: 2,
                }}
              >
                {campoNumerico("Presión Sistólica", "presionSistolica", "mmHg")}
                {campoNumerico(
                  "Presión Diastólica",
                  "presionDiastolica",
                  "mmHg",
                )}
                {campoNumerico("Frec. Cardíaca", "frecuenciaCardiaca", "lpm")}
                {campoNumerico(
                  "Frec. Respiratoria",
                  "frecuenciaRespiratoria",
                  "rpm",
                )}
                {campoNumerico("Temperatura", "temperatura", "°C")}
                {campoNumerico("Saturación O₂", "saturacionOxigeno", "%")}
                {campoNumerico("Peso", "peso", "kg")}
                {campoNumerico("Talla", "talla", "cm")}
                {campoNumerico("Perímetro Cefálico", "perimetroCefalico", "cm")}
                {campoNumerico(
                  "Perímetro Abdominal",
                  "perimetroAbdominal",
                  "cm",
                )}
                {campoNumerico("Glicemia", "glicemia", "mg/dL")}
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Observaciones de Enfermería"
                value={signos.observaciones}
                onChange={(e) => handleChange("observaciones", e.target.value)}
                multiline
                rows={3}
                placeholder="Observaciones adicionales de enfermería..."
              />
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setCitaSeleccionada(null)}
              disabled={guardando}
              sx={{
                borderRadius: 1.5,
                fontWeight: 600,
                textTransform: "none",
                borderColor: "#d1d5db",
                color: "#374151",
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
                  <Save />
                )
              }
              onClick={handleGuardar}
              disabled={guardando}
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
              {guardando ? "Guardando..." : "Guardar Triaje"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
