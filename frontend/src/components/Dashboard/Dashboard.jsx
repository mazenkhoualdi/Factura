import React from "react";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import AssessmentIcon from "@mui/icons-material/Assessment";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  linearProgressClasses,
  styled,
  CircularProgress,
  useTheme,
  alpha,
  TextField,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import { getGainAchatsObjectif, setGainAchatsObjectif } from "../../api/api";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PendingIcon from "@mui/icons-material/Pending";
import EuroIcon from "@mui/icons-material/Euro";
import PaymentsIcon from "@mui/icons-material/Payments";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import SavingsIcon from "@mui/icons-material/Savings";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Barre de progression personnalisée
const CustomLinearProgress = styled(LinearProgress)(({ value }) => ({
  height: 12,
  borderRadius: 6,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#e0e0e0",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 6,
    backgroundColor:
      value >= 80 ? "#2e7d32" : value >= 50 ? "#ed6c02" : "#d32f2f",
    transition: "background-color 0.3s ease",
  },
}));

// KpiCard
const KpiCard = ({ label, value, icon, color }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        transition: "all 0.3s ease",
        border: `1px solid ${color}25`,
        background: `linear-gradient(135deg, ${color}08, ${theme.palette.background.paper})`,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${color}30`,
          borderColor: color,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {label}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ mt: 0.5, color: color }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 0.5,
              m: 1,
              borderRadius: 3,
              bgcolor: `${color}15`,
              color: color,
              border: `1px solid ${color}30`,
              boxShadow: `0 2px 8px ${color}20`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Carte "Objectif de gain total achats" (même esprit que la jauge Taux d'encaissement)
// L'objectif est persisté côté backend (table `objectifs`, clé GAIN_ACHATS) — pas de localStorage.
const GainObjectifCard = ({ totalGainAchats }) => {
  const theme = useTheme();

  // null = pas encore chargé / pas encore défini. Aucune valeur par défaut n'est appliquée :
  // tant que l'utilisateur n'a rien saisi côté serveur, l'objectif reste null.
  const [objectif, setObjectif] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Chargement initial depuis le backend
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getGainAchatsObjectif();
        if (!active) return;
        // 204 No Content => pas encore d'objectif défini
        if (res.status === 204 || !res.data) {
          setObjectif(null);
          setEditing(true);
        } else {
          setObjectif(res.data.montant);
        }
      } catch (err) {
        if (!active) return;
        console.error("Erreur chargement de l'objectif gain achats :", err);
        setError("Impossible de contacter le serveur");
        setEditing(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleStartEdit = () => {
    setInputValue(objectif !== null ? String(objectif) : "");
    setError("");
    setEditing(true);
  };

  const handleCancelEdit = () => {
    // On ne peut annuler que si un objectif existe déjà
    if (objectif !== null) {
      setError("");
      setEditing(false);
    }
  };

  const handleSaveObjectif = async () => {
    const val = parseFloat(String(inputValue).replace(",", "."));
    if (isNaN(val) || val <= 0) {
      setError("Veuillez saisir un montant valide (> 0)");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await setGainAchatsObjectif(val);
      setObjectif(res.data.montant);
      setEditing(false);
    } catch (err) {
      console.error("Erreur sauvegarde de l'objectif gain achats :", err);
      setError("Échec de l'enregistrement sur le serveur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress size={24} sx={{ color: "#7b1fa2" }} />
          <Typography color="text.secondary">Chargement de l'objectif…</Typography>
        </CardContent>
      </Card>
    );
  }

  const percentage =
    objectif && objectif > 0
      ? Math.round((totalGainAchats / objectif) * 100)
      : 0;

  const progressColor =
    percentage >= 80 ? "#2e7d32" : percentage >= 50 ? "#ed6c02" : "#7b1fa2";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: 4,
        border: `2px solid #7b1fa225`,
        background: `linear-gradient(135deg, #7b1fa205, ${theme.palette.background.paper})`,
        boxShadow: `0 4px 20px #7b1fa215`,
        transition: "all 0.3s ease",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 30px #7b1fa225`,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 2,
            background: "#7b1fa208",
            px: 2,
            py: 1,
            borderRadius: 50,
            border: "1px solid #7b1fa220",
            width: "fit-content",
            mx: "auto",
          }}
        >
          <TrackChangesRoundedIcon sx={{ color: "#7b1fa2" }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: "#7b1fa2" }}>
            Objectif gain achats
          </Typography>
        </Box>

        {!editing && (
          <Tooltip title="Modifier l'objectif">
            <IconButton
              size="small"
              onClick={handleStartEdit}
              sx={{ position: "absolute", top: 12, right: 12, color: "#7b1fa2" }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {editing ? (
          <Box sx={{ px: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 2 }}
            >
              Définissez votre objectif de gain total sur les achats (en DT)
            </Typography>
            <TextField
              size="small"
              fullWidth
              type="number"
              autoFocus
              placeholder="Ex: 2000"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveObjectif();
              }}
              error={!!error}
              helperText={error || " "}
              inputProps={{ min: 0, step: "0.01" }}
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={
                  saving ? (
                    <CircularProgress size={14} sx={{ color: "#fff" }} />
                  ) : (
                    <CheckRoundedIcon />
                  )
                }
                onClick={handleSaveObjectif}
                disabled={saving}
                sx={{ bgcolor: "#7b1fa2", "&:hover": { bgcolor: "#6a1b9a" } }}
              >
                Valider
              </Button>
              {objectif !== null && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloseRoundedIcon />}
                  onClick={handleCancelEdit}
                  disabled={saving}
                  sx={{ color: "#7b1fa2", borderColor: "#7b1fa2" }}
                >
                  Annuler
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{
                mb: 3,
                lineHeight: 1.7,
                background: `${theme.palette.grey[100]}60`,
                p: 1.5,
                borderRadius: 2,
              }}
            >
              <strong>{totalGainAchats.toFixed(2)} DT</strong> réalisés sur
              l'objectif de{" "}
              <strong>{objectif.toFixed(2)} DT</strong>
            </Typography>

            <Typography
              variant="h2"
              fontWeight={800}
              align="center"
              sx={{
                color: progressColor,
                mb: 2,
                textShadow: `0 2px 8px ${progressColor}30`,
              }}
            >
              {percentage}%
            </Typography>

            <CustomLinearProgress
              variant="determinate"
              value={Math.min(Math.max(percentage, 0), 100)}
              sx={{ height: 12, borderRadius: 6, mb: 1 }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Gain réalisé
                </Typography>
                <Typography fontWeight={700} sx={{ color: "#7b1fa2" }}>
                  {totalGainAchats.toFixed(2)} DT
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Objectif
                </Typography>
                <Typography fontWeight={700} color="primary">
                  {objectif.toFixed(2)} DT
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const theme = useTheme();
  const { clients, devis, factures, paiements, loading } = useAppContext();

  // ✅ Vérification des tableaux
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeDevis = Array.isArray(devis) ? devis : [];
  const safeFactures = Array.isArray(factures) ? factures : [];
  const safePaiements = Array.isArray(paiements) ? paiements : [];

  const totalFactured = safeFactures.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = safePaiements.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRemaining = totalFactured - totalPaid;
  const totalGainAchats = safeFactures.reduce(
    (sum, f) => sum + (f.gain || 0),
    0,
  );

  const encaissementPercentage =
    totalFactured > 0 ? Math.round((totalPaid / totalFactured) * 100) : 0;

  // KPIs
  const activityKpis = [
    { label: "Clients", value: safeClients.length, icon: <PeopleIcon />, color: "#1976d2" },
    { label: "Devis", value: safeDevis.length, icon: <DescriptionIcon />, color: "#ed6c02" },
    { label: "Factures", value: safeFactures.length, icon: <ReceiptLongIcon />, color: "#9c27b0" },
    { label: "Dossiers en cours", value: safeDevis.filter((d) => d.status === "pending").length, icon: <PendingIcon />, color: "#607d8b" },
  ];

  const financialKpis = [
    { label: "Total facturé", value: `${totalFactured.toFixed(2)} DT`, icon: <EuroIcon />, color: "#1976d2" },
    { label: "Total encaissé", value: `${totalPaid.toFixed(2)} DT`, icon: <PaymentsIcon />, color: "#2e7d32" },
    { label: "Reste à encaisser", value: `${totalRemaining.toFixed(2)} DT`, icon: <MoneyOffIcon />, color: "#d32f2f" },
  ];

  const STATUS_COLORS = {
    accepted: "#4caf50",
    pending: "#ff9800",
    refused: "#f44336",
    validated: "#2196f3",
  };

  const STATUS_LABELS = {
    accepted: "Acceptés",
    pending: "En attente",
    refused: "Refusés",
    validated: "Validés",
  };

  const devisStatusData = Object.keys(STATUS_COLORS)
    .map((status) => ({
      name: STATUS_LABELS[status],
      status: status,
      value: safeDevis.filter((d) => d.status === status).length,
    }))
    .filter((entry) => entry.value > 0);

  const progressColor =
    encaissementPercentage >= 80
      ? "#2e7d32"
      : encaissementPercentage >= 50
        ? "#ed6c02"
        : "#d32f2f";

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des données...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 3.5,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}18, ${theme.palette.primary.light}06, ${theme.palette.background.paper})`,
          border: `2px solid ${theme.palette.primary.main}25`,
          textAlign: "center",
          boxShadow: `0 4px 20px ${theme.palette.primary.main}20`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
            backgroundSize: "200% 100%",
            animation: "gradientMove 3s linear infinite",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <AssessmentIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h4" fontWeight={800} color="primary">
            Tableau de bord
          </Typography>
        </Box>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 700,
            mx: "auto",
            lineHeight: 1.7,
          }}
        >
          Bienvenue sur <strong>Factura</strong>. Gérez efficacement vos
          clients, sociétés, devis, factures et paiements depuis une interface
          centralisée.
        </Typography>
      </Box>

      {/* KPIs - Correction des props */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                background: `${theme.palette.primary.main}08`,
                px: 3,
                py: 1,
                borderRadius: 50,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <TrendingUpRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h6" fontWeight={700} color="primary">
                Performance commerciale
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={3}>
            {activityKpis.map((kpi, index) => (
              <Grid item xs={12} sm={6} md={3} key={`activity-${index}`}>
                <KpiCard {...kpi} />
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 4,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                background: `${theme.palette.success.main}08`,
                px: 3,
                py: 1,
                borderRadius: 50,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <EuroIcon color="success" fontSize="small" />
              <Typography variant="h6" fontWeight={700} color="success.main">
                Aperçu financier
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={3}>
            {financialKpis.map((kpi, index) => (
              <Grid item xs={12} sm={6} md={3} key={`financial-${index}`}>
                <KpiCard {...kpi} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Jauges : Taux d'encaissement + Objectif gain achats, côte à côte */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} sx={{ height: "100%" }}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  borderRadius: 4,
                  border: `2px solid ${theme.palette.success.main}25`,
                  background: `linear-gradient(135deg, ${theme.palette.success.main}05, ${theme.palette.background.paper})`,
                  boxShadow: `0 4px 20px ${theme.palette.success.main}15`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 30px ${theme.palette.success.main}25`,
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      mb: 2,
                      background: `${theme.palette.success.main}08`,
                      px: 2,
                      py: 1,
                      borderRadius: 50,
                      border: `1px solid ${theme.palette.success.main}20`,
                      width: "fit-content",
                      mx: "auto",
                    }}
                  >
                    <TrendingUpRoundedIcon color="success" />
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      Taux d'encaissement
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{
                      mb: 3,
                      lineHeight: 1.7,
                      background: `${theme.palette.grey[100]}60`,
                      p: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    <strong>{totalPaid.toFixed(2)} DT</strong> encaissés sur{" "}
                    <strong>{totalFactured.toFixed(2)} DT</strong> facturés
                  </Typography>

                  <Typography
                    variant="h2"
                    fontWeight={800}
                    align="center"
                    sx={{
                      color: progressColor,
                      mb: 2,
                      textShadow: `0 2px 8px ${progressColor}30`,
                    }}
                  >
                    {encaissementPercentage}%
                  </Typography>

                  <CustomLinearProgress
                    variant="determinate"
                    value={Math.min(encaissementPercentage, 100)}
                    sx={{ height: 12, borderRadius: 6, mb: 1 }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                      pt: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Encaissé
                      </Typography>
                      <Typography fontWeight={700} color="success.main">
                        {totalPaid.toFixed(2)} DT
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Facturé
                      </Typography>
                      <Typography fontWeight={700} color="primary">
                        {totalFactured.toFixed(2)} DT
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <GainObjectifCard totalGainAchats={totalGainAchats} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: `2px solid ${theme.palette.primary.main}25`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}04, ${theme.palette.background.paper})`,
              boxShadow: `0 4px 20px ${theme.palette.primary.main}15`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: `0 10px 35px ${theme.palette.primary.main}25`,
                borderColor: "primary.dark",
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  background: `${theme.palette.primary.main}08`,
                  px: 2,
                  py: 1,
                  borderRadius: 50,
                  border: `1px solid ${theme.palette.primary.main}20`,
                  width: "fit-content",
                }}
              >
                <PieChartRoundedIcon color="primary" />
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  Répartition des devis
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 1 }}>
                Visualisez la répartition de vos devis selon leur statut.
              </Typography>
              {devisStatusData.length === 0 ? (
                <Box sx={{ height: 280, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Typography color="text.secondary">Aucun devis disponible</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={devisStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={4}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {devisStatusData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name) => [`${value} devis`, name]}
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,.15)" }}
                    />
                    <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 15, fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: `2px solid ${theme.palette.success.main}25`,
              background: `linear-gradient(135deg, ${theme.palette.success.main}04, ${theme.palette.background.paper})`,
              boxShadow: `0 4px 20px ${theme.palette.success.main}15`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: `0 10px 35px ${theme.palette.success.main}25`,
                borderColor: "success.dark",
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  background: `${theme.palette.success.main}08`,
                  px: 2,
                  py: 1,
                  borderRadius: 50,
                  border: `1px solid ${theme.palette.success.main}20`,
                  width: "fit-content",
                }}
              >
                <BarChartRoundedIcon color="success" />
                <Typography variant="h6" fontWeight={700} color="success.main">
                  Comparaison financière
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 1 }}>
                Comparez les montants facturés, encaissés et restant à percevoir.
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: "Facturé", value: totalFactured },
                    { name: "Encaissé", value: totalPaid },
                    { name: "Reste", value: totalRemaining },
                  ]}
                >
                  <CartesianGrid strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value) => `${value.toFixed(2)} DT`}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,.15)" }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};