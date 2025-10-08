import React from 'react';
import { Grid, TextField, Box, Typography } from '@mui/material';
import { RingLoader } from 'react-spinners';

export const FilesForm = ({ 
  onImageChange, 
  onCvChange, 
  loadingImage, 
  loadingCv 
}) => {
  return (
    <>
      <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
        📎 Documentos
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <TextField 
              type="file" 
              onChange={onImageChange} 
              helperText="Cargar foto de perfil" 
              required 
              fullWidth 
              inputProps={{ accept: "image/*" }}
            />
            {loadingImage && <RingLoader color="#36D7B7" size={40} />}
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <TextField 
              type="file" 
              onChange={onCvChange} 
              helperText="Cargar curriculum vitae" 
              required 
              fullWidth 
              inputProps={{ accept: ".pdf,.doc,.docx" }}
            />
            {loadingCv && <RingLoader color="#36D7B7" size={40} />}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};


