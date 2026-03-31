// src/modules/configuracion/pages/ProcedimientosPage.jsx
// Gestión de Procedimientos/Servicios e Insumos de Enfermería
// Tab 1: Procedimientos (ENFERMERIA / DIAGNOSTICO) — Tab 2: Insumos

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Chip,
  Tab,
  Tabs,
  Drawer,
  Divider,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Close,
  Save,
  MedicalServices,
  Inventory,
  Warning,
  CheckCircle,
  FilterList,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import clinicaApiClient from "../../../services/api/clinicaApiClient";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getUsuarioId = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}").usuario_ID || 1;
  } catch {
    return 1;
  }
};

const ESPECIALIDAD_COLORES = {
  CURACION:     { bg: "#fef3c7", color: "#92400e" },
  CURACIONES:   { bg: "#fef3c7", color: "#92400e" },
  MEDICAMENTOS: { bg: "#dbeafe", color: "#1d4ed8" },
  SOLUCION:     { bg: "#ede9fe", color: "#6d28d9" },
  TERAPEUTICO:  { bg: "#dcfce7", color: "#15803d" },
  VARIOS:       { bg: "#f3f4f6", color: "#374151" },
  ENFERMERIA:   { bg: "#fce7f3", color: "#be185d" },
  TODAS:        { bg: "#ecfdf5", color: "#047857" },
};

const chipEsp = (esp) => {
  const c = ESPECIALIDAD_COLORES[esp] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <Chip
      label={esp}
      size="small"
      sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, fontSize: 10, height: 20 }}
    />
  );
};

// ─── ESTILOS BASE ─────────────────────────────────────────────────────────────
const card = {
  borderRadius: 2,
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
  bgcolor: "white",
};

