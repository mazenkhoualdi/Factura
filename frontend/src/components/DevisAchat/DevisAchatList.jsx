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
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import api, {
  viewDevisAchatPdf,
  downloadDevisAchatPdf,
} from "../../api/api";

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
    validated: "#2196f3",
  };
  return map[status] || "#9e9e9e";
};

const emptyForm = {
  number: "",
  supplierName: "",
  date: new Date().toISOString().split("T")[0],
  expirationDate: new Date(Date.now() + 30 * 86400000)
    .toISOString()
    .split("T")[0],
  description: "",
  amount: "",
  status: "pending",
  comments: "",
};

export const DevisAchatList = () => {
  const [devisAchats, setDevisAchats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDevisAchat, setNewDevisAchat] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDevisAchat, setEditingDevisAchat] = useState(null);
  const [editFormData, setEditFormData] = useState(emptyForm);
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDevisAchat, setDeletingDevisAchat] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDevisAchat, setSelectedDevisAchat] = useState(null);

  const loadDevisAchats = async () => {
    setLoading(true);
    try {
      const response = await api.get("/devis-achats");
      setDevisAchats(response.data || []);
    } catch (error) {
      console.error("Erreur chargement devis achats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevisAchats();
  }, []);

  const filteredDevisAchats = devisAchats.filter(
    (d) =>
      d.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ============================================================
  // AJOUTER
  // ============================================================
  const handleAddDevisAchat = async () => {
    setAddLoading(true);
    try {
      const data = {
        ...newDevisAchat,
        amount: parseFloat(newDevisAchat.amount) || 0,
      };
      const response = await api.post("/devis-achats", data);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/devis-achats/${response.data.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadDevisAchats();
      setAddDialogOpen(false);
      setNewDevisAchat(emptyForm);
      setSelectedFile(null);
      alert("✅ Devis d'achat ajouté avec succès !");
    } catch (error) {
      console.error("Erreur ajout devis achat", error);
      alert("❌ Erreur lors de l'ajout du devis d'achat");
    } finally {
      setAddLoading(false);
    }
  };

  // ============================================================
  // MODIFIER
  // ============================================================
  const handleOpenEdit = (item) => {
    setEditingDevisAchat(item);
    setEditFormData({
      number: item.number || "",
      supplierName: item.supplierName || "",
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      expirationDate: item.expirationDate
        ? new Date(item.expirationDate).toISOString().split("T")[0]
        : "",
      description: item.description || "",
      amount: item.amount || "",
      status: item.status || "pending",
      comments: item.comments || "",
    });
    setEditFile(null);
    setEditDialogOpen(true);
  };

  const handleEditDevisAchat = async () => {
    setEditLoading(true);
    try {
      const data = {
        ...editFormData,
        amount: parseFloat(editFormData.amount) || 0,
      };
      await api.put(`/devis-achats/${editingDevisAchat.id}`, data);

      if (editFile) {
        const formData = new FormData();
        formData.append("file", editFile);
        await api.post(`/devis-achats/${editingDevisAchat.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadDevisAchats();
      setEditDialogOpen(false);
      setEditingDevisAchat(null);
      setEditFile(null);
      alert("✅ Devis d'achat modifié avec succès !");
    } catch (error) {
      console.error("Erreur modification devis achat", error);
      alert("❌ Erreur lors de la modification du devis d'achat");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER
  // ============================================================
  const handleOpenDelete = (item) => {
    setDeletingDevisAchat(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDevisAchat = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/devis-achats/${deletingDevisAchat.id}`);
      await loadDevisAchats();
      setDeleteDialogOpen(false);
      setDeletingDevisAchat(null);
      alert("✅ Devis d'achat supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression devis achat", error);
      alert("❌ Erreur lors de la suppression du devis d'achat");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewDetail = (item) => {
    setSelectedDevisAchat(item);
    setDetailDialogOpen(true);
  };

  const handleViewPdf = async (item) => {
    if (!item.pdfUrl) {
      alert("Aucun PDF attaché à ce devis d'achat.");
      return;
    }
    try {
      const success = await viewDevisAchatPdf(item.id);
      if (!success) alert("❌ Erreur lors de l'ouverture du PDF");
    } catch (error) {
      console.error("Erreur", error);
      alert("❌ Erreur lors de l'ouverture du PDF");
    }
  };

  const handleDownloadPdf = async (item) => {
    if (!item.pdfUrl) {
      alert("Aucun PDF attaché à ce devis d'achat.");
      return;
    }
    try {
      const success = await downloadDevisAchatPdf(item.id, item.fileName);
      if (!success) alert("❌ Erreur lors du téléchargement du PDF");
    } catch (error) {
      console.error("Erreur", error);
      alert("❌ Erreur lors du téléchargement du PDF");
    }
  };

  const handleOpenCreate = () => {
    setNewDevisAchat(emptyForm);
    setSelectedFile(null);
    setAddDialogOpen(true);
  };

  return (
    <Box>
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
          Devis d'achat
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher un devis d'achat..."
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
            Nouveau devis d'achat
          </Button>
        </Box>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>Fournisseur</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevisAchats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      Aucun devis d'achat trouvé.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevisAchats.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.number}</TableCell>
                    <TableCell>{d.supplierName}</TableCell>
                    <TableCell>
                      {d.date
                        ? new Date(d.date).toLocaleDateString("fr-FR")
                        : ""}
                    </TableCell>
                    <TableCell>{d.description}</TableCell>
                    <TableCell>
                      {d.amount ? `${d.amount.toLocaleString()} DT` : ""}
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

      {/* AJOUT */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nouveau devis d'achat</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro"
                fullWidth
                required
                placeholder="Ex: DEVA-0001"
                value={newDevisAchat.number}
                onChange={(e) =>
                  setNewDevisAchat({
                    ...newDevisAchat,
                    number: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fournisseur"
                fullWidth
                required
                value={newDevisAchat.supplierName}
                onChange={(e) =>
                  setNewDevisAchat({
                    ...newDevisAchat,
                    supplierName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={newDevisAchat.date}
                onChange={(e) =>
                  setNewDevisAchat({ ...newDevisAchat, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date d'expiration"
                type="date"
                fullWidth
                value={newDevisAchat.expirationDate}
                onChange={(e) =>
                  setNewDevisAchat({
                    ...newDevisAchat,
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
                value={newDevisAchat.description}
                onChange={(e) =>
                  setNewDevisAchat({
                    ...newDevisAchat,
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
                value={newDevisAchat.amount}
                onChange={(e) =>
                  setNewDevisAchat({
                    ...newDevisAchat,
                    amount: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={newDevisAchat.status}
                  onChange={(e) =>
                    setNewDevisAchat({
                      ...newDevisAchat,
                      status: e.target.value,
                    })
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
                value={newDevisAchat.comments}
                onChange={(e) =>
                  setNewDevisAchat({
                    ...newDevisAchat,
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
            onClick={handleAddDevisAchat}
            disabled={addLoading}
          >
            {addLoading ? "Ajout..." : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODIFICATION */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Modifier le devis d'achat</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Numéro" fullWidth value={editFormData.number} disabled />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fournisseur"
                fullWidth
                value={editFormData.supplierName}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    supplierName: e.target.value,
                  })
                }
              />
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
                label="Montant (DT)"
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
              {editingDevisAchat?.fileName && !editFile && (
                <Chip
                  label={`Actuel: ${editingDevisAchat.fileName}`}
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
            onClick={handleEditDevisAchat}
            disabled={editLoading}
          >
            {editLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUPPRESSION */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le devis d'achat{" "}
            <strong>{deletingDevisAchat?.number}</strong> ?
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
            onClick={handleDeleteDevisAchat}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DÉTAIL */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedDevisAchat && (
          <>
            <DialogTitle>
              {selectedDevisAchat.number}
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
                    Fournisseur
                  </Typography>
                  <Typography>{selectedDevisAchat.supplierName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography>
                    {selectedDevisAchat.date
                      ? new Date(selectedDevisAchat.date).toLocaleDateString(
                          "fr-FR",
                        )
                      : ""}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Montant
                  </Typography>
                  <Typography>
                    {selectedDevisAchat.amount
                      ? `${selectedDevisAchat.amount.toLocaleString()} DT`
                      : "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography>
                    {selectedDevisAchat.description || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Statut
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedDevisAchat.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedDevisAchat.status) + "20",
                      color: getStatusColor(selectedDevisAchat.status),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Commentaires
                  </Typography>
                  <Typography>
                    {selectedDevisAchat.comments || "Aucun"}
                  </Typography>
                </Grid>
                {selectedDevisAchat.pdfUrl && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Pièce jointe
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedDevisAchat)}
                    >
                      {selectedDevisAchat.fileName || "document.pdf"}
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
