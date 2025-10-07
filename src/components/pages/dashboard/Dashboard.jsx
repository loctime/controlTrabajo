import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { db } from '../../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getDownloadUrl } from '../../../lib/controlFileStorage';

const BACKEND = import.meta.env.VITE_CONTROLFILE_BACKEND;
import ControlFileAvatar from '../../common/ControlFileAvatar';
import { 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Modal, 
  Box, 
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
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
  
  // Estados para vista previa
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

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

  const isUrl = (str) => {
    if (!str) return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownload = async (cv) => {
    if (cv.cv) {
      try {
        // Mostrar loading
        Swal.fire({
          title: 'Obteniendo archivo...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        console.log('📥 Obteniendo URL de descarga para:', cv.cv);
        const downloadUrl = await getDownloadUrl(cv.cv);
        
        Swal.close();
        
        // Descargar archivo directamente
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = cv.Nombre + '_' + cv.Apellido + '_CV';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('❌ Error al obtener URL de descarga:', error);
        showAlert('Error', 'No se pudo obtener el archivo. Inténtalo nuevamente.', 'error');
      }
    } else {
      showAlert('Error', 'No se encontró el archivo del CV.', 'error');
    }
  };

  // Función para abrir vista previa
  const handlePreviewCV = async (cv) => {
    if (!cv.cv) {
      showAlert('Error', 'No se encontró el archivo del CV.', 'error');
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewOpen(true);
      
      console.log('📄 Abriendo vista previa para:', cv.cv);
      const downloadUrl = await getDownloadUrl(cv.cv);
      
      setPreviewUrl(downloadUrl);
      setPreviewFileName(`${cv.Nombre}_${cv.Apellido}_CV`);
      setPreviewLoading(false);
    } catch (error) {
      console.error('❌ Error al obtener URL de vista previa:', error);
      showAlert('Error', 'No se pudo cargar la vista previa del CV.', 'error');
      setPreviewLoading(false);
      setPreviewOpen(false);
    }
  };

  // Función para cerrar vista previa
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl('');
    setPreviewFileName('');
    setPreviewLoading(false);
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
                <TableCell><ControlFileAvatar fileId={cv.Foto} /></TableCell>
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
                  <IconButton onClick={() => handlePreviewCV(cv)} title="Ver CV">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDownload(cv)} title="Descargar CV">
                    <DownloadIcon />
                  </IconButton>
                  {currentView !== 'active' && (
                    <>
                      <IconButton onClick={() => handleApprove(cv)} title="Aprobar">
                        <ThumbUpIcon />
                      </IconButton>
                      <IconButton onClick={() => handleRejectClick(cv)} title="Rechazar">
                        <ThumbDownIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(cv)} title="Editar">
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                  <IconButton onClick={() => handleDelete(cv)} title="Eliminar">
                    <DeleteForeverIcon />
                  </IconButton>
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

      {/* Modal de Vista Previa */}
      <Modal
        open={previewOpen}
        onClose={handleClosePreview}
        aria-labelledby="preview-modal-title"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            height: '90%',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header del modal */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2" id="preview-modal-title">
              Vista Previa: {previewFileName}
            </Typography>
            <IconButton onClick={handleClosePreview} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenido del modal */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {previewLoading ? (
              <CircularProgress size={60} />
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title={`Vista previa de ${previewFileName}`}
              />
            ) : (
              <Typography>No se pudo cargar la vista previa</Typography>
            )}
          </Box>

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={handleClosePreview} variant="outlined">
              Cerrar
            </Button>
            {previewUrl && (
              <Button
                variant="contained"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewUrl;
                  link.download = previewFileName;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Descargar
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Dashboard;
