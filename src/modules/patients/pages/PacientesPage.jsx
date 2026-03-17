// src/modules/patients/pages/PacientesPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search,
  PersonAdd,
  Edit,
  MedicalInformation,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import pacienteService from "../../../services/api/pacienteService";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "—";
  try {
    const fecha = new Date(fechaStr);
    if (fecha.getFullYear() === 1850) return "—";
    return fecha.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const calcularEdad = (fechaStr) => {
  if (!fechaStr) return null;
  try {
    const fecha = new Date(fechaStr);
    if (fecha.getFullYear() === 1850) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) edad--;
    return edad;
  } catch {
    return null;
  }
};

const esPacienteSinDatos = (nombre) => {
  const n = (nombre || "").trim();
  return n === "NN" || n === "SN";
};

// ─── TABLA ────────────────────────────────────────────────────────────────────
function TablaPacientes({ pacientes, onEditar }) {
  const cols = [
    { label: "Paciente", width: "28%" },
    { label: "Documento", width: "13%" },
    { label: "Nacimiento / Edad", width: "16%" },
    { label: "Género", width: "10%" },
    { label: "Contacto", width: "25%" },
    { label: "", width: "8%" },
  ];

  const gridCols = cols.map((c) => c.width).join(" ");

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Cabecera */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: gridCols,
          bgcolor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          px: 2,
          py: 1.25,
        }}
      >
        {cols.map((c) => (
          <Typography
            key={c.label}
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#6b7280",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: 11,
            }}
          >
            {c.label}
          </Typography>
        ))}
      </Box>

      {/* Filas */}
      {pacientes.map((p, idx) => {
        const nombre = (p.nombreCompletoPaciente || "").trim();
        const sinDatos = esPacienteSinDatos(nombre);
        const edad = calcularEdad(p.fechaNacimiento);
        const esUltimo = idx === pacientes.length - 1;

        return (
          <Box
            key={p.paciente_ID}
            sx={{
              display: "grid",
              gridTemplateColumns: gridCols,
              px: 2,
              py: 1.5,
              alignItems: "center",
              borderBottom: esUltimo ? "none" : "1px solid #f3f4f6",
              transition: "background 0.15s",
              "&:hover": { bgcolor: "#fafafa" },
            }}
          >
            {/* Paciente */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  bgcolor: sinDatos ? "#fef3c7" : "#eff6ff",
                  border: `2px solid ${sinDatos ? "#fcd34d" : "#bfdbfe"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: sinDatos ? "#d97706" : "#2563eb",
                  }}
                >
                  {sinDatos ? nombre : nombre.charAt(0)}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="#111827"
                    sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {sinDatos
                      ? nombre === "NN" ? "Sin nombre (NN)" : "Sin nombre (SN)"
                      : nombre}
                  </Typography>
                  {sinDatos && (
                    <Chip
                      label={nombre === "NN" ? "Bebé" : "Adulto"}
                      size="small"
                      sx={{
                        bgcolor: "#fef3c7",
                        color: "#92400e",
                        fontSize: 9,
                        fontWeight: 700,
                        height: 16,
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  )}
                </Box>
                {p.numeroHistoriaClinica?.trim() && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    HC: {p.numeroHistoriaClinica}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Documento */}
            <Typography
              variant="body2"
              color="#374151"
              sx={{ fontFamily: "monospace", fontSize: 13 }}
            >
              {p.numeroDocumento || "—"}
            </Typography>

            {/* Nacimiento */}
            <Box>
              <Typography variant="body2" color="#374151" fontSize={13}>
                {formatearFecha(p.fechaNacimiento)}
              </Typography>
              {edad !== null && (
                <Typography variant="caption" color="text.secondary">
                  {edad} {edad === 1 ? "año" : "años"}
                </Typography>
              )}
            </Box>

            {/* Género */}
            <Typography variant="body2" color="#374151" fontSize={13}>
              {p.genero?.trim() === "M"
                ? "Masculino"
                : p.genero?.trim() === "F"
                ? "Femenino"
                : "—"}
            </Typography>

            {/* Contacto */}
            <Box>
              <Typography variant="body2" color="#374151" fontSize={13}>
                {p.telefonoCelular?.trim() || p.telefono?.trim() || "—"}
              </Typography>
              {p.correoElectronico?.trim() && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 200,
                  }}
                >
                  {p.correoElectronico.trim()}
                </Typography>
              )}
            </Box>

            {/* Acción */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Tooltip title="Editar paciente" arrow>
                <IconButton
                  size="small"
                  onClick={() => onEditar(p)}
                  sx={{
                    color: "#2563eb",
                    bgcolor: "#eff6ff",
                    borderRadius: 1.5,
                    width: 30,
                    height: 30,
                    "&:hover": { bgcolor: "#dbeafe" },
                  }}
                >
                  <Edit sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function PacientesPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [busqueda, setBusqueda] = useState("");
  const [tipoBusqueda, setTipoBusqueda] = useState("documento");
  const [pacientes, setPacientes] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const handleBuscar = async () => {
    if (!busqueda.trim()) {
      enqueueSnackbar("Ingrese un término de búsqueda", { variant: "warning" });
      return;
    }
    setBuscando(true);
    setBuscado(false);
    try {
      const params =
        tipoBusqueda === "documento"
          ? { numeroDocumento: busqueda.trim() }
          : { nombreCompletoPaciente: busqueda.trim() };

      const res = await pacienteService.buscarPacientes(params);

      if (res.exitoso) {
        setPacientes(res.datos || []);
        setBuscado(true);
        if ((res.datos || []).length === 0) {
          enqueueSnackbar("No se encontraron pacientes", { variant: "info" });
        }
      } else {
        enqueueSnackbar(res.mensaje || "Error al buscar", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error al buscar pacientes", { variant: "error" });
    } finally {
      setBuscando(false);
    }
  };

  const handleEditar = (paciente) => {
    navigate(`/pacientes/editar/${paciente.paciente_ID}`, {
      state: { paciente },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleBuscar();
  };

  const card = {
    borderRadius: 2,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    bgcolor: "white",
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* HEADER */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#111827">
            Pacientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro y gestión de pacientes del consultorio
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => navigate("/pacientes/registrar")}
          sx={{
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
            borderRadius: 1.5,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "none",
            py: 1.2,
            px: 2.5,
          }}
        >
          Registrar Paciente
        </Button>
      </Box>

      {/* BUSCADOR */}
      <Card sx={{ ...card, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            color="#111827"
            sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
          >
            <Search sx={{ fontSize: 16, color: "#6b7280" }} />
            Buscar Paciente
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
            {[
              { id: "documento", label: "Por Nro. Documento" },
              { id: "nombre", label: "Por Nombre" },
            ].map((opt) => (
              <Button
                key={opt.id}
                size="small"
                variant={tipoBusqueda === opt.id ? "contained" : "outlined"}
                onClick={() => setTipoBusqueda(opt.id)}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 12,
                  ...(tipoBusqueda === opt.id
                    ? { bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "none" }
                    : { borderColor: "#d1d5db", color: "#374151", "&:hover": { borderColor: "#9ca3af" } }),
                }}
              >
                {opt.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={tipoBusqueda === "documento" ? "Ej: 12345678" : "Ej: JOSE NOGALES"}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 17, color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleBuscar}
              disabled={buscando}
              sx={{
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
                borderRadius: 1.5,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "none",
                minWidth: 110,
              }}
            >
              {buscando ? <CircularProgress size={18} color="inherit" /> : "Buscar"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* RESULTADOS */}
      {buscado && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {pacientes.length === 0
                ? "Sin resultados"
                : `${pacientes.length} paciente${pacientes.length !== 1 ? "s" : ""} encontrado${pacientes.length !== 1 ? "s" : ""}`}
            </Typography>
          </Box>

          {pacientes.length === 0 ? (
            <Alert
              severity="info"
              sx={{ borderRadius: 1.5, border: "1px solid #bfdbfe", bgcolor: "#eff6ff" }}
            >
              No se encontraron pacientes. ¿Desea{" "}
              <strong
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate("/pacientes/registrar")}
              >
                registrar un nuevo paciente
              </strong>
              ?
            </Alert>
          ) : (
            <TablaPacientes pacientes={pacientes} onEditar={handleEditar} />
          )}
        </>
      )}

      {/* Estado inicial */}
      {!buscado && (
        <Box sx={{ textAlign: "center", py: 8, color: "#9ca3af" }}>
          <MedicalInformation sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
          <Typography variant="body1" fontWeight={500}>
            Ingrese un número de documento o nombre para buscar
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            O registre un nuevo paciente con el botón superior
          </Typography>
        </Box>
      )}
    </Box>
  );
}