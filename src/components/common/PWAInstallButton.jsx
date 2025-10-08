import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { showAlert } from '../../utils/swalConfig';

/**
 * Botón simple que muestra instrucciones para instalar la PWA manualmente
 */
export default function PWAInstallButton() {
  
  const handleShowInstructions = () => {
    const isAndroid = /Android/.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    let message = '';
    
    if (isAndroid) {
      // Android
      message = `
        <div style="text-align: left; font-size: 15px; line-height: 1.6;">
          <p style="margin-bottom: 16px;">Para instalar esta app en tu dispositivo:</p>
          <ol style="margin: 0; padding-left: 24px;">
            <li style="margin-bottom: 8px;">Toca el menú <strong style="font-size: 18px;">⋮</strong> en la esquina superior derecha</li>
            <li style="margin-bottom: 8px;">Selecciona <strong>"Agregar a pantalla de inicio"</strong> o <strong>"Instalar app"</strong></li>
            <li style="margin-bottom: 8px;">Toca <strong>"Agregar"</strong> o <strong>"Instalar"</strong></li>
          </ol>
          <p style="margin-top: 16px; padding: 12px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #66bb6a;">
            <strong>✨ Beneficio:</strong> Acceso rápido desde tu pantalla de inicio
          </p>
        </div>
      `;
    } else if (isIOS) {
      // iOS Safari
      message = `
        <div style="text-align: left; font-size: 15px; line-height: 1.6;">
          <p style="margin-bottom: 16px;">Para instalar esta app en iOS:</p>
          <ol style="margin: 0; padding-left: 24px;">
            <li style="margin-bottom: 8px;">Toca el botón <strong style="font-size: 18px;">🔗</strong> de compartir (abajo en el centro)</li>
            <li style="margin-bottom: 8px;">Desplázate y selecciona <strong>"Agregar a pantalla de inicio"</strong></li>
            <li style="margin-bottom: 8px;">Toca <strong>"Agregar"</strong></li>
          </ol>
          <p style="margin-top: 16px; padding: 12px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
            <strong>📱 Nota:</strong> Solo funciona en Safari, no en Chrome iOS
          </p>
        </div>
      `;
    } else {
      // Desktop (Chrome, Edge, etc.)
      message = `
        <div style="text-align: left; font-size: 15px; line-height: 1.6;">
          <p style="margin-bottom: 16px;">Para instalar esta app en tu computadora:</p>
          
          <p style="margin-bottom: 8px;"><strong>Opción 1:</strong></p>
          <ul style="margin: 0 0 16px 0; padding-left: 24px;">
            <li style="margin-bottom: 8px;">Busca el icono <strong style="font-size: 18px;">⊕</strong> o <strong>🖥️</strong> en la barra de direcciones (esquina derecha)</li>
            <li style="margin-bottom: 8px;">Haz clic en el icono y selecciona <strong>"Instalar"</strong></li>
          </ul>
          
          <p style="margin-bottom: 8px;"><strong>Opción 2:</strong></p>
          <ul style="margin: 0 0 16px 0; padding-left: 24px;">
            <li style="margin-bottom: 8px;">Haz clic en el menú <strong style="font-size: 18px;">⋮</strong> de Chrome (esquina superior derecha)</li>
            <li style="margin-bottom: 8px;">Busca <strong>"Instalar Bolsa de Trabajo CCF..."</strong> o <strong>"Guardar y compartir"</strong></li>
            <li style="margin-bottom: 8px;">Selecciona <strong>"Instalar"</strong></li>
          </ul>
          
          <p style="margin-top: 16px; padding: 12px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #66bb6a;">
            <strong>✨ Beneficio:</strong> La app se abrirá en su propia ventana como una aplicación nativa
          </p>
        </div>
      `;
    }

    showAlert.info('📱 Cómo Instalar la App', message);
  };

  return (
    <Button
      variant="outlined"
      color="inherit"
      size="small"
      startIcon={<DownloadIcon />}
      onClick={handleShowInstructions}
      sx={{ 
        textTransform: "none",
        borderColor: "rgba(255, 255, 255, 0.7)",
        fontSize: { xs: '0.8rem', md: '0.875rem' },
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

