// src/modules/user-management/components/EditProfilePage.jsx - VERSIÓN CON LAYOUT MEJORADO

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  Box,
  TextField,
  Paper,
  Alert,
  Button,
  CircularProgress,
  Avatar,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Person,
  Phone,
  Email,
  Lock,
  Save,
  Cancel,
  CameraAlt,
  ArrowBack,
  Visibility,
  VisibilityOff,
  LocalHospital,
  Badge,
  Business,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { clinicColors } from "../../../app/theme";
import profileService from "../../../services/api/profileService";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    usuario: "",
    nombreCompleto: "",
    apellidos: "",
    telefono: "",
    email: "",
    password: "",
    confirmarPassword: "",
    sucursal: "",
    fotoPerfil: "",
  });

  useEffect(() => {
    cargarDatosPerfil();
  }, []);

  const cargarDatosPerfil = async () => {
    try {
      setLoading(true);
      const currentUser = profileService.getCurrentUserProfile();

      if (!currentUser || !currentUser.usuario) {
        enqueueSnackbar("No se encontró información del usuario", {
          variant: "error",
        });
        navigate("/dashboard");
        return;
      }

      setFormData({
        usuario: currentUser.usuario || "",
        nombreCompleto: currentUser.nombres || "",
        apellidos: currentUser.apellidos || "",
        telefono: currentUser.celular || "",
        email: currentUser.correo || "",
        password: "",
        confirmarPassword: "",
        sucursal: currentUser.sucursal || "",
        fotoPerfil: "",
      });

      console.log("✅ Perfil cargado:", {
        nombres: currentUser.nombres,
        apellidos: currentUser.apellidos,
        celular: currentUser.celular,
      });
    } catch (error) {
      console.error("❌ Error cargando perfil:", error);
      enqueueSnackbar("Error al cargar los datos del perfil", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (campo) => (event) => {
    setFormData({
      ...formData,
      [campo]: event.target.value,
    });
  };

  const handleSave = async () => {
    if (!formData.nombreCompleto || !formData.apellidos || !formData.email) {
      enqueueSnackbar("Complete todos los campos obligatorios", {
        variant: "error",
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmarPassword) {
      enqueueSnackbar("Las contraseñas no coinciden", { variant: "error" });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      enqueueSnackbar("La contraseña debe tener al menos 6 caracteres", {
        variant: "error",
      });
      return;
    }

    try {
      setSaving(true);
      const result = await profileService.updateProfile(formData);

      if (result.success) {
        enqueueSnackbar("Perfil actualizado correctamente", {
          variant: "success",
        });
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmarPassword: "",
        }));

        if (formData.password) {
          enqueueSnackbar(
            "Para aplicar el cambio de contraseña, cierre sesión",
            {
              variant: "info",
              autoHideDuration: 5000,
            }
          );
        }
      } else {
        enqueueSnackbar(result.message || "Error al actualizar perfil", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error al guardar los cambios", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: clinicColors.primary }} size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header mejorado */}
      <Paper
        sx={{
          p: 4,
          background: `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryLight} 100%)`,
          color: "white",
          borderRadius: 4,
          mb: 4,
          boxShadow: `0 12px 40px ${clinicColors.alpha.primary30}`,
          position: "relative",
          overflow: "hidden",
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          }
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={handleCancel}
          sx={{
            color: "white",
            mb: 2,
            "&:hover": { 
              bgcolor: "rgba(255,255,255,0.15)",
              transform: 'translateX(-4px)'
            },
            transition: 'all 0.3s ease',
            position: 'relative',
            zIndex: 1
          }}
        >
          Volver al Dashboard
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={
                formData.fotoPerfil
                  ? `https://api-core.farmadinamica.com.bo${formData.fotoPerfil}`
                  : undefined
              }
              sx={{
                width: 100,
                height: 100,
                bgcolor: "rgba(255,255,255,0.25)",
                fontSize: "2.5rem",
                fontWeight: 800,
                border: '4px solid rgba(255,255,255,0.4)',
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              {!formData.fotoPerfil &&
                `${formData.nombreCompleto?.charAt(0)}${formData.apellidos?.charAt(0)}`}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                width: 35,
                height: 35,
                borderRadius: '50%',
                bgcolor: clinicColors.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                border: '3px solid white'
              }}
            >
              <LocalHospital sx={{ fontSize: '1.2rem', color: 'white' }} />
            </Box>
          </Box>

          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Editar Mi Perfil
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Badge sx={{ fontSize: '1rem' }} />
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>
                {formData.usuario}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Consultorio Médico DINAMAX • Sistema de Gestión
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Formulario con layout organizado */}
      <Card sx={{ 
        p: 4, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        borderRadius: 4,
        border: `1px solid ${clinicColors.alpha.primary10}`
      }}>
        {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: clinicColors.primaryDark,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Person />
            Información Personal
          </Typography>

          <Grid container spacing={3}>
            {/* Fila 1: Nombres y Apellidos */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Nombres"
                value={formData.nombreCompleto}
                onChange={handleChange("nombreCompleto")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                    },
                    "&.Mui-focused": {
                      "& fieldset": {
                        borderColor: clinicColors.primary,
                        borderWidth: 2
                      }
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: clinicColors.primary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Apellidos"
                value={formData.apellidos}
                onChange={handleChange("apellidos")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                    },
                    "&.Mui-focused": {
                      "& fieldset": {
                        borderColor: clinicColors.primary,
                        borderWidth: 2
                      }
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: clinicColors.primary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Fila 2: Teléfono y Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Teléfono / Celular"
                value={formData.telefono}
                onChange={handleChange("telefono")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                    },
                    "&.Mui-focused": {
                      "& fieldset": {
                        borderColor: clinicColors.primary,
                        borderWidth: 2
                      }
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: clinicColors.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Correo Electrónico"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                    },
                    "&.Mui-focused": {
                      "& fieldset": {
                        borderColor: clinicColors.primary,
                        borderWidth: 2
                      }
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: clinicColors.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* SECCIÓN 2: CAMBIAR CONTRASEÑA */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: clinicColors.primaryDark,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Lock />
            Cambiar Contraseña (Opcional)
          </Typography>

          <Grid container spacing={3}>
            {/* Nueva Contraseña */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nueva Contraseña"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange("password")}
                placeholder="Dejar vacío para no cambiar"
                helperText="Mínimo 6 caracteres"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                    },
                    "&.Mui-focused": {
                      "& fieldset": {
                        borderColor: clinicColors.primary,
                        borderWidth: 2
                      }
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: clinicColors.error }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: clinicColors.secondary }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Confirmar Contraseña */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirmar Nueva Contraseña"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmarPassword}
                onChange={handleChange("confirmarPassword")}
                placeholder="Repetir contraseña"
                disabled={!formData.password}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                    },
                    "&.Mui-focused": {
                      "& fieldset": {
                        borderColor: clinicColors.primary,
                        borderWidth: 2
                      }
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: clinicColors.error }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={!formData.password}
                        sx={{ color: clinicColors.secondary }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* SECCIÓN 3: PUNTO DE VENTA */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: clinicColors.primaryDark,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Business />
            Punto de Venta / Sucursal
          </Typography>

          <TextField
            fullWidth
            label="Sucursal Asignada"
            value={formData.sucursal}
            disabled
            helperText="Para cambiar de sucursal, contacte al administrador del sistema"
            sx={{ 
              "& .Mui-disabled": { 
                bgcolor: clinicColors.alpha.primary10,
                '& .MuiInputBase-input': {
                  WebkitTextFillColor: clinicColors.primaryDark,
                  fontWeight: 600
                }
              } 
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business sx={{ color: clinicColors.secondary }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Alert de información */}
        <Alert
          severity="info"
          icon={<Lock />}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${clinicColors.alpha.primary20}`,
            bgcolor: clinicColors.alpha.primary10
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            <strong>Importante:</strong> Los cambios de contraseña requieren
            cerrar sesión para aplicarse correctamente.
          </Typography>
        </Alert>

        {/* Botones de acción */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
            mt: 4,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={handleCancel}
            disabled={saving}
            size="large"
            sx={{
              borderColor: clinicColors.secondary,
              color: clinicColors.secondary,
              borderWidth: 2,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 2,
              "&:hover": {
                borderWidth: 2,
                borderColor: clinicColors.secondaryDark,
                bgcolor: clinicColors.alpha.secondary10,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Save />
              )
            }
            onClick={handleSave}
            disabled={saving}
            size="large"
            sx={{
              background: `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryLight} 100%)`,
              color: "white",
              px: 4,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: `0 8px 24px ${clinicColors.alpha.primary30}`,
              "&:hover": {
                background: `linear-gradient(135deg, ${clinicColors.primaryDark} 0%, ${clinicColors.primary} 100%)`,
                transform: "translateY(-2px)",
                boxShadow: `0 12px 32px ${clinicColors.alpha.primary30}`,
              },
              "&.Mui-disabled": { background: "#ccc", color: "#666" },
              transition: 'all 0.3s ease'
            }}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default EditProfilePage;