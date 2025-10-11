import React, { memo, useCallback, useRef } from 'react';
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

export const EducationForm = memo(({ newCv, handleChange }) => {
  const educacion = newCv.educacion || [];
  const fileInputRefs = useRef({});
  
  // Estado para mostrar progreso de subida
  const [uploadingFiles, setUploadingFiles] = React.useState({});

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

  const handleFileUpload = useCallback(async (eduId, file) => {
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
      setUploadingFiles(prev => ({ ...prev, [eduId]: true }));
      
      // 1. Crear/obtener carpeta principal "BolsaTrabajo"
      console.log('📁 Obteniendo carpeta BolsaTrabajo...');
      const folderId = await ensureAppFolder();
      
      // 2. Subir archivo directamente a la carpeta BolsaTrabajo
      console.log(`📤 Subiendo diploma "${file.name}" a BolsaTrabajo...`);
      const fileId = await uploadFile(file, folderId, (progress) => {
        console.log(`Progreso de diploma: ${progress}%`);
      });
      
      console.log(`✅ Diploma subido con ID:`, fileId);
      
      // 3. Crear enlace público y obtener URL de descarga directa
      console.log(`🔗 Creando enlace público para diploma con fileId:`, fileId);
      let finalUrl;
      
      try {
        const shareUrl = await createPublicShareLink(fileId, 8760); // 1 año
        console.log(`✅ Enlace público creado:`, shareUrl);
        
        // 4. Obtener URL de descarga directa desde el share link
        console.log(`📥 Obteniendo URL de descarga directa...`);
        finalUrl = await getDirectDownloadUrl(shareUrl);
        console.log(`✅ URL de descarga directa obtenida:`, finalUrl);
        
      } catch (shareError) {
        console.error(`❌ Error creando share link para diploma:`, shareError);
        console.log(`⚠️ Guardando fileId directamente como fallback`);
        finalUrl = fileId;
      }
      
      // 5. Guardar en el formulario
      updateEducacion(eduId, 'diplomaUrl', finalUrl);
      updateEducacion(eduId, 'diplomaArchivo', file.name);
      
      alert(`Diploma "${file.name}" subido exitosamente`);
      
    } catch (error) {
      console.error('Error subiendo diploma:', error);
      alert('Error al subir el archivo. Inténtalo nuevamente.');
    } finally {
      // Quitar estado de subiendo
      setUploadingFiles(prev => {
        const newState = { ...prev };
        delete newState[eduId];
        return newState;
      });
    }
  }, [updateEducacion]);

  const handleFileInputClick = useCallback((eduId) => {
    fileInputRefs.current[eduId]?.click();
  }, []);

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
              
              <Grid item xs={12} md={7}>
                <TextField 
                  variant="outlined" 
                  label="Descripción adicional" 
                  value={edu.descripcion} 
                  onChange={(e) => updateEducacion(edu.id, 'descripcion', e.target.value)}
                  fullWidth 
                  multiline
                  rows={4}
                  placeholder="Menciones honoríficas, proyectos destacados, promedio, etc."
                  helperText="Información adicional relevante (opcional)"
                />
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Box sx={{ 
                  p: 2, 
                  border: '2px dashed #90caf9',
                  borderRadius: '8px',
                  backgroundColor: '#f0f7ff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  height: '100%',
                  justifyContent: 'center'
                }}>
                  <Typography variant="subtitle2" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                    📄 Diploma
                  </Typography>
                  <input
                    ref={(el) => fileInputRefs.current[edu.id] = el}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(edu.id, e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => handleFileInputClick(edu.id)}
                    size="small"
                    disabled={uploadingFiles[edu.id]}
                    sx={{
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      px: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      }
                    }}
                  >
                    {uploadingFiles[edu.id] ? 'Subiendo...' : 'Subir'}
                  </Button>
                  {edu.diplomaArchivo && (
                    <Typography variant="caption" sx={{ color: 'success.main', textAlign: 'center', fontWeight: 'bold' }}>
                      ✓ {edu.diplomaArchivo}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '0.7rem' }}>
                    PDF, JPG, PNG<br/>Máx. 5MB
                  </Typography>
                </Box>
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
