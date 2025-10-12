import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Slider,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  CenterFocusStrong,
  Check,
  Close,
  Refresh
} from '@mui/icons-material';

const ImagePreview = ({ 
  file, 
  onImageProcessed, 
  onCancel,
  maxWidth = 800,
  maxHeight = 800,
  targetSize = 400
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0, size: 0 });

  // Cargar y procesar la imagen inicial
  useEffect(() => {
    if (file) {
      loadImage();
    }
  }, [file]);

  const loadImage = useCallback(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setImageInfo({
          width: img.width,
          height: img.height,
          size: file.size
        });
        
        // Ajustar escala inicial para que la imagen quepa en el contenedor
        const scaleX = maxWidth / img.width;
        const scaleY = maxHeight / img.height;
        const initialScale = Math.min(scaleX, scaleY, 1);
        setScale(initialScale);
        
        // Centrar la imagen
        setPosition({
          x: (maxWidth - img.width * initialScale) / 2,
          y: (maxHeight - img.height * initialScale) / 2
        });
        
        processImage(img, initialScale, 0, {
          x: (maxWidth - img.width * initialScale) / 2,
          y: (maxHeight - img.height * initialScale) / 2
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [file, maxWidth, maxHeight]);

  const processImage = useCallback((img, scaleValue, rotationValue, positionValue) => {
    if (!img) return;

    setIsProcessing(true);
    
    // Crear canvas temporal para procesamiento
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Calcular dimensiones después de rotación y escala
    const rad = (rotationValue * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    
    const newWidth = img.width * cos + img.height * sin;
    const newHeight = img.width * sin + img.height * cos;
    
    tempCanvas.width = newWidth * scaleValue;
    tempCanvas.height = newHeight * scaleValue;
    
    // Configurar contexto para alta calidad
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    
    // Aplicar transformaciones
    tempCtx.save();
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((rotationValue * Math.PI) / 180);
    tempCtx.scale(scaleValue, scaleValue);
    tempCtx.drawImage(img, -img.width / 2, -img.height / 2);
    tempCtx.restore();
    
    // Crear URL de la imagen procesada
    const processedUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
    setProcessedImageUrl(processedUrl);
    setIsProcessing(false);
  }, []);

  const handleScaleChange = useCallback((event, newValue) => {
    setScale(newValue);
    if (originalImage) {
      processImage(originalImage, newValue, rotation, position);
    }
  }, [originalImage, rotation, position, processImage]);

  const handleRotationChange = useCallback((direction) => {
    const newRotation = direction === 'left' ? rotation - 90 : rotation + 90;
    setRotation(newRotation);
    if (originalImage) {
      processImage(originalImage, scale, newRotation, position);
    }
  }, [originalImage, scale, rotation, position, processImage]);

  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    if (originalImage) {
      processImage(originalImage, 1, 0, { x: 0, y: 0 });
    }
  }, [originalImage, processImage]);

  const handleAutoFit = useCallback(() => {
    if (!originalImage) return;
    
    const scaleX = maxWidth / originalImage.width;
    const scaleY = maxHeight / originalImage.height;
    const autoScale = Math.min(scaleX, scaleY, 1);
    
    setScale(autoScale);
    setPosition({
      x: (maxWidth - originalImage.width * autoScale) / 2,
      y: (maxHeight - originalImage.height * autoScale) / 2
    });
    
    processImage(originalImage, autoScale, rotation, {
      x: (maxWidth - originalImage.width * autoScale) / 2,
      y: (maxHeight - originalImage.height * autoScale) / 2
    });
  }, [originalImage, maxWidth, maxHeight, rotation, processImage]);

  const handleConfirm = useCallback(() => {
    if (!processedImageUrl) return;
    
    // Convertir URL de datos a Blob
    fetch(processedImageUrl)
      .then(res => res.blob())
      .then(blob => {
        const processedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        onImageProcessed(processedFile);
      });
  }, [processedImageUrl, file.name, onImageProcessed]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!originalImage) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
        📸 Editor de Imagen de Perfil
      </Typography>
      
      {/* Información de la imagen */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Chip 
          label={`${imageInfo.width} × ${imageInfo.height}px`} 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          label={formatFileSize(imageInfo.size)} 
          color="secondary" 
          variant="outlined" 
        />
        <Chip 
          label={`Redimensionado a: ${targetSize}×${targetSize}px`} 
          color="success" 
          variant="outlined" 
        />
      </Box>

      {/* Controles */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <IconButton onClick={() => handleRotationChange('left')} color="primary">
            <RotateLeft />
          </IconButton>
          <IconButton onClick={() => handleRotationChange('right')} color="primary">
            <RotateRight />
          </IconButton>
          <IconButton onClick={handleReset} color="secondary">
            <Refresh />
          </IconButton>
          <IconButton onClick={handleAutoFit} color="info">
            <CenterFocusStrong />
          </IconButton>
        </Box>

        <Box sx={{ px: 2 }}>
          <Typography gutterBottom>
            Zoom: {Math.round(scale * 100)}%
          </Typography>
          <Slider
            value={scale}
            onChange={handleScaleChange}
            min={0.1}
            max={3}
            step={0.1}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            marks={[
              { value: 0.5, label: '50%' },
              { value: 1, label: '100%' },
              { value: 2, label: '200%' }
            ]}
          />
        </Box>
      </Box>

      {/* Vista previa */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Vista Previa:
        </Typography>
        <Box sx={{ 
          display: 'inline-block', 
          position: 'relative',
          border: '2px dashed #ccc',
          borderRadius: '50%',
          p: 1,
          backgroundColor: '#f8f9fa'
        }}>
          {processedImageUrl && (
            <Box
              component="img"
              src={processedImageUrl}
              alt="Vista previa"
              sx={{
                width: 200,
                height: 200,
                objectFit: 'cover',
                borderRadius: '50%',
                border: '3px solid #fff',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
          )}
          {isProcessing && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '50%',
              p: 2
            }}>
              <CircularProgress size={40} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Información de optimización */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Optimización automática:</strong> La imagen se redimensionará automáticamente a {targetSize}×{targetSize}px 
          con formato circular para el CV. Se mantendrá la mejor calidad posible.
        </Typography>
      </Alert>

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Close />}
          onClick={onCancel}
          color="error"
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<Check />}
          onClick={handleConfirm}
          disabled={isProcessing}
          color="success"
          sx={{ minWidth: 120 }}
        >
          {isProcessing ? 'Procesando...' : 'Confirmar'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ImagePreview;
