import React, { useState, useMemo, memo, useCallback } from 'react';
import { 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  Typography,
  Autocomplete,
  Box,
  Button,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { CATEGORIAS_GENERALES } from '../../../../constants/categories';

export const ProfessionalDataForm = memo(({ newCv, handleChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Agregar "Otros" a las categorías
  const categoriasConOtros = useMemo(() => [...CATEGORIAS_GENERALES, 'Otros'], []);

  // Filtrar categorías basado en el término de búsqueda
  const filteredCategorias = useMemo(() => {
    if (!searchTerm) return categoriasConOtros;
    return categoriasConOtros.filter(categoria =>
      categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, categoriasConOtros]);

  const handleCategoriaChange = useCallback((event, newValue) => {
    if (newValue === 'Otros') {
      setShowCustomInput(true);
      handleChange({
        target: {
          name: 'categoriaGeneral',
          value: ''
        }
      });
    } else {
      setShowCustomInput(false);
      handleChange({
        target: {
          name: 'categoriaGeneral',
          value: newValue || ''
        }
      });
    }
  }, [handleChange]);

  const handleCustomCategoriaChange = useCallback((event) => {
    handleChange({
      target: {
        name: 'categoriaGeneral',
        value: event.target.value
      }
    });
  }, [handleChange]);

  const handleBackToList = useCallback(() => {
    setShowCustomInput(false);
    setSearchTerm('');
    handleChange({
      target: {
        name: 'categoriaGeneral',
        value: ''
      }
    });
  }, [handleChange]);
  
  return (
    <>
      <Box sx={{ 
        mt: 4, 
        mb: 3,
        p: 3,
        background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
        borderRadius: '12px',
        border: '2px solid #4caf50',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#2e7d32',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          💼 Información Profesional y contacto
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
        <Grid item xs={12} sm={6} md={4}>
          {!showCustomInput ? (
            <Autocomplete
              options={filteredCategorias}
              value={newCv.categoriaGeneral || null}
              onChange={handleCategoriaChange}
              onInputChange={(event, newInputValue) => {
                setSearchTerm(newInputValue);
              }}
              getOptionLabel={(option) => option || ''}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categoría Profesional *"
                  required
                  helperText="Busca o selecciona una categoría"
                  variant="outlined"
                />
              )}
              renderOption={(props, option, { index }) => (
                <Box component="li" {...props} key={`${option}-${index}`}>
                  {option === 'Otros' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>📝</span>
                      <span>{option} - Escribir categoría personalizada</span>
                    </Box>
                  ) : (
                    option
                  )}
                </Box>
              )}
              noOptionsText="No se encontraron categorías"
              freeSolo={false}
              fullWidth
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={handleBackToList}
                  size="small"
                  sx={{ color: 'primary.main' }}
                  title="Volver a la lista"
                >
                  <ArrowBack />
                </IconButton>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  Modo personalizado
                </Typography>
              </Box>
              <TextField
                label="Categoría Profesional Personalizada *"
                name="categoriaGeneral"
                value={newCv.categoriaGeneral || ""}
                onChange={handleCustomCategoriaChange}
                fullWidth
                required
                helperText="Escribe tu categoría profesional específica"
                variant="outlined"
                placeholder="Ejemplo: Diseñador Gráfico, Contador Público..."
              />
            </Box>
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <TextField 
            variant="outlined" 
            label="Profesión Específica (opcional)" 
            name="categoriaEspecifica" 
            value={newCv.categoriaEspecifica} 
            onChange={handleChange} 
            fullWidth 
            helperText="Ejemplo: Electricista, Pïntor, etc."
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
      </Box>
      
    </>
  );
});

ProfessionalDataForm.displayName = 'ProfessionalDataForm';

