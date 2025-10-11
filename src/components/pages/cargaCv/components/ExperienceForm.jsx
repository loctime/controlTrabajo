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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mt: 4, 
        mb: 3,
        p: 3,
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '12px',
        border: '2px solid #66bb6a',
        boxShadow: '0 4px 12px rgba(102, 187, 106, 0.15)'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#2e7d32',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          💼 Experiencia Laboral
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={addExperiencia}
          sx={{
            background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            py: 1,
            borderRadius: '8px',
            boxShadow: '0 3px 8px rgba(102, 187, 106, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 5px 12px rgba(102, 187, 106, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Agregar Experiencia
        </Button>
      </Box>
      
      <Typography variant="body1" sx={{ 
        mb: 4, 
        color: '#424242',
        fontSize: '1.1rem',
        fontWeight: 500,
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        borderLeft: '4px solid #66bb6a'
      }}>
        ✨ Agrega tus experiencias laborales más relevantes. Al menos una es obligatoria.
      </Typography>

      {experiencias.map((experiencia, index) => (
        <Card key={experiencia.id} sx={{ 
          mb: 4, 
          border: '2px solid #e8f5e8',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(102, 187, 106, 0.15)',
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: '#2e7d32',
                fontSize: '1.3rem',
                background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                p: 1.5,
                borderRadius: '8px',
                border: '1px solid #a5d6a7'
              }}>
                📋 Experiencia {index + 1}
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
