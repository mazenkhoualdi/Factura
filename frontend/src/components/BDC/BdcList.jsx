import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Fade,
  Slide,
  Alert,
  Snackbar,
  Skeleton,
  TablePagination,
  InputAdornment,
  Badge,
  Divider,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import api, { viewBdcPdf, downloadBdcPdf } from "../../api/api";

// Animations
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Constantes des statuts
const STATUS_CONFIG = {
  preparing: { label: "En préparation", color: "#ff9800", bg: "#fff3e0" },
  validated: { label: "Validé", color: "#4caf50", bg: "#e8f5e9" },
  cancelled: { label: "Annulé", color: "#f44336", bg: "#fce4ec" },
};

const getStatusLabel = (status) => STATUS_CONFIG[status]?.label || status;
const getStatusColor = (status) => STATUS_CONFIG[status]?.color || "#9e9e9e";
const getStatusBg = (status) => STATUS_CONFIG[status]?.bg || "#f5f5f5";

// Composant de filtre premium
const FilterSection = ({
  searchTerm,
  setSearchTerm,
  dateDebut,
  setDateDebut,
  dateFin,
  setDateFin,
  onClear,
  filteredCount = 0,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const activeFiltersCount = [searchTerm, dateDebut, dateFin].filter(Boolean)
    .length;

  return (
    <Paper
      elevation={showFilters ? 3 : 1}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        background: showFilters
          ? "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)"
          : "white",
        border: showFilters ? "2px solid" : "1px solid",
        borderColor: showFilters ? "primary.main" : "grey.200",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&::before": showFilters
          ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background:
                "linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)",
              backgroundSize: "200% 100%",
              animation: "gradient 3s ease infinite",
            }
          : {},
        "@keyframes gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            size="medium"
            placeholder="🔍 Rechercher un bon de commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 2px 12px rgba(25, 118, 210, 0.15)",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "primary.main" }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm("")}
                    sx={{
                      bgcolor: "grey.100",
                      "&:hover": { bgcolor: "grey.200" },
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              display: "flex",
              mt: 1,
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Button
              size="medium"
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
                px: 2.5,
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
            >
              {showFilters ? "Masquer les filtres" : "Filtres avancés"}
              {activeFiltersCount > 0 && (
                <Badge
                  badgeContent={activeFiltersCount}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      right: -8,
                      top: -8,
                      fontSize: "0.65rem",
                      height: 18,
                      minWidth: 18,
                    },
                  }}
                />
              )}
            </Button>

            <Box sx={{ flex: 1 }} />

            <Button
              size="medium"
              variant="contained"
              onClick={onClear}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                background:
                  "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                boxShadow: "0 4px 15px rgba(25, 118, 210, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(25, 118, 210, 0.4)",
                },
              }}
            >
              <AddIcon sx={{ mr: 0.5 }} />
              Nouveau BDC
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Collapse in={showFilters}>
        <Box
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "2px dashed",
            borderColor: "grey.300",
            position: "relative",
          }}
        >
          <Typography
            variant="overline"
            sx={{
              position: "absolute",
              top: -12,
              left: 20,
              bgcolor: "white",
              px: 1.5,
              color: "primary.main",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            FILTRES PAR DATE
          </Typography>

          <Grid container spacing={3} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  size="medium"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  placeholder="Date de début"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                    endAdornment: dateDebut && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setDateDebut("")}
                          sx={{
                            bgcolor: "error.light",
                            color: "error.main",
                            "&:hover": {
                              bgcolor: "error.main",
                              color: "white",
                            },
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 2px 12px rgba(25, 118, 210, 0.15)",
                      },
                    },
                    "& .MuiInputBase-input": {
                      py: 1.5,
                      fontSize: "0.95rem",
                    },
                    "& .MuiFormLabel-root": {
                      display: "none",
                    },
                  }}
                />
                {!dateDebut && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      bottom: -22,
                      left: 14,
                      color: "text.secondary",
                      opacity: 0.7,
                    }}
                  >
                    Date de début
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              sm={1.5}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  boxShadow: "0 2px 10px rgba(25, 118, 210, 0.3)",
                }}
              >
                À
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  size="medium"
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  placeholder="Date de fin"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                    endAdornment: dateFin && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setDateFin("")}
                          sx={{
                            bgcolor: "error.light",
                            color: "error.main",
                            "&:hover": {
                              bgcolor: "error.main",
                              color: "white",
                            },
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 2px 12px rgba(25, 118, 210, 0.15)",
                      },
                    },
                    "& .MuiInputBase-input": {
                      py: 1.5,
                      fontSize: "0.95rem",
                    },
                    "& .MuiFormLabel-root": {
                      display: "none",
                    },
                  }}
                />
                {!dateFin && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      bottom: -22,
                      left: 14,
                      color: "text.secondary",
                      opacity: 0.7,
                    }}
                  >
                    Date de fin
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={2.5}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => {
                  setDateDebut("");
                  setDateFin("");
                }}
                startIcon={<ClearIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  py: 1.5,
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    bgcolor: "error.light",
                  },
                }}
                disabled={!dateDebut && !dateFin}
              >
                Effacer les dates
              </Button>
            </Grid>
          </Grid>

          {activeFiltersCount > 0 && (
            <Box
              sx={{
                mt: 2,
                pt: 1.5,
                borderTop: "1px solid",
                borderColor: "grey.200",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 ,mt:0.35}}
                >
                  Filtres actifs :
                </Typography>
                {searchTerm && (
                  <Chip
                    label={`Recherche: "${searchTerm}"`}
                    size="small"
                    onDelete={() => setSearchTerm("")}
                    sx={{
                      color: "primary.main",
                      fontWeight: 500,
                    }}
                  />
                )}
                {dateDebut && (
                  <Chip
                    label={`Du: ${new Date(dateDebut).toLocaleDateString(
                      "fr-FR"
                    )}`}
                    size="small"
                    onDelete={() => setDateDebut("")}
                    sx={{
                      color: "info.main",
                      fontWeight: 500,
                    }}
                  />
                )}
                {dateFin && (
                  <Chip
                    label={`Au: ${new Date(dateFin).toLocaleDateString(
                      "fr-FR"
                    )}`}
                    size="small"
                    onDelete={() => setDateFin("")}
                    sx={{
                      color: "info.main",
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {filteredCount} résultat(s) trouvé(s)
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

// Composant de statut
const StatusChip = ({ status }) => (
  <Chip
    label={getStatusLabel(status)}
    size="small"
    sx={{
      bgcolor: getStatusBg(status),
      color: getStatusColor(status),
      fontWeight: 600,
      "& .MuiChip-label": { px: 1.5 },
    }}
  />
);

// Composant d'action rapide
const QuickActionButtons = ({
  bdc,
  onView,
  onEdit,
  onDelete,
  onViewPdf,
  onDownloadPdf,
}) => (
  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
    <Tooltip title="Voir détails" arrow>
      <IconButton
        size="small"
        onClick={() => onView(bdc)}
        sx={{ color: "info.main" }}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Aperçu PDF" arrow>
      <IconButton
        size="small"
        onClick={() => onViewPdf(bdc)}
        sx={{ color: "error.main" }}
      >
        <PictureAsPdfIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Télécharger PDF" arrow>
      <IconButton
        size="small"
        onClick={() => onDownloadPdf(bdc)}
        sx={{ color: "success.main" }}
      >
        <DownloadIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Modifier" arrow>
      <IconButton
        size="small"
        onClick={() => onEdit(bdc)}
        sx={{ color: "warning.main" }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Supprimer" arrow>
      <IconButton size="small" color="error" onClick={() => onDelete(bdc)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

// Composant principal
export const BdcList = () => {
  const [bdc, setBdc] = useState([]);
  const [devisList, setDevisList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // États pour l'ajout
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newBdc, setNewBdc] = useState({
    number: "",
    devisId: "",
    date: "",
    description: "",
    amount: "",
    status: "preparing",
    comments: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // États pour la modification
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBdc, setEditingBdc] = useState(null);
  const [editFormData, setEditFormData] = useState({
    number: "",
    devisId: "",
    date: "",
    description: "",
    amount: "",
    status: "preparing",
    comments: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // États pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBdc, setDeletingBdc] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // États pour le détail
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBdc, setSelectedBdc] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadBdc = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bdc");
      setBdc(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erreur chargement BDC", error);
      showSnackbar("Erreur lors du chargement des BDC", "error");
      setBdc([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDevis = async () => {
    try {
      const response = await api.get("/devis");
      setDevisList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erreur chargement devis", error);
      setDevisList([]);
    }
  };

  useEffect(() => {
    loadBdc();
    loadDevis();
  }, []);

  const filteredBdc = useMemo(() => {
    return Array.isArray(bdc)
      ? bdc.filter((d) => {
          const matchesSearch =
            d.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.devisNumber?.toLowerCase().includes(searchTerm.toLowerCase());
          const dOnly = d.date ? String(d.date).slice(0, 10) : null;
          const matchesDateDebut = !dateDebut || (dOnly && dOnly >= dateDebut);
          const matchesDateFin = !dateFin || (dOnly && dOnly <= dateFin);
          return matchesSearch && matchesDateDebut && matchesDateFin;
        })
      : [];
  }, [bdc, searchTerm, dateDebut, dateFin]);

  const paginatedBdc = useMemo(() => {
    return filteredBdc.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredBdc, page, rowsPerPage]);

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // ============================================================
  // AJOUTER UN BDC
  // ============================================================
  const handleAddBdc = async () => {
    if (!newBdc.devisId) {
      showSnackbar("Veuillez sélectionner un devis.", "warning");
      return;
    }

    setAddLoading(true);
    try {
      const selectedDevis = devisList.find((d) => d.id === newBdc.devisId);

      const data = {
        ...newBdc,
        amount: parseFloat(newBdc.amount) || 0,
        devisNumber: selectedDevis?.number || "",
        clientName: selectedDevis?.clientName || "",
        clientType: selectedDevis?.clientType || "client",
      };
      const response = await api.post("/bdc", data);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/bdc/${response.data.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadBdc();
      setAddDialogOpen(false);
      resetNewBdcForm();
      showSnackbar("✅ BDC ajouté avec succès !");
    } catch (error) {
      console.error("Erreur ajout BDC", error);
      showSnackbar("❌ Erreur lors de l'ajout du BDC", "error");
    } finally {
      setAddLoading(false);
    }
  };

  const resetNewBdcForm = () => {
    setNewBdc({
      number: "",
      devisId: "",
      date: "",
      description: "",
      amount: "",
      status: "preparing",
      comments: "",
    });
    setSelectedFile(null);
  };

  // ============================================================
  // MODIFIER UN BDC
  // ============================================================
  const handleOpenEdit = useCallback((bdcItem) => {
    setEditingBdc(bdcItem);
    setEditFormData({
      number: bdcItem.number || "",
      devisId: bdcItem.devisId || bdcItem.devis?.id || "",
      date: bdcItem.date
        ? new Date(bdcItem.date).toISOString().split("T")[0]
        : "",
      description: bdcItem.description || "",
      amount: bdcItem.amount || "",
      status: bdcItem.status || "preparing",
      comments: bdcItem.comments || "",
    });
    setEditFile(null);
    setEditDialogOpen(true);
  }, []);

  const handleEditBdc = async () => {
    if (!editFormData.devisId) {
      showSnackbar("Veuillez sélectionner un devis.", "warning");
      return;
    }

    setEditLoading(true);
    try {
      const selectedDevis = devisList.find(
        (d) => d.id === editFormData.devisId
      );

      const data = {
        ...editFormData,
        amount: parseFloat(editFormData.amount) || 0,
        devisNumber: selectedDevis?.number || "",
        clientName: selectedDevis?.clientName || "",
        clientType: selectedDevis?.clientType || "client",
      };
      await api.put(`/bdc/${editingBdc.id}`, data);

      if (editFile) {
        const formData = new FormData();
        formData.append("file", editFile);
        await api.post(`/bdc/${editingBdc.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadBdc();
      setEditDialogOpen(false);
      setEditingBdc(null);
      setEditFile(null);
      showSnackbar("✅ BDC modifié avec succès !");
    } catch (error) {
      console.error("Erreur modification BDC", error);
      showSnackbar("❌ Erreur lors de la modification du BDC", "error");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UN BDC
  // ============================================================
  const handleOpenDelete = useCallback((bdcItem) => {
    setDeletingBdc(bdcItem);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteBdc = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/bdc/${deletingBdc.id}`);
      await loadBdc();
      setDeleteDialogOpen(false);
      setDeletingBdc(null);
      showSnackbar("✅ BDC supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression BDC", error);
      showSnackbar("❌ Erreur lors de la suppression du BDC", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = useCallback((bdcItem) => {
    setSelectedBdc(bdcItem);
    setDetailDialogOpen(true);
  }, []);

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = useCallback(
    async (bdcItem) => {
      if (!bdcItem.pdfUrl) {
        showSnackbar("Aucun PDF attaché à ce BDC.", "info");
        return;
      }

      try {
        const success = await viewBdcPdf(bdcItem.id);
        if (!success) {
          showSnackbar("❌ Erreur lors de l'ouverture du PDF", "error");
        }
      } catch (error) {
        console.error("Erreur", error);
        showSnackbar("❌ Erreur lors de l'ouverture du PDF", "error");
      }
    },
    [showSnackbar]
  );

  // ============================================================
  // TÉLÉCHARGER LE PDF
  // ============================================================
  const handleDownloadPdf = useCallback(
    async (bdcItem) => {
      if (!bdcItem.pdfUrl) {
        showSnackbar("Aucun PDF attaché à ce BDC.", "info");
        return;
      }

      try {
        const success = await downloadBdcPdf(bdcItem.id, bdcItem.fileName);
        if (success) {
          showSnackbar("✅ Téléchargement du PDF démarré !");
        } else {
          showSnackbar("❌ Erreur lors du téléchargement du PDF", "error");
        }
      } catch (error) {
        console.error("Erreur", error);
        showSnackbar("❌ Erreur lors du téléchargement du PDF", "error");
      }
    },
    [showSnackbar]
  );

  // ============================================================
  // OPEN CREATE DIALOG
  // ============================================================
  const handleOpenCreate = useCallback(() => {
    setNewBdc({
      number: "",
      devisId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      status: "preparing",
      comments: "",
    });
    setSelectedFile(null);
    setAddDialogOpen(true);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Composant de chargement
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box>
      {/* ============================================================
                EN-TÊTE
                ============================================================ */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            <ReceiptIcon fontSize="large" color="primary" />
            Bons de Commande
            <Chip
              label={`${filteredBdc.length} BDC`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez tous vos bons de commande en un seul endroit
          </Typography>
        </Box>
      </Box>

      {/* ============================================================
                FILTRES PREMIUM
                ============================================================ */}
      <FilterSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateDebut={dateDebut}
        setDateDebut={setDateDebut}
        dateFin={dateFin}
        setDateFin={setDateFin}
        onClear={handleOpenCreate}
        filteredCount={filteredBdc.length}
      />

      {/* ============================================================
                TABLEAU
                ============================================================ */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Numéro</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Devis source</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Client / Société</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Montant
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBdc.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <ReceiptIcon
                      sx={{ fontSize: 60, color: "grey.300", mb: 2 }}
                    />
                    <Typography color="text.secondary" variant="h6">
                      Aucun bon de commande trouvé
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Commencez par créer un nouveau bon de commande
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreate}
                      sx={{ mt: 2 }}
                    >
                      Nouveau BDC
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBdc.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{d.number}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <DescriptionIcon fontSize="small" color="action" />
                        {d.devisNumber || d.devis?.number || "-"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {d.clientType === "society" ? (
                          <BusinessIcon fontSize="small" color="action" />
                        ) : (
                          <PersonIcon fontSize="small" color="action" />
                        )}
                        {d.clientName || "-"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {d.date
                        ? new Date(d.date).toLocaleDateString("fr-FR")
                        : ""}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color="primary">
                        {d.amount ? `${d.amount.toLocaleString()} DT` : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={d.status} />
                    </TableCell>
                    <TableCell align="right">
                      <QuickActionButtons
                        bdc={d}
                        onView={handleViewDetail}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                        onViewPdf={handleViewPdf}
                        onDownloadPdf={handleDownloadPdf}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredBdc.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
        />
      </Card>

      {/* ============================================================
                DIALOGUE D'AJOUT
                ============================================================ */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Nouveau bon de commande</Typography>
            <IconButton onClick={() => setAddDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro"
                fullWidth
                required
                placeholder="Ex: BDC-0001"
                value={newBdc.number}
                onChange={(e) =>
                  setNewBdc({ ...newBdc, number: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReceiptIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Devis source</InputLabel>
                <Select
                  value={newBdc.devisId}
                  onChange={(e) => {
                    const devis = devisList.find((d) => d.id === e.target.value);
                    setNewBdc({
                      ...newBdc,
                      devisId: e.target.value,
                      amount: devis?.amount || "",
                    });
                  }}
                  label="Devis source"
                >
                  {devisList.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={newBdc.date}
                onChange={(e) =>
                  setNewBdc({ ...newBdc, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Montant (DT)"
                type="number"
                fullWidth
                value={newBdc.amount}
                onChange={(e) =>
                  setNewBdc({ ...newBdc, amount: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={newBdc.description}
                onChange={(e) =>
                  setNewBdc({ ...newBdc, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={newBdc.status}
                  onChange={(e) =>
                    setNewBdc({ ...newBdc, status: e.target.value })
                  }
                  label="Statut"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          bgcolor: config.bg,
                          color: config.color,
                          fontWeight: 600,
                        }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Commentaires"
                fullWidth
                multiline
                rows={2}
                value={newBdc.comments}
                onChange={(e) =>
                  setNewBdc({ ...newBdc, comments: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
              >
                Pièce jointe (PDF)
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </Button>
              {selectedFile && (
                <Chip
                  label={selectedFile.name}
                  sx={{ ml: 1 }}
                  onDelete={() => setSelectedFile(null)}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setAddDialogOpen(false)} disabled={addLoading}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleAddBdc}
            disabled={addLoading}
            startIcon={addLoading ? null : <AddIcon />}
          >
            {addLoading ? "Ajout en cours..." : "Ajouter le BDC"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
                DIALOGUE DE MODIFICATION
                ============================================================ */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Modifier le bon de commande</Typography>
            <IconButton onClick={() => setEditDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro"
                fullWidth
                value={editFormData.number}
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReceiptIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Devis source</InputLabel>
                <Select
                  value={editFormData.devisId}
                  onChange={(e) => {
                    const devis = devisList.find(
                      (d) => d.id === e.target.value
                    );
                    setEditFormData({
                      ...editFormData,
                      devisId: e.target.value,
                      amount: devis?.amount || "",
                    });
                  }}
                  label="Devis source"
                >
                  {devisList.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={editFormData.date}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Montant (DT)"
                type="number"
                fullWidth
                value={editFormData.amount}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, amount: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  label="Statut"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          bgcolor: config.bg,
                          color: config.color,
                          fontWeight: 600,
                        }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Commentaires"
                fullWidth
                multiline
                rows={2}
                value={editFormData.comments}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, comments: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
              >
                Nouvelle pièce jointe (PDF)
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={(e) => setEditFile(e.target.files[0])}
                />
              </Button>
              {editFile && (
                <Chip
                  label={editFile.name}
                  sx={{ ml: 1 }}
                  onDelete={() => setEditFile(null)}
                />
              )}
              {editingBdc?.fileName && !editFile && (
                <Chip
                  label={`Actuel: ${editingBdc.fileName}`}
                  sx={{ ml: 1 }}
                  variant="outlined"
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={editLoading}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleEditBdc}
            disabled={editLoading}
          >
            {editLoading ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
                DIALOGUE DE SUPPRESSION
                ============================================================ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6">Confirmer la suppression</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le BDC{" "}
            <strong>{deletingBdc?.number}</strong> ?
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}
          >
            Cette action est irréversible et supprimera également toutes les
            pièces jointes associées.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
          >
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteBdc}
            disabled={deleteLoading}
            startIcon={<DeleteIcon />}
          >
            {deleteLoading ? "Suppression..." : "Supprimer définitivement"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
                DIALOGUE DE DÉTAIL
                ============================================================ */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
      >
        {selectedBdc && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6">{selectedBdc.number}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Détails du bon de commande
                  </Typography>
                </Box>
                <IconButton onClick={() => setDetailDialogOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <Box
                        component="span"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <DescriptionIcon fontSize="small" />
                        Devis source
                      </Box>
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedBdc.devisNumber ||
                        selectedBdc.devis?.number ||
                        "-"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <CalendarTodayIcon
                      fontSize="small"
                      sx={{ mr: 0.5, verticalAlign: "middle" }}
                    />
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedBdc.date
                      ? new Date(selectedBdc.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : ""}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Statut
                  </Typography>
                  <StatusChip status={selectedBdc.status} />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedBdc.description || "Aucune description"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: "primary.50", borderRadius: 2 }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <AttachMoneyIcon
                        fontSize="small"
                        sx={{ mr: 0.5, verticalAlign: "middle" }}
                      />
                      Montant
                    </Typography>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                      {selectedBdc.amount
                        ? `${selectedBdc.amount.toLocaleString()} DT`
                        : "-"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Commentaires
                  </Typography>
                  <Typography variant="body1">
                    {selectedBdc.comments || "Aucun commentaire"}
                  </Typography>
                </Grid>
                {selectedBdc.pdfUrl && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pièce jointe
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedBdc)}
                      sx={{ textTransform: "none" }}
                    >
                      {selectedBdc.fileName || "document.pdf"}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setDetailDialogOpen(false)} variant="contained">
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ============================================================
                SNACKBAR
                ============================================================ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};