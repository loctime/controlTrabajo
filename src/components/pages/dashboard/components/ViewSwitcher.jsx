import React from 'react';
import { Box, Button } from '@mui/material';

export const ViewSwitcher = ({ 
  currentView, 
  setCurrentView, 
  pendingCount, 
  activeCount, 
  rejectedCount,
  onCacheClick 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      gap: 2 
    }}>
      <Button 
        variant={currentView === 'pending' ? 'contained' : 'outlined'}
        onClick={() => setCurrentView('pending')}
        size="large"
        sx={{ 
          width: { xs: '100%', md: 'auto' },
          fontSize: { xs: '1rem', md: '1rem' }
        }}
      >
        Pendientes ({pendingCount})
      </Button>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        width: { xs: '100%', md: 'auto' }
      }}>
        <Button 
          variant={currentView === 'active' ? 'contained' : 'outlined'}
          onClick={() => setCurrentView('active')}
          size="large"
          sx={{ 
            flex: { xs: 1, md: 'none' },
            fontSize: { xs: '0.875rem', md: '1rem' },
            whiteSpace: 'nowrap'
          }}
        >
          Activos ({activeCount})
        </Button>
        
        <Button 
          variant={currentView === 'rejected' ? 'contained' : 'outlined'}
          onClick={() => setCurrentView('rejected')}
          size="large"
          sx={{ 
            flex: { xs: 1, md: 'none' },
            fontSize: { xs: '0.875rem', md: '1rem' },
            whiteSpace: 'nowrap'
          }}
        >
          Rechazados ({rejectedCount})
        </Button>
      </Box>
      
      <Button 
        variant="contained"
        onClick={onCacheClick}
        size="small"
        color="primary"
        sx={{ 
          alignSelf: 'center',
          minWidth: '45px',
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          padding: 0,
          backgroundColor: '#1976d2',
          color: 'white',
          fontSize: '18px',
          '&:hover': {
            backgroundColor: '#1565c0',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.2s ease'
        }}
      >
        📱
      </Button>
    </Box>
  );
};


