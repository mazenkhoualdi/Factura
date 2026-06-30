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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../api/api';

const getStatusLabel = (status) => {
    const map = {
        agreement: "En attente d'accord",
        validated: 'Validé',
        contested: 'Contesté',
        refused: 'Refusé',
    };
    return map[status] || status;
};

const getStatusColor = (status) => {
    const map = {
        agreement: '#ff9800',
        validated: '#4caf50',
        contested: '#f44336',
        refused: '#f44336',
    };
    return map[status] || '#9e9e9e';
};

export const AttachmentsList = () => {
    const [attachments, setAttachments] = useState([]);
    const [blList, setBlList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        number: '',
        blId: '',
        date: '',
        description: '',
        amount: '',
        status: 'agreement',
        agreementDate: '',
        comments: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadAttachments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/attachements');
            setAttachments(response.data || []);
        } catch (error) {
            console.error('Erreur chargement attachements', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBl = async () => {
        try {
            const response = await api.get('/bl');
            setBlList(response.data || []);
        } catch (error) {
            console.error('Erreur chargement BL', error);
        }
    };

    useEffect(() => {
        loadAttachments();
        loadBl();
    }, []);

    const filteredAttachments = attachments.filter(d =>
        d.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.blNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenCreate = () => {
        setIsEdit(false);
        setFormData({
            number: `ATT-${String(attachments.length + 1).padStart(4, '0')}`,
            blId: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: '',
            status: 'agreement',
            agreementDate: '',
            comments: '',
        });
        setSelectedFile(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (item) => {
        setIsEdit(true);
        setFormData({
            number: item.number || '',
            blId: item.blId || item.bl?.id || '',
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
            description: item.description || '',
            amount: item.amount || '',
            status: item.status || 'agreement',
            agreementDate: item.agreementDate ? new Date(item.agreementDate).toISOString().split('T')[0] : '',
            comments: item.comments || '',
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
                const itemToEdit = attachments.find(d => d.number === formData.number);
                if (itemToEdit) {
                    response = await api.put(`/attachements/${itemToEdit.id}`, data);
                }
            } else {
                response = await api.post('/attachements', data);
            }
            if (response && selectedFile) {
                const formData2 = new FormData();
                formData2.append('file', selectedFile);
                await api.post(`/attachements/${response.data.id}/pdf`, formData2, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            await loadAttachments();
            setDialogOpen(false);
        } catch (error) {
            console.error('Erreur sauvegarde attachement', error);
            alert('Erreur lors de la sauvegarde de l\'attachement');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'attachement ${item.number} ?`)) {
            try {
                await api.delete(`/attachements/${item.id}`);
                await loadAttachments();
            } catch (error) {
                console.error('Erreur suppression attachement', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const handlePreview = (item) => {
        alert(`📄 Aperçu du PDF : ${item.fileName || 'document.pdf'}\n(PDF factice - aperçu non disponible)`);
    };

    const handleViewDetail = (item) => {
        setSelectedItem(item);
        setDetailOpen(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" fontWeight={700}>Attachements</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Rechercher un attachement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 250 }}
                        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                        Nouvel attachement
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
                                <TableCell>BL source</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Montant</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAttachments.map((d) => (
                                <TableRow key={d.id} hover>
                                    <TableCell>{d.number}</TableCell>
                                    <TableCell>{d.blNumber || d.bl?.number}</TableCell>
                                    <TableCell>{d.date ? new Date(d.date).toLocaleDateString('fr-FR') : ''}</TableCell>
                                    <TableCell>{d.description}</TableCell>
                                    <TableCell>{d.amount ? `${d.amount.toLocaleString()} €` : ''}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(d.status)}
                                            size="small"
                                            sx={{ bgcolor: getStatusColor(d.status) + '20', color: getStatusColor(d.status), fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Voir détails">
                                            <IconButton size="small" onClick={() => handleViewDetail(d)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Aperçu PDF">
                                            <IconButton size="small" onClick={() => handlePreview(d)}>
                                                <PictureAsPdfIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Modifier">
                                            <IconButton size="small" onClick={() => handleOpenEdit(d)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(d)}>
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
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{isEdit ? 'Modifier' : 'Nouvel'} attachement</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Numéro" fullWidth value={formData.number} disabled />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>BL source</InputLabel>
                                <Select
                                    value={formData.blId}
                                    onChange={(e) => {
                                        const bl = blList.find(d => d.id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            blId: e.target.value,
                                            amount: bl?.amount || '',
                                        });
                                    }}
                                    label="BL source"
                                >
                                    {blList.map((d) => (
                                        <MenuItem key={d.id} value={d.id}>{d.number}</MenuItem>
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
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Montant (€)"
                                type="number"
                                fullWidth
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Statut</InputLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                                value={formData.agreementDate}
                                onChange={(e) => setFormData({ ...formData, agreementDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Commentaires"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.comments}
                                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="outlined" component="label">
                                Pièce jointe (PDF)
                                <input type="file" accept=".pdf" hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
                            </Button>
                            {selectedFile && <Chip label={selectedFile.name} sx={{ ml: 1 }} />}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={loading}>Annuler</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialogue de détail */}
            <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
                {selectedItem && (
                    <>
                        <DialogTitle>{selectedItem.number}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">BL source</Typography>
                                    <Typography>{selectedItem.blNumber || selectedItem.bl?.number}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Date</Typography>
                                    <Typography>{selectedItem.date ? new Date(selectedItem.date).toLocaleDateString('fr-FR') : ''}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Montant</Typography>
                                    <Typography>{selectedItem.amount ? `${selectedItem.amount.toLocaleString()} €` : '-'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Description</Typography>
                                    <Typography>{selectedItem.description || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Statut</Typography>
                                    <Chip
                                        label={getStatusLabel(selectedItem.status)}
                                        size="small"
                                        sx={{ bgcolor: getStatusColor(selectedItem.status) + '20', color: getStatusColor(selectedItem.status) }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Date accord mutuel</Typography>
                                    <Typography>{selectedItem.agreementDate ? new Date(selectedItem.agreementDate).toLocaleDateString('fr-FR') : '-'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Commentaires</Typography>
                                    <Typography>{selectedItem.comments || 'Aucun'}</Typography>
                                </Grid>
                                {selectedItem.pdfUrl && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Pièce jointe</Typography>
                                        <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />} onClick={() => handlePreview(selectedItem)}>
                                            {selectedItem.fileName || 'document.pdf'}
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