// src/modules/facturacion/pages/FacturacionPage.jsx
// Página de Emisión de Facturas SIAT — CLINICA DINAMAX
// Sector 17 (Hospitales/Clínicas): campos médicos obligatorios por detalle
// Métodos de pago permitidos: EFECTIVO(1), GIFT-CARD(27), OTROS-GIFT-CARD(33), EFECTIVO-GIFT-CARD(35)

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Divider,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  Tooltip,
  Collapse,
  LinearProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import {
  Add,
  Delete,
  Receipt,
  Search,
  MedicalServices,
  CheckCircle,
  Warning,
  CloudOff,
  Wifi,
  WifiOff,
  ExpandMore,
  ExpandLess,
  Print,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import useSiatStatus from "../hooks/useSiatStatus";
import NitValidationModal from "../components/facturas/NitValidationModal";
import ActivityValidationModal from "../components/facturas/ActivityValidationModal";
import {
  facturacionService,
  siatService,
  medicoService,
  productoService,
  configuracionService,
  imprimirFactura,
} from "../../../services/api/facturacionServices";

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const METODOS_PAGO_PERMITIDOS = [1, 27, 33, 35];
const CODIGO_ACTIVIDAD_CLINICA = "8620500";

const DETALLE_VACIO = () => ({
  _id: Date.now() + Math.random(),
  codigoProducto: "",
  codigoProductoSin: "",
  descripcion: "",
  cantidad: 1,
  unidadMedida: 62,
  precioUnitario: "",
  montoDescuento: 0,
  especialidad: "",
  especialidadDetalle: "",
  nroQuirofanoSalaOperaciones: "",
  especialidadMedico: "",
  nombreApellidoMedico: "",
  nitDocumentoMedico: "",
  nroMatriculaMedico: "",
  nroFacturaMedico: "",
  _producto: null,
  _showMedico: false,
});

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function FacturacionPage() {
  const { enqueueSnackbar } = useSnackbar();
  const {
    siatOnline,
    eventoActivo,
    isContingencia,
    loading: siatLoading,
    refresh,
  } = useSiatStatus(0, 0);

  // Sector
  const [sector, setSector] = useState(17);

  // Catálogos
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [formatoPdf, setFormatoPdf] = useState("normal");
  const [catalogosLoading, setCatalogosLoading] = useState(true);

  // Búsqueda de productos
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productosBuscados, setProductosBuscados] = useState([]);
  const [buscandoProducto, setBuscandoProducto] = useState(false);

  // Tipo de cliente
  const [tipoCliente, setTipoCliente] = useState("normal");

  // Formulario cliente
  const [tipoDocumento, setTipoDocumento] = useState(5);
  const [nitCliente, setNitCliente] = useState("");
  const [complemento, setComplemento] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [direccionCliente, setDireccionCliente] = useState("");

  // Modalidad / Médico (Sector 17)
  const [modalidadServicio, setModalidadServicio] = useState("");
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);

  // Método de pago
  const [metodoPago, setMetodoPago] = useState(1);
  const [montoPagado, setMontoPagado] = useState("");
  const [montoGiftCard, setMontoGiftCard] = useState("");
  const [descuentoAdicional, setDescuentoAdicional] = useState(0);

  // Contingencia
  const [nroFacturaTalonario, setNroFacturaTalonario] = useState("");
  const [fechaContingencia, setFechaContingencia] = useState("");
  const [horaContingencia, setHoraContingencia] = useState("");

  // Detalle
  const [detalles, setDetalles] = useState([]);

  // Emisión
  const [emitiendo, setEmitiendo] = useState(false);
  const [facturaEmitida, setFacturaEmitida] = useState(null);

  // Modales
  const [nitModal, setNitModal] = useState({ open: false });
  const [actividadModal, setActividadModal] = useState({ open: false });
  const pendingRequestRef = useRef(null);

  // Formulario manual
  const [showManual, setShowManual] = useState(false);
  const [productoManual, setProductoManual] = useState({
    codigoProducto: "",
    descripcion: "",
    cantidad: 1,
    precioUnitario: "",
    montoDescuento: 0,
  });

  // ─── CARGA DE CATÁLOGOS ───────────────────────────────────────────────────
  useEffect(() => {
    const cargarCatalogos = async () => {
      setCatalogosLoading(true);
      try {
        const [docs, pagos, med, mod, formato] = await Promise.all([
          siatService.getTiposDocumentoIdentidad().catch(() => []),
          siatService.getMetodosPago().catch(() => []),
          medicoService.obtenerMedicos().catch(() => []),
          medicoService.obtenerModalidades().catch(() => []),
          configuracionService
            .obtenerFormatoPdfEmail()
            .catch(() => ({ formatoPdf: "normal" })),
        ]);
        setTiposDocumento(docs);
        setMetodosPago(
          pagos.filter((m) =>
            METODOS_PAGO_PERMITIDOS.includes(m.codigoClasificador),
          ),
        );
        setMedicos(med);
        setModalidades(mod);
        setFormatoPdf(formato.formatoPdf || "normal");
      } catch {
        enqueueSnackbar("Error cargando catálogos", { variant: "warning" });
      } finally {
        setCatalogosLoading(false);
      }
    };
    cargarCatalogos();
  }, []);

  // Médicos filtrados por modalidad
  const medicosPorModalidad = modalidadServicio
    ? medicos.filter((m) =>
        m.modalidades?.some((mod) => mod.descripcion === modalidadServicio),
      )
    : medicos;

  // ─── TIPO DE CLIENTE ──────────────────────────────────────────────────────
  const handleTipoClienteChange = (tipo) => {
    setTipoCliente(tipo);
    if (tipo === "control_tributario") {
      setNitCliente("99002");
      setRazonSocial("CONTROL TRIBUTARIO");
    } else if (tipo === "ventas_menores") {
      setNitCliente("99003");
      setRazonSocial("VENTAS MENORES DEL DIA");
    } else if (tipo === "caso_especial") {
      setNitCliente("99001");
      setRazonSocial("");
    } else {
      setNitCliente("");
      setRazonSocial("");
    }
  };

  // ─── BÚSQUEDA DE PRODUCTOS ────────────────────────────────────────────────
  const buscarProductos = useCallback(async (keyword) => {
    if (!keyword || keyword.length < 2) {
      setProductosBuscados([]);
      return;
    }
    setBuscandoProducto(true);
    try {
      setProductosBuscados(await productoService.buscarProductos(keyword));
    } catch {
      setProductosBuscados([]);
    } finally {
      setBuscandoProducto(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => buscarProductos(busquedaProducto), 400);
    return () => clearTimeout(t);
  }, [busquedaProducto, buscarProductos]);

  // ─── DETALLE ──────────────────────────────────────────────────────────────
  const agregarProducto = (producto, detalleId) => {
    const actividadExistente = detalles.find(
      (d) => d.codigoProductoSin && d._id !== detalleId,
    )?._producto?.codigoActividad;
    if (actividadExistente && actividadExistente !== producto.codigoActividad) {
      setActividadModal({
        open: true,
        actividadExistente,
        actividadNueva: producto.codigoActividad,
        productoConflicto: producto.descripcion,
      });
      return;
    }
    setDetalles((prev) =>
      prev.map((d) =>
        d._id === detalleId
          ? {
              ...d,
              codigoProducto:
                producto.codigoProd || producto.codigoProducto || "",
              codigoProductoSin: producto.codigoProductoSin || "",
              descripcion: producto.descripcion || "",
              precioUnitario: producto.precio || "",
              _producto: producto,
              ...(medicoSeleccionado && sector === 17
                ? {
                    nombreApellidoMedico:
                      medicoSeleccionado.nombreCompleto || "",
                    nitDocumentoMedico: String(
                      medicoSeleccionado.nitDocumento || "",
                    ),
                    especialidadMedico:
                      medicoSeleccionado.especialidadMedico || "",
                    nroMatriculaMedico: medicoSeleccionado.nroMatricula || "",
                    nroQuirofanoSalaOperaciones: String(
                      medicoSeleccionado.nroQuirofanoSalaOperaciones || "",
                    ),
                  }
                : {}),
            }
          : d,
      ),
    );
    setBusquedaProducto("");
    setProductosBuscados([]);
  };

  const actualizarDetalle = (id, campo, valor) =>
    setDetalles((prev) =>
      prev.map((d) => (d._id === id ? { ...d, [campo]: valor } : d)),
    );

  const agregarFila = () => setDetalles((prev) => [...prev, DETALLE_VACIO()]);
  const eliminarFila = (id) => {
    setDetalles((prev) => prev.filter((d) => d._id !== id));
  };

  // ─── CÁLCULOS ─────────────────────────────────────────────────────────────
  const calcularSubtotal = (d) =>
    Math.max(
      0,
      (parseFloat(d.cantidad) || 0) * (parseFloat(d.precioUnitario) || 0) -
        (parseFloat(d.montoDescuento) || 0),
    );

  const montoTotal = detalles.reduce((sum, d) => sum + calcularSubtotal(d), 0);
  const montoConDescuento = Math.max(
    0,
    montoTotal - (parseFloat(descuentoAdicional) || 0),
  );

  // ─── VALIDACIONES ─────────────────────────────────────────────────────────
  const validar = () => {
    if (!nitCliente) return "El NIT/CI del cliente es obligatorio";
    if (!razonSocial) return "La razón social del cliente es obligatoria";
    if (detalles.every((d) => !d.descripcion))
      return "Debe agregar al menos un producto o servicio";
    if (sector === 17) {
      for (const d of detalles) {
        if (!d.descripcion) continue;
        if (!d.nroQuirofanoSalaOperaciones)
          return `Fila "${d.descripcion}": Nro. Quirófano/Sala es obligatorio`;
        if (!d.nombreApellidoMedico)
          return `Fila "${d.descripcion}": Nombre del médico es obligatorio`;
        if (!d.nitDocumentoMedico)
          return `Fila "${d.descripcion}": NIT/CI del médico es obligatorio`;
      }
    }
    if (isContingencia) {
      if (!nroFacturaTalonario)
        return "Nro. de factura del talonario es obligatorio";
      if (!fechaContingencia) return "Fecha de la factura es obligatoria";
      if (!horaContingencia) return "Hora de la factura es obligatoria";
    }
    return null;
  };

  // ─── CONSTRUIR REQUEST ────────────────────────────────────────────────────
  const construirRequest = (codigoExcepcion = null) => {
    const request = {
      sucursalId: 0,
      puntoVentaId: 0,
      nitCliente: String(nitCliente),
      razonSocialCliente: razonSocial,
      complementoCliente: complemento || null,
      tipoDocumentoIdentidad: tipoDocumento,
      emailCliente: emailCliente || null,
      direccionCliente: direccionCliente || null,
      codigoDocumentoSector: sector,
      codigoActividad: CODIGO_ACTIVIDAD_CLINICA,
      tipoMetodoPago: metodoPago,
      montoPagadoEfectivo: [1, 35].includes(metodoPago)
        ? parseFloat(montoPagado) || montoConDescuento
        : 0,
      montoPagadoTarjeta: 0,
      montoGiftCard: [27, 33, 35].includes(metodoPago)
        ? parseFloat(montoGiftCard) || 0
        : 0,
      descuentoAdicional: parseFloat(descuentoAdicional) || 0,
      detalles: detalles
        .filter((d) => d.descripcion)
        .map((d, i) => ({
          numeroLinea: i + 1,
          codigoProducto: d.codigoProducto || null,
          codigoProductoSin: d.codigoProductoSin || "",
          codigoActividad: CODIGO_ACTIVIDAD_CLINICA,
          descripcion: d.descripcion,
          cantidad: parseFloat(d.cantidad) || 1,
          unidadMedida: d.unidadMedida || 62,
          precioUnitario: parseFloat(d.precioUnitario) || 0,
          montoDescuento: parseFloat(d.montoDescuento) || 0,
          ...(sector === 17
            ? {
                nroQuirofanoSalaOperaciones:
                  parseInt(d.nroQuirofanoSalaOperaciones) || null,
                especialidadMedico: d.especialidadMedico || null,
                nombreApellidoMedico: d.nombreApellidoMedico || null,
                nitDocumentoMedico: d.nitDocumentoMedico
                  ? String(d.nitDocumentoMedico)
                  : null,
                nroMatriculaMedico: d.nroMatriculaMedico || null,
                nroFacturaMedico: d.nroFacturaMedico || null,
                especialidad: d.especialidad || null,
                especialidadDetalle: d.especialidadDetalle || null,
              }
            : {}),
        })),
    };
    if (isContingencia) {
      request.nroFacturaTalonario = parseInt(nroFacturaTalonario);
      request.fechaEmisionContingencia = `${fechaContingencia}T${horaContingencia}:00`;
      request.codigoEvento = eventoActivo?.eventoId;
    }
    if (codigoExcepcion) request.codigoExcepcion = codigoExcepcion;
    if (medicoSeleccionado && sector === 17)
      request.modalidadServicio = modalidadServicio || null;
    return request;
  };

  // ─── EMITIR FACTURA ───────────────────────────────────────────────────────
  const emitirFactura = async (codigoExcepcion = null) => {
    const error = validar();
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      return;
    }
    setEmitiendo(true);
    try {
      const factura = await facturacionService.emitirFactura(
        construirRequest(codigoExcepcion),
        1,
      );
      setFacturaEmitida(factura);
      enqueueSnackbar(
        isContingencia
          ? "✅ Factura guardada en contingencia"
          : "✅ Factura emitida correctamente",
        { variant: "success" },
      );
      try {
        await imprimirFactura(factura.id, formatoPdf);
      } catch {}
    } catch (err) {
      if (err.code === "INVALID_NIT") {
        pendingRequestRef.current = codigoExcepcion;
        setNitModal({ open: true });
      } else {
        enqueueSnackbar(err.message || "Error al emitir factura", {
          variant: "error",
          autoHideDuration: 6000,
        });
      }
    } finally {
      setEmitiendo(false);
    }
  };

  const handleContinuarConExcepcion = () => {
    setNitModal({ open: false });
    emitirFactura(1);
  };

  const limpiarFormulario = () => {
    setFacturaEmitida(null);
    setNitCliente("");
    setRazonSocial("");
    setComplemento("");
    setEmailCliente("");
    setDireccionCliente("");
    setMontoPagado("");
    setMontoGiftCard("");
    setDescuentoAdicional(0);
    setMetodoPago(1);
    setModalidadServicio("");
    setMedicoSeleccionado(null);
    setNroFacturaTalonario("");
    setFechaContingencia("");
    setHoraContingencia("");
    setDetalles([]);
    setTipoCliente("normal");
  };

  const usarFechaActual = () => {
    const now = new Date();
    setFechaContingencia(now.toISOString().split("T")[0]);
    setHoraContingencia(now.toTimeString().slice(0, 5));
  };

  // ─── RENDER: FACTURA EXITOSA ──────────────────────────────────────────────
  if (facturaEmitida) {
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
              {isContingencia ? "Factura en Contingencia" : "¡Factura Emitida!"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isContingencia
                ? "Se enviará al SIAT al cerrar la contingencia"
                : "Validada y registrada correctamente"}
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
                { label: "Nro. Factura", value: facturaEmitida.numeroFactura },
                { label: "Estado", value: facturaEmitida.estado },
                { label: "Cliente", value: facturaEmitida.razonSocialCliente },
                { label: "NIT", value: facturaEmitida.nitCliente },
                {
                  label: "Monto Total",
                  value: `Bs. ${parseFloat(facturaEmitida.montoTotal).toFixed(2)}`,
                },
                {
                  label: "CUF",
                  value: facturaEmitida.cuf?.substring(0, 20) + "...",
                  mono: true,
                },
              ].map(({ label, value, mono }) => (
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
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      fontFamily: mono ? "monospace" : "inherit",
                      wordBreak: "break-all",
                      fontSize: mono ? 11 : "inherit",
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Print />}
                onClick={() => imprimirFactura(facturaEmitida.id, formatoPdf)}
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
                Reimprimir
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Receipt />}
                onClick={limpiarFormulario}
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
                Nueva Factura
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ─── ESTILOS REUTILIZABLES ────────────────────────────────────────────────
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

  // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* HEADER */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="#111827">
            Emitir Factura
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Factura con derecho a crédito fiscal
          </Typography>
        </Box>
        {/* Estado SIAT */}
        {siatLoading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.75,
              bgcolor: "#f3f4f6",
              borderRadius: 10,
            }}
          >
            <CircularProgress size={13} />
            <Typography variant="caption" color="text.secondary">
              Verificando conexión...
            </Typography>
          </Box>
        ) : siatOnline && !isContingencia ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.75,
              bgcolor: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: 10,
            }}
          >
            <Wifi sx={{ fontSize: 14, color: "#16a34a" }} />
            <Typography
              variant="caption"
              sx={{ color: "#16a34a", fontWeight: 600 }}
            >
              SIAT En línea
            </Typography>
          </Box>
        ) : isContingencia ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.75,
              bgcolor: "#fffbeb",
              border: "1px solid #fcd34d",
              borderRadius: 10,
            }}
          >
            <Warning sx={{ fontSize: 14, color: "#d97706" }} />
            <Typography
              variant="caption"
              sx={{ color: "#d97706", fontWeight: 600 }}
            >
              Contingencia activa
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.75,
              bgcolor: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
            }}
          >
            <WifiOff sx={{ fontSize: 14, color: "#dc2626" }} />
            <Typography
              variant="caption"
              sx={{ color: "#dc2626", fontWeight: 600 }}
            >
              SIAT Fuera de línea
            </Typography>
          </Box>
        )}
      </Box>

      {catalogosLoading && (
        <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 2 }} />
      )}

      {/* ALERTA EVENTO ACTIVO */}
      {eventoActivo && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 1.5, border: "1px solid #fcd34d" }}
        >
          <Typography variant="body2" fontWeight={700}>
            ⚠️ Evento/Contingencia Activa!!!
          </Typography>
          <Typography variant="body2">
            {eventoActivo.eventoId}:{" "}
            {eventoActivo.descripcion || "Evento activo"}
          </Typography>
          {isContingencia && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <strong>MODO CONTINGENCIA:</strong> Debe ingresar el número de
              factura, fecha y hora del talonario manual.
            </Typography>
          )}
        </Alert>
      )}

      {/* CONTINGENCIA */}
      <Collapse in={isContingencia}>
        <Card sx={{ ...card, mb: 2, borderLeft: "3px solid #f59e0b" }}>
          <CardContent sx={cardPadding}>
            <Typography sx={{ ...sectionLabel, color: "#92400e" }}>
              <CloudOff sx={{ fontSize: 16 }} /> Datos del Talonario
              (Contingencia)
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 2 }}
            >
              Ingrese los datos de la factura física del talonario de
              contingencia.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nro. Factura (talonario) *"
                  type="number"
                  value={nroFacturaTalonario}
                  onChange={(e) => setNroFacturaTalonario(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Fecha *"
                  type="date"
                  value={fechaContingencia}
                  onChange={(e) => setFechaContingencia(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Hora *"
                  type="time"
                  value={horaContingencia}
                  onChange={(e) => setHoraContingencia(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Button
              size="small"
              onClick={usarFechaActual}
              sx={{
                mt: 1,
                color: "#d97706",
                textDecoration: "underline",
                p: 0,
                minWidth: 0,
                textTransform: "none",
                fontSize: 12,
              }}
            >
              Usar fecha y hora actual
            </Button>
          </CardContent>
        </Card>
      </Collapse>

      {/* Layout de dos columnas con flexbox — sticky funciona con flex, no con Grid overflow */}
      <Box
        sx={{
          display: "flex",
          gap: 2.5,
          alignItems: "flex-start",
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        {/* COLUMNA PRINCIPAL */}
        <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
          {/* PUNTO DE EMISIÓN / TIPO DE FACTURA */}
          <Card sx={{ ...card, mb: 2 }}>
            <CardContent sx={cardPadding}>
              <Typography sx={sectionLabel}>Tipo de Factura</Typography>
              <TextField
                select
                fullWidth
                size="small"
                label="Sector de Documento"
                value={sector}
                onChange={(e) => {
                  setSector(Number(e.target.value));
                  setModalidadServicio("");
                  setMedicoSeleccionado(null);
                  setDetalles([DETALLE_VACIO()]);
                }}
              >
                <MenuItem value={1}>
                  Sector 1 - Compra y Venta de Bienes y Servicios
                </MenuItem>
                <MenuItem value={17}>
                  Sector 17 - Hospitales y Clínicas
                </MenuItem>
              </TextField>
              {sector === 17 && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 1.5,
                    borderRadius: 1,
                    py: 0.5,
                    bgcolor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    "& .MuiAlert-icon": { color: "#2563eb" },
                  }}
                >
                  <Typography variant="caption" color="#1e40af">
                    <strong>📌 Sector Hospital/Clínica:</strong> Debe
                    seleccionar una modalidad de servicio médico y un médico
                    responsable antes de agregar productos.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* MODALIDAD Y MÉDICO (Solo Sector 17) */}
          <Collapse in={sector === 17}>
            <Card sx={{ ...card, mb: 2 }}>
              <CardContent sx={cardPadding}>
                <Typography sx={sectionLabel}>
                  <MedicalServices sx={{ fontSize: 16, color: "#6b7280" }} />{" "}
                  Modalidad de Servicio Médico
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Modalidad *"
                  value={modalidadServicio}
                  onChange={(e) => {
                    setModalidadServicio(e.target.value);
                    setMedicoSeleccionado(null);
                  }}
                  sx={{ mb: 0.5 }}
                  disabled={catalogosLoading}
                  helperText="Tipo de atención médica proporcionada (Sector 17 - Hospitales/Clínicas)"
                >
                  <MenuItem value="">-- Seleccione una modalidad --</MenuItem>
                  {modalidades.map((m) => (
                    <MenuItem key={m.id} value={m.descripcion}>
                      {m.descripcion}
                    </MenuItem>
                  ))}
                </TextField>

                {modalidadServicio && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Médico *"
                      value={medicoSeleccionado?.nitDocumento || ""}
                      onChange={(e) => {
                        const med = medicos.find(
                          (m) => String(m.nitDocumento) === e.target.value,
                        );
                        setMedicoSeleccionado(med || null);
                        if (med) {
                          setDetalles((prev) =>
                            prev.map((d) => ({
                              ...d,
                              nombreApellidoMedico: med.nombreCompleto || "",
                              nitDocumentoMedico: String(
                                med.nitDocumento || "",
                              ),
                              especialidadMedico: med.especialidadMedico || "",
                              nroMatriculaMedico: med.nroMatricula || "",
                              nroQuirofanoSalaOperaciones:
                                d.nroQuirofanoSalaOperaciones ||
                                String(med.nroQuirofanoSalaOperaciones || ""),
                            })),
                          );
                        }
                      }}
                      sx={{ mb: 0.5 }}
                      helperText="Los productos agregados se relacionarán con este médico"
                    >
                      <MenuItem value="">Seleccione un médico</MenuItem>
                      {medicosPorModalidad.map((m) => (
                        <MenuItem key={m.id} value={String(m.nitDocumento)}>
                          {m.nombreCompleto}
                          {m.especialidadMedico && ` - ${m.especialidadMedico}`}
                          {m.nroMatricula && ` (Mat: ${m.nroMatricula})`}
                        </MenuItem>
                      ))}
                    </TextField>

                    {medicosPorModalidad.length === 0 && (
                      <Typography variant="caption" color="error.main">
                        ⚠️ No hay médicos disponibles para esta modalidad
                      </Typography>
                    )}

                    {medicoSeleccionado && (
                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          bgcolor: "#eff6ff",
                          borderRadius: 1,
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        <Typography variant="caption" color="#1d4ed8">
                          <strong>Médico seleccionado:</strong>{" "}
                          {medicoSeleccionado.nombreCompleto} — NIT:{" "}
                          {medicoSeleccionado.nitDocumento}
                          {medicoSeleccionado.especialidadMedico &&
                            ` — ${medicoSeleccionado.especialidadMedico}`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Collapse>

          {/* TIPO DE CLIENTE */}
          <Card sx={{ ...card, mb: 2 }}>
            <CardContent sx={cardPadding}>
              <Typography sx={sectionLabel}>Tipo de Cliente</Typography>
              <RadioGroup
                row
                value={tipoCliente}
                onChange={(e) => handleTipoClienteChange(e.target.value)}
              >
                {[
                  { value: "normal", label: "Normal" },
                  { value: "control_tributario", label: "Control Tributario" },
                  { value: "ventas_menores", label: "Ventas Menores del Día" },
                  { value: "caso_especial", label: "Caso Especial" },
                ].map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: "#6b7280",
                          "&.Mui-checked": { color: "#2563eb" },
                        }}
                      />
                    }
                    label={<Typography variant="body2">{opt.label}</Typography>}
                  />
                ))}
              </RadioGroup>
              {tipoCliente !== "normal" && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 1.5,
                    borderRadius: 1,
                    py: 0.5,
                    bgcolor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    "& .MuiAlert-icon": { color: "#2563eb" },
                  }}
                >
                  <Typography variant="caption" color="#1e40af">
                    <strong>📌 Tipo especial:</strong> Se aplicará código de
                    excepción 1.
                    {tipoCliente === "caso_especial" &&
                      " Complete la razón social manualmente."}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* DATOS DEL CLIENTE */}
          <Card sx={{ ...card, mb: 2 }}>
            <CardContent sx={cardPadding}>
              <Typography sx={sectionLabel}>
                <Search sx={{ fontSize: 16, color: "#6b7280" }} /> Datos del
                Cliente
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="NIT/CI *"
                    value={nitCliente}
                    onChange={(e) =>
                      setNitCliente(e.target.value.toUpperCase())
                    }
                    placeholder="Ej: 123456789"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Complemento"
                    value={complemento}
                    onChange={(e) =>
                      setComplemento(e.target.value.toUpperCase())
                    }
                    placeholder="Ej: 1A"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Razón Social / Nombre *"
                    value={razonSocial}
                    onChange={(e) =>
                      setRazonSocial(e.target.value.toUpperCase())
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Tipo Documento"
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(Number(e.target.value))}
                    disabled={catalogosLoading}
                  >
                    {tiposDocumento.map((t) => (
                      <MenuItem
                        key={t.codigoClasificador}
                        value={t.codigoClasificador}
                      >
                        {t.descripcion}
                      </MenuItem>
                    ))}
                    {tiposDocumento.length === 0 && (
                      <MenuItem value={5}>CI - CÉDULA DE IDENTIDAD</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    value={emailCliente}
                    type="email"
                    onChange={(e) => setEmailCliente(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Dirección"
                    value={direccionCliente}
                    onChange={(e) =>
                      setDireccionCliente(e.target.value.toUpperCase())
                    }
                    placeholder="Dirección completa"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* AGREGAR PRODUCTO */}
          <Card sx={{ ...card, mb: 2 }}>
            <CardContent sx={cardPadding}>
              {/* Búsqueda */}
              <Box sx={{ position: "relative", mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar Producto (por código o nombre)"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  placeholder="Escriba código o nombre del producto..."
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {buscandoProducto ? (
                          <CircularProgress size={15} />
                        ) : (
                          <Search sx={{ fontSize: 17, color: "#9ca3af" }} />
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
                {productosBuscados.length > 0 && (
                  <Paper
                    sx={{
                      position: "absolute",
                      zIndex: 1000,
                      width: "100%",
                      mt: 0.5,
                      maxHeight: 240,
                      overflow: "auto",
                      borderRadius: 1.5,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {productosBuscados.map((p) => (
                      <Box
                        key={p.codigoProductoSin}
                        onClick={() => {
                          const detalleVacio = detalles.find(
                            (d) => !d.descripcion,
                          );
                          if (detalleVacio) {
                            agregarProducto(p, detalleVacio._id);
                          } else {
                            const nuevo = DETALLE_VACIO();
                            setDetalles((prev) => [...prev, nuevo]);
                            setTimeout(() => agregarProducto(p, nuevo._id), 0);
                          }
                        }}
                        sx={{
                          px: 2,
                          py: 1.5,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#f9fafb" },
                          borderBottom: "1px solid #f3f4f6",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {p.descripcion}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Código: {p.codigoProductoSin}
                            {p.codigoBarras && ` | Barras: ${p.codigoBarras}`}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="#2563eb"
                          sx={{ ml: 1, whiteSpace: "nowrap" }}
                        >
                          Bs. {parseFloat(p.precio || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                )}
              </Box>

              {/* AGREGAR MANUALMENTE */}
              <Box sx={{ mb: 2 }}>
                <Box
                  onClick={() => setShowManual(!showManual)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    color: "#6b7280",
                    userSelect: "none",
                  }}
                >
                  {showManual ? (
                    <ExpandLess sx={{ fontSize: 14 }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 14 }} />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    ¿No encuentra el producto? Agregar manualmente
                  </Typography>
                </Box>

                <Collapse in={showManual}>
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 2,
                      bgcolor: "#f9fafb",
                      borderRadius: 1.5,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Código *"
                          value={productoManual.codigoProducto}
                          onChange={(e) =>
                            setProductoManual({
                              ...productoManual,
                              codigoProducto: e.target.value,
                            })
                          }
                          placeholder="COD001"
                        />
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Descripción *"
                          value={productoManual.descripcion}
                          onChange={(e) =>
                            setProductoManual({
                              ...productoManual,
                              descripcion: e.target.value,
                            })
                          }
                          placeholder="Descripción del producto"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Cantidad *"
                          type="number"
                          value={productoManual.cantidad}
                          onChange={(e) =>
                            setProductoManual({
                              ...productoManual,
                              cantidad: e.target.value,
                            })
                          }
                          inputProps={{ min: 1, step: 0.01 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Precio Unit. *"
                          type="number"
                          value={productoManual.precioUnitario}
                          onChange={(e) =>
                            setProductoManual({
                              ...productoManual,
                              precioUnitario: e.target.value,
                            })
                          }
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Descuento"
                          type="number"
                          value={productoManual.montoDescuento}
                          onChange={(e) =>
                            setProductoManual({
                              ...productoManual,
                              montoDescuento: e.target.value,
                            })
                          }
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                    </Grid>

                    {/* Datos médicos para manual - Solo Sector 17 */}
                    {sector === 17 && (
                      <Box
                        sx={{
                          pt: 1.5,
                          mt: 1,
                          borderTop: "1px solid #e5e7eb",
                          mb: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mb: 1.5,
                          }}
                        >
                          <MedicalServices
                            sx={{ fontSize: 14, color: "#2563eb" }}
                          />
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            color="#2563eb"
                          >
                            Datos Médicos (Sector 17)
                          </Typography>
                        </Box>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Especialidad"
                              value={productoManual.especialidad || ""}
                              onChange={(e) =>
                                setProductoManual({
                                  ...productoManual,
                                  especialidad: e.target.value,
                                })
                              }
                              placeholder="Ej: Traumatología"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Detalle de Especialidad"
                              value={productoManual.especialidadDetalle || ""}
                              onChange={(e) =>
                                setProductoManual({
                                  ...productoManual,
                                  especialidadDetalle: e.target.value,
                                })
                              }
                              placeholder="Ej: Reducción de fractura"
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nro. Quirófano/Sala *"
                              type="number"
                              value={
                                productoManual.nroQuirofanoSalaOperaciones || ""
                              }
                              onChange={(e) =>
                                setProductoManual({
                                  ...productoManual,
                                  nroQuirofanoSalaOperaciones: e.target.value,
                                })
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Especialidad del Médico"
                              value={productoManual.especialidadMedico || ""}
                              onChange={(e) =>
                                setProductoManual({
                                  ...productoManual,
                                  especialidadMedico: e.target.value,
                                })
                              }
                              placeholder="Ej: Traumatólogo"
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Médico *"
                              value={productoManual.nitDocumentoMedico || ""}
                              onChange={(e) => {
                                const med = medicos.find(
                                  (m) =>
                                    String(m.nitDocumento) === e.target.value,
                                );
                                setProductoManual({
                                  ...productoManual,
                                  nitDocumentoMedico: e.target.value,
                                  nombreApellidoMedico:
                                    med?.nombreCompleto || "",
                                  nroQuirofanoSalaOperaciones:
                                    productoManual.nroQuirofanoSalaOperaciones ||
                                    String(
                                      med?.nroQuirofanoSalaOperaciones || "",
                                    ),
                                  especialidadMedico:
                                    med?.especialidadMedico ||
                                    productoManual.especialidadMedico ||
                                    "",
                                  nroMatriculaMedico: med?.nroMatricula || "",
                                });
                              }}
                            >
                              <MenuItem value="">Seleccione un médico</MenuItem>
                              {medicos.map((m) => (
                                <MenuItem
                                  key={m.id}
                                  value={String(m.nitDocumento)}
                                >
                                  {m.nombreCompleto}
                                  {m.especialidadMedico &&
                                    ` - ${m.especialidadMedico}`}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nro. Matrícula"
                              value={productoManual.nroMatriculaMedico || ""}
                              onChange={(e) =>
                                setProductoManual({
                                  ...productoManual,
                                  nroMatriculaMedico: e.target.value,
                                })
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nro. Factura Médico"
                              type="number"
                              value={productoManual.nroFacturaMedico || ""}
                              onChange={(e) =>
                                setProductoManual({
                                  ...productoManual,
                                  nroFacturaMedico: e.target.value,
                                })
                              }
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        if (
                          !productoManual.codigoProducto ||
                          !productoManual.descripcion
                        ) {
                          enqueueSnackbar("Complete código y descripción", {
                            variant: "error",
                          });
                          return;
                        }
                        const nueva = DETALLE_VACIO();
                        setDetalles((prev) => [
                          ...prev,
                          {
                            ...nueva,
                            codigoProducto: productoManual.codigoProducto,
                            descripcion: productoManual.descripcion,
                            cantidad: parseFloat(productoManual.cantidad) || 1,
                            precioUnitario:
                              parseFloat(productoManual.precioUnitario) || 0,
                            montoDescuento:
                              parseFloat(productoManual.montoDescuento) || 0,
                            ...(sector === 17
                              ? {
                                  especialidad:
                                    productoManual.especialidad || "",
                                  especialidadDetalle:
                                    productoManual.especialidadDetalle || "",
                                  nroQuirofanoSalaOperaciones:
                                    productoManual.nroQuirofanoSalaOperaciones ||
                                    "",
                                  especialidadMedico:
                                    productoManual.especialidadMedico || "",
                                  nombreApellidoMedico:
                                    productoManual.nombreApellidoMedico || "",
                                  nitDocumentoMedico:
                                    productoManual.nitDocumentoMedico || "",
                                  nroMatriculaMedico:
                                    productoManual.nroMatriculaMedico || "",
                                  nroFacturaMedico:
                                    productoManual.nroFacturaMedico || "",
                                }
                              : {}),
                          },
                        ]);
                        setProductoManual({
                          codigoProducto: "",
                          descripcion: "",
                          cantidad: 1,
                          precioUnitario: "",
                          montoDescuento: 0,
                        });
                        setShowManual(false);
                        enqueueSnackbar("Producto agregado", {
                          variant: "success",
                        });
                      }}
                      sx={{
                        borderColor: "#d1d5db",
                        color: "#374151",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      + Agregar Manualmente
                    </Button>
                  </Box>
                </Collapse>
              </Box>

              {/* TABLA DE PRODUCTOS - igual al original */}
              {detalles.filter((d) => d.descripcion).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ mb: 1.5, color: "#111827" }}
                  >
                    Productos Agregados (
                    {detalles.filter((d) => d.descripcion).length})
                  </Typography>
                  <Box sx={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderTop: "1px solid #e5e7eb",
                            borderBottom: "1px solid #e5e7eb",
                            background: "#f9fafb",
                          }}
                        >
                          {[
                            "CÓDIGO",
                            "DESCRIPCIÓN",
                            "CANT.",
                            "P. UNIT.",
                            "DESC.",
                            "SUBTOTAL",
                            "",
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "10px 12px",
                                textAlign:
                                  h === "SUBTOTAL" ||
                                  h === "CANT." ||
                                  h === "P. UNIT." ||
                                  h === "DESC."
                                    ? "right"
                                    : "left",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#6b7280",
                                letterSpacing: "0.05em",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detalles
                          .filter((d) => d.descripcion)
                          .map((d, idx) => (
                            <tr
                              key={d._id}
                              style={{ borderBottom: "1px solid #f3f4f6" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#f9fafb")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "white")
                              }
                            >
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: 13,
                                  fontFamily: "monospace",
                                  color: "#374151",
                                }}
                              >
                                {d.codigoProducto || "—"}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: 13,
                                  color: "#111827",
                                }}
                              >
                                {d.descripcion}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "right",
                                }}
                              >
                                <input
                                  type="number"
                                  min={1}
                                  step={0.01}
                                  value={d.cantidad}
                                  onChange={(e) =>
                                    actualizarDetalle(
                                      d._id,
                                      "cantidad",
                                      e.target.value,
                                    )
                                  }
                                  style={{
                                    width: 56,
                                    textAlign: "right",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 4,
                                    padding: "3px 6px",
                                    fontSize: 13,
                                  }}
                                />
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "right",
                                }}
                              >
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={d.precioUnitario}
                                  disabled
                                  style={{
                                    width: 70,
                                    textAlign: "right",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 4,
                                    padding: "3px 6px",
                                    fontSize: 13,
                                    background: "#f3f4f6",
                                    cursor: "not-allowed",
                                  }}
                                />
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "right",
                                }}
                              >
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={d.montoDescuento}
                                  onChange={(e) =>
                                    actualizarDetalle(
                                      d._id,
                                      "montoDescuento",
                                      e.target.value,
                                    )
                                  }
                                  style={{
                                    width: 70,
                                    textAlign: "right",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 4,
                                    padding: "3px 6px",
                                    fontSize: 13,
                                  }}
                                />
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "right",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#111827",
                                }}
                              >
                                {calcularSubtotal(d).toFixed(2)}
                              </td>
                              <td
                                style={{
                                  padding: "10px 8px",
                                  textAlign: "right",
                                }}
                              >
                                <button
                                  onClick={() => eliminarFila(d._id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#ef4444",
                                    padding: 4,
                                  }}
                                >
                                  🗑
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              )}

              {/* Fila vacía para agregar */}
              {detalles
                .filter((d) => !d.descripcion)
                .map((d, idx) => (
                  <Box
                    key={d._id}
                    sx={{
                      mb: 1,
                      p: 1.5,
                      border: "1px dashed #e5e7eb",
                      borderRadius: 1.5,
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#9ca3af", minWidth: 20 }}
                    >
                      #
                      {detalles.filter((d2) => d2.descripcion).length + idx + 1}
                    </Typography>
                    <TextField
                      size="small"
                      label="Descripción *"
                      value={d.descripcion}
                      sx={{ flex: 3 }}
                      onChange={(e) =>
                        actualizarDetalle(d._id, "descripcion", e.target.value)
                      }
                    />
                    <TextField
                      size="small"
                      label="Cant."
                      type="number"
                      value={d.cantidad}
                      sx={{ width: 70 }}
                      onChange={(e) =>
                        actualizarDetalle(d._id, "cantidad", e.target.value)
                      }
                      inputProps={{ min: 1 }}
                    />
                    <TextField
                      size="small"
                      label="P. Unit."
                      type="number"
                      value={d.precioUnitario}
                      sx={{ width: 90 }}
                      onChange={(e) =>
                        actualizarDetalle(
                          d._id,
                          "precioUnitario",
                          e.target.value,
                        )
                      }
                      inputProps={{ min: 0 }}
                    />
                    <TextField
                      size="small"
                      label="Desc."
                      type="number"
                      value={d.montoDescuento}
                      sx={{ width: 80 }}
                      onChange={(e) =>
                        actualizarDetalle(
                          d._id,
                          "montoDescuento",
                          e.target.value,
                        )
                      }
                      inputProps={{ min: 0 }}
                    />
                    <Tooltip title="Eliminar fila">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => eliminarFila(d._id)}
                          disabled={detalles.length === 1}
                          sx={{ color: "#ef4444" }}
                        >
                          <Delete sx={{ fontSize: 14 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                ))}
            </CardContent>
          </Card>

          {/* MÉTODO DE PAGO */}
          <Card sx={card}>
            <CardContent sx={cardPadding}>
              <Typography sx={sectionLabel}>Método de Pago</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Tipo de Pago"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(Number(e.target.value))}
                    disabled={catalogosLoading}
                  >
                    {metodosPago.map((m) => (
                      <MenuItem
                        key={m.codigoClasificador}
                        value={m.codigoClasificador}
                      >
                        {m.descripcion}
                      </MenuItem>
                    ))}
                    {metodosPago.length === 0 &&
                      [
                        { v: 1, l: "EFECTIVO" },
                        { v: 27, l: "GIFT-CARD" },
                        { v: 35, l: "EFECTIVO + GIFT-CARD" },
                      ].map((m) => (
                        <MenuItem key={m.v} value={m.v}>
                          {m.l}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                {[1, 35].includes(metodoPago) && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Monto Efectivo"
                      value={montoPagado}
                      type="number"
                      onChange={(e) => setMontoPagado(e.target.value)}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                )}
                {[27, 33, 35].includes(metodoPago) && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Monto Gift Card"
                      value={montoGiftCard}
                      type="number"
                      onChange={(e) => setMontoGiftCard(e.target.value)}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* PANEL LATERAL RESUMEN */}
        <Box
          sx={{
            width: { xs: "100%", lg: 320 },
            flexShrink: 0,
            position: { xs: "static", lg: "sticky" },
            top: 24,
            alignSelf: "flex-start",
          }}
        >
          <Card sx={{ ...card }}>
            <CardContent sx={cardPadding}>
              <Typography sx={sectionLabel}>Resumen</Typography>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.75,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Productos:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {detalles.filter((d) => d.descripcion).length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.75,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Subtotal:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Bs. {montoTotal.toFixed(2)}
                  </Typography>
                </Box>
                {parseFloat(descuentoAdicional) > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.75,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Descuento adicional:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#dc2626"
                    >
                      - Bs. {parseFloat(descuentoAdicional).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <Typography variant="body1" fontWeight={700}>
                    Total:
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#2563eb">
                    Bs. {montoConDescuento.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ pt: 2, borderTop: "1px solid #e5e7eb", mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Descuento Adicional"
                  value={descuentoAdicional}
                  type="number"
                  onChange={(e) => setDescuentoAdicional(e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Gift Card"
                  value={montoGiftCard}
                  type="number"
                  onChange={(e) => setMontoGiftCard(e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => emitirFactura()}
                  disabled={emitiendo || catalogosLoading}
                  startIcon={
                    emitiendo ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <Receipt />
                    )
                  }
                  sx={{
                    py: 1.4,
                    fontWeight: 700,
                    borderRadius: 1.5,
                    textTransform: "none",
                    bgcolor: "#2563eb",
                    "&:hover": { bgcolor: "#1d4ed8" },
                    boxShadow: "none",
                  }}
                >
                  {emitiendo
                    ? "Procesando..."
                    : isContingencia
                      ? "⚡ Guardar Factura"
                      : "Emitir Factura"}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={limpiarFormulario}
                  disabled={emitiendo}
                  sx={{
                    py: 1.2,
                    borderRadius: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: "#d1d5db",
                    color: "#374151",
                    "&:hover": { bgcolor: "#f9fafb", borderColor: "#9ca3af" },
                  }}
                >
                  Limpiar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Modales */}
      <NitValidationModal
        open={nitModal.open}
        nitCliente={nitCliente}
        razonSocial={razonSocial}
        onContinueWithException={handleContinuarConExcepcion}
        onClose={() => setNitModal({ open: false })}
      />
      <ActivityValidationModal
        open={actividadModal.open}
        actividadExistente={actividadModal.actividadExistente}
        actividadNueva={actividadModal.actividadNueva}
        productoConflicto={actividadModal.productoConflicto}
        onClose={() => setActividadModal({ open: false })}
      />
    </Box>
  );
}
