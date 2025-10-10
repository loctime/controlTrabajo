import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close, Download, Visibility } from '@mui/icons-material';
import { pdfGeneratorService } from '../services/pdfGeneratorService';

const CVPreview = ({ 
  open, 
  onClose, 
  cvData, 
  selectedTemplate, 
  onTemplateChange 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAndDownload = async () => {
    try {
      setIsGenerating(true);
      
      // Validar datos antes de generar
      const validation = pdfGeneratorService.validateCVData(cvData);
      if (!validation.isValid) {
        alert(`Error: ${validation.errors.join(', ')}`);
        return;
      }

      // Generar y descargar PDF
      await pdfGeneratorService.generateAndDownload(cvData, selectedTemplate);
      
      // Cerrar modal después de descarga exitosa
      onClose();
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert(`Error al generar el CV: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateChange = (newTemplate) => {
    onTemplateChange(newTemplate);
  };

  const PreviewContent = ({ template }) => {
    if (template === 'moderna') {
      return (
        <Paper sx={{ p: 3, backgroundColor: '#f0f8ff', minHeight: 400 }}>
          {/* Header Moderno */}
          <Box sx={{ 
            backgroundColor: '#1976d2', 
            color: 'white', 
            p: 2, 
            borderRadius: 1,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              backgroundColor: 'white', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1976d2',
              fontSize: '24px'
            }}>
              👤
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {cvData.Nombre} {cvData.Apellido}
              </Typography>
              <Typography variant="h6">
                {cvData.categoriaGeneral}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {cvData.Email} • {cvData.telefono} • {cvData.ciudad}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Columna Izquierda */}
            <Grid item xs={12} md={6}>
              {/* Perfil Profesional */}
              {cvData.perfilProfesional && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>
                    💼 Perfil Profesional
                  </Typography>
                  <Typography variant="body2">
                    {cvData.perfilProfesional}
                  </Typography>
                </Box>
              )}

              {/* Experiencia */}
              {cvData.experiencias && cvData.experiencias.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>
                    💼 Experiencia Laboral
                  </Typography>
                  {cvData.experiencias.slice(0, 2).map((exp, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {exp.cargo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exp.empresa} | {exp.fechaInicio} - {exp.fechaFin}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {exp.descripcion?.substring(0, 100)}...
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Educación */}
              {cvData.educacion && cvData.educacion.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>
                    🎓 Educación
                  </Typography>
                  {cvData.educacion.slice(0, 2).map((edu, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {edu.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {edu.institucion}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Columna Derecha */}
            <Grid item xs={12} md={6}>
              {/* Habilidades */}
              {cvData.habilidades && cvData.habilidades.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>
                    🛠️ Habilidades
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {cvData.habilidades.slice(0, 8).map((skill, index) => (
                      <Chip 
                        key={index} 
                        label={`${skill.nombre} (${skill.nivel})`} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Idiomas */}
              {cvData.idiomas && cvData.idiomas.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>
                    🌍 Idiomas
                  </Typography>
                  {cvData.idiomas.map((idioma, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{idioma.idioma}:</strong> {idioma.nivel}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Certificaciones */}
              {cvData.certificaciones && cvData.certificaciones.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>
                    🏆 Certificaciones
                  </Typography>
                  {cvData.certificaciones.slice(0, 3).map((cert, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {cert.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cert.institucion} | {cert.fecha}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      );
    } else {
      // Template Clásico
      return (
        <Paper sx={{ p: 3, backgroundColor: 'white', minHeight: 400 }}>
          {/* Header Clásico */}
          <Box sx={{ borderBottom: '2px solid #424242', pb: 2, mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#424242', mb: 1 }}>
              {cvData.Nombre} {cvData.Apellido}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {cvData.Email} • {cvData.telefono} • {cvData.ciudad}
            </Typography>
          </Box>

          {/* Perfil Profesional */}
          {cvData.perfilProfesional && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase', mb: 1 }}>
                Perfil Profesional
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">
                {cvData.perfilProfesional}
              </Typography>
            </Box>
          )}

          {/* Experiencia */}
          {cvData.experiencias && cvData.experiencias.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase', mb: 1 }}>
                Experiencia Laboral
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cvData.experiencias.slice(0, 2).map((exp, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {exp.cargo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {exp.empresa} | {exp.fechaInicio} - {exp.fechaFin}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {exp.descripcion?.substring(0, 150)}...
                  </Typography>
                  {index < cvData.experiencias.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Box>
          )}

          {/* Habilidades */}
          {cvData.habilidades && cvData.habilidades.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase', mb: 1 }}>
                Competencias Técnicas
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">
                {cvData.habilidades.slice(0, 6).map(skill => skill.nombre).join(' • ')}
              </Typography>
            </Box>
          )}

          {/* Idiomas */}
          {cvData.idiomas && cvData.idiomas.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase', mb: 1 }}>
                Idiomas
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {cvData.idiomas.map((idioma, index) => (
                <Typography key={index} variant="body2">
                  <strong>{idioma.idioma}:</strong> {idioma.nivel}
                </Typography>
              ))}
            </Box>
          )}
        </Paper>
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Box sx={{
        width: '90%',
        maxWidth: 1000,
        maxHeight: '90vh',
        overflow: 'auto',
        backgroundColor: 'white',
        borderRadius: 2,
        position: 'relative'
      }}>
        {/* Header del Modal */}
        <Box sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Vista Previa del CV
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Selector de plantilla */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Selecciona la plantilla:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={selectedTemplate === 'moderna' ? 'contained' : 'outlined'}
              onClick={() => handleTemplateChange('moderna')}
              startIcon={<Visibility />}
            >
              🎨 Moderna
            </Button>
            <Button
              variant={selectedTemplate === 'clasica' ? 'contained' : 'outlined'}
              onClick={() => handleTemplateChange('clasica')}
              startIcon={<Visibility />}
            >
              📄 Clásica
            </Button>
          </Box>
        </Box>

        {/* Contenido de la vista previa */}
        <Box sx={{ p: 2 }}>
          <PreviewContent template={selectedTemplate} />
        </Box>

        {/* Footer con botones */}
        <Box sx={{
          p: 2,
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            Esta es una vista previa. El PDF final puede tener diferencias menores de formato.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              startIcon={isGenerating ? <CircularProgress size={16} /> : <Download />}
              onClick={handleGenerateAndDownload}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generando...' : 'Generar y Descargar PDF'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default CVPreview;
