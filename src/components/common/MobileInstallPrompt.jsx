import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

/**
 * Banner que aparece en el footer solo en móviles
 * para indicar cómo instalar la PWA
 */
export default function MobileInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Verificar si NO está instalada (no está en modo standalone)
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    
    // Verificar si el usuario ya lo cerró antes (localStorage)
    const wasDismissed = localStorage.getItem('pwa-install-prompt-dismissed') === 'true';
    
    // Mostrar solo si: es móvil, NO está instalada, y NO fue cerrado antes
    if (isMobile && !isInstalled && !wasDismissed) {
      // Esperar 3 segundos antes de mostrar para no ser intrusivo
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowPrompt(false);
    // Guardar en localStorage para no mostrar de nuevo
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  if (isDismissed || !showPrompt) {
    return null;
  }

  // Detectar si es Android o iOS para instrucciones específicas
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <Collapse in={showPrompt}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#66bb6a',
          color: 'white',
          padding: '12px 16px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* Icono */}
        <DownloadIcon sx={{ fontSize: 24, flexShrink: 0 }} />
        
        {/* Texto */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>
            📱 Instala la app
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
            {isAndroid && "Menú ⋮ → Agregar a pantalla de inicio"}
            {isIOS && "Compartir 🔗 → Agregar a pantalla de inicio"}
            {!isAndroid && !isIOS && "Agregar a pantalla de inicio desde tu navegador"}
          </Typography>
        </Box>
        
        {/* Botón cerrar */}
        <IconButton
          size="small"
          onClick={handleDismiss}
          sx={{
            color: 'white',
            flexShrink: 0,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Collapse>
  );
}

