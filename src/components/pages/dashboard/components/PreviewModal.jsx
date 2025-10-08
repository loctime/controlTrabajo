import React from 'react';
import { Modal, Box, Typography, IconButton, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const PreviewModal = ({ 
  open, 
  onClose, 
  url, 
  fileName, 
  loading 
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="preview-modal-title"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '90%' },
          height: { xs: '95%', sm: '90%' },
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" id="preview-modal-title" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Vista Previa: {fileName}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {loading ? (
            <CircularProgress size={60} />
          ) : url ? (
            <iframe
              src={url}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title={`Vista previa de ${fileName}`}
            />
          ) : (
            <Typography>No se pudo cargar la vista previa</Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button onClick={onClose} variant="outlined" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Cerrar
          </Button>
          {url && (
            <Button
              variant="contained"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
              onClick={handleDownload}
            >
              Descargar
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};


