import React from 'react';
import { Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { CIUDADES_DISPONIBLES } from '../../../../constants/locations';

export const LocationForm = ({ 
  newCv, 
  handleChange
}) => {
  return (
    <>
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          📍 Ubicación
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          Completa tu información de ubicación
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="ciudad-label">Ciudad *</InputLabel>
            <Select
              labelId="ciudad-label"
              name="ciudad"
              value={newCv.ciudad || ""}
              onChange={handleChange}
              label="Ciudad *"
            >
              <MenuItem value="" disabled>Seleccione una ciudad</MenuItem>
              {CIUDADES_DISPONIBLES.map((ciudad, index) => (
                <MenuItem key={index} value={ciudad}>{ciudad}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField 
            variant="outlined" 
            label="Localidad/Barrio (opcional)" 
            name="localidad" 
            value={newCv.localidad || ""} 
            onChange={handleChange} 
            fullWidth 
          />
        </Grid>
      </Grid>
    </>
  );
};



