import React, { useState, memo, useCallback, useMemo } from 'react';
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
import skillsData from './skills.json';

// Extraer todas las habilidades en una lista plana
const SKILLS_SUGERIDAS = skillsData.flatMap(categoria => categoria.habilidades).sort();

// Obtener todas las categorías disponibles
const CATEGORIAS = skillsData.map(item => item.categoria);

export const SkillsForm = memo(({ newCv, handleChange }) => {
  const [nuevaHabilidad, setNuevaHabilidad] = useState('');
  const [nivelHabilidad, setNivelHabilidad] = useState('Intermedio');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  
  const habilidades = newCv.habilidades || [];

  // Filtrar habilidades por categoría seleccionada
  const habilidadesFiltradas = useMemo(() => {
    if (categoriaFiltro === 'Todas') return SKILLS_SUGERIDAS;
    const categoriaData = skillsData.find(cat => cat.categoria === categoriaFiltro);
    return categoriaData ? categoriaData.habilidades.sort() : [];
  }, [categoriaFiltro]);

  const addHabilidad = useCallback(() => {
    if (nuevaHabilidad.trim()) {
      const habilidad = {
        id: uuidv4(),
        nombre: nuevaHabilidad.trim(),
        nivel: nivelHabilidad
      };
      
      handleChange({
        target: {
          name: 'habilidades',
          value: [...habilidades, habilidad]
        }
      });
      
      setNuevaHabilidad('');
    }
  }, [nuevaHabilidad, nivelHabilidad, habilidades, handleChange]);

  const removeHabilidad = useCallback((id) => {
    const nuevasHabilidades = habilidades.filter(h => h.id !== id);
    handleChange({
      target: {
        name: 'habilidades',
        value: nuevasHabilidades
      }
    });
  }, [habilidades, handleChange]);

  const getNivelColor = useCallback((nivel) => {
    switch (nivel) {
      case 'Básico': return 'default';
      case 'Intermedio': return 'primary';
      case 'Avanzado': return 'secondary';
      case 'Experto': return 'success';
      default: return 'default';
    }
  }, []);

  return (
    <>
      <Box sx={{ 
        mt: 4, 
        mb: 3,
        p: 3,
        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
        borderRadius: '12px',
        border: '2px solid #9c27b0',
        boxShadow: '0 4px 12px rgba(156, 39, 176, 0.15)'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#6a1b9a',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          🛠️ Habilidades y Competencias
        </Typography>
      </Box>
      
      <Typography variant="body1" sx={{ 
        mb: 4, 
        color: '#424242',
        fontSize: '1.1rem',
        fontWeight: 500,
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        borderLeft: '4px solid #9c27b0'
      }}>
        ⭐ Agrega tus habilidades técnicas y competencias profesionales. Incluye tanto habilidades duras como blandas.
      </Typography>

      {/* Formulario para agregar nueva habilidad */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        border: '2px solid #e1bee7', 
        borderRadius: '12px', 
        backgroundColor: '#fafafa',
        boxShadow: '0 2px 8px rgba(156, 39, 176, 0.1)'
       }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={categoriaFiltro}
                label="Categoría"
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                <MenuItem value="Todas">📋 Todas las categorías</MenuItem>
                {CATEGORIAS.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              freeSolo
              options={habilidadesFiltradas}
              value={nuevaHabilidad}
              onInputChange={(event, newValue) => setNuevaHabilidad(newValue)}
              filterOptions={(options, { inputValue }) => {
                if (!inputValue) return options.slice(0, 50);
                return options.filter(option =>
                  option.toLowerCase().includes(inputValue.toLowerCase())
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar o escribir habilidad"
                  placeholder="Escribe para buscar o agregar nueva..."
                  variant="outlined"
                  size="small"
                  helperText={`${habilidadesFiltradas.length} sugerencias ${categoriaFiltro !== 'Todas' ? `en ${categoriaFiltro}` : 'disponibles'} · Presiona Enter para agregar`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && nuevaHabilidad.trim()) {
                      e.preventDefault();
                      addHabilidad();
                    }
                  }}
                />
              )}
              noOptionsText="Escribe tu propia habilidad"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Nivel</InputLabel>
              <Select
                value={nivelHabilidad}
                label="Nivel"
                onChange={(e) => setNivelHabilidad(e.target.value)}
              >
                <MenuItem value="Básico">Básico</MenuItem>
                <MenuItem value="Intermedio">Intermedio</MenuItem>
                <MenuItem value="Avanzado">Avanzado</MenuItem>
                <MenuItem value="Experto">Experto</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={addHabilidad}
              fullWidth
              disabled={!nuevaHabilidad.trim()}
            >
              Agregar
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Lista de habilidades agregadas */}
      {habilidades.length > 0 ? (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Habilidades agregadas ({habilidades.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {habilidades.map((habilidad) => (
              <Chip
                key={habilidad.id}
                label={`${habilidad.nombre} - ${habilidad.nivel}`}
                color={getNivelColor(habilidad.nivel)}
                onDelete={() => removeHabilidad(habilidad.id)}
                variant="outlined"
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 3, border: '2px dashed #ccc', borderRadius: 1 }}>
          <Typography variant="body1" color="text.secondary">
            No has agregado ninguna habilidad aún
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usa el formulario de arriba para agregar tus habilidades
          </Typography>
        </Box>
      )}

      {/* Sugerencias rápidas */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          {categoriaFiltro !== 'Todas' 
            ? `✨ Sugerencias de ${categoriaFiltro}:` 
            : '✨ Sugerencias populares:'}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {habilidadesFiltradas.slice(0, 15).map((skill) => (
            <Chip
              key={skill}
              label={skill}
              variant="outlined"
              size="small"
              onClick={() => {
                setNuevaHabilidad(skill);
              }}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'primary.light', color: 'white' } }}
            />
          ))}
        </Box>
      </Box>
    </>
  );
});

SkillsForm.displayName = 'SkillsForm';
