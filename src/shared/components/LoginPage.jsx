// src/shared/components/LoginPage.jsx - VERSIÓN MEJORADA CONSULTORIO MÉDICO DINAMAX

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  LocalHospital,
} from '@mui/icons-material';
import NetworkValidationService from '../../services/networkValidation';
import ErrorDialog from '../../components/ErrorDialog';
import { clinicColors } from '../../app/theme';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    errorType: 'default',
    autoClose: false,
  });

  const { login } = useAuth();

  const handleError = (error) => {
    let config = {
      title: 'Error',
      message: '',
      errorType: 'default',
      autoClose: false,
    };

    const errorMsg = error.message?.toLowerCase() || '';
    
    if (errorMsg.includes('contraseña') || errorMsg.includes('password') || error.code === 401) {
      config = {
        title: 'Contraseña Incorrecta',
        message: 'La contraseña que ingresaste no es correcta. Por favor, verifica e intenta nuevamente.',
        errorType: 'password',
        autoClose: false,
      };
    } else if (errorMsg.includes('usuario') || errorMsg.includes('no encontrado') || errorMsg.includes('not found')) {
      config = {
        title: 'Usuario No Encontrado',
        message: 'El usuario que ingresaste no existe en el sistema. Verifica que esté escrito correctamente.',
        errorType: 'user',
        autoClose: false,
      };
    } else if (errorMsg.includes('bloqueado') || errorMsg.includes('suspendido') || error.code === 403) {
      config = {
        title: 'Usuario Bloqueado',
        message: 'Tu usuario ha sido bloqueado. Por favor, contacta al administrador del sistema.',
        errorType: 'user',
        autoClose: false,
      };
    } else if (errorMsg.includes('conexión') || errorMsg.includes('conectar') || error.code === 0) {
      config = {
        title: 'Sin Conexión',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.',
        errorType: 'connection',
        autoClose: false,
      };
    } else if (errorMsg.includes('servidor') || error.code === 500) {
      config = {
        title: 'Error del Servidor',
        message: 'El servidor está experimentando problemas. Por favor, intenta nuevamente en unos momentos.',
        errorType: 'server',
        autoClose: false,
      };
    } else if (error.code === 404) {
      config = {
        title: 'Servicio No Disponible',
        message: 'El servicio de autenticación no está disponible. Contacta al administrador.',
        errorType: 'server',
        autoClose: false,
      };
    } else {
      config = {
        title: 'Error al Iniciar Sesión',
        message: error.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        errorType: 'default',
        autoClose: false,
      };
    }

    setDialogConfig(config);
    setDialogOpen(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔍 Detectando IP local...');
      let localIP;
      
      try {
        localIP = await NetworkValidationService.getLocalIP();
        console.log('✅ IP local detectada:', localIP);
      } catch (ipError) {
        console.warn('⚠️ No se pudo detectar IP, usando fallback');
        localIP = '192.168.0.1';
      }

      console.log('🔐 Intentando login con API...');
      const loginResult = await login({
        nombreUsuario: usuario,
        password: contrasena,
        direccion_IP: localIP,
      });

      if (loginResult.success) {
        setDialogConfig({
          title: '¡Bienvenido!',
          message: `Inicio de sesión exitoso.\nIP detectada: ${localIP}`,
          errorType: 'success',
          autoClose: true,
        });
        setDialogOpen(true);
      } else {
        throw new Error(loginResult.message);
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${clinicColors.primaryDark} 0%, ${clinicColors.primary} 50%, ${clinicColors.secondaryDark} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'pulse 15s ease-in-out infinite',
          },
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.1)', opacity: 0.8 },
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Logo y título */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                position: 'relative',
              }}
            >
              {/* Logo médico mejorado */}
              <Box
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '50%',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  mr: 2,
                }}
              >
                <LocalHospital
                  sx={{
                    fontSize: '3rem',
                    color: 'white',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  }}
                />
              </Box>

              <Box sx={{ textAlign: 'left' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    letterSpacing: '1px',
                    lineHeight: 1.2,
                  }}
                >
                  CONSULTORIO
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    letterSpacing: '1px',
                    lineHeight: 1.2,
                  }}
                >
                  MÉDICO{' '}
                  <Box
                    component="span"
                    sx={{
                      color: clinicColors.warning,
                      textShadow: '0 0 20px rgba(255,167,38,0.5)',
                    }}
                  >
                    DINAMAX
                  </Box>
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 300,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              Sistema de Gestión Médica
            </Typography>
          </Box>

          {/* Card de login con glassmorphism */}
          <Card
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.5)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 5 }}>
              <Typography
                variant="h4"
                sx={{
                  textAlign: 'center',
                  mb: 1,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.secondary} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Iniciar Sesión
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  mb: 4,
                  color: clinicColors.light.text.secondary,
                }}
              >
                Ingresa tus credenciales para acceder al sistema -RVH
              </Typography>

              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Usuario"
                  variant="outlined"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={loading}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: loading ? '#f5f5f5' : 'white',
                      transition: 'all 0.3s ease',
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 20px ${clinicColors.alpha.primary20}`,
                        '& fieldset': {
                          borderColor: clinicColors.primary,
                          borderWidth: '2px',
                        },
                      },
                      '&:hover:not(.Mui-focused) fieldset': {
                        borderColor: clinicColors.primaryLight,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: clinicColors.primary,
                      fontWeight: 600,
                    },
                  }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person
                          sx={{
                            color: clinicColors.primary,
                            fontSize: '1.5rem',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  disabled={loading}
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: loading ? '#f5f5f5' : 'white',
                      transition: 'all 0.3s ease',
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 20px ${clinicColors.alpha.primary20}`,
                        '& fieldset': {
                          borderColor: clinicColors.primary,
                          borderWidth: '2px',
                        },
                      },
                      '&:hover:not(.Mui-focused) fieldset': {
                        borderColor: clinicColors.primaryLight,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: clinicColors.primary,
                      fontWeight: 600,
                    },
                  }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock
                          sx={{
                            color: clinicColors.primary,
                            fontSize: '1.5rem',
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                          sx={{
                            color: clinicColors.primary,
                            '&:hover': {
                              bgcolor: clinicColors.alpha.primary10,
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 2.5,
                    background: loading
                      ? '#cccccc'
                      : `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryLight} 100%)`,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    textTransform: 'none',
                    letterSpacing: '0.5px',
                    boxShadow: loading
                      ? 'none'
                      : `0 8px 24px ${clinicColors.alpha.primary30}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: loading
                        ? '#cccccc'
                        : `linear-gradient(135deg, ${clinicColors.primaryDark} 0%, ${clinicColors.primary} 100%)`,
                      boxShadow: loading
                        ? 'none'
                        : `0 12px 32px ${clinicColors.alpha.primary30}`,
                      transform: loading ? 'none' : 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: clinicColors.alpha.primary20,
                      color: 'rgba(255,255,255,0.8)',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                      <span>Validando acceso...</span>
                    </Box>
                  ) : (
                    'Ingresar al Sistema'
                  )}
                </Button>
              </Box>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: clinicColors.light.text.secondary,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                  }}
                >
                  Consultorio Médico DINAMAX S.R.L.
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: clinicColors.light.text.secondary,
                    fontSize: '0.75rem',
                    mt: 0.5,
                  }}
                >
                  Sistema seguro v1.0
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Dialog de errores/éxito */}
      <ErrorDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        title={dialogConfig.title}
        message={dialogConfig.message}
        errorType={dialogConfig.errorType}
        autoClose={dialogConfig.autoClose}
        autoCloseDelay={2000}
      />
    </>
  );
}

export default LoginPage;