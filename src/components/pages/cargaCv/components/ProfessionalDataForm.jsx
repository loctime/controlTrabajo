import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Typography } from '@mui/material';
import { CATEGORIAS_GENERALES } from '../../../../constants/categories';

export const ProfessionalDataForm = ({ newCv, handleChange }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
        💼 Información Profesional
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth required>
            <InputLabel id="categoria-general-label">Categoría Profesional *</InputLabel>
            <Select
              labelId="categoria-general-label"
              name="categoriaGeneral"
              value={newCv.categoriaGeneral || ""}
              onChange={handleChange}
              label="Categoría Profesional *"
            >
              <MenuItem value="" disabled>Seleccione una categoría</MenuItem>
              {CATEGORIAS_GENERALES.map((categoria, index) => (
                <MenuItem key={index} value={categoria}>{categoria}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Obligatorio</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <TextField 
            variant="outlined" 
            label="Profesión Específica (opcional)" 
            name="categoriaEspecifica" 
            value={newCv.categoriaEspecifica} 
            onChange={handleChange} 
            fullWidth 
            helperText="Ejemplo: Desarrollador Frontend, Cirujano, etc."
          />
        </Grid>
      </Grid>
    </>
  );
};


