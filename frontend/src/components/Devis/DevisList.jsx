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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import api, { viewDevisPdf, downloadDevisPdf } from "../../api/api";

const getStatusLabel = (status) => {
  const map = {
    pending: "En attente",
    accepted: "Accepté",
    refused: "Refusé",
    validated: "Validé",
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const map = {
    pending: "#ff9800",
    accepted: "#4caf50",
    refused: "#f44336",
    validated: "#4caf50",
  };
  return map[status] || "#9e9e9e";
};

export const DevisList = () => {
  const { clients, societies, loadClients } = useAppContext();
  const [devis, setDevis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // États pour l'ajout
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [entityType, setEntityType] = useState("client"); // 'client' ou 'society'
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

  const loadDevis = async () => {
    setLoading(true);
    try {
      const response = await api.get("/devis");
      setDevis(response.data || []);
    } catch (error) {
      console.error("Erreur chargement devis", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevis();
    loadClients();
  }, []);

  const filteredDevis = devis.filter(
    (d) =>
      d.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ============================================================
  // AJOUTER UN DEVIS
  // ============================================================
  const handleAddDevis = async () => {
    // Vérifier si un client ou une société est sélectionné
    if (entityType === "client" && !newDevis.clientId) {
      alert("Veuillez sélectionner un client.");
      return;
    }
    if (entityType === "society" && !newDevis.societyId) {
      alert("Veuillez sélectionner une société.");
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
      alert("✅ Devis ajouté avec succès !");
    } catch (error) {
      console.error("Erreur ajout devis", error);
      alert("❌ Erreur lors de l'ajout du devis");
    } finally {
      setAddLoading(false);
    }
  };

  // ============================================================
  // MODIFIER UN DEVIS
  // ============================================================
  const handleOpenEdit = (devisItem) => {
    setEditingDevis(devisItem);

    // Déterminer le type d'entité
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
  };

  const handleEditDevis = async () => {
    // Vérifier si un client ou une société est sélectionné
    if (editEntityType === "client" && !editFormData.clientId) {
      alert("Veuillez sélectionner un client.");
      return;
    }
    if (editEntityType === "society" && !editFormData.societyId) {
      alert("Veuillez sélectionner une société.");
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
      alert("✅ Devis modifié avec succès !");
    } catch (error) {
      console.error("Erreur modification devis", error);
      alert("❌ Erreur lors de la modification du devis");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UN DEVIS
  // ============================================================
  const handleOpenDelete = (devisItem) => {
    setDeletingDevis(devisItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDevis = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/devis/${deletingDevis.id}`);
      await loadDevis();
      setDeleteDialogOpen(false);
      setDeletingDevis(null);
      alert("✅ Devis supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression devis", error);
      alert("❌ Erreur lors de la suppression du devis");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = (devisItem) => {
    setSelectedDevis(devisItem);
    setDetailDialogOpen(true);
  };

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = async (devisItem) => {
    if (!devisItem.pdfUrl) {
      alert("Aucun PDF attaché à ce devis.");
      return;
    }

    try {
      const success = await viewDevisPdf(devisItem.id);
      if (!success) {
        alert("❌ Erreur lors de l'ouverture du PDF");
      }
    } catch (error) {
      console.error("Erreur", error);
      alert("❌ Erreur lors de l'ouverture du PDF");
    }
  };

  // ============================================================
  // TÉLÉCHARGER LE PDF
  // ============================================================
  const handleDownloadPdf = async (devisItem) => {
    if (!devisItem.pdfUrl) {
      alert("Aucun PDF attaché à ce devis.");
      return;
    }

    try {
      const success = await downloadDevisPdf(devisItem.id, devisItem.fileName);
      if (success) {
        alert("✅ Téléchargement du PDF démarré !");
      } else {
        alert("❌ Erreur lors du téléchargement du PDF");
      }
    } catch (error) {
      console.error("Erreur", error);
      alert("❌ Erreur lors du téléchargement du PDF");
    }
  };

  // ============================================================
  // OPEN CREATE DIALOG
  // ============================================================
  const handleOpenCreate = () => {
    setNewDevis({
      number: `DEV-${String(devis.length + 1).padStart(4, "0")}`,
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
  };

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
        <Typography variant="h4" fontWeight={700}>
          Devis
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher un devis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Nouveau devis
          </Button>
        </Box>
      </Box>

      {/* ============================================================
                TABLEAU
                ============================================================ */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>Client / Société</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Expiration</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevis.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">
                      Aucun devis trouvé.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevis.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.number}</TableCell>
                    <TableCell>
                      {d.clientName ||
                        d.client?.firstName + " " + d.client?.lastName ||
                        "Client inconnu"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          d.clientType === "society" ? "Société" : "Client"
                        }
                        size="small"
                        color={d.clientType === "society" ? "info" : "default"}
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
                    <TableCell>
                      {d.amount ? `${d.amount.toLocaleString()} €` : ""}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(d.status)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(d.status) + "20",
                          color: getStatusColor(d.status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir détails">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(d)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Aperçu PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleViewPdf(d)}
                        >
                          <PictureAsPdfIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Télécharger PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadPdf(d)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(d)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDelete(d)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
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
      >
        <DialogTitle>Nouveau devis</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro"
                fullWidth
                value={newDevis.number}
                disabled
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
                  <MenuItem value="client">Client (personne physique)</MenuItem>
                  <MenuItem value="society">Société (personne morale)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
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
                label="Montant (€)"
                type="number"
                fullWidth
                value={newDevis.amount}
                onChange={(e) =>
                  setNewDevis({ ...newDevis, amount: e.target.value })
                }
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
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="accepted">Accepté</MenuItem>
                  <MenuItem value="refused">Refusé</MenuItem>
                  <MenuItem value="validated">Validé</MenuItem>
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
                <Chip label={selectedFile.name} sx={{ ml: 1 }} />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={addLoading}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDevis}
            disabled={addLoading}
          >
            {addLoading ? "Ajout..." : "Ajouter"}
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
      >
        <DialogTitle>Modifier le devis</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro"
                fullWidth
                value={editFormData.number}
                disabled
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
                  <MenuItem value="client">Client (personne physique)</MenuItem>
                  <MenuItem value="society">Société (personne morale)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
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
                label="Montant (€)"
                type="number"
                fullWidth
                value={editFormData.amount}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, amount: e.target.value })
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
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="accepted">Accepté</MenuItem>
                  <MenuItem value="refused">Refusé</MenuItem>
                  <MenuItem value="validated">Validé</MenuItem>
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
              {editFile && <Chip label={editFile.name} sx={{ ml: 1 }} />}
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
        <DialogActions>
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
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le devis{" "}
            <strong>{deletingDevis?.number}</strong> ?
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
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
      >
        {selectedDevis && (
          <>
            <DialogTitle>
              {selectedDevis.number}
              <IconButton
                onClick={() => setDetailDialogOpen(false)}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Client / Société
                  </Typography>
                  <Typography>
                    {selectedDevis.clientName ||
                      selectedDevis.client?.firstName +
                        " " +
                        selectedDevis.client?.lastName ||
                      "Client inconnu"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
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
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography>
                    {selectedDevis.date
                      ? new Date(selectedDevis.date).toLocaleDateString("fr-FR")
                      : ""}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date d'expiration
                  </Typography>
                  <Typography>
                    {selectedDevis.expirationDate
                      ? new Date(
                          selectedDevis.expirationDate,
                        ).toLocaleDateString("fr-FR")
                      : ""}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography>{selectedDevis.description || "-"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Montant
                  </Typography>
                  <Typography>
                    {selectedDevis.amount
                      ? `${selectedDevis.amount.toLocaleString()} €`
                      : "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Statut
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedDevis.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedDevis.status) + "20",
                      color: getStatusColor(selectedDevis.status),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Commentaires
                  </Typography>
                  <Typography>{selectedDevis.comments || "Aucun"}</Typography>
                </Grid>
                {selectedDevis.pdfUrl && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Pièce jointe
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedDevis)}
                    >
                      {selectedDevis.fileName || "document.pdf"}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
