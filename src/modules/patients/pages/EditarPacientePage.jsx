// src/modules/patients/pages/EditarPacientePage.jsx
// Formulario de actualización de paciente existente
// Recibe el paciente por state de react-router (desde PacientesPage)

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import { ArrowBack, Save, MedicalInformation, Print  } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import pacienteService, {
  TIPOS_DOCUMENTO,
  GENEROS,
} from "../../../services/api/pacienteService";
import { fechaHoy } from "../../../utils/fecha";

export default function EditarPacientePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  // El paciente viene por state desde PacientesPage al hacer click en Editar
  const pacienteOriginal = location.state?.paciente || null;

  const [form, setForm] = useState({
    paciente_ID: "",
    tipoDocumentoIdentidad: 1,
    numeroDocumento: "",
    nombrePaciente: "",
    apellidosPaciente: "",
    fechaNacimiento: "",
    genero: "",
    telefono: "",
    telefonoCelular: "",
    correoElectronico: "",
    pais: "",
    nacionalidad: "",
    departamento: "",
    ciudad: "",
    direccionCompleta: "",
  });
  const [guardando, setGuardando] = useState(false);

  // Prellenar formulario con datos del paciente
  useEffect(() => {
    if (!pacienteOriginal) {
      enqueueSnackbar("No se encontraron datos del paciente", {
        variant: "warning",
      });
      navigate("/pacientes/buscar");
      return;
    }

    // Parsear nombre completo → nombrePaciente + apellidosPaciente
    // El API devuelve nombreCompletoPaciente como campo unificado
    const nombreCompleto = pacienteOriginal.nombreCompletoPaciente || "";
    const partes = nombreCompleto.trim().split(" ");
    // Heurística: primer token = nombre, resto = apellidos
    // Si es SN o NN, queda como está
    const esSinDatos = nombreCompleto === "SN" || nombreCompleto === "NN";

    // Formatear fecha para input type="date" (YYYY-MM-DD)
    const formatFechaInput = (fechaStr) => {
      if (!fechaStr) return "";
      try {
        const fecha = new Date(fechaStr);
        if (fecha.getFullYear() === 1850) return "";
        return fecha.toISOString().split("T")[0];
      } catch {
        return "";
      }
    };

    setForm({
      paciente_ID: pacienteOriginal.paciente_ID || "",
      tipoDocumentoIdentidad:
        Number(pacienteOriginal.tipoDocumentoIdentidad) || 1,
      numeroDocumento: pacienteOriginal.numeroDocumento || "",
      nombrePaciente: esSinDatos ? "" : partes[0] || "",
      apellidosPaciente: esSinDatos ? "" : partes.slice(1).join(" "),
      fechaNacimiento: formatFechaInput(pacienteOriginal.fechaNacimiento),
      genero: (pacienteOriginal.genero || "").trim() || "M",
      telefono: pacienteOriginal.telefono || "",
      telefonoCelular: pacienteOriginal.telefonoCelular || "",
      correoElectronico: pacienteOriginal.correoElectronico || "",
      pais: pacienteOriginal.pais || "BOLIVIA",
      nacionalidad: pacienteOriginal.nacionalidad || "",
      departamento: pacienteOriginal.departamento || "",
      ciudad: pacienteOriginal.ciudad || "",
      direccionCompleta: pacienteOriginal.direccionCompleta || "",
    });
  }, [pacienteOriginal]);

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const validar = () => {
    if (!form.numeroDocumento.trim())
      return "El número de documento es obligatorio";
    if (!form.nombrePaciente.trim())
      return "El nombre del paciente es obligatorio";
    if (!form.fechaNacimiento) return "La fecha de nacimiento es obligatoria";
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaNac = new Date(form.fechaNacimiento + "T00:00:00");
    if (fechaNac >= hoy)
      return "La fecha de nacimiento no puede ser hoy ni una fecha futura";
    return null;
  };

  const handleGuardar = async () => {
    const error = validar();
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      return;
    }

    const userJson = sessionStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : {};
    const codigoEmpleado = user.codigoEmpleado || user.usuario || "SYSTEMAS";
    const usuarioId = user.usuario_ID || 1;

    setGuardando(true);
    try {
      const payload = {
        paciente_ID: form.paciente_ID,
        numeroHistoriaClinica: pacienteOriginal?.numeroHistoriaClinica || "",
        tipoDocumentoIdentidad: form.tipoDocumentoIdentidad || 0,
        numeroDocumento: form.numeroDocumento,
        nombrePaciente: form.nombrePaciente.toUpperCase(),
        apellidosPaciente: form.apellidosPaciente.toUpperCase() || "",
        fechaNacimiento: form.fechaNacimiento
          ? new Date(form.fechaNacimiento).toISOString()
          : "1850-01-01T00:00:00.000Z",
        genero: form.genero || "",
        telefono: form.telefono || "",
        telefonoCelular: form.telefonoCelular || "",
        correoElectronico: form.correoElectronico || "",
        pais: form.pais.toUpperCase() || "",
        nacionalidad: form.nacionalidad || "",
        departamento: form.departamento.toUpperCase() || "",
        ciudad: form.ciudad.toUpperCase() || "",
        direccionCompleta: form.direccionCompleta.toUpperCase() || "",
        codigoEmpleadoAlta: codigoEmpleado,
        usuarioRegistroAlta: usuarioId,
      };

      const res = await pacienteService.actualizarPaciente(payload);

      if (res.exitoso) {
        enqueueSnackbar("✅ Paciente actualizado correctamente", {
          variant: "success",
          autoHideDuration: 4000,
        });
        navigate("/pacientes/buscar");
      } else {
        enqueueSnackbar(res.mensaje || "Error al actualizar paciente", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error al actualizar paciente", {
        variant: "error",
      });
    } finally {
      setGuardando(false);
    }
  };

  // ─── ESTILOS ─────────────────────────────────────────────────────────────
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
    mb: 2,
  };

  const imprimirHistorialClinico = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    const ahora = new Date().toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    w.document.write(`
    <html>
    <head>
      <title>Historia Clínica</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; max-width: 720px; }
        .header-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; border-bottom:3px solid #e65c00; padding-bottom:10px; }
        .doc-title { font-size:16px; font-weight:900; color:#333; text-transform:uppercase; }
        .doc-sub { font-size:11px; color:#555; margin-top:2px; }
        .info-block { margin:10px 0 6px; font-size:11px; line-height:1.9; }
        .info-block span { font-weight:700; }
        .section-title { font-size:11px; font-weight:700; text-transform:uppercase; background:#f0f0f0; padding:4px 8px; border-left:3px solid #e65c00; margin:14px 0 8px; }
        .field-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 20px; margin-bottom:6px; }
        .field { font-size:11px; }
        .field label { font-weight:700; color:#555; display:block; font-size:10px; margin-bottom:2px; }
        .field p { border-bottom:1px solid #ddd; padding-bottom:3px; min-height:18px; }
        .field.full { grid-column: span 2; }
        .divider { border-top:2px solid #333; margin:16px 0; }
        @page { margin: 10mm; }
        @media print { button { display:none!important; } }
      </style>
    </head>
    <body>

      <!-- HEADER -->
      <div class="header-top">
        <div>
          <img src="/clinica-farma/CLINICA300.png" style="height:60px;" />
        </div>
        <div style="text-align:right;">
          <div class="doc-title">Historia Clínica</div>
          <div class="doc-sub">Registro Inicial del Paciente</div>
          <div style="font-size:10px;color:#555;margin-top:2px;">HC: <strong>${pacienteOriginal?.numeroHistoriaClinica || "—"}</strong></div>
        </div>
      </div>

      <!-- FECHA / HC -->
      <div class="info-block">
        <div><span>Fecha de Registro:</span> ${ahora}</div>
        <div><span>N° Historia Clínica:</span> ${pacienteOriginal?.numeroHistoriaClinica || "—"}</div>
      </div>

      <div class="divider"></div>

      <!-- IDENTIFICACIÓN -->
      <div class="section-title">Identificación del Paciente</div>
      <div class="field-grid">
        <div class="field">
          <label>Nombres</label>
          <p>${form.nombrePaciente || "—"}</p>
        </div>
        <div class="field">
          <label>Apellidos</label>
          <p>${form.apellidosPaciente || "—"}</p>
        </div>
        <div class="field">
          <label>Tipo de Documento</label>
          <p>${TIPOS_DOCUMENTO.find((t) => t.id === form.tipoDocumentoIdentidad)?.descripcion || "—"}</p>
        </div>
        <div class="field">
          <label>Número de Documento</label>
          <p>${form.numeroDocumento || "—"}</p>
        </div>
        <div class="field">
          <label>Fecha de Nacimiento</label>
          <p>${form.fechaNacimiento || "—"}</p>
        </div>
        <div class="field">
          <label>Género</label>
          <p>${form.genero === "M" ? "Masculino" : form.genero === "F" ? "Femenino" : "—"}</p>
        </div>
        <div class="field">
          <label>Teléfono Fijo</label>
          <p>${form.telefono || "—"}</p>
        </div>
        <div class="field">
          <label>Celular</label>
          <p>${form.telefonoCelular || "—"}</p>
        </div>
        <div class="field full">
          <label>Correo Electrónico</label>
          <p>${form.correoElectronico || "—"}</p>
        </div>
        <div class="field">
          <label>País</label>
          <p>${form.pais || "—"}</p>
        </div>
        <div class="field">
          <label>Nacionalidad</label>
          <p>${form.nacionalidad || "—"}</p>
        </div>
        <div class="field">
          <label>Departamento</label>
          <p>${form.departamento || "—"}</p>
        </div>
        <div class="field">
          <label>Ciudad</label>
          <p>${form.ciudad || "—"}</p>
        </div>
        <div class="field full">
          <label>Dirección Completa</label>
          <p>${form.direccionCompleta || "—"}</p>
        </div>
      </div>

      <br/>
      <button onclick="window.print()" style="width:100%;padding:10px;background:#003366;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;font-weight:bold;margin-top:8px;">
        🖨️ Imprimir Historia Clínica
      </button>
    </body>
    </html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      {/* HEADER */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/pacientes/buscar")}
          sx={{
            color: "#6b7280",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          Volver
        </Button>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" fontWeight={700} color="#111827">
              Editar Paciente
            </Typography>
            {pacienteOriginal?.numeroHistoriaClinica && (
              <Chip
                label={`HC: ${pacienteOriginal.numeroHistoriaClinica}`}
                size="small"
                icon={
                  <MedicalInformation sx={{ fontSize: "14px !important" }} />
                }
                sx={{
                  bgcolor: "#eff6ff",
                  color: "#2563eb",
                  fontWeight: 700,
                  fontSize: 11,
                  border: "1px solid #bfdbfe",
                }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Actualizar datos del paciente
          </Typography>
        </Box>
      </Box>

      {/* INFO PACIENTE ORIGINAL */}
      {pacienteOriginal && (
        <Alert
          severity="info"
          sx={{
            mb: 2,
            borderRadius: 1.5,
            border: "1px solid #bfdbfe",
            bgcolor: "#eff6ff",
          }}
        >
          <Typography variant="caption">
            <strong>Paciente:</strong> {pacienteOriginal.nombreCompletoPaciente}{" "}
            — <strong>Doc:</strong> {pacienteOriginal.numeroDocumento}
          </Typography>
        </Alert>
      )}

      {/* IDENTIFICACIÓN */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={cardPadding}>
          <Typography sx={sectionLabel}>Identificación</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Tipo de Documento"
                value={form.tipoDocumentoIdentidad}
                onChange={(e) =>
                  handleChange("tipoDocumentoIdentidad", Number(e.target.value))
                }
              >
                <MenuItem value="">— Sin especificar —</MenuItem>
                {TIPOS_DOCUMENTO.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.descripcion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                size="small"
                label="Número de Documento *"
                value={form.numeroDocumento}
                onChange={(e) =>
                  handleChange("numeroDocumento", e.target.value)
                }
                required
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* DATOS PERSONALES */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={cardPadding}>
          <Typography sx={sectionLabel}>Datos Personales</Typography>
          <Grid container spacing={2}>
            {/* FILA 1: Nombre, Apellidos, Fecha Nacimiento */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Nombre(s) *"
                value={form.nombrePaciente}
                onChange={(e) =>
                  handleChange("nombrePaciente", e.target.value.toUpperCase())
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Apellidos"
                value={form.apellidosPaciente}
                onChange={(e) =>
                  handleChange(
                    "apellidosPaciente",
                    e.target.value.toUpperCase(),
                  )
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Fecha de Nacimiento *"
                type="date"
                value={form.fechaNacimiento}
                onChange={(e) =>
                  handleChange("fechaNacimiento", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: fechaHoy() }}
              />
            </Grid>

            {/* FILA 2: Teléfono, Celular, Género */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Teléfono Fijo"
                value={form.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                placeholder="Ej: 4-123456"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Celular"
                value={form.telefonoCelular}
                onChange={(e) =>
                  handleChange("telefonoCelular", e.target.value)
                }
                placeholder="Ej: 77412345"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Género"
                value={form.genero}
                onChange={(e) => handleChange("genero", e.target.value)}
              >
                {GENEROS.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.descripcion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* FILA 3: Correo completo */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Correo Electrónico"
                type="email"
                value={form.correoElectronico}
                onChange={(e) =>
                  handleChange("correoElectronico", e.target.value)
                }
                placeholder="paciente@correo.com"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* UBICACIÓN */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={cardPadding}>
          <Typography sx={sectionLabel}>Ubicación</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="País"
                value={form.pais}
                onChange={(e) =>
                  handleChange("pais", e.target.value.toUpperCase())
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Nacionalidad"
                value={form.nacionalidad}
                onChange={(e) => handleChange("nacionalidad", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Departamento"
                value={form.departamento}
                onChange={(e) =>
                  handleChange("departamento", e.target.value.toUpperCase())
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Ciudad"
                value={form.ciudad}
                onChange={(e) =>
                  handleChange("ciudad", e.target.value.toUpperCase())
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Dirección Completa"
                value={form.direccionCompleta}
                onChange={(e) =>
                  handleChange(
                    "direccionCompleta",
                    e.target.value.toUpperCase(),
                  )
                }
                placeholder="Av. América E-1347"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* BOTONES */}
      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/pacientes/buscar")}
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
          variant="outlined"
          startIcon={<Print />}
          onClick={imprimirHistorialClinico}
          disabled={guardando}
          sx={{
            borderRadius: 1.5,
            fontWeight: 600,
            textTransform: "none",
            borderColor: "#374151",
            color: "#374151",
            "&:hover": { borderColor: "#111827", bgcolor: "#f9fafb" },
          }}
        >
          Imprimir HC
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
          {guardando ? "Actualizando..." : "Actualizar Paciente"}
        </Button>
      </Box>
    </Box>
  );
}
