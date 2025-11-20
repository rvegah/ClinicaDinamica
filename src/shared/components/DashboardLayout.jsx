// src/shared/components/DashboardLayout.jsx - VERSIÓN MEJORADA DINAMAX

import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
  Chip,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  Logout,
  PersonOutline,
  Notifications,
  LocalHospital
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { clinicColors } from '../../app/theme';
import { getFilteredMenuItems } from '../../config/menuBuilder';
import React from 'react';
import { useAuth } from '../../context/AuthContext'; 

const drawerWidth = 280;
const drawerWidthClosed = 70;

const DashboardLayout = ({ children, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { logout } = useAuth(); 
  
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState({});

  const menuItems = useMemo(() => {
    if (!currentUser || !currentUser.apiPermissions) {
      console.warn('⚠️ No hay usuario o permisos disponibles');
      return [];
    }
    console.log('👤 Usuario actual:', currentUser.nombreCompleto);
    console.log('🔑 Permisos del usuario (API):', currentUser.apiPermissions);
    
    const filtered = getFilteredMenuItems(currentUser.apiPermissions);
    console.log('📋 Menús filtrados:', filtered);
    return filtered;
  }, [currentUser]);

  const handleDrawerToggle = () => {
    setOpen(!open);
    if (open) {
      setOpenSubmenu({});
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    enqueueSnackbar('Sesión cerrada correctamente', { variant: 'info' });
    logout();
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSubmenuToggle = (menuId) => {
    setOpenSubmenu(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* AppBar mejorado con branding DINAMAX */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: `linear-gradient(135deg, ${clinicColors.primary} 0%, ${clinicColors.primaryLight} 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ 
                mr: 2,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(90deg)',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {open ? <ChevronLeft /> : <MenuIcon />}
            </IconButton>
            
            {/* Logo DINAMAX */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocalHospital sx={{ fontSize: '2rem' }} />
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    lineHeight: 1
                  }}
                >
                  CONSULTORIO MÉDICO
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600,
                    letterSpacing: '1px',
                    opacity: 0.9
                  }}
                >
                  DINAMAX
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={currentUser?.sucursal || 'Sin sucursal'}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 700,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.35)',
                  transform: 'scale(1.05)'
                }
              }}
            />

            <Tooltip title="Notificaciones" arrow>
              <IconButton 
                color="inherit"
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Mi cuenta" arrow>
              <IconButton 
                onClick={handleMenuClick} 
                sx={{ 
                  p: 0.5,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    background: clinicColors.gradients.secondary,
                    width: 44,
                    height: 44,
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    border: '3px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  {currentUser?.nombreCompleto?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 240,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }
              }}
            >
              <Box sx={{ px: 3, py: 2, background: clinicColors.gradients.primary }}>
                <Typography variant="subtitle1" fontWeight={800} color="white">
                  {currentUser?.nombreCompleto || 'Usuario'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {currentUser?.rol || 'Sin rol'}
                </Typography>
                <Chip 
                  label={currentUser?.email || 'Sin email'}
                  size="small"
                  sx={{ 
                    mt: 1, 
                    fontSize: '0.7rem',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
              <Divider />
              <MenuItem 
                onClick={() => { 
                  handleMenuClose(); 
                  navigate('/profile'); 
                }}
                sx={{
                  py: 1.5,
                  px: 3,
                  '&:hover': {
                    background: clinicColors.alpha.primary10
                  }
                }}
              >
                <ListItemIcon><PersonOutline fontSize="small" /></ListItemIcon>
                <Typography variant="body2" fontWeight={600}>Mi Perfil</Typography>
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  px: 3,
                  color: clinicColors.error,
                  '&:hover': {
                    bgcolor: 'rgba(220,53,69,0.1)'
                  }
                }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: clinicColors.error }} />
                </ListItemIcon>
                <Typography variant="body2" fontWeight={600}>Cerrar Sesión</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar mejorado SIN SCROLL */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : drawerWidthClosed,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : drawerWidthClosed,
            boxSizing: 'border-box',
            background: `linear-gradient(180deg, ${clinicColors.primaryDark} 0%, ${clinicColors.primary} 100%)`,
            color: 'white',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
            overflowY: 'auto',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '10px',
              '&:hover': {
                background: 'rgba(255,255,255,0.5)',
              }
            }
          }
        }}
      >
        <Toolbar />
        
        {/* Lista de menú sin padding extra */}
        <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    if (item.submenu) {
                      handleSubmenuToggle(item.id);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    borderRadius: 2,
                    bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2.5 : 'auto',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.4rem'
                    }}
                  >
                    {React.createElement(item.icono, { sx: { fontSize: '1.4rem' } })}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive(item.path) ? 700 : 500
                    }}
                    sx={{ 
                      opacity: open ? 1 : 0, 
                      display: open ? 'block' : 'none'
                    }}
                  />
                  {item.submenu && open && (
                    <Box sx={{ 
                      transition: 'transform 0.3s ease',
                      transform: openSubmenu[item.id] ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      {openSubmenu[item.id] ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>

              {item.submenu && (
                <Collapse 
                  in={openSubmenu[item.id] && open} 
                  timeout="auto" 
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.submenu.map((subitem, idx) => (
                      <ListItemButton
                        key={idx}
                        onClick={() => handleNavigation(subitem.path)}
                        sx={{
                          pl: 6,
                          py: 1,
                          mx: 1,
                          my: 0.3,
                          borderRadius: 2,
                          bgcolor: isActive(subitem.path) ? 'rgba(255,255,255,0.25)' : 'transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)',
                            transform: 'translateX(8px)'
                          }
                        }}
                      >
                        <ListItemText
                          primary={subitem.label}
                          primaryTypographyProps={{ 
                            fontSize: 13,
                            fontWeight: isActive(subitem.path) ? 600 : 400
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>

        {menuItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              No tienes permisos asignados
            </Typography>
          </Box>
        )}

        {/* Footer del sidebar */}
        {open && (
          <Box sx={{ p: 2, mt: 'auto' }}>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
              © 2025 CONSULTORIO MÉDICO
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', fontWeight: 600 }}>
              DINAMAX S.R.L.
            </Typography>
          </Box>
        )}
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          bgcolor: clinicColors.light.background.default,
        }}
      >
        <Toolbar />
        <Box sx={{ 
          p: 3,
          animation: 'fadeIn 0.5s ease-in',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;