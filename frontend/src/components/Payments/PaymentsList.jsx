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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import api from "../../api/api";

export const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    reference: "",
    invoiceId: "",
    date: "",
    amount: "",
    mode: "cash",
    bankReference: "",
    comments: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const loadPayments = async () => {
    try {
      const response = await api.get("/paiements");
      setPayments(response.data);
    } catch (error) {
      console.error("Erreur chargement paiements", error);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await api.get("/factures");
      setInvoices(response.data);
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
      d.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.comments?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenCreate = () => {
    setFormData({
      reference: `PAY-${String(payments.length + 1).padStart(4, "0")}`,
      invoiceId: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      mode: "cash",
      bankReference: "",
      comments: "",
    });
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
      };
      const response = await api.post("/paiements", data);
      if (selectedFile) {
        const formData2 = new FormData();
        formData2.append("file", selectedFile);
        await api.post(`/paiements/${response.data.id}/pdf`, formData2, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await loadPayments();
      setDialogOpen(false);
    } catch (error) {
      console.error("Erreur sauvegarde paiement", error);
    }
  };

  const handlePreview = (item) => {
    alert(
      `📄 Aperçu du PDF : ${item.fileName || "document.pdf"}\n(PDF factice - aperçu non disponible)`,
    );
  };

  const getModeLabel = (mode) => {
    const map = {
      cash: "Espèces",
      check: "Chèque",
      transfer: "Virement",
      card: "Carte bancaire",
    };
    return map[mode] || mode;
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
              {filteredPayments.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>{d.reference}</TableCell>
                  <TableCell>{d.invoiceNumber || d.facture?.number}</TableCell>
                  <TableCell>
                    {d.date ? new Date(d.date).toLocaleDateString("fr-FR") : ""}
                  </TableCell>
                  <TableCell>
                    {d.amount ? `${d.amount.toLocaleString()} €` : ""}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getModeLabel(d.mode)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Aperçu PDF">
                      <IconButton size="small" onClick={() => handlePreview(d)}>
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
                value={formData.reference}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Facture associée</InputLabel>
                <Select
                  value={formData.invoiceId}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceId: e.target.value })
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
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Montant (€)"
                type="number"
                fullWidth
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData({ ...formData, mode: e.target.value })
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
                value={formData.bankReference}
                onChange={(e) =>
                  setFormData({ ...formData, bankReference: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Commentaires"
                fullWidth
                multiline
                rows={2}
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label">
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
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
