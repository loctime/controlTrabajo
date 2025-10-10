import React from 'react';
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

export const ProjectsForm = ({ newCv, handleChange }) => {
  const proyectos = newCv.proyectos || [];

  const addProyecto = () => {
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
  };

  const removeProyecto = (id) => {
    const nuevosProyectos = proyectos.filter(proj => proj.id !== id);
    handleChange({
      target: {
        name: 'proyectos',
        value: nuevosProyectos
      }
    });
  };

  const updateProyecto = (id, field, value) => {
    const nuevosProyectos = proyectos.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    handleChange({
      target: {
        name: 'proyectos',
        value: nuevosProyectos
      }
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          🚀 Proyectos
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Add />} 
          onClick={addProyecto}
          size="small"
        >
          Agregar Proyecto
        </Button>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Incluye proyectos personales, académicos o profesionales que demuestren tus habilidades y experiencia.
      </Typography>

      {proyectos.map((proyecto, index) => (
        <Card key={proyecto.id} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Proyecto {index + 1}
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
};
