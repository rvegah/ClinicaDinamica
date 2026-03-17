// src/modules/agendamiento/pages/BuscarCitasPage.jsx
// Lista de citas con filtros + confirmar cita + guardar llegada

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Search,
  Add,
  CheckCircle,
  HowToReg,
  FilterList,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import agendamientoService from '../../../services/api/agendamientoService';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatearFechaHora = (fechaStr) => {
  if (!fechaStr) return '—';
  try {
    return new Date(fechaStr).toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return fechaStr; }
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '—';
  try {
    return new Date(fechaStr).toLocaleDateString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return fechaStr; }
};

// ─── CHIP DE ESTADO ───────────────────────────────────────────────────────────
const ESTADO_COLORES = {
  'Disponible':         { bg: '#f3f4f6', color: '#6b7280' },
  'Pre-Reserva':        { bg: '#fef3c7', color: '#92400e' },
  'Reservada':          { bg: '#dbeafe', color: '#1d4ed8' },
  'Confirmada':         { bg: '#dcfce7', color: '#15803d' },
  'En Sala de Espera':  { bg: '#fce7f3', color: '#be185d' },
  'En Atención':        { bg: '#ede9fe', color: '#6d28d9' },
  'Atendida':           { bg: '#d1fae5', color: '#065f46' },
  'No Asistió':         { bg: '#fee2e2', color: '#991b1b' },
  'Cancelada':          { bg: '#fee2e2', color: '#991b1b' },
  'Reprogramada':       { bg: '#fef3c7', color: '#92400e' },
  'Listo para Consulta':{ bg: '#ecfdf5', color: '#047857' },
};

