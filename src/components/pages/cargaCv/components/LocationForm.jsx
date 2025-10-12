import React from 'react';
import { Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { CIUDADES_DISPONIBLES } from '../../../../constants/locations';
import { withFormMemo } from './FormMemoHelper';

const LocationFormComponent = ({ 
  newCv, 
  handleChange
}) => {
  return (
    <>
      <Box sx={{ 
        mt: 1, 
        mb: 1,
        p: 1,
        background: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
        borderRadius: '12px',
        border: '2px solid #03a9f4',
        boxShadow: '0 4px 12px rgba(3, 169, 244, 0.15)'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#0277bd',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          📍 Ubicación
        </Typography>
      </Box>
      
      <Box sx={{ 
        p: 3,
        backgroundColor: '#fafafa',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
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
      </Box>
    </>
  );
};

LocationFormComponent.displayName = 'LocationFormComponent';

// Memorizar con solo los campos relevantes
export const LocationForm = withFormMemo(
  LocationFormComponent,
  ['ciudad', 'localidad']
);
