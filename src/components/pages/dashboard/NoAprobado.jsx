import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getDownloadUrl } from "../../../lib/controlFileStorage";
import ControlFileAvatar from "../../common/ControlFileAvatar";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Grid, Modal, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Swal from "sweetalert2";
import CvForm from "./ProductsForm"; // Asegúrate de importar el componente CvForm adecuadamente

const NoAprobado = () => {
  const [rejectedCVs, setRejectedCVs] = useState([]);
  const [open, setOpen] = useState(false);
  const [cvSelected, setCVSelected] = useState(null);
  const [isChange, setIsChange] = useState(false);

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
      // Si es una URL directa (CV antiguo), abrirla directamente
      if (isUrl(fileId)) {
        console.log('✅ Abriendo URL directa (CV antiguo)');
        window.open(fileId, "_blank");
        return;
      }

      // Si es un fileId de ControlFile, obtener URL temporal
      Swal.fire({
        title: 'Obteniendo archivo...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      console.log('📥 Obteniendo URL de ControlFile para fileId:', fileId);
      const downloadUrl = await getDownloadUrl(fileId);
      
      Swal.close();
      
      // Abrir archivo
      window.open(downloadUrl, "_blank");
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
                      <Button variant="contained" onClick={() => handleDownloadCV(cv.cv)}>
                        Descargar
                      </Button>
                    </TableCell>
                    <TableCell align="left">
                      <IconButton onClick={() => handleOpen(cv)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => deleteCV(cv.id)}>
                        <DeleteForeverIcon color="primary" />
                      </IconButton>
                      {/* Añadido: Icono y función para aprobar el CV */}
                      <IconButton onClick={() => handleApproveCV(cv.id)}>
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
    </div>
  );
};

export default NoAprobado;
