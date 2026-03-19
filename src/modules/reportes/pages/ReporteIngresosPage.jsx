// src/modules/reportes/pages/ReporteIngresosPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent,
  CircularProgress, Alert, Divider, Chip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  TrendingUp, LocalHospital, Healing, AttachMoney,
} from '@mui/icons-material';

const BASE_URL = 'https://dinamax-clinicas.farmadinamica.com.bo/api/farmalink-clinica';

function StatCard({ titulo, valor, icono: Icon, color, sub }) {
  return (
    <Card elevation={0} sx={{
      borderRadius: 3, border: `1.5px solid ${color}30`,
      background: `linear-gradient(135deg, ${color}12 0%, white 100%)`,
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {titulo}
            </Typography>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color, lineHeight: 1.2, mt: 0.5 }}>
              Bs. {Number(valor || 0).toFixed(2)}
            </Typography>
            {sub && (
              <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', mt: 0.5 }}>
                {sub}
              </Typography>
            )}
          </Box>
          <Box sx={{
            bgcolor: `${color}18`, borderRadius: 2, p: 1.2,
            border: `1px solid ${color}30`,
          }}>
            <Icon sx={{ fontSize: '1.6rem', color }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function TablaIngresos({ titulo, datos, colorHeader, campoTotal }) {
  const total = datos.reduce((sum, r) => sum + (Number(r[campoTotal]) || 0), 0);

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 1.5,
        background: colorHeader,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>
          {titulo}
        </Typography>
        <Chip
          label={`${datos.length} registro${datos.length !== 1 ? 's' : ''}`}
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: '0.65rem' }}
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f9fafb' }}>
              {['Código', 'Descripción', 'Categoría', 'Cantidad', 'P. Unitario', 'Total'].map((h) => (
                <TableCell key={h} sx={{
                  fontWeight: 700, fontSize: '0.7rem', color: '#6b7280',
                  textTransform: 'uppercase', py: 1.2, borderBottom: '1px solid #e5e7eb',
                }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {datos.map((r, i) => (
              <TableRow key={i} sx={{ '&:hover': { bgcolor: '#fafafa' }, '&:last-child td': { border: 0 } }}>
                <TableCell sx={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#374151', py: 1 }}>
                  {r.codigo}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', py: 1 }}>
                  {r.descripcion}
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip label={r.categoria} size="small" sx={{
                    bgcolor: '#f3f4f6', color: '#374151',
                    fontSize: '0.65rem', fontWeight: 600, height: 18,
                  }} />
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#374151', py: 1, textAlign: 'center' }}>
                  {r.cantidad}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#374151', py: 1 }}>
                  Bs. {Number(r.precioUnitario || 0).toFixed(2)}
                </TableCell>
                <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', py: 1 }}>
                  Bs. {Number(r[campoTotal] || 0).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer total */}
      <Box sx={{
        px: 2.5, py: 1.2, bgcolor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2,
      }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>
          TOTAL
        </Typography>
        <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#111827' }}>
          Bs. {total.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function ReporteIngresosPage() {
  const [datos, setDatos]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/Reportes/ReporteIngresos`, { headers: { accept: '*/*' } })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d) => {
        if (d.exitoso) setDatos(d.datos);
        else throw new Error(d.mensaje || 'Error en respuesta');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalEnfermeria = (datos?.ingresosEnfermeria || [])
    .reduce((s, r) => s + (Number(r.costoTotal) || 0), 0);

  const totalMedico = (datos?.ingresosMedicos || [])
    .reduce((s, r) => s + (Number(r.cotoTotal) || 0), 0);  // API tiene typo: cotoTotal

  const totalGeneral = totalEnfermeria + totalMedico;

  const fechaReporte = datos?.fechaReporte
    ? new Date(datos.fechaReporte).toLocaleString('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      {/* HEADER */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#111827">
            Reporte de Ingresos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Cargando...' : `Generado: ${fechaReporte}`}
          </Typography>
        </Box>
        <Chip
          label="Solo SuperAdmin"
          size="small"
          sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '0.7rem' }}
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          No se pudo cargar el reporte: {error}
        </Alert>
      )}

      {!loading && !error && datos && (
        <>
          {/* STAT CARDS */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <StatCard
                titulo="Total Enfermería"
                valor={totalEnfermeria}
                icono={Healing}
                color="#1E8449"
                sub={`${datos.ingresosEnfermeria?.length || 0} servicios`}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                titulo="Total Consultas Médicas"
                valor={totalMedico}
                icono={LocalHospital}
                color="#1A5276"
                sub={`${datos.ingresosMedicos?.length || 0} consultas`}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                titulo="Total General"
                valor={totalGeneral}
                icono={AttachMoney}
                color="#E67E22"
                sub="Enfermería + Consultas"
              />
            </Grid>
          </Grid>

          {/* TABLA ENFERMERÍA */}
          {datos.ingresosEnfermeria?.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <TablaIngresos
                titulo="Ingresos por Servicios de Enfermería"
                datos={datos.ingresosEnfermeria}
                colorHeader="linear-gradient(135deg, #1E8449 0%, #27AE60 100%)"
                campoTotal="costoTotal"
              />
            </Box>
          )}

          {/* TABLA MÉDICA */}
          {datos.ingresosMedicos?.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <TablaIngresos
                titulo="Ingresos por Consultas Médicas"
                datos={datos.ingresosMedicos}
                colorHeader="linear-gradient(135deg, #1A5276 0%, #2471A3 100%)"
                campoTotal="cotoTotal"
              />
            </Box>
          )}

          {/* RESUMEN FINAL */}
          <Paper elevation={0} sx={{
            borderRadius: 3, border: '1.5px solid #E67E2230',
            background: 'linear-gradient(135deg, #FEF9F0 0%, white 100%)',
            p: 2.5,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TrendingUp sx={{ color: '#E67E22', fontSize: '1.4rem' }} />
                <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                  Ingreso Total del Período
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#E67E22' }}>
                Bs. {totalGeneral.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}