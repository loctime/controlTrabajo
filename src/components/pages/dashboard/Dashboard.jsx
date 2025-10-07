import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { db } from '../../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Avatar, 
  IconButton, 
  Modal, 
  Box, 
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DownloadIcon from '@mui/icons-material/Download';

const Dashboard = () => {
  const [activeCVs, setActiveCVs] = useState([]);
  const [pendingCVs, setPendingCVs] = useState([]);
  const [rejectedCVs, setRejectedCVs] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const [currentView, setCurrentView] = useState('active');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [cvToReject, setCvToReject] = useState(null);

  const fetchCVs = async (status) => {
    const q = query(collection(db, 'cv'), where('estado', '==', status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const fetchData = async () => {
    const activeData = await fetchCVs('aprobado');
    const pendingData = await fetchCVs('pendiente');
    const rejectedData = await fetchCVs('no aprobado');
    setActiveCVs(activeData);
    setPendingCVs(pendingData);
    setRejectedCVs(rejectedData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showAlert = (title, text, icon) => {
    Swal.fire({ title, text, icon, confirmButtonText: 'Aceptar' });
  };

  const handleDelete = async (cv) => {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteDoc(doc(db, 'cv', cv.id));
        fetchData();
        showAlert('Eliminado', 'El CV ha sido eliminado.', 'success');
      }
    });
  };

  const handleApprove = async (cv) => {
    await updateDoc(doc(db, 'cv', cv.id), { estado: 'aprobado' });
    fetchData();
    showAlert('Aprobado', 'El CV ha sido aprobado.', 'success');
  };

  const handleRejectClick = (cv) => {
    setCvToReject(cv);
    setMotivoRechazo('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!motivoRechazo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Debes proporcionar un motivo para el rechazo.',
      });
      return;
    }

    try {
      await updateDoc(doc(db, 'cv', cvToReject.id), { 
        estado: 'no aprobado',
        motivoRechazo: motivoRechazo,
        fechaRechazo: new Date()
      });
      
      setRejectDialogOpen(false);
      setCvToReject(null);
      setMotivoRechazo('');
      fetchData();
      showAlert('Rechazado', 'El CV ha sido rechazado con el motivo proporcionado.', 'success');
    } catch (error) {
      console.error('Error al rechazar CV:', error);
      showAlert('Error', 'No se pudo rechazar el CV.', 'error');
    }
  };

  const handleRejectCancel = () => {
    setRejectDialogOpen(false);
    setCvToReject(null);
    setMotivoRechazo('');
  };

  const handleEdit = (cv) => {
    setSelectedCV({ ...cv });
    setOpen(true);
  };

  const handleSave = async () => {
    if (selectedCV && selectedCV.id) {
      await updateDoc(doc(db, 'cv', selectedCV.id), selectedCV);
      fetchData();
      setOpen(false);
      showAlert('Actualizado', 'El CV ha sido actualizado.', 'success');
    }
  };

  const handleDownload = (cv) => {
    if (cv.cv) {
      window.open(cv.cv, '_blank');
    } else {
      showAlert('Error', 'No se encontró el archivo del CV.', 'error');
    }
  };

  return (
    <div>
      <Button onClick={() => setCurrentView('active')}>Activos</Button>
      <Button onClick={() => setCurrentView('pending')}>Pendientes</Button>
      <Button onClick={() => setCurrentView('rejected')}>Rechazados</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Foto</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              {currentView === 'rejected' && <TableCell>Motivo Rechazo</TableCell>}
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(currentView === 'active' ? activeCVs : currentView === 'pending' ? pendingCVs : rejectedCVs).map((cv) => (
              <TableRow key={cv.id}>
                <TableCell><Avatar src={cv.Foto} /></TableCell>
                <TableCell>{cv.Nombre}</TableCell>
                <TableCell>{cv.Apellido}</TableCell>
                <TableCell>{cv.Email}</TableCell>
                <TableCell>{cv.Telefono}</TableCell>
                {currentView === 'rejected' && (
                  <TableCell>
                    {cv.motivoRechazo || 'No especificado'}
                  </TableCell>
                )}
                <TableCell>
                  <IconButton onClick={() => handleDownload(cv)}><DownloadIcon /></IconButton>
                  {currentView !== 'active' && (
                    <>
                      <IconButton onClick={() => handleApprove(cv)}><ThumbUpIcon /></IconButton>
                      <IconButton onClick={() => handleRejectClick(cv)}><ThumbDownIcon /></IconButton>
                      <IconButton onClick={() => handleEdit(cv)}><EditIcon /></IconButton>
                    </>
                  )}
                  <IconButton onClick={() => handleDelete(cv)}><DeleteForeverIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para rechazar CV */}
      <Dialog open={rejectDialogOpen} onClose={handleRejectCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Rechazar CV</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Proporciona un motivo para el rechazo del CV de {cvToReject?.Nombre} {cvToReject?.Apellido}:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Motivo del rechazo"
            value={motivoRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
            placeholder="Ejemplo: La foto de perfil no es adecuada, el CV no está en formato correcto, etc."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectCancel}>Cancelar</Button>
          <Button onClick={handleRejectConfirm} variant="contained" color="error">
            Rechazar CV
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
