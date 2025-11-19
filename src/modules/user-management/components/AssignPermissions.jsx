// src/modules/user-management/components/AssignPermissions.jsx - VERSIÓN MEJORADA DINAMAX

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  Alert,
  Switch,
  Avatar,
  Badge,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  ExpandMore,
  Person,
  Save,
  Cancel,
  CheckCircle,
  SelectAll,
  ClearAll as DeselectAll,
  VpnKey,
  Business,
  ArrowBack,
  Info,
} from "@mui/icons-material";
import { useUsers } from "../context/UserContext";
import { clinicColors } from "../../../app/theme";

const ROLES_ORDER = [
  "Administrador",
  "Contador",
  "Farmacéutico",
  "Vendedor",
  "Bioquimico",
  "Supervisor",
  "Laboratorista",
];

const EXCLUDED_ROLES = ["SISTEMAS", "Sistemas", "IMPUESTOS", "Impuestos"];

const AssignPermissions = ({ onCancel }) => {
  const {
    users,
    sucursales,
    roles,
    loading,
    selectedUser,
    getMenuEstructura,
    getRoleTemplatePermissionsReal,
    saveUserPermissionsReal,
    codigoEmpleado,
  } = useUsers();

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedSucursalId, setSelectedSucursalId] = useState("");
  const [selectedRolId, setSelectedRolId] = useState("");
  const [userPermissions, setUserPermissions] = useState(new Set());
  const [menuStructure, setMenuStructure] = useState([]);
  const [expandedPanels, setExpandedPanels] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRoleName, setPendingRoleName] = useState("");

  const currentUser = users.find((u) => u.id === parseInt(selectedUserId));

  useEffect(() => {
    if (selectedUser?.id && selectedUserId === "") {
      console.log("🎯 Auto-seleccionando usuario:", selectedUser.nombreCompleto);
      setSelectedUserId(selectedUser.id.toString());
      setSelectedSucursalId(selectedUser.sucursal_ID || "");
      setSelectedRolId(selectedUser.rol_ID || "");

      if (selectedUser.rol) {
        handleUserChange({ target: { value: selectedUser.id.toString() } });
      }
    }
  }, [selectedUser]);

  const loadUserPermissions = async (usuarioId) => {
    try {
      setLoadingMenu(true);
      console.log(`📡 Cargando permisos para usuario ID ${usuarioId}...`);

      const menuData = await getMenuEstructura(usuarioId);

      const normalizedData = menuData.map((modulo) => ({
        opcion_ID: modulo.codigoOpcion_ID || modulo.opcion_ID,
        nombreOpcion: modulo.nombreOpcion,
        descripcion: modulo.descripcion,
        estado: modulo.estado,
        opcionesSubMenu: (
          modulo.subOpcionesMenu ||
          modulo.opcionesSubMenu ||
          []
        ).map((sub) => ({
          opcion_ID: sub.codigoOpcion_ID || sub.opcion_ID,
          nombreOpcion: sub.nombreOpcion,
          descripcion: sub.descripcion,
          estado: sub.estado,
        })),
      }));

      setMenuStructure(normalizedData);

      const activePermissionIds = new Set();

      normalizedData.forEach((modulo) => {
        if (modulo.estado === "ACT") {
          activePermissionIds.add(modulo.opcion_ID);
        }

        if (modulo.opcionesSubMenu && Array.isArray(modulo.opcionesSubMenu)) {
          modulo.opcionesSubMenu.forEach((subOpcion) => {
            if (subOpcion.estado === "ACT") {
              activePermissionIds.add(subOpcion.opcion_ID);
            }
          });
        }
      });

      setUserPermissions(activePermissionIds);
      setHasChanges(false);
      console.log(`✅ ${activePermissionIds.size} permisos activos cargados`);
    } catch (error) {
      console.error("❌ Error cargando permisos:", error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const loadMenuStructureOnly = async (usuarioId) => {
    try {
      setLoadingMenu(true);
      const menuData = await getMenuEstructura(usuarioId);

      const normalizedData = menuData.map((modulo) => ({
        opcion_ID: modulo.codigoOpcion_ID || modulo.opcion_ID,
        nombreOpcion: modulo.nombreOpcion,
        descripcion: modulo.descripcion,
        estado: modulo.estado,
        opcionesSubMenu: (
          modulo.subOpcionesMenu ||
          modulo.opcionesSubMenu ||
          []
        ).map((sub) => ({
          opcion_ID: sub.codigoOpcion_ID || sub.opcion_ID,
          nombreOpcion: sub.nombreOpcion,
          descripcion: sub.descripcion,
          estado: sub.estado,
        })),
      }));

      setMenuStructure(normalizedData);
    } catch (error) {
      console.error("❌ Error cargando estructura:", error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const getTotalPermissions = (menuData) => {
    return menuData.reduce((sum, modulo) => {
      let count = 1;
      if (modulo.opcionesSubMenu) {
        count += modulo.opcionesSubMenu.length;
      }
      return sum + count;
    }, 0);
  };

  const handleUserChange = async (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);

    const user = users.find((u) => u.id === parseInt(userId));
    if (user) {
      setSelectedSucursalId(user.sucursal_ID || "");
      setSelectedRolId(user.rol_ID || "");

      if (user.rol) {
        await applyRoleTemplate(user.rol);
        await loadMenuStructureOnly(userId);
      }
    }
  };

  const applyRoleTemplate = async (nombreRol) => {
    setPendingRoleName(nombreRol);
    setConfirmDialogOpen(true);
  };

  const handleConfirmApplyTemplate = async () => {
    setConfirmDialogOpen(false);

    try {
      console.log(`🔄 Aplicando plantilla de rol: ${pendingRoleName}`);
      const templatePermissions = await getRoleTemplatePermissionsReal(pendingRoleName);

      setUserPermissions(new Set(templatePermissions));

      const rolSeleccionado = roles.find((r) => r.nombre_Rol === pendingRoleName);
      if (rolSeleccionado) {
        setSelectedRolId(rolSeleccionado.rol_ID);
        console.log(`✅ Rol actualizado a: ${pendingRoleName} (ID: ${rolSeleccionado.rol_ID})`);
      }

      setHasChanges(true);
      console.log(`✅ Plantilla aplicada: ${templatePermissions.length} permisos`);
    } catch (error) {
      console.error("❌ Error aplicando plantilla:", error);
    }
  };

  const handleCancelApplyTemplate = () => {
    setConfirmDialogOpen(false);
    setPendingRoleName("");
  };

  const togglePermission = (permissionId) => {
    const newPermissions = new Set(userPermissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setUserPermissions(newPermissions);
    setHasChanges(true);
  };

  const toggleModulePermissions = (modulo) => {
    const modulePermissions = [];

    if (modulo.opcion_ID) {
      modulePermissions.push(modulo.opcion_ID);
    }

    if (modulo.opcionesSubMenu && Array.isArray(modulo.opcionesSubMenu)) {
      modulo.opcionesSubMenu.forEach((sub) => {
        if (sub.opcion_ID) {
          modulePermissions.push(sub.opcion_ID);
        }
      });
    }

    const allSelected = modulePermissions.every((p) => userPermissions.has(p));

    const newPermissions = new Set(userPermissions);
    if (allSelected) {
      modulePermissions.forEach((p) => newPermissions.delete(p));
    } else {
      modulePermissions.forEach((p) => newPermissions.add(p));
    }
    setUserPermissions(newPermissions);
    setHasChanges(true);
  };

  const togglePanel = (panelId) => {
    setExpandedPanels((prev) =>
      prev.includes(panelId)
        ? prev.filter((p) => p !== panelId)
        : [...prev, panelId]
    );
  };

  const totalPermissions = getTotalPermissions(menuStructure);
  const selectedPermissions = userPermissions.size;

  const handleSavePermissions = async () => {
    if (!selectedUserId) {
      window.alert("Por favor seleccione un usuario");
      return;
    }

    if (!selectedSucursalId) {
      window.alert("Por favor seleccione una sucursal");
      return;
    }

    const permisoIDs = Array.from(userPermissions);
    const usuario_ID = parseInt(selectedUserId);
    const rol_ID = selectedRolId || currentUser?.rol_ID;
    const sucursal_ID = parseInt(selectedSucursalId);
    const codigoEmpleadoAlta = codigoEmpleado || "SYSTEM";

    const success = await saveUserPermissionsReal({
      usuario_ID,
      rol_ID,
      sucursal_ID,
      permisoIDs,
      codigoEmpleadoAlta,
    });

    if (success) {
      setHasChanges(false);
    }
  };

  const filteredRoles = roles
    .filter((r) => !EXCLUDED_ROLES.includes(r.nombre_Rol))
    .sort((a, b) => {
      const indexA = ROLES_ORDER.indexOf(a.nombre_Rol);
      const indexB = ROLES_ORDER.indexOf(b.nombre_Rol);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
          onClick={onCancel}
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
          Volver a la lista
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3, position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              background: 'rgba(255,255,255,0.25)',
              width: 70,
              height: 70,
              border: '3px solid rgba(255,255,255,0.4)'
            }}
          >
            <VpnKey sx={{ fontSize: '2.5rem', color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Asignar Permisos
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Gestionar permisos y roles de usuario del sistema
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Panel izquierdo */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            mb: 3, 
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: `1px solid ${clinicColors.alpha.primary10}`
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ 
                  mb: 3, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  color: clinicColors.primaryDark,
                  fontWeight: 700
                }}
              >
                <Person />
                Seleccionar Usuario
              </Typography>

              {/* Selector de usuario */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{
                  "&.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}>
                  Usuario
                </InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={handleUserChange}
                  label="Usuario"
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: clinicColors.primary,
                      borderWidth: 2
                    },
                  }}
                >
                  {users.map((user) => (
                    <MenuItem 
                      key={user.id} 
                      value={user.id}
                      sx={{
                        "&:hover": {
                          bgcolor: clinicColors.alpha.primary10,
                        },
                        "&.Mui-selected": {
                          bgcolor: clinicColors.alpha.primary20,
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: "0.75rem",
                            background: clinicColors.gradients.primary,
                            fontWeight: 700
                          }}
                        >
                          {user.avatar || user.nombreCompleto.split(" ").map((n) => n[0]).join("")}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {user.nombreCompleto}
                        </Typography>
                        <Chip 
                          label={user.rol} 
                          size="small" 
                          sx={{
                            bgcolor: clinicColors.alpha.secondary20,
                            color: clinicColors.secondary,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Selector de sucursal */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{
                  "&.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}>
                  Sucursal
                </InputLabel>
                <Select
                  value={selectedSucursalId}
                  onChange={(e) => {
                    setSelectedSucursalId(e.target.value);
                    setHasChanges(true);
                  }}
                  label="Sucursal"
                  disabled={!selectedUserId}
                  startAdornment={
                    <Business sx={{ color: clinicColors.secondary, ml: 1, mr: 1 }} />
                  }
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${clinicColors.alpha.primary10}`
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: clinicColors.primary,
                      borderWidth: 2
                    },
                  }}
                >
                  {sucursales.map((sucursal) => (
                    <MenuItem
                      key={sucursal.sucursal_ID}
                      value={sucursal.sucursal_ID}
                      sx={{
                        "&:hover": {
                          bgcolor: clinicColors.alpha.primary10,
                        },
                        "&.Mui-selected": {
                          bgcolor: clinicColors.alpha.primary20,
                        },
                      }}
                    >
                      {sucursal.nombreSucursal}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Info del usuario */}
              {currentUser && (
                <Alert 
                  severity="info" 
                  icon={<Info />}
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    border: `1px solid ${clinicColors.alpha.secondary20}`,
                    bgcolor: clinicColors.alpha.secondary10
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    <strong>Usuario:</strong> {currentUser.nombreCompleto}
                    <br />
                    <strong>Rol:</strong> {currentUser.rol}
                    <br />
                    <strong>Sucursal:</strong> {currentUser.sucursal}
                  </Typography>
                </Alert>
              )}

              {hasChanges && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Hay cambios sin guardar
                  </Typography>
                </Alert>
              )}

              {/* Plantillas de roles */}
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2,
                  color: clinicColors.primaryDark,
                  fontWeight: 700
                }}
              >
                Plantillas de Roles
              </Typography>

              {filteredRoles.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No hay roles disponibles
                </Alert>
              ) : (
                filteredRoles.map((role) => (
                  <Button
                    key={role.rol_ID}
                    fullWidth
                    variant="outlined"
                    onClick={() => applyRoleTemplate(role.nombre_Rol)}
                    disabled={!selectedUserId}
                    sx={{
                      mb: 1.5,
                      justifyContent: "flex-start",
                      borderRadius: 2,
                      borderWidth: 2,
                      borderColor: clinicColors.primary,
                      color: clinicColors.primary,
                      fontWeight: 600,
                      py: 1.5,
                      transition: 'all 0.3s ease',
                      "&:hover": {
                        borderWidth: 2,
                        bgcolor: clinicColors.alpha.primary10,
                        transform: 'translateX(4px)'
                      },
                      "&.Mui-disabled": {
                        borderColor: '#ccc',
                        color: '#999'
                      }
                    }}
                  >
                    {role.nombre_Rol}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Resumen */}
          <Card sx={{
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: `1px solid ${clinicColors.alpha.primary10}`
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2,
                  color: clinicColors.primaryDark,
                  fontWeight: 700
                }}
              >
                Resumen
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Permisos seleccionados:
                </Typography>
                <Chip
                  label={selectedPermissions}
                  sx={{
                    bgcolor: clinicColors.primary,
                    color: 'white',
                    fontWeight: 700,
                    height: 28
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Total permisos:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: clinicColors.primaryDark }}>
                  {totalPermissions}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel derecho: Permisos */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: `1px solid ${clinicColors.alpha.primary10}`
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography 
                  variant="h6"
                  sx={{
                    color: clinicColors.primaryDark,
                    fontWeight: 700
                  }}
                >
                  Permisos por Módulo
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<SelectAll />}
                    size="small"
                    onClick={() => {
                      const allPermissions = new Set();
                      menuStructure.forEach((modulo) => {
                        if (modulo.opcion_ID) allPermissions.add(modulo.opcion_ID);
                        if (modulo.opcionesSubMenu) {
                          modulo.opcionesSubMenu.forEach((sub) => {
                            if (sub.opcion_ID) allPermissions.add(sub.opcion_ID);
                          });
                        }
                      });
                      setUserPermissions(allPermissions);
                      setHasChanges(true);
                    }}
                    sx={{
                      color: clinicColors.primary,
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: clinicColors.alpha.primary10,
                      },
                    }}
                  >
                    Todos
                  </Button>
                  <Button
                    startIcon={<DeselectAll />}
                    size="small"
                    onClick={() => {
                      setUserPermissions(new Set());
                      setHasChanges(true);
                    }}
                    sx={{
                      color: clinicColors.secondary,
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: clinicColors.alpha.secondary10,
                      },
                    }}
                  >
                    Ninguno
                  </Button>
                </Box>
              </Box>

              {loadingMenu ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress sx={{ color: clinicColors.primary }} />
                </Box>
              ) : (
                <>
                  {menuStructure.map((modulo, index) => {
                    const modulePermissions = [];
                    if (modulo.opcion_ID) modulePermissions.push(modulo.opcion_ID);
                    if (modulo.opcionesSubMenu) {
                      modulo.opcionesSubMenu.forEach((sub) => {
                        if (sub.opcion_ID) modulePermissions.push(sub.opcion_ID);
                      });
                    }

                    const selectedCount = modulePermissions.filter((p) =>
                      userPermissions.has(p)
                    ).length;
                    const isExpanded = expandedPanels.includes(modulo.opcion_ID);

                    return (
                      <Accordion
                        key={`modulo-${modulo.opcion_ID}-${index}`}
                        expanded={isExpanded}
                        onChange={() => togglePanel(modulo.opcion_ID)}
                        sx={{ 
                          mb: 1.5,
                          borderRadius: 2,
                          '&:before': {
                            display: 'none',
                          },
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          border: `1px solid ${clinicColors.alpha.primary10}`
                        }}
                      >
                        <AccordionSummary 
                          expandIcon={<ExpandMore sx={{ color: clinicColors.primary }} />}
                          sx={{
                            '&:hover': {
                              bgcolor: clinicColors.alpha.primary10,
                            }
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              gap: 2
                            }}
                          >
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                flexGrow: 1,
                                fontWeight: 700,
                                color: clinicColors.primaryDark
                              }}
                            >
                              {modulo.nombreOpcion}
                            </Typography>
                            <Chip
                              label={`${selectedCount}/${modulePermissions.length}`}
                              size="small"
                              sx={{
                                bgcolor: selectedCount > 0 ? clinicColors.primary : '#e0e0e0',
                                color: selectedCount > 0 ? 'white' : '#666',
                                fontWeight: 700,
                                minWidth: 50
                              }}
                            />
                            <Switch
                              checked={selectedCount === modulePermissions.length}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleModulePermissions(modulo);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: clinicColors.primary,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: clinicColors.primary,
                                },
                              }}
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ bgcolor: '#fafafa' }}>
                          <Grid container spacing={1}>
                            {/* Checkbox del módulo principal */}
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={userPermissions.has(modulo.opcion_ID)}
                                    onChange={() => togglePermission(modulo.opcion_ID)}
                                    sx={{
                                      '&.Mui-checked': {
                                        color: clinicColors.primary,
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant="body2" fontWeight={700}>
                                      {modulo.nombreOpcion} (Módulo)
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {modulo.descripcion}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Grid>

                            {/* Subopciones */}
                            {modulo.opcionesSubMenu &&
                              modulo.opcionesSubMenu.length > 0 &&
                              modulo.opcionesSubMenu.map((subOpcion, subIndex) => (
                                <Grid
                                  item
                                  xs={12}
                                  key={`subopcion-${subOpcion.opcion_ID}-${subIndex}`}
                                >
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={userPermissions.has(subOpcion.opcion_ID)}
                                        onChange={() => togglePermission(subOpcion.opcion_ID)}
                                        sx={{
                                          '&.Mui-checked': {
                                            color: clinicColors.secondary,
                                          },
                                        }}
                                      />
                                    }
                                    label={
                                      <Box sx={{ ml: 2 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                          {subOpcion.nombreOpcion}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {subOpcion.descripcion}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </Grid>
                              ))}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<Cancel />}
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
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Save />
                )
              }
              onClick={handleSavePermissions}
              disabled={!hasChanges || !selectedUserId || loading}
              size="large"
              sx={{
                background: `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryLight} 100%)`,
                color: "white",
                px: 5,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: `0 8px 24px ${clinicColors.alpha.primary30}`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${clinicColors.primaryDark} 0%, ${clinicColors.primary} 100%)`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 32px ${clinicColors.alpha.primary30}`,
                },
                "&.Mui-disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)",
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? "Guardando..." : "Guardar Permisos"}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Dialog de confirmación */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelApplyTemplate}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: clinicColors.primary, 
          fontWeight: 700,
          fontSize: '1.5rem',
          borderBottom: `2px solid ${clinicColors.alpha.primary20}`
        }}>
          ⚠️ Advertencia
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Está a punto de aplicar la plantilla de permisos del rol{" "}
            <strong style={{ color: clinicColors.primaryDark }}>"{pendingRoleName}"</strong>.
          </DialogContentText>
          <DialogContentText sx={{ mb: 2, color: clinicColors.error, fontWeight: 600 }}>
            Esto REEMPLAZARÁ todos los permisos actuales del usuario.
          </DialogContentText>
          <DialogContentText>
            ¿Está seguro de continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCancelApplyTemplate}
            variant="outlined"
            size="large"
            sx={{
              borderColor: clinicColors.secondary,
              color: clinicColors.secondary,
              borderWidth: 2,
              fontWeight: 700,
              "&:hover": {
                borderWidth: 2,
                bgcolor: clinicColors.alpha.secondary10,
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmApplyTemplate}
            variant="contained"
            size="large"
            sx={{
              background: `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryLight} 100%)`,
              fontWeight: 700,
              px: 3,
              "&:hover": {
                background: `linear-gradient(135deg, ${clinicColors.primaryDark} 0%, ${clinicColors.primary} 100%)`,
              },
            }}
            autoFocus
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssignPermissions;