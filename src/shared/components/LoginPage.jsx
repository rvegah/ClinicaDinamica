import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Container,
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  validateCredentials,
  deviceIPMapping,
} from "../../modules/user-management/constants/userConstants";
import DeviceValidationModal from "../../components/DeviceValidationModal";
import { clinicColors } from "../../app/theme";

const LoginPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar credenciales
      const user = validateCredentials(formData.usuario, formData.password);

      if (!user) {
        enqueueSnackbar("Usuario o contraseña incorrectos", {
          variant: "error",
        });
        setLoading(false);
        return;
      }

      // Guardar usuario pendiente y abrir modal de validación
      setPendingUser(user);
      setShowDeviceModal(true);
      setLoading(false);
    } catch (error) {
      enqueueSnackbar("Error al iniciar sesión", { variant: "error" });
      setLoading(false);
    }
  };

  const handleDeviceValidation = (isValid) => {
    setShowDeviceModal(false);

    // MODO DESARROLLO: Siempre permitir acceso
    if (pendingUser) {
      // Guardar sesión
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", JSON.stringify(pendingUser));

      // Actualizar último acceso
      const now = new Date().toLocaleString("es-BO");
      const updatedUser = { ...pendingUser, ultimoAcceso: now };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      enqueueSnackbar(`Bienvenido ${pendingUser.nombreCompleto}`, {
        variant: "success",
      });
      navigate("/dashboard");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: clinicColors.gradients.primary,
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              background: clinicColors.gradients.sidebar,
              padding: 4,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 1,
              }}
            >
              CLINICA FARMA
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontWeight: 400,
              }}
            >
              Sistema Integral de Gestión Clínica
            </Typography>
          </Box>

          <CardContent sx={{ padding: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                textAlign: "center",
                color: "text.primary",
                fontWeight: 500,
              }}
            >
              Iniciar Sesión
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                name="usuario"
                label="Usuario"
                value={formData.usuario}
                onChange={handleChange}
                required
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: clinicColors.primary,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: clinicColors.primary }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: clinicColors.primary,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: clinicColors.primary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  background: clinicColors.gradients.primary,
                  color: "white",
                  fontWeight: 600,
                  py: 1.5,
                  "&:hover": {
                    background: clinicColors.primaryDark,
                  },
                }}
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                © 2025 SI CLINICA FARMA - Todos los derechos reservados
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: clinicColors.alpha.primary10,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                component="div"
              >
                <strong>Usuarios de prueba:</strong>
                <br />
                • admin / admin123 (Administrador)
                <br />
                • dr.perez / medico123 (Médico)
                <br />
                • enf.lopez / enfermero123 (Enfermero)
                <br />• recep.garcia / recepcion123 (Recepcionista)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Modal de validación de dispositivo */}
      <DeviceValidationModal
        open={showDeviceModal}
        deviceName={pendingUser?.nombreEquipo || ""}
        deviceIPMapping={deviceIPMapping}
        onValidationComplete={handleDeviceValidation}
      />
    </Box>
  );
};

export default LoginPage;