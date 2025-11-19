// src/components/ErrorDialog.jsx - Modal bonito para errores

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  ErrorOutline,
  Close,
  WifiOff,
  Lock,
  PersonOff,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { clinicColors } from '../app/theme';

/**
 * Obtiene el icono correcto según el tipo de error
 */
const getErrorIcon = (errorType) => {
  switch (errorType) {
    case 'password':
      return <Lock sx={{ fontSize: 60, color: '#e53e3e' }} />;
    case 'user':
      return <PersonOff sx={{ fontSize: 60, color: '#e53e3e' }} />;
    case 'connection':
      return <WifiOff sx={{ fontSize: 60, color: '#718096' }} />;
    case 'server':
      return <Warning sx={{ fontSize: 60, color: '#f59e0b' }} />;
    case 'success':
      return <CheckCircle sx={{ fontSize: 60, color: '#10b981' }} />;
    default:
      return <ErrorOutline sx={{ fontSize: 60, color: '#e53e3e' }} />;
  }
};

/**
 * Obtiene el color del título según el tipo
 */
const getTitleColor = (errorType) => {
  switch (errorType) {
    case 'success':
      return '#10b981';
    case 'connection':
      return '#718096';
    case 'server':
      return '#f59e0b';
    default:
      return '#e53e3e';
  }
};

/**
 * Componente ErrorDialog
 * Modal elegante para mostrar errores o mensajes de éxito
 * 
 * @param {boolean} open - Si el dialog está abierto
 * @param {function} onClose - Función para cerrar el dialog
 * @param {string} title - Título del mensaje
 * @param {string} message - Mensaje descriptivo
 * @param {string} errorType - Tipo de error: 'password', 'user', 'connection', 'server', 'success', 'default'
 * @param {string} buttonText - Texto del botón de cerrar (por defecto: "Entendido")
 * @param {boolean} autoClose - Si debe cerrarse automáticamente (por defecto: false)
 * @param {number} autoCloseDelay - Tiempo en ms para auto-cerrar (por defecto: 3000)
 */
function ErrorDialog({
  open,
  onClose,
  title,
  message,
  errorType = 'default',
  buttonText = 'Entendido',
  autoClose = false,
  autoCloseDelay = 3000,
}) {
  // Auto-cerrar si está configurado
  React.useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [open, autoClose, autoCloseDelay, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        },
      }}
    >
      {/* Botón cerrar (X) en la esquina */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#718096',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.05)',
          },
        }}
      >
        <Close />
      </IconButton>

      {/* Contenido del dialog */}
      <DialogContent sx={{ pt: 4, pb: 2, textAlign: 'center' }}>
        {/* Icono */}
        <Box sx={{ mb: 2 }}>
          {getErrorIcon(errorType)}
        </Box>

        {/* Título */}
        <DialogTitle
          sx={{
            p: 0,
            mb: 2,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: getTitleColor(errorType),
          }}
        >
          {title}
        </DialogTitle>

        {/* Mensaje */}
        <Typography
          variant="body1"
          sx={{
            color: '#4a5568',
            fontSize: '1rem',
            lineHeight: 1.6,
            px: 2,
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      {/* Botón de acción */}
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            background: errorType === 'success' 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryDark} 100%)`,
            '&:hover': {
              background: errorType === 'success'
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : `linear-gradient(135deg, ${clinicColors.primaryDark} 0%, #a04d00 100%)`,
            },
          }}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ErrorDialog;