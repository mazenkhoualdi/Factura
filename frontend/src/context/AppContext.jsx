import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [devis, setDevis] = useState([]);
  const [bdc, setBdc] = useState([]);
  const [bl, setBl] = useState([]);
  const [attachements, setAttachements] = useState([]);
  const [factures, setFactures] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [notifications, setNotifications] = useState([]);
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

  const loadPaiements = async () => {
    try {
      const response = await api.get("/paiements");
      setPaiements(response.data || []);
    } catch (error) {
      console.error("Erreur chargement paiements", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Erreur chargement notifications", error);
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
      loadPaiements(),
      loadNotifications(),
    ]);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const value = {
    clients,
    societies, // <-- AJOUT
    devis,
    bdc,
    bl,
    attachements,
    factures,
    paiements,
    notifications,
    loading,
    loadClients,
    loadSocieties, // <-- AJOUT
    loadDevis,
    loadBdc,
    loadBl,
    loadAttachements,
    loadFactures,
    loadPaiements,
    loadNotifications,
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
