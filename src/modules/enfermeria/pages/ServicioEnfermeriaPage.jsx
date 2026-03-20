// src/modules/enfermeria/pages/ServicioEnfermeriaPage.jsx
// Módulo de Servicio de Enfermería (independiente del triaje)
// Flujo: Buscar paciente → Seleccionar procedimiento → Registrar atención
//        → Guardar servicio → Agregar insumos → Guardar insumos

import React, { useState, useEffect, useRef } from "react";
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
  Grid,
  Portal,
  Paper,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Search,
  Save,
  MedicalServices,
  Add,
  LocalHospital,
  Medication,
  ArrowBack,
  Print,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import enfermeriaService from "../../../services/api/enfermeriaService";
import pacienteService from "../../../services/api/pacienteService";

// ─── HELPER ──────────────────────────────────────────────────────────────────
const getUsuario = () => {
  try {
    const u = JSON.parse(sessionStorage.getItem("user") || "{}");
    return {
      id: u.usuario_ID || 1,
      personalMedicoId: u.personalMedico_ID || null,
      codigo: u.codigoEmpleado || u.usuario || "SYSTEMAS",
      nombre: u.nombreCompleto || "ENFERMERA",
    };
  } catch {
    return {
      id: 1,
      personalMedicoId: null,
      codigo: "SYSTEMAS",
      nombre: "ENFERMERA",
    };
  }
};

const hoy = () => new Date().toISOString().split("T")[0];
const ahora = () => new Date().toISOString();

// ─── ESTILOS COMPARTIDOS ─────────────────────────────────────────────────────
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

