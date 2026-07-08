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
import api, { viewBlPdf, downloadBlPdf } from "../../api/api";

const getStatusLabel = (status) => {
  const map = {
    preparing: "En préparation",
    delivered: "Livré",
    partial: "Partiellement livré",
    cancelled: "Annulé",
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const map = {
    preparing: "#ff9800",
    delivered: "#4caf50",
    partial: "#ff9800",
    cancelled: "#f44336",
  };
  return map[status] || "#9e9e9e";
};

export const BlList = () => {
  const [bl, setBl] = useState([]);
  const [bdcList, setBdcList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);

  // États pour l'ajout
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newBl, setNewBl] = useState({
    number: "",
    bdcId: "",
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
  const [editingBl, setEditingBl] = useState(null);
  const [editFormData, setEditFormData] = useState({
    number: "",
    bdcId: "",
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
  const [deletingBl, setDeletingBl] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // États pour le détail
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBl, setSelectedBl] = useState(null);

  const loadBl = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bl");
      setBl(response.data || []);
    } catch (error) {
      console.error("Erreur chargement BL", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBdc = async () => {
    try {
      const response = await api.get("/bdc");
      setBdcList(response.data || []);
    } catch (error) {
      console.error("Erreur chargement BDC", error);
    }
  };

  useEffect(() => {
    loadBl();
    loadBdc();
  }, []);

  const filteredBl = bl.filter((d) => {
    const matchesSearch =
      d.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.bdcNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const dOnly = d.date ? String(d.date).slice(0, 10) : null;
    const matchesDateDebut = !dateDebut || (dOnly && dOnly >= dateDebut);
    const matchesDateFin = !dateFin || (dOnly && dOnly <= dateFin);
    return matchesSearch && matchesDateDebut && matchesDateFin;
  });

  // ============================================================
  // AJOUTER UN BL
  // ============================================================
  const handleAddBl = async () => {
    if (!newBl.bdcId) {
      alert("Veuillez sélectionner un BDC.");
      return;
    }

    setAddLoading(true);
    try {
      const selectedBdc = bdcList.find((d) => d.id === newBl.bdcId);
      const data = {
        ...newBl,
        amount: parseFloat(newBl.amount) || 0,
        bdcNumber: selectedBdc?.number || "", // ← AJOUT CRUCIAL
      };
      const response = await api.post("/bl", data);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/bl/${response.data.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadBl();
      setAddDialogOpen(false);
      setNewBl({
        number: "",
        bdcId: "",
        date: "",
        description: "",
        amount: "",
        status: "preparing",
        comments: "",
      });
      setSelectedFile(null);
      alert("✅ BL ajouté avec succès !");
    } catch (error) {
      console.error("Erreur ajout BL", error);
      alert("❌ Erreur lors de l'ajout du BL");
    } finally {
      setAddLoading(false);
    }
  };

  // ============================================================
  // MODIFIER UN BL
  // ============================================================
  const handleOpenEdit = (blItem) => {
    setEditingBl(blItem);
    setEditFormData({
      number: blItem.number || "",
      bdcId: blItem.bdcId || blItem.bdc?.id || "",
      date: blItem.date
        ? new Date(blItem.date).toISOString().split("T")[0]
        : "",
      description: blItem.description || "",
      amount: blItem.amount || "",
      status: blItem.status || "preparing",
      comments: blItem.comments || "",
    });
    setEditFile(null);
    setEditDialogOpen(true);
  };

  const handleEditBl = async () => {
    if (!editFormData.bdcId) {
      alert("Veuillez sélectionner un BDC.");
      return;
    }

    setEditLoading(true);
    try {
      const selectedBdc = bdcList.find((d) => d.id === editFormData.bdcId);
      const data = {
        ...editFormData,
        amount: parseFloat(editFormData.amount) || 0,
        bdcNumber: selectedBdc?.number || "", // ← AJOUT CRUCIAL
      };
      await api.put(`/bl/${editingBl.id}`, data);

      if (editFile) {
        const formData = new FormData();
        formData.append("file", editFile);
        await api.post(`/bl/${editingBl.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadBl();
      setEditDialogOpen(false);
      setEditingBl(null);
      setEditFile(null);
      alert("✅ BL modifié avec succès !");
    } catch (error) {
      console.error("Erreur modification BL", error);
      alert("❌ Erreur lors de la modification du BL");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UN BL
  // ============================================================
  const handleOpenDelete = (blItem) => {
    setDeletingBl(blItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteBl = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/bl/${deletingBl.id}`);
      await loadBl();
      setDeleteDialogOpen(false);
      setDeletingBl(null);
      alert("✅ BL supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression BL", error);
      alert("❌ Erreur lors de la suppression du BL");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = (blItem) => {
    setSelectedBl(blItem);
    setDetailDialogOpen(true);
  };

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = async (blItem) => {
    if (!blItem.pdfUrl) {
      alert("Aucun PDF attaché à ce BL.");
      return;
    }

    try {
      const success = await viewBlPdf(blItem.id);
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
  const handleDownloadPdf = async (blItem) => {
    if (!blItem.pdfUrl) {
      alert("Aucun PDF attaché à ce BL.");
      return;
    }

    try {
      const success = await downloadBlPdf(blItem.id, blItem.fileName);
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
    setNewBl({
      number: "",
      bdcId: "",
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
          Bons de Livraison
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher un BL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />
          <TextField
            size="small"
            type="date"
            label="Du"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />
          <TextField
            size="small"
            type="date"
            label="Au"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Nouveau BL
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
                <TableCell>BDC source</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBl.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      Aucun BL trouvé.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBl.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.number}</TableCell>
                    <TableCell>{d.bdcNumber || d.bdc?.number}</TableCell>
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

      {/* ============================================================
                DIALOGUE D'AJOUT
                ============================================================ */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nouveau BL</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro"
                fullWidth
                required
                placeholder="Ex: BL-0001"
                value={newBl.number}
                onChange={(e) =>
                  setNewBl({ ...newBl, number: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>BDC source</InputLabel>
                <Select
                  value={newBl.bdcId}
                  onChange={(e) => {
                    const bdc = bdcList.find((d) => d.id === e.target.value);
                    setNewBl({
                      ...newBl,
                      bdcId: e.target.value,
                      amount: bdc?.amount || "",
                    });
                  }}
                  label="BDC source"
                >
                  {bdcList.map((d) => (
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
                value={newBl.date}
                onChange={(e) => setNewBl({ ...newBl, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Montant (DT)"
                type="number"
                fullWidth
                value={newBl.amount}
                onChange={(e) => setNewBl({ ...newBl, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={newBl.description}
                onChange={(e) =>
                  setNewBl({ ...newBl, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={newBl.status}
                  onChange={(e) =>
                    setNewBl({ ...newBl, status: e.target.value })
                  }
                  label="Statut"
                >
                  <MenuItem value="preparing">En préparation</MenuItem>
                  <MenuItem value="delivered">Livré</MenuItem>
                  <MenuItem value="partial">Partiellement livré</MenuItem>
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
                value={newBl.comments}
                onChange={(e) =>
                  setNewBl({ ...newBl, comments: e.target.value })
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
            onClick={handleAddBl}
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
        <DialogTitle>Modifier le BL</DialogTitle>
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
                <InputLabel>BDC source</InputLabel>
                <Select
                  value={editFormData.bdcId}
                  onChange={(e) => {
                    const bdc = bdcList.find((d) => d.id === e.target.value);
                    setEditFormData({
                      ...editFormData,
                      bdcId: e.target.value,
                      amount: bdc?.amount || "",
                    });
                  }}
                  label="BDC source"
                >
                  {bdcList.map((d) => (
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
                label="Montant (DT)"
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
                  <MenuItem value="delivered">Livré</MenuItem>
                  <MenuItem value="partial">Partiellement livré</MenuItem>
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
              {editingBl?.fileName && !editFile && (
                <Chip
                  label={`Actuel: ${editingBl.fileName}`}
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
            onClick={handleEditBl}
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
            Êtes-vous sûr de vouloir supprimer le BL{" "}
            <strong>{deletingBl?.number}</strong> ?
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
            onClick={handleDeleteBl}
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
        {selectedBl && (
          <>
            <DialogTitle>
              {selectedBl.number}
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
                    BDC source
                  </Typography>
                  <Typography>
                    {selectedBl.bdcNumber || selectedBl.bdc?.number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography>
                    {selectedBl.date
                      ? new Date(selectedBl.date).toLocaleDateString("fr-FR")
                      : ""}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Montant
                  </Typography>
                  <Typography>
                    {selectedBl.amount
                      ? `${selectedBl.amount.toLocaleString()} DT`
                      : "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography>{selectedBl.description || "-"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Statut
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedBl.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedBl.status) + "20",
                      color: getStatusColor(selectedBl.status),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Commentaires
                  </Typography>
                  <Typography>{selectedBl.comments || "Aucun"}</Typography>
                </Grid>
                {selectedBl.pdfUrl && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Pièce jointe
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedBl)}
                    >
                      {selectedBl.fileName || "document.pdf"}
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
