import React, { memo } from 'react';
import { Grid, TextField, Typography } from '@mui/material';

export const PersonalDataForm = memo(({ newCv, handleChange }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
        📋 Datos Personales
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            variant="outlined" 
            label="Nombre *" 
            name="Nombre" 
            value={newCv.Nombre} 
            onChange={handleChange} 
            required 
            fullWidth 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            variant="outlined" 
            label="Apellido *" 
            name="Apellido" 
            value={newCv.Apellido} 
            onChange={handleChange} 
            required 
            fullWidth 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            variant="outlined" 
            label="Edad *" 
            name="Edad" 
            value={newCv.Edad} 
            onChange={handleChange} 
            required 
            fullWidth 
            type="number"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            type="email" 
            label="Correo Electrónico *" 
            name="Email" 
            value={newCv.Email} 
            onChange={handleChange} 
            required 
            fullWidth 
          />
        </Grid>
      </Grid>
    </>
  );
});

PersonalDataForm.displayName = 'PersonalDataForm';

