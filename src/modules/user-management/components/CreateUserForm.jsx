// src/modules/user-management/components/CreateUserForm.jsx - VERSIÓN MEJORADA CON ORDEN CORRECTO

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Card,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  IconButton,
  CircularProgress,
  Box,
  Avatar,
  InputAdornment,
} from "@mui/material";
import {
  Save,
  Visibility,
  VisibilityOff,
  PersonAdd,
  ArrowBack,
  Person,
  Lock,
  Email,
  Phone,
  Badge as BadgeIcon,
  Business,
  Home,
} from "@mui/icons-material";
import { useUsers } from "../context/UserContext";
import { clinicColors } from "../../../app/theme";

const TITULOS = [
  { codigo: "Tec", descripcion: "Técnico" },
  { codigo: "Lic", descripcion: "Licenciado" },
  { codigo: "Ing", descripcion: "Ingeniero" },
  { codigo: "MSc", descripcion: "Master" },
  { codigo: "Doc", descripcion: "Doctor" },
  { codigo: "Phd", descripcion: "Doctor (PhD)" },
];

const GENEROS = [
  { codigo: "M", descripcion: "Masculino" },
  { codigo: "F", descripcion: "Femenino" },
];

const CreateUserForm = ({ onCancel }) => {
  const navigate = useNavigate();

  const {
    userForm,
    showPassword,
    sucursales,
    roles,
    loading,
    handleFormChange,
    handleCreateUserAPI,
    clearForm,
    setShowPassword,
    tipoUsuarios,
    setSelectedUser,
  } = useUsers();

  const [formKey, setFormKey] = useState(Date.now());

  useEffect(() => {
    console.log("🧹 CreateUserForm montado → LIMPIANDO TODO");
    clearForm();
    setSelectedUser(null);
    setFormKey(Date.now());
  }, []);

  const handleSave = async () => {
    const success = await handleCreateUserAPI();
    if (success) {
      clearForm();
      setSelectedUser(null);
      if (onCancel) {
        onCancel();
      } else {
        navigate("/users/list");
      }
    }
  };

  const handleCancel = () => {
    clearForm();
    setSelectedUser(null);
    if (onCancel) {
      onCancel();
    } else {
      navigate("/users/list");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header mejorado */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: `linear-gradient(135deg, ${clinicColors.secondary} 0%, ${clinicColors.secondaryLight} 100%)`,
          color: "white",
          borderRadius: 3,
          boxShadow: `0 8px 32px ${clinicColors.alpha.secondary30}`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-50%",
            right: "-50%",
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          },
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
              transform: "translateX(-4px)",
            },
            transition: "all 0.3s ease",
            position: "relative",
            zIndex: 1,
          }}
        >
          Volver a la lista
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Avatar
            sx={{
              background: "rgba(255,255,255,0.25)",
              width: 70,
              height: 70,
              border: "3px solid rgba(255,255,255,0.4)",
            }}
          >
            <PersonAdd sx={{ fontSize: "2.5rem", color: "white" }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Registrar Nuevo Usuario
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Complete el formulario con la información del usuario
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Formulario */}
      <Card
        key={formKey}
        sx={{
          p: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          borderRadius: 3,
          border: `1px solid ${clinicColors.alpha.primary10}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 4,
            rowGap: 4,
            justifyContent: "flex-start",
          }}
        >
          {/* ===================== PRIMERA FILA ===================== */}
          {/* 1. Nombre */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              1. Nombre Completo *
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese nombres"
              value={userForm.nombreCompleto || ""}
              onChange={handleFormChange("nombreCompleto")}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: clinicColors.primary }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* 2. Apellidos */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              2. Apellidos
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese apellidos"
              value={userForm.apellidos || ""}
              onChange={handleFormChange("apellidos")}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: clinicColors.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* 3. CI */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              3. Cédula de Identidad
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese cédula"
              value={userForm.cedula || ""}
              onChange={handleFormChange("cedula")}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: clinicColors.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* ===================== SEGUNDA FILA ===================== */}
          {/* 4. Usuario */}
          <Box sx={{ width: "465px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              4. Usuario *
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese nombre de usuario"
              value={userForm.usuario || ""}
              onChange={handleFormChange("usuario")}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: clinicColors.primary }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* 5. Password */}
          <Box sx={{ width: "465px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              5. Password *
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Ingrese contraseña"
              value={userForm.password || ""}
              onChange={handleFormChange("password")}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: clinicColors.error }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </Box>

          {/* ===================== TERCERA FILA ===================== */}
          {/* 6. Sucursal */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              6. Sucursal *
            </Typography>
            <FormControl fullWidth>
              <Select
                value={userForm.sucursal_ID || ""}
                onChange={handleFormChange("sucursal_ID")}
              >
                <MenuItem value="" disabled>
                  Seleccione sucursal
                </MenuItem>
                {sucursales.map((s) => (
                  <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                    {s.nombreSucursal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 7. Rol */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              7. Rol de Usuario *
            </Typography>
            <FormControl fullWidth>
              <Select
                value={userForm.rol_ID || ""}
                onChange={handleFormChange("rol_ID")}
              >
                <MenuItem value="" disabled>
                  Seleccione rol
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.rol_ID} value={role.rol_ID}>
                    {role.nombre_Rol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 8. Tipo Usuario */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              8. Tipo de Usuario *
            </Typography>
            <FormControl fullWidth>
              <Select
                value={userForm.tipoUsuarioInterno || ""}
                onChange={handleFormChange("tipoUsuarioInterno")}
              >
                <MenuItem value="" disabled>
                  Seleccione tipo
                </MenuItem>
                {tipoUsuarios.map((tipo) => (
                  <MenuItem key={tipo.codigo} value={tipo.codigo}>
                    {tipo.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* ===================== CUARTA FILA ===================== */}
          {/* 9. Título */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              9. Título
            </Typography>
            <FormControl fullWidth>
              <Select
                value={userForm.titulo || ""}
                onChange={handleFormChange("titulo")}
              >
                <MenuItem value="">Sin título</MenuItem>
                {TITULOS.map((t) => (
                  <MenuItem key={t.codigo} value={t.codigo}>
                    {t.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 10. Género */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              10. Género
            </Typography>
            <RadioGroup
              value={userForm.genero || "M"}
              onChange={handleFormChange("genero")}
              row
            >
              <FormControlLabel
                value="M"
                control={<Radio />}
                label="Masculino"
              />
              <FormControlLabel
                value="F"
                control={<Radio />}
                label="Femenino"
              />
            </RadioGroup>
          </Box>

          {/* ===================== QUINTA FILA ===================== */}
          {/* 11. Celular */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              11. Celular
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese celular"
              value={userForm.telefono || ""}
              onChange={handleFormChange("telefono")}
            />
          </Box>

          {/* 12. Email */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              12. Email *
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="Ingrese email"
              value={userForm.email || ""}
              onChange={handleFormChange("email")}
            />
          </Box>

          {/* 13. Dirección */}
          <Box sx={{ width: "630px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              13. Dirección
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese dirección"
              value={userForm.direccion || ""}
              onChange={handleFormChange("direccion")}
            />
          </Box>
        </Box>

        {/* ===================== BOTONES ===================== */}
        <Box mt={5} sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
          <Button variant="outlined" onClick={handleCancel}>
            Cancelar
          </Button>

          <Button variant="contained" onClick={handleSave}>
            Guardar Usuario
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default CreateUserForm;
