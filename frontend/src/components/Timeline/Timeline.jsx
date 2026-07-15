import React, { useState, useMemo } from "react";
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
  IconButton,
  Paper,
  Fade,
  Slide,
  Avatar,
  Divider,
  Tooltip,
  Badge,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import CircleIcon from "@mui/icons-material/Circle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import TimelineIcon from "@mui/icons-material/Timeline";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useAppContext } from "../../context/AppContext";

// Constantes des statuts
const STATUS_CONFIG = {
  pending: { label: "En attente", color: "#ff9800", bg: "#fff3e0" },
  accepted: { label: "Accepté", color: "#4caf50", bg: "#e8f5e9" },
  refused: { label: "Refusé", color: "#f44336", bg: "#fce4ec" },
  validated: { label: "Validé", color: "#4caf50", bg: "#e8f5e9" },
  preparing: { label: "En préparation", color: "#ff9800", bg: "#fff3e0" },
  delivered: { label: "Livré", color: "#2196f3", bg: "#e3f2fd" },
  partial: { label: "Partiellement livré", color: "#ff9800", bg: "#fff3e0" },
  cancelled: { label: "Annulé", color: "#f44336", bg: "#fce4ec" },
  paid: { label: "Payée", color: "#4caf50", bg: "#e8f5e9" },
  unpaid: { label: "Non payée", color: "#f44336", bg: "#fce4ec" },
  late: { label: "En retard", color: "#f44336", bg: "#fce4ec" },
  agreement: { label: "En attente d'accord", color: "#ff9800", bg: "#fff3e0" },
  contested: { label: "Contesté", color: "#f44336", bg: "#fce4ec" },
  completed: { label: "Terminé", color: "#4caf50", bg: "#e8f5e9" },
};

const getStatusLabel = (status) => STATUS_CONFIG[status]?.label || status;
const getStatusColor = (status) => STATUS_CONFIG[status]?.color || "#9e9e9e";
const getStatusBg = (status) => STATUS_CONFIG[status]?.bg || "#f5f5f5";

const getStepIcon = (key) => {
  const icons = {
    devis: <DescriptionIcon sx={{ color: "#ed6c02" }} />,
    bdc: <ReceiptIcon sx={{ color: "#2e7d32" }} />,
    bl: <LocalShippingIcon sx={{ color: "#1976d2" }} />,
    attachement: <AttachFileIcon sx={{ color: "#9c27b0" }} />,
    facture: <ReceiptLongIcon sx={{ color: "#d32f2f" }} />,
    paiements: <PaymentsIcon sx={{ color: "#00897b" }} />,
  };
  return icons[key] || <CircleIcon />;
};

const getStepLabel = (key) => {
  const labels = {
    devis: "Devis",
    bdc: "Bon de Commande",
    bl: "Bon de Livraison",
    attachement: "Attachement",
    facture: "Facture",
    paiements: "Paiements",
  };
  return labels[key] || key;
};

const getStepColor = (key) => {
  const colors = {
    devis: "#ed6c02",
    bdc: "#2e7d32",
    bl: "#1976d2",
    attachement: "#9c27b0",
    facture: "#d32f2f",
    paiements: "#00897b",
  };
  return colors[key] || "#757575";
};

