import React, { useCallback, useRef } from 'react';
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
import { Add, Delete, CloudUpload } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { uploadFile, ensureAppFolder, createPublicShareLink, getDirectDownloadUrl } from '../../../../lib/controlFileStorage';
import { withFormMemo } from './FormMemoHelper';

const CertificationsFormComponent = ({ newCv, handleChange }) => {
  const certificaciones = newCv.certificaciones || [];
  const fileInputRefs = useRef({});
  
  // Estado para mostrar progreso de subida
  const [uploadingFiles, setUploadingFiles] = React.useState({});

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

  const handleFileUpload = useCallback(async (certId, file) => {
    if (!file) return;
    
    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos PDF, JPG o PNG');
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('El archivo debe ser menor a 5MB');
      return;
    }
    
    try {
      // Marcar como subiendo
      setUploadingFiles(prev => ({ ...prev, [certId]: true }));
      
      // 1. Crear/obtener carpeta principal "BolsaTrabajo"
      console.log('📁 Obteniendo carpeta BolsaTrabajo...');
      const folderId = await ensureAppFolder();
      
      // 2. Subir archivo directamente a la carpeta BolsaTrabajo
      console.log(`📤 Subiendo certificado "${file.name}" a BolsaTrabajo...`);
      const fileId = await uploadFile(file, folderId, (progress) => {
        console.log(`Progreso de certificado: ${progress}%`);
      });
      
      console.log(`✅ Certificado subido con ID:`, fileId);
      
      // 3. Crear enlace público y obtener URL de descarga directa
      console.log(`🔗 Creando enlace público para certificado con fileId:`, fileId);
      let finalUrl;
      
      try {
        const shareUrl = await createPublicShareLink(fileId, 8760); // 1 año
        console.log(`✅ Enlace público creado:`, shareUrl);
        
        // 4. Obtener URL de descarga directa desde el share link
        console.log(`📥 Obteniendo URL de descarga directa...`);
        finalUrl = await getDirectDownloadUrl(shareUrl);
        console.log(`✅ URL de descarga directa obtenida:`, finalUrl);
        
      } catch (shareError) {
        console.error(`❌ Error creando share link para certificado:`, shareError);
        console.log(`⚠️ Guardando fileId directamente como fallback`);
        finalUrl = fileId;
      }
      
      // 5. Guardar en el formulario
      updateCertificacion(certId, 'url', finalUrl);
      updateCertificacion(certId, 'archivoUrl', file.name);
      
      alert(`Certificado "${file.name}" subido exitosamente`);
      
    } catch (error) {
      console.error('Error subiendo certificado:', error);
      alert('Error al subir el archivo. Inténtalo nuevamente.');
    } finally {
      // Quitar estado de subiendo
      setUploadingFiles(prev => {
        const newState = { ...prev };
        delete newState[certId];
        return newState;
      });
    }
  }, []);

  const handleFileInputClick = useCallback((certId) => {
    fileInputRefs.current[certId]?.click();
  }, []);

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
        mt: 1, 
        mb: 1,
        p: 1,
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
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField 
                    variant="outlined" 
                    label="URL del certificado" 
                    value={cert.url || ""} 
                    onChange={(e) => updateCertificacion(cert.id, 'url', e.target.value)}
                    placeholder="https://..."
                    helperText="Enlace para verificar"
                    error={!cert.url && !cert.archivoUrl}
                    sx={{ flexGrow: 1 }}
                  />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <input
                      ref={(el) => fileInputRefs.current[cert.id] = el}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(cert.id, e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      onClick={() => handleFileInputClick(cert.id)}
                      size="small"
                      sx={{ minWidth: 120 }}
                      disabled={uploadingFiles[cert.id]}
                    >
                      {uploadingFiles[cert.id] ? 'Subiendo...' : 'Subir'}
                    </Button>
                    {cert.archivoUrl && (
                      <Typography variant="caption" sx={{ color: 'success.main', textAlign: 'center', fontSize: '0.65rem' }}>
                        ✓ {cert.archivoUrl}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '0.6rem' }}>
                      PDF, JPG, PNG<br/>Máx. 5MB
                    </Typography>
                  </Box>
                </Box>
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

     
    </>
  );
};

CertificationsFormComponent.displayName = 'CertificationsFormComponent';

// Memorizar con solo el campo certificaciones
export const CertificationsForm = withFormMemo(
  CertificationsFormComponent,
  ['certificaciones']
);
