import React, { useEffect, useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import placa1 from '../../assets/placa1.jpeg';
import placa2 from '../../assets/placa2.jpeg';

const Home = () => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Modal de Aviso */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 4
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 1
        }}>
          <InfoIcon color="primary" />
          <Typography variant="h6" component="div">
            Aviso importante
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey[500]',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            La Coalición Cívica ofrece esta herramienta de búsqueda laboral como un servicio gratuito y comunitario. No asume ninguna responsabilidad sobre el proceso de contratación, ni mantiene ningún tipo de relación laboral con las partes involucradas (contratante y contratado).
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleClose} 
            variant="contained"
            color="primary"
            fullWidth
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contenido principal */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%',
        backgroundColor: 'background.default'
      }}>
        <Box
          component="img"
          src={placa2}
          alt="placa2"
          className="fade-in"
          sx={{ 
            width: '100%', 
            maxWidth: 1800, 
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
            borderRadius: 2,
            boxShadow: 2
          }}
        />
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src={placa1}
            alt="placa1"
            className="fade-in"
            sx={{ 
              width: '100%', 
            maxWidth: 1800, 
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              borderRadius: 2,
              boxShadow: 2,
              mt: 2
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default Home;
