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
import api, { viewFacturePdf, downloadFacturePdf } from "../../api/api";

const getStatusLabel = (status) => {
  const map = {
    unpaid: "Non payée",
    partial: "Partiellement payée",
    paid: "Payée",
    late: "En retard",
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const map = {
    unpaid: "#f44336",
    partial: "#ff9800",
    paid: "#4caf50",
    late: "#f44336",
  };
  return map[status] || "#9e9e9e";
};

export const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // États pour l'ajout
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    number: "",
    attachmentId: "",
    date: "",
    description: "",
    amount: "",
    status: "unpaid",
    comments: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // États pour la modification
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editFormData, setEditFormData] = useState({
    number: "",
    attachmentId: "",
    date: "",
    description: "",
    amount: "",
    status: "unpaid",
    comments: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // États pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // États pour le détail
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get("/factures");
      setInvoices(response.data || []);
    } catch (error) {
      console.error("Erreur chargement factures", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttachments = async () => {
    try {
      const response = await api.get("/attachements");
      setAttachments(response.data || []);
    } catch (error) {
      console.error("Erreur chargement attachements", error);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadAttachments();
  }, []);

  const filteredInvoices = invoices.filter(
    (d) =>
      d.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.attachmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ============================================================
  // AJOUTER UNE FACTURE
  // ============================================================
  const handleAddInvoice = async () => {
    if (!newInvoice.attachmentId) {
      alert("Veuillez sélectionner un attachement.");
      return;
    }

    setAddLoading(true);
    try {
      const data = {
        ...newInvoice,
        amount: parseFloat(newInvoice.amount) || 0,
      };
      const response = await api.post("/factures", data);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/factures/${response.data.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadInvoices();
      setAddDialogOpen(false);
      setNewInvoice({
        number: "",
        attachmentId: "",
        date: "",
        description: "",
        amount: "",
        status: "unpaid",
        comments: "",
      });
      setSelectedFile(null);
      alert("✅ Facture ajoutée avec succès !");
    } catch (error) {
      console.error("Erreur ajout facture", error);
      alert("❌ Erreur lors de l'ajout de la facture");
    } finally {
      setAddLoading(false);
    }
  };

  // ============================================================
  // MODIFIER UNE FACTURE
  // ============================================================
  const handleOpenEdit = (invoiceItem) => {
    setEditingInvoice(invoiceItem);
    setEditFormData({
      number: invoiceItem.number || "",
      attachmentId:
        invoiceItem.attachmentId || invoiceItem.attachement?.id || "",
      date: invoiceItem.date
        ? new Date(invoiceItem.date).toISOString().split("T")[0]
        : "",
      description: invoiceItem.description || "",
      amount: invoiceItem.amount || "",
      status: invoiceItem.status || "unpaid",
      comments: invoiceItem.comments || "",
    });
    setEditFile(null);
    setEditDialogOpen(true);
  };

  const handleEditInvoice = async () => {
    if (!editFormData.attachmentId) {
      alert("Veuillez sélectionner un attachement.");
      return;
    }

    setEditLoading(true);
    try {
      const data = {
        ...editFormData,
        amount: parseFloat(editFormData.amount) || 0,
      };
      await api.put(`/factures/${editingInvoice.id}`, data);

      if (editFile) {
        const formData = new FormData();
        formData.append("file", editFile);
        await api.post(`/factures/${editingInvoice.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadInvoices();
      setEditDialogOpen(false);
      setEditingInvoice(null);
      setEditFile(null);
      alert("✅ Facture modifiée avec succès !");
    } catch (error) {
      console.error("Erreur modification facture", error);
      alert("❌ Erreur lors de la modification de la facture");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UNE FACTURE
  // ============================================================
  const handleOpenDelete = (invoiceItem) => {
    setDeletingInvoice(invoiceItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteInvoice = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/factures/${deletingInvoice.id}`);
      await loadInvoices();
      setDeleteDialogOpen(false);
      setDeletingInvoice(null);
      alert("✅ Facture supprimée avec succès !");
    } catch (error) {
      console.error("Erreur suppression facture", error);
      alert("❌ Erreur lors de la suppression de la facture");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = (invoiceItem) => {
    setSelectedInvoice(invoiceItem);
    setDetailDialogOpen(true);
  };

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = async (invoiceItem) => {
    if (!invoiceItem.pdfUrl) {
      alert("Aucun PDF attaché à cette facture.");
      return;
    }

    try {
      const success = await viewFacturePdf(invoiceItem.id);
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
  const handleDownloadPdf = async (invoiceItem) => {
    if (!invoiceItem.pdfUrl) {
      alert("Aucun PDF attaché à cette facture.");
      return;
    }

    try {
      const success = await downloadFacturePdf(
        invoiceItem.id,
        invoiceItem.fileName,
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
    setNewInvoice({
      number: `FAC-${String(invoices.length + 1).padStart(4, "0")}`,
      attachmentId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      status: "unpaid",
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
          Factures
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher une facture..."
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
            Nouvelle facture
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
                <TableCell>Attachement source</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      Aucune facture trouvée.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.number}</TableCell>
                    <TableCell>
                      {d.attachmentNumber || d.attachement?.number}
                    </TableCell>
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
        <DialogTitle>Nouvelle facture</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro"
                fullWidth
                value={newInvoice.number}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Attachement source</InputLabel>
                <Select
                  value={newInvoice.attachmentId}
                  onChange={(e) => {
                    const att = attachments.find(
                      (d) => d.id === e.target.value,
                    );
                    setNewInvoice({
                      ...newInvoice,
                      attachmentId: e.target.value,
                      amount: att?.amount || "",
                    });
                  }}
                  label="Attachement source"
                >
                  {attachments.map((d) => (
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
                value={newInvoice.date}
                onChange={(e) =>
                  setNewInvoice({ ...newInvoice, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Montant (DT)"
                type="number"
                fullWidth
                value={newInvoice.amount}
                onChange={(e) =>
                  setNewInvoice({ ...newInvoice, amount: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={newInvoice.description}
                onChange={(e) =>
                  setNewInvoice({ ...newInvoice, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={newInvoice.status}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, status: e.target.value })
                  }
                  label="Statut"
                >
                  <MenuItem value="unpaid">Non payée</MenuItem>
                  <MenuItem value="partial">Partiellement payée</MenuItem>
                  <MenuItem value="paid">Payée</MenuItem>
                  <MenuItem value="late">En retard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Commentaires"
                fullWidth
                multiline
                rows={2}
                value={newInvoice.comments}
                onChange={(e) =>
                  setNewInvoice({ ...newInvoice, comments: e.target.value })
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
            onClick={handleAddInvoice}
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
        <DialogTitle>Modifier la facture</DialogTitle>
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
                <InputLabel>Attachement source</InputLabel>
                <Select
                  value={editFormData.attachmentId}
                  onChange={(e) => {
                    const att = attachments.find(
                      (d) => d.id === e.target.value,
                    );
                    setEditFormData({
                      ...editFormData,
                      attachmentId: e.target.value,
                      amount: att?.amount || "",
                    });
                  }}
                  label="Attachement source"
                >
                  {attachments.map((d) => (
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
                  <MenuItem value="unpaid">Non payée</MenuItem>
                  <MenuItem value="partial">Partiellement payée</MenuItem>
                  <MenuItem value="paid">Payée</MenuItem>
                  <MenuItem value="late">En retard</MenuItem>
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
              {editingInvoice?.fileName && !editFile && (
                <Chip
                  label={`Actuel: ${editingInvoice.fileName}`}
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
            onClick={handleEditInvoice}
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
            Êtes-vous sûr de vouloir supprimer la facture{" "}
            <strong>{deletingInvoice?.number}</strong> ?
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
            onClick={handleDeleteInvoice}
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
        {selectedInvoice && (
          <>
            <DialogTitle>
              {selectedInvoice.number}
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
                    Attachement source
                  </Typography>
                  <Typography>
                    {selectedInvoice.attachmentNumber ||
                      selectedInvoice.attachement?.number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography>
                    {selectedInvoice.date
                      ? new Date(selectedInvoice.date).toLocaleDateString(
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
                    {selectedInvoice.amount
                      ? `${selectedInvoice.amount.toLocaleString()} DT`
                      : "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography>{selectedInvoice.description || "-"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Statut
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedInvoice.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedInvoice.status) + "20",
                      color: getStatusColor(selectedInvoice.status),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Commentaires
                  </Typography>
                  <Typography>{selectedInvoice.comments || "Aucun"}</Typography>
                </Grid>
                {selectedInvoice.pdfUrl && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Pièce jointe
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedInvoice)}
                    >
                      {selectedInvoice.fileName || "document.pdf"}
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
