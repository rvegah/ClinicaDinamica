// src/modules/user-management/components/AssignSchedule.jsx - VERSIÓN MEJORADA DINAMAX

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
  Button,
  Box,
  Chip,
  Alert,
  Switch,
  TextField,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  Person,
  Save,
  Cancel,
  AccessTime,
  Delete,
  ContentCopy as Copy,
  WbSunny,
  NightsStay,
  Brightness3,
  WbTwilight,
  Business,
  Computer,
  ArrowBack,
  Schedule,
  Info,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useUsers } from "../context/UserContext";
import { clinicColors } from "../../../app/theme";
import apiClient from "../../../services/api/apiClient";
import userService from "../../../services/api/userService";

const diasSemana = [
  { clave: "lunes", nombre: "Lunes", corto: "LUN", numero: 1 },
  { clave: "martes", nombre: "Martes", corto: "MAR", numero: 2 },
  { clave: "miercoles", nombre: "Miércoles", corto: "MIE", numero: 3 },
  { clave: "jueves", nombre: "Jueves", corto: "JUE", numero: 4 },
  { clave: "viernes", nombre: "Viernes", corto: "VIE", numero: 5 },
  { clave: "sabado", nombre: "Sábado", corto: "SAB", numero: 6 },
  { clave: "domingo", nombre: "Domingo", corto: "DOM", numero: 7 },
];

const plantillasTurnos = {
  1: {
    id: 1,
    nombre: "MAÑANA",
    icono: <WbSunny />,
    color: clinicColors.primary,
    horaInicio: "08:00",
    horaFinal: "13:00",
  },
  2: {
    id: 2,
    nombre: "TARDE",
    icono: <WbTwilight />,
    color: clinicColors.secondary,
    horaInicio: "13:00",
    horaFinal: "18:00",
  },
  3: {
    id: 3,
    nombre: "TARDE NOCHE",
    icono: <NightsStay />,
    color: clinicColors.primaryDark,
    horaInicio: "18:00",
    horaFinal: "23:00",
  },
  4: {
    id: 4,
    nombre: "NOCTURNO",
    icono: <Brightness3 />,
    color: clinicColors.secondaryDark,
    horaInicio: "23:00",
    horaFinal: "04:00",
  },
  5: {
    id: 5,
    nombre: "FIN SEMANA",
    icono: <WbSunny />,
    color: "#2E7D32",
    horaInicio: "08:00",
    horaFinal: "21:00",
  },
  6: {
    id: 6,
    nombre: "MADRUGADOR",
    icono: <WbTwilight />,
    color: "#F57C00",
    horaInicio: "04:00",
    horaFinal: "08:00",
  },
};

