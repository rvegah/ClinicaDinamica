// src/modules/user-management/components/UserList.jsx - VERSIÓN MEJORADA DINAMAX

import React, { useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tabs,
  Tab,
  Badge,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  Business,
  SupervisorAccount,
  AccessTime,
  VpnKey,
  People,
  PersonAdd,
} from "@mui/icons-material";
import { useUsers } from "../context/UserContext";
import { clinicColors } from "../../../app/theme";

const UserList = ({
  onCreateUser,
  onEditUser,
  onAssignPermissions,
  onAssignSchedule,
}) => {
  const {
    filteredUsers,
    users,
    selectedTab,
    searchTerm,
    filterRole,
    currentUserSucursal,
    isAdmin,
    roles,
    handleTabChange,
    setSearchTerm,
    setFilterRole,
    handleDeleteUser,
    prepareEditUser,
    loadUsuarios,
    clearForm,
  } = useUsers();

  useEffect(() => {
    console.log("🔁 Montando UserList → recargando usuarios...");
    loadUsuarios(false);
  }, []);

  const handleEditClick = (user) => {
    prepareEditUser(user);
    onEditUser(user);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header mejorado */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar
            sx={{
              background: clinicColors.gradients.primary,
              width: 50,
              height: 50
            }}
          >
            <People />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: clinicColors.primaryDark,
              }}
            >
              Gestión de Usuarios
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Administración y control de usuarios del sistema
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs de sucursales mejorados */}
      {isAdmin && (
        <Paper
          sx={{
            mb: 3,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: `1px solid ${clinicColors.alpha.primary10}`
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                minHeight: 56,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#6B7280",
                transition: 'all 0.3s ease',
                "&.Mui-selected": {
                  color: clinicColors.primary,
                  fontWeight: 700,
                },
                "&:hover": {
                  bgcolor: clinicColors.alpha.primary10,
                }
              },
              "& .MuiTabs-indicator": {
                backgroundColor: clinicColors.primary,
                height: 4,
                borderRadius: '4px 4px 0 0'
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Business fontSize="small" />
                  <span>MI SUCURSAL</span>
                  <Chip
                    label={
                      users.filter((u) => u.sucursal === currentUserSucursal)
                        .length
                    }
                    size="small"
                    sx={{
                      bgcolor: clinicColors.primary,
                      color: 'white',
                      height: 24,
                      fontSize: "0.75rem",
                      fontWeight: 700
                    }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <SupervisorAccount fontSize="small" />
                  <span>TODAS LAS SUCURSALES</span>
                  <Chip
                    label={users.length}
                    size="small"
                    sx={{
                      bgcolor: clinicColors.secondary,
                      color: 'white',
                      height: 24,
                      fontSize: "0.75rem",
                      fontWeight: 700
                    }}
                  />
                </Box>
              }
            />
          </Tabs>
        </Paper>
      )}

      {/* Filtros y controles mejorados */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: `1px solid ${clinicColors.alpha.primary10}`
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Buscar por usuario,nombre,email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  width: '300px',
                  "&:hover": {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                  },
                  "&.Mui-focused": {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${clinicColors.alpha.primary20}`,
                    "& fieldset": {
                      borderColor: clinicColors.primary,
                      borderWidth: 2
                    }
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: clinicColors.primary, fontSize: '1.5rem' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ 
                color: "text.secondary",
                "&.Mui-focused": {
                  color: clinicColors.primary,
                  fontWeight: 600
                }
              }}>
                Filtrar por rol
              </InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Filtrar por rol"
                startAdornment={
                  <FilterList sx={{ color: clinicColors.secondary, mr: 1 }} />
                }
                sx={{
                  borderRadius: 2,
                  width: '200px',
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                  },
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: clinicColors.primary,
                      borderWidth: 2
                    },
                  },
                }}
              >
                <MenuItem value="">Todos los roles</MenuItem>
                {roles && roles.length > 0 ? (
                  roles.map((role) => (
                    <MenuItem
                      key={role.rol_ID}
                      value={role.nombre_Rol}
                      sx={{
                        "&:hover": {
                          bgcolor: clinicColors.alpha.primary10,
                        },
                        "&.Mui-selected": {
                          bgcolor: clinicColors.alpha.primary20,
                          fontWeight: 600
                        },
                      }}
                    >
                      {role.nombre_Rol}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Cargando roles...</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid
            item
            xs={12}
            md={3}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => {
                clearForm();
                onCreateUser();
              }}
              size="large"
              sx={{
                background: `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryLight} 100%)`,
                color: "white",
                px: 3,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: `0 6px 20px ${clinicColors.alpha.primary30}`,
                transition: 'all 0.3s ease',
                "&:hover": {
                  background: `linear-gradient(135deg, ${clinicColors.primaryDark} 0%, ${clinicColors.primary} 100%)`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 10px 30px ${clinicColors.alpha.primary30}`,
                },
              }}
            >
              Nuevo Usuario
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de usuarios mejorada */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          border: `1px solid ${clinicColors.alpha.primary10}`,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead 
            sx={{ 
              background: `linear-gradient(135deg, ${clinicColors.alpha.primary10} 0%, ${clinicColors.alpha.secondary10} 100%)`
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: clinicColors.primaryDark, fontSize: '0.9rem' }}>
                Avatar
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: clinicColors.primaryDark, fontSize: '0.9rem' }}>
                Usuario
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: clinicColors.primaryDark, fontSize: '0.9rem' }}>
                Nombre Completo
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: clinicColors.primaryDark, fontSize: '0.9rem' }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: clinicColors.primaryDark, fontSize: '0.9rem' }}>
                Rol
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: clinicColors.primaryDark, fontSize: '0.9rem' }}>
                Estado
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: clinicColors.primaryDark, fontSize: '0.9rem' }}>
                Último Acceso
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: clinicColors.primaryDark, fontSize: '0.9rem' }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow
                key={user.id}
                hover
                sx={{
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    bgcolor: clinicColors.alpha.primary10,
                    transform: 'scale(1.01)',
                    boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                  },
                  bgcolor: index % 2 === 0 ? 'white' : '#fafafa'
                }}
              >
                <TableCell>
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryLight} 100%)`,
                      width: 45,
                      height: 45,
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      border: `2px solid ${clinicColors.alpha.primary20}`,
                      boxShadow: `0 4px 12px ${clinicColors.alpha.primary20}`
                    }}
                  >
                    {user.nombreCompleto
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: clinicColors.primaryDark,
                    }}
                  >
                    {user.usuario}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.nombreCompleto}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.rol}
                    size="small"
                    sx={{
                      bgcolor:
                        user.rol === "Administrador"
                          ? clinicColors.error
                          : user.rol === "Farmacéutico"
                          ? clinicColors.secondary
                          : clinicColors.primary,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.estado}
                    size="small"
                    color={
                      user.estado === "Activo" || user.estado === "Habilitado"
                        ? "success"
                        : "error"
                    }
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {user.ultimoAcceso}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(user)}
                      sx={{
                        color: clinicColors.primary,
                        bgcolor: clinicColors.alpha.primary10,
                        transition: 'all 0.3s ease',
                        "&:hover": {
                          bgcolor: clinicColors.primary,
                          color: 'white',
                          transform: 'scale(1.1)'
                        },
                      }}
                      title="Editar usuario"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        prepareEditUser(user);
                        onAssignPermissions(user);
                      }}
                      sx={{
                        color: clinicColors.secondary,
                        bgcolor: clinicColors.alpha.secondary10,
                        transition: 'all 0.3s ease',
                        "&:hover": {
                          bgcolor: clinicColors.secondary,
                          color: 'white',
                          transform: 'scale(1.1)'
                        },
                      }}
                      title="Asignar permisos"
                    >
                      <VpnKey fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        prepareEditUser(user);
                        onAssignSchedule(user);
                      }}
                      sx={{
                        color: clinicColors.primaryDark,
                        bgcolor: clinicColors.alpha.primary10,
                        transition: 'all 0.3s ease',
                        "&:hover": {
                          bgcolor: clinicColors.primaryDark,
                          color: 'white',
                          transform: 'scale(1.1)'
                        },
                      }}
                      title="Asignar horarios"
                    >
                      <AccessTime fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mensaje cuando no hay usuarios */}
      {filteredUsers.length === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            mt: 3,
            borderRadius: 3,
            border: `2px dashed ${clinicColors.alpha.primary30}`,
            bgcolor: clinicColors.alpha.primary10
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: clinicColors.alpha.primary20,
              color: clinicColors.primary,
              margin: '0 auto',
              mb: 2
            }}
          >
            <People sx={{ fontSize: '3rem' }} />
          </Avatar>
          <Typography variant="h6" sx={{ color: clinicColors.primaryDark, fontWeight: 700, mb: 1 }}>
            No se encontraron usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Intenta ajustar los filtros de búsqueda
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default UserList;