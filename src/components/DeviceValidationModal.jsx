// src/components/DeviceValidationModal.jsx - Con colores corporativos Farma Dinámica
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  Computer,
  Wifi,
  Security,
} from "@mui/icons-material";
import { clinicColors } from '/src/app/theme'; // Importar colores corporativos

const DeviceValidationModal = ({
  open,
  validationResult,
  onContinue,
  onCancel,
}) => {
  if (!validationResult) return null;

  const { success, detectedIP, expectedIPs, nombreEquipo, message, error } =
    validationResult;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          // Solo permitir cerrar con ESC, no con click fuera
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          pb: 2,
          pt: 3,
          background: success
            ? clinicColors.secondary // Azul corporativo para éxito
            : error
            ? clinicColors.primary // Naranja corporativo para advertencia
            : '#dc3545', // Rojo para error
          color: "white",
        }}
      >
        {/* Logo corporativo en el header */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                width: 32,
                height: 32,
                mr: 1.5
              }}
            >
              {/* Cruz naranja */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 6,
                  left: 12,
                  width: 8,
                  height: 20,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  borderRadius: '4px'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 6,
                  width: 20,
                  height: 8,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  borderRadius: '4px'
                }}
              />
              {/* Cruz azul */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 14,
                  width: 6,
                  height: 16,
                  bgcolor: 'rgba(255,255,255,0.7)',
                  borderRadius: '3px',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 14,
                  left: 8,
                  width: 16,
                  height: 6,
                  bgcolor: 'rgba(255,255,255,0.7)',
                  borderRadius: '3px',
                }}
              />
            </Box>
            
            <Typography variant="body1" sx={{ 
              fontWeight: 600,
              color: 'white',
              fontSize: '0.95rem'
            }}>
              FARMA DINÁMICA
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {success ? (
            <CheckCircle sx={{ fontSize: 28 }} />
          ) : (
            <Error sx={{ fontSize: 28 }} />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {success
              ? "Dispositivo Autorizado"
              : error
              ? "Error de Validación"
              : "Acceso Denegado"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3 }}>
        {/* Información del dispositivo detectado */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ 
              mb: 1, 
              display: "flex", 
              alignItems: "center", 
              gap: 1,
              color: clinicColors.secondary,
              fontWeight: 600
            }}
          >
            <Wifi sx={{ color: clinicColors.primary }} />
            IP Detectada:
          </Typography>
          <Chip
            label={detectedIP || "No detectada"}
            sx={{ 
              fontFamily: "monospace",
              bgcolor: detectedIP ? clinicColors.primary : '#e9ecef',
              color: detectedIP ? 'white' : '#6c757d',
              fontWeight: 600
            }}
          />
        </Box>

        {/* Información del equipo asignado */}
        {nombreEquipo && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ 
                mb: 1, 
                display: "flex", 
                alignItems: "center", 
                gap: 1,
                color: clinicColors.secondary,
                fontWeight: 600
              }}
            >
              <Computer sx={{ color: clinicColors.secondary }} />
              Equipo Asignado:
            </Typography>
            <Chip
              label={nombreEquipo}
              sx={{
                bgcolor: clinicColors.secondary,
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
        )}

        {/* IPs permitidas para el equipo */}
        {expectedIPs && expectedIPs.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ 
                mb: 1, 
                display: "flex", 
                alignItems: "center", 
                gap: 1,
                color: clinicColors.secondary,
                fontWeight: 600
              }}
            >
              <Security sx={{ color: clinicColors.secondary }} />
              IPs Autorizadas:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {expectedIPs.map((ip, index) => (
                <Chip
                  key={index}
                  label={ip}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontFamily: "monospace",
                    borderColor: ip === detectedIP ? clinicColors.secondary : clinicColors.alpha.secondary30,
                    color: ip === detectedIP ? clinicColors.secondary : clinicColors.secondary,
                    bgcolor: ip === detectedIP ? clinicColors.alpha.secondary10 : 'transparent',
                    fontWeight: ip === detectedIP ? 600 : 400
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ 
          my: 2,
          borderColor: clinicColors.alpha.secondary20
        }} />

        {/* Mensaje de resultado */}
        <Alert
          severity={success ? "success" : error ? "warning" : "error"}
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: success ? clinicColors.secondary : error ? clinicColors.primary : '#dc3545'
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {message}
          </Typography>

          {!success && !error && (
            <Typography
              variant="caption"
              sx={{ 
                display: "block", 
                mt: 1, 
                opacity: 0.8,
                color: 'text.secondary'
              }}
            >
              Por favor, contacte al administrador del sistema para autorizar
              este dispositivo.
            </Typography>
          )}
        </Alert>

        {/* Mensaje de confirmación para dispositivos autorizados */}
        {success && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: clinicColors.secondary,
            borderRadius: 2,
            border: `1px solid ${clinicColors.secondaryDark}`
          }}>
            <Typography variant="body2" sx={{ 
              color: clinicColors.secondaryWhite,
              textAlign: 'center',
              fontWeight: 500
            }}>
              ✓ Dispositivo autorizado: {nombreEquipo}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {success ? (
          <Button
            onClick={onContinue}
            variant="contained"
            fullWidth
            size="large"
            sx={{
              py: 2,
              fontWeight: 600,
              bgcolor: clinicColors.secondary, // Azul corporativo para éxito
              color: 'white',
              borderRadius: 2,
              "&:hover": {
                bgcolor: clinicColors.secondaryDark,
                transform: "translateY(-1px)",
                boxShadow: `0 6px 20px ${clinicColors.alpha.secondary30}`,
              },
            }}
          >
            Continuar al Sistema
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Button
              onClick={onCancel}
              variant="outlined"
              fullWidth
              size="large"
              sx={{ 
                py: 2,
                borderColor: clinicColors.secondary,
                color: clinicColors.secondary,
                borderRadius: 2,
                '&:hover': {
                  borderColor: clinicColors.secondaryDark,
                  bgcolor: clinicColors.alpha.secondary10
                }
              }}
            >
              Volver al Login
            </Button>
            {error && (
              <Button
                onClick={onContinue}
                variant="contained"
                fullWidth
                size="large"
                sx={{ 
                  py: 2,
                  bgcolor: clinicColors.primary,
                  color: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: clinicColors.primaryDark
                  }
                }}
              >
                Continuar sin validar
              </Button>
            )}
          </Box>
        )}
      </DialogActions>

      {/* Footer corporativo */}
      <Box sx={{ 
        textAlign: 'center', 
        py: 1, 
        px: 3,
        bgcolor: '#f8f9fa',
        borderTop: `1px solid ${clinicColors.alpha.secondary20}`
      }}>
        <Typography variant="caption" sx={{ 
          color: clinicColors.secondary,
          fontSize: '0.75rem'
        }}>
          Farma Dinámica v1.0 • Sistema seguro
        </Typography>
      </Box>
    </Dialog>
  );
};

export default DeviceValidationModal;