import React, { useState, memo, useCallback } from 'react';
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

export const LanguagesForm = memo(({ newCv, handleChange }) => {
  const [nuevoIdioma, setNuevoIdioma] = useState('');
  const [nivelIdioma, setNivelIdioma] = useState('Intermedio');
  
  const idiomas = newCv.idiomas || [];

  const addIdioma = useCallback(() => {
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
  }, [nuevoIdioma, nivelIdioma, idiomas, handleChange]);

  const removeIdioma = useCallback((id) => {
    const nuevosIdiomas = idiomas.filter(i => i.id !== id);
    handleChange({
      target: {
        name: 'idiomas',
        value: nuevosIdiomas
      }
    });
  }, [idiomas, handleChange]);

  const getNivelColor = useCallback((nivel) => {
    switch (nivel) {
      case 'Básico': return 'default';
      case 'Intermedio': return 'primary';
      case 'Avanzado': return 'secondary';
      case 'Nativo': return 'success';
      default: return 'default';
    }
  }, []);

  const getNivelDescription = useCallback((nivel) => {
    switch (nivel) {
      case 'Básico': return 'A1-A2 (Puedo comunicarme de forma básica)';
      case 'Intermedio': return 'B1-B2 (Puedo mantener conversaciones fluidas)';
      case 'Avanzado': return 'C1-C2 (Dominio avanzado del idioma)';
      case 'Nativo': return 'Lengua materna o nivel nativo';
      default: return '';
    }
  }, []);

  return (
    <>
      <Box sx={{ 
        mt: 1, 
        mb: 1,
        p: 1,
        background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
        borderRadius: '12px',
        border: '2px solid #e91e63',
        boxShadow: '0 4px 12px rgba(233, 30, 99, 0.15)'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#ad1457',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          🌍 Idiomas    + <span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>Especifica los idiomas que dominas y tu nivel de competencia en cada uno.</span>

        </Typography>
        
      </Box>
 

      {/* Formulario para agregar nuevo idioma */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        border: '2px solid #fce4ec', 
        borderRadius: '12px', 
        backgroundColor: '#fafafa',
        boxShadow: '0 2px 8px rgba(233, 30, 99, 0.1)'
      }}>
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

      {/* Idiomas disponibles para selección rápida - Solo en desktop */}
      <Box sx={{ 
        mt: 3,
        display: { xs: 'none', sm: 'block' } // Ocultar en móvil, mostrar en tablet y desktop
      }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          ✨ Idiomas disponibles ({IDIOMAS_DISPONIBLES.length} total):
        </Typography>
         <Typography variant="caption" sx={{ mb: 2, color: 'text.secondary', display: 'block' }}>
           Haz clic en cualquier idioma para agregarlo rápidamente • Shift+scroll para desplazarte horizontalmente
         </Typography>
        
         {/* Diseño de 3 filas con scroll sincronizado - como tabla */}
         <Box sx={{ 
           width: '100%',
           overflowX: 'auto',
           maxHeight: '120px',
           overflowY: 'auto',
           cursor: 'grab', // Indicar que se puede arrastrar
           '&:active': {
             cursor: 'grabbing', // Cambiar cursor cuando se arrastra
           },
           '&::-webkit-scrollbar': {
             width: '8px',
             height: '8px',
           },
           '&::-webkit-scrollbar-track': {
             backgroundColor: '#f1f1f1',
             borderRadius: '4px',
           },
           '&::-webkit-scrollbar-thumb': {
             backgroundColor: '#c1c1c1',
             borderRadius: '4px',
             '&:hover': {
               backgroundColor: '#a8a8a8',
             },
           },
           // Mejorar la experiencia de scroll del mouse
           '&::-webkit-scrollbar-corner': {
             backgroundColor: '#f1f1f1',
           },
         }}>
           <Box sx={{ 
             display: 'flex',
             flexDirection: 'column',
             gap: 1,
             minWidth: 'max-content', // Esto hace que el contenido determine el ancho total
             width: '100%'
           }}>
             {/* Dividir en 3 filas - todas se mueven juntas */}
             {[
               IDIOMAS_DISPONIBLES.filter((_, index) => index % 3 === 0),
               IDIOMAS_DISPONIBLES.filter((_, index) => index % 3 === 1),
               IDIOMAS_DISPONIBLES.filter((_, index) => index % 3 === 2)
             ].map((fila, filaIndex) => (
               <Box key={filaIndex} sx={{ 
                 display: 'flex', 
                 gap: 1,
                 pb: 0.5,
                 alignItems: 'center'
               }}>
                 {fila.map((idioma) => (
                   <Chip
                     key={idioma}
                     label={idioma}
                     variant="outlined"
                     size="small"
                     onClick={() => {
                       // Agregar directamente el idioma sin pasar por el campo de texto
                       const nuevoIdiomaObj = {
                         id: uuidv4(),
                         idioma: idioma.trim(),
                         nivel: nivelIdioma
                       };
                       
                       handleChange({
                         target: {
                           name: 'idiomas',
                           value: [...idiomas, nuevoIdiomaObj]
                         }
                       });
                       
                       setNuevoIdioma(''); // Limpiar el campo
                     }}
                     sx={{ 
                       cursor: 'pointer',
                       flexShrink: 0,
                       whiteSpace: 'nowrap',
                       fontSize: '0.75rem',
                       height: '24px',
                       minWidth: 'fit-content',
                       '&:hover': { 
                         backgroundColor: 'primary.light', 
                         color: 'white',
                         transform: 'scale(1.05)',
                         transition: 'all 0.2s ease'
                       } 
                     }}
                   />
                 ))}
               </Box>
             ))}
           </Box>
         </Box>
      </Box>

      {/* Mensaje informativo para móviles */}
      <Box sx={{ 
        mt: 2,
        display: { xs: 'block', sm: 'none' }, // Mostrar solo en móvil
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        borderLeft: '4px solid #e91e63'
      }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          💡 <strong>Tip:</strong> Escribe en el campo de búsqueda para ver sugerencias automáticas de idiomas disponibles.
        </Typography>
      </Box>

      {/* Lista de idiomas agregados */}
      {idiomas.length > 0 ? (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Idiomas agregados ({idiomas.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {idiomas.map((idioma) => (
              <Chip
                key={idioma.id}
                label={`${idioma.idioma} - ${idioma.nivel}`}
                color={getNivelColor(idioma.nivel)}
                onDelete={() => removeIdioma(idioma.id)}
                variant="outlined"
                sx={{ mb: 1 }}
              />
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

     
    </>
  );
});

LanguagesForm.displayName = 'LanguagesForm';
