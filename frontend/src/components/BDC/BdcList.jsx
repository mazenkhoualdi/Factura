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
import api, { viewBdcPdf, downloadBdcPdf } from "../../api/api";

const getStatusLabel = (status) => {
  const map = {
    preparing: "En préparation",
    validated: "Validé",
    cancelled: "Annulé",
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const map = {
    preparing: "#ff9800",
    validated: "#4caf50",
    cancelled: "#f44336",
  };
  return map[status] || "#9e9e9e";
};

export const BdcList = () => {
  const [bdc, setBdc] = useState([]);
  const [devisList, setDevisList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

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

  const loadBdc = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bdc");
      setBdc(response.data || []);
    } catch (error) {
      console.error("Erreur chargement BDC", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDevis = async () => {
    try {
      const response = await api.get("/devis");
      setDevisList(response.data || []);
    } catch (error) {
      console.error("Erreur chargement devis", error);
    }
  };

  useEffect(() => {
    loadBdc();
    loadDevis();
  }, []);

  const filteredBdc = bdc.filter(
    (d) =>
      d.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.devisNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ============================================================
  // AJOUTER UN BDC
  // ============================================================
  const handleAddBdc = async () => {
    if (!newBdc.devisId) {
      alert("Veuillez sélectionner un devis.");
      return;
    }

    setAddLoading(true);
    try {
      const data = {
        ...newBdc,
        amount: parseFloat(newBdc.amount) || 0,
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
      alert("✅ BDC ajouté avec succès !");
    } catch (error) {
      console.error("Erreur ajout BDC", error);
      alert("❌ Erreur lors de l'ajout du BDC");
    } finally {
      setAddLoading(false);
    }
  };

  // ============================================================
  // MODIFIER UN BDC
  // ============================================================
  const handleOpenEdit = (bdcItem) => {
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
  };

  const handleEditBdc = async () => {
    if (!editFormData.devisId) {
      alert("Veuillez sélectionner un devis.");
      return;
    }

    setEditLoading(true);
    try {
      const data = {
        ...editFormData,
        amount: parseFloat(editFormData.amount) || 0,
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
      alert("✅ BDC modifié avec succès !");
    } catch (error) {
      console.error("Erreur modification BDC", error);
      alert("❌ Erreur lors de la modification du BDC");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UN BDC
  // ============================================================
  const handleOpenDelete = (bdcItem) => {
    setDeletingBdc(bdcItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteBdc = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/bdc/${deletingBdc.id}`);
      await loadBdc();
      setDeleteDialogOpen(false);
      setDeletingBdc(null);
      alert("✅ BDC supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression BDC", error);
      alert("❌ Erreur lors de la suppression du BDC");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = (bdcItem) => {
    setSelectedBdc(bdcItem);
    setDetailDialogOpen(true);
  };

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = async (bdcItem) => {
    if (!bdcItem.pdfUrl) {
      alert("Aucun PDF attaché à ce BDC.");
      return;
    }

    try {
      const success = await viewBdcPdf(bdcItem.id);
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
  const handleDownloadPdf = async (bdcItem) => {
    if (!bdcItem.pdfUrl) {
      alert("Aucun PDF attaché à ce BDC.");
      return;
    }

    try {
      const success = await downloadBdcPdf(bdcItem.id, bdcItem.fileName);
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
    setNewBdc({
      number: `BDC-${String(bdc.length + 1).padStart(4, "0")}`,
      devisId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      status: "preparing",
      comments: "",
    });
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
          Bons de Commande
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher un BDC..."
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
            Nouveau BDC
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
                <TableCell>Devis source</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBdc.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      Aucun BDC trouvé.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBdc.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.number}</TableCell>
                    <TableCell>{d.devisNumber || d.devis?.number}</TableCell>
                    <TableCell>
                      {d.date
                        ? new Date(d.date).toLocaleDateString("fr-FR")
                        : ""}
                    </TableCell>
                    <TableCell>{d.description}</TableCell>
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
        <DialogTitle>Nouveau BDC</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro"
                fullWidth
                value={newBdc.number}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Devis source</InputLabel>
                <Select
                  value={newBdc.devisId}
                  onChange={(e) => {
                    const devis = devisList.find(
                      (d) => d.id === e.target.value,
                    );
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
                onChange={(e) => setNewBdc({ ...newBdc, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Montant (€)"
                type="number"
                fullWidth
                value={newBdc.amount}
                onChange={(e) =>
                  setNewBdc({ ...newBdc, amount: e.target.value })
                }
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
                  <MenuItem value="preparing">En préparation</MenuItem>
                  <MenuItem value="validated">Validé</MenuItem>
                  <MenuItem value="cancelled">Annulé</MenuItem>
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
            onClick={handleAddBdc}
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
        <DialogTitle>Modifier le BDC</DialogTitle>
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
                <InputLabel>Devis source</InputLabel>
                <Select
                  value={editFormData.devisId}
                  onChange={(e) => {
                    const devis = devisList.find(
                      (d) => d.id === e.target.value,
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
                  <MenuItem value="preparing">En préparation</MenuItem>
                  <MenuItem value="validated">Validé</MenuItem>
                  <MenuItem value="cancelled">Annulé</MenuItem>
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
              {editFile && <Chip label={editFile.name} sx={{ ml: 1 }} />}
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
        <DialogActions>
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
            Êtes-vous sûr de vouloir supprimer le BDC{" "}
            <strong>{deletingBdc?.number}</strong> ?
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
            onClick={handleDeleteBdc}
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
        {selectedBdc && (
          <>
            <DialogTitle>
              {selectedBdc.number}
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
                    Devis source
                  </Typography>
                  <Typography>
                    {selectedBdc.devisNumber || selectedBdc.devis?.number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography>
                    {selectedBdc.date
                      ? new Date(selectedBdc.date).toLocaleDateString("fr-FR")
                      : ""}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Montant
                  </Typography>
                  <Typography>
                    {selectedBdc.amount
                      ? `${selectedBdc.amount.toLocaleString()} €`
                      : "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography>{selectedBdc.description || "-"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Statut
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedBdc.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedBdc.status) + "20",
                      color: getStatusColor(selectedBdc.status),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Commentaires
                  </Typography>
                  <Typography>{selectedBdc.comments || "Aucun"}</Typography>
                </Grid>
                {selectedBdc.pdfUrl && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Pièce jointe
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedBdc)}
                    >
                      {selectedBdc.fileName || "document.pdf"}
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
