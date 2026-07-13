import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/api";

const AppContext = createContext();

const getInitialDarkMode = () => {
  try {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (error) {
    return false;
  }
};

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [clients, setClients] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [devis, setDevis] = useState([]);
  const [bdc, setBdc] = useState([]);
  const [bl, setBl] = useState([]);
  const [attachements, setAttachements] = useState([]);
  const [factures, setFactures] = useState([]);
  const [facturesAchats, setFacturesAchats] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadClients = async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data || []);
    } catch (error) {
      console.error("Erreur chargement clients", error);
      setClients([]); // ← En cas d'erreur, mettre un tableau vide
    }
  };

  const loadSocieties = async () => {
    // <-- AJOUT
    try {
      const response = await api.get("/societes");
      setSocieties(response.data || []);
    } catch (error) {
      console.error("Erreur chargement sociétés", error);
    }
  };

  const loadDevis = async () => {
    try {
      const response = await api.get("/devis");
      setDevis(response.data || []);
    } catch (error) {
      console.error("Erreur chargement devis", error);
    }
  };

  const loadBdc = async () => {
    try {
      const response = await api.get("/bdc");
      setBdc(response.data || []);
    } catch (error) {
      console.error("Erreur chargement BDC", error);
    }
  };

  const loadBl = async () => {
    try {
      const response = await api.get("/bl");
      setBl(response.data || []);
    } catch (error) {
      console.error("Erreur chargement BL", error);
    }
  };

  const loadAttachements = async () => {
    try {
      const response = await api.get("/attachements");
      setAttachements(response.data || []);
    } catch (error) {
      console.error("Erreur chargement attachements", error);
    }
  };

  const loadFactures = async () => {
    try {
      const response = await api.get("/factures");
      setFactures(response.data || []);
    } catch (error) {
      console.error("Erreur chargement factures", error);
    }
  };

  const loadFacturesAchats = async () => {
    try {
      const response = await api.get("/factures-achats");
      setFacturesAchats(response.data || []);
    } catch (error) {
      console.error("Erreur chargement factures d'achat", error);
    }
  };

  const loadPaiements = async () => {
    try {
      const response = await api.get("/paiements");
      setPaiements(response.data || []);
    } catch (error) {
      console.error("Erreur chargement paiements", error);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadClients(),
      loadSocieties(), // <-- AJOUT
      loadDevis(),
      loadBdc(),
      loadBl(),
      loadAttachements(),
      loadFactures(),
      loadFacturesAchats(),
      loadPaiements(),
    ]);
  };

  // Chargement initial des données
  useEffect(() => {
    loadAllData();
  }, []);

  // Rafraîchissement automatique de toutes les données pour assurer
  // la cohérence entre les pages (polling silencieux, sans écran de chargement)
  const AUTO_REFRESH_INTERVAL_MS = 15000; // 15 secondes

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadAllData();
    }, AUTO_REFRESH_INTERVAL_MS);

    // Rafraîchir aussi dès que l'onglet redevient actif/visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadAllData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("darkMode", String(darkMode));
    } catch (error) {
      console.error("Erreur sauvegarde préférence de thème", error);
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const value = {
    darkMode,
    toggleDarkMode,
    setDarkMode,
    clients,
    societies, // <-- AJOUT
    devis,
    bdc,
    bl,
    attachements,
    factures,
    facturesAchats,
    paiements,
    loading,
    loadClients,
    loadSocieties, // <-- AJOUT
    loadDevis,
    loadBdc,
    loadBl,
    loadAttachements,
    loadFactures,
    loadFacturesAchats,
    loadPaiements,
    loadAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
