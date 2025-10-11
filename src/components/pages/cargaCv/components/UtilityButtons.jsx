import React from 'react';
import { Box, Button } from '@mui/material';

export const UtilityButtons = ({
  currentCv,
  onFillTestData,
  onFillExtensiveData,
  onClearForm
}) => {
  if (currentCv) return null;

  return (
    <Box sx={{ display: 'flex', gap: 2, ml: 2 }}>
      <Button
        variant="outlined"
        color="secondary"
        onClick={onFillTestData}
        sx={{ 
          minWidth: 200,
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        🧪 Llenar con datos de prueba
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={onFillExtensiveData}
        sx={{ 
          minWidth: 280,
          fontSize: '13px',
          fontWeight: 'bold'
        }}
      >
        📋 CV Extenso (6 exp + 40 skills + 8 certs)
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={onClearForm}
        sx={{ 
          minWidth: 120,
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        🗑️ Limpiar
      </Button>
    </Box>
  );
};
