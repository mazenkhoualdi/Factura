import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useAppContext } from "../../context/AppContext";

const getStatusLabel = (status) => {
  const map = {
    pending: "En attente",
    accepted: "Accepté",
    refused: "Refusé",
    validated: "Validé",
    preparing: "En préparation",
    delivered: "Livré",
    partial: "Partiellement livré",
    cancelled: "Annulé",
    paid: "Payée",
    unpaid: "Non payée",
    late: "En retard",
    agreement: "En attente d'accord",
    contested: "Contesté",
    completed: "Terminé",
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const map = {
    pending: "#ff9800",
    accepted: "#4caf50",
    refused: "#f44336",
    validated: "#4caf50",
    preparing: "#ff9800",
    delivered: "#2196f3",
    partial: "#ff9800",
    cancelled: "#f44336",
    paid: "#4caf50",
    unpaid: "#f44336",
    late: "#f44336",
    agreement: "#ff9800",
    contested: "#f44336",
    completed: "#4caf50",
  };
  return map[status] || "#9e9e9e";
};

export const ClientDetail = ({ open, client, onClose }) => {
  const { devis, bdc, bl, attachements, factures, paiements } = useAppContext();
  const [tabValue, setTabValue] = React.useState(0);

  if (!client) return null;

  // Récupérer l'historique des documents du client
  const clientDevis = devis.filter(
    (d) => d.clientId === client.id || d.client?.id === client.id,
  );
  const clientBDC = bdc.filter((b) =>
    clientDevis.some((d) => d.id === b.devisId || d.id === b.devis?.id),
  );
  const clientBL = bl.filter((b) =>
    clientBDC.some((bdc2) => bdc2.id === b.bdcId || bdc2.id === b.bdc?.id),
  );
  const clientAttachments = attachements.filter((a) =>
    clientBL.some((bl2) => bl2.id === a.blId || bl2.id === a.bl?.id),
  );
  const clientFactures = factures.filter((f) =>
    clientAttachments.some(
      (a2) => a2.id === f.attachementId || a2.id === f.attachement?.id,
    ),
  );
  const clientPaiements = paiements.filter((p) =>
    clientFactures.some((f) => f.id === p.factureId || f.id === p.facture?.id),
  );

  const history = [
    ...clientDevis.map((d) => ({ type: "Devis", ...d })),
    ...clientBDC.map((d) => ({ type: "BDC", ...d })),
    ...clientBL.map((d) => ({ type: "BL", ...d })),
    ...clientAttachments.map((d) => ({ type: "Attachement", ...d })),
    ...clientFactures.map((d) => ({ type: "Facture", ...d })),
    ...clientPaiements.map((d) => ({ type: "Paiement", ...d })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {`${client.firstName} ${client.lastName}`}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Informations" />
          <Tab label="Historique" />
          <Tab label="PDF" disabled={!client.pdfUrl} />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Nom complet
                </Typography>
                <Typography>
                  {client.firstName} {client.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography>{client.email || "-"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Téléphone
                </Typography>
                <Typography>{client.phone || "-"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Adresse
                </Typography>
                <Typography>{client.address || "-"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Matricule fiscal
                </Typography>
                <Typography>{client.fiscalId || "-"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Observations
                </Typography>
                <Typography>{client.notes || "Aucune"}</Typography>
              </Grid>
            </Grid>
          )}
          {tabValue === 1 && (
            <Box>
              {history.length === 0 ? (
                <Typography color="text.secondary">
                  Aucun document trouvé.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Numéro</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Montant</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>PDF</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>
                            {item.number || item.reference || "-"}
                          </TableCell>
                          <TableCell>
                            {item.date
                              ? new Date(item.date).toLocaleDateString("fr-FR")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {item.amount
                              ? `${item.amount.toLocaleString()} DT`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(item.status)}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(item.status) + "20",
                                color: getStatusColor(item.status),
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {(item.pdfUrl || item.fileName) && (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  alert(
                                    `Aperçu de ${item.fileName || "document.pdf"}`,
                                  )
                                }
                              >
                                <PictureAsPdfIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
          {tabValue === 2 && client.pdfUrl && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <PictureAsPdfIcon
                sx={{ fontSize: 48, color: "error.main", mb: 1 }}
              />
              <Typography>{client.fileName}</Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => alert("Téléchargement simulé")}
              >
                Télécharger
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