// ─── DRAWER PROCEDIMIENTO ─────────────────────────────────────────────────────
function ProcedimientoDrawer({ open, onClose, item, especialidades, onSaved }) {
  const { enqueueSnackbar } = useSnackbar();
  const [guardando, setGuardando] = useState(false);
  const esNuevo = !item?.procedimiento_ID;
  const esDiagnostico = item?.categoria === "DIAGNOSTICO";

  const [form, setForm] = useState({
    servicio_ID: 0,
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "ENFERMERIA",
    especialidad: "",
    precioBase: "",
    costoMaterialPromedio: 0,
    requiereEnfermera: true,
    requiereMedico: false,
    esServicioEnfermeria: true,
    activo: true,
    // Solo DIAGNOSTICO
    requiereQuirofano: false,
    requiereAnestesia: false,
    requiereHospitalizacion: false,
    duracionEstimada: 0,
  });

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm({
        servicio_ID: item.procedimiento_ID || 0,
        codigo: item.codigo || "",
        nombre: item.nombre || "",
        descripcion: item.descripcion === "-" ? "" : (item.descripcion || ""),
        categoria: item.categoria || "ENFERMERIA",
        especialidad: item.especialidad || "",
        precioBase: item.precioBase ?? "",
        costoMaterialPromedio: item.costoMaterialPromedio ?? 0,
        requiereEnfermera: item.requiereEnfermera ?? true,
        requiereMedico: item.requiereMedico ?? false,
        esServicioEnfermeria: item.esServicioEnfermeria ?? true,
        activo: item.activo ?? true,
        requiereQuirofano: item.requiereQuirofano ?? false,
        requiereAnestesia: item.requiereAnestesia ?? false,
        requiereHospitalizacion: item.requiereHospitalizacion ?? false,
        duracionEstimada: item.duracionEstimada ?? 0,
      });
    } else {
      setForm({
        servicio_ID: 0,
        codigo: "",
        nombre: "",
        descripcion: "",
        categoria: "ENFERMERIA",
        especialidad: "",
        precioBase: "",
        costoMaterialPromedio: 0,
        requiereEnfermera: true,
        requiereMedico: false,
        esServicioEnfermeria: true,
        activo: true,
        requiereQuirofano: false,
        requiereAnestesia: false,
        requiereHospitalizacion: false,
        duracionEstimada: 0,
      });
    }
  }, [open, item]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      enqueueSnackbar("El nombre es obligatorio", { variant: "error" });
      return;
    }
    if (!form.especialidad) {
      enqueueSnackbar("Seleccione una especialidad", { variant: "error" });
      return;
    }
    if (form.precioBase === "" || isNaN(Number(form.precioBase))) {
      enqueueSnackbar("Ingrese un precio base válido", { variant: "error" });
      return;
    }

    setGuardando(true);
    try {
      const esDiag = form.categoria === "DIAGNOSTICO";
      const endpoint = esDiag
        ? "/GestionServicios/ActualizarServicioMedicina"
        : "/GestionServicios/ActualizarServicioEnfermeria";

      const payload = {
        servicio_ID: form.servicio_ID,
        codigo: form.codigo || "AUTO",
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || "-",
        categoria: form.categoria,
        especialidad: form.especialidad,
        precioBase: Number(form.precioBase),
        costoMaterialPromedio: Number(form.costoMaterialPromedio) || 0,
        requiereEnfermera: form.requiereEnfermera,
        requiereMedico: form.requiereMedico,
        esServicioEnfermeria: form.esServicioEnfermeria,
        activo: form.activo,
        usuarioRegistroAlta: getUsuarioId(),
        ...(esDiag ? {
          requiereQuirofano: form.requiereQuirofano,
          requiereAnestesia: form.requiereAnestesia,
          requiereHospitalizacion: form.requiereHospitalizacion,
          duracionEstimada: Number(form.duracionEstimada) || 0,
        } : {}),
      };

      const res = await clinicaApiClient.post(endpoint, payload);
      if (res.data.exitoso) {
        enqueueSnackbar(
          esNuevo ? "✅ Procedimiento creado" : "✅ Procedimiento actualizado",
          { variant: "success" }
        );
        onSaved();
        onClose();
      } else {
        enqueueSnackbar(res.data.mensaje || "Error al guardar", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error al guardar", { variant: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const isDiag = form.categoria === "DIAGNOSTICO";

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 480 }, p: 0 } }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2,
        bgcolor: isDiag ? "#1e40af" : "#065f46",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box>
          <Typography variant="body1" fontWeight={700} color="white">
            {esNuevo ? "Nuevo Procedimiento" : "Editar Procedimiento"}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {isDiag ? "Categoría: DIAGNÓSTICO" : "Categoría: ENFERMERÍA"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ p: 3, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>

        {/* Categoría */}
        <TextField
          select size="small" fullWidth label="Categoría"
          value={form.categoria}
          onChange={(e) => set("categoria", e.target.value)}
        >
          <MenuItem value="ENFERMERIA">ENFERMERÍA</MenuItem>
          <MenuItem value="DIAGNOSTICO">DIAGNÓSTICO</MenuItem>
        </TextField>

        {/* Código */}
        <TextField
          size="small" fullWidth label="Código"
          value={form.codigo}
          onChange={(e) => set("codigo", e.target.value.toUpperCase())}
          placeholder="Ej: ENF-001 (opcional, se auto-asigna)"
          helperText="Dejar vacío para auto-asignar"
        />

        {/* Nombre */}
        <TextField
          size="small" fullWidth label="Nombre *"
          value={form.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          placeholder="Ej: Curación pequeña"
        />

        {/* Descripción */}
        <TextField
          size="small" fullWidth label="Descripción"
          value={form.descripcion}
          onChange={(e) => set("descripcion", e.target.value)}
          multiline rows={2}
          placeholder="Descripción del procedimiento..."
        />

        {/* Especialidad */}
        <TextField
          select size="small" fullWidth label="Especialidad *"
          value={form.especialidad}
          onChange={(e) => set("especialidad", e.target.value)}
        >
          <MenuItem value="">— Seleccione —</MenuItem>
          {especialidades.map((e) => (
            <MenuItem key={e} value={e}>{e}</MenuItem>
          ))}
        </TextField>

        {/* Precios */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <TextField
            size="small" label="Precio Base (Bs.) *" type="number"
            value={form.precioBase}
            onChange={(e) => set("precioBase", e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            size="small" label="Costo Material (Bs.)" type="number"
            value={form.costoMaterialPromedio}
            onChange={(e) => set("costoMaterialPromedio", e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Box>

        {/* Duración - solo DIAGNOSTICO */}
        {isDiag && (
          <TextField
            size="small" fullWidth label="Duración Estimada (min)" type="number"
            value={form.duracionEstimada}
            onChange={(e) => set("duracionEstimada", e.target.value)}
            inputProps={{ min: 0 }}
          />
        )}

        <Divider />

        {/* Switches */}
        <Typography variant="caption" fontWeight={700} color="#6b7280">
          REQUISITOS
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <FormControlLabel
            control={<Switch checked={form.requiereEnfermera} onChange={(e) => set("requiereEnfermera", e.target.checked)} size="small" />}
            label={<Typography variant="body2">Requiere Enfermera</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={form.requiereMedico} onChange={(e) => set("requiereMedico", e.target.checked)} size="small" />}
            label={<Typography variant="body2">Requiere Médico</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={form.esServicioEnfermeria} onChange={(e) => set("esServicioEnfermeria", e.target.checked)} size="small" />}
            label={<Typography variant="body2">Es Servicio de Enfermería</Typography>}
          />

          {/* Extra DIAGNOSTICO */}
          {isDiag && (
            <>
              <FormControlLabel
                control={<Switch checked={form.requiereQuirofano} onChange={(e) => set("requiereQuirofano", e.target.checked)} size="small" />}
                label={<Typography variant="body2">Requiere Quirófano</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={form.requiereAnestesia} onChange={(e) => set("requiereAnestesia", e.target.checked)} size="small" />}
                label={<Typography variant="body2">Requiere Anestesia</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={form.requiereHospitalizacion} onChange={(e) => set("requiereHospitalizacion", e.target.checked)} size="small" />}
                label={<Typography variant="body2">Requiere Hospitalización</Typography>}
              />
            </>
          )}

          <FormControlLabel
            control={<Switch checked={form.activo} onChange={(e) => set("activo", e.target.checked)} size="small" color="success" />}
            label={<Typography variant="body2">Activo</Typography>}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e5e7eb", display: "flex", gap: 1.5 }}>
        <Button
          fullWidth variant="outlined" onClick={onClose} disabled={guardando}
          sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: "none", borderColor: "#d1d5db", color: "#374151" }}
        >
          Cancelar
        </Button>
        <Button
          fullWidth variant="contained"
          startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <Save />}
          onClick={handleGuardar}
          disabled={guardando}
          sx={{
            borderRadius: 1.5, fontWeight: 700, textTransform: "none", boxShadow: "none",
            bgcolor: isDiag ? "#1e40af" : "#065f46",
            "&:hover": { bgcolor: isDiag ? "#1d4ed8" : "#047857" },
          }}
        >
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </Box>
    </Drawer>
  );
}

// ─── DRAWER INSUMO ─────────────────────────────────────────────────────────────
function InsumoDrawer({ open, onClose, item, onSaved }) {
  const { enqueueSnackbar } = useSnackbar();
  const [guardando, setGuardando] = useState(false);
  const esNuevo = !item?.producto_ID;

  const [form, setForm] = useState({
    producto_ID: 0,
    codigoProducto: "",
    nombreProducto: "",
    descripcion: "",
    categoria: "ENFERMERIA",
    unidadMedida: "UNIDAD",
    cantidad: "",
    cantidadMinimo: "",
    precioBase: "",
    activo: true,
  });

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm({
        producto_ID: item.producto_ID || 0,
        codigoProducto: item.codigoProducto || "",
        nombreProducto: item.nombre || "",
        descripcion: item.descripcion || "",
        categoria: item.categoria || "ENFERMERIA",
        unidadMedida: item.unidadMedida || "UNIDAD",
        cantidad: item.stockActual ?? "",
        cantidadMinimo: item.stockMinimo ?? "",
        precioBase: item.precioReferencia ?? "",
        activo: true,
      });
    } else {
      setForm({
        producto_ID: 0,
        codigoProducto: "",
        nombreProducto: "",
        descripcion: "",
        categoria: "ENFERMERIA",
        unidadMedida: "UNIDAD",
        cantidad: "",
        cantidadMinimo: "",
        precioBase: "",
        activo: true,
      });
    }
  }, [open, item]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleGuardar = async () => {
    if (!form.nombreProducto.trim()) {
      enqueueSnackbar("El nombre es obligatorio", { variant: "error" });
      return;
    }
    if (form.precioBase === "" || isNaN(Number(form.precioBase))) {
      enqueueSnackbar("Ingrese un precio válido", { variant: "error" });
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        producto_ID: form.producto_ID,
        codigoProducto: form.codigoProducto || "AUTO",
        nombreProducto: form.nombreProducto.trim(),
        descripcion: form.descripcion.trim() || "-",
        categoria: form.categoria,
        unidadMedida: form.unidadMedida,
        cantidad: Number(form.cantidad) || 0,
        cantidadMinimo: Number(form.cantidadMinimo) || 0,
        precioBase: Number(form.precioBase),
        activo: form.activo,
        usuarioRegistroAlta: getUsuarioId(),
      };

      const res = await clinicaApiClient.post(
        "/GestionServicios/ActualizarInsumoEnfermeria",
        payload
      );
      if (res.data.exitoso) {
        enqueueSnackbar(
          esNuevo ? "✅ Insumo creado" : "✅ Insumo actualizado",
          { variant: "success" }
        );
        onSaved();
        onClose();
      } else {
        enqueueSnackbar(res.data.mensaje || "Error al guardar", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error al guardar", { variant: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const UNIDADES = ["UNIDAD", "CAJA", "FRASCO", "ROLLO", "PAR", "PAQUETE", "ML", "GRAMO"];

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 440 }, p: 0 } }}
    >
      <Box sx={{
        px: 3, py: 2, bgcolor: "#7c3aed",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box>
          <Typography variant="body1" fontWeight={700} color="white">
            {esNuevo ? "Nuevo Insumo" : "Editar Insumo"}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Insumo de Enfermería
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          size="small" fullWidth label="Código"
          value={form.codigoProducto}
          onChange={(e) => set("codigoProducto", e.target.value.toUpperCase())}
          placeholder="Ej: INS-0001"
          helperText="Dejar vacío para auto-asignar"
        />
        <TextField
          size="small" fullWidth label="Nombre *"
          value={form.nombreProducto}
          onChange={(e) => set("nombreProducto", e.target.value)}
          placeholder="Ej: Jeringa descartable"
        />
        <TextField
          size="small" fullWidth label="Descripción"
          value={form.descripcion}
          onChange={(e) => set("descripcion", e.target.value)}
          multiline rows={2}
        />
        <TextField
          select size="small" fullWidth label="Unidad de Medida"
          value={form.unidadMedida}
          onChange={(e) => set("unidadMedida", e.target.value)}
        >
          {UNIDADES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
        </TextField>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
          <TextField
            size="small" label="Stock Actual" type="number"
            value={form.cantidad}
            onChange={(e) => set("cantidad", e.target.value)}
            inputProps={{ min: 0 }}
          />
          <TextField
            size="small" label="Stock Mínimo" type="number"
            value={form.cantidadMinimo}
            onChange={(e) => set("cantidadMinimo", e.target.value)}
            inputProps={{ min: 0 }}
          />
          <TextField
            size="small" label="Precio (Bs.) *" type="number"
            value={form.precioBase}
            onChange={(e) => set("precioBase", e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Box>

        <FormControlLabel
          control={<Switch checked={form.activo} onChange={(e) => set("activo", e.target.checked)} size="small" color="success" />}
          label={<Typography variant="body2">Activo</Typography>}
        />
      </Box>

      <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e5e7eb", display: "flex", gap: 1.5 }}>
        <Button
          fullWidth variant="outlined" onClick={onClose} disabled={guardando}
          sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: "none", borderColor: "#d1d5db", color: "#374151" }}
        >
          Cancelar
        </Button>
        <Button
          fullWidth variant="contained"
          startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <Save />}
          onClick={handleGuardar}
          disabled={guardando}
          sx={{
            borderRadius: 1.5, fontWeight: 700, textTransform: "none", boxShadow: "none",
            bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" },
          }}
        >
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </Box>
    </Drawer>
  );
}

