// src/modules/facturacion/components/facturas/ActivityValidationModal.jsx
// Se muestra cuando dos productos tienen diferente codigoActividad en el mismo detalle

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Alert, List, ListItem, ListItemText,
} from '@mui/material';
import { ErrorOutline, Category } from '@mui/icons-material';
import { clinicColors } from '../../../../app/theme';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.actividadExistente - codigoActividad del primer producto
 * @param {string} props.actividadNueva - codigoActividad del producto en conflicto
 * @param {string} props.productoConflicto - nombre del producto rechazado
 * @param {() => void} props.onClose
 */
const ActivityValidationModal = ({
  open, actividadExistente, actividadNueva, productoConflicto, onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${clinicColors.error} 0%, #b71c1c 100%)`,
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <ErrorOutline sx={{ fontSize: 32, color: 'white' }} />
        <Box>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
            Conflicto de Actividades
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            Todos los productos deben pertenecer a la misma actividad SIAT
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            El producto <strong>"{productoConflicto}"</strong> no puede agregarse
            porque tiene una actividad diferente a los productos ya en el detalle.
          </Typography>
        </Alert>

        <Box sx={{
          bgcolor: '#fff8f8',
          border: '1px solid #ffcdd2',
          borderRadius: 2, p: 2, mb: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Category sx={{ color: clinicColors.error, fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Detalle de actividades
            </Typography>
          </Box>
          <List dense disablePadding>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemText
                primary="Actividad de los productos existentes"
                secondary={actividadExistente || '—'}
                primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                secondaryTypographyProps={{
                  variant: 'body2', fontWeight: 700, fontFamily: 'monospace',
                  color: clinicColors.primary,
                }}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary={`Actividad de "${productoConflicto}"`}
                secondary={actividadNueva || '—'}
                primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                secondaryTypographyProps={{
                  variant: 'body2', fontWeight: 700, fontFamily: 'monospace',
                  color: clinicColors.error,
                }}
              />
            </ListItem>
          </List>
        </Box>

        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            Para facturar productos de distintas actividades, debe emitir
            facturas separadas, una por cada actividad.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            py: 1.5, borderRadius: 2, fontWeight: 700,
            background: `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryDark} 100%)`,
          }}
        >
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityValidationModal;