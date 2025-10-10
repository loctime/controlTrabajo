import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Download, 
  Share, 
  Close, 
  LinkedIn, 
  Email, 
  Phone, 
  LocationOn,
  Facebook,
  Twitter,
  WhatsApp
} from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { pdfGeneratorService } from '../cargaCv/services/pdfGeneratorService';

const CVPublicView = () => {
  const { cvId } = useParams();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    fetchCVData();
  }, [cvId]);

  const fetchCVData = async () => {
    try {
      setLoading(true);
      const cvRef = doc(db, 'cv', cvId);
      const cvSnap = await getDoc(cvRef);

      if (cvSnap.exists()) {
        const data = cvSnap.data();
        
        // Verificar que el CV esté aprobado y sea público
        if (data.estado !== 'aprobado') {
          setError('Este CV no está disponible públicamente');
          return;
        }

        setCvData({ id: cvSnap.id, ...data });
      } else {
        setError('CV no encontrado');
      }
    } catch (error) {
      console.error('Error al cargar CV:', error);
      setError('Error al cargar el CV');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvData) return;

    try {
      setIsGenerating(true);
      
      // Si es un CV generado, usar el servicio de PDF
      if (cvData.cvGenerado) {
        await pdfGeneratorService.generateAndDownload(
          cvData, 
          cvData.plantillaSeleccionada || 'moderna',
          `CV_${cvData.Nombre}_${cvData.Apellido}.pdf`
        );
      } else {
        // Si es un PDF subido, descargar directamente
        if (cvData.cv) {
          const link = document.createElement('a');
          link.href = cvData.cv;
          link.download = `CV_${cvData.Nombre}_${cvData.Apellido}.pdf`;
          link.click();
        }
      }
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copiada al portapapeles');
    });
  };

  const shareOnSocial = (platform) => {
    const url = window.location.href;
    const text = `Mira el CV de ${cvData.Nombre} ${cvData.Apellido}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!cvData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">CV no encontrado</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      py: 4
    }}>
      <Box sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        px: 2 
      }}>
        {/* Header con acciones */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              CV de {cvData.Nombre} {cvData.Apellido}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
                size="small"
              >
                Compartir
              </Button>
              <Button
                variant="contained"
                startIcon={isGenerating ? <CircularProgress size={16} /> : <Download />}
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                size="small"
              >
                {isGenerating ? 'Generando...' : 'Descargar PDF'}
              </Button>
            </Box>
          </Box>
          
          {/* Badge del tipo de CV */}
          <Chip
            label={cvData.cvGenerado ? 'CV Generado' : 'PDF Subido'}
            color={cvData.cvGenerado ? 'primary' : 'secondary'}
            size="small"
          />
        </Paper>

        {/* Contenido del CV */}
        <Paper sx={{ p: 4 }}>
          {/* Información de contacto */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              {cvData.Nombre} {cvData.Apellido}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {cvData.categoriaGeneral}
            </Typography>
            
            <Grid container spacing={2}>
              {cvData.Email && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email fontSize="small" color="primary" />
                    <Typography variant="body2">{cvData.Email}</Typography>
                  </Box>
                </Grid>
              )}
              {cvData.telefono && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone fontSize="small" color="primary" />
                    <Typography variant="body2">{cvData.telefono}</Typography>
                  </Box>
                </Grid>
              )}
              {cvData.ciudad && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" color="primary" />
                    <Typography variant="body2">{cvData.ciudad}</Typography>
                  </Box>
                </Grid>
              )}
              {cvData.linkedin && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinkedIn fontSize="small" color="primary" />
                    <Typography variant="body2" sx={{ textDecoration: 'underline' }}>
                      LinkedIn
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Perfil profesional */}
          {cvData.perfilProfesional && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Perfil Profesional
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">{cvData.perfilProfesional}</Typography>
            </Box>
          )}

          {/* Experiencia laboral */}
          {cvData.experiencias && cvData.experiencias.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Experiencia Laboral
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cvData.experiencias.map((exp, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {exp.cargo}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {exp.empresa} | {exp.fechaInicio} - {exp.fechaFin}
                  </Typography>
                  {exp.ubicacion && (
                    <Typography variant="body2" color="text.secondary">
                      {exp.ubicacion}
                    </Typography>
                  )}
                  {exp.descripcion && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {exp.descripcion}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Educación */}
          {cvData.educacion && cvData.educacion.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Formación Académica
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cvData.educacion.map((edu, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {edu.titulo}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {edu.institucion} | {edu.fechaInicio} - {edu.fechaFin}
                  </Typography>
                  {edu.ubicacion && (
                    <Typography variant="body2" color="text.secondary">
                      {edu.ubicacion}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Habilidades */}
          {cvData.habilidades && cvData.habilidades.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Competencias Técnicas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {cvData.habilidades.map((skill, index) => (
                  <Chip
                    key={index}
                    label={`${skill.nombre} (${skill.nivel})`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Idiomas */}
          {cvData.idiomas && cvData.idiomas.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Idiomas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cvData.idiomas.map((idioma, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  <strong>{idioma.idioma}:</strong> {idioma.nivel}
                </Typography>
              ))}
            </Box>
          )}

          {/* Certificaciones */}
          {cvData.certificaciones && cvData.certificaciones.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Certificaciones
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cvData.certificaciones.map((cert, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {cert.nombre}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {cert.institucion} | {cert.fecha}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Proyectos */}
          {cvData.proyectos && cvData.proyectos.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Proyectos Destacados
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cvData.proyectos.map((proyecto, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {proyecto.nombre}
                  </Typography>
                  {proyecto.tecnologias && (
                    <Typography variant="body2" color="primary">
                      Tecnologías: {proyecto.tecnologias}
                    </Typography>
                  )}
                  {proyecto.descripcion && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {proyecto.descripcion}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Referencias */}
          {cvData.referencias && cvData.referencias.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Referencias
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cvData.referencias.map((ref, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {ref.nombre}
                  </Typography>
                  <Typography variant="body2">
                    {ref.cargo} en {ref.empresa}
                  </Typography>
                  {ref.telefono && (
                    <Typography variant="body2" color="primary">
                      Tel: {ref.telefono}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            CV generado por BolsaTrabajo.com
          </Typography>
        </Box>
      </Box>

      {/* Dialog de compartir */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>
          Compartir CV
          <IconButton
            onClick={() => setShareDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Comparte este CV en redes sociales o copia el enlace:
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Facebook />}
              onClick={() => shareOnSocial('facebook')}
              sx={{ mr: 1, mb: 1 }}
            >
              Facebook
            </Button>
            <Button
              variant="outlined"
              startIcon={<Twitter />}
              onClick={() => shareOnSocial('twitter')}
              sx={{ mr: 1, mb: 1 }}
            >
              Twitter
            </Button>
            <Button
              variant="outlined"
              startIcon={<LinkedIn />}
              onClick={() => shareOnSocial('linkedin')}
              sx={{ mr: 1, mb: 1 }}
            >
              LinkedIn
            </Button>
            <Button
              variant="outlined"
              startIcon={<WhatsApp />}
              onClick={() => shareOnSocial('whatsapp')}
              sx={{ mb: 1 }}
            >
              WhatsApp
            </Button>
          </Box>
          
          <Button
            variant="contained"
            onClick={copyToClipboard}
            fullWidth
          >
            Copiar enlace
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CVPublicView;
