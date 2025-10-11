import React, { useState } from 'react';
import { Box, Typography, Button, Divider, CircularProgress } from '@mui/material';
import { Description, Download } from '@mui/icons-material';
import { PersonalDataForm } from './PersonalDataForm';
import { ProfessionalDataForm } from './ProfessionalDataForm';
import { LocationForm } from './LocationForm';
import { ExperienceForm } from './ExperienceForm';
import { EducationForm } from './EducationForm';
import { SkillsForm } from './SkillsForm';
import { LanguagesForm } from './LanguagesForm';
import { CertificationsForm } from './CertificationsForm';
import { ProjectsForm } from './ProjectsForm';
import { ReferencesForm } from './ReferencesForm';
import { TemplateSelector } from './TemplateSelector';
import { generateModernCVWord } from '../templates/ModernTemplateWord';

export const CVGeneratorTab = ({
  newCv,
  handleChange,
  selectedTemplate,
  onTemplateChange,
  onImageChange,
  loadingImage,
  currentCv,
  isLoading,
  onPreview,
  onSubmit
}) => {
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);

  const handleDownloadWord = async () => {
    try {
      setIsGeneratingWord(true);
      const success = await generateModernCVWord(newCv);
      if (!success) {
        alert('Error al generar el documento Word');
      }
    } catch (error) {
      console.error('Error al generar Word:', error);
      alert(`Error al generar el documento Word: ${error.message}`);
    } finally {
      setIsGeneratingWord(false);
    }
  };
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', textAlign: 'center', mr: 2 }}>
          Crea tu CV profesional paso a paso
        </Typography>
        {!currentCv && (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={onSubmit}
            sx={{ 
              fontSize: '12px',
              fontWeight: 'bold',
              px: 2,
              py: 0.5
            }}
          >
            🧪 Datos de prueba
          </Button>
        )}
      </Box>
      
      <PersonalDataForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #66bb6a, transparent)', borderRadius: '1px' }} />
      
      <ProfessionalDataForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #4caf50, transparent)', borderRadius: '1px' }} />
      
      <LocationForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #03a9f4, transparent)', borderRadius: '1px' }} />
      
      <ExperienceForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #66bb6a, transparent)', borderRadius: '1px' }} />
      
      <EducationForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #2196f3, transparent)', borderRadius: '1px' }} />
      
      <SkillsForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #9c27b0, transparent)', borderRadius: '1px' }} />
      
      <LanguagesForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #e91e63, transparent)', borderRadius: '1px' }} />
      
      <CertificationsForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #ffc107, transparent)', borderRadius: '1px' }} />
      
      <ProjectsForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #3f51b5, transparent)', borderRadius: '1px' }} />
      
      <ReferencesForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #689f38, transparent)', borderRadius: '1px' }} />
      
      <TemplateSelector 
        selectedTemplate={selectedTemplate} 
        onTemplateChange={onTemplateChange} 
      />
      <Divider sx={{ my: 3 }} />
      
      {/* Solo foto de perfil para el generador */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          📸 Foto de Perfil (Opcional)
        </Typography>
        <Box sx={{ 
          border: '2px dashed #ccc', 
          borderRadius: 2, 
          p: 3, 
          textAlign: 'center',
          backgroundColor: '#f9f9f9'
        }}>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            style={{ display: 'none' }}
            id="photo-input"
          />
          <label htmlFor="photo-input">
            <Button
              variant="outlined"
              component="span"
              sx={{ cursor: 'pointer' }}
            >
              Seleccionar Foto
            </Button>
          </label>
          {loadingImage && <Typography sx={{ mt: 1 }}>Cargando...</Typography>}
        </Box>
      </Box>
      
      {!isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="large"
            onClick={onPreview}
            sx={{ px: 4, py: 1.5 }}
          >
            Vista Previa
          </Button>
          
          <Button 
            variant="outlined"
            color="secondary"
            size="large"
            onClick={handleDownloadWord}
            disabled={isGeneratingWord}
            startIcon={isGeneratingWord ? <CircularProgress size={16} /> : <Description />}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderColor: '#3b82f6',
              color: '#3b82f6',
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: '#eff6ff'
              }
            }}
          >
            {isGeneratingWord ? 'Generando...' : 'Descargar Word'}
          </Button>
          
          <Button 
            variant="contained" 
            type="submit" 
            size="large"
            startIcon={<Download />}
            sx={{ 
              px: 6, 
              py: 1.5,
              backgroundColor: '#1e3a8a',
              '&:hover': {
                backgroundColor: '#1e40af'
              }
            }}
          >
            Generar CV Profesional
          </Button>
        </Box>
      )}
    </>
  );
};
