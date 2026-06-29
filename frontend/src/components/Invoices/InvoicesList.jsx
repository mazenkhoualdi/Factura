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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    attachmentId: "",
    date: "",
    description: "",
    amount: "",
    status: "unpaid",
    comments: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const loadInvoices = async () => {
    try {
      const response = await api.get("/factures");
      setInvoices(response.data);
    } catch (error) {
      console.error("Erreur chargement factures", error);
    }
  };

  const loadAttachments = async () => {
    try {
      const response = await api.get("/attachements");
      setAttachments(response.data);
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
      d.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenCreate = () => {
    setFormData({
      number: `FAC-${String(invoices.length + 1).padStart(4, "0")}`,
      attachmentId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      status: "unpaid",
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
      const response = await api.post("/factures", data);
      if (selectedFile) {
        const formData2 = new FormData();
        formData2.append("file", selectedFile);
        await api.post(`/factures/${response.data.id}/pdf`, formData2, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await loadInvoices();
      setDialogOpen(false);
    } catch (error) {
      console.error("Erreur sauvegarde facture", error);
    }
  };

  const handlePreview = (item) => {
    alert(
      `📄 Aperçu du PDF : ${item.fileName || "document.pdf"}\n(PDF factice - aperçu non disponible)`,
    );
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
              {filteredInvoices.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>{d.number}</TableCell>
                  <TableCell>
                    {d.attachmentNumber || d.attachement?.number}
                  </TableCell>
                  <TableCell>
                    {d.date ? new Date(d.date).toLocaleDateString("fr-FR") : ""}
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
        <DialogTitle>Nouvelle facture</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro"
                fullWidth
                value={formData.number}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Attachement source</InputLabel>
                <Select
                  value={formData.attachmentId}
                  onChange={(e) => {
                    const att = attachments.find(
                      (d) => d.id === e.target.value,
                    );
                    setFormData({
                      ...formData,
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
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
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
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label">
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
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
