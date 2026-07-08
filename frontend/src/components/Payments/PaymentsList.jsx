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
import api, { viewPaiementPdf, downloadPaiementPdf } from "../../api/api";

const getModeLabel = (mode) => {
  const map = {
    cash: "Espèces",
    check: "Chèque",
    transfer: "Virement",
    card: "Carte bancaire",
  };
  return map[mode] || mode;
};

export const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // États pour l'ajout
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    reference: "",
    invoiceId: "",
    date: "",
    amount: "",
    mode: "cash",
    bankReference: "",
    comments: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // États pour la modification
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    reference: "",
    invoiceId: "",
    date: "",
    amount: "",
    mode: "cash",
    bankReference: "",
    comments: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // États pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // États pour le détail
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/paiements");
      setPayments(response.data || []);
    } catch (error) {
      console.error("Erreur chargement paiements", error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await api.get("/factures");
      setInvoices(response.data || []);
    } catch (error) {
      console.error("Erreur chargement factures", error);
    }
  };

  useEffect(() => {
    loadPayments();
    loadInvoices();
  }, []);

  const filteredPayments = payments.filter(
    (d) =>
      d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.factureNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.comments?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ============================================================
  // AJOUTER UN PAIEMENT
  // ============================================================
  const handleAddPayment = async () => {
    if (!newPayment.invoiceId) {
      alert("Veuillez sélectionner une facture.");
      return;
    }

    setAddLoading(true);
    try {
      const selectedInvoice = invoices.find(
        (d) => d.id === newPayment.invoiceId,
      );
      const data = {
        ...newPayment,
        amount: parseFloat(newPayment.amount) || 0,
        factureNumber: selectedInvoice?.number || "", // ← AJOUT CRUCIAL
      };
      const response = await api.post("/paiements", data);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/paiements/${response.data.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadPayments();
      setAddDialogOpen(false);
      setNewPayment({
        reference: "",
        invoiceId: "",
        date: "",
        amount: "",
        mode: "cash",
        bankReference: "",
        comments: "",
      });
      setSelectedFile(null);
      alert("✅ Paiement ajouté avec succès !");
    } catch (error) {
      console.error("Erreur ajout paiement", error);
      alert("❌ Erreur lors de l'ajout du paiement");
    } finally {
      setAddLoading(false);
    }
  };

  // ============================================================
  // MODIFIER UN PAIEMENT
  // ============================================================
  const handleOpenEdit = (paymentItem) => {
    setEditingPayment(paymentItem);
    setEditFormData({
      reference: paymentItem.reference || "",
      invoiceId: paymentItem.invoiceId || paymentItem.facture?.id || "",
      date: paymentItem.date
        ? new Date(paymentItem.date).toISOString().split("T")[0]
        : "",
      amount: paymentItem.amount || "",
      mode: paymentItem.mode || "cash",
      bankReference: paymentItem.bankReference || "",
      comments: paymentItem.comments || "",
    });
    setEditFile(null);
    setEditDialogOpen(true);
  };

  const handleEditPayment = async () => {
    if (!editFormData.invoiceId) {
      alert("Veuillez sélectionner une facture.");
      return;
    }

    setEditLoading(true);
    try {
      const selectedInvoice = invoices.find(
        (d) => d.id === editFormData.invoiceId,
      );
      const data = {
        ...editFormData,
        amount: parseFloat(editFormData.amount) || 0,
        factureNumber: selectedInvoice?.number || "", // ← AJOUT CRUCIAL
      };
      await api.put(`/paiements/${editingPayment.id}`, data);

      if (editFile) {
        const formData = new FormData();
        formData.append("file", editFile);
        await api.post(`/paiements/${editingPayment.id}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadPayments();
      setEditDialogOpen(false);
      setEditingPayment(null);
      setEditFile(null);
      alert("✅ Paiement modifié avec succès !");
    } catch (error) {
      console.error("Erreur modification paiement", error);
      alert("❌ Erreur lors de la modification du paiement");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // SUPPRIMER UN PAIEMENT
  // ============================================================
  const handleOpenDelete = (paymentItem) => {
    setDeletingPayment(paymentItem);
    setDeleteDialogOpen(true);
  };

  const handleDeletePayment = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/paiements/${deletingPayment.id}`);
      await loadPayments();
      setDeleteDialogOpen(false);
      setDeletingPayment(null);
      alert("✅ Paiement supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression paiement", error);
      alert("❌ Erreur lors de la suppression du paiement");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================
  const handleViewDetail = (paymentItem) => {
    setSelectedPayment(paymentItem);
    setDetailDialogOpen(true);
  };

  // ============================================================
  // VOIR LE PDF
  // ============================================================
  const handleViewPdf = async (paymentItem) => {
    if (!paymentItem.pdfUrl) {
      alert("Aucun PDF attaché à ce paiement.");
      return;
    }

    try {
      const success = await viewPaiementPdf(paymentItem.id);
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
  const handleDownloadPdf = async (paymentItem) => {
    if (!paymentItem.pdfUrl) {
      alert("Aucun PDF attaché à ce paiement.");
      return;
    }

    try {
      const success = await downloadPaiementPdf(
        paymentItem.id,
        paymentItem.fileName,
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
    setNewPayment({
      reference: "",
      invoiceId: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      mode: "cash",
      bankReference: "",
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
          Encaissements
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher un paiement..."
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
            Nouveau paiement
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
                <TableCell>Référence</TableCell>
                <TableCell>Facture</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      Aucun paiement trouvé.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.reference}</TableCell>
                    <TableCell>
                      {d.factureNumber || d.facture?.number}
                    </TableCell>
                    <TableCell>
                      {d.date
                        ? new Date(d.date).toLocaleDateString("fr-FR")
                        : ""}
                    </TableCell>
                    <TableCell>
                      {d.amount ? `${d.amount.toLocaleString()} DT` : ""}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getModeLabel(d.mode)}
                        size="small"
                        variant="outlined"
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
        <DialogTitle>Nouveau paiement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Référence"
                fullWidth
                required
                placeholder="Ex: PAY-0001"
                value={newPayment.reference}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, reference: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Facture associée</InputLabel>
                <Select
                  value={newPayment.invoiceId}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, invoiceId: e.target.value })
                  }
                  label="Facture associée"
                >
                  {invoices.map((d) => (
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
                value={newPayment.date}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Montant (DT)"
                type="number"
                fullWidth
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, amount: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  value={newPayment.mode}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, mode: e.target.value })
                  }
                  label="Mode de paiement"
                >
                  <MenuItem value="cash">Espèces</MenuItem>
                  <MenuItem value="check">Chèque</MenuItem>
                  <MenuItem value="transfer">Virement bancaire</MenuItem>
                  <MenuItem value="card">Carte bancaire</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Référence bancaire"
                fullWidth
                value={newPayment.bankReference}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    bankReference: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Commentaires"
                fullWidth
                multiline
                rows={2}
                value={newPayment.comments}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, comments: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
              >
                Justificatif (PDF)
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
            onClick={handleAddPayment}
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
        <DialogTitle>Modifier le paiement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Référence"
                fullWidth
                value={editFormData.reference}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Facture associée</InputLabel>
                <Select
                  value={editFormData.invoiceId}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      invoiceId: e.target.value,
                    })
                  }
                  label="Facture associée"
                >
                  {invoices.map((d) => (
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  value={editFormData.mode}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, mode: e.target.value })
                  }
                  label="Mode de paiement"
                >
                  <MenuItem value="cash">Espèces</MenuItem>
                  <MenuItem value="check">Chèque</MenuItem>
                  <MenuItem value="transfer">Virement bancaire</MenuItem>
                  <MenuItem value="card">Carte bancaire</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Référence bancaire"
                fullWidth
                value={editFormData.bankReference}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    bankReference: e.target.value,
                  })
                }
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
                Nouveau justificatif (PDF)
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={(e) => setEditFile(e.target.files[0])}
                />
              </Button>
              {editFile && <Chip label={editFile.name} sx={{ ml: 1 }} />}
              {editingPayment?.fileName && !editFile && (
                <Chip
                  label={`Actuel: ${editingPayment.fileName}`}
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
            onClick={handleEditPayment}
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
            Êtes-vous sûr de vouloir supprimer le paiement{" "}
            <strong>{deletingPayment?.reference}</strong> ?
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
            onClick={handleDeletePayment}
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
        {selectedPayment && (
          <>
            <DialogTitle>
              {selectedPayment.reference}
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
                    Facture associée
                  </Typography>
                  <Typography>
                    {selectedPayment.factureNumber ||
                      selectedPayment.facture?.number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography>
                    {selectedPayment.date
                      ? new Date(selectedPayment.date).toLocaleDateString(
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
                    {selectedPayment.amount
                      ? `${selectedPayment.amount.toLocaleString()} DT`
                      : "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Mode
                  </Typography>
                  <Chip
                    label={getModeLabel(selectedPayment.mode)}
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Référence bancaire
                  </Typography>
                  <Typography>
                    {selectedPayment.bankReference || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Commentaires
                  </Typography>
                  <Typography>{selectedPayment.comments || "Aucun"}</Typography>
                </Grid>
                {selectedPayment.pdfUrl && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Justificatif
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewPdf(selectedPayment)}
                    >
                      {selectedPayment.fileName || "document.pdf"}
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