// ─── FORMULARIO PRINCIPAL ────────────────────────────────────────────────────
export default function ServicioEnfermeriaPage() {
  const { enqueueSnackbar } = useSnackbar();
  const usuario = getUsuario();

  // ─── Catálogos ──────────────────────────────────────────────────────────
  const [procedimientos, setProcedimientos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

  // ─── Búsqueda de paciente ────────────────────────────────────────────────
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [pacientesBuscados, setPacientesBuscados] = useState([]);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const pacienteRef = useRef(null);

  const [tipoBusquedaPaciente, setTipoBusquedaPaciente] = useState("documento");

  // ─── Formulario de servicio ──────────────────────────────────────────────
  const [form, setForm] = useState({
    procedimiento_ID: "",
    origenServicio: "directo",
    ordenMedica_ID: 0,
    consultaMedica_ID: 0,
    fechaServicio: hoy(),
    motivoAtencion: "",
    observaciones: "",
    materialesUtilizados: "",
    presionArterial: "",
    frecuenciaCardiaca: "",
    temperatura: "",
    saturacionOxigeno: "",
    precioServicio: "",
    costoMateriales: "",
    costoTotal: "",
  });

  // ─── Insumos utilizados ──────────────────────────────────────────────────
  const [insumosAgregados, setInsumosAgregados] = useState([]);
  const [insumoForm, setInsumoForm] = useState({
    producto_ID: "",
    nombreInsumo: "",
    precioReferencia: 0,
    cantidad: 1,
    precioUnitario: "",
    observaciones: "",
  });

  // ─── Estado de guardado ──────────────────────────────────────────────────
  const [guardando, setGuardando] = useState(false);
  const [guardandoInsumo, setGuardandoInsumo] = useState(false);
  const [servicioGuardado, setServicioGuardado] = useState(null); // fase post-guardado

  // ─── Cargar catálogos ────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      enfermeriaService.getProcedimientos().catch(() => ({ datos: [] })),
      enfermeriaService.getInsumos().catch(() => ({ datos: [] })),
    ]).then(([procs, inss]) => {
      setProcedimientos(procs.datos || []);
      setInsumos(inss.datos || []);
      setCargandoCatalogos(false);
    });
  }, []);

  // ─── Auto-calcular costoTotal ────────────────────────────────────────────
  useEffect(() => {
    const precio = Number(form.precioServicio) || 0;
    const materiales = Number(form.costoMateriales) || 0;
    setForm((p) => ({ ...p, costoTotal: String(precio + materiales) }));
  }, [form.precioServicio, form.costoMateriales]);

  // ─── Auto-precio del procedimiento seleccionado ──────────────────────────
  useEffect(() => {
    if (!form.procedimiento_ID) return;
    const proc = procedimientos.find(
      (p) => p.procedimiento_ID === Number(form.procedimiento_ID),
    );
    if (proc) {
      setForm((p) => ({
        ...p,
        precioServicio: String(proc.precioProcedmiento || ""),
      }));
    }
  }, [form.procedimiento_ID, procedimientos]);

  // ─── Buscar paciente con debounce ────────────────────────────────────────
  useEffect(() => {
    if (!busquedaPaciente || busquedaPaciente.length < 2) {
      setPacientesBuscados([]);
      return;
    }
    const t = setTimeout(async () => {
      setBuscandoPaciente(true);
      try {
        const res = await pacienteService.buscarPacientes(
          tipoBusquedaPaciente === "documento"
            ? { numeroDocumento: busquedaPaciente }
            : { nombreCompletoPaciente: busquedaPaciente },
        );
        setPacientesBuscados(res.exitoso ? res.datos || [] : []);
      } catch {
        setPacientesBuscados([]);
      } finally {
        setBuscandoPaciente(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [busquedaPaciente, tipoBusquedaPaciente]);

  const cambiarForm = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ─── GUARDAR SERVICIO ────────────────────────────────────────────────────
  const handleGuardarServicio = async () => {
    if (!pacienteSeleccionado) {
      enqueueSnackbar("Seleccione un paciente", { variant: "error" });
      return;
    }
    if (!form.procedimiento_ID) {
      enqueueSnackbar("Seleccione un procedimiento", { variant: "error" });
      return;
    }
    if (!form.motivoAtencion.trim()) {
      enqueueSnackbar("Ingrese el motivo de atención", { variant: "error" });
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        paciente_ID: pacienteSeleccionado.paciente_ID,
        enfermera_ID: usuario.personalMedicoId || usuario.id,
        procedimiento_ID: Number(form.procedimiento_ID),
        origenServicio: form.origenServicio,
        ordenMedica_ID: form.ordenMedica_ID || 0,
        consultaMedica_ID: form.consultaMedica_ID || 0,
        fechaServicio: `${form.fechaServicio}T${new Date().toTimeString().slice(0, 8)}`,
        motivoAtencion: form.motivoAtencion,
        observaciones: form.observaciones || "",
        materialesUtilizados: form.materialesUtilizados || "",
        presionArterial: form.presionArterial || "",
        frecuenciaCardiaca: Number(form.frecuenciaCardiaca) || 0,
        temperatura: Number(form.temperatura) || 0,
        saturacionOxigeno: Number(form.saturacionOxigeno) || 0,
        precioServicio: Number(form.precioServicio) || 0,
        costoMateriales: Number(form.costoMateriales) || 0,
        costoTotal: Number(form.costoTotal) || 0,
        codigoEmpleadoAlta: usuario.codigo,
        usuarioRegistroAlta: usuario.id,
      };

      const res = await enfermeriaService.guardarServicio(payload);
      if (res.exitoso) {
        enqueueSnackbar("✅ Servicio de enfermería registrado", {
          variant: "success",
        });
        setServicioGuardado(res.datos);
      } else {
        enqueueSnackbar(res.mensaje || "Error al guardar servicio", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error al guardar servicio", {
        variant: "error",
      });
    } finally {
      setGuardando(false);
    }
  };

  // ─── AGREGAR INSUMO A LA LISTA (local) ──────────────────────────────────
  const handleAgregarInsumo = () => {
    if (!insumoForm.producto_ID) {
      enqueueSnackbar("Seleccione un insumo", { variant: "warning" });
      return;
    }
    const insumo = insumos.find(
      (i) => i.producto_ID === Number(insumoForm.producto_ID),
    );
    const precio =
      Number(insumoForm.precioUnitario) || insumo?.precioReferencia || 0;
    const cantidad = Number(insumoForm.cantidad) || 1;
    setInsumosAgregados((p) => [
      ...p,
      {
        producto_ID: Number(insumoForm.producto_ID),
        nombreInsumo: insumo?.nombreInsumo || "",
        cantidad,
        precioUnitario: precio,
        costoTotal: precio * cantidad,
        observaciones: insumoForm.observaciones || "",
        fecha: ahora(),
      },
    ]);
    setInsumoForm({
      producto_ID: "",
      nombreInsumo: "",
      precioReferencia: 0,
      cantidad: 1,
      precioUnitario: "",
      observaciones: "",
    });
  };

  // ─── GUARDAR INSUMOS AL BACKEND ──────────────────────────────────────────
  const handleGuardarInsumos = async () => {
    if (!servicioGuardado?.servicioEnfermeria_ID) return;
    if (insumosAgregados.length === 0) {
      enqueueSnackbar("Agregue al menos un insumo", { variant: "warning" });
      return;
    }

    setGuardandoInsumo(true);
    let errores = 0;
    for (const ins of insumosAgregados) {
      try {
        const payload = {
          servicioEnfermeria_ID: servicioGuardado.servicioEnfermeria_ID,
          producto_ID: ins.producto_ID,
          cantidad: ins.cantidad,
          precioUnitario: ins.precioUnitario,
          fecha: ins.fecha,
          costoTotal: ins.costoTotal,
          observaciones: ins.observaciones || "NINGUNA",
        };
        const res = await enfermeriaService.guardarInsumo(payload);
        if (!res.exitoso) errores++;
      } catch {
        errores++;
      }
    }
    setGuardandoInsumo(false);

    if (errores === 0) {
      enqueueSnackbar(`✅ ${insumosAgregados.length} insumo(s) guardado(s)`, {
        variant: "success",
      });
      setInsumosAgregados([]);
    } else {
      enqueueSnackbar(`${errores} insumo(s) no pudieron guardarse`, {
        variant: "warning",
      });
    }
  };

  // ─── NUEVO SERVICIO ──────────────────────────────────────────────────────
  const handleNuevo = () => {
    setPacienteSeleccionado(null);
    setBusquedaPaciente("");
    setForm({
      procedimiento_ID: "",
      origenServicio: "directo",
      ordenMedica_ID: 0,
      consultaMedica_ID: 0,
      fechaServicio: hoy(),
      motivoAtencion: "",
      observaciones: "",
      materialesUtilizados: "",
      presionArterial: "",
      frecuenciaCardiaca: "",
      temperatura: "",
      saturacionOxigeno: "",
      precioServicio: "",
      costoMateriales: "",
      costoTotal: "",
    });
    setInsumosAgregados([]);
    setServicioGuardado(null);
    setTipoBusquedaPaciente("documento");
  };

  const imprimirServicio = () => {
    const procNombre =
      procedimientos.find(
        (p) => p.procedimiento_ID === Number(form.procedimiento_ID),
      )?.nombre || "—";

    const w = window.open("", "_blank", "width=680,height=700");
    w.document.write(`
    <html>
    <head>
      <title>Servicio de Enfermería</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; max-width: 620px; }
        .header-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; border-bottom:3px solid #e65c00; padding-bottom:10px; }
        .logo-area { display:flex; align-items:center; gap:10px; }
        .logo-circle { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#e65c00,#003366); display:flex; align-items:center; justify-content:center; }
        .logo-text { font-size:22px; font-weight:900; color:#e65c00; letter-spacing:1px; }
        .srl { font-size:10px; color:#e65c00; font-weight:700; }
        .doc-title { font-size:18px; font-weight:900; color:#333; }
        .doc-num { color:#e65c00; font-size:20px; font-weight:900; }
        .info-block { margin:10px 0; font-size:11px; line-height:1.9; }
        .info-block span { font-weight:700; }
        .section-title { font-size:11px; font-weight:700; text-transform:uppercase;
          background:#f0f0f0; padding:4px 8px; border-left:3px solid #e65c00; margin:12px 0 6px; }
        .field-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 16px; margin-bottom:8px; }
        .field { font-size:11px; }
        .field label { font-weight:700; color:#555; display:block; font-size:10px; }
        .field p { border-bottom:1px solid #ddd; padding-bottom:2px; min-height:16px; }
        .vitales-grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:6px; margin-bottom:8px; }
        .firma-section { display:flex; justify-content:space-between; align-items:flex-end; margin-top:40px; }
        .firma-box { text-align:center; }
        .firma-line { border-top:1px solid #333; width:140px; margin:0 auto 4px; }
        .divider { border-top:2px solid #333; margin:14px 0; }
        @media print { button { display:none!important; } }
      </style>
    </head>
    <body>
      <!-- CABECERA DINAMAX -->
      <div class="header-top">
        <div class="logo-area">
          <div class="logo-circle">
            <span style="color:white;font-weight:900;font-size:13px;">DX</span>
          </div>
          <div>
            <div style="font-size:8px;color:#003366;font-weight:700;text-transform:uppercase;letter-spacing:1px;">CENTRO MÉDICO CON INTERNACION TRANSITORIA</div>
            <div class="logo-text">DINAMAX <span class="srl">S.R.L.</span></div>
          </div>
        </div>
        <div style="text-align:right;">
          <div class="doc-title">SERVICIO DE ENFERMERÍA</div>
          <div class="doc-num">N° ${servicioGuardado.servicioEnfermeria_ID || "—"}</div>
        </div>
      </div>

      <!-- DATOS GENERALES -->
      <div class="info-block">
        <div><span>Fecha:</span> ${form.fechaServicio}</div>
        <div><span>Paciente:</span> ${pacienteSeleccionado?.nombreCompletoPaciente || "—"}</div>
        <div><span>Doc.:</span> ${pacienteSeleccionado?.numeroDocumento || "—"}</div>
        <div><span>Enfermera:</span> ${usuario.nombre}</div>
      </div>

      <!-- PROCEDIMIENTO -->
      <div class="section-title">Procedimiento</div>
      <div class="field-grid">
        <div class="field"><label>Procedimiento</label><p>${procNombre}</p></div>
        <div class="field"><label>Origen del Servicio</label><p>${(form.origenServicio || "").replace("_", " ").toUpperCase()}</p></div>
        <div class="field" style="grid-column:span 2"><label>Motivo de Atención</label><p>${form.motivoAtencion || "—"}</p></div>
        <div class="field" style="grid-column:span 2"><label>Observaciones</label><p>${form.observaciones || "—"}</p></div>
        <div class="field" style="grid-column:span 2"><label>Materiales Utilizados</label><p>${form.materialesUtilizados || "—"}</p></div>
      </div>

      <!-- SIGNOS VITALES -->
      ${
        form.presionArterial ||
        form.frecuenciaCardiaca ||
        form.temperatura ||
        form.saturacionOxigeno
          ? `
      <div class="section-title">Signos Vitales</div>
      <div class="vitales-grid">
        <div class="field"><label>Presión Arterial</label><p>${form.presionArterial || "—"} mmHg</p></div>
        <div class="field"><label>Frec. Cardíaca</label><p>${form.frecuenciaCardiaca || "—"} lpm</p></div>
        <div class="field"><label>Temperatura</label><p>${form.temperatura || "—"} °C</p></div>
        <div class="field"><label>Saturación O₂</label><p>${form.saturacionOxigeno || "—"} %</p></div>
      </div>`
          : ""
      }

      <!-- COSTOS -->
      <div class="section-title">Costos</div>
      <div class="vitales-grid">
        <div class="field"><label>Precio Servicio</label><p>Bs. ${form.precioServicio || "0.00"}</p></div>
        <div class="field"><label>Costo Materiales</label><p>Bs. ${form.costoMateriales || "0.00"}</p></div>
        <div class="field"><label>Costo Total</label><p style="font-weight:700;">Bs. ${form.costoTotal || "0.00"}</p></div>
      </div>

      <div class="divider"></div>

      <!-- FIRMA -->
      <div class="firma-section">
        <div class="firma-box">
          <div class="firma-line"></div>
          <p style="font-size:11px;font-weight:700;">${usuario.nombre}</p>
          <p style="font-size:10px;color:#666;">Firma Enfermera/o</p>
        </div>
        <div class="firma-box">
          <div class="firma-line"></div>
          <p style="font-size:11px;">Sello</p>
        </div>
        <div class="firma-box">
          <div class="firma-line"></div>
          <p style="font-size:11px;">Firma Paciente</p>
        </div>
      </div>

      <br/>
      <button onclick="window.print()" style="width:100%;padding:10px;background:#003366;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;font-weight:bold;margin-top:8px;">
        🖨️ Imprimir Servicio de Enfermería
      </button>
    </body>
    </html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  // ─── RENDER: FASE POST-GUARDADO ──────────────────────────────────────────
  if (servicioGuardado) {
    const procNombre =
      procedimientos.find(
        (p) => p.procedimiento_ID === Number(form.procedimiento_ID),
      )?.nombre || "—";

    return (
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700} color="#111827">
            Servicio de Enfermería
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Servicio registrado — ahora registre los insumos utilizados
          </Typography>
        </Box>

        {/* Banner servicio guardado */}
        <Card
          sx={{
            ...card,
            mb: 2,
            border: "1.5px solid #86efac",
            bgcolor: "#f0fdf4",
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="#15803d"
                  sx={{ mb: 0.5 }}
                >
                  ✅ Servicio registrado — ID:{" "}
                  {servicioGuardado.servicioEnfermeria_ID}
                </Typography>
                <Typography variant="body2" color="#111827" fontWeight={600}>
                  {pacienteSeleccionado?.nombreCompletoPaciente} · {procNombre}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {servicioGuardado.motivoAtencion} · Bs.{" "}
                  {servicioGuardado.precioServicio}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Print />}
                onClick={imprimirServicio}
                sx={{
                  borderColor: "#16a34a",
                  color: "#15803d",
                  borderRadius: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  flexShrink: 0,
                  ml: 2,
                }}
              >
                Imprimir
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Agregar insumos */}
        <Card sx={{ ...card, mb: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              variant="body2"
              fontWeight={700}
              color="#111827"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Medication sx={{ fontSize: 16, color: "#6b7280" }} />
              Insumos Utilizados (opcional)
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" },
                gap: 1.5,
                mb: 2,
              }}
            >
              <TextField
                select
                size="small"
                label="Insumo"
                value={insumoForm.producto_ID}
                onChange={(e) => {
                  const ins = insumos.find(
                    (i) => i.producto_ID === Number(e.target.value),
                  );
                  setInsumoForm((p) => ({
                    ...p,
                    producto_ID: e.target.value,
                    nombreInsumo: ins?.nombreInsumo || "",
                    precioReferencia: ins?.precioReferencia || 0,
                    precioUnitario: String(ins?.precioReferencia || ""),
                  }));
                }}
              >
                <MenuItem value="">— Seleccione —</MenuItem>
                {insumos.map((i) => (
                  <MenuItem
                    key={`${i.producto_ID}-${i.codigo}`}
                    value={i.producto_ID}
                  >
                    {i.nombreInsumo} ({i.codigo})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Cantidad"
                type="number"
                value={insumoForm.cantidad}
                onChange={(e) =>
                  setInsumoForm((p) => ({ ...p, cantidad: e.target.value }))
                }
                inputProps={{ min: 1 }}
              />
              <TextField
                size="small"
                label="Precio Unitario (Bs.)"
                type="number"
                value={insumoForm.precioUnitario}
                InputProps={{ readOnly: true }}
                sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f9fafb" } }}
                helperText={
                  insumoForm.precioReferencia
                    ? `Ref: Bs. ${insumoForm.precioReferencia}`
                    : ""
                }
              />
            </Box>
            <Box
              sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}
            >
              <TextField
                size="small"
                label="Observaciones"
                fullWidth
                value={insumoForm.observaciones}
                onChange={(e) =>
                  setInsumoForm((p) => ({
                    ...p,
                    observaciones: e.target.value,
                  }))
                }
                placeholder="Ej: Uso en curación"
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAgregarInsumo}
                sx={{ ...addBtn, whiteSpace: "nowrap" }}
              >
                Agregar
              </Button>
            </Box>

            {/* Lista insumos */}
            {insumosAgregados.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="#6b7280"
                  sx={{ mb: 1, display: "block" }}
                >
                  INSUMOS AGREGADOS
                </Typography>
                {insumosAgregados.map((ins, i) => (
                  <Box key={i} sx={listaItem}>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="#111827"
                      >
                        {ins.nombreInsumo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Cant: {ins.cantidad} · Bs. {ins.precioUnitario} c/u ·
                        Total: Bs. {ins.costoTotal}
                      </Typography>
                    </Box>
                    <Chip
                      label={`Bs. ${ins.costoTotal}`}
                      size="small"
                      sx={{
                        bgcolor: "#ede9fe",
                        color: "#6d28d9",
                        fontWeight: 700,
                        fontSize: 10,
                      }}
                    />
                  </Box>
                ))}
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    bgcolor: "#f3f4f6",
                    borderRadius: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    Total insumos:
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#2563eb">
                    Bs. {insumosAgregados.reduce((s, i) => s + i.costoTotal, 0)}
                  </Typography>
                </Box>
              </Box>
            )}

            {insumosAgregados.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Sin insumos agregados — puede continuar sin insumos o agregar
                los utilizados.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Botones finales */}
        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={handleNuevo}
            sx={{
              borderRadius: 1.5,
              fontWeight: 600,
              textTransform: "none",
              borderColor: "#d1d5db",
              color: "#374151",
            }}
          >
            Nuevo Servicio
          </Button>
          {insumosAgregados.length > 0 && (
            <Button
              variant="contained"
              startIcon={
                guardandoInsumo ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Save />
                )
              }
              onClick={handleGuardarInsumos}
              disabled={guardandoInsumo}
              sx={{
                ...addBtn,
                bgcolor: "#16a34a",
                "&:hover": { bgcolor: "#15803d" },
                px: 3,
              }}
            >
              {guardandoInsumo
                ? "Guardando..."
                : `Guardar ${insumosAgregados.length} Insumo(s)`}
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  // ─── RENDER: FORMULARIO PRINCIPAL ────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#111827">
          Servicio de Enfermería
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registro de atención de enfermería directa al paciente
        </Typography>
      </Box>

      {cargandoCatalogos && (
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
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            color="#111827"
            sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
          >
            <LocalHospital sx={{ fontSize: 16, color: "#6b7280" }} />
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
              <Box>
                <Typography variant="body2" fontWeight={700} color="#15803d">
                  {(pacienteSeleccionado.nombreCompletoPaciente || "").trim()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Doc: {pacienteSeleccionado.numeroDocumento}
                  {pacienteSeleccionado.numeroHistoriaClinica &&
                    ` · HC: ${pacienteSeleccionado.numeroHistoriaClinica}`}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => {
                  setPacienteSeleccionado(null);
                  setBusquedaPaciente("");
                }}
                sx={{ color: "#6b7280", textTransform: "none", fontSize: 12 }}
              >
                Cambiar
              </Button>
            </Box>
          ) : (
            <Box ref={pacienteRef}>
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
                    startAdornment: buscandoPaciente ? (
                      <CircularProgress size={14} sx={{ mr: 1 }} />
                    ) : (
                      <Search sx={{ fontSize: 16, color: "#9ca3af", mr: 1 }} />
                    ),
                  }}
                />
                {pacientesBuscados.length > 0 && (
                  <Portal>
                    <Paper
                      sx={{
                        position: "fixed",
                        zIndex: 9999,
                        width: pacienteRef.current
                          ? pacienteRef.current.getBoundingClientRect().width
                          : 500,
                        top: pacienteRef.current
                          ? pacienteRef.current.getBoundingClientRect().bottom +
                            4
                          : 200,
                        left: pacienteRef.current
                          ? pacienteRef.current.getBoundingClientRect().left
                          : 100,
                        maxHeight: 240,
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
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {(p.nombreCompletoPaciente || "").trim()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Doc: {p.numeroDocumento}
                          </Typography>
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

      {/* 2. PROCEDIMIENTO Y DATOS GENERALES */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            color="#111827"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <MedicalServices sx={{ fontSize: 16, color: "#6b7280" }} />
            2. Procedimiento y Atención
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" },
              gap: 1.5,
              mb: 2,
            }}
          >
            <TextField
              select
              size="small"
              label="Procedimiento *"
              value={form.procedimiento_ID}
              onChange={(e) => cambiarForm("procedimiento_ID", e.target.value)}
              disabled={cargandoCatalogos}
            >
              <MenuItem value="">— Seleccione —</MenuItem>
              {procedimientos.map((p) => (
                <MenuItem key={p.procedimiento_ID} value={p.procedimiento_ID}>
                  {p.nombre}
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ ml: 0.5, color: "#9ca3af" }}
                  >
                    (Bs. {p.precioProcedmiento})
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Origen del Servicio"
              value={form.origenServicio}
              onChange={(e) => cambiarForm("origenServicio", e.target.value)}
            >
              {["directo", "consultorio", "urgencias", "orden_medica"].map(
                (o) => (
                  <MenuItem key={o} value={o}>
                    {o.replace("_", " ").toUpperCase()}
                  </MenuItem>
                ),
              )}
            </TextField>
            <TextField
              size="small"
              label="Fecha del Servicio"
              type="date"
              value={form.fechaServicio}
              onChange={(e) => cambiarForm("fechaServicio", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
              mb: 2,
            }}
          >
            <TextField
              size="small"
              label="Motivo de Atención *"
              value={form.motivoAtencion}
              onChange={(e) => cambiarForm("motivoAtencion", e.target.value)}
              placeholder="Ej: Inyectable prescrito por médico..."
              multiline
              rows={2}
            />
            <TextField
              size="small"
              label="Observaciones"
              value={form.observaciones}
              onChange={(e) => cambiarForm("observaciones", e.target.value)}
              placeholder="Observaciones adicionales..."
              multiline
              rows={2}
            />
            <TextField
              size="small"
              label="Materiales Utilizados (descripción)"
              value={form.materialesUtilizados}
              onChange={(e) =>
                cambiarForm("materialesUtilizados", e.target.value)
              }
              placeholder="Ej: Guantes, agujas, vendas..."
              sx={{ gridColumn: { sm: "span 2" } }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Signos vitales opcionales */}
          <Typography
            variant="caption"
            fontWeight={700}
            color="#6b7280"
            sx={{ mb: 1.5, display: "block" }}
          >
            SIGNOS VITALES (OPCIONALES)
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr 1fr" },
              gap: 1.5,
              mb: 2,
            }}
          >
            {[
              {
                k: "presionArterial",
                label: "Presión Arterial",
                unit: "mmHg",
                type: "text",
              },
              {
                k: "frecuenciaCardiaca",
                label: "Frec. Cardíaca",
                unit: "lpm",
                type: "number",
              },
              {
                k: "temperatura",
                label: "Temperatura",
                unit: "°C",
                type: "number",
              },
              {
                k: "saturacionOxigeno",
                label: "Saturación O₂",
                unit: "%",
                type: "number",
              },
            ].map(({ k, label, unit, type }) => (
              <TextField
                key={k}
                size="small"
                label={label}
                type={type}
                value={form[k]}
                onChange={(e) => cambiarForm(k, e.target.value)}
                InputProps={{
                  endAdornment: (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap", ml: 0.5, fontWeight: 600 }}
                    >
                      {unit}
                    </Typography>
                  ),
                }}
                inputProps={type === "number" ? { min: 0, step: "any" } : {}}
              />
            ))}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Costos */}
          <Typography
            variant="caption"
            fontWeight={700}
            color="#6b7280"
            sx={{ mb: 1.5, display: "block" }}
          >
            COSTOS
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
              label="Precio Servicio (Bs.)"
              type="number"
              value={form.precioServicio}
              onChange={(e) => cambiarForm("precioServicio", e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
            />
            <TextField
              size="small"
              label="Costo Materiales (Bs.)"
              type="number"
              value={form.costoMateriales}
              InputProps={{ readOnly: true }}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f9fafb" } }}
            />
            <TextField
              size="small"
              label="Costo Total (Bs.)"
              value={form.costoTotal}
              InputProps={{ readOnly: true }}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f9fafb" } }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* BOTONES */}
      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          onClick={handleNuevo}
          sx={{
            borderRadius: 1.5,
            fontWeight: 600,
            textTransform: "none",
            borderColor: "#d1d5db",
            color: "#374151",
          }}
        >
          Limpiar
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
          onClick={handleGuardarServicio}
          disabled={guardando || cargandoCatalogos}
          sx={{ ...addBtn, px: 3 }}
        >
          {guardando ? "Guardando..." : "Guardar Servicio de Enfermería"}
        </Button>
      </Box>
    </Box>
  );
}
