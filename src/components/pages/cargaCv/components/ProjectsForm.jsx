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

export const ProjectsForm = memo(({ newCv, handleChange }) => {
  const proyectos = newCv.proyectos || [];

  const addProyecto = useCallback(() => {
    const nuevoProyecto = {
      id: uuidv4(),
      nombre: "",
      descripcion: "",
      tecnologias: "",
      url: ""
    };
    
    handleChange({
      target: {
        name: 'proyectos',
        value: [...proyectos, nuevoProyecto]
      }
    });
  }, [proyectos, handleChange]);

  const removeProyecto = useCallback((id) => {
    const nuevosProyectos = proyectos.filter(proj => proj.id !== id);
    handleChange({
      target: {
        name: 'proyectos',
        value: nuevosProyectos
      }
    });
  }, [proyectos, handleChange]);

  const updateProyecto = useCallback((id, field, value) => {
    const nuevosProyectos = proyectos.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    handleChange({
      target: {
        name: 'proyectos',
        value: nuevosProyectos
      }
    });
  }, [proyectos, handleChange]);

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mt: 4, 
        mb: 3,
        p: 3,
        background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
        borderRadius: '12px',
        border: '2px solid #3f51b5',
        boxShadow: '0 4px 12px rgba(63, 81, 181, 0.15)'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#283593',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          🚀 Proyectos
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={addProyecto}
          sx={{
            background: 'linear-gradient(135deg, #3f51b5 0%, #283593 100%)',
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            py: 1,
            borderRadius: '8px',
            boxShadow: '0 3px 8px rgba(63, 81, 181, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #283593 0%, #1a237e 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 5px 12px rgba(63, 81, 181, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Agregar Proyecto
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
        borderLeft: '4px solid #3f51b5'
      }}>
        💡 Incluye proyectos personales, académicos o profesionales que demuestren tus habilidades y experiencia.
      </Typography>

      {proyectos.map((proyecto, index) => (
        <Card key={proyecto.id} sx={{ 
          mb: 4, 
          border: '2px solid #e8eaf6',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(63, 81, 181, 0.15)',
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: '#283593',
                fontSize: '1.3rem',
                background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
                p: 1.5,
                borderRadius: '8px',
                border: '1px solid #9fa8da'
              }}>
                🚀 Proyecto {index + 1}
              </Typography>
              <IconButton 
                onClick={() => removeProyecto(proyecto.id)}
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
                  label="Nombre del proyecto" 
                  value={proyecto.nombre} 
                  onChange={(e) => updateProyecto(proyecto.id, 'nombre', e.target.value)}
                  fullWidth 
                  placeholder="Ej: E-commerce React App"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Tecnologías utilizadas" 
                  value={proyecto.tecnologias} 
                  onChange={(e) => updateProyecto(proyecto.id, 'tecnologias', e.target.value)}
                  fullWidth 
                  placeholder="Ej: React, Node.js, MongoDB, AWS"
                  helperText="Separa con comas"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  variant="outlined" 
                  label="Descripción del proyecto" 
                  value={proyecto.descripcion} 
                  onChange={(e) => updateProyecto(proyecto.id, 'descripcion', e.target.value)}
                  fullWidth 
                  multiline
                  rows={3}
                  placeholder="Describe el proyecto, sus objetivos, tu rol y los resultados obtenidos..."
                  helperText="Incluye el contexto, tu contribución y el impacto del proyecto"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  variant="outlined" 
                  label="URL del proyecto (opcional)" 
                  value={proyecto.url} 
                  onChange={(e) => updateProyecto(proyecto.id, 'url', e.target.value)}
                  fullWidth 
                  placeholder="https://mi-proyecto.com o https://github.com/usuario/proyecto"
                  helperText="Enlace al proyecto en vivo, repositorio GitHub, o portfolio"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {proyectos.length === 0 && (
        <Card sx={{ mb: 3, border: '2px dashed #ccc', backgroundColor: '#f9f9f9' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No has agregado ningún proyecto aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Haz clic en "Agregar Proyecto" para comenzar
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Sugerencias de tipos de proyectos */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f8ff', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          💡 Tipos de proyectos que puedes incluir:
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Aplicaciones web/móviles:</strong> Desarrollo de apps, sitios web, sistemas
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Proyectos de diseño:</strong> Portfolios, identidad corporativa, UI/UX
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Análisis de datos:</strong> Dashboards, reportes, visualizaciones
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Automatización:</strong> Scripts, bots, procesos automatizados
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Proyectos colaborativos:</strong> Trabajo en equipo, open source, hackathons
          </Typography>
        </Box>
      </Box>
    </>
  );
});

ProjectsForm.displayName = 'ProjectsForm';
