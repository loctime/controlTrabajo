import React, { useState } from 'react';
import { 
  Grid, 
  TextField, 
  Typography, 
  Box, 
  Button, 
  Chip, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Autocomplete
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

// Lista de idiomas comunes
const IDIOMAS_DISPONIBLES = [
  'Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués',
  'Catalán', 'Euskera', 'Gallego', 'Chino', 'Japonés', 'Coreano',
  'Árabe', 'Ruso', 'Holandés', 'Sueco', 'Noruego', 'Danés',
  'Polaco', 'Checo', 'Húngaro', 'Rumano', 'Búlgaro', 'Griego',
  'Turco', 'Hebreo', 'Hindi', 'Bengalí', 'Tailandés', 'Vietnamita'
];

export const LanguagesForm = ({ newCv, handleChange }) => {
  const [nuevoIdioma, setNuevoIdioma] = useState('');
  const [nivelIdioma, setNivelIdioma] = useState('Intermedio');
  
  const idiomas = newCv.idiomas || [];

  const addIdioma = () => {
    if (nuevoIdioma.trim()) {
      const idioma = {
        id: uuidv4(),
        idioma: nuevoIdioma.trim(),
        nivel: nivelIdioma
      };
      
      handleChange({
        target: {
          name: 'idiomas',
          value: [...idiomas, idioma]
        }
      });
      
      setNuevoIdioma('');
    }
  };

  const removeIdioma = (id) => {
    const nuevosIdiomas = idiomas.filter(i => i.id !== id);
    handleChange({
      target: {
        name: 'idiomas',
        value: nuevosIdiomas
      }
    });
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'Básico': return 'default';
      case 'Intermedio': return 'primary';
      case 'Avanzado': return 'secondary';
      case 'Nativo': return 'success';
      default: return 'default';
    }
  };

  const getNivelDescription = (nivel) => {
    switch (nivel) {
      case 'Básico': return 'A1-A2 (Puedo comunicarme de forma básica)';
      case 'Intermedio': return 'B1-B2 (Puedo mantener conversaciones fluidas)';
      case 'Avanzado': return 'C1-C2 (Dominio avanzado del idioma)';
      case 'Nativo': return 'Lengua materna o nivel nativo';
      default: return '';
    }
  };

  return (
    <>
      <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
        🌍 Idiomas
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Especifica los idiomas que dominas y tu nivel de competencia en cada uno.
      </Typography>

      {/* Formulario para agregar nuevo idioma */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              freeSolo
              options={IDIOMAS_DISPONIBLES}
              value={nuevoIdioma}
              onInputChange={(event, newValue) => setNuevoIdioma(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Idioma"
                  placeholder="Ej: Inglés, Francés..."
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Nivel</InputLabel>
              <Select
                value={nivelIdioma}
                label="Nivel"
                onChange={(e) => setNivelIdioma(e.target.value)}
              >
                <MenuItem value="Básico">Básico (A1-A2)</MenuItem>
                <MenuItem value="Intermedio">Intermedio (B1-B2)</MenuItem>
                <MenuItem value="Avanzado">Avanzado (C1-C2)</MenuItem>
                <MenuItem value="Nativo">Nativo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2} md={2}>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={addIdioma}
              fullWidth
              disabled={!nuevoIdioma.trim()}
            >
              Agregar
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Lista de idiomas agregados */}
      {idiomas.length > 0 ? (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Idiomas agregados ({idiomas.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {idiomas.map((idioma) => (
              <Box key={idioma.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                  {idioma.idioma}
                </Typography>
                <Chip
                  label={idioma.nivel}
                  color={getNivelColor(idioma.nivel)}
                  variant="outlined"
                  size="small"
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }}>
                  {getNivelDescription(idioma.nivel)}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeIdioma(idioma.id)}
                >
                  Eliminar
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 3, border: '2px dashed #ccc', borderRadius: 1 }}>
          <Typography variant="body1" color="text.secondary">
            No has agregado ningún idioma aún
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usa el formulario de arriba para agregar tus idiomas
          </Typography>
        </Box>
      )}

      {/* Información sobre niveles */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f8ff', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          📚 Niveles de competencia (Marco Común Europeo):
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Básico (A1-A2):</strong> Puedes comunicarte de forma básica en situaciones familiares
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Intermedio (B1-B2):</strong> Puedes mantener conversaciones fluidas y expresar ideas complejas
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Avanzado (C1-C2):</strong> Dominio avanzado del idioma, casi nativo
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Nativo:</strong> Lengua materna o nivel nativo equivalente
          </Typography>
        </Box>
      </Box>
    </>
  );
};
