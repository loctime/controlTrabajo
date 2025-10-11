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
      <Box sx={{ 
        mt: 1, 
        mb: 1,
        p: 1,
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        borderRadius: '12px',
        border: '2px solid #2196f3',
        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#1565c0',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          🎓 Educación
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={addEducacion}
          sx={{
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            py: 1,
            borderRadius: '8px',
            boxShadow: '0 3px 8px rgba(33, 150, 243, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 5px 12px rgba(33, 150, 243, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Agregar Educación
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
        borderLeft: '4px solid #2196f3'
      }}>
        📚 Incluye tu formación académica: títulos universitarios, cursos, certificaciones, etc.
      </Typography>

      {educacion.map((edu, index) => (
        <Card key={edu.id} sx={{ 
          mb: 4, 
          border: '2px solid #e3f2fd',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(33, 150, 243, 0.15)',
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: '#1565c0',
                fontSize: '1.3rem',
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                p: 1.5,
                borderRadius: '8px',
                border: '1px solid #90caf9'
              }}>
                🎓 Formación {index + 1}
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