// ─── TAB PROCEDIMIENTOS ────────────────────────────────────────────────────────
function TabProcedimientos() {
  const [categorias] = useState(["ENFERMERIA", "DIAGNOSTICO"]);
  const [especialidades, setEspecialidades] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("ENFERMERIA");
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  // Cargar especialidades una vez
  useEffect(() => {
    clinicaApiClient
      .get("/GestionServicios/ListaEspecialidades")
      .then((r) => setEspecialidades(r.data.datos || []))
      .catch(() => {});
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await clinicaApiClient.get(
        `/GestionServicios/BuscarProductoServicio?TipoServicio=${filtroCategoria}`
      );
      setItems(res.data.datos || []);
    } catch {
      setItems([]);
    } finally {
      setCargando(false);
    }
  }, [filtroCategoria]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const itemsFiltrados = items.filter((i) =>
    !filtroBusqueda ||
    i.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    i.codigo.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    i.especialidad.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  const handleNuevo = () => {
    setItemSeleccionado(null);
    setDrawerOpen(true);
  };

  const handleEditar = (item) => {
    setItemSeleccionado(item);
    setDrawerOpen(true);
  };

  return (
    <Box>
      {/* Filtros */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              select size="small" label="Categoría" value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {categorias.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>

            <TextField
              size="small" label="Buscar" value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              placeholder="Nombre, código o especialidad..."
              sx={{ flex: 1, minWidth: 200 }}
              InputProps={{
                startAdornment: <Search sx={{ fontSize: 16, color: "#9ca3af", mr: 1 }} />,
                endAdornment: filtroBusqueda ? (
                  <IconButton size="small" onClick={() => setFiltroBusqueda("")}>
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                ) : null,
              }}
            />

            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleNuevo}
                sx={{
                  bgcolor: filtroCategoria === "DIAGNOSTICO" ? "#1e40af" : "#065f46",
                  "&:hover": { bgcolor: filtroCategoria === "DIAGNOSTICO" ? "#1d4ed8" : "#047857" },
                  borderRadius: 1.5, fontWeight: 700, textTransform: "none", boxShadow: "none",
                }}
              >
                Nuevo Procedimiento
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card sx={card}>
        <CardContent sx={{ p: 0 }}>
          {/* Header tabla */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 1.2fr 110px 100px 80px 80px 60px",
            bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb",
            px: 2, py: 1.25,
          }}>
            {["Código", "Nombre", "Especialidad", "Precio Base", "Requisitos", "Enf.", "Méd.", ""].map((h) => (
              <Typography key={h} variant="caption" sx={{
                fontWeight: 700, color: "#6b7280", textTransform: "uppercase", fontSize: 10,
              }}>{h}</Typography>
            ))}
          </Box>

          {cargando ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : itemsFiltrados.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {filtroBusqueda ? "Sin resultados para la búsqueda" : "Sin procedimientos registrados"}
              </Typography>
            </Box>
          ) : (
            itemsFiltrados.map((item, idx) => (
              <Box
                key={item.procedimiento_ID}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 1.2fr 110px 100px 80px 80px 60px",
                  px: 2, py: 1.25, alignItems: "center",
                  borderBottom: idx < itemsFiltrados.length - 1 ? "1px solid #f3f4f6" : "none",
                  "&:hover": { bgcolor: "#f9fafb" },
                }}
              >
                <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#6b7280" }}>
                  {item.codigo}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#111827" sx={{ pr: 1 }}>
                  {item.nombre}
                </Typography>
                <Box>{chipEsp(item.especialidad)}</Box>
                <Typography variant="body2" fontWeight={700} color="#2563eb">
                  Bs. {item.precioBase?.toFixed(2)}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {item.requiereQuirofano && (
                    <Chip label="Quirófano" size="small" sx={{ height: 16, fontSize: 9, bgcolor: "#fef3c7", color: "#92400e" }} />
                  )}
                  {item.requiereAnestesia && (
                    <Chip label="Anestesia" size="small" sx={{ height: 16, fontSize: 9, bgcolor: "#fce7f3", color: "#be185d" }} />
                  )}
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  {item.requiereEnfermera ? (
                    <CheckCircle sx={{ fontSize: 16, color: "#16a34a" }} />
                  ) : (
                    <Box sx={{ width: 16 }} />
                  )}
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  {item.requiereMedico ? (
                    <CheckCircle sx={{ fontSize: 16, color: "#2563eb" }} />
                  ) : (
                    <Box sx={{ width: 16 }} />
                  )}
                </Box>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => handleEditar(item)} sx={{ color: "#6b7280" }}>
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Contador */}
      {!cargando && itemsFiltrados.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {itemsFiltrados.length} procedimiento(s) · categoría {filtroCategoria}
        </Typography>
      )}

      <ProcedimientoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        item={itemSeleccionado}
        especialidades={especialidades}
        onSaved={cargar}
      />
    </Box>
  );
}

