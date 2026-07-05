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
import api, { viewAttachementPdf, downloadAttachementPdf } from "../../api/api";

const getStatusLabel = (status) => {
  const map = {
    agreement: "En attente d'accord",
    validated: "Validé",
    contested: "Contesté",
    refused: "Refusé",
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const map = {
    agreement: "#ff9800",
    validated: "#4caf50",
    contested: "#f44336",
    refused: "#f44336",
  };
  return map[status] || "#9e9e9e";
};

export const AttachmentsList = () => {
  const [attachments, setAttachments] = useState([]);
  const [blList, setBlList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

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

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/attachements");
      setAttachments(response.data || []);
    } catch (error) {
      console.error("Erreur chargement attachements", error);
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

  const filteredAttachments = attachments.filter(
    (d) =>
      d.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.blNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ============================================================
  // AJOUTER UN ATTACHEMENT
  // ============================================================
  const handleAddAttachment = async () => {
    if (!newAttachment.blId) {
      alert("Veuillez sélectionner un BL.");
      return;
    }

    setAddLoading(true);
    try {
      const selectedBl = blList.find((d) => d.id === newAttachment.blId);
      const data = {
        ...newAttachment,
        amount: parseFloat(newAttachment.amount) || 0,
        blNumber: selectedBl?.number || "", // ← AJOUT CRUCIAL
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
      alert("✅ Attachement ajouté avec succès !");
    } catch (error) {
      console.error("Erreur ajout attachement", error);
      alert("❌ Erreur lors de l'ajout de l'attachement");
    } finally {
      setAddLoading(false);
    }
  };

  // ============================================================
  // MODIFIER UN ATTACHEMENT
  // ============================================================
  const handleOpenEdit = (attachmentItem) => {
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
  };

  const handleEditAttachment = async () => {
    if (!editFormData.blId) {
      alert("Veuillez sélectionner un BL.");
      return;
    }

    setEditLoading(true);
    try {
      const selectedBl = blList.find((d) => d.id === editFormData.blId);
      const data = {
        ...editFormData,
        amount: parseFloat(editFormData.amount) || 0,
        blNumber: selectedBl?.number || "", // ← AJOUT CRUCIAL
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
      alert("✅ Attachement modifié avec succès !");
    } catch (error) {
      console.error("Erreur modification attachement", error);
      alert("❌ Erreur lors de la modification de l'attachement");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UN ATTACHEMENT
  // ============================================================
  const handleOpenDelete = (attachmentItem) => {
    setDeletingAttachment(attachmentItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAttachment = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/attachements/${deletingAttachment.id}`);
      await loadAttachments();
      setDeleteDialogOpen(false);
      setDeletingAttachment(null);
      alert("✅ Attachement supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression attachement", error);
      alert("❌ erreur lors de la suppression de l'attachement");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = (attachmentItem) => {
    setSelectedAttachment(attachmentItem);
    setDetailDialogOpen(true);
  };

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = async (attachmentItem) => {
    if (!attachmentItem.pdfUrl) {
      alert("Aucun PDF attaché à cet attachement.");
      return;
    }

    try {
      const success = await viewAttachementPdf(attachmentItem.id);
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
  const handleDownloadPdf = async (attachmentItem) => {
    if (!attachmentItem.pdfUrl) {
      alert("Aucun PDF attaché à cet attachement.");
      return;
    }

    try {
      const success = await downloadAttachementPdf(
        attachmentItem.id,
        attachmentItem.fileName,
      );
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
          Attachements
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher un attachement..."
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
            Nouvel attachement
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
                <TableCell>BL source</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAttachments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      Aucun attachement trouvé.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttachments.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.number}</TableCell>
                    <TableCell>{d.blNumber || d.bl?.number}</TableCell>
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
        <DialogTitle>Nouvel attachement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
                  <MenuItem value="agreement">En attente d'accord</MenuItem>
                  <MenuItem value="validated">Validé</MenuItem>
                  <MenuItem value="contested">Contesté</MenuItem>
                  <MenuItem value="refused">Refusé</MenuItem>
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
            onClick={handleAddAttachment}
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
        <DialogTitle>Modifier l'attachement</DialogTitle>
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
                  <MenuItem value="agreement">En attente d'accord</MenuItem>
                  <MenuItem value="validated">Validé</MenuItem>
                  <MenuItem value="contested">Contesté</MenuItem>
                  <MenuItem value="refused">Refusé</MenuItem>
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
              {editFile && <Chip label={editFile.name} sx={{ ml: 1 }} />}
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
        <DialogActions>
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
            Êtes-vous sûr de vouloir supprimer l'attachement{" "}
            <strong>{deletingAttachment?.number}</strong> ?
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
            onClick={handleDeleteAttachment}
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
        {selectedAttachment && (
          <>
            <DialogTitle>
              {selectedAttachment.number}
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
                    BL source
                  </Typography>
                  <Typography>
                    {selectedAttachment.blNumber ||
                      selectedAttachment.bl?.number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography>
                    {selectedAttachment.date
                      ? new Date(selectedAttachment.date).toLocaleDateString(
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
                    {selectedAttachment.amount
                      ? `${selectedAttachment.amount.toLocaleString()} DT`
                      : "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography>
                    {selectedAttachment.description || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Statut
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedAttachment.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedAttachment.status) + "20",
                      color: getStatusColor(selectedAttachment.status),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date accord mutuel
                  </Typography>
                  <Typography>
                    {selectedAttachment.agreementDate
                      ? new Date(
                          selectedAttachment.agreementDate,
                        ).toLocaleDateString("fr-FR")
                      : "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Commentaires
                  </Typography>
                  <Typography>
                    {selectedAttachment.comments || "Aucun"}
                  </Typography>
                </Grid>
                {selectedAttachment.pdfUrl && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Pièce jointe
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedAttachment)}
                    >
                      {selectedAttachment.fileName || "document.pdf"}
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

