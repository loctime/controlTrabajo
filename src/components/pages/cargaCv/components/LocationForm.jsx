import React from 'react';
import { Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { PAISES, getEstadosPorPais } from '../../../../constants/locations';

export const LocationForm = ({ 
  newCv, 
  handleChange, 
  handlePaisChange, 
  handleEstadoChange, 
  estadosDisponibles
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
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth required>
            <InputLabel id="pais-label">País *</InputLabel>
            <Select
              labelId="pais-label"
              name="pais"
              value={newCv.pais || ""}
              onChange={handlePaisChange}
              label="País *"
            >
              <MenuItem value="" disabled>Seleccione un país</MenuItem>
              {PAISES.map((pais, index) => (
                <MenuItem key={index} value={pais}>{pais}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          {newCv.pais && estadosDisponibles.length > 0 ? (
            <FormControl fullWidth required>
              <InputLabel id="estado-label">Estado/Provincia *</InputLabel>
              <Select
                labelId="estado-label"
                name="estadoProvincia"
                value={newCv.estadoProvincia || ""}
                onChange={handleEstadoChange}
                label="Estado/Provincia *"
              >
                <MenuItem value="" disabled>Seleccione estado/provincia</MenuItem>
                {estadosDisponibles.map((estadoItem, index) => (
                  <MenuItem key={index} value={estadoItem}>{estadoItem}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField 
              variant="outlined" 
              label="Estado/Provincia *" 
              name="estadoProvincia" 
              value={newCv.estadoProvincia} 
              onChange={handleChange} 
              required 
              fullWidth 
            />
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            variant="outlined" 
            label="Ciudad *" 
            name="ciudad" 
            value={newCv.ciudad} 
            onChange={handleChange} 
            required 
            fullWidth 
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            variant="outlined" 
            label="Localidad/Barrio (opcional)" 
            name="localidad" 
            value={newCv.localidad} 
            onChange={handleChange} 
            fullWidth 
          />
        </Grid>
      </Grid>
    </>
  );
};



