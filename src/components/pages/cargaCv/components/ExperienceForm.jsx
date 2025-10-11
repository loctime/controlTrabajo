import React, { memo, useCallback } from 'react';
import { 
  Grid, 
  TextField, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  FormControlLabel, 
  Checkbox,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

export const ExperienceForm = memo(({ newCv, handleChange }) => {
  const experiencias = newCv.experiencias || [];

  const addExperiencia = useCallback(() => {
    const nuevaExperiencia = {
      id: uuidv4(),
      cargo: "",
      empresa: "",
      ubicacion: "",
      fechaInicio: "",
      fechaFin: "",
      descripcion: "",
      esActual: false
    };
    
    handleChange({
      target: {
        name: 'experiencias',
        value: [...experiencias, nuevaExperiencia]
      }
    });
  }, [experiencias, handleChange]);

  const removeExperiencia = useCallback((id) => {
    const nuevasExperiencias = experiencias.filter(exp => exp.id !== id);
    handleChange({
      target: {
        name: 'experiencias',
        value: nuevasExperiencias
      }
    });
  }, [experiencias, handleChange]);

  const updateExperiencia = useCallback((id, field, value) => {
    const nuevasExperiencias = experiencias.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    handleChange({
      target: {
        name: 'experiencias',
        value: nuevasExperiencias
      }
    });
  }, [experiencias, handleChange]);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          💼 Experiencia Laboral
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Add />} 
          onClick={addExperiencia}
          size="small"
        >
          Agregar Experiencia
        </Button>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Agrega tus experiencias laborales más relevantes. Al menos una es obligatoria.
      </Typography>

      {experiencias.map((experiencia, index) => (
        <Card key={experiencia.id} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Experiencia {index + 1}
              </Typography>
              {experiencias.length > 1 && (
                <IconButton 
                  onClick={() => removeExperiencia(experiencia.id)}
                  color="error"
                  size="small"
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Cargo/Posición *" 
                  value={experiencia.cargo} 
                  onChange={(e) => updateExperiencia(experiencia.id, 'cargo', e.target.value)}
                  fullWidth 
                  placeholder="Ej: Desarrollador Frontend"
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Empresa *" 
                  value={experiencia.empresa} 
                  onChange={(e) => updateExperiencia(experiencia.id, 'empresa', e.target.value)}
                  fullWidth 
                  placeholder="Ej: Tech Solutions S.L."
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Ubicación" 
                  value={experiencia.ubicacion} 
                  onChange={(e) => updateExperiencia(experiencia.id, 'ubicacion', e.target.value)}
                  fullWidth 
                  placeholder="Ej: Madrid, España"
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField 
                  variant="outlined" 
                  label="Fecha Inicio *" 
                  value={experiencia.fechaInicio} 
                  onChange={(e) => updateExperiencia(experiencia.id, 'fechaInicio', e.target.value)}
                  fullWidth 
                  placeholder="MM/YYYY"
                  helperText="Formato: MM/YYYY"
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                {!experiencia.esActual ? (
                  <TextField 
                    variant="outlined" 
                    label="Fecha Fin" 
                    value={experiencia.fechaFin} 
                    onChange={(e) => updateExperiencia(experiencia.id, 'fechaFin', e.target.value)}
                    fullWidth 
                    placeholder="MM/YYYY"
                    helperText="Formato: MM/YYYY"
                  />
                ) : (
                  <TextField 
                    variant="outlined" 
                    label="Fecha Fin" 
                    value="Actualidad" 
                    disabled
                    fullWidth 
                  />
                )}
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={experiencia.esActual || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const nuevasExperiencias = experiencias.map(exp => 
                          exp.id === experiencia.id 
                            ? { 
                                ...exp, 
                                esActual: isChecked,
                                fechaFin: isChecked ? 'Actualidad' : ''
                              } 
                            : exp
                        );
                        handleChange({
                          target: {
                            name: 'experiencias',
                            value: nuevasExperiencias
                          }
                        });
                      }}
                    />
                  } 
                  label="Trabajo actual"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  variant="outlined" 
                  label="Descripción de responsabilidades y logros *" 
                  value={experiencia.descripcion} 
                  onChange={(e) => updateExperiencia(experiencia.id, 'descripcion', e.target.value)}
                  fullWidth 
                  multiline
                  rows={3}
                  placeholder="Describe tus responsabilidades principales, logros destacados y contribuciones..."
                  helperText="Incluye logros cuantificables cuando sea posible"
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {experiencias.length === 0 && (
        <Card sx={{ mb: 3, border: '2px dashed #ccc', backgroundColor: '#f9f9f9' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No has agregado ninguna experiencia laboral aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Haz clic en "Agregar Experiencia" para comenzar
            </Typography>
          </CardContent>
        </Card>
      )}
    </>
  );
});

ExperienceForm.displayName = 'ExperienceForm';
