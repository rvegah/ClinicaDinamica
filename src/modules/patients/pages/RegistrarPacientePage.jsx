// src/modules/patients/pages/RegistrarPacientePage.jsx
// Formulario de registro de paciente — normal, SN (adulto sin datos), NN (bebé sin datos)

import React, { useState } from "react";
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
  Alert,
  CircularProgress,
  Collapse,
  Divider,
} from "@mui/material";
import {
  PersonAdd,
  ArrowBack,
  Save,
  ChildCare,
  Person,
  Warning,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import pacienteService, {
  TIPOS_DOCUMENTO,
  GENEROS,
} from "../../../services/api/pacienteService";

// ─── TIPO DE REGISTRO ─────────────────────────────────────────────────────────
// normal → formulario completo
// SN     → adulto sin datos — solo número de documento
// NN     → bebé sin datos   — solo número de documento
const TIPOS_REGISTRO = [
  /*{
    id: "normal",
    label: "Paciente Normal",
    desc: "Registro completo con datos del paciente",
  },*/
  {
    id: "SN",
    label: "SN — Adulto sin datos",
    desc: "Paciente adulto ingresado de emergencia sin información",
  },
  {
    id: "NN",
    label: "NN — Bebé sin datos",
    desc: "Bebé ingresado sin nombre ni datos registrados",
  },
];

// ─── ESTADO INICIAL DEL FORMULARIO ───────────────────────────────────────────
const formVacio = () => ({
  tipoDocumentoIdentidad: 1,
  numeroDocumento: "",
  nombrePaciente: "",
  apellidosPaciente: "",
  fechaNacimiento: "",
  genero: "M",
  telefono: "",
  telefonoCelular: "",
  correoElectronico: "",
  pais: "BOLIVIA",
  nacionalidad: "Boliviano",
  departamento: "",
  ciudad: "",
  direccionCompleta: "",
});

export default function RegistrarPacientePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [tipoRegistro, setTipoRegistro] = useState("SN");
  const [form, setForm] = useState(formVacio());
  const [guardando, setGuardando] = useState(false);

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const construirPayload = () => {
    // Obtener codigoEmpleadoAlta desde sessionStorage (usuario logueado)
    const userJson = sessionStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : {};
    const codigoEmpleado = user.codigoEmpleado || user.usuario || "SYSTEMAS";
    const usuarioId = user.usuario_ID || 1;

    if (tipoRegistro === "SN") {
      return {
        numeroDocumento: form.numeroDocumento,
        nombrePaciente: "SN",
        esNeonato: false,
        codigoEmpleadoAlta: codigoEmpleado,
        usuarioRegistroAlta: usuarioId,
      };
    }

    if (tipoRegistro === "NN") {
      return {
        numeroDocumento: form.numeroDocumento,
        nombrePaciente: "NN",
        esNeonato: true,
        codigoEmpleadoAlta: codigoEmpleado,
        usuarioRegistroAlta: usuarioId,
      };
    }

    // Normal
    return {
      numeroDocumento: form.numeroDocumento,
      nombrePaciente: `${form.nombrePaciente} ${form.apellidosPaciente}`.trim(),
      esNeonato: false,
      codigoEmpleadoAlta: codigoEmpleado,
      usuarioRegistroAlta: usuarioId,
    };
  };

  const validar = () => {
    if (!/^\d+$/.test(form.numeroDocumento)) {
      return "El número de documento debe ser numérico";
    }
    if (tipoRegistro === "normal") {
      if (!form.nombrePaciente.trim())
        return "El nombre del paciente es obligatorio";
    }
    return null;
  };

  const handleGuardar = async () => {
    const error = validar();
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      return;
    }

    setGuardando(true);
    try {
      const payload = construirPayload();
      const res = await pacienteService.guardarPaciente(payload);

      if (res.exitoso) {
        enqueueSnackbar(res.mensaje || "✅ Paciente registrado exitosamente", {
          variant: "success",
          autoHideDuration: 5000,
        });
        navigate("/pacientes/buscar");
      } else {
        enqueueSnackbar(res.mensaje || "Error al registrar paciente", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error al registrar paciente", {
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
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 2,
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
        <Box>
          <Typography variant="h5" fontWeight={700} color="#111827">
            Registrar Paciente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nuevo ingreso al centro médico
          </Typography>
        </Box>
      </Box>

      {/* TIPO DE REGISTRO */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={cardPadding}>
          <Typography sx={sectionLabel}>
            <PersonAdd sx={{ fontSize: 16, color: "#6b7280" }} />
            Tipo de Registro
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            {TIPOS_REGISTRO.map((tipo) => (
              <Box
                key={tipo.id}
                onClick={() => {
                  setTipoRegistro(tipo.id);
                  setForm(formVacio());
                }}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  borderRadius: 1.5,
                  border: `1.5px solid ${tipoRegistro === tipo.id ? "#2563eb" : "#e5e7eb"}`,
                  bgcolor: tipoRegistro === tipo.id ? "#eff6ff" : "white",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor:
                      tipoRegistro === tipo.id ? "#2563eb" : "#93c5fd",
                    bgcolor: tipoRegistro === tipo.id ? "#eff6ff" : "#f8faff",
                  },
                }}
              >
                {/* Indicador seleccionado */}
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: `2px solid ${tipoRegistro === tipo.id ? "#2563eb" : "#d1d5db"}`,
                    bgcolor: tipoRegistro === tipo.id ? "#2563eb" : "white",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {tipoRegistro === tipo.id && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "white",
                      }}
                    />
                  )}
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={tipoRegistro === tipo.id ? 700 : 500}
                    color={tipoRegistro === tipo.id ? "#2563eb" : "#374151"}
                    sx={{ lineHeight: 1.3 }}
                  >
                    {tipo.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 11 }}
                  >
                    {tipo.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Collapse in={tipoRegistro !== "normal"}>
            <Alert
              severity="warning"
              sx={{
                mt: 1.5,
                borderRadius: 1,
                border: "1px solid #fcd34d",
                bgcolor: "#fffbeb",
                py: 0.5,
              }}
            >
              <Typography variant="caption">
                <strong>Registro rápido ({tipoRegistro}):</strong> Solo se
                requiere el número de documento. Los datos completos se
                actualizarán posteriormente.
              </Typography>
            </Alert>
          </Collapse>
        </CardContent>
      </Card>

      {/* FORMULARIO DOCUMENTO — siempre visible */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={cardPadding}>
          <Typography sx={sectionLabel}>Identificación</Typography>
          <Grid container spacing={2}>
            {tipoRegistro === "normal" && (
              <Grid item xs={12} sm={5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipo de Documento"
                  value={form.tipoDocumentoIdentidad}
                  onChange={(e) =>
                    handleChange(
                      "tipoDocumentoIdentidad",
                      Number(e.target.value),
                    )
                  }
                >
                  {TIPOS_DOCUMENTO.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.descripcion}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} sm={tipoRegistro === "normal" ? 7 : 12}>
              <TextField
                fullWidth
                size="small"
                label="Número de Documento *"
                value={form.numeroDocumento}
                onChange={(e) => {
                  const valor = e.target.value;

                  if (/^\d*$/.test(valor)) {
                    handleChange("numeroDocumento", valor);
                  }
                }}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                placeholder="Ej: 12345678"
                required
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* DATOS PERSONALES — solo registro normal */}
      <Collapse in={tipoRegistro === "normal"}>
        <Card sx={{ ...card, mb: 2 }}>
          <CardContent sx={cardPadding}>
            <Typography sx={sectionLabel}>Datos Personales</Typography>
            <Grid container spacing={2}>
              <Grid container spacing={2}>
                {/* FILA 1: Nombre, Apellidos, Fecha Nacimiento */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nombre(s) *"
                    value={form.nombrePaciente}
                    onChange={(e) =>
                      handleChange(
                        "nombrePaciente",
                        e.target.value.toUpperCase(),
                      )
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
                    label="Fecha de Nacimiento"
                    type="date"
                    value={form.fechaNacimiento}
                    onChange={(e) =>
                      handleChange("fechaNacimiento", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
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
                    value={form.genero || "M"}
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
      </Collapse>

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
          {guardando ? "Guardando..." : "Guardar Paciente"}
        </Button>
      </Box>
    </Box>
  );
}
