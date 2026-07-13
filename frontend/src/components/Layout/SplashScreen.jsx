import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  alpha, 
  useTheme, 
  LinearProgress,
  Fade,
  Zoom,
  Stack
} from "@mui/material";
import sotusinLogo from "../../assets/sotusin_logo.png";

/**
 * Écran de démarrage (splash screen) affiché pendant le chargement initial
 * de l'application, le temps que toutes les données soient récupérées
 * depuis le serveur. Affiche le logo de la société SOTUSIN.
 */
export const SplashScreen = () => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initialisation...");

  // Simulation de progression
  useEffect(() => {
    const steps = [
      { progress: 20, text: "Connexion au serveur..." },
      { progress: 40, text: "Chargement des données..." },
      { progress: 60, text: "Préparation de l'interface..." },
      { progress: 80, text: "Optimisation des performances..." },
      { progress: 100, text: "Prêt !" },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setProgress(step.progress);
        setLoadingText(step.text);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const isDark = theme.palette.mode === "dark";

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
        gap: 4,
        bgcolor: isDark ? "#0a0e1a" : "#f8fafc",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Particules d'arrière-plan */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              animation: `sotusin-float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              "@keyframes sotusin-float": {
                "0%, 100%": { transform: "translateY(0px) scale(1)", opacity: 0.15 },
                "50%": { transform: `translateY(-${20 + Math.random() * 30}px) scale(1.5)`, opacity: 0.5 },
              },
            }}
          />
        ))}
      </Box>

      <Zoom in={true} timeout={600}>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Anneau extérieur avec gradient */}
          <Box
            sx={{
              position: "absolute",
              width: 190,
              height: 190,
              borderRadius: "50%",
              background: `conic-gradient(
                from 0deg,
                ${alpha(theme.palette.primary.main, 0.05)},
                ${alpha(theme.palette.primary.main, 0.3)},
                ${alpha(theme.palette.primary.main, 0.05)}
              )`,
              animation: "sotusin-spin 3s linear infinite",
              "@keyframes sotusin-spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />

          {/* Anneau de chargement principal */}
          <Box
            sx={{
              position: "absolute",
              width: 168,
              height: 168,
              borderRadius: "50%",
              border: `3px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              borderTopColor: theme.palette.primary.main,
              borderRightColor: alpha(theme.palette.primary.main, 0.6),
              animation: "sotusin-spin 1.2s cubic-bezier(0.65, 0, 0.35, 1) infinite",
              "@keyframes sotusin-spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
              boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          />

          {/* Deuxième anneau avec delay */}
          <Box
            sx={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: "50%",
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.05)}`,
              borderBottomColor: theme.palette.secondary.main,
              animation: "sotusin-spin-reverse 2s linear infinite",
              "@keyframes sotusin-spin-reverse": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(-360deg)" },
              },
            }}
          />

          {/* Logo avec effet de brillance */}
          <Box
            sx={{
              position: "relative",
              width: 130,
              height: 130,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              backdropFilter: "blur(10px)",
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -2,
                borderRadius: "50%",
                padding: 2,
                background: `conic-gradient(
                  from 0deg,
                  transparent 0%,
                  ${alpha(theme.palette.primary.main, 0.1)} 20%,
                  transparent 40%
                )`,
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                animation: "sotusin-shine 3s linear infinite",
                "@keyframes sotusin-shine": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              },
            }}
          >
            <Box
              component="img"
              src={sotusinLogo}
              alt="SOTUSIN - Société Tunisienne de Service Industrielle"
              sx={{
                width: "70%",
                height: "70%",
                objectFit: "contain",
                animation: "sotusin-pulse 2s ease-in-out infinite",
                "@keyframes sotusin-pulse": {
                  "0%, 100%": { transform: "scale(1)", opacity: 1 },
                  "50%": { transform: "scale(1.05)", opacity: 0.9 },
                },
                filter: isDark 
                  ? "brightness(1.1) drop-shadow(0 0 20px rgba(255,255,255,0.05))"
                  : "drop-shadow(0 0 20px rgba(0,0,0,0.05))",
              }}
            />
          </Box>
        </Box>
      </Zoom>

      {/* Texte avec animation */}
      <Fade in={true} timeout={800}>
        <Box sx={{ textAlign: "center", width: "100%", maxWidth: 300 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1.5rem",
              letterSpacing: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            FACTURA
          </Typography>

          {/* Barre de progression */}
          <Box sx={{ width: "100%", mb: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  transition: "transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)",
                },
              }}
            />
          </Box>

          {/* Texte de chargement dynamique */}
          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "text.secondary",
                fontWeight: 500,
                letterSpacing: 0.5,
                transition: "all 0.3s ease",
              }}
            >
              {loadingText}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                alignItems: "center",
              }}
            >
              {[0, 0.2, 0.4].map((delay, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: theme.palette.primary.main,
                    animation: `sotusin-dot 1.4s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                    opacity: progress < 100 ? 1 : 0,
                    "@keyframes sotusin-dot": {
                      "0%, 80%, 100%": { transform: "scale(0.4)", opacity: 0.3 },
                      "40%": { transform: "scale(1)", opacity: 1 },
                    },
                  }}
                />
              ))}
            </Box>
          </Stack>

          {/* Pourcentage */}
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: alpha(theme.palette.text.secondary, 0.5),
              mt: 1,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            {Math.round(progress)}%
          </Typography>
        </Box>
      </Fade>

      {/* Footer avec version */}
      <Typography
        sx={{
          position: "absolute",
          bottom: 32,
          fontSize: "0.65rem",
          color: alpha(theme.palette.text.secondary, 0.3),
          letterSpacing: 1,
        }}
      >
        SOTUSIN © {new Date().getFullYear()}
      </Typography>
    </Box>
  );
};
