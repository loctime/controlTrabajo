import React, { memo } from 'react';
import { Grid, TextField, Typography, Box } from '@mui/material';

export const ContactForm = memo(({ newCv, handleChange }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
        📞 Información de Contacto
      </Typography>
      
      <Grid container spacing={3}>
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
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            variant="outlined" 
            label="LinkedIn" 
            name="linkedin" 
            value={newCv.linkedin || ""} 
            onChange={handleChange} 
            fullWidth 
            placeholder="https://linkedin.com/in/tu-perfil"
            helperText="URL de tu perfil de LinkedIn"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6}>
          <TextField 
            variant="outlined" 
            label="Sitio Web" 
            name="sitioWeb" 
            value={newCv.sitioWeb || ""} 
            onChange={handleChange} 
            fullWidth 
            placeholder="https://tu-sitio-web.com"
            helperText="Tu sitio web personal o portafolio (opcional)"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <TextField 
          variant="outlined" 
          label="Perfil Profesional" 
          name="perfilProfesional" 
          value={newCv.perfilProfesional || ""} 
          onChange={handleChange} 
          fullWidth 
          multiline
          rows={3}
          placeholder="Breve descripción de tu perfil profesional, experiencia y objetivos (2-3 líneas máximo)"
          helperText="Describe brevemente tu experiencia y objetivos profesionales"
          inputProps={{ maxLength: 300 }}
        />
      </Box>
    </>
  );
});

ContactForm.displayName = 'ContactForm';
