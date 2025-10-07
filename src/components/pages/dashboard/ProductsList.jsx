import React, { useEffect, useState } from 'react';
import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Modal,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { db, storage } from '../../../firebaseConfig';
import { deleteDoc, doc, collection, getDocs, updateDoc } from 'firebase/firestore';
import CvForm from './ProductsForm';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const CVList = ({ cvs, setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [cvSelected, setCVSelected] = useState(null);

  useEffect(() => {
    const fetchCVs = async () => {
      const cvCollection = collection(db, 'cv');
      const querySnapshot = await getDocs(cvCollection);
      const cvData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCVs(cvData);
    };

    fetchCVs();
  }, [setIsChange]);

  const deleteCV = async (id) => {
    await deleteDoc(doc(db, 'cv', id));
    setIsChange(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (cv) => {
    setCVSelected(cv);
    setOpen(true);
  };

  return (
    <div>
      <Button variant="contained" onClick={() => handleOpen(null)}>
        Agregar nuevo CV
      </Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">ID</TableCell>
              <TableCell align="left">Nombre</TableCell>
              <TableCell align="left">Apellido</TableCell>
              <TableCell align="left">Edad</TableCell>
              <TableCell align="left">Profesión</TableCell>
              <TableCell align="left">Foto</TableCell>
              <TableCell align="left">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cvs.map((cv) => (
              <TableRow key={cv.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" align="left">
                  {cv.id}
                </TableCell>
                <TableCell align="left">{cv.Nombre}</TableCell>
                <TableCell align="left">{cv.Apellido}</TableCell>
                <TableCell align="left">{cv.Edad}</TableCell>
                <TableCell align="left">{cv.Profesion}</TableCell>
                <TableCell component="th" scope="row" align="left">
                  <img src={cv.Foto} alt="" style={{ width: '80px', height: '80px' }} />
                </TableCell>
                <TableCell align="left">
                  <IconButton onClick={() => handleOpen(cv)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton onClick={() => deleteCV(cv.id)}>
                    <DeleteForeverIcon color="primary" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

export default CVList;
