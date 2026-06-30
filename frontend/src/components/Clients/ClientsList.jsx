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
    Typography,
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import api, { downloadPdf, viewPdf } from '../../api/api';

export const ClientsList = () => {
    const { clients, loadClients } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    
    // États pour l'ajout
    const [addDialogOpen, setAddDialogOpen] = useState(false);
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
    const [addLoading, setAddLoading] = useState(false);

    // États pour la modification
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        fiscalId: '',
        notes: '',
    });
    const [editFile, setEditFile] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    // États pour la suppression
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingClient, setDeletingClient] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // États pour le détail
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    // États pour le PDF
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
    const [pdfClient, setPdfClient] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    useEffect(() => {
        loadClients();
    }, []);

    const filteredClients = clients.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ============================================================
    // AJOUTER UN CLIENT
    // ============================================================
    const handleAddClient = async () => {
        if (!newClient.firstName || !newClient.lastName) {
            alert('Veuillez remplir le nom et le prénom.');
            return;
        }

        setAddLoading(true);
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
            setAddDialogOpen(false);
            setNewClient({ firstName: '', lastName: '', email: '', phone: '', address: '', fiscalId: '', notes: '' });
            setSelectedFile(null);
            alert('✅ Client ajouté avec succès !');
        } catch (error) {
            console.error('Erreur ajout client', error);
            alert('❌ Erreur lors de l\'ajout du client');
        } finally {
            setAddLoading(false);
        }
    };

    // ============================================================
    // MODIFIER UN CLIENT
    // ============================================================
    const handleOpenEdit = (client) => {
        setEditingClient(client);
        setEditFormData({
            firstName: client.firstName || '',
            lastName: client.lastName || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            fiscalId: client.fiscalId || '',
            notes: client.notes || '',
        });
        setEditFile(null);
        setEditDialogOpen(true);
    };

    const handleEditClient = async () => {
        if (!editFormData.firstName || !editFormData.lastName) {
            alert('Veuillez remplir le nom et le prénom.');
            return;
        }

        setEditLoading(true);
        try {
            await api.put(`/clients/${editingClient.id}`, editFormData);
            
            if (editFile) {
                const formData = new FormData();
                formData.append('file', editFile);
                await api.post(`/clients/${editingClient.id}/pdf`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            await loadClients();
            setEditDialogOpen(false);
            setEditingClient(null);
            setEditFile(null);
            alert('✅ Client modifié avec succès !');
        } catch (error) {
            console.error('Erreur modification client', error);
            alert('❌ Erreur lors de la modification du client');
        } finally {
            setEditLoading(false);
        }
    };

    // ============================================================
    // SUPPRIMER UN CLIENT
    // ============================================================
    const handleOpenDelete = (client) => {
        setDeletingClient(client);
        setDeleteDialogOpen(true);
    };

    const handleDeleteClient = async () => {
        setDeleteLoading(true);
        try {
            await api.delete(`/clients/${deletingClient.id}`);
            await loadClients();
            setDeleteDialogOpen(false);
            setDeletingClient(null);
            alert('✅ Client supprimé avec succès !');
        } catch (error) {
            console.error('Erreur suppression client', error);
            alert('❌ Erreur lors de la suppression du client');
        } finally {
            setDeleteLoading(false);
        }
    };

    // ============================================================
    // VOIR LES DÉTAILS
    // ============================================================
    const handleViewDetail = (client) => {
        setSelectedClient(client);
        setDetailDialogOpen(true);
    };

    // ============================================================
    // VOIR LE PDF (APERÇU)
    // ============================================================
    const handleViewPdf = async (client) => {
        if (!client.pdfUrl) {
            alert('Aucun PDF attaché à ce client.');
            return;
        }
        
        setPdfClient(client);
        setPdfDialogOpen(true);
        setPdfLoading(true);
        
        try {
            const success = await viewPdf(client.id);
            setPdfLoading(false);
            if (success) {
                // Le PDF s'ouvre dans un nouvel onglet
                setPdfDialogOpen(false);
            } else {
                alert('❌ Erreur lors de l\'ouverture du PDF');
            }
        } catch (error) {
            console.error('Erreur', error);
            setPdfLoading(false);
            alert('❌ Erreur lors de l\'ouverture du PDF');
        }
    };

    // ============================================================
    // TÉLÉCHARGER LE PDF
    // ============================================================
    const handleDownloadPdf = async (client) => {
        if (!client.pdfUrl) {
            alert('Aucun PDF attaché à ce client.');
            return;
        }
        
        try {
            const success = await downloadPdf(client.id, client.fileName);
            if (success) {
                alert('✅ Téléchargement du PDF démarré !');
            } else {
                alert('❌ Erreur lors du téléchargement du PDF');
            }
        } catch (error) {
            console.error('Erreur', error);
            alert('❌ Erreur lors du téléchargement du PDF');
        }
    };

    return (
        <Box>
            {/* ============================================================
                EN-TÊTE
                ============================================================ */}
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
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => setAddDialogOpen(true)}
                    >
                        Nouveau client
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
                                <TableCell>Nom</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Téléphone</TableCell>
                                <TableCell>Matricule fiscal</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredClients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="text.secondary">Aucun client trouvé.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClients.map((client) => (
                                    <TableRow key={client.id} hover>
                                        <TableCell>{`${client.firstName} ${client.lastName}`}</TableCell>
                                        <TableCell>{client.email}</TableCell>
                                        <TableCell>{client.phone}</TableCell>
                                        <TableCell>{client.fiscalId}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Voir détails">
                                                <IconButton size="small" onClick={() => handleViewDetail(client)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Aperçu PDF">
                                                <IconButton size="small" onClick={() => handleViewPdf(client)}>
                                                    <PictureAsPdfIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Télécharger PDF">
                                                <IconButton size="small" onClick={() => handleDownloadPdf(client)}>
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Modifier">
                                                <IconButton size="small" onClick={() => handleOpenEdit(client)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Supprimer">
                                                <IconButton size="small" color="error" onClick={() => handleOpenDelete(client)}>
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
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Nouveau client</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Prénom"
                                fullWidth
                                value={newClient.firstName}
                                onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nom"
                                fullWidth
                                value={newClient.lastName}
                                onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                fullWidth
                                type="email"
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
                                <input
                                    type="file"
                                    accept=".pdf"
                                    hidden
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                />
                            </Button>
                            {selectedFile && <Chip label={selectedFile.name} sx={{ ml: 1 }} />}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)} disabled={addLoading}>Annuler</Button>
                    <Button variant="contained" onClick={handleAddClient} disabled={addLoading}>
                        {addLoading ? 'Ajout...' : 'Ajouter'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ============================================================
                DIALOGUE DE MODIFICATION
                ============================================================ */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Modifier le client</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Prénom"
                                fullWidth
                                value={editFormData.firstName}
                                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nom"
                                fullWidth
                                value={editFormData.lastName}
                                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                fullWidth
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Téléphone"
                                fullWidth
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Adresse"
                                fullWidth
                                multiline
                                rows={2}
                                value={editFormData.address}
                                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Matricule fiscal"
                                fullWidth
                                value={editFormData.fiscalId}
                                onChange={(e) => setEditFormData({ ...editFormData, fiscalId: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Observations"
                                fullWidth
                                multiline
                                rows={2}
                                value={editFormData.notes}
                                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="outlined" component="label" startIcon={<AttachFileIcon />}>
                                Nouvelle pièce jointe (PDF)
                                <input
                                    type="file"
                                    accept=".pdf"
                                    hidden
                                    onChange={(e) => setEditFile(e.target.files[0])}
                                />
                            </Button>
                            {editFile && <Chip label={editFile.name} sx={{ ml: 1 }} />}
                            {editingClient?.fileName && !editFile && (
                                <Chip label={`Actuel: ${editingClient.fileName}`} sx={{ ml: 1 }} variant="outlined" />
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={editLoading}>Annuler</Button>
                    <Button variant="contained" onClick={handleEditClient} disabled={editLoading}>
                        {editLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ============================================================
                DIALOGUE DE SUPPRESSION
                ============================================================ */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer le client <strong>{deletingClient?.firstName} {deletingClient?.lastName}</strong> ?
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Cette action est irréversible.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Annuler</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteClient} disabled={deleteLoading}>
                        {deleteLoading ? 'Suppression...' : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ============================================================
                DIALOGUE DE DÉTAIL
                ============================================================ */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
                {selectedClient && (
                    <>
                        <DialogTitle>
                            {`${selectedClient.firstName} ${selectedClient.lastName}`}
                            <IconButton
                                onClick={() => setDetailDialogOpen(false)}
                                sx={{ position: 'absolute', right: 8, top: 8 }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Email</Typography>
                                    <Typography>{selectedClient.email || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Téléphone</Typography>
                                    <Typography>{selectedClient.phone || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Adresse</Typography>
                                    <Typography>{selectedClient.address || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Matricule fiscal</Typography>
                                    <Typography>{selectedClient.fiscalId || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Observations</Typography>
                                    <Typography>{selectedClient.notes || 'Aucune'}</Typography>
                                </Grid>
                                {selectedClient.pdfUrl && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Pièce jointe</Typography>
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            startIcon={<PictureAsPdfIcon />} 
                                            onClick={() => handleViewPdf(selectedClient)}
                                        >
                                            {selectedClient.fileName || 'document.pdf'}
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