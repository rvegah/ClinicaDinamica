// src/modules/facturacion/components/facturas/NitValidationModal.jsx
// Se muestra cuando SIAT rechaza el NIT del cliente (error 1037)
// Permite al cajero continuar con excepción (codigoExcepcion=1)

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Alert,
} from '@mui/material';
import { Warning, Person } from '@mui/icons-material';
import { clinicColors } from '../../../../app/theme';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.nitCliente - NIT que fue rechazado
 * @param {string} props.razonSocial - Nombre del cliente
 * @param {() => void} props.onContinueWithException - Continuar con codigoExcepcion=1
 * @param {() => void} props.onClose - Cancelar / corregir NIT
 */
const NitValidationModal = ({ open, nitCliente, razonSocial, onContinueWithException, onClose }) => {
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
        background: `linear-gradient(135deg, ${clinicColors.warning} 0%, #f57c00 100%)`,
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <Warning sx={{ fontSize: 32, color: 'white' }} />
        <Box>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
            NIT No Válido (Error 1037)
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            El NIT del cliente fue rechazado por el SIAT
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        {/* Info cliente */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          bgcolor: 'rgba(255, 152, 0, 0.08)',
          border: '1px solid rgba(255,152,0,0.3)',
          borderRadius: 2, p: 2, mb: 3,
        }}>
          <Person sx={{ color: clinicColors.warning, fontSize: 36 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">Cliente</Typography>
            <Typography variant="subtitle1" fontWeight={700}>{razonSocial || '—'}</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: clinicColors.warning, fontWeight: 600 }}>
              NIT: {nitCliente}
            </Typography>
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          <Typography variant="body2">
            El SIAT no reconoce este NIT. Puede continuar emitiendo la factura
            con <strong>código de excepción (codigoExcepcion=1)</strong>, lo cual
            permite facturar sin validación de NIT. La factura quedará registrada
            con la observación correspondiente.
          </Typography>
        </Alert>

        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            Alternativa: Cierre este diálogo, corrija el NIT del cliente y vuelva
            a emitir la factura.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
        >
          Cancelar / Corregir NIT
        </Button>
        <Button
          onClick={onContinueWithException}
          variant="contained"
          fullWidth
          sx={{
            py: 1.5, borderRadius: 2, fontWeight: 700,
            background: `linear-gradient(135deg, ${clinicColors.warning} 0%, #f57c00 100%)`,
            '&:hover': { background: '#e65100' },
          }}
        >
          Continuar con Excepción
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NitValidationModal;