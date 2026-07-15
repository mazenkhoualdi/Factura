import React from "react";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingFlatRoundedIcon from "@mui/icons-material/TrendingFlatRounded";
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
  Chip,
  Fade,
  Zoom,
  Grow,
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

// Barre de progression avec animation et gradient
const AnimatedLinearProgress = styled(LinearProgress)(({ value, theme }) => ({
  height: 14,
  borderRadius: 8,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 8,
    background: `linear-gradient(90deg, 
      ${value >= 80 ? theme.palette.success.main : value >= 50 ? theme.palette.warning.main : theme.palette.error.main} 
      ${Math.min(value, 100)}%, 
      ${alpha(value >= 80 ? theme.palette.success.main : value >= 50 ? theme.palette.warning.main : theme.palette.error.main, 0.2)} 100%
    )`,
    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
      animation: "shimmer 2s infinite",
    },
  },
}));

// Composant titre de section stylisé - toujours centré
const SectionTitle = ({ icon, title, color = "primary" }) => {
  const theme = useTheme();
  const colorMap = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    purple: "#7b1fa2",
    grey: "#607d8b",
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        background: alpha(selectedColor, 0.06),
        px: 3,
        py: 1,
        borderRadius: 50,
        border: `1px solid ${alpha(selectedColor, 0.12)}`,
        width: "fit-content",
        mx: "auto",
      }}
    >
      {icon}
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ color: selectedColor }}
      >
        {title}
      </Typography>
    </Box>
  );
};

// KpiCard - taille confortable et homogène pour toutes les sections
const KpiCard = ({ label, value, icon, color, trend, delay }) => {
  const theme = useTheme();

  return (
    <Grow in timeout={300 + (delay || 0)}>
      <Card
        sx={{
          height: "100%",
          minHeight: { xs: "110px", sm: "118px" },
          borderRadius: 4,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          border: `1px solid ${alpha(color, 0.15)}`,
          background: `linear-gradient(145deg, ${alpha(color, 0.06)}, ${theme.palette.background.paper})`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`,
            opacity: 0,
            transition: "opacity 0.3s ease",
          },
          "&:hover": {
            transform: "translateY(-4px) scale(1.02)",
            boxShadow: `0 10px 32px ${alpha(color, 0.2)}`,
            borderColor: color,
            "&::before": {
              opacity: 1,
            },
          },
        }}
      >
        <CardContent
          sx={{
            p: 1.5,
            "&:last-child": { pb: 1.5 },
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              width: "100%",
            }}
          >
            <Zoom in timeout={400}>
              <Box
                sx={{
                  p: 0.7,
                  borderRadius: 2.5,
                  bgcolor: alpha(color, 0.12),
                  color: color,
                  border: `1px solid ${alpha(color, 0.2)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& svg": {
                    fontSize: "1.2rem",
                  },
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "rotate(12deg) scale(1.1)",
                  },
                }}
              >
                {icon}
              </Box>
            </Zoom>

            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                color: color,
                fontSize: { xs: "1.2rem", sm: "1.3rem" },
                lineHeight: 1.2,
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                fontSize: "0.72rem",
              }}
            >
              {label}
            </Typography>

            {trend && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                {trend.icon}
                <Typography
                  variant="caption"
                  sx={{ color: trend.color, fontWeight: 600 }}
                >
                  {trend.label}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
};

