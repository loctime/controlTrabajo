import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function PWADebug() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();
  const [swRegistered, setSwRegistered] = useState(false);
  const [swStatus, setSwStatus] = useState('checking...');
  const [manifestStatus, setManifestStatus] = useState('checking...');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Verificar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          setSwRegistered(true);
          setSwStatus(`Registrado en: ${registration.scope}`);
          addLog('✅ Service Worker encontrado');
          addLog(`  Estado: ${registration.active ? 'Activo' : 'Inactivo'}`);
        } else {
          setSwStatus('No registrado');
          addLog('❌ Service Worker NO registrado');
        }
      });
    } else {
      setSwStatus('No soportado en este navegador');
      addLog('❌ Service Worker no soportado');
    }

    // Verificar manifest
    fetch('/manifest.json')
      .then(res => res.json())
      .then(data => {
        setManifestStatus(`OK: ${data.name}`);
        addLog('✅ Manifest.json cargado');
        addLog(`  Iconos: ${data.icons?.length || 0} encontrados`);
        data.icons?.forEach(icon => {
          addLog(`    - ${icon.sizes} (${icon.type})`);
        });
      })
      .catch(err => {
        setManifestStatus('Error al cargar');
        addLog('❌ Error al cargar manifest: ' + err.message);
      });

    // Listener para detectar SI Chrome dispara el evento
    const beforeInstallHandler = () => {
      addLog('🎉 ¡EVENTO beforeinstallprompt DETECTADO!');
    };
    window.addEventListener('beforeinstallprompt', beforeInstallHandler);

    // Esperar 5 segundos y verificar
    setTimeout(() => {
      addLog('⏰ 5 segundos pasados...');
      addLog('   ¿Chrome disparó el evento? Revisando...');
    }, 5000);

    // Esperar 10 segundos más
    setTimeout(() => {
      addLog('⏰ 10 segundos pasados...');
      addLog('   Si aún no ves "Instalable: SÍ", intenta:');
      addLog('   1. Cerrar la app instalada (si existe)');
      addLog('   2. Abrir en modo incógnito');
      addLog('   3. chrome://apps y desinstalar si está');
    }, 10000);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleTestInstall = async () => {
    addLog('🔵 Intentando instalar...');
    const result = await installPWA();
    if (result) {
      addLog('✅ Instalación exitosa!');
    } else {
      addLog('❌ Instalación cancelada o falló');
    }
  };

  return (
    <Card sx={{ maxWidth: 800, margin: '20px auto', backgroundColor: '#f5f5f5' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          🔍 PWA Debug Panel
        </Typography>

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Estados:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              icon={swRegistered ? <CheckCircleIcon /> : <ErrorIcon />}
              label={`Service Worker: ${swRegistered ? 'OK' : 'NO'}`}
              color={swRegistered ? 'success' : 'error'}
              size="small"
            />
            
            <Chip
              icon={isInstallable ? <CheckCircleIcon /> : <WarningIcon />}
              label={`Instalable: ${isInstallable ? 'SÍ' : 'NO'}`}
              color={isInstallable ? 'success' : 'warning'}
              size="small"
            />
            
            <Chip
              icon={isInstalled ? <CheckCircleIcon /> : <WarningIcon />}
              label={`Instalado: ${isInstalled ? 'SÍ' : 'NO'}`}
              color={isInstalled ? 'info' : 'default'}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            <strong>Service Worker:</strong> {swStatus}
          </Typography>
          
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <strong>Manifest:</strong> {manifestStatus}
          </Typography>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            <strong>Navegador:</strong> {navigator.userAgent.includes('Chrome') ? 'Chrome ✅' : navigator.userAgent.includes('Safari') ? 'Safari ⚠️' : 'Otro'}
          </Typography>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            <strong>HTTPS:</strong> {window.location.protocol === 'https:' ? 'Sí ✅' : window.location.hostname === 'localhost' ? 'Localhost ✅' : 'No ❌'}
          </Typography>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Acciones:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Recargar Página
            </Button>
            
            {isInstallable && !isInstalled && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleTestInstall}
              >
                🔥 INSTALAR AHORA
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ my: 2, p: 2, backgroundColor: 'white', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Logs:
          </Typography>
          {logs.map((log, index) => (
            <Typography key={index} variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
              {log}
            </Typography>
          ))}
        </Box>

        <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3cd', borderRadius: 1, border: '1px solid #ffc107' }}>
          <Typography variant="body2">
            <strong>💡 Nota:</strong> El botón "Instalar App" en el Navbar solo aparece cuando:
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><Typography variant="body2">✅ Service Worker está registrado</Typography></li>
            <li><Typography variant="body2">✅ La app NO está instalada aún</Typography></li>
            <li><Typography variant="body2">✅ Chrome detecta que es una PWA válida (puede tardar unos segundos)</Typography></li>
          </ul>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: '#d32f2f' }}>
            <strong>🔥 Si dice "Instalable: NO":</strong>
          </Typography>
          <ol style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '0.875rem' }}>
            <li>Abre <code>chrome://apps</code> y desinstala la app si está</li>
            <li>Abre Chrome DevTools (F12) → Application → Storage → "Clear site data"</li>
            <li>Cierra TODAS las pestañas de localhost:5173</li>
            <li>Abre en MODO INCÓGNITO (Ctrl+Shift+N)</li>
            <li>Visita <code>localhost:5173</code> de nuevo</li>
            <li>Espera 10 segundos y recarga</li>
          </ol>
        </Box>
      </CardContent>
    </Card>
  );
}

