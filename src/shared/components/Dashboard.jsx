// src/shared/components/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Fade,
  Grid,
  Button,
} from "@mui/material";
import {
  MedicalServices,
  Healing,
  LocalHospital,
  Air,
  ChildCare,
  PersonalVideo,
  Vaccines,
  MonitorHeart,
  Science,
  Psychology,
  Close,
  AttachMoney,
  BarChart,
} from "@mui/icons-material";
import clinicaLogo from "../../assets/CLINICA.jpeg";

// ── Ícono según descripción ───────────────────────────────────────────────────
const getIconForService = (descripcion) => {
  const d = descripcion.toLowerCase();
  if (d.includes("oxigen")) return Air;
  if (d.includes("pediatr")) return ChildCare;
  if (d.includes("curac")) return Healing;
  if (d.includes("vacun")) return Vaccines;
  if (d.includes("monitor") || d.includes("vital")) return MonitorHeart;
  if (d.includes("laborat") || d.includes("analisis")) return Science;
  if (d.includes("psicolog") || d.includes("mental")) return Psychology;
  if (d.includes("consulta")) return PersonalVideo;
  return MedicalServices;
};

// ── Estilo por categoría ──────────────────────────────────────────────────────
const getCategoryStyle = (categoria) => {
  const cat = categoria?.toLowerCase() || "";
  if (cat.includes("consulta"))
    return {
      color: "#D35400",
      light: "#FEF9F0",
      border: "#F5CBA7",
      gradient: "linear-gradient(135deg, #E67E22 0%, #F39C12 100%)",
      shadow: "rgba(230,126,34,0.35)",
    };
  if (cat.includes("enfermer"))
    return {
      color: "#1A7A40",
      light: "#F0FAF4",
      border: "#A9DFBF",
      gradient: "linear-gradient(135deg, #1E8449 0%, #27AE60 100%)",
      shadow: "rgba(30,132,73,0.35)",
    };
  return {
    color: "#1A5276",
    light: "#EBF5FB",
    border: "#AED6F1",
    gradient: "linear-gradient(135deg, #1A5276 0%, #2471A3 100%)",
    shadow: "rgba(26,82,118,0.35)",
  };
};

// ── Ícono grande para cada categoría ─────────────────────────────────────────
const getCategoryIcon = (categoria) => {
  const cat = categoria?.toLowerCase() || "";
  if (cat.includes("consulta")) return PersonalVideo;
  if (cat.includes("enfermer")) return Healing;
  return MedicalServices;
};

