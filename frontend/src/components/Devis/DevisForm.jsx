import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAppContext } from "../../context/AppContext";
import api from "../../api/api";

export const DevisForm = ({ open, devis, onClose, onSuccess }) => {
  const { clients } = useAppContext();
  const [formData, setFormData] = useState({
    number: "",
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (devis) {
      setFormData({
        number: devis.number || "",
        clientId: devis.clientId || devis.client?.id || "",
        date: devis.date
          ? new Date(devis.date).toISOString().split("T")[0]
          : "",
        expirationDate: devis.expirationDate
          ? new Date(devis.expirationDate).toISOString().split("T")[0]
          : "",
        description: devis.description || "",
        amount: devis.amount || "",
        status: devis.status || "pending",
        comments: devis.comments || "",
      });
    } else {
      setFormData({
        number: "",
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
    }
  }, [devis]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
      };
      let response;
      if (devis) {
        response = await api.put(`/devis/${devis.id}`, data);
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
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur sauvegarde devis", error);
      alert("Erreur lors de la sauvegarde du devis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{devis ? "Modifier" : "Nouveau"} devis</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Numéro"
              name="number"
              fullWidth
              required
              placeholder="Ex: DEV-0001"
              value={formData.number}
              onChange={handleChange}
              disabled={!!devis}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
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
              name="date"
              type="date"
              fullWidth
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date d'expiration"
              name="expirationDate"
              type="date"
              fullWidth
              value={formData.expirationDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Montant (DT)"
              name="amount"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Statut"
              >
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="accepted">Accepté</MenuItem>
                <MenuItem value="refused">Refusé</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Commentaires"
              name="comments"
              fullWidth
              multiline
              rows={2}
              value={formData.comments}
              onChange={handleChange}
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
            {devis?.fileName && !selectedFile && (
              <Chip label={devis.fileName} sx={{ ml: 1 }} />
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
