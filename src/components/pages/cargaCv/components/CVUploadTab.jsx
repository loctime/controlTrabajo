import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { PersonalDataForm } from './PersonalDataForm';
import { ProfessionalDataForm } from './ProfessionalDataForm';
import { LocationForm } from './LocationForm';
import { FilesForm } from './FilesForm';

export const CVUploadTab = ({
  newCv,
  handleChange,
  onImageChange,
  onCvChange,
  loadingImage,
  loadingCv,
  isImageLoaded,
  isCvLoaded,
  isLoading
}) => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', textAlign: 'center' }}>
        Sube tu CV en formato PDF
      </Typography>
      
      <PersonalDataForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #ff9800, transparent)', borderRadius: '1px' }} />
      
      <ProfessionalDataForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #4caf50, transparent)', borderRadius: '1px' }} />
      
      <LocationForm newCv={newCv} handleChange={handleChange} />
      <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #03a9f4, transparent)', borderRadius: '1px' }} />
      
      <FilesForm
        onImageChange={onImageChange}
        onCvChange={onCvChange}
        loadingImage={loadingImage}
        loadingCv={loadingCv}
      />
      
      {!isLoading && isImageLoaded && isCvLoaded && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            type="submit" 
            size="large"
            sx={{ px: 6, py: 1.5 }}
          >
            Finalizar Carga
          </Button>
        </Box>
      )}
    </>
  );
};
