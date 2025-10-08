import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { db } from '../../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getDownloadUrl } from '../../../lib/controlFileStorage';
import ControlFileAvatar from '../../common/ControlFileAvatar';
import { 
  Button, 
  Box, 
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Container,
  Divider,
  IconButton,
  Modal,
  Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

const Dashboard = () => {
  const [activeCVs, setActiveCVs] = useState([]);
  const [pendingCVs, setPendingCVs] = useState([]);
  const [rejectedCVs, setRejectedCVs] = useState([]);
  const [currentView, setCurrentView] = useState('pending');
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
      cancelButtonText: 'Cancelar'
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

  // Obtener los CVs actuales según la vista
  const getCurrentCVs = () => {
    switch (currentView) {
      case 'active':
        return activeCVs;
      case 'pending':
        return pendingCVs;
      case 'rejected':
        return rejectedCVs;
      default:
        return [];
    }
  };

  // Obtener chip de estado
  const getStatusChip = (view) => {
    switch (view) {
      case 'active':
        return { label: 'Aprobado', color: 'success' };
      case 'pending':
        return { label: 'Pendiente', color: 'warning' };
      case 'rejected':
        return { label: 'Rechazado', color: 'error' };
      default:
        return { label: 'Desconocido', color: 'default' };
    }
  };

  const currentCVs = getCurrentCVs();
  const statusChip = getStatusChip(currentView);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header con título y botones de vista */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Panel de Administración de CVs
        </Typography>
        
        {/* Botones de navegación entre vistas */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2, 
          mt: 3 
        }}>
          {/* Móvil: Pendientes arriba */}
          <Button 
            variant={currentView === 'pending' ? 'contained' : 'outlined'}
            onClick={() => setCurrentView('pending')}
            size="large"
            sx={{ 
              width: { xs: '100%', md: 'auto' },
              fontSize: { xs: '1rem', md: '1rem' }
            }}
          >
            Pendientes ({pendingCVs.length})
          </Button>
          
          {/* Móvil: Activos y Rechazados abajo en una fila */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            width: { xs: '100%', md: 'auto' }
          }}>
            <Button 
              variant={currentView === 'active' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('active')}
              size="large"
              sx={{ 
                flex: { xs: 1, md: 'none' },
                fontSize: { xs: '0.875rem', md: '1rem' },
                whiteSpace: 'nowrap'
              }}
            >
              Activos ({activeCVs.length})
            </Button>
            
            <Button 
              variant={currentView === 'rejected' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('rejected')}
              size="large"
              sx={{ 
                flex: { xs: 1, md: 'none' },
                fontSize: { xs: '0.875rem', md: '1rem' },
                whiteSpace: 'nowrap'
              }}
            >
              Rechazados ({rejectedCVs.length})
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Grid de Cards */}
      {currentCVs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No hay CVs {currentView === 'active' ? 'aprobados' : currentView === 'pending' ? 'pendientes' : 'rechazados'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {currentCVs.map((cv) => (
            <Grid item xs={12} sm={6} md={4} key={cv.id}>
              <Box sx={{ position: 'relative' }}>
                {/* Chip de estado en la esquina */}
                <Chip 
                  label={statusChip.label} 
                  color={statusChip.color} 
                  size="small"
                  sx={{ 
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    zIndex: 1,
                    fontWeight: 'bold',
                    boxShadow: 2
                  }}
                />
                
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header con foto, nombre, email y chip */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>
                      {/* Debug: Log para ver qué valor tiene cv.Foto */}
                      {console.log('🔍 Debug Avatar - cv.Foto:', cv.Foto, 'para usuario:', cv.Nombre)}
                      <ControlFileAvatar fileId={cv.Foto} sx={{ width: 64, height: 64 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 1 }}>
                        {cv.Nombre} {cv.Apellido}
                      </Typography>
                      
                      {/* Email */}
                      {cv.Email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              wordBreak: 'break-word',
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {cv.Email}
                          </Typography>
                        </Box>
                      )}

                      {/* Teléfono si existe */}
                      {cv.Telefono && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {cv.Telefono}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ mt: 0.5, mb: 1 }} />

                  {/* Información del CV - Categoría y Ubicación en la misma fila */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Categoría y Ubicación en la misma fila */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {(cv.categoriaGeneral || cv.Profesion) && (
                        <Box sx={{ flex: 1, minWidth: '120px' }}>
                          <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>
                            {cv.categoriaGeneral || cv.Profesion}
                          </Typography>
                        </Box>
                      )}

                      {(cv.ciudad || cv.Ciudad) && (
                        <Box sx={{ flex: 1, minWidth: '120px' }}>
                          <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>
                            {cv.ciudad && cv.estadoProvincia && cv.pais
                              ? `${cv.ciudad}, ${cv.estadoProvincia}, ${cv.pais}`
                              : cv.Ciudad || 'No especificada'}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Motivo de rechazo si aplica */}
                    {currentView === 'rejected' && cv.motivoRechazo && (
                      <Box 
                        sx={{ 
                          mt: 1, 
                          p: 1.5, 
                          bgcolor: 'error.light', 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'error.main'
                        }}
                      >
                        <Typography variant="caption" color="error.dark" display="block" fontWeight="bold">
                          Motivo de rechazo:
                        </Typography>
                        <Typography variant="body2" color="error.dark" sx={{ mt: 0.5 }}>
                          {cv.motivoRechazo}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                {/* Acciones */}
                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'center', gap: 1 }}>
                  {/* Botón de vista previa */}
                  <IconButton 
                    onClick={() => handlePreviewCV(cv)} 
                    title="Ver CV"
                    color="primary"
                    sx={{ 
                      bgcolor: 'primary.light', 
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.main' }
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  
                  {/* Botón de descarga */}
                  <IconButton 
                    onClick={() => handleDownload(cv)} 
                    title="Descargar CV"
                    color="info"
                    sx={{ 
                      bgcolor: 'info.light', 
                      color: 'info.contrastText',
                      '&:hover': { bgcolor: 'info.main' }
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>

                  {/* Botones de acción para pendientes y rechazados */}
                  {currentView !== 'active' && (
                    <>
                      {/* Botón de aprobar */}
                      <IconButton 
                        onClick={() => handleApprove(cv)} 
                        title="Aprobar CV"
                        color="success"
                        sx={{ 
                          bgcolor: 'success.light', 
                          color: 'success.contrastText',
                          '&:hover': { bgcolor: 'success.main' }
                        }}
                      >
                        <ThumbUpIcon />
                      </IconButton>
                      
                      {/* Botón de rechazar */}
                      <IconButton 
                        onClick={() => handleRejectClick(cv)} 
                        title="Rechazar CV"
                        color="error"
                        sx={{ 
                          bgcolor: 'error.light', 
                          color: 'error.contrastText',
                          '&:hover': { bgcolor: 'error.main' }
                        }}
                      >
                        <ThumbDownIcon />
                      </IconButton>
                    </>
                  )}

                  {/* Botón de eliminar */}
                  <IconButton 
                    onClick={() => handleDelete(cv)} 
                    title="Eliminar CV"
                    color="error"
                    sx={{ 
                      bgcolor: 'error.light', 
                      color: 'error.contrastText',
                      '&:hover': { bgcolor: 'error.main' }
                    }}
                  >
                    <DeleteForeverIcon />
                  </IconButton>
                </CardActions>
                </Card>
              </Box>
            </Grid>
            ))}
        </Grid>
      )}

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
            width: { xs: '95%', sm: '90%' },
            height: { xs: '95%', sm: '90%' },
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header del modal */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2" id="preview-modal-title" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button onClick={handleClosePreview} variant="outlined" sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Cerrar
            </Button>
            {previewUrl && (
              <Button
                variant="contained"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
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
    </Container>
  );
};

export default Dashboard;
