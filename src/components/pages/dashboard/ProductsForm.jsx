import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
} from "@mui/material";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

const CvForm = ({ handleClose, setIsChange, cvSelected, setCvSelected }) => {
  const [formData, setFormData] = useState({
    Nombre: "",
    Apellido: "",
    Edad: "",
    Profesion: "",
    Foto: "",
  });

  useEffect(() => {
    if (cvSelected) {
      setFormData({
        Nombre: cvSelected.Nombre,
        Apellido: cvSelected.Apellido,
        Edad: cvSelected.Edad,
        Profesion: cvSelected.Profesion,
        Foto: cvSelected.Foto,
      });
    }
  }, [cvSelected]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "cv", cvSelected.id), {
        Nombre: formData.Nombre,
        Apellido: formData.Apellido,
        Edad: formData.Edad,
        Profesion: formData.Profesion,
        Foto: formData.Foto,
      });
      setIsChange(true);
      handleClose();
    } catch (error) {
      console.error("Error updating CV: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Editar CV</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="Nombre"
            label="Nombre"
            fullWidth
            value={formData.Nombre}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="Apellido"
            label="Apellido"
            fullWidth
            value={formData.Apellido}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="Edad"
            label="Edad"
            type="number"
            fullWidth
            value={formData.Edad}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="Profesion"
            label="Profesión"
            fullWidth
            value={formData.Profesion}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="Foto"
            label="URL de la foto"
            fullWidth
            value={formData.Foto}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
          <Button onClick={handleClose} variant="contained" color="secondary">
            Cancelar
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default CvForm;
