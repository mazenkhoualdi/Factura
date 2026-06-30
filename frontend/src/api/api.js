import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fonction pour télécharger un PDF
export const downloadPdf = async (id, fileName) => {
  try {
    const response = await api.get(`/clients/${id}/pdf`, {
      responseType: "blob",
    });

    // Créer un lien de téléchargement
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
    console.error("Erreur téléchargement PDF", error);
    return false;
  }
};

// Fonction pour visualiser un PDF (ouvre dans un nouvel onglet)
export const viewPdf = async (id) => {
  try {
    const response = await api.get(`/clients/${id}/pdf/view`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );
    window.open(url, "_blank");
    // Nettoyer l'URL après un délai
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    return true;
  } catch (error) {
    console.error("Erreur visualisation PDF", error);
    return false;
  }
};

export default api;
