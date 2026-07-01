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
import api from "../../api/api";

export const SocietiesList = () => {
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

  const loadSocietes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/societes");
      setSocieties(response.data || []);
    } catch (error) {
      console.error("Erreur chargement sociétés", error);
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
  // AJOUTER UNE SOCIÉTÉ
  // ============================================================
  const handleAddSociete = async () => {
    if (!newSociete.name) {
      alert("Veuillez remplir le nom de la société.");
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
      alert("✅ Société ajoutée avec succès !");
    } catch (error) {
      console.error("Erreur ajout société", error);
      alert("❌ Erreur lors de l'ajout de la société");
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
      alert("Veuillez remplir le nom de la société.");
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
      alert("✅ Société modifiée avec succès !");
    } catch (error) {
      console.error("Erreur modification société", error);
      alert("❌ Erreur lors de la modification de la société");
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
      alert("✅ Société supprimée avec succès !");
    } catch (error) {
      console.error("Erreur suppression société", error);
      alert("❌ Erreur lors de la suppression de la société");
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
      alert("Aucun PDF attaché à cette société.");
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
      alert("❌ Erreur lors de l'ouverture du PDF");
    }
  };

  // ============================================================
  // TÉLÉCHARGER LE PDF
  // ============================================================
  const handleDownloadPdf = async (societe) => {
    if (!societe.pdfUrl) {
      alert("Aucun PDF attaché à cette société.");
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
      alert("✅ Téléchargement du PDF démarré !");
    } catch (error) {
      console.error("Erreur téléchargement PDF", error);
      alert("❌ Erreur lors du téléchargement du PDF");
    }
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
          Sociétés
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher une société..."
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
            onClick={() => setAddDialogOpen(true)}
          >
            Nouvelle société
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
                <TableCell>Raison sociale</TableCell>
                <TableCell>Responsable</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSocietes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      Aucune société trouvée.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSocietes.map((societe) => (
                  <TableRow key={societe.id} hover>
                    <TableCell>{societe.name}</TableCell>
                    <TableCell>{societe.contactName}</TableCell>
                    <TableCell>{societe.email}</TableCell>
                    <TableCell>{societe.phone}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir détails">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(societe)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Aperçu PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleViewPdf(societe)}
                        >
                          <PictureAsPdfIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Télécharger PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadPdf(societe)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(societe)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDelete(societe)}
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
        <DialogTitle>Nouvelle société</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Raison sociale"
                fullWidth
                value={newSociete.name}
                onChange={(e) =>
                  setNewSociete({ ...newSociete, name: e.target.value })
                }
                required
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                value={newSociete.email}
                onChange={(e) =>
                  setNewSociete({ ...newSociete, email: e.target.value })
                }
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
            onClick={handleAddSociete}
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
        <DialogTitle>Modifier la société</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Raison sociale"
                fullWidth
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
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
              {editingSociete?.fileName && !editFile && (
                <Chip
                  label={`Actuel: ${editingSociete.fileName}`}
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
            onClick={handleEditSociete}
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
            Êtes-vous sûr de vouloir supprimer la société{" "}
            <strong>{deletingSociete?.name}</strong> ?
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
            onClick={handleDeleteSociete}
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
        {selectedSociete && (
          <>
            <DialogTitle>
              {selectedSociete.name}
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
                    Responsable
                  </Typography>
                  <Typography>{selectedSociete.contactName || "-"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{selectedSociete.email || "-"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Téléphone
                  </Typography>
                  <Typography>{selectedSociete.phone || "-"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Adresse
                  </Typography>
                  <Typography>{selectedSociete.address || "-"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Matricule fiscal
                  </Typography>
                  <Typography>{selectedSociete.fiscalId || "-"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Registre de commerce
                  </Typography>
                  <Typography>
                    {selectedSociete.registryNumber || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Observations
                  </Typography>
                  <Typography>{selectedSociete.notes || "Aucune"}</Typography>
                </Grid>
                {selectedSociete.pdfUrl && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Pièce jointe
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedSociete)}
                    >
                      {selectedSociete.fileName || "document.pdf"}
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
