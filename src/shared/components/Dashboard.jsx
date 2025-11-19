// src/shared/components/Dashboard.jsx - VERSIÓN MEJORADA DINAMAX

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  LinearProgress,
  Chip,
  Avatar
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  SwapHoriz,
  CreditCard,
  CheckCircle,
  Warning,
  ArrowForward,
  Speed
} from '@mui/icons-material';
import { clinicColors } from '../../app/theme';

const tarjetasEstadisticas = [
  {
    titulo: 'Ventas del día',
    valor: '393',
    color: clinicColors.primary,
    icono: TrendingUp,
    cambio: '+12.5%',
    tipoCambio: 'positive'
  },
  {
    titulo: 'Compras del día',
    valor: '91',
    color: clinicColors.secondary,
    icono: ShoppingCart,
    cambio: '+8.2%',
    tipoCambio: 'positive'
  },
  {
    titulo: 'Traspasos del día',
    valor: '27',
    color: clinicColors.primaryLight,
    icono: SwapHoriz,
    cambio: '-2.1%',
    tipoCambio: 'negative'
  },
  {
    titulo: 'Compras a crédito por pagar',
    valor: '1',
    color: clinicColors.error,
    icono: CreditCard,
    cambio: 'Urgente',
    tipoCambio: 'warning'
  }
];

function Dashboard() {
  return (
    <Box>
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
            <Speed />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: clinicColors.primaryDark }}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Panel de Administración - Vista general del sistema
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards mejoradas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {tarjetasEstadisticas.map((card, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card 
              sx={{
                background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}DD 100%)`,
                color: 'white',
                borderRadius: 4,
                boxShadow: `0 10px 40px ${card.color}40`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 60px ${card.color}60`
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  animation: 'pulse 4s ease-in-out infinite'
                },
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' }
                }
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-1px' }}>
                      {card.valor}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600 }}>
                      {card.titulo}
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.25)', 
                    width: 56,
                    height: 56,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    {React.createElement(card.icono, { sx: { fontSize: '1.8rem' } })}
                  </Avatar>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip
                    label={card.cambio}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.25)',
                      color: 'white',
                      fontWeight: 700,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  />
                  <Button 
                    size="small" 
                    endIcon={<ArrowForward />}
                    sx={{ 
                      color: 'white', 
                      fontWeight: 700,
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.15)',
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Ver más
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Info Cards mejoradas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: 4, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: clinicColors.gradients.primary
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ 
                background: clinicColors.gradients.primary,
                width: 50,
                height: 50
              }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Sistema DINAMAX Operativo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Todos los módulos están funcionando correctamente
                </Typography>
              </Box>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={95} 
              sx={{ 
                height: 12, 
                borderRadius: 6,
                bgcolor: clinicColors.alpha.primary10,
                mb: 1,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: clinicColors.gradients.primary
                }
              }} 
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Sistema optimizado al 95%
              </Typography>
              <Chip 
                label="Excelente" 
                size="small" 
                color="success"
                sx={{ fontWeight: 700 }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: 4, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: `linear-gradient(135deg, ${clinicColors.alpha.primary10} 0%, white 100%)`,
            border: `2px solid ${clinicColors.alpha.primary20}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ 
                bgcolor: clinicColors.warning,
                width: 44,
                height: 44
              }}>
                <Warning />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Próximos pasos
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Chip 
                label="En desarrollo" 
                size="small" 
                sx={{ 
                  mb: 1.5,
                  bgcolor: clinicColors.warning,
                  color: 'white',
                  fontWeight: 700
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Módulo de Gestión de Acceso y Seguridad
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              fullWidth
              endIcon={<ArrowForward />}
              sx={{ 
                background: clinicColors.gradients.primary,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: `0 6px 20px ${clinicColors.alpha.primary30}`,
                '&:hover': {
                  boxShadow: `0 8px 30px ${clinicColors.alpha.primary30}`,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Iniciar configuración
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;