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
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AttachFileIconOutlined from "@mui/icons-material/AttachFile";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import api, { viewAttachementPdf, downloadAttachementPdf } from "../../api/api";

// Animations
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Constantes des statuts
const STATUS_CONFIG = {
  agreement: { label: "En attente d'accord", color: "#ff9800", bg: "#fff3e0" },
  validated: { label: "Validé", color: "#4caf50", bg: "#e8f5e9" },
  contested: { label: "Contesté", color: "#f44336", bg: "#fce4ec" },
  refused: { label: "Refusé", color: "#f44336", bg: "#fce4ec" },
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
            placeholder="🔍 Rechercher un attachement..."
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
              Nouvel attachement
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
                  sx={{ fontWeight: 600,mt:0.35 }}
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
  attachment,
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
        onClick={() => onView(attachment)}
        sx={{ color: "info.main" }}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Aperçu PDF" arrow>
      <IconButton
        size="small"
        onClick={() => onViewPdf(attachment)}
        sx={{ color: "error.main" }}
      >
        <PictureAsPdfIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Télécharger PDF" arrow>
      <IconButton
        size="small"
        onClick={() => onDownloadPdf(attachment)}
        sx={{ color: "success.main" }}
      >
        <DownloadIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Modifier" arrow>
      <IconButton
        size="small"
        onClick={() => onEdit(attachment)}
        sx={{ color: "warning.main" }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Supprimer" arrow>
      <IconButton size="small" color="error" onClick={() => onDelete(attachment)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

// Composant principal
export const AttachmentsList = () => {
  const [attachments, setAttachments] = useState([]);
  const [blList, setBlList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // États pour l'ajout
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAttachment, setNewAttachment] = useState({
    number: "",
    blId: "",
    date: "",
    description: "",
    amount: "",
    status: "agreement",
    agreementDate: "",
    comments: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // États pour la modification
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    number: "",
    blId: "",
    date: "",
    description: "",
    amount: "",
    status: "agreement",
    agreementDate: "",
    comments: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // États pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAttachment, setDeletingAttachment] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // États pour le détail
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/attachements");
      setAttachments(response.data || []);
    } catch (error) {
      console.error("Erreur chargement attachements", error);
      showSnackbar("Erreur lors du chargement des attachements", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBl = async () => {
    try {
      const response = await api.get("/bl");
      setBlList(response.data || []);
    } catch (error) {
      console.error("Erreur chargement BL", error);
    }
  };

  useEffect(() => {
    loadAttachments();
    loadBl();
  }, []);

  const filteredAttachments = useMemo(() => {
    return attachments.filter((d) => {
      const matchesSearch =
        d.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.blNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const dOnly = d.date ? String(d.date).slice(0, 10) : null;
      const matchesDateDebut = !dateDebut || (dOnly && dOnly >= dateDebut);
      const matchesDateFin = !dateFin || (dOnly && dOnly <= dateFin);
      return matchesSearch && matchesDateDebut && matchesDateFin;
    });
  }, [attachments, searchTerm, dateDebut, dateFin]);

  const paginatedAttachments = useMemo(() => {
    return filteredAttachments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAttachments, page, rowsPerPage]);

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // ============================================================
  // AJOUTER UN ATTACHEMENT
  // ============================================================
  const handleAddAttachment = async () => {
    if (!newAttachment.blId) {
      showSnackbar("Veuillez sélectionner un BL.", "warning");
      return;
    }

    setAddLoading(true);
    try {
      const selectedBl = blList.find((d) => d.id === newAttachment.blId);
      const data = {
        ...newAttachment,
        amount: parseFloat(newAttachment.amount) || 0,
        blNumber: selectedBl?.number || "",
        clientName: selectedBl?.clientName || "",
        clientType: selectedBl?.clientType || "client",
      };
      const response = await api.post("/attachements", data);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/attachements/${response.data.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadAttachments();
      setAddDialogOpen(false);
      resetNewAttachmentForm();
      showSnackbar("✅ Attachement ajouté avec succès !");
    } catch (error) {
      console.error("Erreur ajout attachement", error);
      showSnackbar("❌ Erreur lors de l'ajout de l'attachement", "error");
    } finally {
      setAddLoading(false);
    }
  };

  const resetNewAttachmentForm = () => {
    setNewAttachment({
      number: "",
      blId: "",
      date: "",
      description: "",
      amount: "",
      status: "agreement",
      agreementDate: "",
      comments: "",
    });
    setSelectedFile(null);
  };

  // ============================================================
  // MODIFIER UN ATTACHEMENT
  // ============================================================
  const handleOpenEdit = useCallback((attachmentItem) => {
    setEditingAttachment(attachmentItem);
    setEditFormData({
      number: attachmentItem.number || "",
      blId: attachmentItem.blId || attachmentItem.bl?.id || "",
      date: attachmentItem.date
        ? new Date(attachmentItem.date).toISOString().split("T")[0]
        : "",
      description: attachmentItem.description || "",
      amount: attachmentItem.amount || "",
      status: attachmentItem.status || "agreement",
      agreementDate: attachmentItem.agreementDate
        ? new Date(attachmentItem.agreementDate).toISOString().split("T")[0]
        : "",
      comments: attachmentItem.comments || "",
    });
    setEditFile(null);
    setEditDialogOpen(true);
  }, []);

  const handleEditAttachment = async () => {
    if (!editFormData.blId) {
      showSnackbar("Veuillez sélectionner un BL.", "warning");
      return;
    }

    setEditLoading(true);
    try {
      const selectedBl = blList.find((d) => d.id === editFormData.blId);
      const data = {
        ...editFormData,
        amount: parseFloat(editFormData.amount) || 0,
        blNumber: selectedBl?.number || "",
        clientName: selectedBl?.clientName || "",
        clientType: selectedBl?.clientType || "client",
      };
      await api.put(`/attachements/${editingAttachment.id}`, data);

      if (editFile) {
        const formData = new FormData();
        formData.append("file", editFile);
        await api.post(`/attachements/${editingAttachment.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadAttachments();
      setEditDialogOpen(false);
      setEditingAttachment(null);
      setEditFile(null);
      showSnackbar("✅ Attachement modifié avec succès !");
    } catch (error) {
      console.error("Erreur modification attachement", error);
      showSnackbar("❌ Erreur lors de la modification de l'attachement", "error");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UN ATTACHEMENT
  // ============================================================
  const handleOpenDelete = useCallback((attachmentItem) => {
    setDeletingAttachment(attachmentItem);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteAttachment = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/attachements/${deletingAttachment.id}`);
      await loadAttachments();
      setDeleteDialogOpen(false);
      setDeletingAttachment(null);
      showSnackbar("✅ Attachement supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression attachement", error);
      showSnackbar("❌ Erreur lors de la suppression de l'attachement", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = useCallback((attachmentItem) => {
    setSelectedAttachment(attachmentItem);
    setDetailDialogOpen(true);
  }, []);

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = useCallback(
    async (attachmentItem) => {
      if (!attachmentItem.pdfUrl) {
        showSnackbar("Aucun PDF attaché à cet attachement.", "info");
        return;
      }

      try {
        const success = await viewAttachementPdf(attachmentItem.id);
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
    async (attachmentItem) => {
      if (!attachmentItem.pdfUrl) {
        showSnackbar("Aucun PDF attaché à cet attachement.", "info");
        return;
      }

      try {
        const success = await downloadAttachementPdf(
          attachmentItem.id,
          attachmentItem.fileName
        );
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
    setNewAttachment({
      number: "",
      blId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      status: "agreement",
      agreementDate: "",
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
            <AttachFileIconOutlined fontSize="large" color="primary" />
            Attachements
            <Chip
              label={`${filteredAttachments.length} attachements`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez tous vos attachements en un seul endroit
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
        filteredCount={filteredAttachments.length}
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
                <TableCell sx={{ fontWeight: 700 }}>BL source</TableCell>
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
              {paginatedAttachments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <AttachFileIconOutlined
                      sx={{ fontSize: 60, color: "grey.300", mb: 2 }}
                    />
                    <Typography color="text.secondary" variant="h6">
                      Aucun attachement trouvé
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Commencez par créer un nouvel attachement
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreate}
                      sx={{ mt: 2 }}
                    >
                      Nouvel attachement
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAttachments.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{d.number}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <DescriptionIcon fontSize="small" color="action" />
                        {d.blNumber || d.bl?.number || "-"}
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
                        attachment={d}
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
          count={filteredAttachments.length}
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
            <Typography variant="h6">Nouvel attachement</Typography>
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
                placeholder="Ex: ATT-0001"
                value={newAttachment.number}
                onChange={(e) =>
                  setNewAttachment({ ...newAttachment, number: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachFileIconOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>BL source</InputLabel>
                <Select
                  value={newAttachment.blId}
                  onChange={(e) => {
                    const bl = blList.find((d) => d.id === e.target.value);
                    setNewAttachment({
                      ...newAttachment,
                      blId: e.target.value,
                      amount: bl?.amount || "",
                    });
                  }}
                  label="BL source"
                >
                  {blList.map((d) => (
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
                value={newAttachment.date}
                onChange={(e) =>
                  setNewAttachment({ ...newAttachment, date: e.target.value })
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
                value={newAttachment.amount}
                onChange={(e) =>
                  setNewAttachment({ ...newAttachment, amount: e.target.value })
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
                value={newAttachment.description}
                onChange={(e) =>
                  setNewAttachment({
                    ...newAttachment,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={newAttachment.status}
                  onChange={(e) =>
                    setNewAttachment({
                      ...newAttachment,
                      status: e.target.value,
                    })
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
                label="Date d'accord mutuel"
                type="date"
                fullWidth
                value={newAttachment.agreementDate}
                onChange={(e) =>
                  setNewAttachment({
                    ...newAttachment,
                    agreementDate: e.target.value,
                  })
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
            <Grid item xs={12}>
              <TextField
                label="Commentaires"
                fullWidth
                multiline
                rows={2}
                value={newAttachment.comments}
                onChange={(e) =>
                  setNewAttachment({
                    ...newAttachment,
                    comments: e.target.value,
                  })
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
            onClick={handleAddAttachment}
            disabled={addLoading}
            startIcon={addLoading ? null : <AddIcon />}
          >
            {addLoading ? "Ajout en cours..." : "Ajouter l'attachement"}
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
            <Typography variant="h6">Modifier l'attachement</Typography>
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
                      <AttachFileIconOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>BL source</InputLabel>
                <Select
                  value={editFormData.blId}
                  onChange={(e) => {
                    const bl = blList.find((d) => d.id === e.target.value);
                    setEditFormData({
                      ...editFormData,
                      blId: e.target.value,
                      amount: bl?.amount || "",
                    });
                  }}
                  label="BL source"
                >
                  {blList.map((d) => (
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
                label="Date d'accord mutuel"
                type="date"
                fullWidth
                value={editFormData.agreementDate}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    agreementDate: e.target.value,
                  })
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
            <Grid item xs={12}>
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
              {editingAttachment?.fileName && !editFile && (
                <Chip
                  label={`Actuel: ${editingAttachment.fileName}`}
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
            onClick={handleEditAttachment}
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
            Êtes-vous sûr de vouloir supprimer l'attachement{" "}
            <strong>{deletingAttachment?.number}</strong> ?
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
            onClick={handleDeleteAttachment}
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
        {selectedAttachment && (
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
                  <Typography variant="h6">{selectedAttachment.number}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Détails de l'attachement
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
                        BL source
                      </Box>
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedAttachment.blNumber ||
                        selectedAttachment.bl?.number ||
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
                    {selectedAttachment.date
                      ? new Date(selectedAttachment.date).toLocaleDateString("fr-FR", {
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
                  <StatusChip status={selectedAttachment.status} />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedAttachment.description || "Aucune description"}
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
                      {selectedAttachment.amount
                        ? `${selectedAttachment.amount.toLocaleString()} DT`
                        : "-"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <CalendarTodayIcon
                      fontSize="small"
                      sx={{ mr: 0.5, verticalAlign: "middle" }}
                    />
                    Date d'accord mutuel
                  </Typography>
                  <Typography variant="body1">
                    {selectedAttachment.agreementDate
                      ? new Date(selectedAttachment.agreementDate).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Commentaires
                  </Typography>
                  <Typography variant="body1">
                    {selectedAttachment.comments || "Aucun commentaire"}
                  </Typography>
                </Grid>
                {selectedAttachment.pdfUrl && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pièce jointe
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedAttachment)}
                      sx={{ textTransform: "none" }}
                    >
                      {selectedAttachment.fileName || "document.pdf"}
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
