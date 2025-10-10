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

// Lista de habilidades comunes
const SKILLS_SUGERIDAS = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go',
  'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Laravel',
  'HTML', 'CSS', 'SASS', 'Bootstrap', 'Material-UI', 'Tailwind CSS',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
  'Git', 'GitHub', 'GitLab', 'Jenkins', 'CI/CD',
  'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'Adobe XD',
  'Excel', 'PowerPoint', 'Word', 'Google Analytics', 'SEO',
  'Marketing Digital', 'Redes Sociales', 'Email Marketing',
  'Atención al Cliente', 'Ventas', 'Negociación', 'Liderazgo',
  'Trabajo en Equipo', 'Comunicación', 'Resolución de Problemas',
  'Gestión de Proyectos', 'Scrum', 'Agile', 'Lean',
  'Inglés', 'Francés', 'Alemán', 'Portugués', 'Italiano'
];

export const SkillsForm = ({ newCv, handleChange }) => {
  const [nuevaHabilidad, setNuevaHabilidad] = useState('');
  const [nivelHabilidad, setNivelHabilidad] = useState('Intermedio');
  
  const habilidades = newCv.habilidades || [];

  const addHabilidad = () => {
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
  };

  const removeHabilidad = (id) => {
    const nuevasHabilidades = habilidades.filter(h => h.id !== id);
    handleChange({
      target: {
        name: 'habilidades',
        value: nuevasHabilidades
      }
    });
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'Básico': return 'default';
      case 'Intermedio': return 'primary';
      case 'Avanzado': return 'secondary';
      case 'Experto': return 'success';
      default: return 'default';
    }
  };

  return (
    <>
      <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
        🛠️ Habilidades y Competencias
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Agrega tus habilidades técnicas y competencias profesionales. Incluye tanto habilidades duras como blandas.
      </Typography>

      {/* Formulario para agregar nueva habilidad */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              freeSolo
              options={SKILLS_SUGERIDAS}
              value={nuevaHabilidad}
              onInputChange={(event, newValue) => setNuevaHabilidad(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nombre de la habilidad"
                  placeholder="Ej: JavaScript, Marketing Digital..."
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
          
          <Grid item xs={12} sm={2} md={2}>
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
          Sugerencias populares:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {SKILLS_SUGERIDAS.slice(0, 10).map((skill) => (
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
};
