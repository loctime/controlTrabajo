import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getDownloadUrl } from "../../../lib/controlFileStorage";
import ControlFileAvatar from "../../common/ControlFileAvatar";

const BACKEND = import.meta.env.VITE_CONTROLFILE_BACKEND;
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Grid, Modal, Box, Typography, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import CvForm from "./ProductsForm"; // Asegúrate de importar el componente CvForm adecuadamente

const NoAprobado = () => {
  const [rejectedCVs, setRejectedCVs] = useState([]);
  const [open, setOpen] = useState(false);
  const [cvSelected, setCVSelected] = useState(null);
  const [isChange, setIsChange] = useState(false);
  
  // Estados para vista previa
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchRejectedCVs = async () => {
    const cvCollection = collection(db, "cv");
    const querySnapshot = await getDocs(cvCollection);
    const rejectedCVData = querySnapshot.docs
      .filter((doc) => doc.data().estado === "no aprobado")
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    setRejectedCVs(rejectedCVData);
  };

  useEffect(() => {
    fetchRejectedCVs();
  }, [isChange]);

  const isUrl = (str) => {
    if (!str) return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownloadCV = async (fileId) => {
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

      console.log('📥 Obteniendo URL de descarga para:', fileId);
      const downloadUrl = await getDownloadUrl(fileId);
      
      Swal.close();
      
      // Descargar archivo directamente
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'CV_Rechazado';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ Error al obtener URL:', error);
      Swal.fire('Error', 'No se pudo obtener el archivo.', 'error');
    }
  };

  const deleteCV = async (id) => {
    await deleteDoc(doc(db, "cv", id));
    setIsChange(!isChange);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (cv) => {
    setCVSelected(cv);
    setOpen(true);
  };

  // Añadido: función para aprobar un CV
  const handleApproveCV = async (id) => {
    const cvRef = doc(db, "cv", id);
    await updateDoc(cvRef, {
      estado: "aprobado",
    });
    setIsChange(!isChange);
  };

  // Función para abrir vista previa
  const handlePreviewCV = async (cv) => {
    if (!cv.cv) {
      Swal.fire('Error', 'No se encontró el archivo del CV.', 'error');
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
      Swal.fire('Error', 'No se pudo cargar la vista previa del CV.', 'error');
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

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <div>
      <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
        <Grid item>
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Foto</TableCell>
                  <TableCell>Descargar CV</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rejectedCVs.map((cv) => (
                  <TableRow key={cv.id}>
                    <TableCell>{cv.Nombre}</TableCell>
                    <TableCell>{cv.Apellido}</TableCell>
                    <TableCell>{cv.Email}</TableCell>
                    <TableCell component="th" scope="row" align="left">
                      <ControlFileAvatar fileId={cv.Foto} sx={{ width: 80, height: 80 }} />
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => handlePreviewCV(cv)} startIcon={<VisibilityIcon />}>
                        Ver CV
                      </Button>
                      <Button variant="outlined" onClick={() => handleDownloadCV(cv.cv)} sx={{ ml: 1 }}>
                        Descargar
                      </Button>
                    </TableCell>
                    <TableCell align="left">
                      <IconButton onClick={() => handleOpen(cv)} title="Editar">
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => deleteCV(cv.id)} title="Eliminar">
                        <DeleteForeverIcon color="primary" />
                      </IconButton>
                      {/* Añadido: Icono y función para aprobar el CV */}
                      <IconButton onClick={() => handleApproveCV(cv.id)} title="Aprobar">
                        <ThumbUpIcon color="primary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <CvForm
            handleClose={handleClose}
            setIsChange={setIsChange}
            cvSelected={cvSelected}
            setCvSelected={setCVSelected}
          />
        </Box>
      </Modal>

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

export default NoAprobado;
