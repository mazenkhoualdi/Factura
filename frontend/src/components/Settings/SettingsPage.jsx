import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Switch,
  styled,
  alpha,
  useTheme,
  Fade,
  Grow,
  Chip,
  Divider,
  Paper,
  Avatar,
  Grid,
  Tooltip,
  IconButton,
  Button,
  Zoom,
  Slide,
} from "@mui/material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useAppContext } from "../../context/AppContext";

// Switch personnalisé façon "toggle" avec icônes soleil/lune animées
const ThemeSwitch = styled((props) => (
  <Switch
    focusVisibleClassName=".Mui-focusVisible"
    disableRipple
    {...props}
  />
))(({ theme }) => ({
  width: 72,
  height: 40,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 4,
    margin: 0,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(32px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#1a1a2e",
        opacity: 1,
        border: 0,
      },
      "& .MuiSwitch-thumb": {
        backgroundColor: "#16213e",
        "&::after": {
          content: '"🌙"',
          position: "absolute",
          fontSize: "16px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 32,
    height: 32,
    backgroundColor: "#ffb300",
    boxShadow: `0 2px 12px ${alpha("#000", 0.3)}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    "&::after": {
      content: '"☀️"',
      position: "absolute",
      fontSize: "16px",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  "& .MuiSwitch-track": {
    borderRadius: 40 / 2,
    backgroundColor: "#bcd4f2",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 300,
    }),
  },
}));

// Composant de carte de fonctionnalité
const FeatureCard = ({ icon, title, description, isActive, onClick }) => {
  const theme = useTheme();
  
  return (
    <Zoom in={true} style={{ transitionDelay: "100ms" }}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          border: `2px solid ${isActive ? theme.palette.primary.main : alpha(theme.palette.divider, 0.5)}`,
          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.05) : "transparent",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[4],
            borderColor: theme.palette.primary.main,
          },
          position: "relative",
          overflow: "hidden",
        }}
        onClick={onClick}
      >
        {isActive && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 40,
              height: 40,
              bgcolor: "primary.main",
              clipPath: "polygon(0 0, 100% 0, 100% 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 16, color: "white", transform: "rotate(45deg) translate(-4px, -4px)" }} />
          </Box>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Avatar sx={{ bgcolor: isActive ? "primary.main" : "grey.200", width: 40, height: 40 }}>
            {icon}
          </Avatar>
          <Typography variant="subtitle2" fontWeight={700}>
            {title}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Paper>
    </Zoom>
  );
};

// Composant de prévisualisation
const PreviewCard = ({ darkMode }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2.5,
        bgcolor: darkMode ? alpha("#1a1a2e", 0.8) : alpha(theme.palette.primary.main, 0.04),
        border: `1px solid ${alpha(darkMode ? "#ffffff" : theme.palette.divider, 0.1)}`,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Effet de fond animé */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: "50%",
          bgcolor: darkMode ? alpha("#ffd166", 0.05) : alpha("#ffb300", 0.08),
          transition: "all 0.5s ease",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -70,
          left: -70,
          width: 200,
          height: 200,
          borderRadius: "50%",
          bgcolor: darkMode ? alpha("#4a6cf7", 0.05) : alpha("#1976d2", 0.06),
          transition: "all 0.5s ease",
        }}
      />
    </Box>
  );
};

// Composant principal
export const SettingsPage = () => {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useAppContext();

  return (
    <Fade in timeout={400}>
      <Box sx={{ maxWidth: 800, mx: "auto", px: { xs: 1, sm: 0 } }}>
        {/* En-tête de page */}
        <Grow in timeout={300}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ mb: 4 }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <SettingsRoundedIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                Paramètres
              </Typography>
            </Box>
          </Stack>
        </Grow>

        {/* Carte "Apparence" */}
        <Grow in timeout={500}>
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              borderRadius: 4,
              overflow: "hidden",
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(160deg, ${alpha("#1a1a2e", 0.6)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
                  : `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
              transition: "all 0.3s ease",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              {/* En-tête de la carte */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <PaletteRoundedIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>
                    Apparence
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label={darkMode ? "🌙 Sombre activé" : "☀️ Clair activé"}
                  color={darkMode ? "default" : "warning"}
                  sx={{ fontWeight: 600 ,ml:2,mt:0.5}}
                />
              </Stack>

              <Divider sx={{ mb: 3 }} />

              {/* Section principale du thème */}
              <Box>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                  spacing={3}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {darkMode ? "Mode sombre" : "Mode clair"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
                      {darkMode
                        ? "🌙 Profitez d'une expérience visuelle plus confortable dans des environnements sombres. Parfait pour la soirée et pour réduire la fatigue oculaire."
                        : "☀️ Profitez d'une interface lumineuse et claire pour une lisibilité optimale. Idéal pour une utilisation en journée."}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ flexShrink: 0 }}
                  >
                    <Tooltip title={darkMode ? "Actuellement en mode sombre" : "Actuellement en mode clair"} arrow>
                      <Chip
                        size="medium"
                        icon={
                          darkMode ? (
                            <DarkModeRoundedIcon sx={{ fontSize: "18px !important" }} />
                          ) : (
                            <LightModeRoundedIcon sx={{ fontSize: "18px !important" }} />
                          )
                        }
                        label={darkMode ? "Sombre" : "Clair"}
                        sx={{
                          fontWeight: 700,
                          bgcolor: darkMode
                            ? alpha("#2b3450", 0.9)
                            : alpha(theme.palette.warning.main, 0.15),
                          color: darkMode ? "#ffd166" : theme.palette.warning.dark,
                          px: 1,
                        }}
                      />
                    </Tooltip>

                    <ThemeSwitch
                      checked={darkMode}
                      onChange={toggleDarkMode}
                      inputProps={{ "aria-label": "Basculer entre le mode clair et sombre" }}
                    />
                  </Stack>
                </Stack>

                

              
              </Box>
            </CardContent>
          </Card>
        </Grow>
      </Box>
    </Fade>
  );
};

export default SettingsPage;
