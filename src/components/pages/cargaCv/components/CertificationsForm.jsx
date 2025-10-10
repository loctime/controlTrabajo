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

export const CertificationsForm = ({ newCv, handleChange }) => {
  const certificaciones = newCv.certificaciones || [];

  const addCertificacion = () => {
    const nuevaCertificacion = {
      id: uuidv4(),
      nombre: "",
      institucion: "",
      fecha: "",
      url: ""
    };
    
    handleChange({
      target: {
        name: 'certificaciones',
        value: [...certificaciones, nuevaCertificacion]
      }
    });
  };

  const removeCertificacion = (id) => {
    const nuevasCertificaciones = certificaciones.filter(cert => cert.id !== id);
    handleChange({
      target: {
        name: 'certificaciones',
        value: nuevasCertificaciones
      }
    });
  };

  const updateCertificacion = (id, field, value) => {
    const nuevasCertificaciones = certificaciones.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    handleChange({
      target: {
        name: 'certificaciones',
        value: nuevasCertificaciones
      }
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          🏆 Certificaciones
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Add />} 
          onClick={addCertificacion}
          size="small"
        >
          Agregar Certificación
        </Button>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Incluye certificaciones profesionales, cursos especializados, licencias o acreditaciones relevantes.
      </Typography>

      {certificaciones.map((cert, index) => (
        <Card key={cert.id} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Certificación {index + 1}
              </Typography>
              <IconButton 
                onClick={() => removeCertificacion(cert.id)}
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
                  label="Nombre de la certificación" 
                  value={cert.nombre} 
                  onChange={(e) => updateCertificacion(cert.id, 'nombre', e.target.value)}
                  fullWidth 
                  placeholder="Ej: AWS Certified Solutions Architect"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Institución que emite" 
                  value={cert.institucion} 
                  onChange={(e) => updateCertificacion(cert.id, 'institucion', e.target.value)}
                  fullWidth 
                  placeholder="Ej: Amazon Web Services"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Fecha de obtención" 
                  value={cert.fecha} 
                  onChange={(e) => updateCertificacion(cert.id, 'fecha', e.target.value)}
                  fullWidth 
                  placeholder="MM/YYYY"
                  helperText="Formato: MM/YYYY"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="URL del certificado (opcional)" 
                  value={cert.url} 
                  onChange={(e) => updateCertificacion(cert.id, 'url', e.target.value)}
                  fullWidth 
                  placeholder="https://..."
                  helperText="Enlace para verificar el certificado"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {certificaciones.length === 0 && (
        <Card sx={{ mb: 3, border: '2px dashed #ccc', backgroundColor: '#f9f9f9' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No has agregado ninguna certificación aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Haz clic en "Agregar Certificación" para comenzar
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Sugerencias de tipos de certificaciones */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f8ff', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          💡 Tipos de certificaciones que puedes incluir:
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            Certificaciones técnicas (AWS, Google Cloud, Microsoft, etc.)
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            Certificaciones de idiomas (TOEFL, IELTS, DELE, etc.)
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            Cursos especializados y bootcamps
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            Licencias profesionales
          </Typography>
          <Typography component="li" variant="body2">
            Acreditaciones de competencias específicas
          </Typography>
        </Box>
      </Box>
    </>
  );
};
