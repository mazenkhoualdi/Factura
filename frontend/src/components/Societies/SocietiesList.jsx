import React, { useState, useEffect } from "react";
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
  Avatar,
  Fade,
  Zoom,
  Snackbar,
  Alert,
  InputAdornment,
  useTheme,
  alpha,
  Divider,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ReceiptIcon from "@mui/icons-material/Receipt";
import NoteIcon from "@mui/icons-material/Note";
import StorefrontIcon from "@mui/icons-material/Storefront";
import api from "../../api/api";

export const SocietiesList = () => {
  const theme = useTheme();
  const [societies, setSocieties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // États pour l'ajout
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSociete, setNewSociete] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    fiscalId: "",
    registryNumber: "",
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // États pour la modification
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSociete, setEditingSociete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    fiscalId: "",
    registryNumber: "",
    notes: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // États pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSociete, setDeletingSociete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // États pour le détail
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSociete, setSelectedSociete] = useState(null);

  // États pour les notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadSocietes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/societes");
      setSocieties(response.data || []);
    } catch (error) {
      console.error("Erreur chargement sociétés", error);
      showNotification("Erreur lors du chargement des sociétés", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocietes();
  }, []);

  const filteredSocietes = societies.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // ============================================================
  // AJOUTER UNE SOCIÉTÉ
  // ============================================================
  const handleAddSociete = async () => {
    if (!newSociete.name) {
      showNotification("Veuillez remplir le nom de la société.", "warning");
      return;
    }

    setAddLoading(true);
    try {
      const response = await api.post("/societes", newSociete);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/societes/${response.data.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadSocietes();
      setAddDialogOpen(false);
      setNewSociete({
        name: "",
        contactName: "",
        email: "",
        phone: "",
        address: "",
        fiscalId: "",
        registryNumber: "",
        notes: "",
      });
      setSelectedFile(null);
      showNotification("Société ajoutée avec succès !");
    } catch (error) {
      console.error("Erreur ajout société", error);
      showNotification("Erreur lors de l'ajout de la société", "error");
    } finally {
      setAddLoading(false);
    }
  };

  // ============================================================
  // MODIFIER UNE SOCIÉTÉ
  // ============================================================
  const handleOpenEdit = (societe) => {
    setEditingSociete(societe);
    setEditFormData({
      name: societe.name || "",
      contactName: societe.contactName || "",
      email: societe.email || "",
      phone: societe.phone || "",
      address: societe.address || "",
      fiscalId: societe.fiscalId || "",
      registryNumber: societe.registryNumber || "",
      notes: societe.notes || "",
    });
    setEditFile(null);
    setEditDialogOpen(true);
  };

  const handleEditSociete = async () => {
    if (!editFormData.name) {
      showNotification("Veuillez remplir le nom de la société.", "warning");
      return;
    }

    setEditLoading(true);
    try {
      await api.put(`/societes/${editingSociete.id}`, editFormData);

      if (editFile) {
        const formData = new FormData();
        formData.append("file", editFile);
        await api.post(`/societes/${editingSociete.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadSocietes();
      setEditDialogOpen(false);
      setEditingSociete(null);
      setEditFile(null);
      showNotification("Société modifiée avec succès !");
    } catch (error) {
      console.error("Erreur modification société", error);
      showNotification("Erreur lors de la modification de la société", "error");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UNE SOCIÉTÉ
  // ============================================================
  const handleOpenDelete = (societe) => {
    setDeletingSociete(societe);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSociete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/societes/${deletingSociete.id}`);
      await loadSocietes();
      setDeleteDialogOpen(false);
      setDeletingSociete(null);
      showNotification("Société supprimée avec succès !");
    } catch (error) {
      console.error("Erreur suppression société", error);
      showNotification("Erreur lors de la suppression de la société", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = (societe) => {
    setSelectedSociete(societe);
    setDetailDialogOpen(true);
  };

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = async (societe) => {
    if (!societe.pdfUrl) {
      showNotification("Aucun PDF attaché à cette société.", "info");
      return;
    }

    try {
      const response = await api.get(`/societes/${societe.id}/pdf/view`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Erreur visualisation PDF", error);
      showNotification("Erreur lors de l'ouverture du PDF", "error");
    }
  };

  // ============================================================
  // TÉLÉCHARGER LE PDF
  // ============================================================
  const handleDownloadPdf = async (societe) => {
    if (!societe.pdfUrl) {
      showNotification("Aucun PDF attaché à cette société.", "info");
      return;
    }

    try {
      const response = await api.get(`/societes/${societe.id}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", societe.fileName || "document.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showNotification("Téléchargement du PDF démarré !");
    } catch (error) {
      console.error("Erreur téléchargement PDF", error);
      showNotification("Erreur lors du téléchargement du PDF", "error");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* ============================================================
                EN-TÊTE
                ============================================================ */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 48,
              height: 48,
            }}
          >
            <BusinessIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Sociétés
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredSocietes.length} société
              {filteredSocietes.length > 1 ? "s" : ""} identifiée
              {filteredSocietes.length > 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1 }}>
          <TextField
            size="small"
            placeholder="Rechercher une société..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: "100%", sm: 250 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              boxShadow: theme.shadows[2],
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            Nouvelle société
          </Button>
        </Stack>
      </Box>

      {/* ============================================================
                TABLEAU
                ============================================================ */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}
              >
                <TableCell sx={{ fontWeight: 600 }}>Raison sociale</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Téléphone</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSocietes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <BusinessIcon
                        sx={{ fontSize: 48, color: "text.disabled" }}
                      />
                      <Typography color="text.secondary" variant="body1">
                        Aucune société trouvée
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setAddDialogOpen(true)}
                        sx={{ textTransform: "none" }}
                      >
                        Ajouter une société
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSocietes.map((societe) => (
                  <TableRow
                    key={societe.id}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {societe.name?.charAt(0).toUpperCase() || "S"}
                        </Avatar>
                        <Typography fontWeight={500}>{societe.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PersonIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {societe.contactName || "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <EmailIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {societe.email || "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PhoneIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {societe.phone || "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Voir détails" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetail(societe)}
                            sx={{
                              color: theme.palette.info.main,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Aperçu PDF" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleViewPdf(societe)}
                            sx={{
                              color: theme.palette.error.main,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <PictureAsPdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Télécharger PDF" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadPdf(societe)}
                            sx={{
                              color: theme.palette.success.main,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                              },
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(societe)}
                            sx={{
                              color: theme.palette.warning.main,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer" arrow>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDelete(societe)}
                            sx={{
                              "&:hover": {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ============================================================
                DIALOGUE D'AJOUT
                ============================================================ */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Nouvelle société
            </Typography>
            <IconButton onClick={() => setAddDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="Raison sociale"
                fullWidth
                value={newSociete.name}
                onChange={(e) =>
                  setNewSociete({ ...newSociete, name: e.target.value })
                }
                required
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StorefrontIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Responsable"
                fullWidth
                value={newSociete.contactName}
                onChange={(e) =>
                  setNewSociete({ ...newSociete, contactName: e.target.value })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={newSociete.email}
                onChange={(e) =>
                  setNewSociete({ ...newSociete, email: e.target.value })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Téléphone"
                fullWidth
                value={newSociete.phone}
                onChange={(e) =>
                  setNewSociete({ ...newSociete, phone: e.target.value })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Matricule fiscal"
                fullWidth
                value={newSociete.fiscalId}
                onChange={(e) =>
                  setNewSociete({ ...newSociete, fiscalId: e.target.value })
                }
                size="medium"
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
              <TextField
                label="Registre de commerce"
                fullWidth
                value={newSociete.registryNumber}
                onChange={(e) =>
                  setNewSociete({
                    ...newSociete,
                    registryNumber: e.target.value,
                  })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Adresse"
                fullWidth
                multiline
                rows={2}
                value={newSociete.address}
                onChange={(e) =>
                  setNewSociete({ ...newSociete, address: e.target.value })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Observations"
                fullWidth
                multiline
                rows={2}
                value={newSociete.notes}
                onChange={(e) =>
                  setNewSociete({ ...newSociete, notes: e.target.value })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NoteIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  border: `2px dashed ${alpha(theme.palette.divider, 0.5)}`,
                  borderRadius: 2,
                  textAlign: "center",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  sx={{ textTransform: "none" }}
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
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setAddDialogOpen(false)}
            disabled={addLoading}
            sx={{ textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleAddSociete}
            disabled={addLoading}
            sx={{
              textTransform: "none",
              px: 4,
              borderRadius: 2,
            }}
          >
            {addLoading ? "Ajout en cours..." : "Ajouter"}
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
        TransitionComponent={Zoom}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Modifier la société
            </Typography>
            <IconButton onClick={() => setEditDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="Raison sociale"
                fullWidth
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StorefrontIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Responsable"
                fullWidth
                value={editFormData.contactName}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    contactName: e.target.value,
                  })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Téléphone"
                fullWidth
                value={editFormData.phone}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Matricule fiscal"
                fullWidth
                value={editFormData.fiscalId}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fiscalId: e.target.value })
                }
                size="medium"
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
              <TextField
                label="Registre de commerce"
                fullWidth
                value={editFormData.registryNumber}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    registryNumber: e.target.value,
                  })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Adresse"
                fullWidth
                multiline
                rows={2}
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Observations"
                fullWidth
                multiline
                rows={2}
                value={editFormData.notes}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, notes: e.target.value })
                }
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NoteIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  border: `2px dashed ${alpha(theme.palette.divider, 0.5)}`,
                  borderRadius: 2,
                  textAlign: "center",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  sx={{ textTransform: "none" }}
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
                {editingSociete?.fileName && !editFile && (
                  <Chip
                    label={`Actuel: ${editingSociete.fileName}`}
                    sx={{ ml: 1 }}
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={editLoading}
            sx={{ textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSociete}
            disabled={editLoading}
            sx={{
              textTransform: "none",
              px: 4,
              borderRadius: 2,
            }}
          >
            {editLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
                DIALOGUE DE SUPPRESSION
                ============================================================ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        TransitionComponent={Zoom}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Confirmer la suppression
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                mx: "auto",
                mb: 2,
              }}
            >
              <DeleteIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="body1" gutterBottom>
              Êtes-vous sûr de vouloir supprimer la société{" "}
              <strong>{deletingSociete?.name}</strong> ?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cette action est irréversible.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
            sx={{ textTransform: "none", minWidth: 100 }}
          >
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteSociete}
            disabled={deleteLoading}
            sx={{ textTransform: "none", minWidth: 100, borderRadius: 2 }}
          >
            {deleteLoading ? "Suppression..." : "Supprimer"}
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
        TransitionComponent={Zoom}
      >
        {selectedSociete && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    {selectedSociete.name?.charAt(0).toUpperCase() || "S"}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedSociete.name}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setDetailDialogOpen(false)}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Responsable
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedSociete.contactName || "-"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedSociete.email || "-"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Téléphone
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedSociete.phone || "-"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Adresse
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedSociete.address || "-"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Matricule fiscal
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedSociete.fiscalId || "-"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Registre de commerce
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedSociete.registryNumber || "-"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Observations
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedSociete.notes || "Aucune observation"}
                    </Typography>
                  </Box>
                </Grid>
                {selectedSociete.pdfUrl && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Pièce jointe
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PictureAsPdfIcon />}
                          onClick={() => handleViewPdf(selectedSociete)}
                          sx={{ textTransform: "none" }}
                        >
                          {selectedSociete.fileName || "document.pdf"}
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={() => setDetailDialogOpen(false)}
                variant="contained"
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ============================================================
                SNACKBAR DE NOTIFICATION
                ============================================================ */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: theme.shadows[4],
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
