import React, { memo, useCallback } from 'react';
import { 
  Grid, 
  TextField, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Card,
  CardContent
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

export const EducationForm = memo(({ newCv, handleChange }) => {
  const educacion = newCv.educacion || [];

  const addEducacion = useCallback(() => {
    const nuevaEducacion = {
      id: uuidv4(),
      titulo: "",
      institucion: "",
      ubicacion: "",
      fechaInicio: "",
      fechaFin: "",
      descripcion: ""
    };
    
    handleChange({
      target: {
        name: 'educacion',
        value: [...educacion, nuevaEducacion]
      }
    });
  }, [educacion, handleChange]);

  const removeEducacion = useCallback((id) => {
    const nuevaEducacion = educacion.filter(edu => edu.id !== id);
    handleChange({
      target: {
        name: 'educacion',
        value: nuevaEducacion
      }
    });
  }, [educacion, handleChange]);

  const updateEducacion = useCallback((id, field, value) => {
    const nuevaEducacion = educacion.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    handleChange({
      target: {
        name: 'educacion',
        value: nuevaEducacion
      }
    });
  }, [educacion, handleChange]);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          🎓 Educación
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Add />} 
          onClick={addEducacion}
          size="small"
        >
          Agregar Educación
        </Button>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Incluye tu formación académica: títulos universitarios, cursos, certificaciones, etc.
      </Typography>

      {educacion.map((edu, index) => (
        <Card key={edu.id} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Formación {index + 1}
              </Typography>
              <IconButton 
                onClick={() => removeEducacion(edu.id)}
                color="error"
                size="small"
              >
                <Delete />
              </IconButton>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Título/Certificación" 
                  value={edu.titulo} 
                  onChange={(e) => updateEducacion(edu.id, 'titulo', e.target.value)}
                  fullWidth 
                  placeholder="Ej: Grado en Ingeniería Informática"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Institución" 
                  value={edu.institucion} 
                  onChange={(e) => updateEducacion(edu.id, 'institucion', e.target.value)}
                  fullWidth 
                  placeholder="Ej: Universidad Complutense de Madrid"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Ubicación" 
                  value={edu.ubicacion} 
                  onChange={(e) => updateEducacion(edu.id, 'ubicacion', e.target.value)}
                  fullWidth 
                  placeholder="Ej: Madrid, España"
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField 
                  variant="outlined" 
                  label="Fecha Inicio" 
                  value={edu.fechaInicio} 
                  onChange={(e) => updateEducacion(edu.id, 'fechaInicio', e.target.value)}
                  fullWidth 
                  placeholder="MM/YYYY"
                  helperText="Formato: MM/YYYY"
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField 
                  variant="outlined" 
                  label="Fecha Fin" 
                  value={edu.fechaFin} 
                  onChange={(e) => updateEducacion(edu.id, 'fechaFin', e.target.value)}
                  fullWidth 
                  placeholder="MM/YYYY"
                  helperText="Formato: MM/YYYY"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  variant="outlined" 
                  label="Descripción adicional" 
                  value={edu.descripcion} 
                  onChange={(e) => updateEducacion(edu.id, 'descripcion', e.target.value)}
                  fullWidth 
                  multiline
                  rows={2}
                  placeholder="Menciones honoríficas, proyectos destacados, promedio, etc."
                  helperText="Información adicional relevante (opcional)"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {educacion.length === 0 && (
        <Card sx={{ mb: 3, border: '2px dashed #ccc', backgroundColor: '#f9f9f9' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No has agregado ninguna formación académica aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Haz clic en "Agregar Educación" para comenzar
            </Typography>
          </CardContent>
        </Card>
      )}
    </>
  );
});

EducationForm.displayName = 'EducationForm';
