import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { showAlert } from '../../../utils/swalConfig';
import placa1 from '../../assets/placa1.jpeg';
import placa2 from '../../assets/placa2.jpeg';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    showAlert.info(
      'Aviso importante',
      'La Coalición Cívica ofrece esta herramienta de búsqueda laboral como un servicio gratuito y comunitario. No asume ninguna responsabilidad sobre el proceso de contratación, ni mantiene ningún tipo de relación laboral con las partes involucradas (contratante y contratado).'
    );
  }, []);

  return (
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
  );
};

export default Home;