function ChipEstado({ estado }) {
  const col = ESTADO_COLORES[estado] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <Chip
      label={estado || '—'}
      size="small"
      sx={{
        bgcolor: col.bg,
        color: col.color,
        fontWeight: 700,
        fontSize: 11,
        height: 20,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

// ─── TABLA DE CITAS ───────────────────────────────────────────────────────────
function TablaCitas({ citas, onConfirmar, onGuardarLlegada, procesando }) {
  const cols = [
    { label: 'Paciente', width: '22%' },
    { label: 'Médico', width: '15%' },
    { label: 'Especialidad', width: '15%' },
    { label: 'Fecha / Hora', width: '16%' },
    { label: 'Tipo', width: '14%' },
    { label: 'Estado', width: '12%' },
    { label: '', width: '6%' },
  ];

  const gridCols = cols.map((c) => c.width).join(' ');

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        bgcolor: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Cabecera */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: gridCols,
          bgcolor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
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
              color: '#6b7280',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontSize: 11,
            }}
          >
            {c.label}
          </Typography>
        ))}
      </Box>

      {/* Filas */}
      {citas.map((cita, idx) => {
        const esUltimo = idx === citas.length - 1;
        const puedeConfirmar = ['Pre-Reserva', 'Reservada'].includes(cita.estadoCita);
        const puedeLlegada = ['Confirmada'].includes(cita.estadoCita);
        const enProceso = procesando === cita.codigoCita;

        return (
          <Box
            key={cita.codigoCita || idx}
            sx={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              px: 2,
              py: 1.5,
              alignItems: 'center',
              borderBottom: esUltimo ? 'none' : '1px solid #f3f4f6',
              transition: 'background 0.15s',
              '&:hover': { bgcolor: '#fafafa' },
            }}
          >
            {/* Paciente */}
            <Box>
              <Typography variant="body2" fontWeight={600} color="#111827"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {(cita.nombrePaciente || '').trim() || '—'}
              </Typography>
              {cita.numeroDocumento && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {cita.numeroDocumento}
                </Typography>
              )}
            </Box>

            {/* Médico */}
            <Typography variant="body2" color="#374151" fontSize={13}
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cita.nombreMedico || cita.codigoMedico || '—'}
            </Typography>

            {/* Especialidad */}
            <Typography variant="body2" color="#374151" fontSize={13}>
              {cita.nombreEspecialidad || '—'}
            </Typography>

            {/* Fecha / Hora */}
            <Box>
              <Typography variant="body2" color="#374151" fontSize={13}>
                {formatearFecha(cita.fechaCita)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {cita.horaInicio || '—'}
              </Typography>
            </Box>

            {/* Tipo */}
            <Typography variant="body2" color="#374151" fontSize={12}
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cita.nombreTipoConsulta || '—'}
            </Typography>

            {/* Estado */}
            <ChipEstado estado={cita.estadoCita} />

            {/* Acciones */}
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
              {puedeConfirmar && (
                <Tooltip title="Confirmar cita" arrow>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onConfirmar(cita)}
                      disabled={enProceso}
                      sx={{
                        color: '#15803d',
                        bgcolor: '#dcfce7',
                        borderRadius: 1,
                        width: 28,
                        height: 28,
                        '&:hover': { bgcolor: '#bbf7d0' },
                      }}
                    >
                      {enProceso ? (
                        <CircularProgress size={12} color="inherit" />
                      ) : (
                        <CheckCircle sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {puedeLlegada && (
                <Tooltip title="Registrar llegada" arrow>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onGuardarLlegada(cita)}
                      disabled={enProceso}
                      sx={{
                        color: '#1d4ed8',
                        bgcolor: '#dbeafe',
                        borderRadius: 1,
                        width: 28,
                        height: 28,
                        '&:hover': { bgcolor: '#bfdbfe' },
                      }}
                    >
                      {enProceso ? (
                        <CircularProgress size={12} color="inherit" />
                      ) : (
                        <HowToReg sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function BuscarCitasPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Catálogos para filtros
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);

  // Filtros
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  // Resultados
  const [citas, setCitas] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [procesando, setProcesando] = useState(null);

  // Cargar catálogos
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
    try {
      const res = await agendamientoService.buscarCitas({
        codigoMedico: filtroMedico || undefined,
        codigoEspecialidad: filtroEspecialidad || undefined,
        codigoPaciente: filtroPaciente || undefined,
        fechaInicio: filtroFechaInicio || undefined,
        fechaFin: filtroFechaFin || undefined,
      });

      if (res.exitoso) {
        setCitas(res.datos || []);
        setBuscado(true);
        if ((res.datos || []).length === 0) {
          enqueueSnackbar('No se encontraron citas', { variant: 'info' });
        }
      } else {
        // 404 = sin resultados
        setCitas([]);
        setBuscado(true);
        enqueueSnackbar('No se encontraron citas con esos filtros', { variant: 'info' });
      }
    } catch (err) {
      // 404 del API = sin citas
      setCitas([]);
      setBuscado(true);
    } finally {
      setBuscando(false);
    }
  };

  const handleConfirmar = async (cita) => {
    setProcesando(cita.codigoCita);
    try {
      const userJson = sessionStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : {};
      const usuarioId = user.id || user.userId || 1;

      const res = await agendamientoService.confirmarCita(cita.codigoCita, usuarioId);
      enqueueSnackbar(res.mensaje || '✅ Cita confirmada', { variant: 'success' });
      handleBuscar();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error al confirmar cita', { variant: 'error' });
    } finally {
      setProcesando(null);
    }
  };

  const handleGuardarLlegada = async (cita) => {
    setProcesando(cita.codigoCita);
    try {
      const res = await agendamientoService.guardarLlegada(cita.codigoCita);
      enqueueSnackbar(res.mensaje || '✅ Llegada registrada', { variant: 'success' });
      handleBuscar();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error al registrar llegada', { variant: 'error' });
    } finally {
      setProcesando(null);
    }
  };

  const card = {
    borderRadius: 2,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    bgcolor: 'white',
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* HEADER */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#111827">
            Citas Médicas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión y seguimiento de citas del consultorio
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/agendamiento/reservar')}
          sx={{
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
            borderRadius: 1.5,
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',
            py: 1.2,
            px: 2.5,
          }}
        >
          Nueva Cita
        </Button>
      </Box>

      {/* FILTROS */}
      <Card sx={{ ...card, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            color="#111827"
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FilterList sx={{ fontSize: 16, color: '#6b7280' }} />
            Filtros de Búsqueda
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' },
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
              label="ID Paciente"
              type="number"
              value={filtroPaciente}
              onChange={(e) => setFiltroPaciente(e.target.value)}
              placeholder="Ej: 7"
            />

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
            startIcon={buscando ? <CircularProgress size={15} color="inherit" /> : <Search />}
            onClick={handleBuscar}
            disabled={buscando}
            sx={{
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
              borderRadius: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
            }}
          >
            {buscando ? 'Buscando...' : 'Buscar Citas'}
          </Button>
        </CardContent>
      </Card>

      {/* LEYENDA DE ACCIONES */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 20, height: 20, borderRadius: 0.75, bgcolor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle sx={{ fontSize: 12, color: '#15803d' }} />
          </Box>
          <Typography variant="caption" color="text.secondary">Confirmar cita (Pre-Reserva → Confirmada)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 20, height: 20, borderRadius: 0.75, bgcolor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HowToReg sx={{ fontSize: 12, color: '#1d4ed8' }} />
          </Box>
          <Typography variant="caption" color="text.secondary">Registrar llegada (Confirmada → En Sala de Espera)</Typography>
        </Box>
      </Box>

      {/* RESULTADOS */}
      {buscado && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {citas.length === 0
                ? 'Sin resultados'
                : `${citas.length} cita${citas.length !== 1 ? 's' : ''} encontrada${citas.length !== 1 ? 's' : ''}`}
            </Typography>
          </Box>

          {citas.length === 0 ? (
            <Alert
              severity="info"
              sx={{ borderRadius: 1.5, border: '1px solid #bfdbfe', bgcolor: '#eff6ff' }}
            >
              No se encontraron citas con los filtros seleccionados. ¿Desea{' '}
              <strong
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate('/agendamiento/reservar')}
              >
                agendar una nueva cita
              </strong>
              ?
            </Alert>
          ) : (
            <TablaCitas
              citas={citas}
              onConfirmar={handleConfirmar}
              onGuardarLlegada={handleGuardarLlegada}
              procesando={procesando}
            />
          )}
        </>
      )}

      {/* Estado inicial */}
      {!buscado && (
        <Box sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
          <Search sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
          <Typography variant="body1" fontWeight={500}>
            Use los filtros para buscar citas médicas
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Puede filtrar por médico, especialidad, paciente o rango de fechas
          </Typography>
        </Box>
      )}
    </Box>
  );
}