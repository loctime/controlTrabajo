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

export const CertificationsForm = memo(({ newCv, handleChange }) => {
  const certificaciones = newCv.certificaciones || [];

  const addCertificacion = useCallback(() => {
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
  }, [certificaciones, handleChange]);

  const removeCertificacion = useCallback((id) => {
    const nuevasCertificaciones = certificaciones.filter(cert => cert.id !== id);
    handleChange({
      target: {
        name: 'certificaciones',
        value: nuevasCertificaciones
      }
    });
  }, [certificaciones, handleChange]);

  const updateCertificacion = useCallback((id, field, value) => {
    const nuevasCertificaciones = certificaciones.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    handleChange({
      target: {
        name: 'certificaciones',
        value: nuevasCertificaciones
      }
    });
  }, [certificaciones, handleChange]);

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mt: 4, 
        mb: 3,
        p: 3,
        background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
        borderRadius: '12px',
        border: '2px solid #ffc107',
        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.15)'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#f57f17',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          🏆 Certificaciones
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={addCertificacion}
          sx={{
            background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            py: 1,
            borderRadius: '8px',
            boxShadow: '0 3px 8px rgba(255, 193, 7, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 5px 12px rgba(255, 193, 7, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Agregar Certificación
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
        borderLeft: '4px solid #ffc107'
      }}>
        🎯 Incluye certificaciones profesionales, cursos especializados, licencias o acreditaciones relevantes.
      </Typography>

      {certificaciones.map((cert, index) => (
        <Card key={cert.id} sx={{ 
          mb: 4, 
          border: '2px solid #fff8e1',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(255, 193, 7, 0.15)',
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: '#f57f17',
                fontSize: '1.3rem',
                background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
                p: 1.5,
                borderRadius: '8px',
                border: '1px solid #ffc107'
              }}>
                🏆 Certificación {index + 1}
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
});

CertificationsForm.displayName = 'CertificationsForm';