// Helper functions...
const toMonthKey = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getPreviousMonthKey = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  const prev = new Date(year, month - 2, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  const label = d.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// GainObjectifCard améliorée
const GainObjectifCard = ({ factures }) => {
  const theme = useTheme();
  const [objectif, setObjectif] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(() =>
    toMonthKey(new Date()),
  );

  const totalGainAchats = React.useMemo(() => {
    return factures
      .filter((f) => f.date && toMonthKey(f.date) === selectedMonth)
      .reduce((sum, f) => sum + (f.gain || 0), 0);
  }, [factures, selectedMonth]);

  const previousMonthKey = React.useMemo(
    () => getPreviousMonthKey(selectedMonth),
    [selectedMonth],
  );

  const previousMonthGain = React.useMemo(() => {
    return factures
      .filter((f) => f.date && toMonthKey(f.date) === previousMonthKey)
      .reduce((sum, f) => sum + (f.gain || 0), 0);
  }, [factures, previousMonthKey]);

  const { trendDirection, trendPercent } = React.useMemo(() => {
    if (previousMonthGain !== 0) {
      const percent =
        ((totalGainAchats - previousMonthGain) / Math.abs(previousMonthGain)) *
        100;
      return {
        trendPercent: percent,
        trendDirection:
          percent > 0.01 ? "up" : percent < -0.01 ? "down" : "flat",
      };
    }
    if (totalGainAchats !== 0) {
      return {
        trendPercent: null,
        trendDirection: totalGainAchats > 0 ? "up" : "down",
      };
    }
    return { trendPercent: 0, trendDirection: "flat" };
  }, [totalGainAchats, previousMonthGain]);

  const trendColor =
    trendDirection === "up"
      ? "#2e7d32"
      : trendDirection === "down"
        ? "#d32f2f"
        : "#757575";
  const TrendIcon =
    trendDirection === "up"
      ? TrendingUpRoundedIcon
      : trendDirection === "down"
        ? TrendingDownRoundedIcon
        : TrendingFlatRoundedIcon;
  const trendLabel =
    trendPercent === null
      ? "Nouveau gain"
      : `${trendPercent > 0 ? "+" : ""}${trendPercent.toFixed(1)}%`;

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await getGainAchatsObjectif(selectedMonth);
        if (!active) return;
        if (res.status === 204 || !res.data) {
          setObjectif(null);
          setEditing(true);
        } else {
          setObjectif(res.data.montant);
          setEditing(false);
        }
      } catch (err) {
        if (!active) return;
        console.error("Erreur chargement de l'objectif gain achats :", err);
        setError("Impossible de contacter le serveur");
        setObjectif(null);
        setEditing(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedMonth]);

  const handleStartEdit = () => {
    setInputValue(objectif !== null ? String(objectif) : "");
    setError("");
    setEditing(true);
  };

  const handleCancelEdit = () => {
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
      const res = await setGainAchatsObjectif(selectedMonth, val);
      setObjectif(res.data.montant);
      setEditing(false);
    } catch (err) {
      console.error("Erreur sauvegarde de l'objectif gain achats :", err);
      setError("Échec de l'enregistrement sur le serveur");
    } finally {
      setSaving(false);
    }
  };

  const percentage =
    objectif && objectif > 0
      ? Math.round((totalGainAchats / objectif) * 100)
      : 0;

  const progressColor =
    percentage >= 80 ? "#2e7d32" : percentage >= 50 ? "#ed6c02" : "#7b1fa2";

  return (
    <Fade in timeout={500}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRadius: 4,
          border: `2px solid ${alpha("#7b1fa2", 0.15)}`,
          background: `linear-gradient(145deg, ${alpha("#7b1fa2", 0.04)}, ${theme.palette.background.paper})`,
          boxShadow: `0 8px 32px ${alpha("#7b1fa2", 0.08)}`,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-50%",
            right: "-50%",
            width: "100%",
            height: "100%",
            background: `radial-gradient(circle, ${alpha("#7b1fa2", 0.03)} 0%, transparent 70%)`,
            pointerEvents: "none",
          },
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: `0 12px 48px ${alpha("#7b1fa2", 0.15)}`,
            borderColor: alpha("#7b1fa2", 0.3),
          },
        }}
      >
        <CardContent sx={{ position: "relative", zIndex: 1, py: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 1.5,
              background: alpha("#7b1fa2", 0.06),
              px: 2,
              py: 0.75,
              borderRadius: 50,
              border: `1px solid ${alpha("#7b1fa2", 0.12)}`,
              width: "fit-content",
              mx: "auto",
            }}
          >
            <TrackChangesRoundedIcon sx={{ color: "#7b1fa2", fontSize: 20 }} />
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ color: "#7b1fa2" }}
            >
              Objectif gain achats
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
            <TextField
              size="small"
              type="month"
              value={selectedMonth}
              onChange={(e) =>
                e.target.value && setSelectedMonth(e.target.value)
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 50,
                  bgcolor: alpha("#7b1fa2", 0.04),
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: alpha("#7b1fa2", 0.08),
                  },
                  "&.Mui-focused": {
                    bgcolor: alpha("#7b1fa2", 0.08),
                    boxShadow: `0 0 0 2px ${alpha("#7b1fa2", 0.2)}`,
                  },
                },
              }}
              inputProps={{
                style: { textAlign: "center", padding: "4px 10px" },
              }}
            />
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                py: 4,
              }}
            >
              <CircularProgress size={24} sx={{ color: "#7b1fa2" }} />
              <Typography color="text.secondary">Chargement...</Typography>
            </Box>
          ) : (
            <>
              {!editing && (
                <Tooltip title="Modifier l'objectif">
                  <IconButton
                    size="small"
                    onClick={handleStartEdit}
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      color: "#7b1fa2",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "rotate(45deg)",
                        bgcolor: alpha("#7b1fa2", 0.1),
                      },
                    }}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {editing ? (
                <Fade in timeout={300}>
                  <Box sx={{ px: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{ mb: 2 }}
                    >
                      Définissez votre objectif de gain total sur les achats
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          transition: "all 0.3s ease",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                        mt: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={
                          saving ? (
                            <CircularProgress
                              size={16}
                              sx={{ color: "#fff" }}
                            />
                          ) : (
                            <CheckRoundedIcon />
                          )
                        }
                        onClick={handleSaveObjectif}
                        disabled={saving}
                        sx={{
                          bgcolor: "#7b1fa2",
                          "&:hover": {
                            bgcolor: "#6a1b9a",
                            transform: "scale(1.02)",
                          },
                          transition: "all 0.3s ease",
                        }}
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
                          sx={{
                            color: "#7b1fa2",
                            borderColor: "#7b1fa2",
                            "&:hover": { transform: "scale(1.02)" },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Annuler
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Fade>
              ) : (
                <Fade in timeout={400}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{
                        mb: 2,
                        lineHeight: 1.6,
                        background: alpha(theme.palette.grey[100], 0.4),
                        p: 1,
                        borderRadius: 2,
                      }}
                    >
                      Gain de{" "}
                      <strong style={{ color: "#7b1fa2" }}>
                        {formatMonthLabel(selectedMonth)}
                      </strong>{" "}
                      :{" "}
                      <strong style={{ color: "#7b1fa2" }}>
                        {totalGainAchats.toFixed(2)} DT
                      </strong>{" "}
                      réalisés sur l'objectif de{" "}
                      <strong style={{ color: "#7b1fa2" }}>
                        {objectif.toFixed(2)} DT
                      </strong>
                    </Typography>

                    <Typography
                      variant="h3"
                      fontWeight={800}
                      align="center"
                      sx={{
                        color: progressColor,
                        mb: 1.5,
                        textShadow: `0 4px 12px ${alpha(progressColor, 0.2)}`,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {percentage}%
                    </Typography>

                    <AnimatedLinearProgress
                      variant="determinate"
                      value={Math.min(Math.max(percentage, 0), 100)}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 1.5,
                      }}
                    >
                      <Chip
                        icon={
                          <TrendIcon
                            sx={{ color: `${trendColor} !important` }}
                          />
                        }
                        label={`${trendLabel} vs ${formatMonthLabel(previousMonthKey)}`}
                        size="small"
                        sx={{
                          bgcolor: alpha(trendColor, 0.08),
                          color: trendColor,
                          fontWeight: 700,
                          border: `1px solid ${alpha(trendColor, 0.2)}`,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Gain réalisé
                        </Typography>
                        <Typography fontWeight={700} sx={{ color: "#7b1fa2" }}>
                          {totalGainAchats.toFixed(2)} DT
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Objectif
                        </Typography>
                        <Typography fontWeight={700} color="primary">
                          {objectif.toFixed(2)} DT
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

// Dashboard principal amélioré
export const Dashboard = () => {
  const theme = useTheme();
  const { clients, societies, devis, factures, paiements, loading } =
    useAppContext();

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeSocieties = Array.isArray(societies) ? societies : [];
  const safeDevis = Array.isArray(devis) ? devis : [];
  const safeFactures = Array.isArray(factures) ? factures : [];
  const safePaiements = Array.isArray(paiements) ? paiements : [];

  const totalFactured = safeFactures.reduce(
    (sum, f) => sum + (f.amount || 0),
    0,
  );
  const totalPaid = safePaiements.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRemaining = totalFactured - totalPaid;
  const totalGainAchats = safeFactures.reduce(
    (sum, f) => sum + (f.gain || 0),
    0,
  );
  const encaissementPercentage =
    totalFactured > 0 ? Math.round((totalPaid / totalFactured) * 100) : 0;

  const activityKpis = [
    {
      label: "Total Clients & Sociétés",
      value: safeClients.length + safeSocieties.length,
      icon: <PeopleIcon />,
      color: "#1976d2",
      delay: 0,
    },
    {
      label: "Devis",
      value: safeDevis.length,
      icon: <DescriptionIcon />,
      color: "#ed6c02",
      delay: 100,
    },
    {
      label: "Factures",
      value: safeFactures.length,
      icon: <ReceiptLongIcon />,
      color: "#9c27b0",
      delay: 200,
    },
    {
      label: "En cours",
      value: safeDevis.filter((d) => d.status === "pending").length,
      icon: <PendingIcon />,
      color: "#607d8b",
      delay: 300,
    },
  ];

  const financialKpis = [
    {
      label: "Total facturé",
      value: `${totalFactured.toFixed(2)} DT`,
      icon: <EuroIcon />,
      color: "#1976d2",
      delay: 0,
    },
    {
      label: "Total encaissé",
      value: `${totalPaid.toFixed(2)} DT`,
      icon: <PaymentsIcon />,
      color: "#2e7d32",
      delay: 100,
    },
    {
      label: "Reste à encaisser",
      value: `${totalRemaining.toFixed(2)} DT`,
      icon: <MoneyOffIcon />,
      color: "#d32f2f",
      delay: 200,
    },
    {
      label: "Gain total",
      value: `${totalGainAchats.toFixed(2)} DT`,
      icon: <SavingsIcon />,
      color: totalGainAchats >= 0 ? "#2e7d32" : "#d32f2f",
      delay: 300,
    },
  ];

  const STATUS_COLORS = {
    accepted: "#4caf50",
    pending: "#ff9800",
    refused: "#f44336",
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
          minHeight: "60vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={48} sx={{ color: "primary.main" }} />
        <Typography variant="h6" color="text.secondary">
          Chargement des données...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header amélioré avec animation */}
      <Fade in timeout={500}>
        <Box
          sx={{
            mb: 5,
            p: { xs: 3, sm: 4 },
            borderRadius: 5,
            background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(theme.palette.primary.light, 0.02)}, ${theme.palette.background.paper})`,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            textAlign: "center",
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.06)}`,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main}, ${theme.palette.warning.main}, ${theme.palette.primary.main})`,
              backgroundSize: "300% 100%",
              animation: "gradientMove 6s ease infinite",
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
            <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
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
              lineHeight: 1.8,
            }}
          >
            Bienvenue sur{" "}
            <strong style={{ color: theme.palette.primary.main }}>
              Factura
            </strong>
            . Gérez efficacement vos clients, devis, factures et paiements
            depuis une interface centralisée.
          </Typography>
        </Box>
      </Fade>

      {/* Section Performance commerciale */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
        }}
      >
        <SectionTitle
          icon={<TrendingUpRoundedIcon color="primary" fontSize="small" />}
          title="Performance commerciale"
          color="primary"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          maxWidth: 900,
          mx: "auto",
        }}
      >
        {activityKpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </Box>

      {/* Section Aperçu financier */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 6,
          mb: 3,
        }}
      >
        <SectionTitle
          icon={<EuroIcon color="success" fontSize="small" />}
          title="Aperçu financier"
          color="success"
        />
      </Box>

      {/* KPIs financiers - même taille/alignement que Performance commerciale */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          maxWidth: 900,
          mx: "auto",
        }}
      >
        {financialKpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </Box>

      {/* Section Performance financière - Jauges (pleine largeur, en dessous) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 6,
          mb: 3,
          mr: 10,
        }}
      >
        <SectionTitle
          icon={<BarChartRoundedIcon color="warning" fontSize="small" />}
          title="Performance financière"
          color="warning"
        />
      </Box>

      <Grid container spacing={15}>
        <Grid item xs={12} sm={6}>
          <Fade in timeout={400}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderRadius: 4,
                border: `2px solid ${alpha(theme.palette.success.main, 0.15)}`,
                background: `linear-gradient(145deg, ${alpha(theme.palette.success.main, 0.04)}, ${theme.palette.background.paper})`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.06)}`,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: `0 12px 48px ${alpha(theme.palette.success.main, 0.12)}`,
                  borderColor: alpha(theme.palette.success.main, 0.3),
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
                    background: alpha(theme.palette.success.main, 0.06),
                    px: 2,
                    py: 1,
                    borderRadius: 50,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
                    width: "fit-content",
                    mx: "auto",
                  }}
                >
                  <TrendingUpRoundedIcon color="success" fontSize="small" />
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="success.main"
                  >
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
                    background: alpha(theme.palette.grey[100], 0.4),
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <strong style={{ color: theme.palette.success.main }}>
                    {totalPaid.toFixed(2)} DT
                  </strong>{" "}
                  encaissés sur{" "}
                  <strong style={{ color: theme.palette.primary.main }}>
                    {totalFactured.toFixed(2)} DT
                  </strong>{" "}
                  facturés
                </Typography>

                <Typography
                  variant="h2"
                  fontWeight={800}
                  align="center"
                  sx={{
                    color: progressColor,
                    mb: 2,
                    textShadow: `0 4px 12px ${alpha(progressColor, 0.2)}`,
                    transition: "all 0.3s ease",
                  }}
                >
                  {encaissementPercentage}%
                </Typography>

                <AnimatedLinearProgress
                  variant="determinate"
                  value={Math.min(encaissementPercentage, 100)}
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Encaissé
                    </Typography>
                    <Typography fontWeight={700} color="success.main">
                      {totalPaid.toFixed(2)} DT
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Facturé
                    </Typography>
                    <Typography fontWeight={700} color="primary">
                      {totalFactured.toFixed(2)} DT
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} sm={6}>
          <GainObjectifCard factures={safeFactures} />
        </Grid>
      </Grid>

      {/* Section Visualisations financières */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 6,
          mb: 3,
          mr: 10,
        }}
      >
        <SectionTitle
          icon={<PieChartRoundedIcon color="info" fontSize="small" />}
          title="Visualisations financières"
          color="primary"
        />
      </Box>

      {/* Graphiques */}
      <Grid container spacing={15}>
        <Grid item xs={12} md={6}>
          <Grow in timeout={600}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 4,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.03)}, ${theme.palette.background.paper})`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.06)}`,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.25),
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    background: alpha(theme.palette.primary.main, 0.06),
                    px: 2,
                    py: 1,
                    borderRadius: 50,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    width: "fit-content",
                  }}
                >
                  <PieChartRoundedIcon color="primary" fontSize="small" />
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="primary.main"
                  >
                    Répartition des devis
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, mt: 1 }}
                >
                  Visualisez la répartition de vos devis selon leur statut.
                </Typography>
                {devisStatusData.length === 0 ? (
                  <Box
                    sx={{
                      height: 280,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      Aucun devis disponible
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
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
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        animationDuration={800}
                        animationBegin={200}
                      >
                        {devisStatusData.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_COLORS[entry.status]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value, name) => [`${value} devis`, name]}
                        contentStyle={{
                          borderRadius: 12,
                          border: "none",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          padding: "12px 16px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{
                          paddingTop: 20,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grow in timeout={700}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 4,
                border: `2px solid ${alpha(theme.palette.success.main, 0.12)}`,
                background: `linear-gradient(145deg, ${alpha(theme.palette.success.main, 0.03)}, ${theme.palette.background.paper})`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.06)}`,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: `0 12px 48px ${alpha(theme.palette.success.main, 0.1)}`,
                  borderColor: alpha(theme.palette.success.main, 0.25),
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    background: alpha(theme.palette.success.main, 0.06),
                    px: 2,
                    py: 1,
                    borderRadius: 50,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
                    width: "fit-content",
                  }}
                >
                  <BarChartRoundedIcon color="success" fontSize="small" />
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="success.main"
                  >
                    Comparaison financière
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, mt: 1 }}
                >
                  Comparez les montants facturés, encaissés et restant à
                  percevoir.
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={[
                      { name: "Facturé", value: totalFactured },
                      { name: "Encaissé", value: totalPaid },
                      { name: "Reste", value: totalRemaining },
                    ]}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      strokeOpacity={0.3}
                    />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip
                      formatter={(value) => `${value.toFixed(2)} DT`}
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        padding: "12px 16px",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      animationDuration={800}
                      animationBegin={300}
                    >
                      <Cell fill={theme.palette.primary.main} />
                      <Cell fill={theme.palette.success.main} />
                      <Cell fill={theme.palette.error.main} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Animation CSS personnalisée */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </Box>
  );
};
