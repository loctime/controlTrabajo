import React, { useRef, memo, useCallback, useState } from 'react';
import { Grid, TextField, Box, Typography, Paper, Button, IconButton, Modal } from '@mui/material';
import { CameraAlt, Upload, Visibility } from '@mui/icons-material';
import { RingLoader as Spinner } from 'react-spinners';
import ImagePreview from './ImagePreview';

export const FilesForm = memo(({ 
  onImageChange, 
  onCvChange, 
  loadingImage, 
  loadingCv,
  showPreview,
  selectedFile,
  onImageProcessed,
  onCancelPreview
}) => {
  const photoInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const handleCameraClick = useCallback(() => {
    photoInputRef.current?.click();
  }, []);

  const handleUploadClick = useCallback(() => {
    uploadInputRef.current?.click();
  }, []);

  const handleImageFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFile(file);
      setShowImagePreview(true);
    }
  }, []);

  const handleImageProcessed = useCallback((processedFile) => {
    setShowImagePreview(false);
    setPreviewFile(null);
    if (onImageProcessed) {
      onImageProcessed(processedFile);
    }
  }, [onImageProcessed]);

  const handleCancelPreview = useCallback(() => {
    setShowImagePreview(false);
    setPreviewFile(null);
    if (onCancelPreview) {
      onCancelPreview();
    }
  }, [onCancelPreview]);
  
  return (
    <>
     
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
              📸 Foto de Perfil
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              (Opcional - Puedes tomar una foto o subir una imagen)
            </Typography>
            <Typography variant="caption" sx={{ mb: 2, color: 'warning.main', display: 'block', fontWeight: 500 }}>
              ⚠️ Máximo 5MB • Recomendado: 400x400px a 1920x1920px
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {/* Inputs ocultos */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleImageFileSelect}
                style={{ display: 'none' }}
              />
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileSelect}
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
                <Button
                  variant="text"
                  startIcon={<Visibility />}
                  onClick={() => setShowImagePreview(true)}
                  disabled={!previewFile}
                  sx={{ minWidth: 140 }}
                >
                  Vista Previa
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
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              (Obligatorio - Formato PDF, DOC o DOCX)
            </Typography>
            <Typography variant="caption" sx={{ mb: 2, color: 'warning.main', display: 'block', fontWeight: 500 }}>
              ⚠️ Máximo 10MB • Solo PDF, DOC, DOCX
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

      {/* Modal de Vista Previa de Imagen */}
      <Modal
        open={showImagePreview}
        onClose={handleCancelPreview}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box sx={{
          width: '90%',
          maxWidth: 900,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {previewFile && (
            <ImagePreview
              file={previewFile}
              onImageProcessed={handleImageProcessed}
              onCancel={handleCancelPreview}
              maxWidth={800}
              maxHeight={800}
              targetSize={400}
            />
          )}
        </Box>
      </Modal>
    </>
  );
});

FilesForm.displayName = 'FilesForm';
