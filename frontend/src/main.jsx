import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProvider, useAppContext } from "./context/AppContext";
import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";

// Construit dynamiquement le thème MUI (clair/sombre) selon la préférence
// stockée dans AppContext, afin que le switch de la page Paramètres puisse
// changer l'apparence de toute l'application en direct.
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#1976d2" },
      secondary: { main: "#dc004e" },
      ...(mode === "light"
        ? {
            background: {
              default: "#f5f7fa",
              paper: "#ffffff",
            },
          }
        : {
            background: {
              default: "#0f1420",
              paper: "#171d2b",
            },
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    transitions: {
      duration: {
        standard: 250,
      },
    },
  });

const ThemedApp = () => {
  const { darkMode } = useAppContext();
  const theme = useMemo(() => getTheme(darkMode ? "dark" : "light"), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  </React.StrictMode>,
);