// Composant d'étape de timeline
const TimelineStep = ({ step, index, total, hasDoc, status, statusColor, onClick, isLast }) => {
  const isPaiements = step.key === "paiements";
  const label = getStepLabel(step.key);
  const icon = getStepIcon(step.key);
  const color = hasDoc ? statusColor : "#e0e0e0";

  return (
    <Box sx={{ position: "relative", mb: 3 }}>
      {/* Ligne de connexion */}
      {!isLast && (
        <Box
          sx={{
            position: "absolute",
            left: 14,
            top: 40,
            bottom: -24,
            width: 2,
            bgcolor: hasDoc ? color : "#e0e0e0",
            opacity: 0.6,
          }}
        />
      )}

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        {/* Cercle d'étape */}
        <Box sx={{ position: "relative" }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              hasDoc ? (
                status === "validated" || status === "completed" || status === "paid" || status === "delivered" ? (
                  <CheckCircleIcon sx={{ fontSize: 16, color: "success.main", bgcolor: "white", borderRadius: "50%" }} />
                ) : status === "pending" || status === "preparing" || status === "agreement" ? (
                  <PendingIcon sx={{ fontSize: 16, color: "warning.main", bgcolor: "white", borderRadius: "50%" }} />
                ) : status === "refused" || status === "cancelled" || status === "contested" ? (
                  <CancelIcon sx={{ fontSize: 16, color: "error.main", bgcolor: "white", borderRadius: "50%" }} />
                ) : null
              ) : null
            }
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: hasDoc ? `${color}25` : "#f5f5f5",
                border: `3px solid ${hasDoc ? color : "#e0e0e0"}`,
                transition: "all 0.3s ease",
                "&:hover": hasDoc ? { transform: "scale(1.1)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" } : {},
              }}
            >
              {icon}
            </Avatar>
          </Badge>
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: -10,
              right: -10,
              bgcolor: "white",
              borderRadius: "50%",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6rem",
              fontWeight: 700,
              color: hasDoc ? color : "#bdbdbd",
              border: `2px solid ${hasDoc ? color : "#e0e0e0"}`,
            }}
          >
            {index + 1}
          </Typography>
        </Box>

        {/* Contenu */}
        <Box sx={{ flex: 1, pt: 0.5 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {label}
            </Typography>
            
            {hasDoc ? (
              <>
                {!Array.isArray(step.doc) && (
                  <Chip
                    label={step.doc.number || step.doc.reference || "N/A"}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                )}
                {Array.isArray(step.doc) && (
                  <Chip
                    label={`${step.doc.length} paiement(s)`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                )}
                <Chip
                  label={Array.isArray(step.doc) ? (status === "validated" ? "✅ Complet" : "⏳ Partiel") : getStatusLabel(status)}
                  size="small"
                  sx={{
                    bgcolor: hasDoc ? getStatusBg(status) : "#f5f5f5",
                    color: hasDoc ? getStatusColor(status) : "#9e9e9e",
                    fontWeight: 600,
                  }}
                />
                {!Array.isArray(step.doc) && step.doc.amount && (
                  <Chip
                    icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />}
                    label={`${step.doc.amount.toLocaleString()} DT`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  />
                )}
              </>
            ) : (
              <Chip label="Non disponible" size="small" color="default" variant="outlined" />
            )}
          </Box>

          {/* Description */}
          {hasDoc && !Array.isArray(step.doc) && step.doc.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {step.doc.description}
            </Typography>
          )}

          {/* Liste des paiements */}
          {hasDoc && Array.isArray(step.doc) && step.doc.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {step.doc.slice(0, 3).map((p, idx) => (
                <Typography key={p.id || idx} variant="caption" display="block" color="text.secondary" sx={{ pl: 1 }}>
                  • {p.reference || "N/A"} – {p.amount ? `${p.amount.toLocaleString()} DT` : "N/A"} ({p.mode || "N/A"})
                </Typography>
              ))}
              {step.doc.length > 3 && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  ... et {step.doc.length - 3} autre(s) paiement(s)
                </Typography>
              )}
            </Box>
          )}

          {/* Bouton détails */}
          <Button
            size="small"
            variant="outlined"
            sx={{ mt: 1, textTransform: "none", borderRadius: 2 }}
            onClick={() => onClick(step, hasDoc)}
            disabled={!hasDoc}
          >
            {hasDoc ? "Voir les détails" : "Non disponible"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// Composant principal
export const Timeline = () => {
  const {
    devis = [],
    bdc = [],
    bl = [],
    attachements = [],
    factures = [],
    paiements = [],
  } = useAppContext();

  // Construire les transactions
  const transactions = useMemo(() => {
    return devis.map((d) => {
      const bdcItem = bdc.find((b) => b.devisNumber === d.number);
      const blItem = bdcItem ? bl.find((b) => b.bdcNumber === bdcItem.number) : null;
      const attachement = blItem ? attachements.find((a) => a.blNumber === blItem.number) : null;
      const facture = attachement ? factures.find((f) => f.attachmentNumber === attachement.number) : null;
      const paiementsList = facture ? paiements.filter((p) => p.factureNumber === facture.number) : [];

      const totalPaid = paiementsList.reduce((sum, p) => sum + (p.amount || 0), 0);
      const factureAmount = facture?.amount || 0;
      const isFullyPaid = facture != null && paiementsList.length > 0 && Math.abs(totalPaid - factureAmount) < 0.01;
      const paiementsStepStatus = facture ? (isFullyPaid ? "validated" : "pending") : null;

      return {
        id: d.id,
        clientName: d.clientName || "Client inconnu",
        devis: d,
        bdc: bdcItem,
        bl: blItem,
        attachement: attachement,
        facture: facture,
        paiements: paiementsList,
        totalPaid,
        factureAmount,
        isFullyPaid,
        paiementsStepStatus,
        status: isFullyPaid ? "completed" : (attachement?.status === "validated" ? "in_progress" : (blItem?.status === "delivered" ? "in_progress" : "blocked")),
      };
    });
  }, [devis, bdc, bl, attachements, factures, paiements]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  const filteredTransactions = useMemo(() => {
    return statusFilter === "all"
      ? transactions
      : transactions.filter((trx) => trx.status === statusFilter);
  }, [transactions, statusFilter]);

  const handleStepClick = (step, hasDoc, trx) => {
    if (!hasDoc || !step.doc) return;

    if (Array.isArray(step.doc)) {
      if (step.doc.length === 0) return;
      const lines = step.doc.map(
        (p, idx) =>
          `  ${idx + 1}. ${p.reference || "N/A"} – ${p.amount ? `${p.amount.toLocaleString()} DT` : "N/A"} (${p.mode || "N/A"}) le ${p.date ? new Date(p.date).toLocaleDateString("fr-FR") : "N/A"}`
      );
      const total = trx?.totalPaid ?? 0;
      const factureAmount = trx?.factureAmount ?? 0;
      const solde = factureAmount - total;
      alert(
        `📄 ${getStepLabel(step.key)}\n\n` +
          `${step.doc.length} paiement(s) enregistré(s) :\n${lines.join("\n")}\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `Total encaissé: ${total.toLocaleString()} DT\n` +
          `Montant facture: ${factureAmount.toLocaleString()} DT\n` +
          `Solde restant: ${solde.toLocaleString()} DT\n` +
          `Statut: ${trx?.isFullyPaid ? "✅ Complètement payé" : "⏳ En attente (montant incomplet)"}`
      );
      return;
    }

    const doc = step.doc;
    alert(
      `📄 ${getStepLabel(step.key)}\n\n` +
        `Numéro: ${doc.number || doc.reference || "N/A"}\n` +
        `Statut: ${getStatusLabel(doc.status)}\n` +
        `Montant: ${doc.amount ? `${doc.amount.toLocaleString()} DT` : "N/A"}\n` +
        `Date: ${doc.date ? new Date(doc.date).toLocaleDateString("fr-FR") : "N/A"}\n` +
        `Description: ${doc.description || "Aucune"}`
    );
  };

  const handleAccordionChange = (id) => (event, isExpanded) => {
    setExpandedTransaction(isExpanded ? id : null);
  };

  const getStatusChip = (status) => {
    const config = {
      completed: { label: "✅ Terminée", color: "success" },
      in_progress: { label: "⏳ En cours", color: "warning" },
      blocked: { label: "❌ Bloquée", color: "error" },
    };
    return config[status] || config.blocked;
  };

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TimelineIcon fontSize="large" color="primary" />
            Timeline
            <Chip label={`${filteredTransactions.length} transactions`} size="small" color="primary" variant="outlined" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chronologie détaillée de toutes les transactions
          </Typography>
        </Box>
      </Box>

      {/* Filtres */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
        <FilterListIcon color="action" sx={{ mr: 1 }} />
        <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>Filtres :</Typography>
        {[
          { key: "all", label: "📊 Toutes" },
          { key: "completed", label: "✅ Terminées" },
          { key: "in_progress", label: "⏳ En cours" },
          { key: "blocked", label: "❌ Bloquées" },
        ].map((filter) => (
          <Chip
            key={filter.key}
            label={filter.label}
            color={statusFilter === filter.key ? "primary" : "default"}
            onClick={() => setStatusFilter(filter.key)}
            clickable
            sx={{ fontWeight: statusFilter === filter.key ? 600 : 400 }}
          />
        ))}
        {statusFilter !== "all" && (
          <Chip
            label="Réinitialiser"
            size="small"
            icon={<ClearIcon sx={{ fontSize: 16 }} />}
            onClick={() => setStatusFilter("all")}
            clickable
            variant="outlined"
            color="error"
          />
        )}
      </Paper>

      {/* Liste des transactions */}
      {filteredTransactions.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <TimelineIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Aucune transaction</Typography>
            <Typography variant="body2" color="text.secondary">Aucune transaction ne correspond à ce filtre.</Typography>
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

          const statusInfo = getStatusChip(trx.status);

          return (
            <Accordion
              key={trx.id}
              expanded={expandedTransaction === trx.id}
              onChange={handleAccordionChange(trx.id)}
              sx={{
                mb: 2,
                borderRadius: 2,
                border: expandedTransaction === trx.id ? "2px solid" : "1px solid",
                borderColor: expandedTransaction === trx.id ? "primary.main" : "grey.200",
                boxShadow: expandedTransaction === trx.id ? "0 4px 20px rgba(25, 118, 210, 0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
                transition: "all 0.3s ease",
                "&:hover": { boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  borderRadius: expandedTransaction === trx.id ? "8px 8px 0 0" : "8px",
                  "&:hover": { bgcolor: "grey.50" },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.light", width: 40, height: 40 }}>
                      <PeopleIcon sx={{ color: "white" }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {trx.clientName}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Chip
                          icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                          label={trx.devis.date ? new Date(trx.devis.date).toLocaleDateString("fr-FR") : "N/A"}
                          size="small"
                          variant="outlined"
                        />
                        <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {trx.totalPaid > 0 && trx.factureAmount > 0 && (
                      <Chip
                        icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />}
                        label={`${trx.totalPaid.toLocaleString()} / ${trx.factureAmount.toLocaleString()} DT`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {steps.filter(s => s.doc && (Array.isArray(s.doc) ? s.doc.length > 0 : true)).length} / {steps.length} étapes
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 2, pb: 3 }}>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ position: "relative", pl: 2 }}>
                  {steps.map((step, index) => {
                    const hasDoc = step.doc && (Array.isArray(step.doc) ? step.doc.length > 0 : true);
                    const status = hasDoc
                      ? Array.isArray(step.doc)
                        ? trx.paiementsStepStatus
                        : step.doc?.status
                      : null;
                    const statusColor = status ? getStatusColor(status) : "#9e9e9e";

                    return (
                      <TimelineStep
                        key={step.key}
                        step={step}
                        index={index}
                        total={steps.length}
                        hasDoc={hasDoc}
                        status={status}
                        statusColor={statusColor}
                        isLast={index === steps.length - 1}
                        onClick={(step, hasDoc) => handleStepClick(step, hasDoc, trx)}
                      />
                    );
                  })}
                </Box>

                {/* Résumé des paiements */}
                {trx.paiements.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Récapitulatif des paiements
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      <Chip
                        label={`Total encaissé: ${trx.totalPaid.toLocaleString()} DT`}
                        variant="outlined"
                        color="primary"
                      />
                      <Chip
                        label={`Montant facture: ${trx.factureAmount.toLocaleString()} DT`}
                        variant="outlined"
                      />
                      <Chip
                        label={`Solde: ${(trx.factureAmount - trx.totalPaid).toLocaleString()} DT`}
                        variant="outlined"
                        color={trx.isFullyPaid ? "success" : "warning"}
                      />
                      <Chip
                        label={trx.isFullyPaid ? "✅ Complètement payé" : "⏳ En attente"}
                        color={trx.isFullyPaid ? "success" : "warning"}
                      />
                    </Box>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Box>
  );
};