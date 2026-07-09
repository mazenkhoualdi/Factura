import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// FONCTIONS PDF GÉNÉRIQUES
// ============================================================

export const downloadPdf = async (endpoint, id, fileName) => {
  try {
    const response = await api.get(`/${endpoint}/${id}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName || "document.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error(`Erreur téléchargement PDF (${endpoint})`, error);
    return false;
  }
};

export const viewPdf = async (endpoint, id) => {
  try {
    const response = await api.get(`/${endpoint}/${id}/pdf/view`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );
    window.open(url, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    return true;
  } catch (error) {
    console.error(`Erreur visualisation PDF (${endpoint})`, error);
    return false;
  }
};

// ============================================================
// FONCTIONS SPÉCIFIQUES PAR MODULE
// ============================================================

// Clients
export const downloadClientPdf = (id, fileName) =>
  downloadPdf("clients", id, fileName);
export const viewClientPdf = (id) => viewPdf("clients", id);

// Devis
export const downloadDevisPdf = (id, fileName) =>
  downloadPdf("devis", id, fileName);
export const viewDevisPdf = (id) => viewPdf("devis", id);

// BDC
export const downloadBdcPdf = (id, fileName) =>
  downloadPdf("bdc", id, fileName);
export const viewBdcPdf = (id) => viewPdf("bdc", id);

// BL
export const downloadBlPdf = (id, fileName) => downloadPdf("bl", id, fileName);
export const viewBlPdf = (id) => viewPdf("bl", id);

// Attachements
export const downloadAttachementPdf = (id, fileName) =>
  downloadPdf("attachements", id, fileName);
export const viewAttachementPdf = (id) => viewPdf("attachements", id);

// Factures
export const downloadFacturePdf = (id, fileName) =>
  downloadPdf("factures", id, fileName);
export const viewFacturePdf = (id) => viewPdf("factures", id);

// Devis Achats
export const downloadDevisAchatPdf = (id, fileName) =>
  downloadPdf("devis-achats", id, fileName);
export const viewDevisAchatPdf = (id) => viewPdf("devis-achats", id);

// Factures Achats
export const downloadFactureAchatPdf = (id, fileName) =>
  downloadPdf("factures-achats", id, fileName);
export const viewFactureAchatPdf = (id) => viewPdf("factures-achats", id);

// Paiements
export const downloadPaiementPdf = (id, fileName) =>
  downloadPdf("paiements", id, fileName);
export const viewPaiementPdf = (id) => viewPdf("paiements", id);

// ============================================================
// OBJECTIFS (KPIs configurables)
// ============================================================

// Objectif de gain total sur les achats — persisté en base côté backend
export const getGainAchatsObjectif = (month) =>
  api.get(`/objectifs/gain-achats/${month}`);
export const setGainAchatsObjectif = (month, montant) =>
  api.put(`/objectifs/gain-achats/${month}`, { montant });

export default api;
