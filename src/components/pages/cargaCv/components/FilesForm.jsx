import React, { useRef, memo, useCallback } from 'react';
import { Grid, TextField, Box, Typography, Paper, Button, IconButton } from '@mui/material';
import { CameraAlt, Upload } from '@mui/icons-material';
import { RingLoader as Spinner } from 'react-spinners';

export const FilesForm = memo(({ 
  onImageChange, 
  onCvChange, 
  loadingImage, 
  loadingCv 
}) => {
  const photoInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const handleCameraClick = useCallback(() => {
    photoInputRef.current?.click();
  }, []);

  const handleUploadClick = useCallback(() => {
    uploadInputRef.current?.click();
  }, []);
  
  return (
    <>
     
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
              📸 Foto de Perfil
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              (Opcional - Puedes tomar una foto o subir una imagen)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {/* Inputs ocultos */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={onImageChange}
                style={{ display: 'none' }}
              />
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                onChange={onImageChange}
                style={{ display: 'none' }}
              />
              
              {/* Botones visibles */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={handleCameraClick}
                  sx={{ minWidth: 140 }}
                >
                  Tomar Foto
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  onClick={handleUploadClick}
                  sx={{ minWidth: 140 }}
                >
                  Subir Imagen
                </Button>
              </Box>
              
              {loadingImage && <Spinner color="#36D7B7" size={40} />}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
              📄 Curriculum Vitae
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              (Obligatorio - Formato PDF, DOC o DOCX)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <TextField 
                type="file" 
                onChange={onCvChange} 
                required 
                fullWidth 
                inputProps={{ accept: ".pdf,.doc,.docx" }}
              />
              {loadingCv && <Spinner color="#36D7B7" size={40} />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
});

FilesForm.displayName = 'FilesForm';
