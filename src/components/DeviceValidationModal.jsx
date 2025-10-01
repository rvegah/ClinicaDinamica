import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { validateDeviceIP } from '../services/networkValidation';
import { clinicColors } from '../app/theme';

const DeviceValidationModal = ({ open, deviceName, deviceIPMapping, onValidationComplete }) => {
  const [validating, setValidating] = useState(true);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    if (open && deviceName) {
      performValidation();
    }
  }, [open, deviceName]);

  const performValidation = async () => {
    setValidating(true);
    
    try {
      const result = await validateDeviceIP(deviceName, deviceIPMapping);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        isValid: false,
        error: error.message
      });
    } finally {
      setValidating(false);
    }
  };

  const handleClose = () => {
    if (validationResult?.isValid) {
      onValidationComplete(true);
    } else {
      onValidationComplete(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={validating}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Validación de Dispositivo
        </Typography>
      </DialogTitle>

      <DialogContent>
        {validating ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress sx={{ color: clinicColors.primary, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Validando dispositivo {deviceName}...
            </Typography>
          </Box>
        ) : (
          <Box>
            {validationResult?.isValid ? (
              <Alert 
                severity="success" 
                icon={<CheckCircleIcon />}
                sx={{ mb: 2 }}
              >
                <Typography variant="body1" fontWeight={500}>
                  Dispositivo Autorizado
                </Typography>
              </Alert>
            ) : (
              <Alert 
                severity="error" 
                icon={<ErrorIcon />}
                sx={{ mb: 2 }}
              >
                <Typography variant="body1" fontWeight={500}>
                  Dispositivo No Autorizado
                </Typography>
              </Alert>
            )}

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Dispositivo:</strong> {deviceName}
              </Typography>
              
              {validationResult?.detectedIP && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>IP Detectada:</strong> {validationResult.detectedIP}
                </Typography>
              )}

              {validationResult?.allowedIPs?.length > 0 && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>IPs Autorizadas:</strong> {validationResult.allowedIPs.join(', ')}
                </Typography>
              )}

              {validationResult?.error && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Error: {validationResult.error}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!validating && (
          <>
            {!validationResult?.isValid && (
              <Button onClick={() => performValidation()} color="primary">
                Reintentar
              </Button>
            )}
            <Button 
              onClick={handleClose} 
              variant="contained"
              sx={{
                background: validationResult?.isValid 
                  ? clinicColors.gradients.primary 
                  : clinicColors.error
              }}
            >
              {validationResult?.isValid ? 'Continuar' : 'Cerrar'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeviceValidationModal;