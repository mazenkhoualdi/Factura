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
} from "@mui/material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import { useAppContext } from "../../context/AppContext";

// Switch personnalisé façon "toggle" avec icônes soleil/lune animées
const ThemeSwitch = styled((props) => (
  <Switch
    focusVisibleClassName=".Mui-focusVisible"
    disableRipple
    {...props}
  />
))(({ theme }) => ({
  width: 68,
  height: 38,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 4,
    margin: 0,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(30px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#2b3450",
        opacity: 1,
        border: 0,
      },
      "& .MuiSwitch-thumb": {
        backgroundColor: "#1c2333",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 30,
    height: 30,
    backgroundColor: "#ffb300",
    boxShadow: `0 2px 8px ${alpha("#000", 0.25)}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 300ms ease",
  },
  "& .MuiSwitch-track": {
    borderRadius: 38 / 2,
    backgroundColor: "#bcd4f2",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 300,
    }),
  },
}));

// Petite icône soleil/lune affichée au centre du thumb du switch
const SwitchIcon = ({ dark }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      color: dark ? "#ffd166" : "#fff",
    }}
  >
    {dark ? (
      <DarkModeRoundedIcon sx={{ fontSize: 16 }} />
    ) : (
      <LightModeRoundedIcon sx={{ fontSize: 16 }} />
    )}
  </Box>
);

export const SettingsPage = () => {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useAppContext();

  return (
    <Fade in timeout={400}>
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        {/* En-tête de page */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <SettingsRoundedIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Paramètres
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Personnalisez votre expérience de l'application
            </Typography>
          </Box>
        </Stack>

        {/* Carte "Apparence" */}
        <Grow in timeout={500}>
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              borderRadius: 3,
              overflow: "hidden",
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(160deg, ${alpha("#2b3450", 0.5)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
                  : `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <PaletteRoundedIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Apparence
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2.5 }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Mode sombre
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                    Basculez entre le mode clair et le mode sombre. Le changement
                    s'applique instantanément à toute l'application.
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Chip
                    size="small"
                    icon={
                      darkMode ? (
                        <DarkModeRoundedIcon sx={{ fontSize: "16px !important" }} />
                      ) : (
                        <LightModeRoundedIcon sx={{ fontSize: "16px !important" }} />
                      )
                    }
                    label={darkMode ? "Sombre" : "Clair"}
                    sx={{
                      fontWeight: 600,
                      bgcolor: alpha(
                        darkMode ? "#2b3450" : theme.palette.warning.main,
                        darkMode ? 1 : 0.12,
                      ),
                      color: darkMode ? "#ffd166" : theme.palette.warning.dark,
                    }}
                  />
                  <ThemeSwitch
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    icon={<SwitchIcon dark={false} />}
                    checkedIcon={<SwitchIcon dark={true} />}
                    inputProps={{ "aria-label": "Basculer entre le mode clair et sombre" }}
                  />
                </Stack>
              </Stack>

              {/* Aperçu dynamique en direct */}
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px dashed ${alpha(theme.palette.divider, 0.6)}`,
                  bgcolor: alpha(theme.palette.background.default, 0.6),
                  transition: "background-color 0.3s ease, border-color 0.3s ease",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: darkMode ? "#2b3450" : "#ffb300",
                      transition: "background-color 0.3s ease",
                      boxShadow: `0 0 0 4px ${alpha(darkMode ? "#2b3450" : "#ffb300", 0.2)}`,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Aperçu : le thème actuel est{" "}
                    <Typography component="span" fontWeight={700} color="text.primary">
                      {darkMode ? "sombre 🌙" : "clair ☀️"}
                    </Typography>
                    . Votre préférence est enregistrée automatiquement pour vos
                    prochaines visites.
                  </Typography>
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
