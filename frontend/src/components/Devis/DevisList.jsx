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
import api from "../../api/api";

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
  const { clients, loadClients } = useAppContext();
  const [devis, setDevis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    clientId: "",
    date: "",
    expirationDate: "",
    description: "",
    amount: "",
    status: "pending",
    comments: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDevis = async () => {
    setLoading(true);
    try {
      const response = await api.get("/devis");
      setDevis(response.data);
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

  const handleOpenCreate = () => {
    setIsEdit(false);
    setFormData({
      number: `DEV-${String(devis.length + 1).padStart(4, "0")}`,
      clientId: "",
      date: new Date().toISOString().split("T")[0],
      expirationDate: new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split("T")[0],
      description: "",
      amount: "",
      status: "pending",
      comments: "",
    });
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (devisItem) => {
    setIsEdit(true);
    setFormData({
      number: devisItem.number || "",
      clientId: devisItem.clientId || devisItem.client?.id || "",
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
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
      };
      let response;
      if (isEdit) {
        // Trouver l'ID du devis à modifier
        const devisToEdit = devis.find((d) => d.number === formData.number);
        if (devisToEdit) {
          response = await api.put(`/devis/${devisToEdit.id}`, data);
        } else {
          throw new Error("Devis non trouvé");
        }
      } else {
        response = await api.post("/devis", data);
      }
      if (selectedFile) {
        const formData2 = new FormData();
        formData2.append("file", selectedFile);
        await api.post(`/devis/${response.data.id}/pdf`, formData2, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await loadDevis();
      setDialogOpen(false);
    } catch (error) {
      console.error("Erreur sauvegarde devis", error);
      alert("Erreur lors de la sauvegarde du devis");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (devisItem) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer le devis ${devisItem.number} ?`,
      )
    ) {
      try {
        await api.delete(`/devis/${devisItem.id}`);
        await loadDevis();
      } catch (error) {
        console.error("Erreur suppression devis", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handlePreview = (devisItem) => {
    alert(
      `📄 Aperçu du PDF : ${devisItem.fileName || "document.pdf"}\n(PDF factice - aperçu non disponible)`,
    );
  };

  const handleViewDetail = (devisItem) => {
    setSelectedDevis(devisItem);
    setDetailOpen(true);
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

      {loading && <Typography>Chargement...</Typography>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Expiration</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevis.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>{d.number}</TableCell>
                  <TableCell>
                    {d.clientName ||
                      d.client?.firstName + " " + d.client?.lastName}
                  </TableCell>
                  <TableCell>
                    {d.date ? new Date(d.date).toLocaleDateString("fr-FR") : ""}
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
                      <IconButton size="small" onClick={() => handlePreview(d)}>
                        <PictureAsPdfIcon />
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
                        onClick={() => handleDelete(d)}
                      >
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

      {/* Dialogue d'ajout/modification */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{isEdit ? "Modifier" : "Nouveau"} devis</DialogTitle>
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
                <InputLabel>Client</InputLabel>
                <Select
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  label="Client"
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
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
                label="Date d'expiration"
                type="date"
                fullWidth
                value={formData.expirationDate}
                onChange={(e) =>
                  setFormData({ ...formData, expirationDate: e.target.value })
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
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
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
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
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
                <Chip
                  label={selectedFile.name}
                  onDelete={() => setSelectedFile(null)}
                  sx={{ ml: 1 }}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de détail */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedDevis && (
          <>
            <DialogTitle>{selectedDevis.number}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Client
                  </Typography>
                  <Typography>
                    {selectedDevis.clientName ||
                      selectedDevis.client?.firstName +
                        " " +
                        selectedDevis.client?.lastName}
                  </Typography>
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
                      onClick={() => handlePreview(selectedDevis)}
                    >
                      {selectedDevis.fileName || "document.pdf"}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
