import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { showAlert } from '../../utils/swalConfig';

/**
 * Botón de instalación PWA con FALLBACK manual
 * Si Chrome no dispara beforeinstallprompt, muestra instrucciones
 */
export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showManualButton, setShowManualButton] = useState(false);

  useEffect(() => {
    // Capturar el evento
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('✅ Prompt capturado - botón automático habilitado');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Si después de 15 segundos no hay prompt, mostrar botón manual
    const timer = setTimeout(() => {
      if (!deferredPrompt) {
        setShowManualButton(true);
        console.log('⚠️ Chrome no disparó el evento - mostrando opción manual');
      }
    }, 15000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  // Instalación automática (cuando Chrome coopera)
  const handleAutoInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        showAlert.success('¡Instalado!', 'La app se ha instalado correctamente');
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Instalación manual (cuando Chrome no coopera)
  const handleManualInstall = () => {
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let message = '';
    
    if (isChrome && !isAndroid) {
      // Chrome Desktop
      message = `
        <div style="text-align: left;">
          <p><strong>Para instalar en Chrome Desktop:</strong></p>
          <ol>
            <li>Busca el icono <strong>⊕</strong> o <strong>🖥️</strong> en la barra de direcciones (esquina derecha)</li>
            <li>Click en el icono</li>
            <li>Selecciona "Instalar"</li>
          </ol>
          <p style="margin-top: 16px;"><strong>Alternativa:</strong></p>
          <ul>
            <li>Click en el menú ⋮ de Chrome</li>
            <li>Busca "Instalar Bolsa de Trabajo CCF..."</li>
            <li>Click en esa opción</li>
          </ul>
          <p style="margin-top: 16px; padding: 12px; background: #e3f2fd; border-radius: 4px; font-size: 14px;">
            💡 <strong>Nota:</strong> Si no ves estas opciones, la app podría estar instalada ya. 
            Verifica en <code>chrome://apps</code>
          </p>
        </div>
      `;
    } else if (isAndroid) {
      // Chrome Android
      message = `
        <div style="text-align: left;">
          <p><strong>Para instalar en Android:</strong></p>
          <ol>
            <li>Toca el menú ⋮ en Chrome</li>
            <li>Selecciona "Agregar a pantalla de inicio"</li>
            <li>Toca "Agregar"</li>
          </ol>
        </div>
      `;
    } else {
      // Otros navegadores
      message = `
        <div style="text-align: left;">
          <p>Para instalar esta app:</p>
          <ol>
            <li>Abre el menú de tu navegador</li>
            <li>Busca la opción "Instalar app" o "Agregar a pantalla de inicio"</li>
          </ol>
          <p style="margin-top: 12px; color: #666;">
            <strong>Nota:</strong> Esta función funciona mejor en Chrome.
          </p>
        </div>
      `;
    }

    showAlert.info('Instrucciones de Instalación', message);
  };

  // Si tenemos el prompt automático
  if (deferredPrompt) {
    return (
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={handleAutoInstall}
        sx={{ 
          textTransform: "none",
          borderColor: "rgba(255, 255, 255, 0.7)",
          "&:hover": {
            borderColor: "white",
            backgroundColor: "rgba(255, 255, 255, 0.1)"
          }
        }}
      >
        Instalar App
      </Button>
    );
  }

  // Si Chrome no cooperó, mostrar botón manual
  if (showManualButton) {
    return (
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={handleManualInstall}
        sx={{ 
          textTransform: "none",
          borderColor: "rgba(255, 255, 255, 0.7)",
          "&:hover": {
            borderColor: "white",
            backgroundColor: "rgba(255, 255, 255, 0.1)"
          }
        }}
      >
        Cómo Instalar
      </Button>
    );
  }

  // Mientras esperamos...
  return null;
}