const AssignSchedule = ({ onCancel }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { selectedUser, users, codigoEmpleado } = useUsers();

  const [selectedUserId, setSelectedUserId] = useState(selectedUser?.id || "");
  const [loading, setLoading] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [selectedSucursal_ID, setSelectedSucursal_ID] = useState("");
  const [selectedEquipo_ID, setSelectedEquipo_ID] = useState("");

  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    const initial = {};
    diasSemana.forEach((dia) => {
      initial[dia.clave] = {
        activo: false,
        turno: null,
      };
    });
    return initial;
  });

  const currentUser = users.find((u) => u.id === parseInt(selectedUserId));

  useEffect(() => {
    if (selectedUserId) {
      loadUserScheduleData();
    }
  }, [selectedUserId]);

  const loadUserScheduleData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando datos de horarios para usuario:", selectedUserId);

      const sucursalesData = await userService.getSucursales(1);
      setSucursales(sucursalesData);
      console.log("✅ Sucursales cargadas:", sucursalesData.length);

      if (currentUser?.sucursal_ID) {
        setSelectedSucursal_ID(currentUser.sucursal_ID);

        const equiposData = await userService.getEquiposBySucursal(
          currentUser.sucursal_ID
        );
        setEquipos(equiposData);
        console.log("✅ Equipos cargados:", equiposData.length);

        if (currentUser?.equipoComputo_ID) {
          setSelectedEquipo_ID(currentUser.equipoComputo_ID);
        }
      }
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      enqueueSnackbar("Error al cargar datos del usuario", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSucursalChange = async (event) => {
    const sucursalId = event.target.value;
    setSelectedSucursal_ID(sucursalId);
    setSelectedEquipo_ID("");
    setEquipos([]);

    if (sucursalId) {
      try {
        const equiposData = await userService.getEquiposBySucursal(sucursalId);
        setEquipos(equiposData);
        console.log("✅ Equipos cargados para sucursal:", sucursalId);
      } catch (error) {
        console.error("❌ Error cargando equipos:", error);
        enqueueSnackbar("Error al cargar equipos", { variant: "error" });
      }
    }
  };

  const addShiftToDay = (claveDia, turnoId) => {
    if (weeklySchedule[claveDia].turno !== null) {
      enqueueSnackbar("❌ Solo se puede asignar un turno por día", {
        variant: "warning",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return;
    }

    const plantilla = plantillasTurnos[turnoId];

    setWeeklySchedule((prev) => ({
      ...prev,
      [claveDia]: {
        activo: true,
        turno: {
          id: Date.now(),
          turnoLaboral_ID: plantilla.id,
          nombre: plantilla.nombre,
          color: plantilla.color,
          horaInicio: plantilla.horaInicio,
          horaFinal: plantilla.horaFinal,
        },
      },
    }));

    console.log(`✅ Turno "${plantilla.nombre}" asignado a ${claveDia}`);
  };

  const applyTemplateToAllDays = (turnoId) => {
    const plantilla = plantillasTurnos[turnoId];

    console.log(`🔄 Aplicando turno "${plantilla.nombre}" a todos los días...`);

    const nuevoSchedule = {};

    diasSemana.forEach((dia) => {
      nuevoSchedule[dia.clave] = {
        activo: true,
        turno: {
          id: Date.now() + Math.random(),
          turnoLaboral_ID: plantilla.id,
          nombre: plantilla.nombre,
          color: plantilla.color,
          horaInicio: plantilla.horaInicio,
          horaFinal: plantilla.horaFinal,
        },
      };
    });

    setWeeklySchedule(nuevoSchedule);

    enqueueSnackbar(`✅ Turno "${plantilla.nombre}" aplicado a toda la semana`, {
      variant: "success",
    });
  };

  const removeShiftFromDay = (claveDia) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [claveDia]: {
        activo: false,
        turno: null,
      },
    }));
    console.log(`🗑️ Turno eliminado de ${claveDia}`);
  };

  const copyDaySchedule = (diaOrigen) => {
    const horarioOrigen = weeklySchedule[diaOrigen];

    if (!horarioOrigen.turno) {
      enqueueSnackbar("⚠️ No hay turno para copiar", { variant: "warning" });
      return;
    }

    const diasDestino = ["lunes", "martes", "miercoles", "jueves", "viernes"];

    setWeeklySchedule((prev) => {
      const actualizado = { ...prev };
      diasDestino.forEach((dia) => {
        if (dia !== diaOrigen) {
          actualizado[dia] = {
            activo: true,
            turno: {
              ...horarioOrigen.turno,
              id: Date.now() + Math.random(),
            },
          };
        }
      });
      return actualizado;
    });

    enqueueSnackbar(`✅ Horario copiado a días laborales`, {
      variant: "success",
    });
  };

  const toggleDay = (claveDia) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [claveDia]: {
        ...prev[claveDia],
        activo: !prev[claveDia].activo,
        turno: !prev[claveDia].activo ? prev[claveDia].turno : null,
      },
    }));
  };

  const calculateWeeklyHours = () => {
    let totalHoras = 0;

    Object.values(weeklySchedule).forEach((dia) => {
      if (dia.activo && dia.turno) {
        const [hInicio, mInicio] = dia.turno.horaInicio.split(":").map(Number);
        const [hFin, mFin] = dia.turno.horaFinal.split(":").map(Number);

        let minutosInicio = hInicio * 60 + mInicio;
        let minutosFin = hFin * 60 + mFin;

        if (minutosFin < minutosInicio) {
          minutosFin += 24 * 60;
        }

        const horasTrabajo = (minutosFin - minutosInicio) / 60;
        totalHoras += horasTrabajo;
      }
    });

    return totalHoras.toFixed(1);
  };

  const handleSaveSchedule = async () => {
    try {
      if (!selectedUserId) {
        enqueueSnackbar("⚠️ Debe seleccionar un usuario", {
          variant: "warning",
        });
        return;
      }

      if (!selectedSucursal_ID) {
        enqueueSnackbar("⚠️ Debe seleccionar una sucursal", {
          variant: "warning",
        });
        return;
      }

      if (!selectedEquipo_ID) {
        enqueueSnackbar("⚠️ Debe seleccionar un equipo", {
          variant: "warning",
        });
        return;
      }

      const turnosAsignados = Object.values(weeklySchedule).filter(
        (dia) => dia.activo && dia.turno
      );
      if (turnosAsignados.length === 0) {
        enqueueSnackbar("⚠️ Debe asignar al menos un turno", {
          variant: "warning",
        });
        return;
      }

      setLoading(true);

      const payload = {
        usuario_ID: parseInt(selectedUserId),
        sucursal_ID: parseInt(selectedSucursal_ID),
        equipoComputo_ID: parseInt(selectedEquipo_ID),
        turnoLaboral_ID: turnosAsignados[0]?.turno?.turnoLaboral_ID || 0,
        codigoEmpleadoAlta: codigoEmpleado || "SYSTEM",
        turnosUsuario: Object.entries(weeklySchedule)
          .filter(([_, dia]) => dia.activo && dia.turno)
          .map(([claveDia, dia]) => {
            const diaInfo = diasSemana.find((d) => d.clave === claveDia);
            return {
              usuario_Turno_Horario_ID: 0,
              horaInicio: dia.turno.horaInicio,
              horaFinal: dia.turno.horaFinal,
              numeroDia: diaInfo.numero,
              nombreDia: diaInfo.nombre,
            };
          }),
      };

      console.log("📤 Enviando horarios al API:", JSON.stringify(payload, null, 2));

      const response = await apiClient.put(
        "/Organizacion/ActualizarTurnosUsuario",
        payload
      );

      if (response.data?.exitoso) {
        console.log("✅ Horarios guardados exitosamente:", response.data);
        enqueueSnackbar("✅ Horarios asignados correctamente", {
          variant: "success",
        });

        if (onCancel) {
          onCancel();
        }
      } else {
        throw new Error(response.data?.mensaje || "Error al guardar horarios");
      }
    } catch (error) {
      console.error("❌ Error guardando horarios:", error);
      enqueueSnackbar(error.message || "Error al guardar horarios", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
            <Schedule sx={{ fontSize: '2.5rem', color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Asignación de Horarios
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Configurar horarios y turnos de trabajo del personal
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Panel izquierdo */}
        <Grid item xs={12} lg={3.5}>
          <Card sx={{ 
            mb: 3, 
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: `1px solid ${clinicColors.alpha.primary10}`,
            maxWidth: '400px' 
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
                Usuario
              </Typography>

              {/* Selector de Usuario */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{
                  "&.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}>
                  Seleccionar Usuario
                </InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  label="Seleccionar Usuario"
                  disabled={loading}
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
                            background: clinicColors.gradients.secondary,
                            fontWeight: 700
                          }}
                        >
                          {user.nombreCompleto.split(" ").map((n) => n[0]).join("")}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {user.nombreCompleto}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                    <strong>{currentUser.nombreCompleto}</strong>
                    <br />
                    {currentUser.rol} - {currentUser.sucursal}
                  </Typography>
                </Alert>
              )}

              {/* Selector de Sucursal */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{
                  "&.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}>
                  Sucursal
                </InputLabel>
                <Select
                  value={selectedSucursal_ID}
                  onChange={handleSucursalChange}
                  label="Sucursal"
                  disabled={loading || !selectedUserId}
                  startAdornment={
                    <InputAdornment position="start">
                      <Business sx={{ color: clinicColors.secondary, ml: 1 }} />
                    </InputAdornment>
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
                  {sucursales.map((suc) => (
                    <MenuItem 
                      key={suc.sucursal_ID} 
                      value={suc.sucursal_ID}
                      sx={{
                        "&:hover": {
                          bgcolor: clinicColors.alpha.primary10,
                        },
                        "&.Mui-selected": {
                          bgcolor: clinicColors.alpha.primary20,
                        },
                      }}
                    >
                      {suc.nombreSucursal}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Selector de Equipo */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{
                  "&.Mui-focused": {
                    color: clinicColors.primary,
                    fontWeight: 600
                  }
                }}>
                  Equipo
                </InputLabel>
                <Select
                  value={selectedEquipo_ID}
                  onChange={(e) => setSelectedEquipo_ID(e.target.value)}
                  label="Equipo"
                  disabled={loading || !selectedSucursal_ID}
                  startAdornment={
                    <InputAdornment position="start">
                      <Computer sx={{ color: clinicColors.primary, ml: 1 }} />
                    </InputAdornment>
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
                  {equipos.map((eq) => (
                    <MenuItem
                      key={eq.equipoComputo_ID}
                      value={eq.equipoComputo_ID}
                      sx={{
                        "&:hover": {
                          bgcolor: clinicColors.alpha.primary10,
                        },
                        "&.Mui-selected": {
                          bgcolor: clinicColors.alpha.primary20,
                        },
                      }}
                    >
                      {eq.nombreHost}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider sx={{ my: 3 }} />

              {/* Plantillas de Turno */}
              <Typography
                variant="h6"
                sx={{ 
                  mb: 2, 
                  color: clinicColors.primaryDark,
                  fontWeight: 700
                }}
              >
                Plantillas de Turno
              </Typography>

              {Object.values(plantillasTurnos).map((plantilla) => (
                <Tooltip
                  key={plantilla.id}
                  title={`${plantilla.horaInicio} - ${plantilla.horaFinal}`}
                  placement="right"
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={plantilla.icono}
                    onClick={() => applyTemplateToAllDays(plantilla.id)}
                    sx={{
                      mb: 1.5,
                      justifyContent: "flex-start",
                      borderRadius: 2,
                      borderWidth: 2,
                      borderColor: plantilla.color,
                      color: plantilla.color,
                      fontWeight: 600,
                      py: 1.5,
                      transition: 'all 0.3s ease',
                      "&:hover": {
                        borderWidth: 2,
                        bgcolor: `${plantilla.color}20`,
                        borderColor: plantilla.color,
                        transform: 'translateX(4px)'
                      },
                    }}
                  >
                    {plantilla.nombre}
                  </Button>
                </Tooltip>
              ))}
            </CardContent>
          </Card>

          {/* Resumen semanal */}
          <Card sx={{ 
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
                <AccessTime />
                Resumen Semanal
              </Typography>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: clinicColors.primary,
                    fontWeight: 800,
                    mb: 0.5
                  }}
                >
                  {calculateWeeklyHours()}h
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Horas totales semanales
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Días activos:
                </Typography>
                <Chip
                  label={`${Object.values(weeklySchedule).filter((dia) => dia.activo).length}/7`}
                  size="small"
                  sx={{
                    bgcolor: clinicColors.primary,
                    color: 'white',
                    fontWeight: 700
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Total turnos:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: clinicColors.primaryDark }}>
                  {Object.values(weeklySchedule).filter((dia) => dia.turno).length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel principal: Calendario semanal */}
        <Grid item xs={12} lg={4.5}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: `1px solid ${clinicColors.alpha.primary10}`,   
            maxWidth: '1100px'         
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ 
                  mb: 3, 
                  color: clinicColors.primaryDark,
                  fontWeight: 700,                  
                }}
              >
                Configuración Semanal
              </Typography>

              {diasSemana.map((dia) => (
                <Paper
                  key={dia.clave}
                  sx={{
                    mb: 2,
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: weeklySchedule[dia.clave].activo
                      ? clinicColors.alpha.primary10
                      : "#fafafa",
                    border: weeklySchedule[dia.clave].activo
                      ? `2px solid ${clinicColors.primary}`
                      : "2px solid #e0e0e0",
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          minWidth: 120,
                          fontWeight: 700,
                          color: weeklySchedule[dia.clave].activo
                            ? clinicColors.primaryDark
                            : "text.secondary",
                        }}
                      >
                        {dia.nombre}
                      </Typography>
                      <Switch
                        checked={weeklySchedule[dia.clave].activo}
                        onChange={() => toggleDay(dia.clave)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: clinicColors.primary,
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: clinicColors.primary,
                          },
                        }}
                      />
                      {weeklySchedule[dia.clave].turno && (
                        <Chip
                          label={weeklySchedule[dia.clave].turno.nombre}
                          size="small"
                          sx={{
                            bgcolor: weeklySchedule[dia.clave].turno.color,
                            color: "white",
                            fontWeight: 700
                          }}
                        />
                      )}
                    </Box>

                    <Box>
                      {weeklySchedule[dia.clave].activo && (
                        <Tooltip title="Copiar a días laborales">
                          <IconButton
                            size="small"
                            onClick={() => copyDaySchedule(dia.clave)}
                            sx={{
                              color: clinicColors.secondary,
                              transition: 'all 0.3s ease',
                              "&:hover": {
                                bgcolor: clinicColors.alpha.secondary10,
                                transform: 'scale(1.1)'
                              },
                            }}
                          >
                            <Copy />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {weeklySchedule[dia.clave].activo && (
                    <>
                      {weeklySchedule[dia.clave].turno ? (
                        <Paper
                          sx={{
                            p: 2.5,
                            bgcolor: "white",
                            border: `2px solid ${weeklySchedule[dia.clave].turno.color}30`,
                            borderLeft: `5px solid ${weeklySchedule[dia.clave].turno.color}`,
                            borderRadius: 2
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                color: weeklySchedule[dia.clave].turno.color,
                                fontWeight: 700,
                                fontSize: '1.1rem'
                              }}
                            >
                              {weeklySchedule[dia.clave].turno.nombre}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeShiftFromDay(dia.clave)}
                              sx={{
                                color: clinicColors.error,
                                transition: 'all 0.3s ease',
                                "&:hover": {
                                  bgcolor: `${clinicColors.error}20`,
                                  transform: 'scale(1.1)'
                                },
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Hora Inicio"
                                type="time"
                                value={weeklySchedule[dia.clave].turno.horaInicio}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{ readOnly: true }}
                                fullWidth
                                size="small"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    bgcolor: clinicColors.alpha.primary10
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Hora Final"
                                type="time"
                                value={weeklySchedule[dia.clave].turno.horaFinal}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{ readOnly: true }}
                                fullWidth
                                size="small"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    bgcolor: clinicColors.alpha.primary10
                                  }
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      ) : (
                        <Box sx={{ textAlign: "center", py: 3, bgcolor: 'white', borderRadius: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2, fontWeight: 500 }}
                          >
                            No hay turno asignado para este día
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            {Object.values(plantillasTurnos).map((plantilla) => (
                              <Button
                                key={plantilla.id}
                                size="small"
                                variant="outlined"
                                startIcon={plantilla.icono}
                                onClick={() => addShiftToDay(dia.clave, plantilla.id)}
                                sx={{
                                  borderColor: plantilla.color,
                                  color: plantilla.color,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  borderWidth: 2,
                                  "&:hover": {
                                    borderWidth: 2,
                                    bgcolor: `${plantilla.color}20`,
                                  },
                                }}
                              >
                                {plantilla.nombre}
                              </Button>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  )}

                  {!weeklySchedule[dia.clave].activo && (
                    <Box sx={{ textAlign: "center", py: 2, opacity: 0.6 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Día de descanso
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ))}

              {/* Vista resumen en tabla */}
              <Divider sx={{ my: 4 }} />

              <Typography
                variant="h6"
                sx={{ 
                  mb: 3, 
                  color: clinicColors.primaryDark,
                  fontWeight: 700
                }}
              >
                Resumen Semanal
              </Typography>

              <TableContainer 
                component={Paper} 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  border: `1px solid ${clinicColors.alpha.primary10}`
                }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: clinicColors.alpha.secondary10 }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: clinicColors.secondaryDark }}>
                        Día
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: clinicColors.secondaryDark }}>
                        Estado
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: clinicColors.secondaryDark }}>
                        Turno
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: clinicColors.secondaryDark }}>
                        Horario
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: clinicColors.secondaryDark }}>
                        Horas
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diasSemana.map((dia) => {
                      const horarioDia = weeklySchedule[dia.clave];

                      let horasDia = 0;
                      if (horarioDia.activo && horarioDia.turno) {
                        const [hI, mI] = horarioDia.turno.horaInicio.split(":").map(Number);
                        const [hF, mF] = horarioDia.turno.horaFinal.split(":").map(Number);
                        let minI = hI * 60 + mI;
                        let minF = hF * 60 + mF;
                        if (minF < minI) minF += 24 * 60;
                        horasDia = (minF - minI) / 60;
                      }

                      return (
                        <TableRow 
                          key={dia.clave}
                          sx={{
                            '&:hover': {
                              bgcolor: clinicColors.alpha.primary10,
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {dia.corto}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={horarioDia.activo ? "Activo" : "Descanso"}
                              size="small"
                              color={horarioDia.activo ? "success" : "default"}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            {horarioDia.turno ? (
                              <Chip
                                label={horarioDia.turno.nombre}
                                size="small"
                                sx={{
                                  bgcolor: horarioDia.turno.color + "30",
                                  color: horarioDia.turno.color,
                                  fontWeight: 600
                                }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {horarioDia.turno ? (
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {horarioDia.turno.horaInicio} - {horarioDia.turno.horaFinal}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ color: clinicColors.primary }}
                            >
                              {horasDia.toFixed(1)}h
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Botones de acción */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  startIcon={<Cancel />}
                  disabled={loading}
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
                  onClick={handleSaveSchedule}
                  disabled={
                    loading ||
                    !selectedUserId ||
                    !selectedSucursal_ID ||
                    !selectedEquipo_ID
                  }
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Save />
                    )
                  }
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
                  {loading ? "Guardando..." : "Guardar Horarios"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AssignSchedule;