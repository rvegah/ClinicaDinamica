import { createTheme } from '@mui/material/styles';

// COLORES CORPORATIVOS - SI CLINICA FARMA
export const clinicColors = {
  // Colores principales
  primary: '#0066CC',
  primaryLight: '#4A90E2',
  primaryDark: '#004C99',
  
  secondary: '#00A86B',
  secondaryLight: '#2ECC71',
  secondaryDark: '#008556',
  
  // Gradientes
  gradients: {
    primary: 'linear-gradient(135deg, #0066CC 0%, #4A90E2 100%)',
    secondary: 'linear-gradient(135deg, #00A86B 0%, #2ECC71 100%)',
    sidebar: 'linear-gradient(180deg, #004C99 0%, #0066CC 100%)',
    card: 'linear-gradient(135deg, rgba(0,102,204,0.1) 0%, rgba(74,144,226,0.05) 100%)',
    hover: 'linear-gradient(135deg, rgba(0,102,204,0.15) 0%, rgba(74,144,226,0.1) 100%)'
  },
  
  // Colores con transparencia
  alpha: {
    primary10: 'rgba(0,102,204,0.1)',
    primary20: 'rgba(0,102,204,0.2)',
    primary30: 'rgba(0,102,204,0.3)',
    secondary10: 'rgba(0,168,107,0.1)',
    secondary20: 'rgba(0,168,107,0.2)',
    secondary30: 'rgba(0,168,107,0.3)'
  },
  
  // Colores de estado
  success: '#00A86B',
  error: '#dc3545',
  warning: '#FFA726',
  info: '#29B6F6',
  
  // Modo claro
  light: {
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
      card: '#FFFFFF'
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
      disabled: '#BDC3C7',
      white: '#FFFFFF'
    }
  },
  
  // Modo oscuro
  dark: {
    background: {
      default: '#121212',
      paper: '#1E1E1E',
      card: '#2C2C2C'
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0',
      disabled: '#6C6C6C',
      white: '#FFFFFF'
    }
  }
};

// Crear tema dinámico
export const createAppTheme = (mode = 'light') => {
  const isDark = mode === 'dark';
  const colors = isDark ? clinicColors.dark : clinicColors.light;
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: clinicColors.primary,
        light: clinicColors.primaryLight,
        dark: clinicColors.primaryDark,
      },
      secondary: {
        main: clinicColors.secondary,
        light: clinicColors.secondaryLight,
        dark: clinicColors.secondaryDark,
      },
      error: {
        main: clinicColors.error,
      },
      warning: {
        main: clinicColors.warning,
      },
      info: {
        main: clinicColors.info,
      },
      success: {
        main: clinicColors.success,
      },
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.02em'
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.01em'
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 4px 8px rgba(0,0,0,0.08)',
      '0px 8px 16px rgba(0,0,0,0.1)',
      '0px 12px 24px rgba(0,0,0,0.12)',
      '0px 16px 32px rgba(0,0,0,0.15)',
      ...Array(19).fill('0px 20px 40px rgba(0,0,0,0.2)')
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
            fontWeight: 600,
            padding: '10px 24px',
            boxShadow: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0px 8px 30px rgba(0,0,0,0.12)',
              transform: 'translateY(-4px)'
            }
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: 'all 0.3s ease',
              '&:hover': {
                '& fieldset': {
                  borderColor: clinicColors.primaryLight,
                }
              },
              '&.Mui-focused fieldset': {
                borderColor: clinicColors.primary,
                borderWidth: 2
              }
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500
          }
        }
      }
    },
  });
};