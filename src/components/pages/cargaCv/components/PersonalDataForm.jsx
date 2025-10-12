import React from 'react';
import { Grid, TextField, Typography, Box } from '@mui/material';
import { withFormMemo } from './FormMemoHelper';

const PersonalDataFormComponent = ({ newCv, handleChange }) => {
  return (
    <>
      <Box sx={{ 
        mt: 1, 
        mb: 1,
        p: 1,
        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
        borderRadius: '12px',
        border: '2px solid #ff9800',
        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#e65100',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          📋 Datos Personales y de contacto
        </Typography>
      </Box>
      
      <Box sx={{ 
        p: 1,
        backgroundColor: '#fafafa',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
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
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            variant="outlined" 
            label="Teléfono" 
            name="telefono" 
            value={newCv.telefono || ""} 
            onChange={handleChange} 
            fullWidth 
            placeholder="+34 123 456 789"
            helperText="Número de contacto"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            variant="outlined" 
            label="Dirección" 
            name="direccion" 
            value={newCv.direccion || ""} 
            onChange={handleChange} 
            fullWidth 
            placeholder="Calle Mayor 123, Ciudad"
            helperText="Dirección completa (opcional)"
          />
        </Grid>
        </Grid>
      </Box>
    </>
  );
};

PersonalDataFormComponent.displayName = 'PersonalDataFormComponent';

// Memorizar con solo los campos relevantes para este formulario
export const PersonalDataForm = withFormMemo(
  PersonalDataFormComponent,
  ['Nombre', 'Apellido', 'Edad', 'Email', 'telefono', 'direccion']
);
