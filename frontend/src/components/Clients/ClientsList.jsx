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
  Paper,
  Avatar,
  Fade,
  Zoom,
  Snackbar,
  Alert,
  Skeleton,
  InputAdornment,
  useTheme,
  alpha,
  Divider,
  Stack,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import ReceiptIcon from "@mui/icons-material/Receipt";
import NoteIcon from "@mui/icons-material/Note";
import api, { viewClientPdf, downloadClientPdf } from "../../api/api";

export const ClientsList = () => {
  const theme = useTheme();
  const { clients, loadClients } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // États pour l'ajout
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    fiscalId: "",
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // États pour la modification
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    fiscalId: "",
    notes: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // États pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // États pour le détail
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // États pour les notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
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
  // AJOUTER UN CLIENT
  // ============================================================
  const handleAddClient = async () => {
    if (!newClient.firstName || !newClient.lastName) {
      showNotification("Veuillez remplir le nom et le prénom.", "warning");
      return;
    }

    setAddLoading(true);
    try {
      const response = await api.post("/clients", newClient);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/clients/${response.data.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadClients();
      setAddDialogOpen(false);
      setNewClient({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        fiscalId: "",
        notes: "",
      });
      setSelectedFile(null);
      showNotification("Client ajouté avec succès !");
    } catch (error) {
      console.error("Erreur ajout client", error);
      showNotification("Erreur lors de l'ajout du client", "error");
    } finally {
      setAddLoading(false);
    }
  };

  // ============================================================
  // MODIFIER UN CLIENT
  // ============================================================
  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setEditFormData({
      firstName: client.firstName || "",
      lastName: client.lastName || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      fiscalId: client.fiscalId || "",
      notes: client.notes || "",
    });
    setEditFile(null);
    setEditDialogOpen(true);
  };

  const handleEditClient = async () => {
    if (!editFormData.firstName || !editFormData.lastName) {
      showNotification("Veuillez remplir le nom et le prénom.", "warning");
      return;
    }

    setEditLoading(true);
    try {
      await api.put(`/clients/${editingClient.id}`, editFormData);

      if (editFile) {
        const formData = new FormData();
        formData.append("file", editFile);
        await api.post(`/clients/${editingClient.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadClients();
      setEditDialogOpen(false);
      setEditingClient(null);
      setEditFile(null);
      showNotification("Client modifié avec succès !");
    } catch (error) {
      console.error("Erreur modification client", error);
      showNotification("Erreur lors de la modification du client", "error");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UN CLIENT
  // ============================================================
  const handleOpenDelete = (client) => {
    setDeletingClient(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClient = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/clients/${deletingClient.id}`);
      await loadClients();
      setDeleteDialogOpen(false);
      setDeletingClient(null);
      showNotification("Client supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression client", error);
      showNotification("Erreur lors de la suppression du client", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = (client) => {
    setSelectedClient(client);
    setDetailDialogOpen(true);
  };

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = async (client) => {
    if (!client.pdfUrl) {
      showNotification("Aucun PDF attaché à ce client.", "info");
      return;
    }

    try {
      const success = await viewClientPdf(client.id);
      if (!success) {
        showNotification("Erreur lors de l'ouverture du PDF", "error");
      }
    } catch (error) {
      console.error("Erreur", error);
      showNotification("Erreur lors de l'ouverture du PDF", "error");
    }
  };

  // ============================================================
  // TÉLÉCHARGER LE PDF
  // ============================================================
  const handleDownloadPdf = async (client) => {
    if (!client.pdfUrl) {
      showNotification("Aucun PDF attaché à ce client.", "info");
      return;
    }

    try {
      const success = await downloadClientPdf(client.id, client.fileName);
      if (success) {
        showNotification("Téléchargement du PDF démarré !");
      } else {
        showNotification("Erreur lors du téléchargement du PDF", "error");
      }
    } catch (error) {
      console.error("Erreur", error);
      showNotification("Erreur lors du téléchargement du PDF", "error");
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
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
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Clients
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredClients.length} client
              {filteredClients.length > 1 ? "s" : ""} trouvé
              {filteredClients.length > 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1 }}>
          <TextField
            size="small"
            placeholder="Rechercher un client..."
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
            Nouveau client
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
                <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Matricule fiscal</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.length === 0 ? (
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
                      <PersonIcon
                        sx={{ fontSize: 48, color: "text.disabled" }}
                      />
                      <Typography color="text.secondary" variant="body1">
                        Aucun client trouvé
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setAddDialogOpen(true)}
                        sx={{ textTransform: "none" }}
                      >
                        Ajouter un client
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client, index) => (
                  <TableRow
                    key={client.id}
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
                          {client.firstName?.[0]}
                          {client.lastName?.[0]}
                        </Avatar>
                        <Typography fontWeight={500}>
                          {`${client.firstName} ${client.lastName}`}
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
                          {client.email || "-"}
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
                          {client.phone || "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client.fiscalId || "Non renseigné"}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          borderColor: client.fiscalId
                            ? alpha(theme.palette.success.main, 0.3)
                            : alpha(theme.palette.grey[500], 0.3),
                          color: client.fiscalId
                            ? theme.palette.success.main
                            : theme.palette.text.secondary,
                        }}
                      />
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
                            onClick={() => handleViewDetail(client)}
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
                            onClick={() => handleViewPdf(client)}
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
                            onClick={() => handleDownloadPdf(client)}
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
                            onClick={() => handleOpenEdit(client)}
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
                            onClick={() => handleOpenDelete(client)}
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
              Nouveau client
            </Typography>
            <IconButton onClick={() => setAddDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Prénom"
                fullWidth
                value={newClient.firstName}
                onChange={(e) =>
                  setNewClient({ ...newClient, firstName: e.target.value })
                }
                required
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
                label="Nom"
                fullWidth
                value={newClient.lastName}
                onChange={(e) =>
                  setNewClient({ ...newClient, lastName: e.target.value })
                }
                required
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
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
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
                value={newClient.phone}
                onChange={(e) =>
                  setNewClient({ ...newClient, phone: e.target.value })
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
            <Grid item xs={12}>
              <TextField
                label="Adresse"
                fullWidth
                multiline
                rows={2}
                value={newClient.address}
                onChange={(e) =>
                  setNewClient({ ...newClient, address: e.target.value })
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Matricule fiscal"
                fullWidth
                value={newClient.fiscalId}
                onChange={(e) =>
                  setNewClient({ ...newClient, fiscalId: e.target.value })
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
                label="Observations"
                fullWidth
                multiline
                rows={2}
                value={newClient.notes}
                onChange={(e) =>
                  setNewClient({ ...newClient, notes: e.target.value })
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
            onClick={handleAddClient}
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
              Modifier le client
            </Typography>
            <IconButton onClick={() => setEditDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Prénom"
                fullWidth
                value={editFormData.firstName}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    firstName: e.target.value,
                  })
                }
                required
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
                label="Nom"
                fullWidth
                value={editFormData.lastName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, lastName: e.target.value })
                }
                required
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
                {editingClient?.fileName && !editFile && (
                  <Chip
                    label={`Actuel: ${editingClient.fileName}`}
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
            onClick={handleEditClient}
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
              Êtes-vous sûr de vouloir supprimer le client{" "}
              <strong>
                {deletingClient?.firstName} {deletingClient?.lastName}
              </strong>
              ?
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
            onClick={handleDeleteClient}
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
        {selectedClient && (
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
                    {selectedClient.firstName?.[0]}
                    {selectedClient.lastName?.[0]}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {`${selectedClient.firstName} ${selectedClient.lastName}`}
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
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedClient.email || "-"}
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
                      {selectedClient.phone || "-"}
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
                      {selectedClient.address || "-"}
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
                      Matricule fiscal
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedClient.fiscalId || "-"}
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
                      {selectedClient.notes || "Aucune observation"}
                    </Typography>
                  </Box>
                </Grid>
                {selectedClient.pdfUrl && (
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
                          onClick={() => handleViewPdf(selectedClient)}
                          sx={{ textTransform: "none" }}
                        >
                          {selectedClient.fileName || "document.pdf"}
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
