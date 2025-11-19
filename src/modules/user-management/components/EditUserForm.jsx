// src/modules/user-management/components/EditUserForm.jsx - VERSIÓN MEJORADA CON ORDEN CORRECTO

import React, { useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Card,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  IconButton,
  Alert,
  CircularProgress,
  Box,
  Avatar,
  InputAdornment,
} from "@mui/material";
import {
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Edit as EditIcon,
  ArrowBack,
  Person,
  Lock,
  Email,
  Phone,
  Badge as BadgeIcon,
  Business,
  Home,
  Info,
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

const EditUserForm = ({ onCancel }) => {
  const {
    userForm,
    showPassword,
    selectedUser,
    sucursales,
    roles,
    loading,
    handleFormChange,
    handleUpdateUserAPI,
    clearForm,
    setShowPassword,
    loadUserDetail,
    tipoUsuarios,
  } = useUsers();

  useEffect(() => {
    if (selectedUser && selectedUser.id) {
      console.log("📄 Cargando detalles del usuario ID:", selectedUser.id);
      loadUserDetail(selectedUser.id);
    }
  }, [selectedUser?.id]);

  const handleSave = async () => {
    const success = await handleUpdateUserAPI();
    if (success) {
      clearForm();
      if (onCancel) {
        onCancel();
      }
    }
  };

  const handleCancel = () => {
    clearForm();
    if (onCancel) {
      onCancel();
    }
  };

  if (
    !selectedUser &&
    !userForm.usuario &&
    !userForm.nombreCompleto &&
    !userForm.email
  ) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress sx={{ color: clinicColors.primary }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Cargando datos del usuario...
          </Typography>
        </Paper>
      </Container>
    );
  }

  const userToEdit = selectedUser || {
    nombreCompleto: userForm.nombreCompleto
      ? `${userForm.nombreCompleto} ${userForm.apellidos}`
      : "Usuario",
    fechaCreacion: "N/A",
    ultimoAcceso: "N/A",
    estado: "N/A",
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header mejorado */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryLight} 100%)`,
          color: "white",
          borderRadius: 3,
          boxShadow: `0 8px 32px ${clinicColors.alpha.primary30}`,
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
              fontSize: "1.8rem",
              fontWeight: 800,
            }}
          >
            {userToEdit.nombreCompleto
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Editar Usuario: {userToEdit.nombreCompleto}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Modificar información del usuario existente
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Formulario */}
      <Card
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
              required
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
          {/* 4. Usuario (no editable) */}
          <Box sx={{ width: "465px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              4. Usuario
            </Typography>
            <TextField
              fullWidth
              disabled
              value={userForm.usuario || ""}
              helperText="El nombre de usuario no puede modificarse"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: clinicColors.primary }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root.Mui-disabled": {
                  bgcolor: clinicColors.alpha.primary10,
                },
              }}
            />
          </Box>

          {/* 5. Nueva Password */}
          <Box sx={{ width: "465px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              5. Nueva Password (Opcional)
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Dejar vacío para mantener actual"
              value={userForm.password || ""}
              onChange={(e) => {
                if (/\s/.test(e.target.value)) return;
                handleFormChange("password")(e);
              }}
              disabled={loading}
              helperText="Completar solo si desea cambiar la contraseña"
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
                disabled={loading}
                displayEmpty
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

          {/* 7. Rol (disabled) */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              7. Rol de Usuario
            </Typography>
            <FormControl fullWidth>
              <Select value={userForm.rol_ID || ""} disabled>
                {roles.map((role) => (
                  <MenuItem key={role.rol_ID} value={role.rol_ID}>
                    {role.nombre_Rol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 8. Tipo Usuario (disabled) */}
          <Box sx={{ width: "300px" }}>
            <Typography
              sx={{ fontWeight: 700, mb: 1, color: clinicColors.primaryDark }}
            >
              8. Tipo de Usuario
            </Typography>
            <FormControl fullWidth>
              <Select value={userForm.tipoUsuarioInterno || ""} disabled>
                {tipoUsuarios.map((t) => (
                  <MenuItem key={t.codigo} value={t.codigo}>
                    {t.descripcion}
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
              row
              value={userForm.genero || "M"}
              onChange={handleFormChange("genero")}
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
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: clinicColors.secondary }} />
                  </InputAdornment>
                ),
              }}
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
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: clinicColors.primary }} />
                  </InputAdornment>
                ),
              }}
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
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home sx={{ color: clinicColors.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        {/* ===================== INFORMACIÓN ADICIONAL ===================== */}
        <Box sx={{ mt: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              background: clinicColors.alpha.secondary10,
            }}
          >
            <Typography
              sx={{ fontWeight: 600, mb: 1, color: clinicColors.primaryDark }}
            >
              Información del usuario
            </Typography>
            <Typography variant="body2">
              • Creado: {userToEdit.fechaCreacion} <br />• Último acceso:{" "}
              {userToEdit.ultimoAcceso} <br />• Estado: {userToEdit.estado}
            </Typography>
          </Paper>
        </Box>

        {/* ===================== BOTONES ===================== */}
        <Box mt={5} sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            startIcon={<Cancel />}
          >
            Cancelar
          </Button>

          <Button variant="contained" onClick={handleSave} startIcon={<Save />}>
            Actualizar Usuario
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default EditUserForm;
