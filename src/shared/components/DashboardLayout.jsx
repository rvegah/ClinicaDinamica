import { useState } from 'react';
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
  Brightness4,
  Brightness7,
  Notifications
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { clinicColors } from '../../app/theme';
import { useThemeMode } from '../../app/ThemeContext';
import { getFilteredMenuItems } from '../../config/menuPermissions';
import React from 'react';

const drawerWidth = 280;
const drawerWidthClosed = 60;

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { mode, toggleTheme } = useThemeMode();
  
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState({});

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const menuItems = getFilteredMenuItems(currentUser.permisos || []);

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
    navigate('/');
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
    <Box sx={{ display: 'flex' }}>
      {/* AppBar mejorado */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: clinicColors.gradients.primary,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ 
              mr: 2,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'rotate(90deg)'
              }
            }}
          >
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}
          >
            SI CLINICA FARMA
          </Typography>

          <Chip
            label={currentUser.sucursal || 'Sin sucursal'}
            size="small"
            sx={{
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
                transform: 'scale(1.05)'
              }
            }}
          />

          {/* Botón de notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Botón tema claro/oscuro */}
          <Tooltip title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
            <IconButton 
              onClick={toggleTheme} 
              color="inherit" 
              sx={{ 
                mr: 2,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(180deg)'
                }
              }}
            >
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>

          {/* Avatar mejorado */}
          <Tooltip title="Mi cuenta">
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
                  width: 42,
                  height: 42,
                  fontWeight: 700,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                {currentUser.nombreCompleto?.charAt(0) || 'U'}
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
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                {currentUser.nombreCompleto}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser.rol}
              </Typography>
              <Chip 
                label={currentUser.email}
                size="small"
                sx={{ mt: 1, fontSize: '0.7rem' }}
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
                '&:hover': {
                  background: clinicColors.gradients.hover
                }
              }}
            >
              <ListItemIcon><PersonOutline fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Mi Perfil</Typography>
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{
                py: 1.5,
                color: clinicColors.error,
                '&:hover': {
                  bgcolor: 'rgba(220,53,69,0.1)'
                }
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: clinicColors.error }} />
              </ListItemIcon>
              <Typography variant="body2">Cerrar Sesión</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar mejorado */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : drawerWidthClosed,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : drawerWidthClosed,
            boxSizing: 'border-box',
            background: clinicColors.gradients.sidebar,
            color: 'white',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      if (item.submenu) {
                        handleSubmenuToggle(item.id);
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
                    sx={{
                      minHeight: 52,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      mx: 1,
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
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.2)'
                        }
                      }}
                    >
                      {React.createElement(item.icono)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 15,
                        fontWeight: isActive(item.path) ? 700 : 500
                      }}
                      sx={{ 
                        opacity: open ? 1 : 0, 
                        display: open ? 'block' : 'none',
                        transition: 'opacity 0.3s ease'
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

                {/* Submenú con animación */}
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
                            pl: 5,
                            py: 1.2,
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
                              fontSize: 14,
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
        </Box>

        {/* Footer del sidebar */}
        {open && (
          <Box 
            sx={{ 
              p: 2, 
              mt: 'auto',
              opacity: open ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              © 2025 SI CLINICA FARMA
            </Typography>
          </Box>
        )}
      </Drawer>

      {/* Contenido principal mejorado */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${open ? drawerWidth : drawerWidthClosed}px)`,
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: 'all 0.3s ease'
        }}
      >
        <Toolbar />
        <Box sx={{ 
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