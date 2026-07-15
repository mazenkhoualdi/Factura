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
  Fade,
  Slide,
  Alert,
  Snackbar,
  Skeleton,
  InputAdornment,
  Divider,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
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
import CircleIcon from "@mui/icons-material/Circle";
import TimelineIcon from "@mui/icons-material/Timeline";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import api from "../../api/api";

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

const getStatusIcon = (status) => {
  if (!status) return <HourglassEmptyIcon sx={{ fontSize: 28 }} />;
  if (["accepted", "validated", "delivered", "paid", "completed"].includes(status)) {
    return <CheckCircleIcon sx={{ fontSize: 28 }} />;
  }
  if (["pending", "preparing", "agreement", "partial"].includes(status)) {
    return <PendingIcon sx={{ fontSize: 28 }} />;
  }
  if (["refused", "cancelled", "contested", "late", "unpaid"].includes(status)) {
    return <CancelIcon sx={{ fontSize: 28 }} />;
  }
  return <HourglassEmptyIcon sx={{ fontSize: 28 }} />;
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

const getStepLabel = (key) => {
  const labels = {
    client: "Client",
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
    client: "#9c27b0",
    devis: "#1976d2",
    bdc: "#2e7d32",
    bl: "#ed6c02",
    attachement: "#0288d1",
    facture: "#d32f2f",
    paiements: "#00897b",
  };
  return colors[key] || "#757575";
};

// Composant de popup détail
const DetailPopup = ({ open, onClose, title, data, type }) => {
  if (!data) return null;

  const renderClientDetails = () => {
    const client = data;
    return (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "primary.main",
              fontSize: 28,
            }}
          >
            {client.firstName?.charAt(0)}{client.lastName?.charAt(0) || "C"}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {client.firstName} {client.lastName}
            </Typography>
            <Chip label="Client" size="small" color="primary" variant="outlined" />
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <EmailIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body2" fontWeight={500}>{client.email || "N/A"}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <PhoneIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                <Typography variant="body2" fontWeight={500}>{client.phone || "N/A"}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <LocationOnIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Adresse</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {client.address || "N/A"}
                  {client.city && `, ${client.city}`}
                  {client.postalCode && `, ${client.postalCode}`}
                  {client.country && `, ${client.country}`}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderPaymentsDetails = () => {
    // `data` est ici { items: Paiement[], factureAmount: number } (voir handleOpenPopup).
    // On ne spread plus jamais un tableau dans un objet : ça lui faisait perdre son
    // statut de tableau et cassait tous les Array.isArray() ci-dessous.
    const payments = Array.isArray(data?.items) ? data.items : [];
    const factureAmount = data?.factureAmount || 0;
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const solde = factureAmount - totalPaid;
    const isFullyPaid = payments.length > 0 && Math.abs(totalPaid - factureAmount) < 0.01;

    return (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, p: 2, bgcolor: isFullyPaid ? "success.50" : "warning.50", borderRadius: 2 }}>
          {isFullyPaid ? (
            <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
          ) : totalPaid > 0 ? (
            <PendingIcon sx={{ fontSize: 40, color: "warning.main" }} />
          ) : (
            <CancelIcon sx={{ fontSize: 40, color: "error.main" }} />
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {isFullyPaid ? "✅ Complètement payé" : totalPaid > 0 ? "⏳ Partiellement payé" : "❌ Non payé"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {payments.length} paiement(s) enregistré(s)
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 2, textAlign: "center", bgcolor: "primary.50", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Total encaissé</Typography>
              <Typography variant="h6" fontWeight={700} color="primary">{totalPaid.toLocaleString()} DT</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 2, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Montant facture</Typography>
              <Typography variant="h6" fontWeight={700}>{factureAmount.toLocaleString()} DT</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 2, textAlign: "center", bgcolor: solde > 0 ? "error.50" : "success.50", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Solde restant</Typography>
              <Typography variant="h6" fontWeight={700} color={solde > 0 ? "error.main" : "success.main"}>
                {solde.toLocaleString()} DT
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Historique des paiements</Typography>

        {payments.map((p, idx) => (
          <Paper key={idx} elevation={0} sx={{ p: 2, mb: 1.5, bgcolor: "grey.50", borderRadius: 2, borderLeft: `4px solid ${getStatusColor(p.status || "paid")}` }}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" fontWeight={600}>{p.reference || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  {p.date ? new Date(p.date).toLocaleDateString("fr-FR") : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Chip label={p.mode || "N/A"} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={3} sx={{ textAlign: "right" }}>
                <Typography variant="body2" fontWeight={700} color="primary">
                  {p.amount ? `${p.amount.toLocaleString()} DT` : "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
    );
  };

  const renderDocumentDetails = () => {
    const doc = data;
    const color = getStatusColor(doc?.status);
    const statusLabel = getStatusLabel(doc?.status);

    return (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, p: 2, bgcolor: doc?.status ? `${color}15` : "grey.50", borderRadius: 2, border: doc?.status ? `2px solid ${color}30` : "2px solid #e0e0e0" }}>
          <Avatar sx={{ bgcolor: color || "#9e9e9e", width: 56, height: 56 }}>
            {getStepIcon(type) || <DescriptionIcon />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700}>{doc?.number || doc?.reference || "N/A"}</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
              {doc?.status && (
                <Chip label={statusLabel} size="small" sx={{ bgcolor: getStatusBg(doc.status), color: getStatusColor(doc.status), fontWeight: 600 }} />
              )}
              <Chip icon={<CalendarTodayIcon />} label={doc?.date ? new Date(doc.date).toLocaleDateString("fr-FR") : "N/A"} size="small" variant="outlined" />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} /> Montant
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {doc?.amount ? `${doc.amount.toLocaleString()} DT` : "N/A"}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                <DescriptionIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} /> Description
              </Typography>
              <Typography variant="body2" fontWeight={500}>{doc?.description || "Aucune description"}</Typography>
            </Paper>
          </Grid>
          {doc?.comments && (
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Commentaires</Typography>
                <Typography variant="body2" fontWeight={500}>{doc.comments}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth TransitionComponent={Slide} TransitionProps={{ direction: "up" }}>
      <DialogTitle sx={{ p: 3, pb: 2, borderBottom: "1px solid", borderColor: "grey.200", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: getStepColor(type), width: 40, height: 40 }}>{getStepIcon(type)}</Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{title || "Document"}</Typography>
            <Typography variant="caption" color="text.secondary">Détails du document</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ bgcolor: "grey.100" }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {type === "client" && renderClientDetails()}
        {type === "paiements" && renderPaymentsDetails()}
        {type !== "client" && type !== "paiements" && renderDocumentDetails()}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 4 }}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

// Composant d'étape
const StepCard = ({ step, index, isHighlight, hasDoc, status, onStepClick }) => {
  const isPaiements = step?.key === "paiements";
  const isClient = step?.key === "client";
  const color = hasDoc && status ? getStatusColor(status) : "#e0e0e0";
  const bgColor = hasDoc && status ? getStatusBg(status) : "#f8f9fa";

  return (
    <Zoom in={true} style={{ transitionDelay: `${index * 80}ms` }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2.5,
          borderRadius: 3,
          bgcolor: isHighlight ? "primary.50" : bgColor,
          border: `2px solid ${isHighlight ? "#1976d2" : hasDoc ? color : "#e0e0e0"}`,
          boxShadow: isHighlight ? "0 0 0 4px rgba(25, 118, 210, 0.15), 0 4px 20px rgba(25, 118, 210, 0.15)" : hasDoc ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
          minWidth: { xs: 80, sm: 100 },
          cursor: hasDoc ? "pointer" : "default",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          "&:hover": hasDoc ? { transform: "translateY(-4px) scale(1.03)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" } : {},
        }}
        onClick={() => hasDoc && onStepClick(step)}
      >
        <Box sx={{ position: "absolute", top: -10, right: -10, width: 26, height: 26, borderRadius: "50%", bgcolor: hasDoc ? color : "#e0e0e0", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          {index + 1}
        </Box>

        <Box sx={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: hasDoc ? `${color}20` : "#f0f0f0", mb: 1, transition: "all 0.3s ease" }}>
          {isClient ? (
            <PeopleIcon sx={{ fontSize: 30, color: hasDoc ? "primary.main" : "disabled" }} />
          ) : hasDoc && status ? (
            getStatusIcon(status)
          ) : (
            <CircleIcon sx={{ color: "#e0e0e0", fontSize: 24 }} />
          )}
        </Box>

        <Typography variant="caption" fontWeight={700} sx={{ mt: 0.5, textAlign: "center", color: hasDoc ? "text.primary" : "text.disabled", fontSize: { xs: "0.6rem", sm: "0.7rem" } }}>
          {getStepLabel(step?.key)}
        </Typography>

        {hasDoc && !isClient && step?.doc && (
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6rem", fontWeight: 500, mt: 0.5, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {Array.isArray(step.doc) ? `${step.doc.length} paiement(s)` : step.doc?.number || step.doc?.reference || ""}
          </Typography>
        )}

        {hasDoc && !isClient && status && !Array.isArray(step?.doc) && (
          <Chip label={getStatusLabel(status)} size="small" sx={{ mt: 0.5, bgcolor: getStatusBg(status), color: getStatusColor(status), fontWeight: 600, fontSize: "0.55rem", height: 18, "& .MuiChip-label": { px: 1 } }} />
        )}

        {isPaiements && hasDoc && Array.isArray(step?.doc) && (
          <Chip icon={status === "validated" ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <PendingIcon sx={{ fontSize: 14 }} />} label={status === "validated" ? "Complet" : "Partiel"} size="small" sx={{ mt: 0.5, bgcolor: status === "validated" ? "#e8f5e9" : "#fff3e0", color: status === "validated" ? "#4caf50" : "#ff9800", fontWeight: 600, fontSize: "0.55rem", height: 18, "& .MuiChip-label": { px: 1 } }} />
        )}

        {isHighlight && (
          <Box sx={{ position: "absolute", top: -6, left: -6, width: 14, height: 14, borderRadius: "50%", bgcolor: "#1976d2", animation: "pulse 1.5s ease-in-out infinite" }} />
        )}
      </Box>
    </Zoom>
  );
};

// Composant principal
export const Traceability = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupType, setPopupType] = useState("");

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResult(null);
      setNotFound(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/traceability/search?query=${encodeURIComponent(searchTerm.trim())}`);
      if (response.data && Object.keys(response.data).length > 0) {
        setResult(response.data);
        setNotFound(false);
        showSnackbar(`✅ Document "${searchTerm.trim()}" trouvé !`, "success");
      } else {
        setResult(null);
        setNotFound(true);
        showSnackbar(`❌ Aucun document trouvé avec le numéro "${searchTerm.trim()}"`, "error");
      }
    } catch (error) {
      console.error("Erreur recherche", error);
      setResult(null);
      setNotFound(true);
      const errorMsg = error.response?.data?.message || error.message || "Erreur lors de la recherche";
      showSnackbar(`❌ ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setResult(null);
    setNotFound(false);
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenPopup = (step, doc) => {
    if (!doc) {
      showSnackbar("Aucune donnée à afficher", "info");
      return;
    }
    const title = getStepLabel(step?.key);
    const type = step?.key;
    let data = doc;
    if (type === "paiements" && Array.isArray(doc)) {
      // IMPORTANT : ne jamais faire `{ ...doc, ... }` ici — `doc` est un tableau, et le
      // spreader dans un objet littéral lui fait perdre son statut de tableau (il devient
      // { 0: {...}, 1: {...}, factureAmount: ... }), ce qui casse tous les Array.isArray()
      // utilisés dans renderPaymentsDetails() et fait afficher "0 paiement(s)".
      // On isole donc la liste dans sa propre clé `items`.
      data = { items: doc, factureAmount: result?.facture?.amount || 0 };
    }
    setPopupData(data);
    setPopupTitle(title);
    setPopupType(type);
    setPopupOpen(true);
  };

  const handleStepClick = (step) => {
    if (!step || !step.doc) {
      showSnackbar("Aucune donnée disponible pour cette étape", "info");
      return;
    }
    if (step.key === "client") {
      handleOpenPopup(step, step.doc);
      return;
    }
    if (Array.isArray(step.doc)) {
      if (step.doc.length === 0) {
        showSnackbar("Aucun paiement enregistré", "info");
        return;
      }
      handleOpenPopup(step, step.doc);
      return;
    }
    handleOpenPopup(step, step.doc);
  };

  const renderRoadmap = (data) => {
    if (!data) return null;

    const steps = [
      { key: "client", label: "Client", doc: data.client },
      { key: "devis", label: "Devis", doc: data.devis },
      { key: "bdc", label: "BDC", doc: data.bdc },
      { key: "bl", label: "BL", doc: data.bl },
      { key: "attachement", label: "Attachement", doc: data.attachement },
      { key: "facture", label: "Facture", doc: data.facture },
      { key: "paiements", label: "Paiements", doc: data.paiements },
    ];

    const factureAmount = data.facture?.amount || 0;
    const totalPaid = Array.isArray(data.paiements) ? data.paiements.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
    const isFullyPaid = data.facture != null && Array.isArray(data.paiements) && data.paiements.length > 0 && Math.abs(totalPaid - factureAmount) < 0.01;

    return (
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "primary.50", px: 2, py: 1, borderRadius: 2 }}>
            <TrackChangesIcon color="primary" />
            <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Parcours complet</Typography>
          </Box>
          <Chip icon={<InfoIcon />} label="Cliquez sur une carte pour voir les détails" size="small" variant="outlined" sx={{ color: "text.secondary" }} />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", justifyContent: "center" }}>
          {steps.map((step, index) => {
            const hasDoc = step.doc && (Array.isArray(step.doc) ? step.doc.length > 0 : true);
            let status = null;
            if (hasDoc) {
              if (Array.isArray(step.doc)) {
                status = isFullyPaid && step.key === "paiements" ? "validated" : step.doc.length > 0 ? "pending" : null;
              } else if (step.key === "client") {
                status = "validated";
              } else {
                status = step.doc?.status;
              }
            }
            const isHighlight = searchTerm && data.document && step.doc && 
              (step.doc.number === searchTerm.trim() || step.doc.reference === searchTerm.trim() ||
              (Array.isArray(step.doc) && step.doc.some(p => p.reference === searchTerm.trim())));

            return (
              <React.Fragment key={step.key}>
                <StepCard
                  step={step}
                  index={index}
                  isHighlight={isHighlight}
                  hasDoc={hasDoc}
                  status={status}
                  onStepClick={handleStepClick}
                />
                {index < steps.length - 1 && (
                  <ArrowForwardIcon sx={{ color: hasDoc ? "primary.main" : "text.disabled", fontSize: 20, opacity: 0.6 }} />
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TimelineIcon fontSize="large" color="primary" />
            Traçabilité
            <Chip label="Recherche de documents" size="small" color="primary" variant="outlined" />
          </Typography>
          <Typography variant="body2" color="text.secondary">Entrez un numéro de document pour voir son parcours complet</Typography>
        </Box>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)", border: "1px solid", borderColor: "grey.200" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            fullWidth
            size="medium"
            placeholder="🔍 Numéro de document (ex: DEV-0001, BDC-0002, FAC-0010...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={loading}
            sx={{
              flex: 1,
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "white",
                transition: "all 0.3s ease",
                "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
                "&.Mui-focused": { boxShadow: "0 2px 12px rgba(25, 118, 210, 0.15)" },
              },
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "primary.main" }} /></InputAdornment>,
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear} sx={{ bgcolor: "grey.100", "&:hover": { bgcolor: "grey.200" } }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            <Button variant="contained" onClick={handleSearch} disabled={loading} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, px: 3, background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)", boxShadow: "0 4px 15px rgba(25, 118, 210, 0.3)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(25, 118, 210, 0.4)" } }}>
              {loading ? "Recherche..." : "Rechercher"}
            </Button>
            <Button variant="outlined" onClick={handleClear} startIcon={<ClearIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}>Effacer</Button>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">Exemples :</Typography>
          {["DEV-0001", "BDC-0002", "FAC-0010", "BL-0003"].map((example) => (
            <Chip key={example} label={example} size="small" variant="outlined" onClick={() => setSearchTerm(example)} sx={{ cursor: "pointer", "&:hover": { bgcolor: "primary.50", borderColor: "primary.main" } }} />
          ))}
        </Box>
      </Paper>

      <Card elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {loading ? (
            <Box sx={{ py: 4 }}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mt: 2 }} />
            </Box>
          ) : notFound ? (
            <Fade in={true}>
              <Box sx={{ textAlign: "center", py: 6 }}>
                <SearchIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>Aucun document trouvé</Typography>
                <Typography variant="body2" color="text.secondary">Le numéro <strong>"{searchTerm}"</strong> ne correspond à aucun document.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Vérifiez le numéro et réessayez</Typography>
              </Box>
            </Fade>
          ) : result ? (
            <Fade in={true}>{renderRoadmap(result)}</Fade>
          ) : (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <TrackChangesIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>Recherchez un document</Typography>
              <Typography variant="body2" color="text.secondary">Entrez un numéro de document dans la barre de recherche ci-dessus</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <DetailPopup open={popupOpen} onClose={() => setPopupOpen(false)} title={popupTitle} data={popupData} type={popupType} />

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};