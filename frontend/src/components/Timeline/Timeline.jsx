import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CardHeader,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import CircleIcon from "@mui/icons-material/Circle";
import { useAppContext } from "../../context/AppContext";

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

const getStepIcon = (key) => {
  const icons = {
    devis: <DescriptionIcon sx={{ color: "#ed6c02" }} />,
    bdc: <ReceiptIcon sx={{ color: "#2e7d32" }} />,
    bl: <LocalShippingIcon sx={{ color: "#1976d2" }} />,
    attachement: <AttachFileIcon sx={{ color: "#9c27b0" }} />,
    facture: <ReceiptLongIcon sx={{ color: "#d32f2f" }} />,
    paiements: <PaymentsIcon sx={{ color: "#2e7d32" }} />,
  };
  return icons[key] || <CircleIcon />;
};

export const Timeline = () => {
  const {
    devis = [],
    bdc = [],
    bl = [],
    attachements = [],
    factures = [],
    paiements = [],
  } = useAppContext();

  // Construire les transactions à partir des données
  const transactions = devis.map((d) => {
    const bdcItem = bdc.find((b) => b.devisId === d.id);
    const blItem = bdcItem ? bl.find((b) => b.bdcId === bdcItem.id) : null;
    const attachement = blItem
      ? attachements.find((a) => a.blId === blItem.id)
      : null;
    const facture = attachement
      ? factures.find((f) => f.attachementId === attachement.id)
      : null;
    const paiementsList = facture
      ? paiements.filter((p) => p.factureId === facture.id)
      : [];

    return {
      id: d.id,
      clientName: d.clientName || "Client inconnu",
      devis: d,
      bdc: bdcItem,
      bl: blItem,
      attachement: attachement,
      facture: facture,
      paiements: paiementsList,
      status:
        facture && paiementsList.length > 0
          ? "completed"
          : attachement?.status === "validated"
            ? "in_progress"
            : blItem?.status === "delivered"
              ? "in_progress"
              : "blocked",
    };
  });

  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTransactions =
    statusFilter === "all"
      ? transactions
      : transactions.filter((trx) => trx.status === statusFilter);

  const handleStepClick = (stepLabel, doc) => {
    if (!doc) return;
    alert(
      `📄 ${stepLabel}\n\n` +
        `Numéro: ${doc.number || doc.reference || "N/A"}\n` +
        `Statut: ${getStatusLabel(doc.status)}\n` +
        `Montant: ${doc.amount ? `${doc.amount.toLocaleString()} €` : "N/A"}\n` +
        `Date: ${doc.date ? new Date(doc.date).toLocaleDateString("fr-FR") : "N/A"}\n` +
        `Description: ${doc.description || "Aucune"}`,
    );
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Timeline
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Chronologie détaillée de toutes les transactions
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Chip
          label="Toutes"
          color={statusFilter === "all" ? "primary" : "default"}
          onClick={() => setStatusFilter("all")}
          clickable
        />
        <Chip
          label="✅ Terminées"
          color={statusFilter === "completed" ? "success" : "default"}
          onClick={() => setStatusFilter("completed")}
          clickable
        />
        <Chip
          label="⏳ En cours"
          color={statusFilter === "in_progress" ? "warning" : "default"}
          onClick={() => setStatusFilter("in_progress")}
          clickable
        />
        <Chip
          label="❌ Bloquées"
          color={statusFilter === "blocked" ? "error" : "default"}
          onClick={() => setStatusFilter("blocked")}
          clickable
        />
      </Box>

      {filteredTransactions.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Aucune transaction avec ce filtre.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        filteredTransactions.map((trx) => {
          const steps = [
            { key: "devis", label: "Devis", doc: trx.devis },
            { key: "bdc", label: "BDC", doc: trx.bdc },
            { key: "bl", label: "BL", doc: trx.bl },
            { key: "attachement", label: "Attachement", doc: trx.attachement },
            { key: "facture", label: "Facture", doc: trx.facture },
            { key: "paiements", label: "Paiements", doc: trx.paiements },
          ];

          return (
            <Accordion key={trx.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography variant="h6">
                    <PeopleIcon
                      sx={{ mr: 1, verticalAlign: "middle", fontSize: 20 }}
                    />
                    {trx.clientName}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      {trx.devis.date
                        ? new Date(trx.devis.date).toLocaleDateString("fr-FR")
                        : ""}
                    </Typography>
                    <Chip
                      label={
                        trx.status === "completed"
                          ? "✅ Terminée"
                          : trx.status === "in_progress"
                            ? "⏳ En cours"
                            : "❌ Bloquée"
                      }
                      color={
                        trx.status === "completed"
                          ? "success"
                          : trx.status === "in_progress"
                            ? "warning"
                            : "error"
                      }
                      size="small"
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ position: "relative", pl: 4 }}>
                  {steps.map((step, index) => {
                    const hasDoc =
                      step.doc &&
                      (Array.isArray(step.doc) ? step.doc.length > 0 : true);
                    const status = hasDoc
                      ? Array.isArray(step.doc)
                        ? step.doc[0]?.status
                        : step.doc?.status
                      : null;
                    const statusColor = status
                      ? getStatusColor(status)
                      : "#9e9e9e";

                    return (
                      <Box key={step.key} sx={{ position: "relative", mb: 2 }}>
                        {index < steps.length - 1 && (
                          <Box
                            sx={{
                              position: "absolute",
                              left: -10,
                              top: 28,
                              bottom: -18,
                              width: 2,
                              bgcolor: hasDoc ? statusColor : "#e0e0e0",
                            }}
                          />
                        )}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              bgcolor: hasDoc ? `${statusColor}20` : "#f5f5f5",
                              border: `2px solid ${hasDoc ? statusColor : "#e0e0e0"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              mt: 0.5,
                            }}
                          >
                            {getStepIcon(step.key)}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="body1" fontWeight={600}>
                                {step.label}
                              </Typography>
                              {hasDoc ? (
                                <>
                                  <Chip
                                    label={
                                      Array.isArray(step.doc)
                                        ? `${step.doc.length} paiement(s)`
                                        : step.doc.number
                                    }
                                    size="small"
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={
                                      Array.isArray(step.doc)
                                        ? `${step.doc.length} paiement(s)`
                                        : getStatusLabel(status)
                                    }
                                    size="small"
                                    sx={{
                                      bgcolor: statusColor + "20",
                                      color: statusColor,
                                      fontWeight: 500,
                                    }}
                                  />
                                  {!Array.isArray(step.doc) && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {step.doc.amount
                                        ? `${step.doc.amount.toLocaleString()} €`
                                        : ""}
                                    </Typography>
                                  )}
                                </>
                              ) : (
                                <Chip
                                  label="Non disponible"
                                  size="small"
                                  color="default"
                                />
                              )}
                            </Box>
                            {hasDoc &&
                              !Array.isArray(step.doc) &&
                              step.doc.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  {step.doc.description}
                                </Typography>
                              )}
                            {hasDoc &&
                              Array.isArray(step.doc) &&
                              step.doc.length > 0 && (
                                <Box sx={{ mt: 0.5 }}>
                                  {step.doc.slice(0, 3).map((p, idx) => (
                                    <Typography
                                      key={p.id}
                                      variant="caption"
                                      display="block"
                                      color="text.secondary"
                                    >
                                      • {p.reference} –{" "}
                                      {p.amount
                                        ? `${p.amount.toLocaleString()} €`
                                        : ""}{" "}
                                      ({p.mode})
                                    </Typography>
                                  ))}
                                  {step.doc.length > 3 && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      ... et {step.doc.length - 3} autre(s)
                                      paiement(s)
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            <Button
                              size="small"
                              sx={{ mt: 0.5 }}
                              onClick={() =>
                                handleStepClick(step.label, step.doc)
                              }
                              disabled={!hasDoc}
                            >
                              Voir les détails
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Box>
  );
};