// ─── TAB INSUMOS ───────────────────────────────────────────────────────────────
function TabInsumos() {
  const [insumos, setInsumos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await clinicaApiClient.get("/GestionServicios/ListaInsumosEnfermeria");
      setInsumos(res.data.datos || []);
    } catch {
      setInsumos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const insumosFiltrados = insumos.filter((i) =>
    !filtroBusqueda ||
    i.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    i.codigoProducto.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  const stockBajo = insumos.filter((i) => i.stockActual <= i.stockMinimo).length;

  return (
    <Box>
      {/* Alerta stock bajo */}
      {stockBajo > 0 && (
        <Alert
          severity="warning"
          icon={<Warning />}
          sx={{ mb: 2, borderRadius: 1.5, border: "1px solid #fcd34d", bgcolor: "#fffbeb" }}
        >
          <Typography variant="body2" fontWeight={700}>
            {stockBajo} insumo(s) con stock bajo o en mínimo
          </Typography>
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ ...card, mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <TextField
              size="small" label="Buscar insumo" value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              placeholder="Nombre o código..."
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <Search sx={{ fontSize: 16, color: "#9ca3af", mr: 1 }} />,
                endAdornment: filtroBusqueda ? (
                  <IconButton size="small" onClick={() => setFiltroBusqueda("")}>
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                ) : null,
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => { setItemSeleccionado(null); setDrawerOpen(true); }}
              sx={{
                bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" },
                borderRadius: 1.5, fontWeight: 700, textTransform: "none", boxShadow: "none",
              }}
            >
              Nuevo Insumo
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card sx={card}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 1fr 100px 90px 90px 90px 60px",
            bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb",
            px: 2, py: 1.25,
          }}>
            {["Código", "Nombre", "Descripción", "Unidad", "Stock Act.", "Stock Mín.", "Precio Ref.", ""].map((h) => (
              <Typography key={h} variant="caption" sx={{
                fontWeight: 700, color: "#6b7280", textTransform: "uppercase", fontSize: 10,
              }}>{h}</Typography>
            ))}
          </Box>

          {cargando ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : insumosFiltrados.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                Sin insumos registrados
              </Typography>
            </Box>
          ) : (
            insumosFiltrados.map((ins, idx) => {
              const stockCritico = ins.stockActual <= ins.stockMinimo;
              return (
                <Box
                  key={ins.producto_ID}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr 1fr 100px 90px 90px 90px 60px",
                    px: 2, py: 1.25, alignItems: "center",
                    borderBottom: idx < insumosFiltrados.length - 1 ? "1px solid #f3f4f6" : "none",
                    "&:hover": { bgcolor: "#f9fafb" },
                    bgcolor: stockCritico ? "#fffbeb" : "white",
                  }}
                >
                  <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#6b7280" }}>
                    {ins.codigoProducto}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#111827">
                    {ins.nombre}
                  </Typography>
                  <Typography variant="caption" color="#6b7280" noWrap sx={{ pr: 1 }}>
                    {ins.descripcion}
                  </Typography>
                  <Chip
                    label={ins.unidadMedida}
                    size="small"
                    sx={{ bgcolor: "#f3f4f6", color: "#374151", fontWeight: 600, fontSize: 10, height: 20 }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {stockCritico && <Warning sx={{ fontSize: 14, color: "#d97706" }} />}
                    <Typography variant="body2" fontWeight={700}
                      color={stockCritico ? "#d97706" : "#111827"}>
                      {ins.stockActual}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="#6b7280">
                    {ins.stockMinimo}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#7c3aed">
                    Bs. {ins.precioReferencia?.toFixed(2)}
                  </Typography>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => { setItemSeleccionado(ins); setDrawerOpen(true); }}
                      sx={{ color: "#6b7280" }}
                    >
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            })
          )}
        </CardContent>
      </Card>

      {!cargando && insumosFiltrados.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {insumosFiltrados.length} insumo(s) · {stockBajo} con stock bajo
        </Typography>
      )}

      <InsumoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        item={itemSeleccionado}
        onSaved={cargar}
      />
    </Box>
  );
}

// ─── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────
export default function ProcedimientosPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#111827">
          Configuración — Procedimientos e Insumos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestión de procedimientos médicos/enfermería e insumos del inventario
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: "1px solid #e5e7eb", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.9rem" },
            "& .Mui-selected": { color: "#111827" },
            "& .MuiTabs-indicator": { bgcolor: "#111827", height: 2 },
          }}
        >
          <Tab
            icon={<MedicalServices sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Procedimientos / Servicios"
          />
          <Tab
            icon={<Inventory sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Insumos de Enfermería"
          />
        </Tabs>
      </Box>

      {tab === 0 && <TabProcedimientos />}
      {tab === 1 && <TabInsumos />}
    </Box>
  );
}