// ── Card de categoría (clickeable) ───────────────────────────────────────────
function CategoryCard({ categoria, servicios, onClick }) {
  const style = getCategoryStyle(categoria);
  const IconCat = getCategoryIcon(categoria);

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        p: 0,
        overflow: "hidden",
        border: `1.5px solid ${style.border}`,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: `0 12px 32px ${style.shadow}`,
          borderColor: style.color,
        },
      }}
    >
      {/* Franja superior de color */}
      <Box
        sx={{
          background: style.gradient,
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "rgba(255,255,255,0.25)",
            width: 48,
            height: 48,
            border: "2px solid rgba(255,255,255,0.4)",
          }}
        >
          <IconCat sx={{ fontSize: "1.6rem", color: "white" }} />
        </Avatar>
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              color: "white",
              fontSize: "1rem",
              lineHeight: 1.2,
            }}
          >
            {categoria}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.72rem",
              fontWeight: 500,
            }}
          >
            {servicios.length} servicio{servicios.length !== 1 ? "s" : ""}{" "}
            disponibles
          </Typography>
        </Box>
      </Box>

      {/* Preview de 3 servicios */}
      <Box sx={{ bgcolor: style.light, px: 2.5, py: 1.5 }}>
        {servicios.slice(0, 3).map((s) => (
          <Box
            key={s.codigo}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 0.4,
            }}
          >
            <Typography
              sx={{ fontSize: "0.72rem", color: "#2C3E50", fontWeight: 500 }}
              noWrap
            >
              • {s.descripcion}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: style.color,
                fontWeight: 700,
                ml: 1,
                flexShrink: 0,
              }}
            >
              Bs. {s.precioReferencia?.toFixed(2)}
            </Typography>
          </Box>
        ))}
        {servicios.length > 3 && (
          <Typography
            sx={{
              fontSize: "0.68rem",
              color: style.color,
              fontWeight: 700,
              mt: 0.5,
              textAlign: "right",
            }}
          >
            + {servicios.length - 3} más →
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

// ── Dialog de servicios ───────────────────────────────────────────────────────
function ServiciosDialog({ open, onClose, categoria, servicios }) {
  const style = getCategoryStyle(categoria);
  const IconCat = getCategoryIcon(categoria);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: `0 24px 64px ${style.shadow}`,
        },
      }}
    >
      {/* Header del dialog */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            background: style.gradient,
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.25)",
              width: 44,
              height: 44,
              border: "2px solid rgba(255,255,255,0.35)",
            }}
          >
            <IconCat sx={{ fontSize: "1.4rem", color: "white" }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 800,
                color: "white",
                fontSize: "1.05rem",
                lineHeight: 1.2,
              }}
            >
              {categoria}
            </Typography>
            <Typography
              sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.72rem" }}
            >
              {servicios.length} servicio{servicios.length !== 1 ? "s" : ""}{" "}
              disponibles
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Lista de servicios */}
      <DialogContent sx={{ p: 0, bgcolor: style.light }}>
        <List disablePadding>
          {servicios.map((s, idx) => {
            const IconSvc = getIconForService(s.descripcion);
            const isLast = idx === servicios.length - 1;

            return (
              <React.Fragment key={s.codigo}>
                <ListItem
                  sx={{
                    px: 3,
                    py: 1.4,
                    transition: "background 0.15s",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.03)" },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 46 }}>
                    <Avatar
                      sx={{
                        bgcolor: style.color + "1A",
                        width: 34,
                        height: 34,
                        border: `1.5px solid ${style.border}`,
                      }}
                    >
                      <IconSvc sx={{ fontSize: "1rem", color: style.color }} />
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "#1A2B4A",
                          lineHeight: 1.3,
                        }}
                      >
                        {s.descripcion}
                      </Typography>
                    }
                    secondary={
                      <Chip
                        label={s.codigo}
                        size="small"
                        sx={{
                          mt: 0.4,
                          height: 17,
                          bgcolor: style.color + "18",
                          color: style.color,
                          fontWeight: 700,
                          fontSize: "0.6rem",
                          "& .MuiChip-label": { px: 0.8 },
                        }}
                      />
                    }
                  />

                  {/* Precio */}
                  <Box sx={{ textAlign: "right", ml: 2, flexShrink: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.3,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.95rem",
                          color: style.color,
                        }}
                      >
                        {s.precioReferencia?.toFixed(2)} Bs.
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.6rem",
                        color: "#7F8C8D",
                        fontWeight: 500,
                      }}
                    >
                      precio referencial.
                    </Typography>
                  </Box>
                </ListItem>

                {!isLast && (
                  <Box
                    sx={{ mx: 3, borderBottom: `1px solid ${style.border}` }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
}

// ── DASHBOARD PRINCIPAL ───────────────────────────────────────────────────────
function Dashboard() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogCat, setDialogCat] = useState(null); // categoría abierta

  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const esSuperAdmin = user?.rol === "SuperAdmin";

  useEffect(() => {
    fetch(
      "https://dinamax-clinicas.farmadinamica.com.bo/api/farmalink-clinica/Reportes/ReporteAtencionMedica",
      { headers: { accept: "*/*" } },
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.exitoso && Array.isArray(data.datos)) setServicios(data.datos);
        else throw new Error(data.mensaje || "Respuesta inválida");
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const categorias = servicios.reduce((acc, s) => {
    const cat = s.categoria || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const serviciosDialog = dialogCat ? categorias[dialogCat] || [] : [];

  return (
    <Box>
      {esSuperAdmin && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<BarChart />}
            onClick={() => navigate("/reportes/ingresos")}
            sx={{
              bgcolor: "#E67E22",
              "&:hover": { bgcolor: "#D35400" },
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(230,126,34,0.35)",
            }}
          >
            Reporte de Ingresos
          </Button>
        </Box>
      )}
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0D2137 0%, #1A5276 60%, #2980B9 100%)",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 80% 20%, rgba(230,126,34,0.15) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(41,128,185,0.2) 0%, transparent 50%)`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            p: { xs: 2.5, md: 3 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 3,
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              bgcolor: "white",
              borderRadius: 3,
              p: 2,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 150,
            }}
          >
            <Box
              component="img"
              src={clinicaLogo}
              alt="DINAMAX"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextSibling.style.display = "flex";
              }}
              sx={{ height: 90, objectFit: "contain", display: "block" }}
            />
            <Box
              sx={{
                display: "none",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <LocalHospital sx={{ fontSize: "2rem", color: "#1A5276" }} />
              <Typography
                sx={{ fontWeight: 800, color: "#1A5276", fontSize: "0.8rem" }}
              >
                DINAMAX
              </Typography>
            </Box>
          </Box>

          <Box sx={{ color: "white" }}>
            <Typography
              sx={{
                color: "#E67E22",
                fontWeight: 700,
                letterSpacing: "3px",
                fontSize: "0.7rem",
                textTransform: "uppercase",
              }}
            >
              Sistema de Gestión Médica
            </Typography>
            <Typography
              sx={{
                fontWeight: 900,
                lineHeight: 1.1,
                mb: 0.5,
                fontSize: { xs: "1.3rem", md: "1.55rem" },
                textShadow: "0 2px 12px rgba(0,0,0,0.3)",
              }}
            >
              Centro Médico
              <Box component="span" sx={{ color: "#E67E22", display: "block" }}>
                DINAMAX S.R.L.
              </Box>
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.72)",
                fontSize: "0.78rem",
                lineHeight: 1.5,
              }}
            >
              Centro Médico con Internación Transitoria
            </Typography>
            <Box sx={{ display: "flex", gap: 3.5, mt: 1.5 }}>
              {[
                { label: "Servicios", valor: loading ? "…" : servicios.length },
                {
                  label: "Categorías",
                  valor: loading ? "…" : Object.keys(categorias).length,
                },
                { label: "Estado", valor: "Operativo" },
              ].map((s) => (
                <Box key={s.label}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#E67E22",
                      fontSize: "1.15rem",
                      lineHeight: 1,
                    }}
                  >
                    {s.valor}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.55)",
                      fontSize: "0.62rem",
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ── TÍTULO ───────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
        <Typography
          sx={{
            fontWeight: 800,
            color: "#1A2B4A",
            fontSize: "0.95rem",
            whiteSpace: "nowrap",
          }}
        >
          Servicios Disponibles
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(26,82,118,0.15)" }} />
        <Typography
          sx={{
            fontSize: "0.72rem",
            color: "#7F8C8D",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Selecciona una categoría para ver el detalle
        </Typography>
      </Box>

      {/* ── LOADING ──────────────────────────────────────────────────────── */}
      {loading && (
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rounded"
                height={140}
                sx={{ borderRadius: 3, bgcolor: "rgba(26,82,118,0.07)" }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── ERROR ────────────────────────────────────────────────────────── */}
      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          No se pudieron cargar los servicios: {error}
        </Alert>
      )}

      {/* ── CARDS DE CATEGORÍA ───────────────────────────────────────────── */}
      {!loading && !error && (
        <Grid container spacing={2}>
          {Object.entries(categorias).map(([cat, items]) => (
            <Grid item xs={12} sm={6} md={4} key={cat}>
              <CategoryCard
                categoria={cat}
                servicios={items}
                onClick={() => setDialogCat(cat)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── DIALOG ───────────────────────────────────────────────────────── */}
      <ServiciosDialog
        open={Boolean(dialogCat)}
        onClose={() => setDialogCat(null)}
        categoria={dialogCat || ""}
        servicios={serviciosDialog}
      />
    </Box>
  );
}

export default Dashboard;
