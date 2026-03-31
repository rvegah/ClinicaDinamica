// src/modules/reportes/pages/EstadisticasAtencionPage.jsx

import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, TextField,
  CircularProgress, MenuItem, Grid,
} from "@mui/material";
import atencionMedicaService from "../../../services/api/atencionMedicaService";
import agendamientoService from "../../../services/api/agendamientoService";
import enfermeriaService from "../../../services/api/enfermeriaService";
import { fechaHoy } from "../../../utils/fecha";

function EstadisticasAtencionPage() {
  const [fechaReporte, setFechaReporte] = useState(fechaHoy());
  const [medicoSeleccionado, setMedicoSeleccionado] = useState("");
  const [enfermeraSeleccionada, setEnfermeraSeleccionada] = useState("");
  const [medicos, setMedicos] = useState([]);
  const [enfermeras, setEnfermeras] = useState([]);
  const [reporteMedico, setReporteMedico] = useState([]);
  const [reporteEnfermera, setReporteEnfermera] = useState([]);
  const [cargandoMedico, setCargandoMedico] = useState(false);
  const [cargandoEnfermera, setCargandoEnfermera] = useState(false);

  useEffect(() => {
    agendamientoService.listarMedicos()
      .then((res) => setMedicos(res.datos || []))
      .catch(() => {});
    enfermeriaService.listarEnfermeras()
      .then((res) => setEnfermeras(res.datos || []))
      .catch(() => {});
  }, []);

  const buscarMedico = async () => {
    if (!medicoSeleccionado) return;
    setCargandoMedico(true);
    try {
      const res = await atencionMedicaService.atencionMedico({
        medicoId: medicoSeleccionado,
        fecha: fechaReporte,
      });
      setReporteMedico(res.datos || []);
    } catch {} finally { setCargandoMedico(false); }
  };

  const buscarEnfermera = async () => {
    if (!enfermeraSeleccionada) return;
    setCargandoEnfermera(true);
    try {
      const res = await atencionMedicaService.atencionEnfermera({
        enfermeraId: enfermeraSeleccionada,
        fecha: fechaReporte,
      });
      setReporteEnfermera(res.datos || []);
    } catch {} finally { setCargandoEnfermera(false); }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} color="#1A2B4A">
          Estadísticas de Atención
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Consulta las atenciones médicas y de enfermería por fecha y profesional
        </Typography>
      </Box>

      {/* ── ATENCIONES MÉDICAS ── */}
      <Paper elevation={0} sx={{ mb: 2, borderRadius: 2, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 1.75, bgcolor: "#eff6ff", borderBottom: "1px solid #bfdbfe" }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#1e40af", mb: 1.5 }}>
            🩺 Atenciones Médicas
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr auto" }, gap: 1.5 }}>
            <TextField
              size="small" type="date" label="Fecha"
              value={fechaReporte}
              onChange={(e) => setFechaReporte(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select size="small" label="Médico"
              value={medicoSeleccionado}
              onChange={(e) => setMedicoSeleccionado(e.target.value)}
            >
              <MenuItem value="">— Seleccione —</MenuItem>
              {medicos.map((m) => (
                <MenuItem key={m.medico_ID} value={m.medico_ID}>{m.nombreMedico}</MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={buscarMedico}
              disabled={cargandoMedico || !medicoSeleccionado}
              sx={{ bgcolor: "#1e40af", "&:hover": { bgcolor: "#1d4ed8" }, textTransform: "none", fontWeight: 700, borderRadius: 1.5, boxShadow: "none", minWidth: 90 }}
            >
              {cargandoMedico ? <CircularProgress size={14} color="inherit" /> : "Buscar"}
            </Button>
          </Box>
        </Box>
        {reporteMedico.length === 0 ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              {medicoSeleccionado ? "Sin atenciones para esta fecha" : "Seleccione un médico y presione Buscar"}
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 2fr 2fr", bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb", px: 2, py: 1 }}>
              {["Paciente", "Hora", "Motivo", "Diagnóstico"].map((h) => (
                <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: "#6b7280", textTransform: "uppercase", fontSize: 10 }}>{h}</Typography>
              ))}
            </Box>
            {reporteMedico.map((r, i) => (
              <Box key={i} sx={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 2fr 2fr", px: 2, py: 1.25, borderBottom: i < reporteMedico.length - 1 ? "1px solid #f3f4f6" : "none", "&:hover": { bgcolor: "#fafafa" } }}>
                <Typography variant="caption" color="#111827" fontWeight={600}>{r.paciente}</Typography>
                <Typography variant="caption" color="#6b7280">{r.fecha?.split(" ")[1]?.slice(0, 5) || "—"}</Typography>
                <Typography variant="caption" color="#374151">{r.motivoConsulta || "—"}</Typography>
                <Typography variant="caption" color="#374151">{r.diagnostico || "—"}</Typography>
              </Box>
            ))}
            <Box sx={{ px: 2, py: 1, bgcolor: "#eff6ff", borderTop: "1px solid #bfdbfe" }}>
              <Typography variant="caption" color="#1e40af" fontWeight={700}>
                {reporteMedico[0]?.medico} · {reporteMedico.length} atención(es)
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* ── ATENCIONES ENFERMERÍA ── */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 1.75, bgcolor: "#f0fdf4", borderBottom: "1px solid #a7f3d0" }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#065f46", mb: 1.5 }}>
            💉 Atenciones de Enfermería
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr auto" }, gap: 1.5 }}>
            <TextField
              size="small" type="date" label="Fecha"
              value={fechaReporte}
              onChange={(e) => setFechaReporte(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select size="small" label="Enfermera"
              value={enfermeraSeleccionada}
              onChange={(e) => setEnfermeraSeleccionada(e.target.value)}
            >
              <MenuItem value="">— Seleccione —</MenuItem>
              {enfermeras.map((e) => (
                <MenuItem key={e.enfermera_ID} value={e.enfermera_ID}>{e.nombreEnfermera}</MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={buscarEnfermera}
              disabled={cargandoEnfermera || !enfermeraSeleccionada}
              sx={{ bgcolor: "#065f46", "&:hover": { bgcolor: "#047857" }, textTransform: "none", fontWeight: 700, borderRadius: 1.5, boxShadow: "none", minWidth: 90 }}
            >
              {cargandoEnfermera ? <CircularProgress size={14} color="inherit" /> : "Buscar"}
            </Button>
          </Box>
        </Box>
        {reporteEnfermera.length === 0 ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              {enfermeraSeleccionada ? "Sin atenciones para esta fecha" : "Seleccione una enfermera y presione Buscar"}
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 2fr", bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb", px: 2, py: 1 }}>
              {["Paciente", "Hora", "Motivo"].map((h) => (
                <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: "#6b7280", textTransform: "uppercase", fontSize: 10 }}>{h}</Typography>
              ))}
            </Box>
            {reporteEnfermera.map((r, i) => (
              <Box key={i} sx={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 2fr", px: 2, py: 1.25, borderBottom: i < reporteEnfermera.length - 1 ? "1px solid #f3f4f6" : "none", "&:hover": { bgcolor: "#fafafa" } }}>
                <Typography variant="caption" color="#111827" fontWeight={600}>{r.paciente}</Typography>
                <Typography variant="caption" color="#6b7280">{r.fecha?.split(" ")[1]?.slice(0, 5) || "—"}</Typography>
                <Typography variant="caption" color="#374151">{r.motivoAtencion || "—"}</Typography>
              </Box>
            ))}
            <Box sx={{ px: 2, py: 1, bgcolor: "#f0fdf4", borderTop: "1px solid #a7f3d0" }}>
              <Typography variant="caption" color="#065f46" fontWeight={700}>
                {reporteEnfermera[0]?.enfermera} · {reporteEnfermera.length} atención(es)
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default EstadisticasAtencionPage;