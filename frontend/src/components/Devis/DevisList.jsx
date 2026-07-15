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
import { useAppContext } from "../../context/AppContext";
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
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import api, { viewDevisPdf, downloadDevisPdf } from "../../api/api";

// Animations
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Constantes
const STATUS_CONFIG = {
  pending: { label: "En attente", color: "#ff9800", bg: "#fff3e0" },
  accepted: { label: "Accepté", color: "#4caf50", bg: "#e8f5e9" },
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
  filteredCount = 0 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Compter les filtres actifs
  const activeFiltersCount = [
    searchTerm,
    dateDebut,
    dateFin
  ].filter(Boolean).length;

  return (
    <Paper 
      elevation={showFilters ? 3 : 1}
      sx={{ 
        p: 2.5, 
        mb: 3, 
        borderRadius: 3,
        background: showFilters 
          ? 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)'
          : 'white',
        border: showFilters ? '2px solid' : '1px solid',
        borderColor: showFilters ? 'primary.main' : 'grey.200',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': showFilters ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)',
          backgroundSize: '200% 100%',
          animation: 'gradient 3s ease infinite',
        } : {},
        '@keyframes gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            size="medium"
            placeholder="🔍 Rechercher un devis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 2px 12px rgba(25, 118, 210, 0.15)',
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchTerm('')}
                    sx={{ 
                      bgcolor: 'grey.100',
                      '&:hover': { bgcolor: 'grey.200' }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}  md={4}>
          <Box sx={{ display: 'flex',mt:1, gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              size="medium"
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                px: 2.5,
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              {showFilters ? 'Masquer les filtres' : 'Filtres avancés'}
              {activeFiltersCount > 0 && (
                <Badge
                  badgeContent={activeFiltersCount}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      right: -8,
                      top: -8,
                      fontSize: '0.65rem',
                      height: 18,
                      minWidth: 18,
                    }
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
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                }
              }}
            >
              <AddIcon sx={{ mr: 0.5 }} />
              Nouveau devis
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      <Collapse in={showFilters}>
        <Box sx={{ 
          mt: 3, 
          pt: 3, 
          borderTop: '2px dashed',
          borderColor: 'grey.300',
          position: 'relative'
        }}>
          <Typography 
            variant="overline" 
            sx={{ 
              position: 'absolute',
              top: -12,
              left: 20,
              bgcolor: 'white',
              px: 1.5,
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            FILTRES PAR DATE
          </Typography>
          
          <Grid container spacing={3} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ position: 'relative' }}>
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
                        <CalendarTodayIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    endAdornment: dateDebut && (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => setDateDebut('')}
                          sx={{ 
                            bgcolor: 'error.light',
                            color: 'error.main',
                            '&:hover': { bgcolor: 'error.main', color: 'white' }
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 2px 12px rgba(25, 118, 210, 0.15)',
                      }
                    },
                    '& .MuiInputBase-input': {
                      py: 1.5,
                      fontSize: '0.95rem',
                    },
                    '& .MuiFormLabel-root': {
                      display: 'none',
                    },
                  }}
                />
                {!dateDebut && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute',
                      bottom: -22,
                      left: 14,
                      color: 'text.secondary',
                      opacity: 0.7,
                    }}
                  >
                    Date de début
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={1.5} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 10px rgba(25, 118, 210, 0.3)',
                }}
              >
                À
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ position: 'relative' }}>
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
                        <CalendarTodayIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    endAdornment: dateFin && (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => setDateFin('')}
                          sx={{ 
                            bgcolor: 'error.light',
                            color: 'error.main',
                            '&:hover': { bgcolor: 'error.main', color: 'white' }
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 2px 12px rgba(25, 118, 210, 0.15)',
                      }
                    },
                    '& .MuiInputBase-input': {
                      py: 1.5,
                      fontSize: '0.95rem',
                    },
                    '& .MuiFormLabel-root': {
                      display: 'none',
                    },
                  }}
                />
                {!dateFin && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute',
                      bottom: -22,
                      left: 14,
                      color: 'text.secondary',
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
                  setDateDebut('');
                  setDateFin('');
                }}
                startIcon={<ClearIcon />}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  fontWeight: 600,
                  py: 1.5,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: 'error.light',
                  }
                }}
                disabled={!dateDebut && !dateFin}
              >
                Effacer les dates
              </Button>
            </Grid>
          </Grid>
          
          {/* Indicateur de filtres actifs */}
          {activeFiltersCount > 0 && (
            <Box sx={{ 
              mt: 2, 
              pt: 1.5, 
              borderTop: '1px solid',
              borderColor: 'grey.200',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600,mt:0.35 }}>
                  Filtres actifs :
                </Typography>
                {searchTerm && (
                  <Chip
                    label={`Recherche: "${searchTerm}"`}
                    size="small"
                    onDelete={() => setSearchTerm('')}
                    sx={{ 
                      
                      color: 'primary.main',
                      fontWeight: 500,
                    }}
                  />
                )}
                {dateDebut && (
                  <Chip
                    label={`Du: ${new Date(dateDebut).toLocaleDateString('fr-FR')}`}
                    size="small"
                    onDelete={() => setDateDebut('')}
                    sx={{ 
                      color: 'info.main',
                      fontWeight: 500,
                    }}
                  />
                )}
                {dateFin && (
                  <Chip
                    label={`Au: ${new Date(dateFin).toLocaleDateString('fr-FR')}`}
                    size="small"
                    onDelete={() => setDateFin('')}
                    sx={{ 
                      color: 'info.main',
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
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
      '& .MuiChip-label': { px: 1.5 },
    }}
  />
);

// Composant d'action rapide
const QuickActionButtons = ({ devis, onView, onEdit, onDelete, onViewPdf, onDownloadPdf }) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
    <Tooltip title="Voir détails" arrow>
      <IconButton size="small" onClick={() => onView(devis)} sx={{ color: 'info.main' }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Aperçu PDF" arrow>
      <IconButton size="small" onClick={() => onViewPdf(devis)} sx={{ color: 'error.main' }}>
        <PictureAsPdfIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Télécharger PDF" arrow>
      <IconButton size="small" onClick={() => onDownloadPdf(devis)} sx={{ color: 'success.main' }}>
        <DownloadIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Modifier" arrow>
      <IconButton size="small" onClick={() => onEdit(devis)} sx={{ color: 'warning.main' }}>
        <EditIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Supprimer" arrow>
      <IconButton size="small" color="error" onClick={() => onDelete(devis)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

// Composant principal
export const DevisList = () => {
  const { clients, societies, loadClients } = useAppContext();
  const [devis, setDevis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // États pour l'ajout
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [entityType, setEntityType] = useState("client");
  const [newDevis, setNewDevis] = useState({
    number: "",
    clientId: "",
    societyId: "",
    date: "",
    expirationDate: "",
    description: "",
    amount: "",
    status: "pending",
    comments: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // États pour la modification
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDevis, setEditingDevis] = useState(null);
  const [editEntityType, setEditEntityType] = useState("client");
  const [editFormData, setEditFormData] = useState({
    number: "",
    clientId: "",
    societyId: "",
    date: "",
    expirationDate: "",
    description: "",
    amount: "",
    status: "pending",
    comments: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // États pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDevis, setDeletingDevis] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // États pour le détail
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadDevis = async () => {
    setLoading(true);
    try {
      const response = await api.get("/devis");
      setDevis(response.data || []);
    } catch (error) {
      console.error("Erreur chargement devis", error);
      showSnackbar("Erreur lors du chargement des devis", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevis();
    loadClients();
  }, []);

  const filteredDevis = useMemo(() => {
    return devis.filter((d) => {
      const matchesSearch =
        d.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const dOnly = d.date ? String(d.date).slice(0, 10) : null;
      const matchesDateDebut = !dateDebut || (dOnly && dOnly >= dateDebut);
      const matchesDateFin = !dateFin || (dOnly && dOnly <= dateFin);
      return matchesSearch && matchesDateDebut && matchesDateFin;
    });
  }, [devis, searchTerm, dateDebut, dateFin]);

  const paginatedDevis = useMemo(() => {
    return filteredDevis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredDevis, page, rowsPerPage]);

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // ============================================================
  // AJOUTER UN DEVIS
  // ============================================================
  const handleAddDevis = async () => {
    if (entityType === "client" && !newDevis.clientId) {
      showSnackbar("Veuillez sélectionner un client.", "warning");
      return;
    }
    if (entityType === "society" && !newDevis.societyId) {
      showSnackbar("Veuillez sélectionner une société.", "warning");
      return;
    }

    setAddLoading(true);
    try {
      let clientName = "";
      let clientId = null;
      let societyId = null;

      if (entityType === "client") {
        const selectedClient = clients.find((c) => c.id === newDevis.clientId);
        clientName = selectedClient
          ? `${selectedClient.firstName} ${selectedClient.lastName}`
          : "";
        clientId = newDevis.clientId;
      } else {
        const selectedSociety = societies.find(
          (s) => s.id === newDevis.societyId,
        );
        clientName = selectedSociety ? selectedSociety.name : "";
        societyId = newDevis.societyId;
      }

      const data = {
        ...newDevis,
        amount: parseFloat(newDevis.amount) || 0,
        clientName: clientName,
        clientId: clientId,
        societyId: societyId,
        clientType: entityType,
      };

      const response = await api.post("/devis", data);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/devis/${response.data.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadDevis();
      setAddDialogOpen(false);
      resetNewDevisForm();
      showSnackbar("✅ Devis ajouté avec succès !");
    } catch (error) {
      console.error("Erreur ajout devis", error);
      showSnackbar("❌ Erreur lors de l'ajout du devis", "error");
    } finally {
      setAddLoading(false);
    }
  };

  const resetNewDevisForm = () => {
    setNewDevis({
      number: "",
      clientId: "",
      societyId: "",
      date: "",
      expirationDate: "",
      description: "",
      amount: "",
      status: "pending",
      comments: "",
    });
    setEntityType("client");
    setSelectedFile(null);
  };

  // ============================================================
  // MODIFIER UN DEVIS
  // ============================================================
  const handleOpenEdit = useCallback((devisItem) => {
    setEditingDevis(devisItem);
    const type = devisItem.clientType || "client";
    setEditEntityType(type);

    setEditFormData({
      number: devisItem.number || "",
      clientId: devisItem.clientId || devisItem.client?.id || "",
      societyId: devisItem.societyId || "",
      date: devisItem.date
        ? new Date(devisItem.date).toISOString().split("T")[0]
        : "",
      expirationDate: devisItem.expirationDate
        ? new Date(devisItem.expirationDate).toISOString().split("T")[0]
        : "",
      description: devisItem.description || "",
      amount: devisItem.amount || "",
      status: devisItem.status || "pending",
      comments: devisItem.comments || "",
    });
    setEditFile(null);
    setEditDialogOpen(true);
  }, []);

  const handleEditDevis = async () => {
    if (editEntityType === "client" && !editFormData.clientId) {
      showSnackbar("Veuillez sélectionner un client.", "warning");
      return;
    }
    if (editEntityType === "society" && !editFormData.societyId) {
      showSnackbar("Veuillez sélectionner une société.", "warning");
      return;
    }

    setEditLoading(true);
    try {
      let clientName = "";
      let clientId = null;
      let societyId = null;

      if (editEntityType === "client") {
        const selectedClient = clients.find(
          (c) => c.id === editFormData.clientId,
        );
        clientName = selectedClient
          ? `${selectedClient.firstName} ${selectedClient.lastName}`
          : "";
        clientId = editFormData.clientId;
      } else {
        const selectedSociety = societies.find(
          (s) => s.id === editFormData.societyId,
        );
        clientName = selectedSociety ? selectedSociety.name : "";
        societyId = editFormData.societyId;
      }

      const data = {
        ...editFormData,
        amount: parseFloat(editFormData.amount) || 0,
        clientName: clientName,
        clientId: clientId,
        societyId: societyId,
        clientType: editEntityType,
      };

      await api.put(`/devis/${editingDevis.id}`, data);

      if (editFile) {
        const formData = new FormData();
        formData.append("file", editFile);
        await api.post(`/devis/${editingDevis.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadDevis();
      setEditDialogOpen(false);
      setEditingDevis(null);
      setEditFile(null);
      showSnackbar("✅ Devis modifié avec succès !");
    } catch (error) {
      console.error("Erreur modification devis", error);
      showSnackbar("❌ Erreur lors de la modification du devis", "error");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UN DEVIS
  // ============================================================
  const handleOpenDelete = useCallback((devisItem) => {
    setDeletingDevis(devisItem);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteDevis = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/devis/${deletingDevis.id}`);
      await loadDevis();
      setDeleteDialogOpen(false);
      setDeletingDevis(null);
      showSnackbar("✅ Devis supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression devis", error);
      showSnackbar("❌ Erreur lors de la suppression du devis", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = useCallback((devisItem) => {
    setSelectedDevis(devisItem);
    setDetailDialogOpen(true);
  }, []);

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = useCallback(async (devisItem) => {
    if (!devisItem.pdfUrl) {
      showSnackbar("Aucun PDF attaché à ce devis.", "info");
      return;
    }

    try {
      const success = await viewDevisPdf(devisItem.id);
      if (!success) {
        showSnackbar("❌ Erreur lors de l'ouverture du PDF", "error");
      }
    } catch (error) {
      console.error("Erreur", error);
      showSnackbar("❌ Erreur lors de l'ouverture du PDF", "error");
    }
  }, [showSnackbar]);

  // ============================================================
  // TÉLÉCHARGER LE PDF
  // ============================================================
  const handleDownloadPdf = useCallback(async (devisItem) => {
    if (!devisItem.pdfUrl) {
      showSnackbar("Aucun PDF attaché à ce devis.", "info");
      return;
    }

    try {
      const success = await downloadDevisPdf(devisItem.id, devisItem.fileName);
      if (success) {
        showSnackbar("✅ Téléchargement du PDF démarré !");
      } else {
        showSnackbar("❌ Erreur lors du téléchargement du PDF", "error");
      }
    } catch (error) {
      console.error("Erreur", error);
      showSnackbar("❌ Erreur lors du téléchargement du PDF", "error");
    }
  }, [showSnackbar]);

  // ============================================================
  // OPEN CREATE DIALOG
  // ============================================================
  const handleOpenCreate = useCallback(() => {
    setNewDevis({
      number: "",
      clientId: "",
      societyId: "",
      date: new Date().toISOString().split("T")[0],
      expirationDate: new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split("T")[0],
      description: "",
      amount: "",
      status: "pending",
      comments: "",
    });
    setEntityType("client");
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
          <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DescriptionIcon fontSize="large" color="primary" />
            Devis
            <Chip
              label={`${filteredDevis.length} devis`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez tous vos devis en un seul endroit
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
        filteredCount={filteredDevis.length}
      />

      {/* ============================================================
                TABLEAU
                ============================================================ */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Numéro</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Client / Société</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expiration</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Montant</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDevis.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <DescriptionIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                    <Typography color="text.secondary" variant="h6">
                      Aucun devis trouvé
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Commencez par créer un nouveau devis
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreate}
                      sx={{ mt: 2 }}
                    >
                      Nouveau devis
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDevis.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {d.number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {d.clientType === 'society' ? (
                          <BusinessIcon fontSize="small" color="action" />
                        ) : (
                          <PersonIcon fontSize="small" color="action" />
                        )}
                        {d.clientName ||
                          d.client?.firstName + " " + d.client?.lastName ||
                          "Client inconnu"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={d.clientType === "society" ? "Société" : "Client"}
                        size="small"
                        color={d.clientType === "society" ? "info" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {d.date
                        ? new Date(d.date).toLocaleDateString("fr-FR")
                        : ""}
                    </TableCell>
                    <TableCell>
                      {d.expirationDate
                        ? new Date(d.expirationDate).toLocaleDateString("fr-FR")
                        : ""}
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
                        devis={d}
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
          count={filteredDevis.length}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Nouveau devis</Typography>
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
                placeholder="Ex: DEV-0001"
                value={newDevis.number}
                onChange={(e) =>
                  setNewDevis({ ...newDevis, number: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type d'entité</InputLabel>
                <Select
                  value={entityType}
                  onChange={(e) => {
                    setEntityType(e.target.value);
                    setNewDevis({ ...newDevis, clientId: "", societyId: "" });
                  }}
                  label="Type d'entité"
                >
                  <MenuItem value="client">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      Client (personne physique)
                    </Box>
                  </MenuItem>
                  <MenuItem value="society">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" />
                      Société (personne morale)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>
                  {entityType === "client" ? "Client" : "Société"}
                </InputLabel>
                <Select
                  value={
                    entityType === "client"
                      ? newDevis.clientId
                      : newDevis.societyId
                  }
                  onChange={(e) => {
                    if (entityType === "client") {
                      setNewDevis({ ...newDevis, clientId: e.target.value });
                    } else {
                      setNewDevis({ ...newDevis, societyId: e.target.value });
                    }
                  }}
                  label={entityType === "client" ? "Client" : "Société"}
                >
                  {entityType === "client"
                    ? clients.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}
                        </MenuItem>
                      ))
                    : societies.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
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
                value={newDevis.date}
                onChange={(e) =>
                  setNewDevis({ ...newDevis, date: e.target.value })
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
                label="Date d'expiration"
                type="date"
                fullWidth
                value={newDevis.expirationDate}
                onChange={(e) =>
                  setNewDevis({ ...newDevis, expirationDate: e.target.value })
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
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={newDevis.description}
                onChange={(e) =>
                  setNewDevis({ ...newDevis, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Montant (DT)"
                type="number"
                fullWidth
                value={newDevis.amount}
                onChange={(e) =>
                  setNewDevis({ ...newDevis, amount: e.target.value })
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={newDevis.status}
                  onChange={(e) =>
                    setNewDevis({ ...newDevis, status: e.target.value })
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
            <Grid item xs={12}>
              <TextField
                label="Commentaires"
                fullWidth
                multiline
                rows={2}
                value={newDevis.comments}
                onChange={(e) =>
                  setNewDevis({ ...newDevis, comments: e.target.value })
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
            onClick={handleAddDevis}
            disabled={addLoading}
            startIcon={addLoading ? null : <AddIcon />}
          >
            {addLoading ? "Ajout en cours..." : "Ajouter le devis"}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Modifier le devis</Typography>
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
                      <DescriptionIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type d'entité</InputLabel>
                <Select
                  value={editEntityType}
                  onChange={(e) => {
                    setEditEntityType(e.target.value);
                    setEditFormData({
                      ...editFormData,
                      clientId: "",
                      societyId: "",
                    });
                  }}
                  label="Type d'entité"
                >
                  <MenuItem value="client">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      Client (personne physique)
                    </Box>
                  </MenuItem>
                  <MenuItem value="society">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" />
                      Société (personne morale)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>
                  {editEntityType === "client" ? "Client" : "Société"}
                </InputLabel>
                <Select
                  value={
                    editEntityType === "client"
                      ? editFormData.clientId
                      : editFormData.societyId
                  }
                  onChange={(e) => {
                    if (editEntityType === "client") {
                      setEditFormData({
                        ...editFormData,
                        clientId: e.target.value,
                      });
                    } else {
                      setEditFormData({
                        ...editFormData,
                        societyId: e.target.value,
                      });
                    }
                  }}
                  label={editEntityType === "client" ? "Client" : "Société"}
                >
                  {editEntityType === "client"
                    ? clients.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}
                        </MenuItem>
                      ))
                    : societies.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
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
                label="Date d'expiration"
                type="date"
                fullWidth
                value={editFormData.expirationDate}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    expirationDate: e.target.value,
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
              {editingDevis?.fileName && !editFile && (
                <Chip
                  label={`Actuel: ${editingDevis.fileName}`}
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
            onClick={handleEditDevis}
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
            Êtes-vous sûr de vouloir supprimer le devis{" "}
            <strong>{deletingDevis?.number}</strong> ?
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
            onClick={handleDeleteDevis}
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
        {selectedDevis && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{selectedDevis.number}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Détails du devis
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
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedDevis.clientType === 'society' ? (
                          <BusinessIcon fontSize="small" />
                        ) : (
                          <PersonIcon fontSize="small" />
                        )}
                        Client / Société
                      </Box>
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedDevis.clientName ||
                        selectedDevis.client?.firstName +
                          " " +
                          selectedDevis.client?.lastName ||
                        "Client inconnu"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type
                  </Typography>
                  <Chip
                    label={
                      selectedDevis.clientType === "society"
                        ? "Société"
                        : "Client"
                    }
                    size="small"
                    color={
                      selectedDevis.clientType === "society"
                        ? "info"
                        : "default"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Statut
                  </Typography>
                  <StatusChip status={selectedDevis.status} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevis.date
                      ? new Date(selectedDevis.date).toLocaleDateString("fr-FR", {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : ""}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Date d'expiration
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevis.expirationDate
                      ? new Date(selectedDevis.expirationDate).toLocaleDateString("fr-FR", {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : ""}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedDevis.description || "Aucune description"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      Montant
                    </Typography>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                      {selectedDevis.amount
                        ? `${selectedDevis.amount.toLocaleString()} DT`
                        : "-"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Commentaires
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevis.comments || "Aucun commentaire"}
                  </Typography>
                </Grid>
                {selectedDevis.pdfUrl && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pièce jointe
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedDevis)}
                      sx={{ textTransform: 'none' }}
                    >
                      {selectedDevis.fileName || "document.pdf"}
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};