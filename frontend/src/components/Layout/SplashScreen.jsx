import React from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import sotusinLogo from "../../assets/sotusin_logo.png";

/**
 * Écran de démarrage (splash screen) affiché pendant le chargement initial
 * de l'application, le temps que toutes les données soient récupérées
 * depuis le serveur. Affiche le logo de la société SOTUSIN.
 */
export const SplashScreen = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        bgcolor: theme.palette.mode === "dark" ? "#0f1420" : "#ffffff",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Anneau de chargement animé autour du logo */}
        <Box
          sx={{
            position: "absolute",
            width: 168,
            height: 168,
            borderRadius: "50%",
            border: `4px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            borderTopColor: theme.palette.primary.main,
            animation: "sotusin-spin 1s linear infinite",
            "@keyframes sotusin-spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
        <Box
          component="img"
          src={sotusinLogo}
          alt="SOTUSIN - Société Tunisienne de Service Industrielle"
          sx={{
            width: 130,
            height: 130,
            objectFit: "contain",
            animation: "sotusin-pulse 1.8s ease-in-out infinite",
            "@keyframes sotusin-pulse": {
              "0%, 100%": { transform: "scale(1)", opacity: 1 },
              "50%": { transform: "scale(1.04)", opacity: 0.92 },
            },
          }}
        />
      </Box>

      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1.1rem",
            letterSpacing: 1,
            color: "text.primary",
          }}
        >
          FACTURA
        </Typography>
        <Typography
          sx={{
            fontSize: "0.8rem",
            color: "text.secondary",
            mt: 0.5,
          }}
        >
          Chargement de l'application...
        </Typography>
      </Box>
    </Box>
  );
};
