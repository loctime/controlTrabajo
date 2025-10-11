import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close, Download, Visibility, Refresh } from '@mui/icons-material';
import { pdfGeneratorService } from '../services/pdfGeneratorService';

const CVPreview = ({ 
  open, 
  onClose, 
  cvData, 
  selectedTemplate, 
  onTemplateChange 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Generar vista previa del PDF cuando se abre el modal o cambia la plantilla
  useEffect(() => {
    if (open) {
      generatePreview();
    } else {
      // Limpiar URL cuando se cierra el modal
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    }
  }, [open, selectedTemplate]);

  const generatePreview = async () => {
    try {
      setIsLoadingPreview(true);
      
      // Validar datos antes de generar
      const validation = pdfGeneratorService.validateCVData(cvData);
      if (!validation.isValid) {
        console.warn('Datos incompletos para vista previa:', validation.errors);
        // No bloqueamos la vista previa, solo mostramos lo que hay
      }

      // Generar PDF en memoria (sin descargar)
      const pdfBlob = await pdfGeneratorService.generatePDF(cvData, selectedTemplate);
      
      // Crear URL temporal para el blob
      const url = URL.createObjectURL(pdfBlob);
      
      // Limpiar URL anterior si existe
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      setPdfUrl(url);
      
    } catch (error) {
      console.error('Error al generar vista previa:', error);
      alert(`Error al generar vista previa: ${error.message}`);
    } finally {
      setIsLoadingPreview(false);
    }
  };

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
    // La vista previa se regenerará automáticamente por el useEffect
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
        <Box sx={{ p: 2, minHeight: 600 }}>
          {isLoadingPreview ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 600,
              gap: 2
            }}>
              <CircularProgress size={60} />
              <Typography variant="h6" color="text.secondary">
                Generando vista previa del PDF...
              </Typography>
            </Box>
          ) : pdfUrl ? (
            <Box sx={{ width: '100%', height: 600, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <iframe
                src={pdfUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '4px'
                }}
                title="Vista previa del CV"
              />
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 600,
              gap: 2
            }}>
              <Typography variant="h6" color="text.secondary">
                No se pudo generar la vista previa
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={generatePreview}
              >
                Reintentar
              </Button>
            </Box>
          )}
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
