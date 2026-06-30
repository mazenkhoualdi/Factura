import React, { useState, useEffect } from 'react';
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
    Typography,  // <-- IMPORT AJOUTÉ
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import api from '../../api/api';

export const ClientsList = () => {
    const { clients, loadClients } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [newClient, setNewClient] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        fiscalId: '',
        notes: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        loadClients();
    }, []);

    const filteredClients = clients.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddClient = async () => {
        try {
            const response = await api.post('/clients', newClient);
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                await api.post(`/clients/${response.data.id}/pdf`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            await loadClients();
            setDialogOpen(false);
            setNewClient({ firstName: '', lastName: '', email: '', phone: '', address: '', fiscalId: '', notes: '' });
            setSelectedFile(null);
        } catch (error) {
            console.error('Erreur ajout client', error);
        }
    };

    const handleViewClient = (client) => {
        setSelectedClient(client);
        setDetailOpen(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" fontWeight={700}>Clients</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Rechercher un client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 250 }}
                        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                        Nouveau client
                    </Button>
                </Box>
            </Box>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Téléphone</TableCell>
                                <TableCell>Matricule fiscal</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredClients.map((client) => (
                                <TableRow key={client.id} hover>
                                    <TableCell>{`${client.firstName} ${client.lastName}`}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.phone}</TableCell>
                                    <TableCell>{client.fiscalId}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Voir détails">
                                            <IconButton size="small" onClick={() => handleViewClient(client)}>
                                                <VisibilityIcon />
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

            {/* Dialogue d'ajout */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Nouveau client</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Prénom"
                                fullWidth
                                value={newClient.firstName}
                                onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nom"
                                fullWidth
                                value={newClient.lastName}
                                onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                fullWidth
                                value={newClient.email}
                                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Téléphone"
                                fullWidth
                                value={newClient.phone}
                                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Adresse"
                                fullWidth
                                multiline
                                rows={2}
                                value={newClient.address}
                                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Matricule fiscal"
                                fullWidth
                                value={newClient.fiscalId}
                                onChange={(e) => setNewClient({ ...newClient, fiscalId: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Observations"
                                fullWidth
                                multiline
                                rows={2}
                                value={newClient.notes}
                                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="outlined" component="label" startIcon={<AttachFileIcon />}>
                                Pièce jointe (PDF)
                                <input type="file" accept=".pdf" hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
                            </Button>
                            {selectedFile && <Chip label={selectedFile.name} sx={{ ml: 1 }} />}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleAddClient}>Ajouter</Button>
                </DialogActions>
            </Dialog>

            {/* Dialogue de détail */}
            <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
                {selectedClient && (
                    <>
                        <DialogTitle>{`${selectedClient.firstName} ${selectedClient.lastName}`}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Email</Typography>
                                    <Typography>{selectedClient.email}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Téléphone</Typography>
                                    <Typography>{selectedClient.phone}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Adresse</Typography>
                                    <Typography>{selectedClient.address}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Matricule fiscal</Typography>
                                    <Typography>{selectedClient.fiscalId}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Observations</Typography>
                                    <Typography>{selectedClient.notes || 'Aucune'}</Typography>
                                </Grid>
                                {selectedClient.pdfUrl && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Pièce jointe</Typography>
                                        <Button variant="outlined" size="small" startIcon={<AttachFileIcon />}>
                                            {selectedClient.fileName}
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