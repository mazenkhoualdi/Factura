import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import PeopleIcon from "@mui/icons-material/People";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import api from "../../api/api";

const getStatusLabel = (status) => {
  const map = {
    pending: "En attente",
    accepted: "Accepté",
    refused: "Refusé",
    validated: "Validé",
    preparing: "En préparation",
    delivered: "Livré",
    partial: "Partiellement livré",
    cancelled: "Annulé",
    paid: "Payée",
    unpaid: "Non payée",
    late: "En retard",
    agreement: "En attente d'accord",
    contested: "Contesté",
    completed: "Terminé",
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const map = {
    pending: "#ff9800",
    accepted: "#4caf50",
    refused: "#f44336",
    validated: "#4caf50",
    preparing: "#ff9800",
    delivered: "#2196f3",
    partial: "#ff9800",
    cancelled: "#f44336",
    paid: "#4caf50",
    unpaid: "#f44336",
    late: "#f44336",
    agreement: "#ff9800",
    contested: "#f44336",
    completed: "#4caf50",
  };
  return map[status] || "#9e9e9e";
};

const getStatusIcon = (status) => {
  if (
    ["accepted", "validated", "delivered", "paid", "completed"].includes(status)
  ) {
    return <CheckCircleIcon color="success" />;
  }
  if (["pending", "preparing", "agreement", "partial"].includes(status)) {
    return <PendingIcon color="warning" />;
  }
  if (
    ["refused", "cancelled", "contested", "late", "unpaid"].includes(status)
  ) {
    return <CancelIcon color="error" />;
  }
  return <HourglassEmptyIcon color="info" />;
};

const getStepIcon = (key) => {
  const icons = {
    client: <PeopleIcon />,
    devis: <DescriptionIcon />,
    bdc: <ReceiptIcon />,
    bl: <LocalShippingIcon />,
    attachement: <AttachFileIcon />,
    facture: <ReceiptLongIcon />,
    paiements: <PaymentsIcon />,
  };
  return icons[key] || <DescriptionIcon />;
};

export const Traceability = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResult(null);
      setNotFound(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(
        `/traceability/search?query=${searchTerm.trim()}`,
      );
      if (response.data && Object.keys(response.data).length > 0) {
        setResult(response.data);
        setNotFound(false);
      } else {
        setResult(null);
        setNotFound(true);
      }
    } catch (error) {
      console.error("Erreur recherche", error);
      setResult(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setResult(null);
    setNotFound(false);
  };

  const renderRoadmap = (data) => {
    const steps = [
      { key: "client", label: "Client", doc: data.client },
      { key: "devis", label: "Devis", doc: data.document },
      { key: "bdc", label: "BDC", doc: data.bdc },
      { key: "bl", label: "BL", doc: data.bl },
      { key: "attachement", label: "Attachement", doc: data.attachement },
      { key: "facture", label: "Facture", doc: data.facture },
      { key: "paiements", label: "Paiements", doc: data.paiements },
    ];

    // Si le document recherché est un paiement, on adapte
    if (data.type === "paiement") {
      // Les paiements sont déjà dans data.paiements
    }

    return (
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
            mt: 2,
          }}
        >
          {steps.map((step, index) => {
            const hasDoc =
              step.doc &&
              (Array.isArray(step.doc) ? step.doc.length > 0 : true);
            const status = hasDoc
              ? Array.isArray(step.doc)
                ? step.doc[0]?.status
                : step.doc?.status
              : null;
            const isHighlight =
              searchTerm &&
              data.document &&
              step.doc &&
              (step.doc.number === searchTerm.trim() ||
                step.doc.reference === searchTerm.trim());

            return (
              <React.Fragment key={step.key}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: hasDoc ? `${getStatusColor(status)}15` : "#f5f5f5",
                    border: `2px solid ${isHighlight ? "#1976d2" : hasDoc ? getStatusColor(status) : "#e0e0e0"}`,
                    boxShadow: isHighlight ? "0 0 0 3px #1976d2" : "none",
                    minWidth: 100,
                    cursor: hasDoc ? "pointer" : "default",
                    transition: "all 0.2s",
                    "&:hover": hasDoc
                      ? { transform: "scale(1.03)", boxShadow: 2 }
                      : {},
                  }}
                  onClick={() => {
                    if (hasDoc && step.doc) {
                      const doc = step.doc;
                      alert(
                        `📄 ${step.label}\n\n` +
                          `Numéro: ${doc.number || doc.reference || "N/A"}\n` +
                          `Statut: ${getStatusLabel(doc.status)}\n` +
                          `Montant: ${doc.amount ? `${doc.amount.toLocaleString()} €` : "N/A"}\n` +
                          `Date: ${doc.date ? new Date(doc.date).toLocaleDateString("fr-FR") : "N/A"}\n` +
                          `Description: ${doc.description || "Aucune"}`,
                      );
                    }
                  }}
                >
                  {hasDoc ? (
                    getStatusIcon(status)
                  ) : (
                    <CircleIcon sx={{ color: "#e0e0e0" }} />
                  )}
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ mt: 0.5 }}
                  >
                    {step.label}
                  </Typography>
                  {hasDoc && (
                    <Typography variant="caption" color="text.secondary">
                      {Array.isArray(step.doc)
                        ? `${step.doc.length} paiement(s)`
                        : step.doc?.number || ""}
                    </Typography>
                  )}
                </Box>
                {index < steps.length - 1 && (
                  <ArrowForwardIcon
                    sx={{ color: "text.secondary", fontSize: 20 }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Traçabilité
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Entrez un numéro de document pour voir son parcours complet
      </Typography>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          placeholder="Numéro de document (ex: DEV-0001, BDC-0002, FAC-0010...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
          disabled={loading}
        >
          {loading ? "Recherche..." : "Rechercher"}
        </Button>
        <Button
          variant="outlined"
          onClick={handleClear}
          startIcon={<ClearIcon />}
        >
          Effacer
        </Button>
      </Paper>

      <Card>
        <CardContent>
          {notFound && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Aucun document trouvé avec le numéro{" "}
                <strong>"{searchTerm}"</strong>.
              </Typography>
            </Box>
          )}
          {result && renderRoadmap(result)}
          {!result && !notFound && (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              Recherchez un document pour voir son parcours
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
